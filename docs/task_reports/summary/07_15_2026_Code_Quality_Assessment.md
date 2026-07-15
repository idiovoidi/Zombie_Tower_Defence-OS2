# Code Quality Assessment

**Date:** 07/15/2026  
**Type:** Code Quality Review  
**Status:** Completed  
**Scope:** Full codebase (`src/`, `tests/`, tooling configuration)

## Executive Summary

Z_TD is a TypeScript tower defense game built with Pixi.js and Vite (~176 source files). The project has an unusually strong quality toolchain for a game codebase: Biome, ESLint with architectural boundary rules, TypeScript, dependency-cruiser, jscpd, knip, and Vitest with coverage thresholds.

**Overall grade: B+**

The foundation is solid — type safety is clean, duplication is minimal, and 182 tests all pass with strong focus on headless simulation and balance analysis. The quality gate (`npm run quality`) currently **fails** due to lint/format issues, three circular dependencies, and coverage thresholds that are not met for visual/UI layers.

| Dimension          | Rating | Notes                                              |
| ------------------ | ------ | -------------------------------------------------- |
| Tooling            | ⭐⭐⭐⭐⭐ | Comprehensive pipeline in `package.json`           |
| Type safety        | ⭐⭐⭐⭐⭐ | `tsc --noEmit` passes; minimal `any` usage         |
| Architecture       | ⭐⭐⭐⭐  | Layer rules defined; 3 circular deps remain        |
| Maintainability    | ⭐⭐⭐   | Several 600–970 line files with high complexity    |
| Duplication        | ⭐⭐⭐⭐⭐ | 0.42% duplicated lines (jscpd)                     |
| Test suite         | ⭐⭐⭐⭐  | 182 passing tests; strong simulation focus         |
| Coverage           | ⭐⭐     | 11.6% line coverage vs 80% threshold                 |
| Lint hygiene       | ⭐⭐⭐   | ~16 fixable errors; not structural                 |

---

## Quality Gate Results

Commands run on 07/15/2026 against the current `main` branch working tree.

| Check                  | Command                         | Status  | Details                                      |
| ---------------------- | ------------------------------- | ------- | -------------------------------------------- |
| Biome (lint + format)  | `biome check .`                 | ❌ Fail | 16 errors, 31 warnings, 54 infos             |
| TypeScript             | `tsc --noEmit`                  | ✅ Pass | No type errors                               |
| ESLint                 | `eslint src/**/*.ts`            | ❌ Fail | 6 errors, 3 warnings                         |
| dependency-cruiser     | `depcruise src --config …`      | ❌ Fail | 3 circular dependency violations             |
| Tests                  | `vitest --run`                  | ✅ Pass | 17 files, 182 tests                          |
| Coverage               | `vitest --run --coverage`       | ❌ Fail | Below 80% threshold on all metrics           |
| Duplication (jscpd)    | `jscpd src …`                   | ✅ Pass | 0.42% duplicated lines                       |
| Dead code (knip)       | `knip`                          | ⚠️ Minor | 5 unused exports, 43 unused exported types  |

The `quality` script in `package.json` chains Biome, TypeScript, ESLint, and dependency-cruiser. The `quality:full` script adds knip and jscpd.

---

## Issue 1 — Circular Dependencies (High Priority)

**Tool:** dependency-cruiser  
**Severity:** Error (blocks `npm run quality`)

Three circular dependency chains were detected across 181 modules and 604 dependencies:

### Cycle 1: Tower ↔ EffectManager ↔ ResourceCleanupManager

```
src/objects/Tower.ts
  → src/renderers/effects/EffectManager.ts
  → src/utils/ResourceCleanupManager.ts
  → src/objects/Tower.ts
```

### Cycle 2: IGameManager ↔ StatTracker

```
src/managers/IGameManager.ts
  → src/utils/StatTracker.ts
  → src/managers/IGameManager.ts
```

### Cycle 3: BalanceTrackingManager ↔ IGameManager

```
src/managers/BalanceTrackingManager.ts
  → src/managers/IGameManager.ts
  → src/managers/BalanceTrackingManager.ts
```

### Recommended fixes

- Extract shared interfaces and event payload types into `src/types/` (neutral layer).
- Use `EventBus` for cross-manager communication instead of direct imports.
- Consider splitting `IGameManager.ts` so stat/balance managers depend on narrower interfaces rather than the full game manager contract.

