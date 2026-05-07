
import { Candle, IStrategy, StrategyResult } from './types';
import { TradeDirection } from '../types/trading';

/**
 * Price Action Pro (2026 Edition)
 * - Detects: Engulfing Patterns, Three-Bar Plays, Wick Rejection.
 * - Logic: Institutional level breaks and momentum surges.
 */
export class PriceActionStrategy implements IStrategy {
  name = 'Price Action Pro';
  id = 'price_action_pro';

  private calculateEMA(data: number[], period: number): number {
    if (data.length < period) return data[data.length - 1];
    const k = 2 / (period + 1);
    let ema = data[0];
    for (let i = 1; i < data.length; i++) {
      ema = data[i] * k + ema * (1 - k);
    }
    return ema;
  }

  private calculateRSI(candles: Candle[], period: number = 14): number {
    if (candles.length < period + 1) return 50;
    
    let gains = 0;
    let losses = 0;

    for (let i = candles.length - period; i < candles.length; i++) {
      const diff = candles[i].close - candles[i - 1].close;
      if (diff >= 0) gains += diff;
      else losses -= diff;
    }

    if (losses === 0) return 100;
    const rs = gains / losses;
    return 100 - (100 / (1 + rs));
  }

  analyze(candles: Candle[]): StrategyResult {
    if (candles.length < 21) return { signal: 'HOLD', confidence: 0, reason: 'Calibrating neural structures...', indicators: {} };

    const last = candles[candles.length - 1];
    const prev = candles[candles.length - 2];
    const prev2 = candles[candles.length - 3];
    const closes = candles.map(c => c.close);

    const ema5 = this.calculateEMA(closes, 5);
    const ema9 = this.calculateEMA(closes, 9);
    const ema13 = this.calculateEMA(closes, 13);
    const ema21 = this.calculateEMA(closes, 21);
    const rsi = this.calculateRSI(candles, 14);

    const isBullBody = last.close > last.open;
    const isBearBody = last.close < last.open;
    const lastBodySize = Math.abs(last.close - last.open);
    const prevBodySize = Math.abs(prev.close - prev.open);
    const prev2BodySize = Math.abs(prev2.close - prev2.open);
    const lastWickTop = last.high - Math.max(last.open, last.close);
    const lastWickBottom = Math.min(last.open, last.close) - last.low;
    
    let signal: TradeDirection | 'HOLD' = 'HOLD';
    let confidence = 0;
    let reason = '';

    const trendUp = last.close > ema13;
    const trendDown = last.close < ema13;
    const strongTrendUp = trendUp && ema9 > ema13 && ema13 > ema21;
    const strongTrendDown = trendDown && ema9 < ema13 && ema13 < ema21;

    // 1. Momentum Pulse (Highly Aggressive)
    const isBigMove = lastBodySize > prevBodySize * 0.7;
    
    if (isBullBody && isBigMove && last.close > prev.high && rsi > 40 && rsi < 85) {
      signal = TradeDirection.CALL;
      confidence = trendUp ? 95 : 82;
      reason = 'Momentum Pulse detected';
    }
    else if (isBearBody && isBigMove && last.close < prev.low && rsi < 60 && rsi > 15) {
      signal = TradeDirection.PUT;
      confidence = trendDown ? 95 : 82;
      reason = 'Momentum Pulse detected';
    }
    // 2. Immediate Engulfing (Lower threshold)
    else if (isBullBody && last.close > prev.open && lastBodySize > prevBodySize * 0.8) {
      signal = TradeDirection.CALL;
      confidence = trendUp ? 90 : 75;
      reason = 'Bullish Engulfing Logic';
    }
    else if (isBearBody && last.close < prev.open && lastBodySize > prevBodySize * 0.8) {
      signal = TradeDirection.PUT;
      confidence = trendDown ? 90 : 75;
      reason = 'Bearish Engulfing Logic';
    }
    // 3. EMA Gravity Trap (Rejection)
    else if (last.low <= ema9 * 1.0002 && last.close > ema9 && isBullBody) {
      signal = TradeDirection.CALL;
      confidence = 88;
      reason = 'EMA Gravity Support';
    }
    else if (last.high >= ema9 * 0.9998 && last.close < ema9 && isBearBody) {
      signal = TradeDirection.PUT;
      confidence = 88;
      reason = 'EMA Gravity Resistance';
    }
    // 4. RSI Overextension (Mean Reversion)
    else if (rsi < 25 && isBullBody) {
      signal = TradeDirection.CALL;
      confidence = 85;
      reason = 'Oversold RSI Spike Reversal';
    }
    else if (rsi > 75 && isBearBody) {
      signal = TradeDirection.PUT;
      confidence = 85;
      reason = 'Overbought RSI Spike Reversal';
    }
    // 5. Continuation Flow
    else if (isBullBody && prev.close > prev.open && last.close > prev.high && trendUp) {
      signal = TradeDirection.CALL;
      confidence = 80;
      reason = 'Trend Continuation Flow';
    }
    else if (isBearBody && prev.close < prev.open && last.close < prev.low && trendDown) {
      signal = TradeDirection.PUT;
      confidence = 80;
      reason = 'Trend Continuation Flow';
    }
    
    // 6. Wick Exhaustion (Ultra Aggressive)
    else if (lastWickBottom > lastBodySize * 2 && rsi < 45) {
      signal = TradeDirection.CALL;
      confidence = 82;
      reason = 'Bullish Exhaustion detected';
    }
    else if (lastWickTop > lastBodySize * 2 && rsi > 55) {
      signal = TradeDirection.PUT;
      confidence = 82;
      reason = 'Bearish Exhaustion detected';
    }
    
    return {
      signal,
      confidence,
      reason: reason || 'Scanning micro-structures for liquidity gaps...',
      indicators: { rsi, ema9, trend: strongTrendUp ? 'STRONG_UP' : (strongTrendDown ? 'STRONG_DOWN' : 'LATERAL') }
    };
  }
}
