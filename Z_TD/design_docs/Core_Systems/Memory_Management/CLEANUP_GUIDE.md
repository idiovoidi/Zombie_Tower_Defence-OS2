# Memory Cleanup Guide

## Overview

This guide consolidates all cleanup and disposal patterns for the Z-TD game. The cleanup system prevents memory leaks through centralized resource management and consistent disposal patterns.

---

## Core Cleanup Architecture

### Centralized Cleanup System

The game uses a two-manager cleanup architecture:

1. **EffectCleanupManager** - Low-level timer tracking (`setInterval`, `setTimeout`)
2. **ResourceCleanupManager** - High-level resource orchestration (Graphics, managers, game state)

### Key Principles

1. **Separation of Concerns** - Cleanup logic isolated from game logic
2. **Automatic Tracking** - All persistent effects automatically registered
3. **Consistent Cleanup** - Single source of truth for cleanup operations
4. **Correct Order** - Timers cleared BEFORE objects destroyed

---

## The Three-Step Disposal Pattern

Every game object should follow this pattern:

```typescript
public destroy(): void {
  // 1. Clear timers and intervals FIRST
  if (this.timeout) {
    clearTimeout(this.timeout);
    this.timeout = null;
  }

  // 2. Destroy child objects and clear references
  if (this.childObject) {
    this.childObject.destroy();
    this.childObject = null;
  }
  this.arrayReference = [];

  // 3. Call parent destroy LAST
  super.destroy();
}
```

**Order is critical**: timers → children/references → parent

---

## Cleanup Managers

### EffectCleanupManager (Low-Level)

**Purpose:** Track and cleanup timers only

**Location:** `src/utils/EffectCleanupManager.ts`

**Usage:**

```typescript
// Register timers
const interval = EffectCleanupManager.registerInterval(
  setInterval(() => { ... }, 16)
);

const timeout = EffectCleanupManager.registerTimeout(
  setTimeout(() => { ... }, 1000)
);

// Clear specific timer
EffectCleanupManager.clearInterval(interval);
EffectCleanupManager.clearTimeout(timeout);

// Clear all timers
EffectCleanupManager.clearAll();

// Debug
EffectCleanupManager.logState();
```

**When to Use:**
- Track animation intervals
- Track delayed callbacks
- Ensure timers cleaned up on reset

### ResourceCleanupManager (High-Level)

**Purpose:** Orchestrate cleanup across all game resources

**Location:** `src/utils/ResourceCleanupManager.ts`

**Usage:**

```typescript
// Register persistent effects
ResourceCleanupManager.registerPersistentEffect(firePool, {
  type: 'fire_pool',
  duration: 2000,
  onCleanup: () => {
    // Custom cleanup logic
  },
});

// Unregister when naturally expires
ResourceCleanupManager.unregisterPersistentEffect(firePool);

// Wave cleanup (between waves)
ResourceCleanupManager.cleanupWaveResources({
  zombieManager: this.zombieManager,
  projectileManager: this.projectileManager,
  effectManager: this.effectManager,
});

// Full game cleanup (on restart)
ResourceCleanupManager.cleanupGameResources({
  zombieManager: this.zombieManager,
  towerPlacementManager: this.towerPlacementManager,
  projectileManager: this.projectileManager,
  effectManager: this.effectManager,
  towerCombatManager: this.towerCombatManager,
  waveManager: this.waveManager,
});

// Debug
ResourceCleanupManager.logState();
```

**When to Use:**
- Register persistent effects (fire pools, sludge pools, explosions, Tesla particles)
- Clean up between waves
- Clean up on game restart
- Coordinate cleanup across multiple managers

---

## Cleanup Flow

### Critical Cleanup Order

```
GameManager.cleanupWaveObjects()
    ↓
ResourceCleanupManager.cleanupWaveResources()
    ↓
    ├─→ EffectCleanupManager.clearAll()  (FIRST - Stop timers)
    ├─→ cleanupPersistentEffects()       (THEN - Destroy objects)
    ├─→ projectileManager.clear()
    ├─→ effectManager.clear()
    └─→ zombieManager.getBloodParticleSystem().clear()
```

**CRITICAL:** Timers must be cleared BEFORE objects are destroyed to prevent callbacks accessing destroyed objects!

