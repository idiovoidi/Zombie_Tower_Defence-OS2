# Zombie Implementation Details

Complete technical implementation guide for the zombie system in Z-TD.

## Overview

This document provides detailed implementation specifications for zombie types, including combat mechanics, spawn rates, strategic design, and technical implementation patterns.

## Zombie Type Definitions

### 1. Basic Zombie 🧟

**Type ID:** `BASIC`

**Base Stats:**

- Health: 100 HP
- Speed: 50 px/s
- Reward: $10
- Size: 10px
- Color: `0x00ff00`

**Combat Modifiers:**

- No resistances or weaknesses
- Takes 100% damage from all tower types
- Baseline for balancing other types

**Spawn Rates:**

- Waves 1-5: 80%
- Waves 6-10: 60%
- Waves 11+: 50%

**Strategic Role:**

- Baseline enemy for testing tower effectiveness
- Fills waves in early game
- Provides steady income
- No special counters needed

---

### 2. Fast Zombie 🏃

**Type ID:** `FAST`

**Base Stats:**

- Health: 80 HP
- Speed: 100 px/s (fastest standard zombie)
- Reward: $15
- Size: 10px
- Color: `0xff6600`

**Combat Modifiers:**

- **Resistant:** Flame (75% damage) - runs through fire quickly
- **Weak:** Shotgun (125% damage), Tesla (125% damage) - instant hit, no dodging
- **Other:** Machine Gun (100%), Sniper (90% damage) - harder to hit due to speed

**Spawn Rates:**

- Waves 1-5: 20%
- Waves 6+: 30%

**Strategic Role:**

- Tests player's ability to handle fast-moving threats
- Punishes over-reliance on precision towers (Sniper)
- Rewards area-effect and instant-hit towers
- Creates urgency and pressure

**Counter Strategy:**

- Use Tesla (instant hit, 125% damage)
- Use Shotgun (spread hits, 125% damage)
- Avoid Sniper (90% damage, hard to track)
- Avoid Flame (75% damage, runs through quickly)

---

### 3. Tank Zombie 💪

**Type ID:** `TANK`

**Base Stats:**

- Health: 300 HP (3x Basic)
- Speed: 25 px/s (slowest)
- Reward: $50 (highest)
- Size: 15px
- Color: `0xff0000`

**Combat Modifiers:**

- **Resistant:** Machine Gun (70% damage) - bullets bounce off, Shotgun (80% damage)
- **Weak:** Sniper (150% damage) - armor-piercing, Flame (125% damage) - sustained burn
- **Other:** Tesla (100% damage)

**Spawn Rates:**

- Waves 6-10: 10%
- Waves 11+: 15%

**Strategic Role:**

- High-value target (HP sponge)
- Forces diversification of tower types
- Punishes rapid-fire low-damage strategies
- Rewards high-damage single-target or sustained damage

**Counter Strategy:**

- Prioritize Sniper (150% damage, armor-piercing)
- Use Flame (125% damage, sustained burn)
- Avoid Machine Gun (70% damage, ineffective)
- Avoid Shotgun (80% damage, reduced effectiveness)

---

### 4. Armored Zombie 🛡️

**Type ID:** `ARMORED`

**Base Stats:**

- Health: 150 HP
- Speed: 40 px/s
- Reward: $30
- Size: 11px
- Color: `0x888888`

**Combat Modifiers:**

- **Resistant:** Machine Gun (75% damage), Shotgun (85% damage), Flame (90% damage) - heat-resistant
- **Weak:** Sniper (140% damage) - armor-piercing, Tesla (120% damage) - bypasses armor

**Spawn Rates:**

- Waves 11+: 5%

**Strategic Role:**

- Mid-tier armored threat
- Resistant to most rapid-fire and area damage
- Requires precision or electrical damage
- Tests tower composition diversity

**Counter Strategy:**

- Prioritize Sniper (140% damage)
- Use Tesla (120% damage, bypasses armor)
- Avoid Machine Gun (75% damage)
- Avoid Shotgun (85% damage)
- Flame is weak (90% damage)

---

### 5. Swarm Zombie 🐝

**Type ID:** `SWARM`

