# Memory Leak Investigation and Fixes

## Problem Statement

The game was experiencing severe memory leaks, consuming up to **20GB of RAM** in later levels. This investigation identified and fixed multiple critical memory leaks.

---

## Critical Memory Leaks Found and Fixed

### 1. **CRITICAL: Zombies Not Being Destroyed** ✅ FIXED

**Location:** `src/managers/ZombieManager.ts`

**Problem:**

- `removeZombie()` method removed zombies from the container and array but **never called `zombie.destroy()`**
- `clear()` method had the same issue
- Every zombie that died or reached the end remained in memory with all its components, graphics, and event listeners

**Impact:**

- Hundreds/thousands of zombie objects accumulating in memory over multiple waves
- Each zombie contains: Graphics objects, Components, Event listeners, Renderer objects
- This was likely the **PRIMARY** cause of the 20GB memory leak

**Fix Applied:**

```typescript
// In removeZombie()
public removeZombie(index: number): Zombie {
  const zombie = this.zombies[index];
  this.container.removeChild(zombie);
  zombie.destroy(); // ✅ ADDED: Destroy zombie to free memory
  this.zombies.splice(index, 1);
  this.zombiesDirty = true;
  return zombie;
}

// In clear()
public clear(): void {
  for (const zombie of this.zombies) {
    this.container.removeChild(zombie);
    zombie.destroy(); // ✅ ADDED: Destroy zombie to free memory
  }
  this.zombies = [];
  // ... rest of cleanup
}
```

---

### 2. **setTimeout Memory Leak in Zombie Damage Flash** ✅ FIXED

**Location:** `src/objects/Zombie.ts`

**Problem:**

- `takeDamage()` method created a `setTimeout` callback for damage flash effect
- If zombie was destroyed before the timeout fired, the callback would still execute
- Timeout held a reference to the zombie, preventing garbage collection
- No cleanup of pending timeouts when zombie was destroyed

**Impact:**

- Zombie objects couldn't be garbage collected if they had pending damage flash timeouts
- Accumulated over time as zombies took damage before dying

**Fix Applied:**

```typescript
// Added field to track timeout
private damageFlashTimeout: NodeJS.Timeout | null = null;

// Modified takeDamage() to clear existing timeout
public takeDamage(damage: number, towerType?: string): number {
  // ... damage logic ...

  if (this.visual) {
    this.visual.tint = 0xff0000;

    // Clear any existing timeout to prevent memory leak
    if (this.damageFlashTimeout) {
      clearTimeout(this.damageFlashTimeout);
    }

    // Store timeout ID for cleanup
    this.damageFlashTimeout = setTimeout(() => {
      if (this.visual) {
        this.visual.tint = 0xffffff;
      }
      this.damageFlashTimeout = null;
    }, 100);
  }
  // ... rest of method
}

// Added destroy() override to clean up timeout
public override destroy(): void {
  // Clear any pending damage flash timeout
  if (this.damageFlashTimeout) {
    clearTimeout(this.damageFlashTimeout);
    this.damageFlashTimeout = null;
  }

  // Destroy renderer if it exists
  if (this.renderer) {
    this.renderer.destroy();
    this.renderer = null;
  }

  // Call parent destroy
  super.destroy();
}
```

---

### 3. **Potential setInterval Leaks in Projectile Effects** ⚠️ IDENTIFIED

**Location:** `src/objects/Projectile.ts`

**Problem:**

- `createExplosion()`, `createFirePool()`, and `createSludgePool()` use `setInterval` for animations
- Intervals DO clear themselves when complete
- However, if the game is reset/cleared while intervals are running, they continue to execute
- Intervals hold references to Graphics objects and zombie arrays

**Current Status:**

- Intervals are self-cleaning (call `clearInterval` when animation completes)
- **POTENTIAL** issue if game state is cleared mid-animation
- Not as critical as zombie leak, but should be monitored

**Recommendation:**

- Consider tracking active intervals and clearing them in a global cleanup method
- Or use PixiJS Ticker instead of setInterval for better lifecycle management

---

## Memory Leak Patterns Identified

### ✅ Good Patterns (Already Implemented)

1. **CorpseManager** - Properly calls `container.destroy({ children: true })`
2. **BloodParticleSystem** - Properly calls `graphics.destroy()` on particles
3. **ProjectileManager** - Properly calls `projectile.destroy()` when removing
4. **TowerPlacementManager** - Properly calls `tower.destroy()` when removing
5. **EffectManager** - Properly destroys all effect objects
6. **Renderers** - Use `Graphics.clear()` correctly (clears drawing commands, reuses Graphics object)

### ❌ Bad Patterns (Fixed)

1. **ZombieManager** - Was NOT calling `zombie.destroy()` ✅ FIXED
2. **Zombie setTimeout** - Was NOT tracking/clearing timeouts ✅ FIXED

---

## Testing Recommendations

### 1. Memory Profiling

Use Chrome DevTools Memory Profiler to verify fixes:

```
1. Open game in Chrome
2. Open DevTools > Memory tab
3. Take heap snapshot before starting game
4. Play through 5-10 waves
5. Take another heap snapshot
6. Compare snapshots - look for:
   - Zombie object count (should be near zero between waves)
   - Graphics object count (should be stable)
   - Event listener count (should not grow indefinitely)
```

### 2. Performance Monitoring

Monitor these metrics during gameplay:

```javascript
// Add to console for monitoring
setInterval(() => {
  console.log('Memory:', (performance.memory.usedJSHeapSize / 1048576).toFixed(2) + ' MB');
}, 5000);
```

### 3. Stress Testing

- Play to wave 20+ and monitor memory usage
- Should stay under 500MB for normal gameplay
- Previous 20GB leak should be eliminated

---

## Additional Findings

### Graphics.clear() vs Graphics.destroy()

**Important distinction:**

- `Graphics.clear()` - Clears drawing commands, keeps Graphics object for reuse ✅ CORRECT for renderers
- `Graphics.destroy()` - Destroys the Graphics object completely ✅ CORRECT for temporary objects

**Current usage is CORRECT:**

- Renderers use `clear()` to redraw each frame (efficient)
- Temporary effects use `destroy()` when done (proper cleanup)

### Event Listeners

- Zombie class extends GameObject which extends Container (EventEmitter)
- When `zombie.destroy()` is called, it properly cleans up event listeners via PixiJS
- The fix to call `zombie.destroy()` resolves this automatically

---

## Expected Results

### Before Fixes

- Memory usage: **Up to 20GB** in later levels
- Zombie objects: Accumulating indefinitely
- Performance: Degrading over time

### After Fixes

- Memory usage: **< 500MB** for normal gameplay
- Zombie objects: Properly cleaned up after death
- Performance: Stable across all waves

---

## Files Modified

1. `src/managers/ZombieManager.ts`
   - Added `zombie.destroy()` calls in `removeZombie()` and `clear()`

2. `src/objects/Zombie.ts`
   - Added `damageFlashTimeout` field
   - Modified `takeDamage()` to track and clear timeout
   - Added `destroy()` override to clean up timeout and renderer

---

## Conclusion

The primary memory leak was **zombies not being destroyed** in ZombieManager. This single issue was likely responsible for the majority of the 20GB memory usage, as each zombie contains:

- Multiple Graphics objects
- Component objects
- Event listeners
- Renderer objects with particle systems
- References to waypoints and other game objects

The secondary leak (setTimeout in damage flash) was a smaller but still important issue that could prevent garbage collection of zombie objects.

With these fixes applied, the game should maintain stable memory usage even in later levels with hundreds of zombies spawned.
