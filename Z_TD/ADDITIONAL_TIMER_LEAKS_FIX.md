# Additional Timer Memory Leaks Fixed

## Problem

Still seeing 6-7GB RAM usage by wave 25 after fixing the requestAnimationFrame leaks. Investigation revealed additional uncleaned `setTimeout` and `setInterval` calls throughout the codebase.

## Root Causes

Multiple files had raw timer calls not using `EffectCleanupManager`:

1. **Zombie renderers** - Damage flash effects using raw `setTimeout`
2. **Projectile.ts** - Tesla/default hit effects using raw `setTimeout`
3. **Zombie.ts** - Damage flash timeout not tracked
4. **Tower.ts** - Pulse animation using raw `setInterval`

## Files Fixed

### Zombie Renderers
- `src/renderers/zombies/types/ArmoredZombieRenderer.ts`
- `src/renderers/zombies/types/MechanicalZombieRenderer.ts`
- `src/renderers/zombies/types/TankZombieRenderer.ts`
- `src/renderers/zombies/types/StealthZombieRenderer.ts`

### Core Objects
- `src/objects/Zombie.ts`
- `src/objects/Projectile.ts`
- `src/objects/Tower.ts`

### Configuration
- `.vscode/launch.json` - Added debug mode for F5 debugging

## Changes Made

### 1. Zombie Renderer Damage Effects

**Before:**
```typescript
showDamageEffect(): void {
  const originalTint = this.graphics.tint;
  this.graphics.tint = 0xff0000;
  setTimeout(() => {
    this.graphics.tint = originalTint;
  }, 100);
}
```

**After:**
```typescript
showDamageEffect(): void {
  const originalTint = this.graphics.tint;
  this.graphics.tint = 0xff0000;
  const timeout = EffectCleanupManager.registerTimeout(
    setTimeout(() => {
      EffectCleanupManager.clearTimeout(timeout);
      if (!this.graphics.destroyed) {
        this.graphics.tint = originalTint;
      }
    }, 100)
  );
}
```

### 2. Projectile Hit Effects

**Before:**
```typescript
case 'tesla':
  this.visual.circle(0, 0, 10).fill({ color: 0x00bfff, alpha: 0.6 });
  setTimeout(() => {
    this.destroy();
  }, 100);
  break;
```

**After:**
```typescript
case 'tesla':
  this.visual.circle(0, 0, 10).fill({ color: 0x00bfff, alpha: 0.6 });
  EffectCleanupManager.registerTimeout(
    setTimeout(() => {
      this.destroy();
    }, 100)
  );
  break;
```

### 3. Zombie Damage Flash

**Before:**
```typescript
this.damageFlashTimeout = setTimeout(() => {
  if (this.visual) {
    this.visual.tint = 0xffffff;
  }
  this.damageFlashTimeout = null;
}, 100);
```

**After:**
```typescript
this.damageFlashTimeout = EffectCleanupManager.registerTimeout(
  setTimeout(() => {
    if (this.visual) {
      this.visual.tint = 0xffffff;
    }
    if (this.damageFlashTimeout !== null) {
      EffectCleanupManager.clearTimeout(this.damageFlashTimeout);
      this.damageFlashTimeout = null;
    }
  }, 100)
);
```

### 4. Tower Pulse Animation

**Before:**
```typescript
this.pulseInterval = setInterval(pulse, 50);

// Later...
if (this.pulseInterval) {
  clearInterval(this.pulseInterval);
  delete this.pulseInterval;
}
```

**After:**
```typescript
this.pulseInterval = EffectCleanupManager.registerInterval(setInterval(pulse, 50));

// Later...
if (this.pulseInterval) {
  EffectCleanupManager.clearInterval(this.pulseInterval);
  delete this.pulseInterval;
}
```

### 5. Debug Mode Configuration

**Before:**
```json
{
  "type": "chrome",
  "request": "launch",
  "name": "Launch Chrome with Vite",
  "url": "http://localhost:8080",
  "webRoot": "${workspaceFolder}",
  "sourceMaps": true,
  "preLaunchTask": "npm: dev"
}
```

**After:**
```json
{
  "type": "chrome",
  "request": "launch",
  "name": "Launch Chrome with Vite",
  "url": "http://localhost:8080?debug=true",
  "webRoot": "${workspaceFolder}",
  "sourceMaps": true,
  "preLaunchTask": "npm: dev",
  "env": {
    "DEBUG": "true"
  }
}
```

## Impact

- **Prevents timer leaks** from damage effects and animations
- **Enables proper cleanup** when objects are destroyed
- **Debug mode enabled** for F5 debugging with performance reports
- **Expected result**: Further reduction in memory usage toward target of <500MB

## Testing

1. Press F5 to launch with debug mode enabled
2. Play to wave 25
3. Check performance reports are generated
4. Verify memory usage is lower than 6-7GB
5. No timer-related errors in console

## Related Fixes

This complements previous memory leak fixes:
- `ZOMBIE_RENDERER_RAF_LEAK_FIX.md` - requestAnimationFrame cleanup
- `CRITICAL_MEMORY_LEAK_FIX.md` - setInterval → setTimeout conversion
- `GPU_MEMORY_LEAK_FIX.md` - Graphics.destroy({ children: true })
- `PERFORMANCE_FIX_WAVE20.md` - Spatial grid optimization

## Next Steps

If memory usage is still high after these fixes, investigate:
1. Particle system cleanup
2. Graphics object pooling
3. Texture/sprite caching
4. Event listener cleanup
5. Closure references in callbacks
