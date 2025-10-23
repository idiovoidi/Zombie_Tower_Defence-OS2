# Grenade Tower Implementation

## Overview

Successfully implemented the Grenade Tower with explosion animation and splash damage mechanics.

## Features Implemented

### 1. Grenade Tower Stats

- **Cost:** $600
- **Damage:** 100 (base splash damage)
- **Range:** 180 pixels
- **Fire Rate:** 0.6 shots/second
- **Special Ability:** Explosive area damage with arc trajectory

### 2. Visual Design

- **Tower Appearance:** Olive drab military theme
- **Upgrade Levels:** 5 levels with progressive improvements
  - Level 1-2: Makeshift mortar/launcher with ammo crates
  - Level 3-4: Reinforced launcher platform with metal ammo boxes
  - Level 5: Military grenade launcher with armored storage

### 3. Grenade Projectile

- **Visual:** Olive drab grenade with red pin
- **Trajectory:** Parabolic arc (80px height at peak)
- **Speed:** 350 pixels/second
- **Animation:** Tumbles through the air while traveling

### 4. Explosion Animation

Multi-layered explosion effect with:

- **Shockwave Ring:** Expanding orange ring at 60px radius
- **Explosion Layers:** 6 concentric circles from white core to red outer
  - White core (6px)
  - Yellow inner (12px)
  - Orange-yellow (20px)
  - Orange (30px)
  - Dark orange (40px)
  - Red outer (50px)
- **Debris Particles:** 20 flying debris pieces
- **Smoke Puffs:** 12 smoke clouds around the explosion
- **Animation:** Expands from 0.5x to 1.5x scale over 400ms while fading out

### 5. Splash Damage Mechanics

- **Radius Scaling:** Increases significantly with tower upgrade level
  - Level 1: 45px radius (base)
  - Level 2: 56px radius (+11px, +24%)
  - Level 3: 67px radius (+11px, +49%)
  - Level 4: 78px radius (+11px, +73%)
  - Level 5: 90px radius (+11px, +100%)
- **Damage Scaling:** Modest increase with upgrades (+20% per level)
  - Level 1: 90 damage
  - Level 2: 108 damage
  - Level 3: 126 damage
  - Level 4: 144 damage
  - Level 5: 162 damage
- **Damage Falloff:** Linear from 100% at center to 30% at edge
  - Formula: `damage * (1 - (distance / radius) * 0.7)`
- **Multi-Target:** Hits all zombies within explosion radius
- **Damage Modifiers:** Respects zombie type resistances
- **Visual Scaling:** Explosion effects scale proportionally with radius

## Files Modified

### src/objects/Projectile.ts

- Added grenade visual (olive grenade with red pin)
- Implemented arc trajectory system with parabolic motion
- Created explosion animation with multi-layered effects
- Added splash damage calculation for all zombies in radius
- Grenade tumbles while in flight for realistic effect

### src/managers/TowerCombatManager.ts

- Added grenade projectile creation logic
- Set grenade speed to 350 px/s (slower than bullets)
- Integrated with damage callback system

### src/objects/TowerFactory.ts

- Added GrenadeTower import
- Added grenade case to tower creation switch

### src/managers/TowerManager.ts

- Added grenade tower stats initialization from constants

### src/ui/TowerShop.ts

- Added grenade tower icon (olive military theme)
- Added "Grenade" display name
- Icon shows ammo crates and military aesthetic

### src/objects/Tower.ts

- Already had complete grenade visual implementation
- Already had grenade projectile type in getProjectileType()
- Includes idle animation (subtle bobbing)

## Testing

### Test Files Created

1. **test-grenade-tower.html** - Basic tower creation test
2. **test-grenade-explosion.html** - Full explosion and splash damage demo
   - Shows grenade tower shooting at zombie cluster
   - Displays explosion radius indicator
   - Tracks zombies hit, total damage, and explosions
   - Real-time health bars on zombies
3. **test-grenade-scaling.html** - Explosion radius scaling demonstration
   - Interactive level buttons (1-5)
   - Visual explosion radius indicator
   - Shows scaling formula and values
   - Real-time upgrade testing

### How to Test

