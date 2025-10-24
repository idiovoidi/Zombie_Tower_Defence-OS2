---
inclusion: always
---
---
inclusion: always
---

# Cleanup & Memory Management

This project requires strict memory management patterns to prevent leaks in the PixiJS-based game engine.

## Mandatory destroy() Implementation

All classes extending GameObject or PixiJS Container MUST implement destroy() following this exact order:

```typescript
public destroy(): void {
  // 1. Clear timers FIRST (prevents accessing destroyed objects)
  if (this.timeout) clearTimeout(this.timeout);
  if (this.interval) EffectCleanupManager.clearInterval(this.interval);
  
  // 2. Destroy children and clear references
  this.childObject?.destroy();
  this.childObject = null;
  this.arrayReference = [];
  
  // 3. Call parent destroy LAST
  super.destroy();
}
```

Order matters: timers → children/references → parent.

## Timer Management Rules

NEVER use raw `setInterval` or `setTimeout`. Always use `EffectCleanupManager` (src/utils/EffectCleanupManager.ts):

```typescript
// Correct usage
const interval = EffectCleanupManager.registerInterval(setInterval(() => {}, 16));
const timeout = EffectCleanupManager.registerTimeout(setTimeout(() => {}, 1000));

// Clear when done
EffectCleanupManager.clearInterval(interval);
EffectCleanupManager.clearTimeout(timeout);
```

## Persistent Visual Effects

Long-lived effects (fire pools, sludge pools, explosions, Tesla particles) MUST be registered with `ResourceCleanupManager` (src/utils/ResourceCleanupManager.ts):

```typescript
// Register effect
ResourceCleanupManager.registerPersistentEffect(graphics, {
  type: 'fire_pool',
  duration: 2000,
  onCleanup: () => { /* optional custom cleanup */ }
});

// Unregister when effect expires naturally
ResourceCleanupManager.unregisterPersistentEffect(graphics);
```

## Cleanup Scopes

**Wave Cleanup** (`ResourceCleanupManager.cleanupWaveResources()`):
- Cleans: persistent effects, projectiles, visual effects, blood particles
- Preserves: corpses (fade naturally), towers, zombies

**Game Cleanup** (`ResourceCleanupManager.cleanupGameResources()`):
- Cleans: everything from wave cleanup + zombies, towers, combat state, wave state

## Critical Rules

1. Clear timers BEFORE destroying objects
2. NEVER use raw setInterval/setTimeout - always wrap with EffectCleanupManager
3. Register persistent effects with ResourceCleanupManager
4. Always call `.destroy()` on PixiJS Graphics/Container objects
5. Null out references after destroying: `this.obj = null`
6. Call `super.destroy()` LAST in destroy() methods

## Common Memory Leak Patterns

- Orphaned timers → use EffectCleanupManager
- Undestroyed PixiJS objects → always call .destroy()
- Circular references → clear references in destroy()
- Event listeners → handled by PixiJS Container.destroy()

## Debugging

```typescript
ResourceCleanupManager.logState(); // Warns if >20 persistent effects/timers
EffectCleanupManager.logState();   // Shows active intervals/timeouts
```

Expected memory usage: Wave 1-5: 300-350MB, Wave 10: ~400MB, Wave 20+: ~450MB (stable). Memory should NOT grow continuously.