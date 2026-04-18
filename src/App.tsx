import { useState, useCallback, useEffect } from 'react';
import type { GamePhase, GameSettings, Player, PlayerSettlement, Debt, User } from './types';
import { GamePhase as GamePhaseEnum } from './types';
import { Auth } from './components/Auth';
import { Lobby } from './components/Lobby';
import { GameSetup } from './components/GameSetup';
import { GameTable } from './components/GameTable';
import { EndGame } from './components/EndGame';
import { SettlementResults } from './components/SettlementResults';
import { calculatePlayerSettlements, minimizeDebts } from './utils/settlements';
import { getCurrentUser, updateUserCredits, logoutUser } from './utils/auth';
import { saveGameRecord } from './utils/gameHistory';
import { hasReceivedWelcomeGift, markWelcomeGiftReceived } from './utils/credits';
import { ModalManager, showModal } from './components/modals';
import './App.css';

const GAME_SAVE_KEY = 'pocketAce_currentGame';

function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [phase, setPhase] = useState<GamePhase>(GamePhaseEnum.AUTH);
  const [settings, setSettings] = useState<GameSettings>({ nisPerBuyIn: 50, chipsPerBuyIn: 100 });
  const [players, setPlayers] = useState<Player[]>([]);
  const [settlements, setSettlements] = useState<PlayerSettlement[]>([]);
  const [debts, setDebts] = useState<Debt[]>([]);
  const [hostFee, setHostFee] = useState(0);

  const grantWelcomeGift = useCallback((user: User) => {
    if (hasReceivedWelcomeGift(user.id)) return user;
    const welcomeCredits = 50;
    const newCredits = user.credits + welcomeCredits;
    updateUserCredits(user.id, newCredits);
    markWelcomeGiftReceived(user.id);
    showModal({ type: 'welcomeGift', data: { credits: welcomeCredits } });
    return { ...user, credits: newCredits };
  }, []);

  // On mount: restore session and in-progress game
  useEffect(() => {
    const user = getCurrentUser();
    if (!user) return;

    const updatedUser = grantWelcomeGift(user);
    setCurrentUser(updatedUser);

    try {
      const saved = localStorage.getItem(GAME_SAVE_KEY);
      if (saved) {
        const { phase: savedPhase, players: savedPlayers, settings: savedSettings } = JSON.parse(saved);
        if (savedPlayers?.length > 0) {
          setPlayers(savedPlayers);
          setSettings(savedSettings);
          setPhase(savedPhase);
          return;
        }
      }
    } catch { /* fall through to lobby */ }

    setPhase(GamePhaseEnum.LOBBY);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Persist active game state so a refresh can resume
  useEffect(() => {
    if (phase === GamePhaseEnum.TABLE || phase === GamePhaseEnum.END_GAME) {
      localStorage.setItem(GAME_SAVE_KEY, JSON.stringify({ phase, players, settings }));
    } else if ([GamePhaseEnum.LOBBY, GamePhaseEnum.RESULTS, GamePhaseEnum.AUTH].includes(phase as any)) {
      localStorage.removeItem(GAME_SAVE_KEY);
    }
  }, [phase, players, settings]);

  const handleAuthSuccess = useCallback((user: User) => {
    const updatedUser = grantWelcomeGift(user);
    setCurrentUser(updatedUser);
    setPhase(GamePhaseEnum.LOBBY);
  }, [grantWelcomeGift]);

  const handleLogout = useCallback(() => {
    logoutUser();
    localStorage.removeItem(GAME_SAVE_KEY);
    setCurrentUser(null);
    setPhase(GamePhaseEnum.AUTH);
  }, []);

  const handleCreditsUpdate = useCallback((additionalCredits: number) => {
    setCurrentUser(prev => {
      if (!prev) return null;
      const newCredits = prev.credits + additionalCredits;
      updateUserCredits(prev.id, newCredits);
      return { ...prev, credits: newCredits };
    });
  }, []);

  // LOBBY → SETUP: show confirmation modal, credit NOT yet deducted
  const handleStartFromLobby = useCallback(() => {
    if (!currentUser) return;

    if (currentUser.credits <= 0) {
      showModal({
        type: 'gameOver',
        data: {
          onShop: () => showModal({ type: 'store', data: { onPurchase: handleCreditsUpdate } })
        }
      });
      return;
    }

    showModal({
      type: 'creditConfirmation',
      data: {
        creditsRemaining: currentUser.credits,
        onConfirm: () => {
          const hostPlayer: Player = {
            id: `host_${currentUser.id}`,
            name: currentUser.name,
            buyIns: 1,
            totalInvested: settings.nisPerBuyIn,
            finalChips: settings.chipsPerBuyIn,
            isHost: true,
          };
          setPlayers([hostPlayer]);
          setSettlements([]);
          setDebts([]);
          setHostFee(0);
          setPhase(GamePhaseEnum.SETUP);
        }
      }
    });
  }, [currentUser, settings, handleCreditsUpdate]);

  // SETUP → TABLE: deduct credit at the true point of no return
  const handleStartGame = useCallback((newSettings: GameSettings, newPlayers: Player[]) => {
    if (!currentUser) return;

    const newCredits = currentUser.credits - 1;
    updateUserCredits(currentUser.id, newCredits);
    setCurrentUser(prev => prev ? { ...prev, credits: newCredits } : null);

    setSettings(newSettings);
    setPlayers(newPlayers);
    setPhase(GamePhaseEnum.TABLE);
  }, [currentUser]);

  const handleAddBuyIn = useCallback((playerId: string) => {
    setPlayers(prev =>
      prev.map(p =>
        p.id === playerId
          ? { ...p, buyIns: p.buyIns + 1, totalInvested: (p.buyIns + 1) * settings.nisPerBuyIn }
          : p
      )
    );
  }, [settings]);

  const handleEndGame = useCallback(() => setPhase(GamePhaseEnum.END_GAME), []);
  const handleBackFromEndGame = useCallback(() => setPhase(GamePhaseEnum.TABLE), []);

  const handleCalculateSettlements = useCallback((finalChips: Record<string, number>) => {
    const updatedPlayers = players.map(p => ({ ...p, finalChips: finalChips[p.id] || 0 }));
    const { settlements: ps, hostFee: fee } = calculatePlayerSettlements(updatedPlayers, settings);
    const calculatedDebts = minimizeDebts(ps);

    setSettlements(ps);
    setDebts(calculatedDebts);
    setHostFee(fee);

    if (currentUser) {
      const host = updatedPlayers.find(p => p.isHost);
      saveGameRecord(currentUser.id, host?.name || currentUser.name, ps, calculatedDebts);
    }

    setPhase(GamePhaseEnum.RESULTS);
  }, [players, settings, currentUser]);

  const handlePlayAgain = useCallback(() => {
    setPhase(GamePhaseEnum.LOBBY);
    setPlayers([]);
    setSettlements([]);
    setDebts([]);
    setHostFee(0);
  }, []);

  const handleGoHome = useCallback(() => {
    setPhase(GamePhaseEnum.LOBBY);
    setPlayers([]);
    setSettlements([]);
    setDebts([]);
    setHostFee(0);
  }, []);

  // Quit from TABLE: credit already spent, return to lobby
  const handleQuit = useCallback(() => {
    localStorage.removeItem(GAME_SAVE_KEY);
    setPhase(GamePhaseEnum.LOBBY);
    setPlayers([]);
  }, []);

  return (
    <div className="app">
      {phase === GamePhaseEnum.AUTH && (
        <Auth onAuthSuccess={handleAuthSuccess} />
      )}

      {phase === GamePhaseEnum.LOBBY && currentUser && (
        <Lobby
          onStartGame={handleStartFromLobby}
          user={currentUser}
          onLogout={handleLogout}
          onCreditsUpdate={handleCreditsUpdate}
        />
      )}

      {phase === GamePhaseEnum.SETUP && currentUser && (
        <GameSetup onStartGame={handleStartGame} onHome={handleGoHome} existingPlayers={players} />
      )}

      {phase === GamePhaseEnum.TABLE && (
        <GameTable
          players={players}
          settings={settings}
          onAddBuyIn={handleAddBuyIn}
          onEndGame={handleEndGame}
          onQuit={handleQuit}
          onHome={handleGoHome}
        />
      )}

      {phase === GamePhaseEnum.END_GAME && (
        <EndGame
          players={players}
          settings={settings}
          onCalculate={handleCalculateSettlements}
          onBack={handleBackFromEndGame}
          onHome={handleGoHome}
        />
      )}

      {phase === GamePhaseEnum.RESULTS && currentUser && (
        <SettlementResults
          settlements={settlements}
          debts={debts}
          gameSettings={settings}
          hostFee={hostFee}
          onPlayAgain={handlePlayAgain}
          onHome={handleGoHome}
          user={currentUser}
        />
      )}

      <ModalManager />
    </div>
  );
}

export default App;
