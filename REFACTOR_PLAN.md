# Refactor Plan — Duplicate Code Elimination

Generated from `jscpd` analysis: **116 clones, 4.58% duplication** across 161 TypeScript files.

---

## Priority 1 — AIPlayerManager + StatTracker

**Problem:** `AIPlayerManager` duplicates nearly the entire body of `StatTracker` — identical stat interfaces, `createEmptyStats()`, wave tracking, economy tracking, combat tracking, and JSON export logic (~1000 lines of overlap).

**Fix:** `AIPlayerManager` should delegate to `StatTracker` instead of maintaining its own parallel stats. Remove the `AIPerformanceStats` interface and all duplicated tracking methods from `AIPlayerManager`, replacing them with calls to the existing `StatTracker` instance.

Files touched:
- `src/managers/AIPlayerManager.ts`
- `src/utils/StatTracker.ts`

Status: [ ] Todo

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

Status: [ ] Todo

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

## Execution Order

1. P7 PerformanceProfiler — smallest, safe warmup
2. P8 GraphicsPool — small, isolated
3. P9 WaveManager — small, isolated
4. P10 TowerCombatManager — small, isolated
5. P4 ZombieCorpseRenderer — medium, single file
6. P5 TerrainRenderer — medium, single file
7. P3 Tower Renderers — medium, multi-file but base class exists
8. P2 Zombie Renderers — large, new base class
9. P6 UI Panels — large, new base class
10. P1 AIPlayerManager/StatTracker — largest, highest risk, do last
