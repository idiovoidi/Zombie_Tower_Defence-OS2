# Memory Management Documentation

## Overview

This directory contains comprehensive documentation for the Z-TD game's memory management and cleanup systems. The game uses a centralized cleanup architecture to prevent memory leaks and ensure stable performance across extended gameplay sessions.

---

## Documents in This Directory

### [CLEANUP_GUIDE.md](./CLEANUP_GUIDE.md)
**Purpose:** Comprehensive guide to cleanup patterns and disposal architecture

**Contents:**
- Core cleanup architecture (EffectCleanupManager + ResourceCleanupManager)
- The three-step disposal pattern
- Cleanup flow and order
- Persistent effect registration
- Disposal checklist by system
- Memory leak patterns and solutions
- Best practices
- Debugging and monitoring

**Use this when:**
- Implementing new game objects that need cleanup
- Adding new persistent effects
- Debugging memory issues
- Understanding the cleanup system architecture

---

### [MEMORY_LEAK_GUIDE.md](./MEMORY_LEAK_GUIDE.md)
**Purpose:** Documentation of all memory leak investigations, fixes, and testing procedures

**Contents:**
- Critical memory leaks found and fixed
- Detailed fix descriptions with code examples
- Memory leak testing guide
- Chrome DevTools profiling instructions
- Manual testing checklist
- Expected memory behavior
- Troubleshooting guide

**Use this when:**
- Investigating potential memory leaks
- Testing memory usage
- Verifying fixes
- Understanding historical memory issues

---

### Additional Files

#### DISPOSAL_ARCHITECTURE.md
Detailed disposal architecture and memory management patterns. Covers the three-step disposal pattern, manager hierarchy, and object lifecycle management.

#### MEMORY_OPTIMIZATION_GUIDE.md
Guide to memory optimization techniques, including object pooling, texture management, and performance monitoring.

#### PERSISTENT_EFFECTS_FIX.md
Detailed documentation of the persistent effects memory leak fix, including the transition from timer-based tracking to direct Graphics object tracking.

#### TESLA_LIGHTNING_PERSISTENCE_FIX.md
Documentation of the Tesla lightning persistence bug fix, including cleanup order issues and protection against already-destroyed objects.

#### TESLA_PARTICLE_FIX.md
Documentation of the Tesla particle memory leak fix, covering the two critical bugs: wrong cleanup order and no protection against already-destroyed objects.

---

## Quick Reference

### Creating Objects That Need Cleanup

```typescript
public destroy(): void {
  // 1. Clear timers FIRST
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

### Registering Persistent Effects

```typescript
// Create effect
const firePool = new Graphics();
this.parent.addChild(firePool);

// Register immediately
ResourceCleanupManager.registerPersistentEffect(firePool, {
  type: 'fire_pool',
  duration: 2000,
});

// Unregister when done
ResourceCleanupManager.unregisterPersistentEffect(firePool);
```

### Tracking Timers

```typescript
// Register interval
const interval = EffectCleanupManager.registerInterval(
  setInterval(() => { ... }, 16)
);

// Register timeout
const timeout = EffectCleanupManager.registerTimeout(
  setTimeout(() => { ... }, 1000)
);

// Clear when done
EffectCleanupManager.clearInterval(interval);
EffectCleanupManager.clearTimeout(timeout);
```

---

## Memory Budget Guidelines

### Target Memory Usage
- **Idle (Menu):** < 100MB
- **Early Game (Waves 1-5):** < 200MB
- **Mid Game (Waves 6-15):** < 350MB
- **Late Game (Waves 16+):** < 500MB

### Warning Thresholds
- **> 10 active intervals:** Possible leak
- **> 100 corpses:** Cleanup not working
- **> 1GB memory:** Critical leak

---

## Debugging Tools

### Check Current State

```typescript
// Resource cleanup state
ResourceCleanupManager.logState();

// Timer state
EffectCleanupManager.logState();
```

### Monitor Memory

```javascript
// Browser console
setInterval(() => {
  const memory = (performance.memory.usedJSHeapSize / 1048576).toFixed(2);
  console.log(`Memory: ${memory} MB`);
}, 5000);
```

---

## Related Code Files

### Core Cleanup Managers
- `src/utils/ResourceCleanupManager.ts` - High-level resource orchestration
- `src/utils/EffectCleanupManager.ts` - Low-level timer tracking

### Game Managers
- `src/managers/GameManager.ts` - Uses cleanup system for wave and game cleanup
- `src/managers/ZombieManager.ts` - Zombie disposal
- `src/managers/ProjectileManager.ts` - Projectile disposal
- `src/managers/TowerPlacementManager.ts` - Tower disposal

### Game Objects
- `src/objects/Zombie.ts` - Zombie cleanup implementation
- `src/objects/Tower.ts` - Tower cleanup implementation
- `src/objects/Projectile.ts` - Projectile cleanup and persistent effects

---

## Historical Context

The Z-TD game experienced severe memory leaks consuming up to 20GB of RAM. Through systematic investigation, the following issues were identified and resolved:

1. **Zombies not being destroyed** (PRIMARY cause)
2. **Game state not cleared between games**
3. **EffectManager not instantiated or updated**
4. **Untracked setTimeout calls**
5. **Persistent effects not cleaned up between waves**
6. **Wrong cleanup order** (objects destroyed before timers cleared)

All issues have been completely fixed, and the game now maintains stable memory usage (< 500MB) even after dozens of waves and multiple restarts.

---

## Best Practices Summary

### DO:
✅ Always call `.destroy()` on PixiJS objects
✅ Track all timers with EffectCleanupManager
✅ Clear object references in destroy() methods
✅ Register persistent effects immediately
✅ Test memory usage over extended gameplay

### DON'T:
❌ Use setInterval/setTimeout without tracking
❌ Remove objects from parent without destroying
❌ Hold references to destroyed objects
❌ Forget to call super.destroy()
❌ Destroy objects before clearing their timers

---

**Last Updated:** October 25, 2025
**Status:** ✅ All critical memory leaks resolved
