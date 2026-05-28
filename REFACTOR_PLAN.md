# Refactor Plan — Duplicate Code Elimination

Generated from `jscpd` analysis: **116 clones, 4.58% duplication** across 161 TypeScript files.

---

## Priority 1 — AIPlayerManager + StatTracker

**Problem:** `AIPlayerManager` duplicates nearly the entire body of `StatTracker` — identical stat interfaces, `createEmptyStats()`, wave tracking, economy tracking, combat tracking, and JSON export logic (~1000 lines of overlap).

**Fix:** `AIPlayerManager` should delegate to `StatTracker` instead of maintaining its own parallel stats. Remove the `AIPerformanceStats` interface and all duplicated tracking methods from `AIPlayerManager`, replacing them with calls to the existing `StatTracker` instance.

Files touched:
- `src/managers/AIPlayerManager.ts`
- `src/utils/StatTracker.ts`

Status: [x] Done — AIPlayerManager delegates tracking to the centralized StatTracker instance.

---

## Priority 2 — Zombie Renderers → BaseZombieRenderer

**Problem:** All 7 zombie renderers share identical constructor pattern, 3-phase death animation (~50 lines each), `destroy()` cleanup, `showDamageEffect()`, and wound-drawing logic.

**Fix:** Create `BaseZombieRenderer` abstract class. Each concrete renderer only overrides `render()` and type-specific color/behavior.

Files touched:
- `src/renderers/zombies/BaseZombieRenderer.ts` (new)
- All 7 zombie renderer files

Status: [x] Done — `BaseZombieRenderer` provides constructor, `update`, `showDamageEffect`, `playDeathAnimation`, `destroy`, `getGraphics`. Each renderer declares config via protected readonly properties. Stealth and Mechanical override `playDeathAnimation` for their unique animations.

---

## Priority 3 — Tower Renderers → Shared Shooting Effect

**Problem:** All 7 tower renderers duplicate the same ~20-line shooting effect block. `BaseTowerRenderer` exists but doesn't cover this.

**Fix:** Add `renderBaseShootingEffect(barrel, flashColor, recoilAmount)` to `BaseTowerRenderer`.

Files touched:
- `src/renderers/towers/BaseTowerRenderer.ts`
- All 7 tower renderer files

Status: [x] Done — `applyShootingEffect(barrel, flash)` added to `BaseTowerRenderer`. All 7 renderers now call it instead of duplicating the 12-line recoil/cleanup block. `EffectCleanupManager` import removed from all 7 renderers.

---

## Priority 4 — ZombieCorpseRenderer Internal Duplication

**Problem:** Same 17-line corpse-drawing block copy-pasted 6 times in `ZombieCorpseRenderer.ts`.

**Fix:** Extract private `drawCorpse(graphics, config)` method.

Files touched:
- `src/renderers/zombies/ZombieCorpseRenderer.ts`

Status: [x] Done — extracted `drawCorpseBody()` helper, each type now 2-5 lines

---

## Priority 5 — TerrainRenderer Internal Duplication

**Problem:** Same 6-8 line tile-drawing block repeated 6+ times in `TerrainRenderer.ts`.

**Fix:** Extract private `drawTile(graphics, x, y, size, color, alpha)` helper.

Files touched:
- `src/renderers/map/TerrainRenderer.ts`

Status: [x] Done — extracted `renderBlobPatches()` helper, 5 methods now 1 call each

---

## Priority 6 — UI Panels Boilerplate

**Problem:** `ShaderTestPanel`, `WaveInfoPanel`, `DebugInfoPanel`, `ZombieBestiary` all duplicate panel setup boilerplate.

**Fix:** Add `UIPanel` intermediate class with shared panel creation helpers.

Files touched:
- `src/ui/UIPanel.ts` (new)
- `src/ui/ShaderTestPanel.ts`, `WaveInfoPanel.ts`, `DebugInfoPanel.ts`, `ZombieBestiary.ts`

Status: [x] Done — UIPanel base class handles common panel layout, button styles, title framing, and toggle functionality. ShaderTestPanel, WaveInfoPanel, DebugInfoPanel, and ZombieBestiary have all been refactored to extend it.

---

## Priority 7 — PerformanceProfiler Internal Duplication

**Problem:** 29-line block duplicated within `PerformanceProfiler.ts`.

**Fix:** Extract into a private helper method.

Files touched:
- `src/utils/PerformanceProfiler.ts`

Status: [x] Done

---

## Priority 8 — GraphicsPool Internal Duplication

**Problem:** 11-line pool-initialization block duplicated within `GraphicsPool.ts`.

**Fix:** Extract into a private `initPool()` helper.

Files touched:
- `src/utils/GraphicsPool.ts`

Status: [x] Done

---

## Priority 9 — WaveManager Internal Duplication

**Problem:** Same 9-line wave-tracking block duplicated twice in `WaveManager.ts`.

**Fix:** Extract into a private helper method.

Files touched:
- `src/managers/WaveManager.ts`

Status: [ ] Skipped — duplication is in wave data definitions (data, not logic), not worth refactoring

---

## Priority 10 — TowerCombatManager Internal Duplication

**Problem:** Two sets of duplicated blocks in `TowerCombatManager.ts` (~14 lines and ~10 lines).

**Fix:** Extract into private helper methods.

Files touched:
- `src/managers/TowerCombatManager.ts`

Status: [x] Done — extracted `applyDamageToZombie()` helper used by lightning arc and flame stream

---

## Priority 11 — Shader Filter Boilerplate (CreativeFilters ↔ InscryptionFilters)

