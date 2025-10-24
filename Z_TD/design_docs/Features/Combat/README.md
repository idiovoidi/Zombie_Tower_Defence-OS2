# Combat System

## Overview

The combat system handles interactions between towers and zombies, including damage calculation, targeting, projectiles, and special effects.

## Key Components

### Damage System
- Base damage from tower stats
- Damage modifiers based on zombie type
- Upgrade scaling
- Overkill tracking

### Targeting System
- Range-based target acquisition
- Priority targeting (nearest, weakest, strongest)
- Line of sight checks
- Target tracking

### Projectile System
- Projectile creation and movement
- Hit detection
- Visual effects
- Cleanup and disposal

### Special Effects
- Area of effect damage
- Damage over time
- Slow effects
- Chain lightning
- Explosive damage

## Related Documentation

- [Towers](../Towers/README.md) - Tower types and abilities
- [Zombies](../Zombies/README.md) - Zombie types and resistances
- [Memory Management](../../Core_Systems/Memory_Management/README.md) - Effect cleanup patterns

## Combat Flow

1. Tower acquires target in range
2. Tower fires projectile
3. Projectile travels to target
4. Hit detection and damage calculation
5. Apply damage modifiers
6. Apply special effects
7. Track statistics
8. Cleanup projectile

## Damage Calculation

```typescript
finalDamage = baseDamage * damageModifier * (1 + upgradeBonus);
```

Where:
- `baseDamage` = Tower's base damage stat
- `damageModifier` = Zombie type modifier (0.5 to 2.0)
- `upgradeBonus` = Upgrade level bonus (varies by tower)

## See Also

- [Tower Development Patterns](../../../.kiro/steering/features/towers.md)
- [Zombie Combat Modifiers](../../../.kiro/steering/features/zombies.md)

