/**
 * Wave Balancing System
 *
 * This system calculates wave difficulty based on player progression and tower DPS.
 * It provides formulas to balance zombie health, count, and spawn rates.
 */

import { TowerConstants } from './towerConstants';

export interface WaveBalanceConfig {
  // Base difficulty settings
  baseZombieHealth: number;
  baseZombieCount: number;
  baseSpawnInterval: number; // milliseconds between spawns

  // Scaling factors per wave
  healthScaling: number; // Multiplier per wave (e.g., 1.15 = 15% increase per wave)
  countScaling: number; // Additional zombies per wave
  spawnRateScaling: number; // Spawn rate multiplier per wave

  // Player progression assumptions
  expectedTowersPerWave: number; // How many towers player should have by wave X
  expectedUpgradeLevelPerWave: number; // Average upgrade level by wave X

  // Difficulty curve
  difficultyMultiplier: number; // Overall difficulty (1.0 = normal, 1.5 = hard)
}

export const WaveBalancing = {
  // Default balance configuration
  config: {
    baseZombieHealth: 100,
    baseZombieCount: 5,
    baseSpawnInterval: 2000, // 2 seconds

    healthScaling: 1.2, // 20% more health per wave
    countScaling: 2, // 2 more zombies per wave
    spawnRateScaling: 0.95, // 5% faster spawns per wave

    expectedTowersPerWave: 0.5, // Player gains ~1 tower every 2 waves
    expectedUpgradeLevelPerWave: 0.3, // Player upgrades ~1 level every 3 waves

    difficultyMultiplier: 1.0,
  } as WaveBalanceConfig,

  /**
   * Calculate expected player DPS for a given wave
   * This helps us know how much damage the player should be dealing
   */
  calculateExpectedPlayerDPS(wave: number): number {
    const config = this.config;

    // Estimate number of towers player has
    const towerCount = Math.floor(1 + wave * config.expectedTowersPerWave);

    // Estimate average upgrade level
    const avgUpgradeLevel = Math.floor(wave * config.expectedUpgradeLevelPerWave);

    // Use machine gun as baseline tower (most common)
    const baseDamage = TowerConstants.MACHINE_GUN.damage;
    const baseFireRate = TowerConstants.MACHINE_GUN.fireRate;

    // Calculate damage with upgrades (+50% per level)
    const upgradedDamage = baseDamage * (1 + avgUpgradeLevel * 0.5);

    // Total DPS = towers × damage × fire rate
    const totalDPS = towerCount * upgradedDamage * baseFireRate;

    return totalDPS;
  },

  /**
   * Calculate zombie health for a given wave
   * Balanced so zombies take reasonable time to kill
   */
  calculateZombieHealth(
    wave: number,
    zombieType: 'basic' | 'fast' | 'tank' | 'armored' | 'swarm' | 'stealth' | 'mechanical' = 'basic'
  ): number {
    const config = this.config;

    // Base health scales exponentially with wave
    const baseHealth = config.baseZombieHealth * Math.pow(config.healthScaling, wave - 1);

    // Type multipliers
    const typeMultipliers = {
      basic: 1.0,
      fast: 0.6, // Less health, more speed
      tank: 4.0, // Massive health
      armored: 2.5, // Heavy armor
      swarm: 0.4, // Very weak
      stealth: 1.2, // Slightly more health
      mechanical: 2.0, // Tough
    };

    const health = baseHealth * typeMultipliers[zombieType] * config.difficultyMultiplier;

    return Math.floor(health);
  },

  /**
   * Calculate zombie count for a given wave
   * Ensures waves feel progressively harder
   */
  calculateZombieCount(wave: number): number {
    const config = this.config;

    // Linear + exponential growth
    const linearGrowth = config.baseZombieCount + (wave - 1) * config.countScaling;
    const exponentialBonus = Math.floor(wave / 5) * 2; // +2 zombies every 5 waves

    const count = linearGrowth + exponentialBonus;

    return Math.floor(count * config.difficultyMultiplier);
  },

  /**
   * Calculate spawn interval for a given wave
   * Zombies spawn faster in later waves
   */
  calculateSpawnInterval(wave: number): number {
    const config = this.config;

    // Spawn rate increases each wave
    const interval = config.baseSpawnInterval * Math.pow(config.spawnRateScaling, wave - 1);

    // Minimum spawn interval (don't go too fast)
    const minInterval = 500; // 0.5 seconds minimum

    return Math.max(minInterval, Math.floor(interval));
  },

  /**
   * Calculate wave duration (how long the wave should last)
   */
  calculateWaveDuration(wave: number): number {
    const count = this.calculateZombieCount(wave);
    const interval = this.calculateSpawnInterval(wave);

    // Time to spawn all zombies + buffer for last zombie to reach end
    const spawnTime = count * interval;
    const travelTime = 15000; // ~15 seconds for zombie to traverse map

    return spawnTime + travelTime;
  },

  /**
   * Calculate recommended money reward for completing a wave
   */
  calculateWaveReward(wave: number): number {
    // Base reward + scaling
    const baseReward = 50;
    const scaling = 10; // +10 per wave

    return baseReward + wave * scaling;
  },

  /**
   * Calculate total zombie HP in a wave
   * Useful for balancing against player DPS
   */
  calculateTotalWaveHP(wave: number): number {
    const count = this.calculateZombieCount(wave);
    const health = this.calculateZombieHealth(wave, 'basic');

    return count * health;
  },

  /**
   * Calculate time to kill wave (theoretical)
   * Helps validate if wave is beatable
   */
  calculateTimeToKillWave(wave: number): number {
    const totalHP = this.calculateTotalWaveHP(wave);
    const playerDPS = this.calculateExpectedPlayerDPS(wave);

    // Time in seconds
    return totalHP / playerDPS;
  },

  /**
   * Validate wave balance
   * Returns warnings if wave seems unbalanced
   */
  validateWaveBalance(wave: number): string[] {
    const warnings: string[] = [];

    const timeToKill = this.calculateTimeToKillWave(wave);
    const waveDuration = this.calculateWaveDuration(wave) / 1000; // Convert to seconds

    // Check if player has enough time to kill all zombies
    if (timeToKill > waveDuration * 0.9) {
      warnings.push(
        `⚠️ Wave ${wave}: Very tight! Time to kill (${timeToKill.toFixed(1)}s) is close to wave duration (${waveDuration.toFixed(1)}s)`
      );
    }

    if (timeToKill > waveDuration) {
      warnings.push(
        `❌ Wave ${wave}: IMPOSSIBLE! Time to kill (${timeToKill.toFixed(1)}s) exceeds wave duration (${waveDuration.toFixed(1)}s)`
      );
    }

    // Check if wave is too easy
    if (timeToKill < waveDuration * 0.3) {
      warnings.push(
        `ℹ️ Wave ${wave}: Too easy? Time to kill (${timeToKill.toFixed(1)}s) is much less than wave duration (${waveDuration.toFixed(1)}s)`
      );
    }

    return warnings;
  },

  /**
   * Generate a balance report for multiple waves
   */
  generateBalanceReport(startWave: number = 1, endWave: number = 10): string {
    let report = '=== WAVE BALANCE REPORT ===\n\n';

    for (let wave = startWave; wave <= endWave; wave++) {
      const zombieCount = this.calculateZombieCount(wave);
      const zombieHealth = this.calculateZombieHealth(wave);
      const totalHP = this.calculateTotalWaveHP(wave);
      const playerDPS = this.calculateExpectedPlayerDPS(wave);
      const timeToKill = this.calculateTimeToKillWave(wave);
      const waveDuration = this.calculateWaveDuration(wave) / 1000;
      const spawnInterval = this.calculateSpawnInterval(wave);
      const reward = this.calculateWaveReward(wave);

      report += `Wave ${wave}:\n`;
      report += `  Zombies: ${zombieCount} × ${zombieHealth}hp = ${totalHP} total HP\n`;
      report += `  Spawn Interval: ${spawnInterval}ms\n`;
      report += `  Expected Player DPS: ${playerDPS.toFixed(1)}\n`;
      report += `  Time to Kill: ${timeToKill.toFixed(1)}s / ${waveDuration.toFixed(1)}s (${((timeToKill / waveDuration) * 100).toFixed(1)}%)\n`;
      report += `  Reward: $${reward}\n`;

      const warnings = this.validateWaveBalance(wave);
      if (warnings.length > 0) {
        report += `  ${warnings.join('\n  ')}\n`;
      }

      report += '\n';
    }

    return report;
  },

  /**
   * Update balance configuration
   */
  updateConfig(newConfig: Partial<WaveBalanceConfig>): void {
    this.config = { ...this.config, ...newConfig };
  },

  /**
   * Reset to default configuration
   */
  resetConfig(): void {
    this.config = {
      baseZombieHealth: 100,
      baseZombieCount: 5,
      baseSpawnInterval: 2000,
      healthScaling: 1.2,
      countScaling: 2,
      spawnRateScaling: 0.95,
      expectedTowersPerWave: 0.5,
      expectedUpgradeLevelPerWave: 0.3,
      difficultyMultiplier: 1.0,
    };
  },
};

// Export helper function for console testing
export function printWaveBalance(startWave: number = 1, endWave: number = 10): void {
  console.log(WaveBalancing.generateBalanceReport(startWave, endWave));
}
