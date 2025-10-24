# 🏗️ Cleanup Managers Architecture

## Overview

The cleanup system uses **two separate managers** with clear responsibilities:

1. **EffectCleanupManager** - Low-level timer tracking
2. **ResourceCleanupManager** - High-level resource orchestration

This document explains why we have two files and how they work together.

---

## 🎯 Why Two Separate Managers?

### Single Responsibility Principle

Each manager has **one clear job**:

| Manager | Responsibility | Scope |
|---------|---------------|-------|
| **EffectCleanupManager** | Track and clear timers | `setInterval`, `setTimeout` |
| **ResourceCleanupManager** | Orchestrate resource cleanup | Graphics, managers, game state |

### Benefits of Separation

1. **Clarity** - Each file has a single, clear purpose
2. **Testability** - Easy to test independently
3. **Maintainability** - Changes to one don't affect the other
4. **Reusability** - EffectCleanupManager can be used standalone
5. **Scalability** - Easy to add new cleanup types

---

## 📁 File Structure

```
src/utils/
├── EffectCleanupManager.ts      (146 lines - Low-level timer tracking)
└── ResourceCleanupManager.ts    (397 lines - High-level orchestration)
```

---

## 🔧 EffectCleanupManager (Low-Level)

**File:** `src/utils/EffectCleanupManager.ts`

**Purpose:** Track and cleanup timers (intervals/timeouts) only.

### Responsibilities

- ✅ Register `setInterval` calls
- ✅ Register `setTimeout` calls
- ✅ Clear specific timers
- ✅ Clear all timers
- ✅ Provide debugging info

### Does NOT Handle

- ❌ Graphics objects
- ❌ Game managers
- ❌ Resource orchestration
- ❌ Persistent effects

