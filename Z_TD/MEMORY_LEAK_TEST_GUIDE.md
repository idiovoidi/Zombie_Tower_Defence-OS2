# Memory Leak Testing Guide

## Quick Memory Test (Browser Console)

### 1. Monitor Memory Usage in Real-Time

Open the browser console and run:

```javascript
// Start memory monitoring
const memoryMonitor = setInterval(() => {
  if (performance.memory) {
    const used = (performance.memory.usedJSHeapSize / 1048576).toFixed(2);
    const total = (performance.memory.totalJSHeapSize / 1048576).toFixed(2);
    const limit = (performance.memory.jsHeapSizeLimit / 1048576).toFixed(2);
    console.log(`📊 Memory: ${used}MB / ${total}MB (Limit: ${limit}MB)`);
  }
}, 5000);

// To stop monitoring:
// clearInterval(memoryMonitor);
```

### 2. Test Game Restart Memory Leak

```javascript
// Test multiple game restarts
let restartCount = 0;
const testRestart = () => {
  restartCount++;
  console.log(`\n🔄 Restart Test #${restartCount}`);
  console.log('Memory before:', (performance.memory.usedJSHeapSize / 1048576).toFixed(2) + 'MB');
  
  // Simulate game restart (you'll need to manually trigger this in the UI)
  // After each restart, check memory
};

// Call this after each game restart
testRestart();
```

### 3. Check for Orphaned Objects

```javascript
// Count game objects in memory (run in console)
const countObjects = () => {
  // This is a rough estimate - actual implementation depends on your game structure
  console.log('🔍 Checking for orphaned objects...');
  console.log('Note: Run this between games (after game over, before new game)');
  console.log('Expected: All counts should be 0 or very low');
};
```

---

## Chrome DevTools Memory Profiler Test

### Step-by-Step Memory Leak Detection

#### 1. Take Initial Snapshot
1. Open Chrome DevTools (F12)
2. Go to **Memory** tab
3. Select **Heap snapshot**
4. Click **Take snapshot** (Snapshot 1)

#### 2. Play First Game
1. Start a new game
2. Play through 5-10 waves
3. Let the game end (game over or victory)
4. Return to main menu

#### 3. Take Second Snapshot
1. In Memory tab, click **Take snapshot** (Snapshot 2)
2. Select Snapshot 2
3. Change view from "Summary" to **"Comparison"**
4. Compare with Snapshot 1

#### 4. Analyze Results

**What to Look For:**

✅ **GOOD (No Leak):**
- Zombie objects: 0 or very few
- Graphics objects: Stable count
- Container objects: Stable count
- Total size delta: < 50MB

❌ **BAD (Memory Leak):**
- Zombie objects: Hundreds/thousands
- Graphics objects: Growing significantly
- Container objects: Growing significantly
- Total size delta: > 500MB

#### 5. Repeat Test
1. Start another game
2. Play through 5-10 waves
3. End game
4. Take Snapshot 3
5. Compare with Snapshot 2

**Expected Result:**
- Memory delta between Snapshot 2 and 3 should be similar to Snapshot 1 and 2
- No continuous growth pattern

---

## Automated Restart Test

### Test Script (Run in Browser Console)

```javascript
// Automated memory leak test
// WARNING: This will restart the game multiple times
// Make sure you're in the main menu before running

const runMemoryLeakTest = async () => {
  console.log('🧪 Starting Memory Leak Test...');
  console.log('This will restart the game 5 times and measure memory');
  
  const results = [];
  
  for (let i = 0; i < 5; i++) {
    console.log(`\n--- Test Run ${i + 1}/5 ---`);
    
    // Record memory before
    const memBefore = performance.memory.usedJSHeapSize / 1048576;
    console.log(`Memory before: ${memBefore.toFixed(2)}MB`);
    
    // You'll need to manually:
    // 1. Start game
    // 2. Play for a bit
    // 3. End game
    // 4. Return to menu
    
    console.log('⏸️ Waiting for manual game completion...');
    console.log('Press Enter in console when back at main menu');
    
    await new Promise(resolve => {
      const checkInterval = setInterval(() => {
        // Check if user pressed enter or game state changed
        // This is a placeholder - implement based on your game state
        clearInterval(checkInterval);
        resolve();
      }, 1000);
    });
    
    // Record memory after
    const memAfter = performance.memory.usedJSHeapSize / 1048576;
    console.log(`Memory after: ${memAfter.toFixed(2)}MB`);
    
    const delta = memAfter - memBefore;
    console.log(`Memory delta: ${delta.toFixed(2)}MB`);
    
    results.push({
      run: i + 1,
      before: memBefore,
      after: memAfter,
      delta: delta
    });
  }
  
  console.log('\n📊 Test Results Summary:');
  console.table(results);
  
  // Analyze results
  const avgDelta = results.reduce((sum, r) => sum + r.delta, 0) / results.length;
  console.log(`\nAverage memory delta: ${avgDelta.toFixed(2)}MB`);
  
  if (avgDelta < 50) {
    console.log('✅ PASS: Memory usage is stable');
  } else if (avgDelta < 200) {
    console.log('⚠️ WARNING: Some memory growth detected');
  } else {
    console.log('❌ FAIL: Significant memory leak detected');
  }
};

