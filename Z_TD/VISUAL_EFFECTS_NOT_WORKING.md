# Visual Effects Not Working

## Problem

Sniper scope glint, laser sight, and shell casing effects are not visible in the game.

## Root Causes

### 1. Effect Manager Not Set on Towers

Towers have a `setEffectManager()` method but it's **never called**:

```typescript
// In Tower.ts
public setEffectManager(container: Container): void {
  this.effectManager = container;
}
```

**Search results show**: No code calls `tower.setEffectManager()`

**Impact**: `effectManager` is always `null`, so all effect spawning code fails silently:

```typescript
if (!this.effectManager) {
  return; // Effects never spawn
}
```

### 2. Effects Not Updated

Shell casings, scope glints, and other effects have `update()` methods but they're **never called**:

```typescript
// ShellCasing.update() - never called
// ScopeGlint.update() - never called
// LaserSight.update() - called in Tower.update() but laserSight is never created
```

### 3. Laser Sight Never Created

Laser sight is only created when `setLaserSightEnabled(true)` is called, but:

- This method is never called from anywhere
- Even if called, it requires `effectManager` to be set first

## Solution

### Quick Fix (Minimal Changes)

1. **Set effect manager when tower is created**:

```typescript
// In TowerManager.ts or wherever towers are created
const tower = towerFactory.createTower(type, x, y);
tower.setEffectManager(this.effectManagerContainer); // Add this line
```

2. **Update effects in game loop**:

```typescript
// In Tower.ts update() method
if (this.shellCasings) {
  for (let i = this.shellCasings.length - 1; i >= 0; i--) {
    const casing = this.shellCasings[i];
    if (!casing.update(deltaTime)) {
      // Effect finished, remove it
      if (casing.parent) {
        casing.parent.removeChild(casing);
      }
      casing.destroy();
      this.shellCasings.splice(i, 1);
    }
  }
}
```

3. **Enable laser sight for sniper towers**:

```typescript
// In TowerCombatManager.ts when sniper acquires target
if (tower.getType() === 'SNIPER' && tower.getUpgradeLevel() >= 3) {
  tower.setLaserSightEnabled(true);
  tower.setTarget(target.x, target.y);
}
```

### Proper Fix (Architectural)

Use the existing `EffectManager` class properly:

1. Create a single EffectManager instance in GameManager
2. Pass it to TowerManager
3. Set it on all towers when created
4. EffectManager handles all effect lifecycle (spawn, update, cleanup)

## Files Involved

- `src/objects/Tower.ts` - Has effect spawning code but effectManager is null
- `src/effects/EffectManager.ts` - Proper effect management system (not being used)
- `src/effects/ShellCasing.ts` - Effect implementation (working, just not spawned/updated)
- `src/effects/ScopeGlint.ts` - Effect implementation (working, just not spawned/updated)
- `src/effects/LaserSight.ts` - Effect implementation (working, just not spawned/updated)
- `src/managers/TowerManager.ts` - Where towers are created (needs to set effectManager)
- `src/managers/TowerCombatManager.ts` - Where tower shooting happens (needs to enable laser sight)

## Priority

**Low** - These are visual polish effects that don't affect gameplay. The memory leak fixes are much more critical.

## Note

The effect implementations themselves are correct and well-written. They just need to be properly integrated into the game loop and have their manager set.