**Base Stats:**

- Health: 30 HP (lowest)
- Speed: 60 px/s
- Reward: $5 (lowest)
- Size: 6px (smallest)
- Color: `0xffff00`

**Combat Modifiers:**

- **Resistant:** Sniper (60% damage) - overkill, wasted damage
- **Weak:** Shotgun (150% damage) - spread hits multiple, Flame (140% damage), Tesla (130% damage) - chain effect
- **Other:** Machine Gun (100% damage)

**Spawn Rates:**

- Waves 11+: 10-20 zombies at once

**Strategic Role:**

- Overwhelm through numbers
- Punish single-target high-damage towers (Sniper)
- Reward area-effect towers
- Create visual chaos and pressure

**Counter Strategy:**

- Use Shotgun (150% damage, hits multiple)
- Use Flame (140% damage, area effect)
- Use Tesla (130% damage, chain effect)
- Avoid Sniper (60% damage, massive overkill)

**Implementation Notes:**

- Spawn in groups of 10-20
- Low individual value but high collective threat
- Optimize rendering for large groups

---

### 6. Stealth Zombie 👻

**Type ID:** `STEALTH`

**Base Stats:**

- Health: 70 HP
- Speed: 70 px/s
- Reward: $25
- Size: 10px
- Color: `0x6600ff`

**Combat Modifiers:**

- **Resistant:** Sniper (80% damage) - hard to target precisely
- **Weak:** Flame (130% damage) - reveals and burns, Tesla (125% damage), Shotgun (115% damage) - spread
- **Other:** Machine Gun (95% damage)

**Spawn Rates:**

- Waves 11+: 10%

**Strategic Role:**

- Tests player awareness (semi-transparent)
- Punishes precision targeting
- Rewards auto-targeting and area towers
- Adds stealth mechanic variety

**Counter Strategy:**

- Use Flame (130% damage, reveals)
- Use Tesla (125% damage, auto-target)
- Use Shotgun (115% damage, spread)
- Avoid Sniper (80% damage, hard to target)

**Implementation Notes:**

- Render at 50-70% opacity
- Consider detection radius mechanic
- May require special targeting logic

---

### 7. Mechanical Zombie 🤖

**Type ID:** `MECHANICAL`

**Base Stats:**

- Health: 120 HP
- Speed: 55 px/s
- Reward: $40
- Size: 12px
- Color: `0x00ffff`

**Combat Modifiers:**

- **Resistant:** Machine Gun (80% damage) - metal plating, Shotgun (85% damage), Flame (50% damage) - heat-resistant
- **Weak:** Tesla (200% damage) - HIGHLY EFFECTIVE, fries circuits, Sniper (120% damage) - precision weak points

**Spawn Rates:**

- Waves 11+: 5-10%

**Strategic Role:**

- Hard counter to Flame towers (50% damage)
- Extremely vulnerable to Tesla (200% damage)
- Forces strategic tower placement
- High-value Tesla target

**Counter Strategy:**

- **PRIORITIZE TESLA** (200% damage, extremely effective)
- Use Sniper (120% damage)
- Avoid Flame (50% damage, nearly useless)
- Machine Gun/Shotgun are weak (80-85% damage)

**Implementation Notes:**

- Tesla should prioritize Mechanical zombies
- Visual feedback for electrical damage (sparks, etc.)
- Balancing: Tesla effectiveness makes Mechanical high-priority targets

---

## Game Mechanics

### Health Scaling Formula

```typescript
scaledHealth = baseHealth * (1 + (wave - 1) * 0.15);
```

**Examples:**

- Wave 1: 100% of base health
- Wave 5: 160% of base health (1 + 4 \* 0.15 = 1.6)
- Wave 10: 235% of base health (1 + 9 \* 0.15 = 2.35)
- Wave 20: 385% of base health (1 + 19 \* 0.15 = 3.85)

**Implementation:**

```typescript
// In ZombieFactory or Zombie constructor
const scaledHealth = zombieType.baseHealth * (1 + (currentWave - 1) * 0.15);
zombie.setMaxHealth(scaledHealth);
```

### Damage Calculation Formula

