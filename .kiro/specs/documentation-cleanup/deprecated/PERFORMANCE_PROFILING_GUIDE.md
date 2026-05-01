# Performance Profiling Guide for Waves 20-30

## Quick Performance Check

Use the built-in performance monitoring tools to identify bottlenecks:

### 1. Enable Performance Monitoring

```javascript
// In browser console
debugPerformance();
```

This shows:

- Frame time (target: <16.67ms for 60 FPS)
- System times (which managers are slow)
- Entity counts
- Memory usage

### 2. Enable Optimization Validation

```javascript
// In browser console
debugOptimizationsEnable();

// Play for a few waves, then check results
debugOptimizations();
```

This shows:

- Target finding efficiency
- Array rebuild frequency
- Object allocation rates

### 3. Check Resource Cleanup

```javascript
// In browser console
debugCleanup();
```

This shows:

- Persistent effects count
- Active timers
- Graphics objects
- Potential memory leaks

## Common Performance Bottlenecks (Waves 20-30)

### 1. Text Object Spam ✅ FIXED

**Symptom:** Frame drops when zombies die
**Cause:** Creating 100+ Text objects per wave
**Solution:** Batched money animations (implemented)

### 2. Zombie Count

**Symptom:** Consistent frame drops throughout wave
**Cause:** Too many zombies (120+ at wave 20)
**Check:**

```javascript
// In console during gameplay
gameManager.getZombieManager().getZombies().length;
```

**Solutions:**

- Reduce zombie count per wave
- Increase spawn intervals
- Optimize zombie rendering

### 3. Spatial Grid Inefficiency

**Symptom:** Slow target finding
**Cause:** Grid cells too large or too small
**Check:**

```javascript
// Enable optimization validator
debugOptimizationsEnable();
// Play for a few waves
debugOptimizations();
// Look at "Target Finding" metrics
```

**Solutions:**

- Adjust cell size in `TowerCombatManager` constructor
- Current: 128px (optimal for 150-300px tower ranges)

### 4. Particle Overflow

**Symptom:** Frame drops during intense combat
**Cause:** Too many blood particles
**Check:**

```javascript
gameManager.getZombieManager().getBloodParticleSystem().getStats();
```

**Current Limits:**

- Blood particles: 200 max ✅
- Corpses: 50 max ✅

### 5. Memory Leaks

**Symptom:** Performance degrades over time
**Cause:** Objects not properly destroyed
**Check:**

```javascript
debugCleanup();
// Look for high persistent effect counts (>20)
```

**Solutions:**

- Verify all Graphics objects are destroyed
- Check timer cleanup
- Monitor memory growth

### 6. Projectile Spam

**Symptom:** Frame drops when many towers fire
**Cause:** Too many active projectiles
**Check:**

```javascript
gameManager.getTowerCombatManager().getProjectileManager().getProjectiles().length;
```

**Solutions:**

- Limit projectiles per tower type
- Increase projectile speed (shorter lifetime)
- Pool projectiles (already implemented)

### 7. Effect Spam

**Symptom:** Frame drops during combat
**Cause:** Too many visual effects (muzzle flashes, casings, etc.)
**Check:**

```javascript
// Check effect counts
gameManager.getEffectManager().getEffectCounts();
```

**Current Limits:**

- Shell casings: 50 max ✅
- Muzzle flashes: 30 max ✅
- Bullet trails: 20 max ✅

## Performance Targets

### Frame Time Budget (60 FPS = 16.67ms)

- **Zombie updates:** <3ms
- **Tower combat:** <2ms
- **Projectiles:** <1ms
- **Effects:** <1ms
- **UI updates:** <1ms
- **Rendering:** <8ms
- **Other:** <1.67ms

### Entity Count Targets (Wave 20)

- **Zombies:** 30-50 active (120 total spawned over time)
- **Towers:** 10-20
- **Projectiles:** 20-40
- **Particles:** <200
- **Corpses:** <50
- **Effects:** <100

### Memory Targets

- **Wave 5:** <400 MB
- **Wave 10:** <450 MB
- **Wave 20:** <500 MB
- **Wave 30:** <550 MB

## Profiling Workflow

### Step 1: Baseline Measurement

```javascript
// Start game
debugPerformance();
debugOptimizationsEnable();

// Play to wave 20
// Note frame times and entity counts
```

### Step 2: Identify Bottleneck

```javascript
// Check which system is slow
debugPerformance();
// Look at "System Times" section

// Check optimization effectiveness
debugOptimizations();
```

### Step 3: Apply Fix

- Reduce entity counts
- Optimize slow systems
- Add pooling/caching
- Improve algorithms

### Step 4: Verify Improvement

```javascript
// Play to wave 20 again
debugPerformance();
debugOptimizations();

// Compare before/after metrics
```

## Quick Fixes for Common Issues

### Frame Rate Drops

1. **Check entity counts** - Reduce if too high
2. **Enable optimization validator** - Verify optimizations working
3. **Check memory** - Look for leaks
4. **Profile systems** - Find slow manager

### Memory Growth

1. **Check cleanup** - `debugCleanup()`
2. **Monitor wave memory** - Should stabilize
3. **Check persistent effects** - Should be <20
4. **Verify destruction** - All Graphics destroyed

### Stuttering

1. **Check array rebuilds** - Should be <5% of frames
2. **Check allocations** - Should use pooling
3. **Check GC pauses** - Reduce allocations
4. **Check timer cleanup** - No orphaned timers

## Browser DevTools Profiling

### Chrome Performance Tab

1. Open DevTools (F12)
2. Go to Performance tab
3. Click Record
4. Play game for 30 seconds
5. Stop recording
6. Analyze flame graph

**Look for:**

- Long frames (>16.67ms)
- Repeated function calls
- Memory allocations
- Layout thrashing

### Memory Tab

1. Open DevTools (F12)
2. Go to Memory tab
3. Take heap snapshot
4. Play for a few waves
5. Take another snapshot
6. Compare snapshots

**Look for:**

- Growing object counts
- Detached DOM nodes
- Large arrays
- Memory leaks

## Optimization Checklist

- [x] Money animation batching
- [x] Blood particle limits
- [x] Corpse limits
- [x] Effect pooling
- [x] Projectile pooling
- [x] Spatial grid for target finding
- [x] Dirty flags for array rebuilds
- [ ] Zombie count reduction (if needed)
- [ ] Render culling (if needed)
- [ ] LOD system (if needed)

## Conclusion

Use these tools and techniques to identify and fix performance bottlenecks. The game should maintain 60 FPS even at wave 30+ with proper optimization.