---

## Issue 2 — Test Coverage Below Threshold (High Priority)

**Tool:** Vitest + `@vitest/coverage-v8`  
**Severity:** Error (blocks `npm run test:coverage` and CI if enforced)

Configured thresholds in `vitest.config.ts`: **80%** for branches, functions, lines, and statements.

| Metric     | Actual   | Target | Gap    |
| ---------- | -------- | ------ | ------ |
| Lines      | 11.64%   | 80%    | −68.4% |
| Statements | 11.64%   | 80%    | −68.4% |
| Functions  | 56.72%   | 80%    | −23.3% |
| Branches   | 72.07%   | 80%    | −7.9%  |

### Well-covered areas

| Module / area              | Coverage (approx.) |
| -------------------------- | ------------------ |
| Tower renderers            | 90–100%            |
| `BalanceAnalyzer.ts`       | ~91%               |
| `EventBus.ts`              | ~88%               |
| `ObjectPool.ts`            | ~85%               |
| `OptimizationValidator.ts` | ~90%               |
| `StatisticalAnalyzer.ts`   | ~71%               |

### Uncovered or minimally covered areas (0%)

- All UI components (`src/ui/`)
- Zombie renderers (`src/renderers/zombies/`)
- Map renderers (`src/renderers/map/`)
- `EffectManager.ts` (~1,095 lines)
- Most core managers (`GameManager`, `ZombieManager`, etc.)
- Shader filters (`src/ui/shaders/filters/`)

### Context

This is typical for a Pixi.js game where tests focus on headless simulation rather than visual rendering. The 80% global threshold is aspirational and does not reflect the project's intentional test strategy.

### Recommended fixes

1. **Adjust thresholds by layer** — e.g. 80% for `utils/`, `managers/` (headless-testable), lower or excluded for `ui/` and `renderers/`.
2. **Expand headless tests** — follow the pattern in `tests/HeadlessCombatSim.test.ts` for additional managers.
3. **Document exclusions** — add renderer/UI paths to coverage `exclude` with rationale.

---

## Issue 3 — Cognitive Complexity (Medium Priority)

**Tool:** Biome (`noExcessiveCognitiveComplexity`, max 15)  
**Severity:** Warning (31 instances)

Functions exceeding the complexity threshold of 15:

| File | Location | Complexity | Notes |
| ---- | -------- | ---------- | ----- |
| `src/renderers/map/StructureRenderer.ts` | line 54 | **71** | Primary render logic |
| `src/renderers/effects/EffectManager.ts` | line 732 (`update`) | **42** | Updates all effect types in one loop |
| `src/core/InputBindings.ts` | line 81 | **31** | Keyboard handler |
| `src/core/InputBindings.ts` | line 17 | **25** | Pointer handler |
| `src/renderers/effects/EffectManager.ts` | line 870 (`clear`) | **24** | Clears all effect types |
| `src/renderers/map/StructureRenderer.ts` | line 600 | **30** | Sub-render method |
| `src/core/DebugHotkeys.ts` | line 24 | **21** | Debug key handler |
| `src/utils/SpatialGrid.ts` | line 264 | **21** | Grid query logic |
| `src/utils/StatTracker.ts` | line 426 | **21** | Stat aggregation |
| `src/renderers/effects/EffectManager.ts` | line 429 | **20** | `drawLightningBolt` |
| `src/ui/TimeControlUI.ts` | line 216 | **20** | UI update |
| `src/renderers/effects/EffectManager.ts` | line 514 | **17** | `spawnFlameStream` |
| `src/managers/ZombieManager.ts` | line 106 (`update`) | **17** | Spawn + movement |
| `src/renderers/map/StructureRenderer.ts` | line 494 | **17** | Sub-render method |
| `src/ui/TowerShop.ts` | line 608 | **17** | Shop interaction |
| `src/utils/ResourceCleanupManager.ts` | line 155 | **17** | Cleanup dispatch |
| `src/utils/SpatialGrid.ts` | line 159 | **17** | Grid insertion |
| `src/managers/TowerCombatManager.ts` | line 203 | **16** | `shootAtTarget` |
| `src/ui/TowerInfoPanel.ts` | line 151 | **16** | Panel update |
| `src/managers/GameManager.ts` | line 623 | **16** | Game state logic |
| `src/renderers/zombies/RagdollConfig.ts` | line 436 | **19** | Config builder |
| `src/renderers/zombies/ZombieParticleSystem.ts` | lines 73, 161 | **19, 22** | Particle updates |
| `src/ui/ShaderTestPanel.ts` | line 172 | **19** | Shader UI |
| `src/ui/TimeControlUI.ts` | line 153 | **19** | Time control UI |
| `src/renderers/zombies/MechanicalZombieRenderer.ts` | line 160 | **17** | Draw callback |

