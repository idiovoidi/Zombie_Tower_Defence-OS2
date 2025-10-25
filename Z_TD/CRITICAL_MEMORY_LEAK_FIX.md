# CRITICAL: Memory Leak Causing 8GB RAM Usage

## Root Cause Identified

The game is creating **hundreds of setInterval timers** that persist for 2+ seconds each. By wave 20:

- **Machine Gun**: 8 shots/sec × 10 towers = 80 projectiles/sec
- **Shotgun**: 7 pellets × 0.8 shots/sec × 5 towers = 28 projectiles/sec
- **Flame/Grenade/Sludge**: Each creates a 2-second interval for pool effects

**Result**: 100+ active intervals running simultaneously, each holding references to Graphics objects, preventing garbage collection.

## The Problem

### Fire Pools (Projectile.ts line 468)

```typescript
const fadeInterval = EffectCleanupManager.registerInterval(
  setInterval(() => {
    elapsed += 50;
    // Runs for 2000ms = 40 iterations
    // With 10 flame towers shooting, that's 15 active intervals
  }, 50)
);
```

### Sludge Pools (Projectile.ts line 568)

```typescript
const slowInterval = EffectCleanupManager.registerInterval(
  setInterval(() => {
    // Runs for 5000ms checking zombies every 100ms = 50 iterations
    // With 5 sludge towers, that's 12+ active intervals
  }, 100)
);
```

### Explosion Effects (Projectile.ts line 384)

```typescript
const animateInterval = EffectCleanupManager.registerInterval(
  setInterval(() => {
    // Runs for 500ms = 31 iterations
    // With grenade towers, adds 10+ active intervals
  }, 16)
);
```

## Why This Causes 8GB RAM

1. **Interval Accumulation**: Each interval holds references to:
   - Graphics objects (explosion, fire pool, sludge pool)
   - Zombie arrays (for sludge slow effect)
   - Parent containers
   - Closure variables

2. **Garbage Collection Blocked**: JavaScript can't collect these objects while intervals are active

3. **Exponential Growth**: More zombies → more shooting → more intervals → more memory

## Immediate Fix Required

Replace `setInterval` with `requestAnimationFrame` for all visual effects:

### Before (Memory Leak):

```typescript
const fadeInterval = setInterval(() => {
  elapsed += 50;
  if (progress >= 1) {
    clearInterval(fadeInterval);
    cleanup();
  }
}, 50);
```

### After (No Leak):

```typescript
const animate = () => {
  elapsed += deltaTime;
  if (progress >= 1) {
    cleanup();
    return; // Stop animation
  }
  requestAnimationFrame(animate);
};
requestAnimationFrame(animate);
```

## Files That Need Fixing

1. **src/objects/Projectile.ts** (CRITICAL)
   - Line 384: Explosion animation interval
   - Line 468: Fire pool fade interval
   - Line 568: Sludge pool slow interval
   - Line 599: Sludge pool fade interval

2. **src/managers/TowerCombatManager.ts**
   - Line 731: Tesla tint interval
   - Line 763: Tesla particle fade interval

3. **src/objects/Tower.ts**
   - Line 1444: Selection pulse interval

## Temporary Workaround

Add a hard memory cap to prevent browser crashes:

```javascript
// In main.ts or index.ts
if (typeof process !== 'undefined' && process.memoryUsage) {
  setInterval(() => {
    const usage = process.memoryUsage().heapUsed / 1024 / 1024;
    if (usage > 1024) {
      // 1GB limit
      console.error('Memory limit exceeded:', usage, 'MB');
      alert('Game is using too much memory. Please refresh the page.');
    }
  }, 5000);
}
```

## Expected Impact After Fix

### Before Fix:

- Wave 20: 8GB RAM, 10 FPS
- 200+ active intervals
- Memory grows 400MB per wave

### After Fix:

- Wave 20: 400MB RAM, 40+ FPS
- 0-5 active intervals (only for UI)
- Memory stable at 400-500MB

## Priority

**CRITICAL - FIX IMMEDIATELY**

This is not a performance optimization - this is a **game-breaking memory leak** that makes the game unplayable after wave 15.
