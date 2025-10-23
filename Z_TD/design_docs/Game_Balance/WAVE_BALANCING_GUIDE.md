# Wave Balancing Guide

## Quick Start

### In Browser Console:

```javascript
// Load balancing tools
waveBalance();

// Print balance report for waves 1-10
printWaveBalance(1, 10);

// Print specific wave range
printWaveBalance(5, 15);

// Adjust difficulty
WaveBalancing.updateConfig({ difficultyMultiplier: 1.5 }); // 50% harder
printWaveBalance(1, 10); // See new balance

// Test specific calculations
WaveBalancing.calculateZombieHealth(5); // Health for wave 5
WaveBalancing.calculateZombieCount(5); // Zombie count for wave 5
WaveBalancing.calculateExpectedPlayerDPS(5); // Expected player damage
```

## Understanding the Balance Report

```
Wave 5:
  Zombies: 13 × 207hp = 2691 total HP
  Spawn Interval: 1638ms
  Expected Player DPS: 300.0
  Time to Kill: 9.0s / 36.3s (24.7%)
  Reward: $100
```

**What this means:**

- **Zombies**: 13 zombies with 207 HP each = 2,691 total HP to kill
- **Spawn Interval**: Zombies spawn every 1.6 seconds
- **Expected Player DPS**: Player should have ~300 DPS by wave 5
- **Time to Kill**: 9 seconds to kill all zombies / 36 seconds total wave duration
  - **24.7%** means player uses 25% of wave time to kill zombies (comfortable)
  - **< 30%** = Easy (player has lots of time)
  - **30-60%** = Balanced (good challenge)
  - **60-90%** = Hard (tight timing)
  - **> 90%** = Very Hard/Impossible

## Balance Configuration

Edit values in `src/config/waveBalancing.ts`:

```typescript
config: {
  baseZombieHealth: 100,        // Starting zombie HP
  baseZombieCount: 5,            // Starting zombie count
  baseSpawnInterval: 2000,       // Starting spawn rate (ms)

  healthScaling: 1.2,            // HP multiplier per wave (1.2 = +20%)
  countScaling: 2,               // Additional zombies per wave
  spawnRateScaling: 0.95,        // Spawn speed multiplier (0.95 = 5% faster)

  expectedTowersPerWave: 0.5,    // Towers player gains per wave
  expectedUpgradeLevelPerWave: 0.3, // Upgrade levels per wave

  difficultyMultiplier: 1.0,     // Overall difficulty (1.5 = 50% harder)
}
```

## Balancing Tips

### Making Waves Easier:

```javascript
WaveBalancing.updateConfig({
  healthScaling: 1.15, // Slower HP growth
  countScaling: 1.5, // Fewer zombies per wave
  difficultyMultiplier: 0.8, // 20% easier overall
});
```

### Making Waves Harder:

```javascript
WaveBalancing.updateConfig({
  healthScaling: 1.25, // Faster HP growth
  countScaling: 3, // More zombies per wave
  spawnRateScaling: 0.9, // Faster spawns
  difficultyMultiplier: 1.3, // 30% harder overall
});
```

### Adjusting Difficulty Curve:

```javascript
// Early game easier, late game harder
WaveBalancing.updateConfig({
  healthScaling: 1.15, // Slow start
  countScaling: 2.5, // Ramps up
});

// Consistent difficulty
WaveBalancing.updateConfig({
  healthScaling: 1.18, // Steady growth
  countScaling: 2, // Linear growth
});
```

## Validation Warnings

The system automatically checks for balance issues:

- **⚠️ Very tight!** - Wave is challenging but beatable
- **❌ IMPOSSIBLE!** - Wave cannot be beaten with expected DPS
- **ℹ️ Too easy?** - Wave might be boring

## Testing Workflow

1. **Start game** and open console
2. **Load tools**: `waveBalance()`
3. **Check balance**: `printWaveBalance(1, 20)`
4. **Adjust config** if needed
5. **Re-check**: `printWaveBalance(1, 20)`
6. **Copy config** to `waveBalancing.ts` when satisfied

## Formula Explanations

### Zombie Health

```
health = baseHealth × (healthScaling ^ (wave - 1)) × typeMultiplier × difficulty
```

### Zombie Count

```
count = baseCount + (wave - 1) × countScaling + floor(wave / 5) × 2
```

### Expected Player DPS

```
towers = 1 + wave × expectedTowersPerWave
upgrades = floor(wave × expectedUpgradeLevelPerWave)
damage = baseDamage × (1 + upgrades × 0.5)
DPS = towers × damage × fireRate
```

### Time to Kill

```
totalHP = zombieCount × zombieHealth
timeToKill = totalHP / playerDPS
```

## Example: Balancing Wave 10

```javascript
waveBalance();

// Check current balance
printWaveBalance(10, 10);
// Output: Time to Kill: 45.2s / 52.1s (86.8%) ⚠️ Very tight!

// Make it easier
WaveBalancing.updateConfig({ healthScaling: 1.18 });
printWaveBalance(10, 10);
// Output: Time to Kill: 38.1s / 52.1s (73.1%) ✓ Balanced

// Save to config file
// Copy the healthScaling: 1.18 to waveBalancing.ts
```

## Integration with WaveManager

The WaveManager currently uses manual wave definitions. To use the balancing formulas:

1. Use `WaveBalancing.calculateZombieHealth(wave)` for HP
2. Use `WaveBalancing.calculateZombieCount(wave)` for count
3. Use `WaveBalancing.calculateSpawnInterval(wave)` for spawn rate

This gives you mathematical balance instead of manual tuning!