```typescript
finalDamage = baseDamage * damageModifier * (1 + upgrades);
```

**Components:**

- `baseDamage`: Tower's base damage value
- `damageModifier`: Zombie's resistance/weakness (0.5 to 2.0)
- `upgrades`: Tower upgrade multiplier (0.0 to 1.0+)

**Example:**

```typescript
// Sniper (50 base damage, 2 upgrades = +40%) vs Tank (150% modifier)
finalDamage = 50 * 1.5 * (1 + 0.4) = 50 * 1.5 * 1.4 = 105 damage
```

**Implementation:**

```typescript
// In Tower damage calculation
const modifier = zombie.getDamageModifier(this.towerType);
const upgradeMult = 1 + this.upgradeLevel * 0.2; // 20% per upgrade
const finalDamage = this.baseDamage * modifier * upgradeMult;
zombie.takeDamage(finalDamage);
```

### Speed Rankings

```
Fast (100) > Stealth (70) > Swarm (60) > Mechanical (55) > Basic (50) > Armored (40) > Tank (25)
```

**Implications:**

- Fast zombies reach base 2x faster than Basic
- Tank zombies are 4x slower than Fast
- Speed affects tower targeting priority
- Fast zombies may outrun slow projectiles

### Reward Rankings

```
Tank ($50) > Mechanical ($40) > Armored ($30) > Stealth ($25) > Fast ($15) > Basic ($10) > Swarm ($5)
```

**Balancing:**

- High HP = High reward (Tank, Mechanical, Armored)
- Low HP = Low reward (Swarm, Basic)
- Swarm compensates with numbers (20 Swarm = $100)

## Wave Composition Strategy

### Early Game (Waves 1-5)

**Composition:**

- Basic: 80%
- Fast: 20%

**Player Strategy:**

- Machine Gun and Shotgun are effective
- Learn basic tower placement
- Build economy
- Fast zombies introduce speed challenge

**Tower Recommendations:**

- Machine Gun (balanced)
- Shotgun (good vs Fast)

---

### Mid Game (Waves 6-10)

**Composition:**

- Basic: 60%
- Fast: 30%
- Tank: 10%

**Player Strategy:**

- Diversify tower types
- Add Sniper for Tank zombies
- Manage increased difficulty
- Balance economy and defense

**Tower Recommendations:**

- Add Sniper (essential for Tank)
- Maintain Shotgun (Fast counter)
- Machine Gun for Basic zombies

---

### Late Game (Waves 11+)

**Composition:**

- Basic: 50%
- Fast: 30%
- Tank: 15%
- Armored: 5%
- Swarm: 10-20 at once
- Stealth: 10%
- Mechanical: 5-10%

**Player Strategy:**

- Diverse tower composition required
- Identify and counter each zombie type
- Prioritize high-value targets (Tank, Mechanical)
- Manage multiple threat types simultaneously

**Tower Recommendations:**

- Tesla (versatile, excellent vs Mechanical)
- Sniper (Tank, Armored)
- Shotgun (Fast, Swarm, Stealth)
- Flame (Tank, Swarm, Stealth)
- Machine Gun (Basic, filler)

## Implementation Reference

### File Locations

```
src/objects/Zombie.ts              # Base zombie class
src/objects/ZombieFactory.ts       # Factory for creating zombies
src/objects/zombies/
  ├── BasicZombie.ts               # Basic zombie implementation
  ├── FastZombie.ts                # Fast zombie implementation
  ├── TankZombie.ts                # Tank zombie implementation
  ├── ArmoredZombie.ts             # Armored zombie implementation
  ├── SwarmZombie.ts               # Swarm zombie implementation
  ├── StealthZombie.ts             # Stealth zombie implementation
  └── MechanicalZombie.ts          # Mechanical zombie implementation
```

### Debug Testing

```typescript
// src/config/debugConstants.ts
export const DEBUG_CONSTANTS = {
  ZOMBIE_HEALTH_MULTIPLIER: 0.1, // Weak zombies for testing
  ZOMBIE_SPEED_MULTIPLIER: 0.5, // Slow zombies for testing
  SPAWN_RATE_MULTIPLIER: 2.0, // More zombies for stress testing
};
```