### Wave Cleanup

Called after each wave completes:

**What Gets Cleaned:**
- ✅ All persistent effects (fire pools, sludge pools, explosions, Tesla particles)
- ✅ All projectiles
- ✅ All visual effects (shell casings, muzzle flashes, bullet trails)
- ✅ All effect timers (intervals/timeouts)
- ✅ Blood particles
- ❌ Corpses (fade naturally for visual continuity)
- ❌ Towers (persist between waves)
- ❌ Zombies (should be dead by wave end)

### Full Game Cleanup

Called when starting a new game or restarting:

**What Gets Cleaned:**
- ✅ Everything from wave cleanup
- ✅ All zombies
- ✅ All towers
- ✅ Combat manager state
- ✅ Wave manager state

---

## Persistent Effect Registration

All persistent effects must be registered when created:

### Example: Fire Pool

```typescript
// Create fire pool graphics
const firePool = new Graphics();
// ... draw fire pool ...

// Register as persistent effect
ResourceCleanupManager.registerPersistentEffect(firePool, {
  type: 'fire_pool',
  duration: 2000,
});

// Add to scene
this.parent.addChild(firePool);

// Animate with tracked interval
const fadeInterval = EffectCleanupManager.registerInterval(
  setInterval(() => {
    // Fade animation
    if (progress >= 1) {
      // Unregister when naturally expires
      ResourceCleanupManager.unregisterPersistentEffect(firePool);
      firePool.destroy();
      EffectCleanupManager.clearInterval(fadeInterval);
    }
  }, 50)
);
```

### Example: Tesla Lightning

```typescript
// Create lightning graphics
const lightningGraphics = new Graphics();
// ... draw lightning ...
tower.parent.addChild(lightningGraphics);

// Register as persistent effect
ResourceCleanupManager.registerPersistentEffect(lightningGraphics, {
  type: 'tesla_lightning',
  duration: 150,
});

// Track timeout
const timeout = EffectCleanupManager.registerTimeout(
  setTimeout(() => {
    EffectCleanupManager.clearTimeout(timeout);
    ResourceCleanupManager.unregisterPersistentEffect(lightningGraphics);
    if (lightningGraphics.parent) {
      lightningGraphics.parent.removeChild(lightningGraphics);
    }
    lightningGraphics.destroy();
  }, 150)
);
```

---

## Disposal Checklist by System

### Zombies
- [x] `zombie.destroy()` called in `ZombieManager.removeZombie()`
- [x] `zombie.destroy()` called in `ZombieManager.clear()`
- [x] Timeout cleanup in `Zombie.destroy()` for damage flash
- [x] Renderer cleanup in `Zombie.destroy()`
- [x] Component cleanup via `GameObject.destroy()`

### Projectiles
- [x] `projectile.destroy()` called in `ProjectileManager.update()`
- [x] `projectile.destroy()` called in `ProjectileManager.clear()`
- [x] Explosion interval tracked via EffectCleanupManager
- [x] Fire pool interval tracked via EffectCleanupManager
- [x] Sludge pool intervals (2x) tracked via EffectCleanupManager
- [x] Graphics objects destroyed in effect methods

### Towers
- [x] `tower.destroy()` called in `TowerPlacementManager.clear()`
- [x] Barrel heat glow cleanup in `Tower.destroy()`
- [x] Laser sight cleanup in `Tower.destroy()`
- [x] Shell casings cleanup in `Tower.destroy()`

### Particles & Effects
- [x] Blood particles destroyed in `BloodParticleSystem.update()`
- [x] Blood particles cleared in `BloodParticleSystem.clear()`
- [x] Corpses destroyed in `CorpseManager.update()`
- [x] Corpses cleared in `CorpseManager.clear()`
- [x] Effect manager destroys all effects in `EffectManager.clear()`
- [x] Laser particles use EffectCleanupManager

### Game Reset
- [x] `EffectCleanupManager.clearAll()` called in `GameManager.startGameWithLevel()`
- [x] `EffectCleanupManager.clearAll()` called in `ProjectileManager.clear()`

---

## Memory Leak Patterns & Solutions

### Pattern 1: Orphaned Timers ✅ FIXED

