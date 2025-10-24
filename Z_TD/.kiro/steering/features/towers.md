---
inclusion: fileMatch
fileMatchPattern: ['**/towers/**/*.ts', '**/Tower*.ts', '**/tower*.ts']
---

# Tower Development

## Quick Reference

### Tower Types and Base Stats

| Tower Type  | Cost  | Damage | Range | Fire Rate | Special Ability                                |
| ----------- | ----- | ------ | ----- | --------- | ---------------------------------------------- |
| Machine Gun | $250  | 12     | 150   | 8/sec     | High fire rate, upgrades increase speed        |
| Sniper      | $900  | 150    | 400   | 1/sec     | High single-target damage, armor-piercing      |
| Shotgun     | $400  | 60     | 120   | 0.8/sec   | Double barrel: 2 quick shots then reload, cone |
| Flame       | $750  | 200    | 120   | 0.75/sec  | Area damage over time, burning effect          |
| Tesla       | $1500 | 80     | 200   | 2/sec     | Chain lightning, affects multiple targets      |
| Grenade     | $1250 | 90     | 180   | 0.3/sec   | Explosive area damage, arc trajectory          |
| Sludge      | $800  | 0      | 100   | 0.25/sec  | Creates toxic pools that slow zombies          |

### Upgrade Scaling

| Property  | Machine Gun | Grenade    | Other Towers |
| --------- | ----------- | ---------- | ------------ |
| Damage    | +25%/level  | +20%/level | +50%/level   |
| Fire Rate | +30%/level  | +10%/level | +10%/level   |
| Range     | +20%/level  | +20%/level | +20%/level   |
| Max Level | 5           | 5          | 5            |

**Upgrade Cost Formula**: `baseCost × (upgradeLevel + 1) × upgradeCostMultiplier`

- Default multiplier: 0.75
- Sludge multiplier: 0.6 (cheaper upgrades)

## File Structure

```
src/objects/
├── Tower.ts                    # Base tower class
├── Tower.interface.ts          # ITower interface
└── towers/
    ├── SniperTower.ts         # Sniper implementation
    ├── GrenadeTower.ts        # Grenade implementation
    └── TeslaTower.ts          # Tesla implementation

src/config/
├── gameConfig.ts              # TOWER_TYPES constants
└── towerConstants.ts          # Tower stats and calculations

src/managers/
└── TowerManager.ts            # Tower management and stats
```

## Tower Development Patterns

### Creating a New Tower Type

1. Add to `gameConfig.ts` TOWER_TYPES
2. Define stats in `towerConstants.ts` (cost, damage, range, fireRate, specialAbility)
3. Create tower class in `src/objects/towers/` extending Tower (if custom behavior needed)
4. Register with TowerManager: `this.towerData.set(type, TowerConstants.TYPE)`

### Damage Calculation Pattern

```typescript
// Base damage with upgrades
const damage = calculateTowerDamage(type, upgradeLevel);

// Machine Gun: +25% per level
// damage = baseDamage × (1 + upgradeLevel × 0.25)

// Grenade: +20% per level
// damage = baseDamage × (1 + upgradeLevel × 0.2)

// Other towers: +50% per level
// damage = baseDamage × (1 + upgradeLevel × 0.5)
```

### Fire Rate Calculation Pattern

```typescript
// Fire rate with upgrades
const fireRate = calculateTowerFireRate(type, upgradeLevel);

// Machine Gun: +30% per level (focuses on speed)
// fireRate = baseFireRate × (1 + upgradeLevel × 0.3)

// Other towers: +10% per level
// fireRate = baseFireRate × (1 + upgradeLevel × 0.1)
```

### Range Calculation Pattern

```typescript
// Range with upgrades (all towers)
const range = calculateTowerRange(type, upgradeLevel);

// All towers: +20% per level
// range = baseRange × (1 + upgradeLevel × 0.2)
```

## Tower Visual Patterns

- **Structure**: `visual` (base/platform), `barrel` (rotatable weapon/character)
- **Upgrade Progression**: Level 1-2 (wood/sandbags) → 3-4 (metal/armor) → 5 (military-grade)
- **Shooting Effects**: Muzzle flash on barrel, recoil animation, cleanup after 100ms

## Memory Management

### Tower Cleanup Pattern

```typescript
public destroy(): void {
  // 1. Clear timers FIRST
  if (this.pulseInterval) clearInterval(this.pulseInterval);

  // 2. Destroy effects and children
  this.barrelHeatGlow?.destroy();
  this.laserSight?.destroy();
  this.selectionHighlight?.destroy();

  // 3. Clear arrays and references
  this.shellCasings = [];
  this.muzzleFlashes = [];

  // 4. Call parent destroy LAST
  super.destroy();
}
```

### Effect Registration

```typescript
// Register persistent effects
ResourceCleanupManager.registerPersistentEffect(graphics, {
  type: 'tower_effect',
  duration: 2000,
});

// Register timers
EffectCleanupManager.registerTimeout(setTimeout(() => {}, 100));
```

## Common Patterns

### Tower Placement

- Check: `towerManager.canPlaceTower(gridX, gridY)`
- Create: `towerFactory.createTower(type, x, y)`
- Add: `towerManager.addTower(tower)`

### Tower Targeting

- Find target: `findNearestZombieInRange(tower.getRange())`
- Rotate barrel: `barrel.rotation = Math.atan2(dy, dx)`
- Shoot: Check `tower.canShoot(currentTime)`, call `tower.shoot()` and `showShootingEffect()`

### Tower Upgrades

- Max level: 5
- Check: `tower.getUpgradeLevel() < 5`
- Cost: `calculateUpgradeCost(type, currentLevel)`
- Apply: `tower.upgrade()` then `tower.updateVisual()`

## See Also

- [Tower Architecture](../../../design_docs/Features/Towers/README.md) - Detailed tower system design
- [Tower Improvements](../../../design_docs/Features/Towers/IMPROVEMENTS.md) - Enhancement proposals
- [Tower Progression](../../../design_docs/Features/Towers/PROGRESSION_DESIGN.md) - Upgrade system design
