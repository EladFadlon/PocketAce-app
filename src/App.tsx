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
import { getCurrentUser, logoutUser } from './utils/auth';
import { saveGameRecord } from './utils/gameHistory';
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
  const [isPremium, setIsPremium] = useState(false);

  useEffect(() => {
    const user = getCurrentUser();
    if (!user) return;
    setCurrentUser(user);

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

  useEffect(() => {
    if (phase === GamePhaseEnum.TABLE || phase === GamePhaseEnum.END_GAME) {
      localStorage.setItem(GAME_SAVE_KEY, JSON.stringify({ phase, players, settings }));
    } else if ([GamePhaseEnum.LOBBY, GamePhaseEnum.RESULTS, GamePhaseEnum.AUTH].includes(phase as any)) {
      localStorage.removeItem(GAME_SAVE_KEY);
    }
  }, [phase, players, settings]);

  const handleAuthSuccess = useCallback((user: User) => {
    setCurrentUser(user);
    setPhase(GamePhaseEnum.LOBBY);
  }, []);

  const handleLogout = useCallback(() => {
    logoutUser();
    localStorage.removeItem(GAME_SAVE_KEY);
    setCurrentUser(null);
    setPhase(GamePhaseEnum.AUTH);
  }, []);

  const handleStartFromLobby = useCallback(() => {
    if (!currentUser) return;
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
  }, [currentUser, settings]);

  const handleStartGame = useCallback((newSettings: GameSettings, newPlayers: Player[]) => {
    setSettings(newSettings);
    setPlayers(newPlayers);
    setPhase(GamePhaseEnum.TABLE);
  }, []);

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

  const resetToLobby = useCallback(() => {
    setPhase(GamePhaseEnum.LOBBY);
    setPlayers([]);
    setSettlements([]);
    setDebts([]);
    setHostFee(0);
  }, []);

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
          isPremium={isPremium}
          onPremiumChange={setIsPremium}
        />
      )}

      {phase === GamePhaseEnum.SETUP && currentUser && (
        <GameSetup onStartGame={handleStartGame} onHome={resetToLobby} existingPlayers={players} />
      )}

      {phase === GamePhaseEnum.TABLE && (
        <GameTable
          players={players}
          settings={settings}
          onAddBuyIn={handleAddBuyIn}
          onEndGame={handleEndGame}
          onQuit={handleQuit}
          onHome={resetToLobby}
        />
      )}

      {phase === GamePhaseEnum.END_GAME && (
        <EndGame
          players={players}
          settings={settings}
          onCalculate={handleCalculateSettlements}
          onBack={handleBackFromEndGame}
          onHome={resetToLobby}
        />
      )}

      {phase === GamePhaseEnum.RESULTS && currentUser && (
        <SettlementResults
          settlements={settlements}
          debts={debts}
          gameSettings={settings}
          hostFee={hostFee}
          onPlayAgain={resetToLobby}
          onHome={resetToLobby}
          user={currentUser}
        />
      )}
    </div>
  );
}

export default App;
