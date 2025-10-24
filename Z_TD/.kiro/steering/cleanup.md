---
inclusion: always
---

# Cleanup & Memory Management

## Core Disposal Pattern

Every game object MUST follow the three-step disposal pattern:

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

## Cleanup Managers

### EffectCleanupManager (Low-Level Timer Tracking)

**Location:** `src/utils/EffectCleanupManager.ts`

**Purpose:** Track and cleanup ALL setInterval/setTimeout calls

**Usage:**

```typescript
// ALWAYS register timers
const interval = EffectCleanupManager.registerInterval(
  setInterval(() => {
    /* animation */
  }, 16)
);

// Clear when done
EffectCleanupManager.clearInterval(interval);

// Clear all on reset
EffectCleanupManager.clearAll();
```

### ResourceCleanupManager (High-Level Orchestration)

**Location:** `src/utils/ResourceCleanupManager.ts`

**Purpose:** Orchestrate cleanup across all game resources

**Usage:**

```typescript
// Register persistent effects (fire pools, sludge pools, explosions, Tesla particles)
ResourceCleanupManager.registerPersistentEffect(graphics, {
  type: 'fire_pool',
  duration: 2000,
  onCleanup: () => {
    /* custom cleanup */
  },
});

// Unregister when naturally expires
ResourceCleanupManager.unregisterPersistentEffect(graphics);

// Wave cleanup (between waves)
ResourceCleanupManager.cleanupWaveResources(managers);

// Full game cleanup (on restart)
ResourceCleanupManager.cleanupGameResources(managers);
```

## Critical Rules

1. **Timer Order:** ALWAYS clear timers BEFORE destroying objects. Timers accessing destroyed objects cause errors.

2. **Always Track Timers:** NEVER use raw setInterval/setTimeout. Always use EffectCleanupManager.

3. **Register Persistent Effects:** Fire pools, sludge pools, explosions, and Tesla particles MUST be registered with ResourceCleanupManager.

4. **Destroy PixiJS Objects:** Always call `.destroy()` on Graphics/Container objects when done.

5. **Clear References:** Set object references to null in destroy() methods to prevent memory leaks.

6. **Call super.destroy():** Always call parent destroy() LAST in destroy() methods.

## Wave vs Game Cleanup

**Wave Cleanup** (between waves):

- Persistent effects (fire pools, sludge pools, explosions, Tesla particles)
- Projectiles
- Visual effects (shell casings, muzzle flashes, bullet trails)
- Effect timers
- Blood particles
- Does NOT clean: Corpses (fade naturally), Towers, Zombies

**Game Cleanup** (on restart):

- Everything from wave cleanup
- All zombies
- All towers
- Combat manager state
- Wave manager state

## Memory Leak Prevention

Common leak patterns to avoid:

1. **Orphaned Timers:** Use EffectCleanupManager for ALL timers
2. **Undestroyed PixiJS Objects:** Always call .destroy()
3. **Circular References:** Clear references in destroy() methods
4. **Event Listeners:** Handled automatically by PixiJS Container.destroy()

## Debugging

```typescript
// Check current state
ResourceCleanupManager.logState();
// Warns if > 20 persistent effects or > 20 timers

// Monitor memory
EffectCleanupManager.logState();
// Shows active intervals/timeouts
```

## Expected Memory Behavior

- Wave 1-5: 300-350MB
- Wave 10: ~400MB
- Wave 20+: ~450MB (stable)
- After restart: Returns to ~300MB

Memory should NOT continuously grow across waves.
