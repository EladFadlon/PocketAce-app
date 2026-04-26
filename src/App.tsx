import { useState, useCallback, useEffect } from 'react';
import type { GamePhase, GameSettings, Player, PlayerSettlement, Debt, User } from './types';
import { GamePhase as GamePhaseEnum } from './types';
import { Auth } from './components/Auth';
import { Lobby } from './components/Lobby';
import { GameSetup } from './components/GameSetup';
import { GameTable } from './components/GameTable';
import { EndGame } from './components/EndGame';
import { SettlementResults } from './components/SettlementResults';
import { InstallPrompt } from './components/InstallPrompt';
import { calculatePlayerSettlements, minimizeDebts } from './utils/settlements';
import { saveGameRecord } from './utils/gameHistory';
import { storage } from './utils/storage';
import './App.css';

const DEFAULT_SETTINGS: GameSettings = { nisPerBuyIn: 50, chipsPerBuyIn: 100 };

interface InitialAppState {
  user: User | null;
  phase: GamePhase;
  players: Player[];
  settings: GameSettings;
  gameStartedAt: number | null;
}

const getInitialAppState = (): InitialAppState => {
  const user = storage.getUser();
  if (!user) {
    return { user: null, phase: GamePhaseEnum.AUTH, players: [], settings: DEFAULT_SETTINGS, gameStartedAt: null };
  }
  const saved = storage.getCurrentGame();
  if (saved?.players?.length) {
    return { user, phase: saved.phase, players: saved.players, settings: saved.settings, gameStartedAt: saved.gameStartedAt };
  }
  return { user, phase: GamePhaseEnum.LOBBY, players: [], settings: DEFAULT_SETTINGS, gameStartedAt: null };
};

function App() {
  const [initial] = useState(getInitialAppState);
  const [currentUser, setCurrentUser] = useState<User | null>(initial.user);
  const [phase, setPhase] = useState<GamePhase>(initial.phase);
  const [settings, setSettings] = useState<GameSettings>(initial.settings);
  const [players, setPlayers] = useState<Player[]>(initial.players);
  const [settlements, setSettlements] = useState<PlayerSettlement[]>([]);
  const [debts, setDebts] = useState<Debt[]>([]);
  const [isPremium, setIsPremium] = useState<boolean>(storage.getIsPremium());
  const [gameStartedAt, setGameStartedAt] = useState<number | null>(initial.gameStartedAt);

  useEffect(() => {
    if (phase === GamePhaseEnum.TABLE || phase === GamePhaseEnum.END_GAME) {
      storage.setCurrentGame({ phase, players, settings, gameStartedAt });
    } else if (([GamePhaseEnum.LOBBY, GamePhaseEnum.RESULTS, GamePhaseEnum.AUTH] as string[]).includes(phase)) {
      storage.clearCurrentGame();
    }
  }, [phase, players, settings, gameStartedAt]);

  const handlePremiumChange = useCallback((value: boolean) => {
    setIsPremium(value);
    storage.setIsPremium(value);
  }, []);

  const handleAuth = useCallback((user: User) => {
    setCurrentUser(user);
    setPhase(GamePhaseEnum.LOBBY);
  }, []);

  const handleStartFromLobby = useCallback((selectedNames: string[]) => {
    if (!currentUser) return;
    const hostPlayer: Player = {
      id: `host_${currentUser.id}`,
      name: currentUser.name,
      buyIns: 1,
      totalInvested: settings.nisPerBuyIn,
      finalChips: settings.chipsPerBuyIn,
      isHost: true,
    };
    const regularPlayers: Player[] = selectedNames.map((name, i) => ({
      id: `regular_${i}_${Date.now()}`,
      name,
      buyIns: 1,
      totalInvested: settings.nisPerBuyIn,
      finalChips: settings.chipsPerBuyIn,
      isHost: false,
    }));
    setPlayers([hostPlayer, ...regularPlayers]);
    setSettlements([]);
    setDebts([]);
    setPhase(GamePhaseEnum.SETUP);
  }, [currentUser, settings]);

  const handleStartGame = useCallback((newSettings: GameSettings, newPlayers: Player[]) => {
    setSettings(newSettings);
    setPlayers(newPlayers);
    setGameStartedAt(Date.now());
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
    const { settlements: ps } = calculatePlayerSettlements(updatedPlayers, settings);
    const calculatedDebts = minimizeDebts(ps);

    setSettlements(ps);
    setDebts(calculatedDebts);

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
  }, []);

  const handleQuit = useCallback(() => {
    storage.clearCurrentGame();
    setPhase(GamePhaseEnum.LOBBY);
    setPlayers([]);
  }, []);

  return (
    <div className="app">
      {phase === GamePhaseEnum.AUTH && <Auth onAuth={handleAuth} />}

      {phase === GamePhaseEnum.LOBBY && currentUser && (
        <Lobby
          onStartGame={handleStartFromLobby}
          user={currentUser}
          isPremium={isPremium}
          onPremiumChange={handlePremiumChange}
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
          gameStartedAt={gameStartedAt ?? undefined}
        />
      )}

      {phase === GamePhaseEnum.END_GAME && (
        <EndGame
          players={players}
          settings={settings}
          onCalculate={handleCalculateSettlements}
          onBack={handleBackFromEndGame}
        />
      )}

      {phase === GamePhaseEnum.RESULTS && currentUser && (
        <SettlementResults
          settlements={settlements}
          debts={debts}
          gameSettings={settings}
          onPlayAgain={resetToLobby}
          onHome={resetToLobby}
          user={currentUser}
        />
      )}

      <InstallPrompt />
    </div>
  );
}

export default App;
