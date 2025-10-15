/**
 * BalanceAnalyzer - Mathematical balance analysis utility
 *
 * Provides proven game balance formulas for tower defense analysis:
 * - Lanchester's Laws for wave defense prediction
 * - Efficiency scoring for tower cost-effectiveness
 * - Diminishing returns calculations
 * - Threat scoring for zombie balance
 * - Effective DPS with overkill adjustment
 * - Break-even analysis for tower ROI
 */

// ============================================================================
// Interfaces
// ============================================================================

export interface BalanceIssue {
  type: 'INEFFICIENT_TOWERS' | 'WEAK_DEFENSE' | 'EXCESSIVE_OVERKILL' | 'NEGATIVE_ECONOMY';
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  message: string;
  value: number;
  threshold: number;
  recommendation: string;
}

export interface TowerEfficiency {
  type: string;
  cost: number;
  dps: number;
  range: number;
  accuracy: number;
  efficiencyScore: number;
  effectiveDPS: number;
  breakEvenTime: number;
}

export interface WaveDefenseAnalysis {
  wave: number;
  canDefend: boolean;
  totalZombieHP: number;
  totalTowerDPS: number;
  timeToReachEnd: number;
  damageDealt: number;
  damageRequired: number;
  safetyMargin: number; // percentage
  recommendation: string;
}

export interface ThreatScore {
  zombieType: string;
  health: number;
  speed: number;
  count: number;
  reward: number;
  threatScore: number;
  threatPerDollar: number;
  isBalanced: boolean;
}

// ============================================================================
// BalanceAnalyzer Class
// ============================================================================

export class BalanceAnalyzer {
  /**
   * Lanchester's Laws - Predict if towers can defend against wave
   *
   * Uses path length and zombie speed to calculate time available for damage.
   * Compares total damage potential vs zombie HP to determine defense capability.
   *
   * @param totalDPS - Combined DPS of all towers
   * @param zombieHP - Total HP of all zombies in wave
   * @param zombieSpeed - Average zombie speed (pixels/second)
   * @param pathLength - Length of path zombies must travel (pixels)
   * @returns WaveDefenseAnalysis with prediction and recommendations
   */
  static canDefendWave(
    totalDPS: number,
    zombieHP: number,
    zombieSpeed: number,
    pathLength: number,
    wave: number = 0
  ): WaveDefenseAnalysis {
    // Calculate time zombies take to reach the end
    const timeToReachEnd = pathLength / zombieSpeed;

    // Calculate total damage towers can deal in that time
    const damageDealt = totalDPS * timeToReachEnd;

    // Damage required equals total zombie HP
    const damageRequired = zombieHP;

    // Can defend if damage dealt >= damage required
    const canDefend = damageDealt >= damageRequired;

    // Safety margin as percentage (positive = overkill capacity, negative = deficit)
    const safetyMargin = ((damageDealt - damageRequired) / damageRequired) * 100;

    // Generate recommendation based on safety margin
    let recommendation: string;
    if (safetyMargin >= 50) {
      recommendation = `Excellent defense with ${safetyMargin.toFixed(1)}% safety margin. Consider saving money for future waves.`;
    } else if (safetyMargin >= 20) {
      recommendation = `Good defense with ${safetyMargin.toFixed(1)}% safety margin. Defense is adequate.`;
    } else if (safetyMargin >= 0) {
      recommendation = `Marginal defense with only ${safetyMargin.toFixed(1)}% safety margin. Consider upgrading towers.`;
    } else if (safetyMargin >= -20) {
      recommendation = `⚠️ Weak defense! Deficit of ${Math.abs(safetyMargin).toFixed(1)}%. Upgrade towers immediately!`;
    } else {
      recommendation = `❌ Critical defense failure! Deficit of ${Math.abs(safetyMargin).toFixed(1)}%. Build more towers urgently!`;
    }

    return {
      wave,
      canDefend,
      totalZombieHP: zombieHP,
      totalTowerDPS: totalDPS,
      timeToReachEnd,
      damageDealt,
      damageRequired,
      safetyMargin,
      recommendation,
    };
  }

