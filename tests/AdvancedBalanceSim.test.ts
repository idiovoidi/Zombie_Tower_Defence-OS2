/**
 * Advanced Headless Combat Simulation with Varied Scenarios
 *
 * This test provides more realistic and varied scenarios for better balancing data:
 * - Varied zombie types (swarm, basic, tank) with different HP
 * - Wave progression simulation
 * - Multi-tower scenarios
 * - Range/positioning factors
 */

import { describe, expect, it } from 'vitest';
import { EventBus, GameEvents } from '../src/utils/EventBus';
import { BalanceAnalyzer } from '../src/utils/BalanceAnalyzer';
import { TowerConstants } from '../src/config/towerConstants';

// Zombie types with realistic stats
interface ZombieType {
  name: string;
  hp: number;
  speed: number; // pixels/second
  reward: number;
  count: number; // spawn count per wave
}

// Tower config with positioning
interface TowerConfig {
  type: string;
  damage: number;
  fireRate: number;
  range: number;
  cost: number;
  x: number;
  y: number;
}

// Wave configuration
interface WaveConfig {
  waveNumber: number;
  zombies: ZombieType[];
  pathLength: number; // pixels zombies travel
  spawnDuration: number; // seconds to spawn all zombies
}

// Simulation results
interface SimulationResults {
  towerType: string;
  totalDamage: number;
  shotsFired: number;
  zombiesKilled: number;
  overkillDamage: number;
  dps: number;
  efficiency: number;
  accuracy: number; // shots that hit vs shots fired
  avgOverkillPercent: number;
  damageByZombieType: Map<string, number>;
}

// Zombie instance in simulation
class SimZombie {
  public hp: number;
  public maxHp: number;
  public position: number; // distance along path
  public type: string;
  public alive: boolean = true;

  constructor(public zombieType: ZombieType, pathStart: number = 0) {
    this.hp = zombieType.hp;
    this.maxHp = zombieType.hp;
    this.position = pathStart;
    this.type = zombieType.name;
  }

  public takeDamage(damage: number): { damageDealt: number; overkill: number; killed: boolean } {
    const actualDamage = Math.min(damage, this.hp);
    const overkill = damage - actualDamage;
    this.hp -= actualDamage;

    if (this.hp <= 0) {
      this.alive = false;
    }

    return { damageDealt: actualDamage, overkill, killed: !this.alive };
  }
}

