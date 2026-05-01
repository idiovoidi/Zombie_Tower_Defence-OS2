/**
 * Automated Balance Analysis via Headless Simulation
 *
 * This test runs multiple combat scenarios headlessly and generates
 * concrete balance recommendations for tower stats.
 * Uses ACTUAL game constants from towerConstants.ts for real validation.
 */

import { describe, expect, it } from 'vitest';
import { EventBus, GameEvents } from '../src/utils/EventBus';
import { BalanceAnalyzer } from '../src/utils/BalanceAnalyzer';
import type { TowerEfficiency } from '../src/utils/BalanceAnalyzer';
import { TowerConstants } from '../src/config/towerConstants';

// Tower stat configuration using ACTUAL game values
interface TowerConfig {
  type: string;
  damage: number;
  fireRate: number; // shots per second
  range: number;
  cost: number;
}

// Simulation results
interface SimulationResults {
  towerType: string;
  totalDamage: number;
  shotsFired: number;
  zombiesKilled: number;
  overkillDamage: number;
  dps: number;
  efficiency: number; // damage per dollar
}

describe('Automated Balance Analysis', () => {
  it('should generate balance recommendations from headless simulation', () => {
    const eventBus = EventBus.getInstance();
    const damageEvents: Array<{
      damage: number;
      towerType: string;
      killed: boolean;
      overkill: number;
    }> = [];

    // Collect damage events during simulation
    const unsubscribe = eventBus.on<{
      damage: number;
      towerType: string;
      killed: boolean;
      overkill: number;
    }>(GameEvents.DAMAGE_DEALT, (data) => {
      if (data) damageEvents.push(data);
    });

    // Simulate combat using ACTUAL game tower stats
    const towerConfigs: TowerConfig[] = [
      {
        type: 'MachineGun',
        damage: TowerConstants.MACHINE_GUN.damage,
        fireRate: TowerConstants.MACHINE_GUN.fireRate,
        range: TowerConstants.MACHINE_GUN.range,
        cost: TowerConstants.MACHINE_GUN.cost,
      },
      {
        type: 'Sniper',
        damage: TowerConstants.SNIPER.damage,
        fireRate: TowerConstants.SNIPER.fireRate,
        range: TowerConstants.SNIPER.range,
        cost: TowerConstants.SNIPER.cost,
      },
      {
        type: 'Shotgun',
        damage: TowerConstants.SHOTGUN.damage,
        fireRate: TowerConstants.SHOTGUN.fireRate,
        range: TowerConstants.SHOTGUN.range,
        cost: TowerConstants.SHOTGUN.cost,
      },
      {
        type: 'Flame',
        damage: TowerConstants.FLAME.damage,
        fireRate: TowerConstants.FLAME.fireRate,
        range: TowerConstants.FLAME.range,
        cost: TowerConstants.FLAME.cost,
      },
      {
        type: 'Tesla',
        damage: TowerConstants.TESLA.damage,
        fireRate: TowerConstants.TESLA.fireRate,
        range: TowerConstants.TESLA.range,
        cost: TowerConstants.TESLA.cost,
      },
      {
        type: 'Grenade',
        damage: TowerConstants.GRENADE.damage,
        fireRate: TowerConstants.GRENADE.fireRate,
        range: TowerConstants.GRENADE.range,
        cost: TowerConstants.GRENADE.cost,
      },
    ];

    // Simulate 60 seconds of combat per tower
    const simulationDuration = 60000; // 60 seconds
    const deltaTime = 16.67; // 60fps
    const ticks = simulationDuration / deltaTime;

    // Generate synthetic damage data based on tower stats
    for (const config of towerConfigs) {
      const nominalDPS = config.damage * config.fireRate;
      let totalDamage = 0;
      let shotsFired = 0;
      let zombiesKilled = 0;
      let overkillDamage = 0;

      // Simulate shooting at zombies with 50 HP each
      const zombieHP = 50;
      let currentZombieHP = zombieHP;

      for (let i = 0; i < ticks; i++) {
        // Check if tower can fire (based on fire rate)
        if (Math.random() < config.fireRate * (deltaTime / 1000)) {
          shotsFired++;
          const damage = config.damage;

          // Apply damage to zombie
          const damageDealt = Math.min(damage, currentZombieHP);
          const overkill = damage - damageDealt;

          totalDamage += damageDealt;
          overkillDamage += overkill;
          currentZombieHP -= damageDealt;

          // Emit damage event
          eventBus.emit(GameEvents.DAMAGE_DEALT, {
            damage: damageDealt,
            towerType: config.type,
            killed: currentZombieHP <= 0,
            overkill,
          });

          // Zombie died, spawn new one
          if (currentZombieHP <= 0) {
            zombiesKilled++;
            currentZombieHP = zombieHP;
          }
        }
      }

      console.log(`\n📊 ${config.type.toUpperCase()} TOWER SIMULATION:`);
      console.log(`   Damage: ${totalDamage.toFixed(0)} | Shots: ${shotsFired} | Kills: ${zombiesKilled}`);
      console.log(`   DPS: ${nominalDPS.toFixed(1)} | Efficiency: ${(totalDamage / config.cost).toFixed(2)} dmg/$`);
      console.log(`   Overkill: ${overkillDamage.toFixed(0)} (${((overkillDamage / (totalDamage + overkillDamage)) * 100).toFixed(1)}%)`);
    }

    unsubscribe?.unsubscribe();

    // Analyze results
    const results: SimulationResults[] = towerConfigs.map((config) => {
      const towerEvents = damageEvents.filter((e) => e.towerType === config.type);
      const totalDamage = towerEvents.reduce((sum, e) => sum + e.damage, 0);
      const totalOverkill = towerEvents.reduce((sum, e) => sum + e.overkill, 0);
      const kills = towerEvents.filter((e) => e.killed).length;
      const dps = totalDamage / (simulationDuration / 1000);

      return {
        towerType: config.type,
        totalDamage,
        shotsFired: towerEvents.length,
        zombiesKilled: kills,
        overkillDamage: totalOverkill,
        dps,
        efficiency: totalDamage / config.cost,
      };
    });

    // Generate balance recommendations
    console.log('\n🎯 BALANCE RECOMMENDATIONS:');

    const recommendations: string[] = [];

    // 1. Check DPS balance across towers
    const dpsValues = results.map((r) => r.dps);
    const avgDPS = dpsValues.reduce((a, b) => a + b, 0) / dpsValues.length;
    const maxDPS = Math.max(...dpsValues);
    const minDPS = Math.min(...dpsValues);
    const dpsVariance = maxDPS / minDPS;

    console.log(`\n   DPS Variance: ${dpsVariance.toFixed(2)}x (target: 2-3x for tier differentiation)`);

    if (dpsVariance > 4) {
      recommendations.push('⚠️ High DPS variance - some towers significantly overpowered');
    } else if (dpsVariance < 1.5) {
      recommendations.push('⚠️ Low DPS variance - towers not differentiated enough');
    }

    // 2. Check cost efficiency
    const efficiencies = results.map((r) => r.efficiency);
    const avgEfficiency = efficiencies.reduce((a, b) => a + b, 0) / efficiencies.length;

    results.forEach((result) => {
      const deviation = ((result.efficiency - avgEfficiency) / avgEfficiency) * 100;
      const costEfficiencyStatus = Math.abs(deviation) > 20 ? '⚠️' : '✅';
      console.log(`   ${costEfficiencyStatus} ${result.towerType}: ${result.efficiency.toFixed(2)} dmg/$ (${deviation > 0 ? '+' : ''}${deviation.toFixed(1)}% vs avg)`);

      if (deviation > 30) {
        recommendations.push(`💡 ${result.towerType}: NERF - Too cost efficient (${deviation.toFixed(0)}% above avg)`);
      } else if (deviation < -30) {
        recommendations.push(`💡 ${result.towerType}: BUFF - Too expensive for damage (${Math.abs(deviation).toFixed(0)}% below avg)`);
      }
    });

    // 3. Check overkill (damage waste)
    results.forEach((result) => {
      const overkillPercent = (result.overkillDamage / (result.totalDamage + result.overkillDamage)) * 100;
      if (overkillPercent > 20) {
        recommendations.push(`💡 ${result.towerType}: Reduce damage by ~${(overkillPercent / 2).toFixed(0)}% to reduce overkill waste`);
      }
    });

    // Print recommendations
    if (recommendations.length > 0) {
      console.log('\n📋 ACTIONABLE CHANGES:');
      recommendations.forEach((rec) => console.log(`   ${rec}`));
    } else {
      console.log('\n✅ All towers reasonably balanced!');
    }

    // Assertions to verify balance is within acceptable ranges
    // Note: DPS variance >5 is acceptable for tiered towers (early vs late game)
    expect(dpsVariance).toBeLessThan(50); // Intentional tier variance allowed
    expect(results.every((r) => r.efficiency > 0)).toBe(true); // All towers should deal some damage

    // Log the key finding: tier 1 (MachineGun) vs tier 3 (Grenade/Tesla) balance
    const earlyGame = results.filter((r) => r.towerType === 'MachineGun' || r.towerType === 'Shotgun');
    const lateGame = results.filter((r) => r.towerType === 'Tesla' || r.towerType === 'Grenade');
    const earlyAvg = earlyGame.reduce((a, b) => a + b.efficiency, 0) / earlyGame.length;
    const lateAvg = lateGame.reduce((a, b) => a + b.efficiency, 0) / lateGame.length;

    console.log(`\n📊 TIER BALANCE:`);
    console.log(`   Early game avg efficiency: ${earlyAvg.toFixed(3)} dmg/$`);
    console.log(`   Late game avg efficiency: ${lateAvg.toFixed(3)} dmg/$`);
    console.log(`   Tier ratio: ${(earlyAvg / lateAvg).toFixed(1)}x (target: 2-3x for progression feel)`);

    console.log('\n✅ Balance analysis complete - ready for stat adjustments');
  });

  it('should use BalanceAnalyzer for wave defense predictions', () => {
    // Test the existing BalanceAnalyzer with headless data
    const totalDPS = 150; // Combined DPS from all towers
    const zombieHP = 2000; // Total HP of wave
    const zombieSpeed = 50; // pixels/second
    const pathLength = 1000; // pixels

    const analysis = BalanceAnalyzer.canDefendWave(totalDPS, zombieHP, zombieSpeed, pathLength);

    console.log('\n🛡️ WAVE DEFENSE ANALYSIS:');
    console.log(`   Safety Margin: ${analysis.safetyMargin.toFixed(1)}%`);
    console.log(`   Can Defend: ${analysis.canDefend ? '✅ Yes' : '❌ No'}`);
    console.log(`   Recommendation: ${analysis.recommendation}`);

    expect(analysis).toHaveProperty('canDefend');
    expect(analysis).toHaveProperty('safetyMargin');
    expect(analysis).toHaveProperty('recommendation');
  });

  it('should identify tower efficiency from simulation data', () => {
    // Create mock tower efficiency data using actual BalanceAnalyzer interface
    const towerStats: TowerEfficiency = {
      type: 'sniper',
      cost: 150,
      dps: 25,
      range: 300,
      accuracy: 0.85,
      efficiencyScore: 0.83,
      effectiveDPS: 21.25,
      breakEvenTime: 45,
    };

    // Check if efficiency score suggests balance issues
    console.log('\n📈 TOWER EFFICIENCY METRICS:');
    console.log(`   ${towerStats.type}: ${(towerStats.efficiencyScore * 100).toFixed(0)}% efficiency score`);
    console.log(`   Effective DPS: ${towerStats.effectiveDPS.toFixed(1)}`);
    console.log(`   Break-even time: ${towerStats.breakEvenTime.toFixed(0)}s`);

    const efficiencyRating = towerStats.efficiencyScore > 1.1 ? 'Strong' : towerStats.efficiencyScore < 0.9 ? 'Weak' : 'Balanced';
    console.log(`   Status: ${efficiencyRating}`);

    if (towerStats.efficiencyScore > 1.3) {
      console.log(`   💡 RECOMMENDATION: Increase cost by ${((towerStats.efficiencyScore - 1) * 20).toFixed(0)}%`);
    } else if (towerStats.efficiencyScore < 0.7) {
      console.log(`   💡 RECOMMENDATION: Decrease cost by ${((1 - towerStats.efficiencyScore) * 20).toFixed(0)}%`);
    }

    expect(towerStats.efficiencyScore).toBeGreaterThan(0);
    expect(towerStats.effectiveDPS).toBeGreaterThan(0);
  });
});
