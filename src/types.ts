export interface GameSettings {
  nisPerBuyIn: number;
  chipsPerBuyIn: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  createdAt: number;
}

export interface GameRecord {
  id: string;
  date: number;
  hostsName: string;
  totalPot: number;
  topShark: { name: string; amount: number } | null;
  debts: Array<{ from: string; to: string; amount: number }>;
  playerResults?: Array<{ name: string; profitLossAfterFee: number }>;
}

export interface Player {
  id: string;
  name: string;
  buyIns: number;
  totalInvested: number;
  finalChips: number;
  isHost?: boolean;
}

export interface PlayerSettlement extends Player {
  profitLoss: number;
  profitLossAfterFee: number;
  profitLossAfterFeeAgorot: number;
}

export interface Debt {
  from: PlayerSettlement;
  to: PlayerSettlement;
  amount: number;
}

export type GamePhase = 'auth' | 'lobby' | 'setup' | 'table' | 'endGame' | 'results';

export const GamePhase = {
  AUTH: 'auth' as const,
  LOBBY: 'lobby' as const,
  SETUP: 'setup' as const,
  TABLE: 'table' as const,
  END_GAME: 'endGame' as const,
  RESULTS: 'results' as const
};

export interface GameState {
  phase: GamePhase;
  settings: GameSettings;
  players: Player[];
  settlements?: PlayerSettlement[];
  debts?: Debt[];
}
