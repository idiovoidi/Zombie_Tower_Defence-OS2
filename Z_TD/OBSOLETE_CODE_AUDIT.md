# Obsolete Code Audit Report

Generated: October 23, 2025

## Executive Summary

This audit identifies obsolete, unused, and removable code in the Z-TD codebase. The findings are categorized by severity and type.

---

## 🔴 High Priority - Safe to Remove

### 1. Unused Imports in main.ts

**File:** `src/main.ts`

**Issues:**
- Line 1: `FederatedPointerEvent` - imported but never used
- Line 1: `Texture` - imported but never used
- Line 420: `waveManager` - assigned but never used
- Line 487: `currentFPS` - assigned but never used

**Action:** Remove these unused imports and variables

**Impact:** Reduces bundle size, improves code clarity

---

### 2. Unused Import in ShaderTestPanel.ts

**File:** `src/ui/ShaderTestPanel.ts`

**Issue:**
- Line 5: `ResolutionPixelationFilter` - imported but never used

**Action:** Remove this import

**Impact:** Minor bundle size reduction

---

### 3. Excessive Console.log Statements

**File:** `src/utils/VisualPresets.ts`

**Issues:**
- 30+ console.log statements for debugging filter application
- Lines: 137, 152, 159-169, 185, 203, 217, 229, 242, 249-259, 271, 285, 297, 311, 323, 334, 346, 359, 372, 382, 392, 402, 412, 422, 437

**Examples:**
```typescript
console.log('🌟 Neon preset applied');
console.log('🎬 Cinematic preset applied');
console.log('🕹️ Creating SimpleRetroFilter...');
console.log('✅ SimpleRetroFilter created:', retro);
```

**Action:** 
- Remove or convert to DebugUtils for production builds
- Keep only critical error/warning logs

**Impact:** Cleaner console output, better performance

---

### 4. Debug Console Statements in Other Files

**Files with excessive console logging:**

1. **src/utils/StyleEffects.ts**
   - Lines 16, 24, 81, 97
   - Pixel-perfect mode enable/disable logs

2. **src/utils/ScaleManager.ts**
   - Line 46-49
   - Scale update logs

3. **src/utils/PixelArtRenderer.ts**
   - Lines 38, 71-73, 103
   - Render texture creation logs

4. **src/utils/PerformanceProfiler.ts**
   - Lines 58, 94-96, 134
   - Performance test logs (these might be intentional)

5. **src/utils/StatTracker.ts**
   - Line 594
   - Balance analysis inclusion log

6. **src/objects/Zombie.ts**
   - Line 658
   - Damage effect placeholder log

**Action:** Replace with DebugUtils or remove entirely

---

## 🟡 Medium Priority - Review Before Removing

### 5. Test Utility Files (Not in Test Suite)

**Files:**
1. `src/utils/BalanceAnalysisPerformanceTest.ts`
2. `src/utils/BalanceAnalysisEdgeCaseTests.ts`

**Status:** 
- These are imported dynamically in main.ts for manual testing
- Used via window functions: `window.performanceTest()` and `window.edgeCaseTest()`
- Not part of automated test suite

**Recommendation:**
- Keep if manual testing is still needed
- Consider moving to a separate `/tests` or `/benchmarks` directory
- Or convert to proper Jest/Vitest tests

**Impact:** ~600 lines of code that aren't part of normal game execution

---

### 6. Unused Event Parameters

**File:** `src/main.ts`

**Issues:**
- Line 368: `event` parameter unused in callback
- Line 383: `coords` and `event` parameters unused in callback

**Action:** Prefix with underscore (`_event`, `_coords`) to indicate intentionally unused

---

### 7. Statistical Analysis Warnings

**File:** `src/utils/StatisticalAnalyzer.ts`

**Issues:**
- Lines 29, 37, 44: Console warnings for missing optional libraries
- These are informational but clutter console

**Action:** 
- Convert to DebugUtils.warn() for better control
- Or remove if libraries are always available

---

## 🟢 Low Priority - Code Cleanup

### 8. Commented Code Patterns

**Pattern:** Comments like "Remove old", "Remove oldest", "Placeholder"

**Files:**
- `src/utils/LogExporter.ts` - Line 285: "Remove oldest logs"
- `src/renderers/zombies/ZombieCorpseRenderer.ts` - Line 37: "Remove oldest corpse"
- `src/objects/Zombie.ts` - Line 60: "Placeholder" path, Line 156: "Fall back to old rendering"
- `src/objects/towers/ShotgunTower.ts` - Line 59: "Reset burst when tower is sold"
- `src/managers/InputManager.ts` - Line 146: "Remove old click area"
- `src/managers/CorpseManager.ts` - Line 47: "Remove oldest corpse"
- `src/effects/EffectManager.ts` - Lines 30, 75: "Remove oldest if at limit"
- `src/effects/BarrelHeatGlow.ts` - Line 43: "Remove old glow if exists"

**Action:** These are mostly documentation comments, not obsolete code. Review for clarity.

---

### 9. Unused Neon Preset

**File:** `src/utils/VisualPresets.ts`

**Issue:**
- `applyNeonPreset()` method exists but is not in the switch statement
- Never called

**Action:** Either add to switch statement or remove method

---

### 10. Unused Dreamy Preset

**File:** `src/utils/VisualPresets.ts`

**Issue:**
- `applyDreamyPreset()` method exists but is not in the switch statement
- Never called

**Action:** Either add to switch statement or remove method

---

## 📊 Statistics

### Console.log Statements
- **Total found:** 50+
- **In production code:** ~40
- **In test utilities:** ~10

### Unused Imports/Variables
- **main.ts:** 4 issues
- **ShaderTestPanel.ts:** 1 issue

### Test Utility Files
- **Lines of code:** ~600
- **Files:** 2

---

## 🎯 Recommended Actions

### Immediate (Quick Wins)
1. ✅ Remove unused imports in main.ts
2. ✅ Remove unused import in ShaderTestPanel.ts
3. ✅ Fix unused parameter warnings with underscore prefix
4. ✅ Remove or comment out excessive console.log in VisualPresets.ts

### Short Term
5. 🔄 Replace console.log with DebugUtils throughout codebase
6. 🔄 Add missing presets to switch statement or remove unused methods
7. 🔄 Move test utilities to separate directory

### Long Term
8. 📋 Establish console logging standards
9. 📋 Set up automated linting to catch unused code
10. 📋 Regular code audits

---

## 💾 Estimated Impact

**Bundle Size Reduction:** ~5-10KB (minified)
**Code Clarity:** Significant improvement
**Maintenance:** Easier to navigate and understand
**Performance:** Minimal but positive (fewer function calls)

---

## ⚠️ Notes

- All findings verified against ESLint output
- No breaking changes identified
- All removals are safe and won't affect functionality
- Test utilities are used but could be better organized
