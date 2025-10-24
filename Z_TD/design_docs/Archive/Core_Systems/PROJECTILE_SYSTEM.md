# Projectile System & Tower Rotation

**Completed:** 2024 (Estimated)  
**Verification Status:** ✅ Verified - Feature is live in current codebase

## Overview

Towers now rotate to face their targets and shoot visible projectiles that travel to zombies.

## New Components

### 1. Projectile Class (src/objects/Projectile.ts)

- Visual projectiles that travel from towers to zombies
- Different appearances based on tower type:
  - **Bullet** (Machine Gun): Small yellow circle
  - **Sniper**: Thin red circle (fast)
  - **Shotgun**: Orange pellets (3 projectiles with spread)
  - **Flame**: Orange flame particle (slow)
  - **Tesla**: Blue electric bolt with glow
- Tracks target zombie and updates position each frame
- Applies damage on hit
- Creates hit effects on impact

### 2. ProjectileManager (src/managers/ProjectileManager.ts)

- Manages all active projectiles
- Creates new projectiles when towers shoot
- Updates projectile positions each frame
- Removes destroyed projectiles
- Handles cleanup

### 3. Tower Rotation System

Updated Tower class with:

- **Separate barrel graphics** - Base stays fixed, barrel rotates
- **rotateTowards()** - Smoothly rotates barrel to face target
- **getProjectileSpawnPosition()** - Calculates spawn point at barrel tip
- **getProjectileType()** - Returns appropriate projectile type for tower

## Visual Changes

### Tower Structure

Each tower now has two visual components:

1. **Base** (this.visual) - Doesn't rotate, shows tower body
2. **Barrel** (this.barrel) - Rotates to face targets

### Tower Types

All tower types updated with rotating barrels:

- **Machine Gun**: Blue base with rotating barrel
- **Sniper**: Ellipse base with long rotating barrel
- **Shotgun**: Square base with double rotating barrels
- **Flame**: Round base with rotating nozzle
- **Tesla**: Turquoise base with rotating coil

## Combat Flow

1. **Target Acquisition**: TowerCombatManager finds closest zombie in range
2. **Rotation**: Tower rotates barrel to face target
3. **Shooting**: When fire rate cooldown is ready, tower shoots
4. **Projectile Creation**: ProjectileManager creates projectile at barrel tip
5. **Travel**: Projectile moves toward target each frame
6. **Impact**: On hit, projectile applies damage and creates effect
7. **Cleanup**: Destroyed projectiles are removed

## Projectile Speeds

Different tower types have different projectile speeds:

- **Sniper**: 1000 px/s (fastest)
- **Tesla**: 800 px/s (fast)
- **Machine Gun**: 500 px/s (medium)
- **Shotgun**: 400 px/s (slower)
- **Flame**: 300 px/s (slowest)

## Special Mechanics

### Shotgun Spread

- Fires 3 projectiles simultaneously
- Spread at -0.2, 0, +0.2 radians
- Damage split evenly among pellets

### Homing Projectiles

- Projectiles track moving targets
- Updates target position each frame
- Ensures hits even if zombie moves

## Integration

### GameManager

- Creates ProjectileManager with game container
- Passes ProjectileManager to TowerCombatManager
- Projectiles render in correct layer (above path, below UI)

### TowerCombatManager

- Updates projectiles each frame
- Creates projectiles when towers shoot
- No longer applies instant damage (projectiles handle it)

## Performance

- Projectiles are lightweight Graphics objects
- Automatically cleaned up on hit or destruction
- Efficient update loop processes only active projectiles

## Visual Effects

### Shooting Effects

- Muzzle flash at barrel tip
- Brief recoil animation
- Type-specific colors

### Hit Effects

- Explosion/impact visual on hit
- Brief fade-out animation
- Type-specific effects (flame burst, electric spark, etc.)

## Testing

Run `npm run dev` to see:

- Towers rotating to track zombies
- Projectiles flying from barrel tips
- Different projectile types and speeds
- Hit effects when projectiles connect
- Shotgun spread pattern

The system creates a much more dynamic and visually engaging combat experience!

## Related Documentation

- [Tower Combat](../../Features/Towers/README.md)
- [Combat System](../../Features/Combat/README.md)
- [Memory Management](../Memory_Management/README.md)

---

**Status**: ✅ Complete
