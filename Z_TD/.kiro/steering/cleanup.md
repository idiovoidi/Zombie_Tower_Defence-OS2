---
inclusion: always
---

# Cleanup & Memory Management

## Mandatory Disposal Pattern

All game objects extending GameObject or PixiJS Container MUST implement destroy() with this exact order:

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

## Timer Management

NEVER use raw `setInterval` or `setTimeout`. Always use EffectCleanupManager (`src/utils/EffectCleanupManager.ts`):

```typescript
// Register timers
const interval = EffectCleanupManager.registerInterval(setInterval(() => {}, 16));
const timeout = EffectCleanupManager.registerTimeout(setTimeout(() => {}, 1000));

// Clear individual timers
EffectCleanupManager.clearInterval(interval);
EffectCleanupManager.clearTimeout(timeout);

// Clear all timers (called by ResourceCleanupManager)
EffectCleanupManager.clearAll();
```

## Persistent Effect Management

Register long-lived visual effects with ResourceCleanupManager (`src/utils/ResourceCleanupManager.ts`):

```typescript
// Register: fire pools, sludge pools, explosions, Tesla particles
ResourceCleanupManager.registerPersistentEffect(graphics, {
  type: 'fire_pool',
  duration: 2000,
  onCleanup: () => { /* custom cleanup */ }
});

// Unregister when effect naturally expires
ResourceCleanupManager.unregisterPersistentEffect(graphics);
```

## Cleanup Scopes

**Wave Cleanup** (`ResourceCleanupManager.cleanupWaveResources()`):
- Persistent effects, projectiles, visual effects, blood particles
- Does NOT clean: corpses (fade naturally), towers, zombies

**Game Cleanup** (`ResourceCleanupManager.cleanupGameResources()`):
- Everything from wave cleanup plus zombies, towers, combat state, wave state

## Critical Rules

1. Clear timers BEFORE destroying objects (prevents errors from timers accessing destroyed objects)
2. NEVER use raw setInterval/setTimeout - always use EffectCleanupManager
3. Register persistent effects (fire/sludge pools, explosions, Tesla particles) with ResourceCleanupManager
4. Always call `.destroy()` on PixiJS Graphics/Container objects
5. Set object references to `null` after destroying to prevent memory leaks
6. Always call `super.destroy()` LAST in destroy() methods

## Memory Leak Patterns to Avoid

- Orphaned timers (use EffectCleanupManager)
- Undestroyed PixiJS objects (always call .destroy())
- Circular references (clear references in destroy())
- Event listeners (handled automatically by PixiJS Container.destroy())

## Debugging Memory Issues

```typescript
ResourceCleanupManager.logState(); // Warns if >20 persistent effects or timers
EffectCleanupManager.logState();   // Shows active intervals/timeouts
```

Expected memory: Wave 1-5: 300-350MB, Wave 10: ~400MB, Wave 20+: ~450MB (stable). Memory should NOT continuously grow.