  /**
   * Calculate tower efficiency score
   *
   * Uses formula: (DPS × Range × Accuracy) / Total Cost
   * Higher score = more cost-effective tower
   *
   * @param dps - Damage per second
   * @param range - Tower range in pixels
   * @param accuracy - Hit accuracy (0.0 to 1.0)
   * @param buildCost - Base build cost
   * @param upgradeCost - Total upgrade cost spent (default 0)
   * @returns Efficiency score (higher is better)
   */
  static calculateEfficiencyScore(
    dps: number,
    range: number,
    accuracy: number,
    buildCost: number,
    upgradeCost: number = 0
  ): number {
    const totalCost = buildCost + upgradeCost;

    // Avoid division by zero
    if (totalCost === 0) {
      return 0;
    }

    // Efficiency formula: (DPS × Range × Accuracy) / Cost
    const efficiencyScore = (dps * range * accuracy) / totalCost;

    return efficiencyScore;
  }

  /**
   * Apply diminishing returns to stacked towers
   *
   * Uses formula: (stat / (stat + diminishingFactor)) × cap
   * Prevents stacking from being too powerful
   *
   * @param stat - Base stat value
   * @param stackCount - Number of stacked towers
   * @param diminishingFactor - Diminishing factor (default 100)
   * @returns Effective stat value after diminishing returns
   */
  static applyDiminishingReturns(
    stat: number,
    stackCount: number,
    diminishingFactor: number = 100
  ): number {
    // No diminishing returns for single tower
    if (stackCount <= 1) {
      return stat;
    }

    // Apply diminishing returns formula
    // Each additional tower is less effective
    const cap = 0.5; // Maximum reduction to 50% effectiveness
    const effectiveValue = (stat / (stat + diminishingFactor)) * cap * stackCount;

    return effectiveValue;
  }

  /**
   * Calculate threat score for zombie type
   *
   * Uses formula: (Health × Speed × Count) / (Reward × 10)
   * Balanced if score is between 0.8 and 1.2
   *
   * @param health - Zombie health
   * @param speed - Zombie speed (pixels/second)
   * @param count - Number of zombies
   * @param reward - Money reward per zombie
   * @returns ThreatScore analysis
   */
  static calculateThreatScore(
    health: number,
    speed: number,
    count: number,
    reward: number,
    zombieType: string = 'Unknown'
  ): ThreatScore {
    // Calculate threat score
    const threatScore = (health * speed * count) / (reward * 10);

    // Calculate threat per dollar (how much threat per reward)
    const threatPerDollar = (health * speed) / reward;

    // Balanced if threat score is between 0.8 and 1.2
    const isBalanced = threatScore >= 0.8 && threatScore <= 1.2;

    return {
      zombieType,
      health,
      speed,
      count,
      reward,
      threatScore,
      threatPerDollar,
      isBalanced,
    };
  }

  /**
   * Calculate effective DPS accounting for overkill damage wastage
   *
   * Adjusts nominal DPS based on wasted damage from overkill
   *
   * @param nominalDPS - Base DPS without overkill adjustment
   * @param averageZombieHP - Average zombie health
   * @param damagePerHit - Damage dealt per hit/shot
   * @returns Effective DPS after overkill adjustment
   */
  static calculateEffectiveDPS(
    nominalDPS: number,
    averageZombieHP: number,
    damagePerHit: number
  ): number {
    // Avoid division by zero
    if (damagePerHit === 0 || averageZombieHP === 0) {
      return nominalDPS;
    }

    // Calculate shots needed to kill average zombie
    const shotsToKill = Math.ceil(averageZombieHP / damagePerHit);

    // Calculate wasted damage (overkill on last shot)
    const totalDamageToKill = shotsToKill * damagePerHit;
    const wastedDamage = totalDamageToKill - averageZombieHP;

    // Calculate waste percentage
    const wastePercent = wastedDamage / totalDamageToKill;

    // Effective DPS = Nominal DPS × (1 - waste percent)
    const effectiveDPS = nominalDPS * (1 - wastePercent);

    return effectiveDPS;
  }

