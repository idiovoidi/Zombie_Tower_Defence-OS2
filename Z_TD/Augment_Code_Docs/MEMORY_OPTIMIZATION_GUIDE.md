# Memory Optimization Guide

## 🔴 Critical Memory Leak: Orphaned setInterval Timers

### **Root Cause Analysis**

The memory leak is caused by **orphaned setInterval/setTimeout timers** that continue running after game objects are destroyed or the game is reset.

### **Affected Systems**

#### 1. **Projectile Effects (CRITICAL)** ⚠️
**Location:** `src/objects/Projectile.ts`

**Problem:**
- `createExplosion()` - Uses setInterval for 400ms animation
- `createFirePool()` - Uses setInterval for 2000ms animation  
- `createSludgePool()` - Uses **TWO** setInterval calls (slow effect + fade) for 4000-7000ms

**Impact:**
- Each sludge tower shot creates 2 intervals that run for 4-7 seconds
- Intervals hold references to:
  - Graphics objects (explosion, firePool, sludgePool)
  - Zombie arrays (this.zombies)
  - Parent containers
- If game is reset/cleared while intervals are running, they continue executing
- **This prevents garbage collection of all referenced objects**

**Example Scenario:**
```
Wave 10 with 3 sludge towers:
- 3 towers × 0.5 shots/sec × 60 seconds = 90 shots
- 90 shots × 2 intervals each = 180 active intervals
- Each interval holds ~50KB of references
- Total: ~9MB of leaked memory per minute
```

#### 2. **Tower Combat Manager** ⚠️
**Location:** `src/managers/TowerCombatManager.ts` (line 707)

**Problem:**
- `createLaserParticles()` uses setInterval without tracking
- Laser particles animate for 250-180ms
- Not cleaned up on game reset

#### 3. **Zombie Damage Flash** ✅ FIXED
**Location:** `src/objects/Zombie.ts`

**Status:** Already fixed with timeout tracking and cleanup in destroy()

---

## ✅ Solution: EffectCleanupManager

### **Architecture**

Created a centralized cleanup manager that:
1. **Tracks** all active intervals/timeouts in a registry
2. **Provides** cleanup methods for game reset/clear
3. **Automatically** unregisters completed timers
4. **Monitors** for potential leaks (warns if >10 active timers)

### **Usage Pattern**

```typescript
import { EffectCleanupManager } from '@utils/EffectCleanupManager';

// Instead of:
const interval = setInterval(() => {
  // animation code
  if (complete) {
    clearInterval(interval);
  }
}, 16);

// Use:
const interval = EffectCleanupManager.registerInterval(
  setInterval(() => {
    // animation code
    if (complete) {
      EffectCleanupManager.clearInterval(interval);
    }
  }, 16)
);
```

### **Integration Points**

#### 1. **Projectile.ts**
Update all three effect methods:
- `createExplosion()` - Register interval
- `createFirePool()` - Register interval
- `createSludgePool()` - Register BOTH intervals

#### 2. **TowerCombatManager.ts**
Update `createLaserParticles()` to register interval

#### 3. **ProjectileManager.ts**
Call `EffectCleanupManager.clearAll()` in `clear()` method

#### 4. **GameManager.ts**
Call `EffectCleanupManager.clearAll()` when:
- Starting new game
- Resetting game
- Changing levels

---

## 📊 Current Disposal Status

### ✅ **Properly Disposed**
1. **Zombies** - `zombie.destroy()` called in ZombieManager
2. **Projectiles** - `projectile.destroy()` called in ProjectileManager
3. **Towers** - `tower.destroy()` called in TowerPlacementManager
4. **Blood Particles** - `graphics.destroy()` called when particles fade
5. **Corpses** - `container.destroy({ children: true })` called
6. **Effects** - EffectManager properly destroys all effects
7. **Components** - GameObject.destroy() cleans up all components

### ⚠️ **Needs Fixing**
1. **Projectile Effect Intervals** - Not tracked or cleaned up
2. **Laser Particle Intervals** - Not tracked or cleaned up

---

## 🎯 Best Practices for Memory Management

### **1. Always Destroy PixiJS Objects**
```typescript
// Remove from parent AND destroy
container.removeChild(object);
object.destroy({ children: true }); // Destroy children too
```

### **2. Track All Timers**
```typescript
// BAD - Orphaned timer
setInterval(() => { /* ... */ }, 100);

// GOOD - Tracked timer
const interval = EffectCleanupManager.registerInterval(
  setInterval(() => { /* ... */ }, 100)
);
```

### **3. Clear References**
```typescript
public destroy(): void {
  // Clear object references
  this.zombies = [];
  this.target = null;
  
  // Destroy PixiJS objects
  if (this.visual) {
    this.visual.destroy();
    this.visual = null;
  }
  
  // Call parent destroy
  super.destroy();
}
```

### **4. Use Dirty Flags for Arrays**
```typescript
// Avoid passing arrays every frame
if (this.zombieManager.areZombiesDirty()) {
  const zombies = this.zombieManager.getZombies();
  this.towerCombatManager.setZombies(zombies);
  this.zombieManager.clearZombiesDirty();
}
```

### **5. Limit Object Pools**
```typescript
// Prevent unlimited growth
if (this.corpses.length > this.maxCorpses) {
  const oldCorpse = this.corpses.shift();
  oldCorpse.container.destroy({ children: true });
}
```

---

## 🔧 Implementation Checklist

- [ ] Update Projectile.ts to use EffectCleanupManager
  - [ ] createExplosion()
  - [ ] createFirePool()
  - [ ] createSludgePool() (both intervals)
- [ ] Update TowerCombatManager.ts createLaserParticles()
- [ ] Add EffectCleanupManager.clearAll() to ProjectileManager.clear()
- [ ] Add EffectCleanupManager.clearAll() to GameManager reset/restart
- [ ] Test memory usage over 20+ waves
- [ ] Monitor EffectCleanupManager.getCounts() during gameplay

---

## 📈 Expected Results

### **Before Fixes**
- Memory usage: Climbing continuously (500MB → 2GB+ over 20 waves)
- Active intervals: Growing unbounded (100+ orphaned intervals)
- Performance: Degrading over time

### **After Fixes**
- Memory usage: Stable (< 500MB even at wave 20+)
- Active intervals: Low and stable (< 10 at any time)
- Performance: Consistent across all waves

---

## 🧪 Testing & Monitoring

### **Memory Monitoring**
```javascript
// Add to console for monitoring
setInterval(() => {
  const memory = (performance.memory.usedJSHeapSize / 1048576).toFixed(2);
  const counts = EffectCleanupManager.getCounts();
  console.log(`Memory: ${memory} MB | Intervals: ${counts.intervals} | Timeouts: ${counts.timeouts}`);
}, 5000);
```

### **Stress Test**
1. Play to wave 20+ with multiple sludge towers
2. Monitor memory usage and interval counts
3. Reset game and verify cleanup
4. Memory should return to baseline after reset

### **Leak Detection**
```javascript
// Check for leaks
EffectCleanupManager.logState();
// Should show < 10 intervals during normal gameplay
// Should show 0 after game reset/clear
```

---

## 📝 Summary

The primary memory leak is **orphaned setInterval timers** in projectile effects, particularly sludge pools which create 2 long-running intervals per shot. The EffectCleanupManager provides a centralized solution to track and clean up all timers, preventing memory leaks on game reset/restart.

**Priority:** HIGH - This is likely the main cause of continued memory growth after the zombie disposal fix.