**Usage:**

```typescript
// In Zombie constructor
if (DEBUG_MODE) {
  this.health *= DEBUG_CONSTANTS.ZOMBIE_HEALTH_MULTIPLIER;
  this.speed *= DEBUG_CONSTANTS.ZOMBIE_SPEED_MULTIPLIER;
}
```

### Damage Modifier Implementation

```typescript
// In Zombie.ts or zombie type classes
public getDamageModifier(towerType: TowerType): number {
  const modifiers: Record<TowerType, number> = {
    MACHINE_GUN: 1.0,  // 100% damage
    SNIPER: 1.0,       // 100% damage
    SHOTGUN: 1.0,      // 100% damage
    FLAME: 1.0,        // 100% damage
    TESLA: 1.0,        // 100% damage
  };

  return modifiers[towerType] || 1.0;
}

// Override in specific zombie types
// FastZombie.ts
public getDamageModifier(towerType: TowerType): number {
  const modifiers: Record<TowerType, number> = {
    MACHINE_GUN: 1.0,
    SNIPER: 0.9,       // 90% damage (harder to hit)
    SHOTGUN: 1.25,     // 125% damage (spread hits)
    FLAME: 0.75,       // 75% damage (runs through)
    TESLA: 1.25,       // 125% damage (instant hit)
  };

  return modifiers[towerType] || 1.0;
}
```

### Spawn Rate Implementation

```typescript
// In WaveManager.ts
private getZombieTypeDistribution(wave: number): ZombieType[] {
  if (wave <= 5) {
    return [
      ...Array(80).fill('BASIC'),
      ...Array(20).fill('FAST'),
    ];
  } else if (wave <= 10) {
    return [
      ...Array(60).fill('BASIC'),
      ...Array(30).fill('FAST'),
      ...Array(10).fill('TANK'),
    ];
  } else {
    return [
      ...Array(50).fill('BASIC'),
      ...Array(30).fill('FAST'),
      ...Array(15).fill('TANK'),
      ...Array(5).fill('ARMORED'),
      ...Array(10).fill('STEALTH'),
      ...Array(5).fill('MECHANICAL'),
      // Swarm handled separately (spawn 10-20 at once)
    ];
  }
}
```

## Balancing Considerations

### Tower Diversity

Each zombie type should have:

- At least 2 effective counters (>120% damage)
- At least 1 weak counter (<80% damage)
- Some neutral matchups (90-110% damage)

**Current Balance:**

- Tesla: Most versatile (5 good matchups)
- Sniper: Essential for armored types
- Shotgun: Best for Fast/Swarm
- Flame: Situational (great vs some, terrible vs Mechanical)
- Machine Gun: Balanced but weak vs armored

### Spawn Rate Balance

- Early waves: Simple composition (2 types)
- Mid waves: Introduce complexity (3 types)
- Late waves: Full complexity (7 types)

**Progression:**

- Wave 1-5: Learn basics
- Wave 6-10: Learn counters
- Wave 11+: Master strategy

### Reward Balance

Total wave value should scale with difficulty:

- Wave 1: ~$100-150
- Wave 5: ~$300-400
- Wave 10: ~$600-800
- Wave 20: ~$1200-1500

**Formula:**

```typescript
waveValue = baseZombieCount * averageReward * waveMultiplier;
```

## Testing Checklist

- [ ] All zombie types spawn correctly
- [ ] Health scaling works per wave
- [ ] Damage modifiers apply correctly
- [ ] Speed values match specifications
- [ ] Rewards are granted on death
- [ ] Visual appearance matches type
- [ ] Spawn rates match wave composition
- [ ] Swarm zombies spawn in groups
- [ ] Stealth zombies render with transparency
- [ ] Mechanical zombies take 200% from Tesla

## Future Enhancements

Potential additions:

- Boss zombies (unique mechanics)
- Elite variants (higher stats)
- Status effects (burning, frozen, stunned)
- Zombie abilities (healing, splitting, exploding)
- Environmental interactions (water, fire, obstacles)
- Seasonal variants (holiday themes)