### Largest source files (maintainability concern)

| File | Lines |
| ---- | ----- |
| `src/renderers/effects/EffectManager.ts` | 970 |
| `src/renderers/map/GraveyardRenderer.ts` | 800 |
| `src/managers/GameManager.ts` | 671 |
| `src/renderers/map/StructureRenderer.ts` | 667 |
| `src/objects/Zombie.ts` | 665 |
| `src/managers/BalanceTrackingManager.ts` | 631 |
| `src/utils/StatTracker.ts` | 585 |
| `src/ui/TowerShop.ts` | 582 |
| `src/managers/WaveManager.ts` | 580 |
| `src/objects/Tower.ts` | 577 |

### Recommended fixes

- **EffectManager:** Extract per-effect-type updaters/cleaners (shell casings, lightning, flames, etc.) into separate classes or a strategy map.
- **StructureRenderer:** Break render logic into sub-renderers by structure type.
- **InputBindings:** Split pointer and keyboard handlers into dedicated modules; extract tower hotkey logic.
- **GameManager / ZombieManager:** Delegate update phases to sub-managers already partially in place.

---

## Issue 4 — Lint and Format Errors (Medium Priority, Quick Wins)

**Tools:** Biome, ESLint  
**Severity:** Error (blocks `npm run quality`)

Most issues are auto-fixable via `npm run check:fix`.

### Biome errors (16 total)

#### Formatting (8 files)

Auto-fix with `npm run format`:

- `src/managers/AIPlayerManager.ts`
- `src/managers/IGameManager.ts`
- `src/renderers/zombies/ArmoredZombieRenderer.ts`
- `src/renderers/zombies/StealthZombieRenderer.ts`
- `src/ui/shaders/filters/BaseShaderFilter.ts`
- `src/ui/shaders/filters/CreativeFilters.ts`
- `src/ui/shaders/filters/InscryptionFilters.ts`
- `src/utils/VisualEffects.ts`

#### Unused imports (3)

| File | Import |
| ---- | ------ |
| `src/ui/shaders/filters/CreativeFilters.ts` | `BaseShaderFilter`, `UniformsConfig` |
| `src/utils/StatisticalAnalyzer.ts` | `DebugUtils` |
| `src/utils/VisualEffects.ts` | `EffectCleanupManager` |

#### Import organization (1)

- `src/utils/StatisticalAnalyzer.ts` — imports not sorted

#### Useless switch cases (2)

- `src/renderers/effects/ImpactEffect.ts:29` — `case 'bullet':` before `default`
- `src/objects/Zombie.ts:416` — redundant case before `default`

#### Optional chain (2)

- `src/renderers/zombies/RagdollSkeleton.ts:178` — use optional chaining
- `src/renderers/zombies/RagdollSkeleton.ts:279` — use optional chaining

### ESLint errors (6)

| File | Line | Rule | Issue |
| ---- | ---- | ---- | ----- |
| `src/managers/CorpseManager.ts` | 35 | `@typescript-eslint/no-unused-vars` | `impactAngle` unused — prefix with `_` |
| `src/objects/Zombie.ts` | 531 | `no-useless-assignment` | `impactAngle` assigned but not used |
| `src/ui/shaders/filters/CreativeFilters.ts` | 2 | `@typescript-eslint/no-unused-vars` | Unused imports |
| `src/utils/StatisticalAnalyzer.ts` | 16 | `@typescript-eslint/no-unused-vars` | `DebugUtils` unused |
| `src/utils/VisualEffects.ts` | 2 | `@typescript-eslint/no-unused-vars` | `EffectCleanupManager` unused |

### ESLint warnings (3)

| File | Line | Rule | Issue |
| ---- | ---- | ---- | ----- |
| `src/objects/Tower.ts` | 45 | `@typescript-eslint/no-explicit-any` | `any` type |
| `src/utils/StatisticalAnalyzer.ts` | 24 | `@typescript-eslint/no-explicit-any` | Two `any` usages |