**Problem:** Both filter files duplicate the same vertex shader boilerplate (~30 lines) in every filter class, plus similar constructor patterns with `super({ glProgram, resources })` and getter/setter patterns for uniforms.

**Fix:** Create `BaseShaderFilter` abstract class with shared vertex shader and helper methods for uniform access. Each filter only provides fragment shader and uniform config.

Files touched:
- `src/ui/shaders/filters/BaseShaderFilter.ts` (new)
- `src/ui/shaders/filters/CreativeFilters.ts`
- `src/ui/shaders/filters/InscryptionFilters.ts`

Status: [x] Done — `STANDARD_VERTEX_SHADER` constant extracted and used by both files. `BaseShaderFilter` base class created for future filter classes.

---

## Priority 12 — Zombie Renderer updateWounds Duplication

**Problem:** `updateWounds` method has nearly identical signature and structure across BasicZombieRenderer, FastZombieRenderer, SwarmZombieRenderer, TankZombieRenderer, StealthZombieRenderer, and ArmoredZombieRenderer.

**Fix:** Move `updateWounds` to `BaseZombieRenderer` with a protected `WOUND_CONFIG` property that subclasses override. The base implementation calls `drawWounds()` with the config.

Files touched:
- `src/renderers/zombies/BaseZombieRenderer.ts`
- All zombie renderer files

Status: [ ] Skipped — The `updateWounds` methods have different implementations per zombie type. The base class already provides `drawWounds()` helper which is the core shared functionality. The remaining duplication is in the method signature which is now defined as an abstract method in the base class, making the pattern explicit.

---

## Priority 13 — BloodParticleSystem Internal Duplication

**Problem:** Multiple internal duplications for particle creation patterns (acquireParticle, set properties, add to container, push to active array).

**Fix:** Extract private `createParticle()` helper that handles the common pattern.

Files touched:
- `src/utils/BloodParticleSystem.ts`

Status: [x] Done — Extracted `createParticle()` helper and `updateParticleLife()` helper. Also added `ParticleConfig` interface for cleaner parameter passing.

---

## Remaining Minor Duplications (Low Priority)

These are small (<10 lines) or in non-critical paths:

- `Tower.ts` laser sight calculation (6 lines) — acceptable duplication
- `Projectile.ts` constructor property assignment (9 lines) — standard boilerplate
- `PathRenderer.ts` waypoint iteration (7 lines) — data iteration pattern
- `GraveyardRenderer.ts` polygon drawing (7 lines) — simple loop
- `SpatialGrid.ts` cell iteration (7 lines) — standard grid pattern
- `LogExporter.ts` blob creation (5 lines) — simple utility
- `TowerShop.ts` icon drawing (5 lines) — visual detail
- `BottomBar.ts` rivet creation (5 lines) — visual detail

These are not worth refactoring as the duplication is trivial and isolated.

---

## Execution Order

1. P7 PerformanceProfiler — smallest, safe warmup ✅
2. P8 GraphicsPool — small, isolated ✅
3. P9 WaveManager — skipped (data duplication)
4. P10 TowerCombatManager — small, isolated ✅
5. P4 ZombieCorpseRenderer — medium, single file ✅
6. P5 TerrainRenderer — medium, single file ✅
7. P3 Tower Renderers — medium, multi-file but base class exists ✅
8. P2 Zombie Renderers — large, new base class ✅
9. P6 UI Panels — large, new base class ✅
10. P1 AIPlayerManager/StatTracker — largest, highest risk ✅
11. P11 Shader Filter Boilerplate — medium, multi-file ✅
12. P12 Zombie Renderer updateWounds — skipped (pattern is explicit)
13. P13 BloodParticleSystem — small, single file ✅

---

## Summary

**Initial State:** 116 clones, 4.58% duplication
**Final State:** 33 clones (all minor, under 20 lines each)

### Remaining Duplications (Acceptable)

The remaining 33 clones fall into these categories:

1. **Filter class patterns** (VignetteFilter, ChromaticAberrationFilter, FilmGrainFilter) — The `super()` call and getter/setter patterns are inherent to PixiJS Filter subclassing. Shared vertex shader extracted successfully.

2. **Zombie renderer `updateWounds` signatures** — The method signature is defined as an abstract method in BaseZombieRenderer, making the pattern explicit. Each zombie type has different wound drawing parameters.

3. **Internal duplications in single files** — These are minor patterns (5-10 lines) that would add more complexity to extract than they save:
   - `Tower.ts` laser sight calculation
   - `Projectile.ts` constructor property assignment
   - `PathRenderer.ts` waypoint iteration
   - `GraveyardRenderer.ts` polygon drawing
   - `SpatialGrid.ts` cell iteration
   - `LogExporter.ts` blob creation

4. **Visual detail duplications** — Tower renderers and UI components have similar visual patterns (rivets, barrel rendering) that are intentionally duplicated for clarity and independence.

### Refactor Achievements

- **~75% reduction in code clones** (116 → 33)
- Created reusable base classes:
  - `BaseZombieRenderer` — shared skeletal animation, damage effects, death animation
  - `BaseTowerRenderer` with `applyShootingEffect()` — shared shooting effect
  - `UIPanel` — shared panel creation helpers
  - `BaseShaderFilter` with `STANDARD_VERTEX_SHADER` — shared shader boilerplate
- Extracted helper methods in:
  - `ZombieCorpseRenderer.drawCorpseBody()`
  - `TerrainRenderer.renderBlobPatches()`
  - `BloodParticleSystem.createParticle()` and `updateParticleLife()`
  - `TowerCombatManager.applyDamageToZombie()`
- Consolidated `AIPlayerManager` to delegate to centralized `StatTracker`
