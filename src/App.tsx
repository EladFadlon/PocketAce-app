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
import { sessionToUser, signOut } from './utils/auth';
import { supabase } from './config/supabase';
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
  // TODO: web monetization — set via onPremiumChange once a payment provider is wired in
  const [isPremium, setIsPremium] = useState(() => localStorage.getItem('pocketAce_isPremium') === 'true');

  const handlePremiumChange = useCallback((value: boolean) => {
    setIsPremium(value);
    if (value) localStorage.setItem('pocketAce_isPremium', 'true');
    else localStorage.removeItem('pocketAce_isPremium');
  }, []);

  useEffect(() => {
    let mounted = true;

    const handleSession = (session: Parameters<typeof sessionToUser>[0]) => {
      const user = sessionToUser(session);
      setCurrentUser(user);
      try {
        const saved = localStorage.getItem(GAME_SAVE_KEY);
        if (saved) {
          const { phase: savedPhase, players: savedPlayers, settings: savedSettings } = JSON.parse(saved);
          if (savedPlayers?.length > 0 && mounted) {
            setPlayers(savedPlayers);
            setSettings(savedSettings);
            setPhase(savedPhase);
            return;
          }
        }
      } catch { /* fall through to lobby */ }
      if (mounted) setPhase(GamePhaseEnum.LOBBY);
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!mounted) return;
      if (event === 'INITIAL_SESSION') {
        if (session) handleSession(session);
      } else if (event === 'SIGNED_IN' && session) {
        const user = sessionToUser(session);
        setCurrentUser(user);
        setPhase(prev => prev === GamePhaseEnum.AUTH ? GamePhaseEnum.LOBBY : prev);
      } else if (event === 'SIGNED_OUT') {
        setCurrentUser(null);
        setPhase(GamePhaseEnum.AUTH);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (phase === GamePhaseEnum.TABLE || phase === GamePhaseEnum.END_GAME) {
      localStorage.setItem(GAME_SAVE_KEY, JSON.stringify({ phase, players, settings }));
    } else if (([GamePhaseEnum.LOBBY, GamePhaseEnum.RESULTS, GamePhaseEnum.AUTH] as string[]).includes(phase)) {
      localStorage.removeItem(GAME_SAVE_KEY);
    }
  }, [phase, players, settings]);


  const handleLogout = useCallback(async () => {
    await signOut();
    localStorage.removeItem(GAME_SAVE_KEY);
    localStorage.removeItem('pocketAce_isPremium');
    setCurrentUser(null);
    setPhase(GamePhaseEnum.AUTH);
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
    localStorage.removeItem(GAME_SAVE_KEY);
    setPhase(GamePhaseEnum.LOBBY);
    setPlayers([]);
  }, []);

  return (
    <div className="app">
      {phase === GamePhaseEnum.AUTH && <Auth />}

      {phase === GamePhaseEnum.LOBBY && currentUser && (
        <Lobby
          onStartGame={handleStartFromLobby}
          user={currentUser}
          onLogout={handleLogout}
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