  /**
   * Calculate break-even time for tower investment
   *
   * Determines how long it takes for a tower to pay for itself
   *
   * @param towerCost - Total cost of tower (build + upgrades)
   * @param towerDPS - Tower's damage per second
   * @param averageZombieReward - Average money per zombie kill
   * @param averageZombieHP - Average zombie health
   * @returns Break-even time in seconds
   */
  static calculateBreakEvenPoint(
    towerCost: number,
    towerDPS: number,
    averageZombieReward: number,
    averageZombieHP: number
  ): number {
    // Avoid division by zero
    if (towerDPS === 0 || averageZombieHP === 0) {
      return Infinity;
    }

    // Calculate time to kill one zombie
    const killTime = averageZombieHP / towerDPS;

    // Calculate revenue per second
    const revenuePerSecond = averageZombieReward / killTime;

    // Avoid division by zero
    if (revenuePerSecond === 0) {
      return Infinity;
    }

    // Break-even time = Cost / Revenue per second
    const breakEvenTime = towerCost / revenuePerSecond;

    return breakEvenTime;
  }

  /**
   * Detect balance issues from game statistics
   *
   * Analyzes key metrics and flags potential balance problems
   *
   * @param stats - Game statistics to analyze
   * @returns Array of detected balance issues
   */
  static detectBalanceIssues(stats: {
    damagePerDollar: number;
    survivalRate: number;
    overkillPercent: number;
    economyEfficiency: number;
  }): BalanceIssue[] {
    const issues: BalanceIssue[] = [];

    // Check damage per dollar (threshold: 15)
    if (stats.damagePerDollar < 15) {
      const severity: BalanceIssue['severity'] =
        stats.damagePerDollar < 10 ? 'CRITICAL' : stats.damagePerDollar < 12 ? 'HIGH' : 'MEDIUM';

      issues.push({
        type: 'INEFFICIENT_TOWERS',
        severity,
        message: `Damage per dollar is ${stats.damagePerDollar.toFixed(1)}, below threshold of 15`,
        value: stats.damagePerDollar,
        threshold: 15,
        recommendation:
          'Build fewer towers and upgrade existing ones more. Focus on cost-effective tower types.',
      });
    }

    // Check survival rate (threshold: 50%)
    if (stats.survivalRate < 50) {
      const severity: BalanceIssue['severity'] =
        stats.survivalRate < 25 ? 'CRITICAL' : stats.survivalRate < 35 ? 'HIGH' : 'MEDIUM';

      issues.push({
        type: 'WEAK_DEFENSE',
        severity,
        message: `Survival rate is ${stats.survivalRate.toFixed(1)}%, below threshold of 50%`,
        value: stats.survivalRate,
        threshold: 50,
        recommendation:
          'Build more towers or upgrade existing towers. Focus on high-DPS towers in critical positions.',
      });
    }

    // Check overkill percentage (threshold: 15%)
    if (stats.overkillPercent > 15) {
      const severity: BalanceIssue['severity'] =
        stats.overkillPercent > 30 ? 'HIGH' : stats.overkillPercent > 20 ? 'MEDIUM' : 'LOW';

      issues.push({
        type: 'EXCESSIVE_OVERKILL',
        severity,
        message: `Overkill percentage is ${stats.overkillPercent.toFixed(1)}%, above threshold of 15%`,
        value: stats.overkillPercent,
        threshold: 15,
        recommendation:
          'Spread towers out more or use different tower types. Avoid stacking too much damage in one area.',
      });
    }

    // Check economy efficiency (threshold: 100%)
    if (stats.economyEfficiency < 100) {
      const severity: BalanceIssue['severity'] =
        stats.economyEfficiency < 50
          ? 'CRITICAL'
          : stats.economyEfficiency < 75
            ? 'HIGH'
            : 'MEDIUM';

      issues.push({
        type: 'NEGATIVE_ECONOMY',
        severity,
        message: `Economy efficiency is ${stats.economyEfficiency.toFixed(1)}%, below threshold of 100%`,
        value: stats.economyEfficiency,
        threshold: 100,
        recommendation:
          'Spending more than earning. Build fewer towers per wave and focus on income generation.',
      });
    }

    return issues;
  }

