
import { MarketSymbol, TradeDirection } from '../types/trading';

export interface Candle {
  open: number;
  high: number;
  low: number;
  close: number;
  epoch: number;
}

export interface StrategyResult {
  signal: TradeDirection | 'HOLD';
  confidence: number;
  reason?: string;
  indicators: Record<string, any>;
}

export interface IStrategy {
  name: string;
  id: string;
  analyze: (candles: Candle[]) => StrategyResult;
}