// Run the test
// runMemoryLeakTest();
```

---

## Manual Testing Checklist

### Before Fix (Expected Behavior)
- [ ] Memory starts at ~300MB
- [ ] After 1st game: ~800MB
- [ ] After 2nd game: ~1.5GB
- [ ] After 3rd game: ~2.5GB
- [ ] After 5th game: ~5GB+
- [ ] Game becomes sluggish
- [ ] Browser may crash

### After Fix (Expected Behavior)
- [ ] Memory starts at ~300MB
- [ ] After 1st game: ~400-500MB
- [ ] After 2nd game: ~400-500MB (stable)
- [ ] After 3rd game: ~400-500MB (stable)
- [ ] After 5th game: ~400-500MB (stable)
- [ ] Game remains smooth
- [ ] No browser crashes

---

## Performance Monitoring

### FPS and Memory Combined

```javascript
// Monitor both FPS and memory
let lastTime = performance.now();
let frames = 0;

const monitor = setInterval(() => {
  const now = performance.now();
  const fps = Math.round(frames * 1000 / (now - lastTime));
  frames = 0;
  lastTime = now;
  
  const mem = performance.memory 
    ? (performance.memory.usedJSHeapSize / 1048576).toFixed(2) + 'MB'
    : 'N/A';
  
  console.log(`FPS: ${fps} | Memory: ${mem}`);
}, 1000);

// Count frames
const countFrame = () => {
  frames++;
  requestAnimationFrame(countFrame);
};
countFrame();

// To stop:
// clearInterval(monitor);
```

---

## Expected Test Results

### Memory Usage Over Time (After Fix)

```
Game Start:     300MB
Wave 5:         350MB
Wave 10:        400MB
Game Over:      420MB
New Game:       350MB  ← Should drop back down
Wave 5:         400MB
Wave 10:        450MB
Game Over:      470MB
New Game:       350MB  ← Should drop back down again
```

### Memory Usage Pattern

**GOOD (No Leak):**
```
Game 1: 300 → 400 → 350 (after cleanup)
Game 2: 350 → 450 → 350 (after cleanup)
Game 3: 350 → 450 → 350 (after cleanup)
```

**BAD (Memory Leak):**
```
Game 1: 300 → 400 → 400 (no cleanup)
Game 2: 400 → 900 → 900 (no cleanup)
Game 3: 900 → 1800 → 1800 (no cleanup)
```

---

## Troubleshooting

### If Memory Still Growing

1. **Check Console for Cleanup Logs**
   - Should see: "🧹 Cleaning up previous game state..."
   - Should see: "✓ Zombies cleared"
   - Should see: "✓ Towers cleared"
   - Should see: "✓ Projectiles cleared"

2. **Verify EffectCleanupManager**
   - Should see: "🧹 Cleaned up X orphaned intervals"
   - Should see: "🧹 Cleaned up X orphaned timeouts"

3. **Check for Errors**
   - Look for any errors in console during cleanup
   - Check if destroy() methods are being called

4. **Use Memory Profiler**
   - Take heap snapshots
   - Look for "Detached" objects
   - Search for specific object types (Zombie, Tower, Projectile)

---

## Success Criteria

✅ Memory usage stabilizes after multiple restarts
✅ No continuous growth pattern
✅ FPS remains stable (55-60 FPS)
✅ No browser crashes
✅ Cleanup logs appear in console
✅ Heap snapshots show proper cleanup