### Biome warnings (selected)

- **`noConsole`** — `src/core/Application.ts` (2), `src/core/GameLoop.ts` (1). Allowed in `Logger.ts`, `DebugConsole.ts`, `DebugHotkeys.ts`, and `main.ts` via overrides.
- **`noUnusedFunctionParameters`** — `src/managers/CorpseManager.ts:35` (`impactAngle`)
- **`noBarrelFile`** — barrel `index.ts` re-exports (performance warning, not blocking)

### Biome infos (54)

Mostly `useLiteralKeys` in shader filter files (`CreativeFilters.ts`, `InscryptionFilters.ts`) and a few core files (`InputBindings.ts`, `Projectile.ts`, `SludgePoolEffect.ts`). Style preference; not blocking.

---

## Issue 5 — Code Duplication (Low Priority)

**Tool:** jscpd (`--min-lines 8 --min-tokens 60`)  
**Severity:** Informational — well within acceptable range

| Metric            | Value    |
| ----------------- | -------- |
| Files analyzed    | 172      |
| Total lines       | 34,040   |
| Clones found      | 6        |
| Duplicated lines  | 142 (0.42%) |
| Duplicated tokens | 1,099 (0.37%) |

### Clone locations

| Source A | Source B | Lines | Domain |
| -------- | -------- | ----- | ------ |
| `CreativeFilters.ts:156–179` | `InscryptionFilters.ts:188–211` | 23 | Shader filters |
| `CreativeFilters.ts:210–238` | `InscryptionFilters.ts:135–163` | 28 | Shader filters |
| `MechanicalZombieRenderer.ts:149–168` | `StealthZombieRenderer.ts:146–165` | 19 | Zombie renderers |
| `BasicZombieRenderer.ts:27–36` | `StealthZombieRenderer.ts:35–44` | 9 | Zombie renderers |
| `BasicZombieRenderer.ts:74–110` | `StealthZombieRenderer.ts:83–110` | 36 | Zombie renderers |
| `ArmoredZombieRenderer.ts:89–116` | `StealthZombieRenderer.ts:83–110` | 27 | Zombie renderers |

### Recommended fixes

- Extract shared shader boilerplate into `BaseShaderFilter` helpers or a filter factory.
- Move common zombie limb/drawing logic into `BaseZombieRenderer` (partially started; extend further).

---

## Issue 6 — Dead Code and Unused Exports (Low Priority)

**Tool:** knip  
**Severity:** Informational

### Unused devDependencies (2)

- `@typescript-eslint/eslint-plugin` — superseded by `typescript-eslint` package
- `@typescript-eslint/parser` — superseded by `typescript-eslint` package

### Unlisted binary (1)

- `rimraf` — used in `npm run clean` but not listed in `package.json` dependencies

### Unused exports (5)

| Export | File |
| ------ | ---- |
| `createNextWaveCallback` | `src/core/UISetup.ts:267` |
| `setLogLevel` | `src/utils/Logger.ts:21` |
| `debugGroup` | `src/utils/Logger.ts:71` |
| `table` | `src/utils/Logger.ts:82` |
| `createFilter` | `src/ui/shaders/filters/BaseShaderFilter.ts:105` |

### Unused exported types (43)

Many appear intentional (API surface, event payloads, documentation). Notable groups:

- Event data interfaces in `src/renderers/CombatRenderer.ts` (7 types)
- Ragdoll types in `src/renderers/zombies/RagdollSkeleton.ts` (4 types)
- Performance/metrics types in `src/utils/` (8 types)
- `IGameManager` interface exported but only consumed indirectly

Review before removal — many may be kept for `@microsoft/api-extractor` or future use.

---

## Issue 7 — Architectural Boundaries (Informational)

**Tool:** ESLint `eslint-plugin-boundaries`  
**Status:** Configured and enforced

Layer dependency rules in `eslint.config.mjs`:

```
config → (no internal imports)
types → config
utils → config, types
components → config, types
objects → config, types, components, utils, renderers
renderers → config, types, components, utils, objects
managers → config, types, components, utils, objects, renderers
ui → config, types, components, utils, objects, managers, renderers
main → all layers
```

ESLint boundary checks **passed** (no violations reported). Circular dependencies caught by dependency-cruiser represent cases where layers import each other within allowed types but form runtime cycles.

---

## Test Suite Summary

**Tool:** Vitest 3.2.4  
**Result:** ✅ All passing