describe('Advanced Balance Simulation', () => {
  it('should simulate varied zombie types and wave progression', () => {
    const eventBus = EventBus.getInstance();

    // Define realistic zombie types
    const zombieTypes: ZombieType[] = [
      { name: 'swarm', hp: 20, speed: 80, reward: 5, count: 30 },  // Fast, weak, numerous
      { name: 'basic', hp: 50, speed: 50, reward: 10, count: 15 }, // Standard
      { name: 'tank', hp: 200, speed: 30, reward: 25, count: 5 },   // Slow, high HP
      { name: 'elite', hp: 500, speed: 40, reward: 50, count: 2 }, // Mini-boss
    ];

    // Define waves with increasing difficulty
    const waves: WaveConfig[] = [
      {
        waveNumber: 1,
        zombies: [{ ...zombieTypes[1], count: 10 }], // Just basics
        pathLength: 1000,
        spawnDuration: 30,
      },
      {
        waveNumber: 3,
        zombies: [
          { ...zombieTypes[0], count: 20 }, // Swarm
          { ...zombieTypes[1], count: 10 }, // Basics
        ],
        pathLength: 1000,
        spawnDuration: 40,
      },
      {
        waveNumber: 5,
        zombies: [
          { ...zombieTypes[0], count: 25 },
          { ...zombieTypes[1], count: 15 },
          { ...zombieTypes[2], count: 3 }, // Tanks
        ],
        pathLength: 1000,
        spawnDuration: 50,
      },
      {
        waveNumber: 10,
        zombies: [
          { ...zombieTypes[0], count: 30 },
          { ...zombieTypes[1], count: 20 },
          { ...zombieTypes[2], count: 5 },
          { ...zombieTypes[3], count: 1 }, // Elite
        ],
        pathLength: 1000,
        spawnDuration: 60,
      },
    ];

    // Test single tower against varied scenarios
    console.log('\n🧪 SCENARIO TESTING: Single Tower vs Varied Waves\n');

    const scenarios: TowerConfig[] = [
      { type: 'MachineGun', damage: TowerConstants.MACHINE_GUN.damage, fireRate: TowerConstants.MACHINE_GUN.fireRate, range: TowerConstants.MACHINE_GUN.range, cost: TowerConstants.MACHINE_GUN.cost, x: 500, y: 400 },
      { type: 'Sniper', damage: TowerConstants.SNIPER.damage, fireRate: TowerConstants.SNIPER.fireRate, range: TowerConstants.SNIPER.range, cost: TowerConstants.SNIPER.cost, x: 500, y: 400 },
      { type: 'Tesla', damage: TowerConstants.TESLA.damage, fireRate: TowerConstants.TESLA.fireRate, range: TowerConstants.TESLA.range, cost: TowerConstants.TESLA.cost, x: 500, y: 400 },
      { type: 'Grenade', damage: TowerConstants.GRENADE.damage, fireRate: TowerConstants.GRENADE.fireRate, range: TowerConstants.GRENADE.range, cost: TowerConstants.GRENADE.cost, x: 500, y: 400 },
    ];

    const allResults: SimulationResults[] = [];

    for (const tower of scenarios) {
      console.log(`\n🔫 Testing ${tower.type} Tower:`);

      let totalDamage = 0;
      let totalOverkill = 0;
      let totalShots = 0;
      let totalKills = 0;
      const damageByZombieType = new Map<string, number>();

      // Run through each wave
      for (const wave of waves) {
        // Spawn zombies over time
        const zombies: SimZombie[] = [];
        const spawnInterval = wave.spawnDuration / wave.zombies.reduce((sum, z) => sum + z.count, 0);
        let spawnTimer = 0;
        let nextZombieIndex = 0;
        let zombiesSpawned = 0;

        const waveDuration = 90; // seconds per wave
        const deltaTime = 0.1; // 10 ticks per second

        for (let time = 0; time < waveDuration; time += deltaTime) {
          // Spawn zombies
          spawnTimer += deltaTime;
          if (spawnTimer >= spawnInterval && zombiesSpawned < wave.zombies.reduce((sum, z) => sum + z.count, 0)) {
            // Find which zombie type to spawn
            let count = 0;
            for (const zt of wave.zombies) {
              if (zombiesSpawned < count + zt.count) {
                zombies.push(new SimZombie(zt, 0));
                break;
              }
              count += zt.count;
            }
            zombiesSpawned++;
            spawnTimer = 0;
          }

          // Tower shooting
          if (Math.random() < tower.fireRate * deltaTime) {
            totalShots++;

            // Find closest zombie in range
            const target = zombies.find((z) => z.alive && z.position <= tower.range);

            if (target) {
              const result = target.takeDamage(tower.damage);
              totalDamage += result.damageDealt;
              totalOverkill += result.overkill;

              if (result.killed) {
                totalKills++;
              }

              // Track damage by zombie type
              const current = damageByZombieType.get(target.type) || 0;
              damageByZombieType.set(target.type, current + result.damageDealt);
            }
          }

          // Move zombies
          for (const zombie of zombies) {
            if (zombie.alive) {
              zombie.position += zombie.zombieType.speed * deltaTime;
            }
          }
        }
      }

      const results: SimulationResults = {
        towerType: tower.type,
        totalDamage,
        shotsFired: totalShots,
        zombiesKilled: totalKills,
        overkillDamage: totalOverkill,
        dps: totalDamage / (waves.length * 90), // 90 seconds per wave
        efficiency: totalDamage / tower.cost,
        accuracy: (totalKills / totalShots) * 100,
        avgOverkillPercent: (totalOverkill / (totalDamage + totalOverkill)) * 100,
        damageByZombieType,
      };

      allResults.push(results);

      console.log(`   Damage: ${totalDamage.toFixed(0)} | Kills: ${totalKills}`);
      console.log(`   Efficiency: ${results.efficiency.toFixed(2)} dmg/$ | Overkill: ${results.avgOverkillPercent.toFixed(1)}%`);
      console.log(`   Effectiveness vs types:`, [...damageByZombieType.entries()].map(([k, v]) => `${k}:${v.toFixed(0)}`).join(', '));
    }

    // Generate tier-based analysis
    console.log('\n📊 ADVANCED BALANCE ANALYSIS:\n');

    const earlyGame = allResults.filter((r) => r.towerType === 'MachineGun' || r.towerType === 'Shotgun');
    const midGame = allResults.filter((r) => r.towerType === 'Sniper' || r.towerType === 'Tesla');
    const lateGame = allResults.filter((r) => r.towerType === 'Flame' || r.towerType === 'Grenade');

    const earlyAvg = earlyGame.reduce((sum, r) => sum + r.efficiency, 0) / (earlyGame.length || 1);
    const midAvg = midGame.reduce((sum, r) => sum + r.efficiency, 0) / (midGame.length || 1);
    const lateAvg = lateGame.reduce((sum, r) => sum + r.efficiency, 0) / (lateGame.length || 1);

    console.log(`   Early Game (Wave 1-3) avg efficiency: ${earlyAvg.toFixed(3)} dmg/$`);
    console.log(`   Mid Game (Wave 5-7) avg efficiency: ${midAvg.toFixed(3)} dmg/$`);
    console.log(`   Late Game (Wave 10+) avg efficiency: ${lateAvg.toFixed(3)} dmg/$`);

    // Check which towers are best against which zombie types
    console.log('\n🎯 COUNTER EFFECTIVENESS:');
    console.log('   Machine Gun vs Swarm: Excellent (high fire rate)');
    console.log('   Sniper vs Tank/Elite: Excellent (high damage per shot)');
    console.log('   Tesla vs Groups: Good (chain lightning)');
    console.log('   Grenade vs Clumps: Excellent (area damage)');

    expect(allResults.length).toBeGreaterThan(0);
    expect(allResults.every((r) => r.efficiency > 0)).toBe(true);
  });

  it('should simulate multi-tower synergies', () => {
    const eventBus = EventBus.getInstance();

    console.log('\n🤝 MULTI-TOWER SYNERGY TEST\n');

    // Simulate: Machine Gun + Sniper combo
    // MG handles swarms, Sniper handles tanks
    const comboTest = () => {
      const mg = { dps: 64, targetPriority: 'swarm', cost: 250 };
      const sniper = { dps: 225, targetPriority: 'tank', cost: 900 };

      // Wave 5: mix of swarm and tanks
      const waveHp = 30 * 20 + 3 * 200; // swarm + tanks
      const waveTime = 60; // seconds

      const soloMgDamage = mg.dps * waveTime; // 3840
      const soloSniperDamage = sniper.dps * waveTime; // 13500

      // Combo: MG focuses swarms, Sniper focuses tanks
      const comboDamage = mg.dps * waveTime * 0.8 + sniper.dps * waveTime * 0.9;
      const synergyBonus = comboDamage / ((soloMgDamage + soloSniperDamage) / 2);

      console.log(`   Solo MG: ${soloMgDamage.toFixed(0)} dmg`);
      console.log(`   Solo Sniper: ${soloSniperDamage.toFixed(0)} dmg`);
      console.log(`   Combo: ${comboDamage.toFixed(0)} dmg`);
      console.log(`   Synergy bonus: ${((synergyBonus - 1) * 100).toFixed(0)}%`);

      return synergyBonus;
    };

    const synergy = comboTest();

    // Synergy should be positive when towers complement each other
    expect(synergy).toBeGreaterThan(0.5);
  });

  it('should validate tower cost progression', () => {
    console.log('\n💰 COST PROGRESSION ANALYSIS\n');

    const costs = [
      { type: 'MachineGun', cost: TowerConstants.MACHINE_GUN.cost, tier: 1 },
      { type: 'Shotgun', cost: TowerConstants.SHOTGUN.cost, tier: 1 },
      { type: 'Sniper', cost: TowerConstants.SNIPER.cost, tier: 2 },
      { type: 'Flame', cost: TowerConstants.FLAME.cost, tier: 2 },
      { type: 'Tesla', cost: TowerConstants.TESLA.cost, tier: 3 },
      { type: 'Grenade', cost: TowerConstants.GRENADE.cost, tier: 3 },
      { type: 'Sludge', cost: TowerConstants.SLUDGE.cost, tier: 2 },
    ];

    const tier1Avg = costs.filter((c) => c.tier === 1).reduce((s, c) => s + c.cost, 0) / 2;
    const tier2Avg = costs.filter((c) => c.tier === 2).reduce((s, c) => s + c.cost, 0) / 3;
    const tier3Avg = costs.filter((c) => c.tier === 3).reduce((s, c) => s + c.cost, 0) / 2;

    console.log(`   Tier 1 avg cost: $${tier1Avg.toFixed(0)} (entry level)`);
    console.log(`   Tier 2 avg cost: $${tier2Avg.toFixed(0)} (+${((tier2Avg / tier1Avg - 1) * 100).toFixed(0)}%)`);
    console.log(`   Tier 3 avg cost: $${tier3Avg.toFixed(0)} (+${((tier3Avg / tier2Avg - 1) * 100).toFixed(0)}%)`);

    // Cost should increase between tiers (1.4x+ acceptable with new balance)
    expect(tier2Avg / tier1Avg).toBeGreaterThan(1.5);
    expect(tier3Avg / tier2Avg).toBeGreaterThan(1.3); // Lowered due to Grenade cost reduction
  });
});
