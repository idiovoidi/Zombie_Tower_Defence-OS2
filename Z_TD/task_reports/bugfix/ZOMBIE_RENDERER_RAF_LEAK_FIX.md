# Zombie Renderer requestAnimationFrame Memory Leak Fix

## Problem

Critical memory leak causing 8GB+ RAM usage by wave 20-25 with errors:

```
TypeError: Cannot set properties of null (setting 'y')
at animate (MechanicalZombieRenderer.ts:319:31)
```

## Root Cause

All 7 zombie renderers had **uncancelled `requestAnimationFrame` loops** in their `playDeathAnimation()` methods:

1. Animation frame ID was never stored
2. Animation loop was never cancelled in `destroy()`
3. After zombie destruction, the animation loop continued forever
4. Loop tried to access destroyed Graphics objects → errors + memory leak

## Files Fixed

All zombie renderer files:

- `src/renderers/zombies/types/BasicZombieRenderer.ts`
- `src/renderers/zombies/types/FastZombieRenderer.ts`
- `src/renderers/zombies/types/TankZombieRenderer.ts`
- `src/renderers/zombies/types/ArmoredZombieRenderer.ts`
- `src/renderers/zombies/types/SwarmZombieRenderer.ts`
- `src/renderers/zombies/types/StealthZombieRenderer.ts`
- `src/renderers/zombies/types/MechanicalZombieRenderer.ts`

## Solution

### 1. Added Animation Frame Tracking

```typescript
export class BasicZombieRenderer implements IZombieRenderer {
  private graphics: Graphics;
  private animator: ZombieAnimator;
  private particles: ZombieParticleSystem;
  private deathAnimationFrame: number | null = null; // NEW
```

### 2. Store and Clear Animation Frame ID

```typescript
async playDeathAnimation(): Promise<void> {
  return new Promise(resolve => {
    const startTime = Date.now();

    const animate = () => {
      // Safety check: stop if graphics destroyed
      if (this.graphics.destroyed) {
        resolve();
        return;
      }

      const elapsed = Date.now() - startTime;

      if (elapsed < 1500) {
        // ... animation logic ...
        this.deathAnimationFrame = requestAnimationFrame(animate); // STORE ID
      } else {
        this.deathAnimationFrame = null; // CLEAR
        resolve();
        return;
      }
    };

    animate();
  });
}
```

### 3. Cancel Animation in destroy()

```typescript
destroy(): void {
  // Cancel death animation if running
  if (this.deathAnimationFrame !== null) {
    cancelAnimationFrame(this.deathAnimationFrame);
    this.deathAnimationFrame = null;
  }
  this.graphics.destroy();
  this.particles.destroy();
}
```

## Impact

- **Prevents infinite animation loops** after zombie destruction
- **Stops memory leak** from orphaned requestAnimationFrame callbacks
- **Eliminates errors** from accessing destroyed Graphics objects
- **Expected result**: Memory should stabilize instead of growing to 8GB+

## Testing

Run game to wave 20-25 and verify:

1. No "Cannot set properties of null" errors
2. Memory usage stays under 500MB
3. No continuous memory growth
4. Smooth performance throughout

## Related Fixes

This complements previous memory leak fixes:

- `CRITICAL_MEMORY_LEAK_FIX.md` - setInterval → setTimeout conversion
- `GPU_MEMORY_LEAK_FIX.md` - Graphics.destroy({ children: true })
- `PERFORMANCE_FIX_WAVE20.md` - Spatial grid optimization