**Problem:** setInterval/setTimeout continue after objects destroyed

**Solution:** EffectCleanupManager tracks all timers

**Affected:**
- Projectile explosions (400ms)
- Fire pools (2000ms)
- Sludge pools (4000-7000ms, 2 intervals each)
- Laser particles (250-180ms)

### Pattern 2: Undestroyed PixiJS Objects ✅ FIXED

**Problem:** Graphics/Container objects not destroyed

**Solution:** Always call `.destroy()` on PixiJS objects

**Affected:**
- Zombies (fixed)
- Projectiles (fixed)
- Towers (fixed)
- Particles (fixed)

### Pattern 3: Circular References ✅ PREVENTED

**Problem:** Objects hold references to each other

**Solution:** Clear references in destroy() methods

```typescript
public destroy(): void {
  this.target = null;
  this.zombies = [];
  super.destroy();
}
```

### Pattern 4: Event Listeners ✅ HANDLED

**Problem:** Event listeners prevent garbage collection

**Solution:** PixiJS Container.destroy() automatically removes listeners

---

## Best Practices

### DO:
✅ Always call `.destroy()` on PixiJS objects
✅ Track all timers with EffectCleanupManager
✅ Clear object references in destroy() methods
✅ Use dirty flags to avoid passing arrays every frame
✅ Implement object pools with max limits
✅ Test memory usage over extended gameplay

### DON'T:
❌ Use setInterval/setTimeout without tracking
❌ Remove objects from parent without destroying
❌ Hold references to destroyed objects
❌ Create unlimited object pools
❌ Pass large arrays every frame
❌ Forget to call super.destroy()

---

## Debugging & Monitoring

### Check Current State

```typescript
// Get current counts
const state = ResourceCleanupManager.getState();
console.log(state);
// {
//   persistentEffects: 5,
//   cleanupCallbacks: 2,
//   effectTimers: { intervals: 3, timeouts: 1, disposables: 0 }
// }

// Log state with warnings
ResourceCleanupManager.logState();
// 🔍 ResourceCleanupManager State: { ... }
// ⚠️ High number of persistent effects - possible memory leak!
```

### Memory Leak Detection

The system automatically warns if:
- More than 20 persistent effects are active
- More than 20 intervals/timeouts are active

### Memory Monitoring Script

```javascript
// Add to browser console
setInterval(() => {
  const memory = (performance.memory.usedJSHeapSize / 1048576).toFixed(2);
  const counts = EffectCleanupManager.getCounts();
  console.log(`Memory: ${memory} MB | Intervals: ${counts.intervals} | Timeouts: ${counts.timeouts}`);
}, 5000);
```

---

## Expected Memory Behavior

### Before Cleanup Architecture

```
Wave 1:  300MB
Wave 5:  800MB
Wave 10: 1.5GB
Wave 15: 2.5GB
Wave 20: 5GB+ (browser crash)
```

### After Cleanup Architecture

```
Wave 1:  300MB
Wave 5:  350MB
Wave 10: 400MB
Wave 15: 450MB
Wave 20: 450MB (stable)
```

Memory returns to ~300MB after game restart.

---

## Testing

### Verification Checklist

- [x] Game state cleared on new game start
- [x] Game state cleared on game over
- [x] Game state cleared on victory
- [x] Wave manager reset on new game
- [x] All setTimeout calls tracked
- [x] All setInterval calls tracked
- [x] Zombies destroyed properly
- [x] Towers destroyed properly
- [x] Projectiles destroyed properly
- [x] Effects destroyed properly

### Stress Test Procedure

1. Start game with multiple sludge towers (high interval usage)
2. Play to wave 20+
3. Monitor memory and interval counts
4. Reset game and verify cleanup
5. Memory should return to baseline

---

## Related Files

- `src/utils/EffectCleanupManager.ts` - Low-level timer tracking
- `src/utils/ResourceCleanupManager.ts` - High-level orchestration
- `src/managers/GameManager.ts` - Uses cleanup system
- `src/objects/Projectile.ts` - Registers persistent effects
- `src/managers/TowerCombatManager.ts` - Registers Tesla particles

---

**Last Updated:** October 25, 2025
**Status:** ✅ All critical memory leaks addressed