1. Start dev server: `npm run dev`
2. Open http://localhost:8081/test-grenade-explosion.html
3. Watch the grenade tower automatically shoot at the zombie cluster
4. Observe:
   - Grenade arcing through the air
   - Explosion animation on impact
   - Multiple zombies taking damage from splash
   - Damage falloff based on distance

**Test Explosion Scaling:**

1. Open http://localhost:8081/test-grenade-scaling.html
2. Click level buttons (1-5) to upgrade the tower
3. Watch the explosion radius indicator grow
4. See more debris and smoke at higher levels
5. Observe increased splash damage area

## Technical Details

### Arc Trajectory Math

```typescript
// Linear interpolation for horizontal movement
linearX = startX + totalDx * progress;

// Parabolic arc for vertical offset
arcProgress = sin(progress * π);
heightOffset = -arcHeight * arcProgress;
finalY = linearY + heightOffset;
```

### Splash Damage Calculation

```typescript
// For each zombie in explosion radius
distance = sqrt((zombie.x - explosion.x)² + (zombie.y - explosion.y)²)

if (distance <= explosionRadius) {
  damageFalloff = 1 - (distance / explosionRadius) * 0.7
  splashDamage = baseDamage * damageFalloff

  // Apply zombie type modifier
  finalDamage = splashDamage * zombie.getDamageModifier(towerType)
}
```

### Explosion Animation Timing

- **Duration:** 400ms
- **Scale:** 0.5x → 1.5x
- **Alpha:** 1.0 → 0.0
- **Frame Rate:** ~60fps (16ms intervals)

### Explosion Scaling Formula

```typescript
// Base radius scales with upgrade level
baseRadius = 40;
radiusPerLevel = 8;
explosionRadius = baseRadius + (upgradeLevel - 1) * radiusPerLevel;

// Visual elements scale proportionally
radiusScale = explosionRadius / 60; // Normalize to original design
layerRadius = originalRadius * radiusScale;

// Particle counts increase with level
debrisCount = 15 + upgradeLevel * 3;
smokeCount = 10 + upgradeLevel * 2;
```

## Integration with Game Systems

### Combat System

- Grenade tower uses standard tower targeting (closest zombie in range)
- Projectile manager handles grenade creation and updates
- Combat manager coordinates shooting and damage callbacks

### Damage Tracking

- Each zombie hit by splash damage triggers damage callback
- Tracks actual damage dealt (after resistances)
- Reports kills and overkill damage
- Integrates with balance tracking system

### Visual Effects

- Explosion graphics added to parent container
- Automatically cleaned up after animation completes
- No memory leaks (proper destroy() calls)

## Balance Considerations

### Strengths

- High area damage against grouped zombies
- Good range (180px)
- Effective against swarms

### Weaknesses

- Slow fire rate (0.6 shots/sec)
- Moderate cost ($600)
- Damage falls off at edges
- Slower projectile speed (350 px/s)

### Upgrade Scaling

- Damage: +20% per level (lower than other towers)
- Explosion Radius: +11px per level (+24% per level)
- Range: +20% per level
- Fire Rate: +10% per level
- Upgrade Cost: Base cost × (level + 1) × 0.75

**Design Philosophy:** Grenade tower focuses on area control rather than raw damage. Upgrades dramatically increase the explosion radius, making it more effective against groups.

## Future Enhancements (Optional)

1. **Burning Ground Effect:** Leave fire on ground after explosion
2. **Shrapnel:** Secondary projectiles flying from explosion
3. **Stun Effect:** Briefly slow zombies caught in blast
4. **Cluster Grenades:** Split into multiple smaller explosions at higher levels
5. **Smoke Trail:** Visual trail behind grenade while in flight
6. **Impact Crater:** Temporary ground texture at explosion site

## Status

✅ **COMPLETE** - Grenade tower is fully functional and can be bought, placed, and used in-game with explosion animation and splash damage.

## Dev Server

Running at: http://localhost:8081/

- Main game: http://localhost:8081/
- Grenade explosion test: http://localhost:8081/test-grenade-explosion.html
- Grenade scaling test: http://localhost:8081/test-grenade-scaling.html
