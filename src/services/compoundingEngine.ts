
import { BotConfig } from '../types/trading';

/**
 * Compounding Engine for T1-T4 management
 */
export class CompoundingEngine {
  constructor(private config: BotConfig) {}

  updateConfig(config: BotConfig) {
    this.config = config;
  }

  getProfitTarget(balance: number): number {
    // Dynamic target: smaller targets for higher levels to exit recovery faster
    return Number((balance * (this.config.targetProfitPercent / 100)).toFixed(2));
  }

  getT1Stake(balance: number): number {
    // Safe scaling: never risk more than 5% on T1 even if balance grows
    const baseStake = this.config.initialTrade;
    const scale = balance / this.config.startBalance;
    const scaled = Number((baseStake * scale).toFixed(2));
    const maxSafe = Number((balance * 0.05).toFixed(2));
    return Math.min(scaled, maxSafe);
  }

  getStakeForLevel(balance: number, level: number, prevLosses: number): number {
    if (level === 1) return this.getT1Stake(balance);
    
    const target = this.getProfitTarget(balance) * 0.5; // Only aim for 50% profit target during recovery to be safer
    const payout = this.config.payoutRate;
    
    // Recovery Formula: (total_losses + partial_target) / payout
    let stake = (prevLosses + target) / payout;
    
    // Cap recovery stake to 30% of balance to prevent wash
    const washProtectionCap = balance * 0.35;
    if (stake > washProtectionCap) {
        stake = washProtectionCap;
    }

    return Number(Math.max(stake, 0.35).toFixed(2));
  }
}