| Metric | Value |
| ------ | ----- |
| Test files | 17 |
| Tests | 182 |
| Duration | ~9s |

### Test files

| File | Focus |
| ---- | ----- |
| `tests/WaveManager.test.ts` | Wave progression (22 tests) |
| `tests/MemoryLeakTests.test.ts` | Memory targets, cleanup (13 tests) |
| `tests/OptimizationValidator.test.ts` | Spatial grid, dirty flags (13 tests) |
| `tests/OptimizationValidation.test.ts` | Performance benchmarks |
| `tests/PerformanceMonitor.test.ts` | Performance monitoring |
| `tests/HeadlessCombatSim.test.ts` | Headless combat, event bus |
| `tests/BalanceSimulation.test.ts` | Tower balance analysis |
| `tests/AdvancedBalanceSim.test.ts` | Multi-tower, horde scenarios |
| `tests/BalanceAnalyzer.test.ts` | Balance analyzer unit tests |
| `tests/StatisticalAnalyzer.test.ts` | Statistical analysis |
| `tests/renderers/towers/*.test.ts` | Tower renderer tests (7 files) |

### Notable test capabilities

- Headless combat simulation at ~15,000× real-time speed
- Spatial grid O(k) vs O(n) performance validation (up to 24× improvement at 100 entities)
- Memory cleanup effectiveness (100% release, <1ms cleanup time)
- Frame rate benchmarks targeting 60 FPS at wave 1, 45+ at wave 10, 30 FPS floor

---

## Strengths (Preserve)

1. **Comprehensive quality pipeline** — `quality`, `quality:full`, and `build` scripts enforce checks before release.
2. **Strict Biome config** — `noExplicitAny: error`, unused import/variable enforcement, complexity warnings.
3. **Clean TypeScript compilation** — no type errors across 176 source files.
4. **Minimal duplication** — 0.42% is excellent for a codebase of this size.
5. **Simulation-first testing** — headless combat, balance analysis, and performance validation are high-value for a TD game.
6. **Architectural intent** — layer boundaries documented and enforced via ESLint.
7. **Low `any` usage** — only 3 instances in production source.

---

## Recommended Action Plan

### Phase 1 — Quick wins (~30 minutes)

- [ ] Run `npm run check:fix` to resolve format, import, and simple lint issues
- [ ] Fix ESLint errors in `CorpseManager.ts` and `Zombie.ts` (`impactAngle`)
- [ ] Add `rimraf` to devDependencies or replace with Node built-in alternative
- [ ] Remove redundant `@typescript-eslint/*` devDependencies

### Phase 2 — Architecture (~2–4 hours)

- [ ] Break circular dependency: Tower ↔ EffectManager ↔ ResourceCleanupManager
- [ ] Break circular dependency: IGameManager ↔ StatTracker
- [ ] Break circular dependency: BalanceTrackingManager ↔ IGameManager

### Phase 3 — Maintainability (~1–2 days)

- [ ] Refactor `EffectManager.ts` — extract per-effect update/clear handlers
- [ ] Refactor `StructureRenderer.ts` — split 71-complexity render method
- [ ] Refactor `InputBindings.ts` — split pointer/keyboard into modules
- [ ] Deduplicate zombie renderer shared drawing logic

### Phase 4 — Coverage strategy (~ongoing)

- [ ] Define per-layer coverage thresholds in `vitest.config.ts`
- [ ] Add headless manager tests following `HeadlessCombatSim.test.ts` pattern
- [ ] Document intentional exclusions for UI and visual renderer layers

---

## Commands Reference

```bash
# Full quality gate (currently fails)
npm run quality

# Extended quality (adds knip + jscpd)
npm run quality:full

# Auto-fix lint and format
npm run check:fix

# Individual checks
npm run type-check
npm run eslint
npm run deps:check
npm run dupcheck
npm run knip
npm run test
npm run test:coverage
```

---

## Related Documentation

- `biome.json` — Linter and formatter configuration
- `eslint.config.mjs` — ESLint rules and architectural boundaries
- `.dependency-cruiser.cjs` — Dependency graph rules
- `vitest.config.ts` — Test and coverage configuration
- `docs/task_reports/summary/12_11_2025_ECS_Architecture_Analysis.md` — Prior architecture review

---

*Generated from automated tooling output on 07/15/2026. Re-run `npm run quality:full` to refresh metrics.*