  /**
   * Calculate optimal tower mix using marginal utility
   *
   * Uses greedy algorithm to determine best tower composition for budget
   * Applies 90% efficiency reduction per duplicate tower
   *
   * @param budget - Available money
   * @param towerStats - Array of tower statistics
   * @returns Record of tower types and quantities
   */
  static getOptimalTowerMix(
    budget: number,
    towerStats: Array<{ type: string; cost: number; dps: number; range: number }>
  ): Record<string, number> {
    const mix: Record<string, number> = {};
    let remainingBudget = budget;

    // Initialize tower counts
    towerStats.forEach(tower => {
      mix[tower.type] = 0;
    });

    // Greedy algorithm: repeatedly buy tower with best marginal utility
    while (remainingBudget > 0) {
      let bestTower: { type: string; cost: number; utility: number } | null = null;

      // Calculate marginal utility for each tower type
      for (const tower of towerStats) {
        // Skip if can't afford
        if (tower.cost > remainingBudget) {
          continue;
        }

        // Calculate base efficiency (DPS × Range / Cost)
        const baseEfficiency = (tower.dps * tower.range) / tower.cost;

        // Apply diminishing returns (90% efficiency per duplicate)
        const currentCount = mix[tower.type];
        const efficiencyMultiplier = Math.pow(0.9, currentCount);
        const marginalUtility = baseEfficiency * efficiencyMultiplier;

        // Track best option
        if (!bestTower || marginalUtility > bestTower.utility) {
          bestTower = {
            type: tower.type,
            cost: tower.cost,
            utility: marginalUtility,
          };
        }
      }

      // If no affordable tower found, break
      if (!bestTower) {
        break;
      }

      // Buy the best tower
      mix[bestTower.type]++;
      remainingBudget -= bestTower.cost;
    }

    return mix;
  }

  /**
   * Analyze tower efficiency with all metrics
   *
   * Combines efficiency score, effective DPS, and break-even analysis
   *
   * @param type - Tower type name
   * @param cost - Total cost (build + upgrades)
   * @param dps - Damage per second
   * @param range - Tower range
   * @param accuracy - Hit accuracy (0.0 to 1.0)
   * @param damagePerHit - Damage per shot/hit
   * @param averageZombieHP - Average zombie health
   * @param averageZombieReward - Average zombie reward
   * @returns TowerEfficiency analysis
   */
  static analyzeTowerEfficiency(
    type: string,
    cost: number,
    dps: number,
    range: number,
    accuracy: number,
    damagePerHit: number,
    averageZombieHP: number,
    averageZombieReward: number
  ): TowerEfficiency {
    // Calculate efficiency score
    const efficiencyScore = this.calculateEfficiencyScore(dps, range, accuracy, cost, 0);

    // Calculate effective DPS (accounting for overkill)
    const effectiveDPS = this.calculateEffectiveDPS(dps, averageZombieHP, damagePerHit);

    // Calculate break-even time
    const breakEvenTime = this.calculateBreakEvenPoint(
      cost,
      dps,
      averageZombieReward,
      averageZombieHP
    );

    return {
      type,
      cost,
      dps,
      range,
      accuracy,
      efficiencyScore,
      effectiveDPS,
      breakEvenTime,
    };
  }
}
