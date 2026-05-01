# Zombie Resistance System - Implementation Guide

## Overview

The hybrid resistance system is now fully implemented, combining a centralized configuration file with zombie instance methods for flexible damage modification.

---

## Architecture

### 1. Configuration File (`src/config/zombieResistances.ts`)

Central source of truth for all damage modifiers:

```typescript
export const DAMAGE_MODIFIERS: DamageModifierMap = {
  BASIC: {
    MACHINE_GUN: 1.0,
    SNIPER: 1.0,
    SHOTGUN: 1.0,
    FLAME: 1.0,
    TESLA: 1.0,
  },
  FAST: {
    MACHINE_GUN: 1.0,
    SNIPER: 0.9,
    SHOTGUN: 1.25,
    FLAME: 0.75,
    TESLA: 1.25,
  },
  // ... more zombie types
};
```

### 2. Zombie Instance Method

Each zombie has a `getDamageModifier()` method:

```typescript
public getDamageModifier(towerType: TowerType): number {
  return getDamageModifier(this.type.toUpperCase() as ZombieType, towerType);
}
```

### 3. Combat Integration

Damage modifiers are applied in three places:

#### A. Projectile Hits (`src/objects/Projectile.ts`)

```typescript
private onHitTarget(): void {
  if (this.target && this.target.parent) {
    const towerType = this.towerType as TowerType;
    const modifier = this.target.getDamageModifier(towerType);
    const modifiedDamage = this.damage * modifier;

    this.target.takeDamage(modifiedDamage);
  }
}
```

#### B. Tesla Lightning (`src/managers/TowerCombatManager.ts`)

```typescript
private createLightningArc(tower, spawnPos, target, damage): void {
  const towerType = tower.getType() as TowerType;
  const modifier = target.getDamageModifier(towerType);
  const modifiedDamage = damage * modifier;

  target.takeDamage(modifiedDamage);
}
```

#### C. Flame Stream (`src/managers/TowerCombatManager.ts`)

```typescript
private createFlameStream(tower, spawnPos, target, damage): void {
  const towerType = tower.getType() as TowerType;
  const modifier = target.getDamageModifier(towerType);
  const modifiedDamage = damage * modifier;

  target.takeDamage(modifiedDamage);
}
```

---

## Type Safety

### Type Definitions

```typescript
export type ZombieType = 'BASIC' | 'FAST' | 'TANK' | 'ARMORED' | 'SWARM' | 'STEALTH' | 'MECHANICAL';
export type TowerType = 'MACHINE_GUN' | 'SNIPER' | 'SHOTGUN' | 'FLAME' | 'TESLA';
```

### Type Conversion

Tower types are converted from string to TowerType:

```typescript
const towerType = tower.getType() as TowerType;
```

Zombie types are converted in the getDamageModifier call:

```typescript
this.type.toUpperCase() as ZombieType;
```

---

## Helper Functions

### Get Damage Modifier

```typescript
getDamageModifier(zombieType: ZombieType, towerType: TowerType): number
```

Returns the damage multiplier for a specific zombie-tower combination.

### Check Effectiveness

```typescript
isEffectiveDamage(modifier: number): boolean  // Returns true if modifier > 1.0
isResistedDamage(modifier: number): boolean   // Returns true if modifier < 1.0
```

### Get Description

```typescript
getEffectivenessDescription(modifier: number): string
```

Returns human-readable effectiveness:

- "Very Effective" (≥1.5)
- "Effective" (≥1.25)
- "Slightly Effective" (>1.0)
- "Normal" (=1.0)
- "Slightly Resisted" (≥0.75)
- "Resisted" (≥0.5)
- "Highly Resisted" (<0.5)

### Get Color

```typescript
getEffectivenessColor(modifier: number): number
```

Returns color for visual feedback:

- Green (0x00ff00) - Effective (≥1.25)
- Light Green (0x88ff88) - Slightly Effective (>1.0)
- White (0xffffff) - Normal (=1.0)
- Orange (0xffaa00) - Slightly Resisted (≥0.75)
- Red (0xff0000) - Resisted (<0.75)

---

## Damage Calculation Flow

