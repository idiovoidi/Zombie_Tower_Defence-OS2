---
inclusion: always
---
---
inclusion: always
---

# Memory Management & Cleanup

This PixiJS-based game requires strict memory management to prevent leaks. Follow these patterns for all game objects, effects, and timers.

## destroy() Method Pattern

All classes extending GameObject or PixiJS Container MUST implement destroy() in this exact order:

```typescript
public destroy(): void {
  // 1. Clear timers FIRST (prevents callbacks accessing destroyed objects)
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

**Order is critical**: timers → children/references → parent.

## Timer Management

NEVER use raw `setInterval` or `setTimeout`. Always use `EffectCleanupManager`:

```typescript
// Register timers
const interval = EffectCleanupManager.registerInterval(setInterval(() => {}, 16));
const timeout = EffectCleanupManager.registerTimeout(setTimeout(() => {}, 1000));

// Clear in destroy()
EffectCleanupManager.clearInterval(interval);
EffectCleanupManager.clearTimeout(timeout);
```

Location: `src/utils/EffectCleanupManager.ts`

## Persistent Visual Effects

Long-lived effects (fire pools, sludge, explosions, Tesla lightning) MUST be registered with `ResourceCleanupManager`:

```typescript
// Register when creating effect
ResourceCleanupManager.registerPersistentEffect(graphics, {
  type: 'fire_pool',
  duration: 2000,
  onCleanup: () => { /* optional */ }
});

// Unregister when effect expires
ResourceCleanupManager.unregisterPersistentEffect(graphics);
```

Location: `src/utils/ResourceCleanupManager.ts`

## Cleanup Scopes

**Wave Cleanup** (`ResourceCleanupManager.cleanupWaveResources()`):
- Removes: persistent effects, projectiles, visual effects, blood particles
- Keeps: corpses (fade naturally), towers, zombies

**Game Cleanup** (`ResourceCleanupManager.cleanupGameResources()`):
- Removes: everything + zombies, towers, combat state, wave state

## Critical Rules

1. Clear timers BEFORE destroying objects (prevents callbacks on destroyed objects)
2. NEVER use raw setInterval/setTimeout - always use EffectCleanupManager
3. Register persistent effects with ResourceCleanupManager
4. Always call `.destroy()` on PixiJS Graphics/Container objects
5. Null references after destroying: `this.obj = null`
6. Call `super.destroy()` LAST in destroy() methods
7. Clear arrays: `this.array = []` or `this.array.length = 0`

## Common Memory Leak Causes

- **Orphaned timers**: Use EffectCleanupManager for all timers
- **Undestroyed PixiJS objects**: Always call `.destroy()` on Graphics/Container
- **Circular references**: Clear all object references in destroy()
- **Event listeners**: Automatically handled by PixiJS Container.destroy()

## Debugging Memory Issues

```typescript
ResourceCleanupManager.logState(); // Warns if >20 persistent effects/timers
EffectCleanupManager.logState();   // Shows active intervals/timeouts
```

**Expected memory usage**: Wave 1-5: 300-350MB, Wave 10: ~400MB, Wave 20+: ~450MB (stable). Memory should stabilize, not grow continuously.