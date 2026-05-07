import { IStrategy, StrategyResult, Candle } from './types';
import { TradeDirection } from '../types/trading';

/**
 * STRATEGY: INQILAAB SPECTRUM ALPHA (v2026.05)
 * TARGET: Volatility 100 (1s) Index Optimized
 * 
 * DESIGN PHILOSOPHY:
 * Uses a triad of momentum spectrums (Micro, Macro, and Terminal) to identify 
 * "Inqilaab" points—where market inertia is forced to flip due to liquidity exhaustion.
 */
export class InqilaabSpectrumAlpha implements IStrategy {
  name = 'Inqilaab Spectrum Alpha (R100 Bug-Optimized)';
  id = 'inqilaab_alpha';

  analyze(candles: Candle[]): StrategyResult {
    if (candles.length < 50) {
      return { signal: TradeDirection.HOLD, confidence: 0, indicators: {} };
    }

    const closes = candles.map(c => c.close);
    const lastClose = closes[closes.length - 1];
    
    // 1. Triple-Horizon RSI Spectrum
    const rsi5 = this.calculateRSI(closes, 5);
    const rsi14 = this.calculateRSI(closes, 14);
    const rsi21 = this.calculateRSI(closes, 21);

    // 2. Volatility Compression (Donchian Channel Variant)
    const high5 = Math.max(...candles.slice(-5).map(c => c.high));
    const low5 = Math.min(...candles.slice(-5).map(c => c.low));
    const range5 = (high5 - low5) / lastClose;

    // 3. Price Velocity (The "Inqilaab" Delta)
    const velocity = (closes[closes.length - 1] - closes[closes.length - 3]) / closes[closes.length - 3];
    const accel = velocity - ((closes[closes.length - 3] - closes[closes.length - 6]) / closes[closes.length - 6]);

    // Trend Cohesion
    const bullishAlignment = rsi5 > rsi14 && rsi14 > rsi21;
    const bearishAlignment = rsi5 < rsi14 && rsi14 < rsi21;

    let signal = TradeDirection.HOLD;
    let confidence = 0;
    let reason = '';

    // INQILAAB LOGIC: Terminal Reversal + Trend Injection
    const isR100 = true; // Strategy is already R100-optimized by design
    
    // R100 Specific Pattern: The "Double-Wick Vacuum"
    const lastThreeCandles = candles.slice(-3);
    const hasDoubleBottomWicks = lastThreeCandles.every(c => (c.close - c.low) / (c.high - c.low) > 0.6);
    const hasDoubleTopWicks = lastThreeCandles.every(c => (c.high - c.close) / (c.high - c.low) > 0.6);

    if (bullishAlignment && rsi5 < 75 && accel > 0) {
      // High momentum breakout
      signal = TradeDirection.CALL;
      confidence = 92 + (accel * 2000);
      reason = 'Inqilaab Launch: Harmonic Spectrum Expansion Detected';
    } else if (bearishAlignment && rsi5 > 25 && accel < 0) {
      // High momentum breakdown
      signal = TradeDirection.PUT;
      confidence = 92 + (Math.abs(accel) * 2000);
      reason = 'Inqilaab Launch: Alpha Spectrum Collapse Detected';
    } else {
      // COUNTER-STRIKE: Exhaustion catch (The "Bug" exploit for Vol 100)
      if (rsi5 > 82 && hasDoubleTopWicks) {
        signal = TradeDirection.PUT;
        confidence = 95;
        reason = 'R100 Spectrum Overload: Liquidated Longs Vacuum Detected';
      } else if (rsi5 < 18 && hasDoubleBottomWicks) {
        signal = TradeDirection.CALL;
        confidence = 95;
        reason = 'R100 Spectrum Exhaustion: Liquidated Shorts Vacuum Detected';
      }
    }

    return {
      signal,
      confidence: Math.min(99, Math.max(0, confidence)),
      reason,
      indicators: { rsi5, rsi14, velocity, range5, accel }
    };
  }

  private calculateRSI(closes: number[], period: number): number {
    let gains = 0;
    let losses = 0;
    for (let i = closes.length - period; i < closes.length; i++) {
      const diff = closes[i] - closes[i - 1];
      if (diff >= 0) gains += diff;
      else losses -= diff;
    }
    const rs = gains / (losses || 1);
    return 100 - (100 / (1 + rs));
  }
}