### API

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
// Output: { intervals: 5, timeouts: 2 }
```

### When to Use

Use **EffectCleanupManager** when you need to:
- Track animation intervals
- Track delayed callbacks
- Ensure timers are cleaned up on reset

### Example Usage

```typescript
// In Projectile.ts - Fire pool animation
const fadeInterval = EffectCleanupManager.registerInterval(
  setInterval(() => {
    firePool.alpha -= 0.02;
    if (firePool.alpha <= 0) {
      EffectCleanupManager.clearInterval(fadeInterval);
      firePool.destroy();
    }
  }, 50)
);
```

---

## 🎮 ResourceCleanupManager (High-Level)

**File:** `src/utils/ResourceCleanupManager.ts`

**Purpose:** Orchestrate cleanup across all game resources.

### Responsibilities

- ✅ Track persistent effects (Graphics objects)
- ✅ Coordinate cleanup across managers
- ✅ Provide wave cleanup method
- ✅ Provide game cleanup method
- ✅ Ensure correct cleanup order
- ✅ Call EffectCleanupManager internally

### Does NOT Handle

- ❌ Low-level timer tracking (delegates to EffectCleanupManager)

### API

```typescript
// Register persistent effects
ResourceCleanupManager.registerPersistentEffect(firePool, {
  type: 'fire_pool',
  duration: 2000,
  onCleanup: () => {
    // Custom cleanup logic
  }
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
// Output: {
//   persistentEffects: 5,
//   cleanupCallbacks: 0,
//   effectTimers: { intervals: 3, timeouts: 1 }
// }
```

### When to Use

Use **ResourceCleanupManager** when you need to:
- Register persistent effects (fire pools, sludge pools, explosions, Tesla particles)
- Clean up between waves
- Clean up on game restart
- Coordinate cleanup across multiple managers

### Example Usage

```typescript
// In Projectile.ts - Create fire pool
const firePool = new Graphics();
// ... draw fire pool ...

// Register as persistent effect
ResourceCleanupManager.registerPersistentEffect(firePool, {
  type: 'fire_pool',
  duration: 2000,
});

// In GameManager.ts - Wave cleanup
private cleanupWaveObjects(): void {
  ResourceCleanupManager.cleanupWaveResources({
    zombieManager: this.zombieManager,
    projectileManager: this.projectileManager,
    effectManager: this.effectManager,
  });
}
```

---

## 🔄 How They Work Together

### Cleanup Flow

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

### Critical Order

**IMPORTANT:** Timers must be cleared BEFORE objects are destroyed!

```typescript
// CORRECT ORDER:
1. EffectCleanupManager.clearAll()      // Stop timers
2. cleanupPersistentEffects()           // Destroy objects

// WRONG ORDER (causes errors):
1. cleanupPersistentEffects()           // Destroy objects
2. EffectCleanupManager.clearAll()      // Stop timers (too late!)
   // Timers try to access destroyed objects!
```

---

## 📊 Comparison Table

| Feature | EffectCleanupManager | ResourceCleanupManager |
|---------|---------------------|----------------------|
| **Level** | Low-level | High-level |
| **Scope** | Timers only | All resources |
| **Tracks** | Intervals, timeouts | Graphics, managers |
| **Orchestrates** | No | Yes |
| **Calls other managers** | No | Yes (calls EffectCleanupManager) |
| **Used by** | Projectile, Tower, TowerCombatManager | GameManager |
| **File size** | 146 lines | 397 lines |
| **Dependencies** | None | EffectCleanupManager |

---

## 🎨 Design Patterns Used

### 1. Single Responsibility Principle (SRP)

Each manager has one job:
- **EffectCleanupManager** = Timer tracking
- **ResourceCleanupManager** = Resource orchestration

### 2. Facade Pattern

**ResourceCleanupManager** provides a simple interface for complex cleanup:

```typescript
// Instead of calling 10 different cleanup methods:
zombieManager.clear();
towerManager.clear();
projectileManager.clear();
effectManager.clear();
EffectCleanupManager.clearAll();
// ... etc

// Just call one method:
ResourceCleanupManager.cleanupWaveResources(managers);
```

### 3. Registry Pattern

Both managers use registries to track resources:
- **EffectCleanupManager** = `Set<NodeJS.Timeout>`
- **ResourceCleanupManager** = `Set<PersistentEffect>`

---

## 🚀 Future Improvements

### Potential Enhancements

1. **Object Pooling**
   - Add `ObjectPoolManager` for reusing Graphics objects
   - Reduce garbage collection pressure

2. **Texture Cleanup**
   - Add `TextureCleanupManager` for unused textures
   - Prevent texture memory leaks

3. **Event Listener Tracking**
   - Add event listener tracking to EffectCleanupManager
   - Prevent listener memory leaks

4. **Automatic Leak Detection**
   - Add memory profiling integration
   - Automatic warnings for leaks

---

## 📝 Best Practices

### When Creating Effects

1. **Always register timers:**
   ```typescript
   const interval = EffectCleanupManager.registerInterval(
     setInterval(() => { ... }, 16)
   );
   ```

2. **Always register persistent effects:**
   ```typescript
   ResourceCleanupManager.registerPersistentEffect(graphics, {
     type: 'effect_type',
     duration: 1000,
   });
   ```

3. **Always unregister when done:**
   ```typescript
   EffectCleanupManager.clearInterval(interval);
   ResourceCleanupManager.unregisterPersistentEffect(graphics);
   ```

### When Adding New Managers

1. **Add to GameManagers interface:**
   ```typescript
   export interface GameManagers {
     newManager?: {
       clear: () => void;
     };
   }
   ```

2. **Add to cleanup methods:**
   ```typescript
   if (managers.newManager) {
     managers.newManager.clear();
   }
   ```

---

## 🧪 Testing

### Test EffectCleanupManager

```typescript
// Register timers
const interval = EffectCleanupManager.registerInterval(
  setInterval(() => console.log('tick'), 100)
);

// Check state
EffectCleanupManager.logState();
// Should show: { intervals: 1, timeouts: 0 }

// Clear all
EffectCleanupManager.clearAll();

// Check state again
EffectCleanupManager.logState();
// Should show: { intervals: 0, timeouts: 0 }
```

### Test ResourceCleanupManager

```typescript
// Create effect
const graphics = new Graphics();
ResourceCleanupManager.registerPersistentEffect(graphics, {
  type: 'test',
});

// Check state
ResourceCleanupManager.logState();
// Should show: { persistentEffects: 1, ... }

// Clear all
ResourceCleanupManager.clearAll();

// Check state again
ResourceCleanupManager.logState();
// Should show: { persistentEffects: 0, ... }
```

---

## 📚 Related Documentation

- `CLEANUP_ARCHITECTURE.md` - Overall cleanup system overview
- `PERSISTENT_EFFECTS_FIX.md` - Persistent effects memory leak fix
- `TESLA_PARTICLE_FIX.md` - Tesla particle cleanup fix
- `src/utils/EffectCleanupManager.ts` - Low-level timer tracking
- `src/utils/ResourceCleanupManager.ts` - High-level orchestration

---

## 🎉 Summary

**Two managers, two responsibilities:**

1. **EffectCleanupManager** (Low-level)
   - Tracks timers only
   - Simple, focused API
   - No dependencies

2. **ResourceCleanupManager** (High-level)
   - Orchestrates all cleanup
   - Coordinates managers
   - Calls EffectCleanupManager

**Why separate?**
- Single Responsibility Principle
- Easy to test independently
- Clear separation of concerns
- Maintainable and scalable

**Result:** Clean, organized, maintainable cleanup system! 🚀

