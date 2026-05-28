---
inclusion: always
---

# Memory Management

## destroy() Order (REQUIRED)
1. Clear timers first
2. Destroy children, null references, clear arrays
3. `super.destroy()` last

```typescript
public destroy(): void {
  EffectCleanupManager.clearTimeout(this.timeout);
  EffectCleanupManager.clearInterval(this.interval);
  this.child?.destroy();
  this.child = null;
  this.arr = [];
  super.destroy();
}
```

## Timers — NEVER use raw setTimeout/setInterval
```typescript
const t = EffectCleanupManager.registerTimeout(setTimeout(() => {}, 100));
const i = EffectCleanupManager.registerInterval(setInterval(() => {}, 16));
// Clear in destroy():
EffectCleanupManager.clearTimeout(t);
EffectCleanupManager.clearInterval(i);
```
`src/utils/EffectCleanupManager.ts`

## Persistent Effects (fire, sludge, explosions, lightning)
```typescript
ResourceCleanupManager.registerPersistentEffect(graphics, { type: 'fire_pool', duration: 2000 });
ResourceCleanupManager.unregisterPersistentEffect(graphics); // when expired
```
`src/utils/ResourceCleanupManager.ts`

## Cleanup Scopes
- `cleanupWaveResources()` — removes effects/projectiles, keeps towers/zombies
- `cleanupGameResources()` — removes everything

## Debug
```typescript
ResourceCleanupManager.logState(); // warns if >20 effects
EffectCleanupManager.logState();
```
Expected memory: Wave 1-5: 300-350MB → Wave 20+: ~450MB (stable)