1. **Tower shoots** → Creates projectile or instant effect
2. **Projectile/Effect hits zombie** → Gets zombie type
3. **Query modifier** → `zombie.getDamageModifier(towerType)`
4. **Apply modifier** → `modifiedDamage = baseDamage * modifier`
5. **Deal damage** → `zombie.takeDamage(modifiedDamage)`
6. **Track stats** → Callback with actual damage dealt

---

## Testing the System

### Manual Testing

1. Start the game: `npm run dev`
2. Place different tower types
3. Spawn different zombie types
4. Observe damage numbers and kill times

### Expected Behaviors

**Tesla vs Mechanical Zombie:**

- Should deal 200% damage (2x multiplier)
- Mechanical zombies die very quickly to Tesla

**Flame vs Mechanical Zombie:**

- Should deal 50% damage (0.5x multiplier)
- Mechanical zombies very resistant to Flame

**Shotgun vs Swarm Zombie:**

- Should deal 150% damage (1.5x multiplier)
- Swarm zombies die quickly to Shotgun spread

**Sniper vs Swarm Zombie:**

- Should deal 60% damage (0.6x multiplier)
- Sniper overkills small swarm zombies (inefficient)

---

## Future Enhancements

### Visual Feedback

Add damage number colors based on effectiveness:

```typescript
// In damage display system
const modifier = zombie.getDamageModifier(towerType);
const color = getEffectivenessColor(modifier);
showDamageNumber(damage, color);
```

### UI Indicators

Show effectiveness in tower info panel:

```typescript
// When hovering over tower
const targetZombie = tower.getCurrentTarget();
if (targetZombie) {
  const modifier = targetZombie.getDamageModifier(tower.getType());
  const description = getEffectivenessDescription(modifier);
  showEffectivenessIndicator(description);
}
```

### Bestiary Integration

Display resistances/weaknesses in zombie bestiary:

```typescript
// For each zombie type
const resistances = [];
const weaknesses = [];

for (const towerType of TOWER_TYPES) {
  const modifier = getDamageModifier(zombieType, towerType);
  if (modifier < 1.0) resistances.push({ tower: towerType, modifier });
  if (modifier > 1.0) weaknesses.push({ tower: towerType, modifier });
}
```

---

## Balancing

### Modifier Guidelines

- **Immunity**: Never use 0 (minimum 0.5)
- **Strong Resistance**: 0.5 - 0.7
- **Moderate Resistance**: 0.75 - 0.9
- **Normal**: 1.0
- **Slight Weakness**: 1.1 - 1.2
- **Moderate Weakness**: 1.25 - 1.4
- **Strong Weakness**: 1.5 - 2.0
- **Critical Weakness**: 2.0+ (use sparingly)

### Balance Testing

Monitor these metrics:

- Average time to kill each zombie type
- Tower effectiveness distribution
- Player tower composition choices
- Wave difficulty progression

---

## Troubleshooting

### Modifiers Not Applied

**Check:**

1. Tower type string matches TowerType enum
2. Zombie type string matches ZombieType enum
3. Type conversion is correct (uppercase)
4. Modifier is applied before takeDamage()

### Incorrect Damage Values

**Check:**

1. Base damage is correct
2. Modifier calculation: `damage * modifier`
3. No other damage modifiers interfering
4. Health component receiving correct value

### Type Errors

**Check:**

1. Import TowerType from zombieResistances
2. Cast tower.getType() to TowerType
3. Zombie type is uppercase in config
4. All tower types defined in config

---

## Files Modified

- ✅ `src/config/zombieResistances.ts` - Configuration and helpers
- ✅ `src/objects/Zombie.ts` - getDamageModifier() method
- ✅ `src/objects/Projectile.ts` - Apply modifier on hit
- ✅ `src/managers/TowerCombatManager.ts` - Apply modifier for instant damage

---

## Status

✅ **Implementation Complete**

- Configuration file created
- Zombie method implemented
- Combat integration complete
- Type safety enforced
- Helper functions available

🔄 **Next Steps**

- Add visual feedback for effectiveness
- Integrate with UI panels
- Add to zombie bestiary
- Balance testing and tuning

---

**Last Updated:** Current Build
**Status:** Ready for Testing
