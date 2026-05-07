
export type MarketSymbol = 
  | 'R_10' | 'R_25' | 'R_50' | 'R_75' | 'R_100' 
  | '1HZ10V' | '1HZ25V' | '1HZ50V' | '1HZ75V' | '1HZ100V'
  | 'JD10' | 'JD25' | 'JD50' | 'JD75' | 'JD100';

export enum TradeDirection {
  CALL = 'CALL',
  PUT = 'PUT',
}

export enum AccountMode {
  DEMO = 'DEMO',
  REAL = 'REAL',
}

export enum ExecutionMode {
  COMPOUND = 'COMPOUND',
  FIRE = 'FIRE',
  PROFIT_TAKER = 'PROFIT_TAKER',
  ROW_TABLE_20 = 'ROW_TABLE_20',
}

export interface BotConfig {
  demoToken: string;
  realToken: string;
  mode: AccountMode;
  symbol: MarketSymbol;
  durationSeconds: number;
  durationUnit: 's' | 't' | 'm';
  payoutRate: number;
  startBalance: number;
  initialTrade: number;
  targetProfitPercent: number;
  maxRecoveryLevel: number;
  minConfidence: number;
  autoTrade: boolean;
  autoPivot: boolean;
  compoundingEnabled: boolean;
  executionMode: ExecutionMode;
  fireBatchSize: number;
  strategyId: string;
  scannerSymbols: MarketSymbol[];
  candleInterval: number; // in seconds
  useNeuralFilter: boolean;
}

export interface TradeResult {
  won: boolean;
  profit: number;
  stake: number;
  level: number;
  symbol: string;
  direction: string;
  timestamp: Date;
  contractId?: number;
  referenceId?: number;
}

export interface AISafetyReport {
  safetyScore: number;
  marketSentiment: 'Bullish' | 'Bearish' | 'Neutral' | 'Volatile';
  recommendation: 'TRADE' | 'WAIT' | 'AVOID';
  insight: string;
  isQuotaError?: boolean;
}

export interface ActiveTrade {
  contractId: number;
  symbol: string;
  direction: string;
  stake: number;
  entrySpot: number;
  currentSpot?: number;
  startTime: number;
  expiryTime: number;
  profit?: number;
  status?: string;
}

export interface TerminalLog {
  id: string;
  timestamp: number;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'trade';
}

export interface BacktestResult {
  winRate: number;
  totalTrades: number;
  wins: number;
  losses: number;
  profit: number;
  score: number; // 0-100
  timestamp: number;
  maxDrawdown: number;
  profitFactor: number;
  trades: {
    time: string;
    direction: string;
    won: boolean;
    reason: string;
    profit: number;
    balance: number;
  }[];
}

export interface StatementEntry {
  actionType: string;
  amount: number;
  balanceAfter: number;
  contractId?: number;
  referenceId: number;
  timestamp: Date;
  description: string;
}

export interface OpenPosition {
  contractId: number;
  symbol: string;
  direction: string;
  stake: number;
  purchaseTime: Date;
  expiryTime?: Date;
  entrySpot?: number;
}

export interface BotState {
  balance: number;
  currency: string;
  currentSequence: number;
  currentLevel: number; // 1 to MAX_RECOVERY_LEVEL
  sequenceStartBalance: number;
  trades: TradeResult[];
  statement: StatementEntry[];
  openPositions: OpenPosition[];
  isRunning: boolean;
  isAnalyzing: boolean;
  analysisCountdown: number;
  isReversed: boolean;
  currentRow: number;
  currentCol: number;
  activeTrade?: ActiveTrade;
  lastSignal?: string;
  lastConfidence?: number;
  lastPulse?: number;
  aiReport?: AISafetyReport;
  backtestResult?: BacktestResult;
  allMarketScores: Record<string, number>;
  isBacktestingAll: boolean;
  isAutoPivotEnabled: boolean;
  isAutoReverseEnabled: boolean;
  logs: TerminalLog[];
  marketData: any[]; // Store latest candles for chart
}
