Linting & Code Quality Hardening — Z_TD
Comprehensive plan to enforce consistent structure and prevent architectural decay through Biome rules, ESLint boundary enforcement, TypeScript compiler strictness, and a unified quality gate.

Findings from Codebase Analysis
Before proposing rules, here's what the investigation uncovered:

Current Tooling Landscape
Tool	Purpose	State
Biome 1.9.4	Lint + format	✅ Clean (179 files, 0 errors)
ESLint 10 + boundaries	Architectural rules	⚠️ Boundary rules commented out
TypeScript 5.7	Type checking	✅ Clean, but strict: true with several safeguards disabled
dependency-cruiser	Circular dep detection	✅ Configured
knip	Dead code detection	✅ Configured
jscpd	Copy-paste detection	✅ Configured
Schema Version Mismatch
WARNING

The biome.json references schema 2.4.13 but the installed Biome is 1.9.4. This means rules may silently not apply. The schema should be 1.9.4 or you should upgrade Biome to v2.

Patterns That Need Enforcement
console.log proliferation — 30+ source files contain console.log (not behind DebugUtils). No rule catches this.
22 biome-ignore suppressions — 12 for noStaticOnlyClass alone, indicating this rule isn't aligned with the project's utility-class convention.
TowerManager instantiated in 4 different places (Tower.ts, TowerInfoPanel.ts, TowerShop.ts, GameManager.ts) — creating redundant instances of a stateless manager. This is an architectural smell that boundary rules would surface.
TypeScript strictness gaps — noImplicitOverride, noImplicitReturns, exactOptionalPropertyTypes are all false. These catch real bugs.
Boundary rules disabled — The ESLint eslint-plugin-boundaries config exists but every rule is commented out. The dependency graph has no compile-time enforcement.
No file-length limits — main.ts is 800 lines, GameManager.ts is 827, EffectManager.ts is 900+. No rule flags overgrown files.
User Review Required
IMPORTANT

Biome v1 → v2 upgrade: The biome.json already references a v2 schema. I recommend upgrading @biomejs/biome to the latest v2 so the schema and binary match. This unlocks new rules and fixes the config mismatch. If you'd prefer to stay on v1, I'll pin the schema to 1.9.4 instead.

IMPORTANT

ESLint scope: Currently ESLint only runs for eslint-plugin-boundaries (architectural rules). All other linting is via Biome. I'll keep this split — Biome for fast day-to-day lint/format, ESLint only for the boundary enforcement rules that Biome can't do. This avoids duplicate warnings.

Open Questions
noStaticOnlyClass — The project uses static-only classes extensively for utilities (DebugUtils, LogExporter, PerformanceMonitor, etc.) — currently suppressed 12 times. Should I:

(a) Disable the rule globally (accept the pattern), or
(b) Keep it on and refactor utilities to use module-level functions + exports?
console.log strictness — Should console.log/warn/error be:

(a) warn (flag them but don't block), or
(b) error (must use DebugUtils for all logging)?
Note: main.ts console usage for debug command registration might warrant an override.

File line limits — noExcessiveCognitiveComplexity and custom max-lines. What's your comfort threshold? I'd suggest 400 lines per file as a warning, which flags the 5 largest files (main.ts, GameManager, EffectManager, WaveManager, BalanceTrackingManager) without blocking new development.

Proposed Changes
1. Biome Configuration Hardening
[MODIFY] 
biome.json
Upgrade schema + add significantly more rules:

Correctness (new):

noUndeclaredVariables: "error" — catch typos
noNewSymbol: "error" — Symbol should not be called with new
noSwitchDeclarations: "error" — prevent variable leaks in switch cases
Suspicious (new):

noConsole: "warn" — flag raw console usage (pending your answer on Q2)
noEmptyBlockStatements: "error" — empty blocks are usually incomplete code
noConfusingVoidType: "error" — prevent void misuse
noMisleadingCharacterClass: "error" — regex safety
noSelfCompare: "error" — x === x is always a bug
noFallthroughSwitchClause: "error" — prevent accidental switch fallthrough
noShadowRestrictedNames: "error" — don't shadow builtins
Complexity (new):

noExcessiveCognitiveComplexity: "warn" with threshold 25 — flag overly complex functions
noUselessTypeConstraint: "error" — redundant extends unknown
noUselessSwitchCase: "error" — empty switch cases
noVoid: "error" — prefer undefined
Style (new):

useExponentiationOperator: "error" — ** instead of Math.pow
noDefaultExport: "error" — enforce named exports for consistency (current codebase already has zero default exports)
useEnumInitializers: "error" — explicit enum values prevent reordering bugs
useImportType: "error" — use import type when only types are needed (helps tree-shaking)
useExportType: "error" — use export type for type-only exports
noParameterAssign: "error" — prevent mutating function parameters
useSelfClosingElements: "error" — JSX/HTML consistency
useNumberNamespace: "error" — Number.parseInt over global parseInt
Performance (new):

noAccumulatingSpread: "warn" — flag {...acc, key} in reduce (O(n²))
noDelete: "warn" — delete deoptimizes objects, prefer undefined assignment
noBarrelFile: "warn" — flag barrel index.ts files that re-export everything (causes tree-shaking issues). Applied as warning since the project uses barrels intentionally.
Overrides (refined):

Add main.ts override to allow noConsole (it registers debug commands)
Relax noExcessiveCognitiveComplexity in tests
2. ESLint Boundary Rules — Activate
[MODIFY] 
eslint.config.mjs
Uncomment and properly configure the boundary rules to enforce the layer architecture:

config → (no imports from anything except node_modules)
types → config
utils → config, types
components → config, types
objects → config, types, components, utils, renderers
renderers → config, types, components, utils, objects (interfaces only)
managers → config, types, components, utils, objects, renderers
ui → config, types, components, utils, objects, managers, renderers
main → everything
Rules:

boundaries/element-types: "error" — enforce the dependency direction above
boundaries/no-unknown: "error" — every file must belong to a declared layer
3. TypeScript Compiler Hardening
[MODIFY] 
tsconfig.json
Enable disabled safety flags:

diff
-"noImplicitOverride": false,
+"noImplicitOverride": true,
-"noImplicitReturns": false,
+"noImplicitReturns": true,
-"noPropertyAccessFromIndexSignature": false,
+"noPropertyAccessFromIndexSignature": true,
noImplicitOverride — Forces override keyword on subclass methods, preventing accidental shadowing (the codebase already uses override in several places like Tower.destroy())
noImplicitReturns — Catches functions that forget to return in some branches
noPropertyAccessFromIndexSignature — Prevents obj.prop on index-signature types (use obj["prop"] to make intent clear)
4. Quality Gate Script
[MODIFY] 
package.json
Add a unified quality script that runs everything in sequence:

json
"quality": "biome check . && tsc --noEmit && eslint src/**/*.ts && depcruise src --config .dependency-cruiser.cjs",
"quality:full": "npm run quality && npm run knip && npm run dupcheck"
Update the build script to use the full quality gate:

diff
-"build": "npm run check && tsc && vite build",
+"build": "npm run quality && tsc && vite build",
5. Biome Schema Fix
[MODIFY] 
biome.json
Fix the schema URL to match the installed version:

diff
-"$schema": "https://biomejs.dev/schemas/2.4.13/schema.json",
+"$schema": "https://biomejs.dev/schemas/1.9.4/schema.json",
Or upgrade @biomejs/biome to v2 (preferred — see User Review Required above).

6. noStaticOnlyClass Resolution
[MODIFY] 
biome.json
Depending on your answer to Q1:

(a) Set "noStaticOnlyClass": "off" → remove all 12 biome-ignore comments
(b) Keep "error" → refactor 12 utility classes (bigger effort, better long-term)
7. CI Lint Gate (Optional Enhancement)
[MODIFY] 
deploy.yml
The current deploy skips linting (npx vite build # Skip linting for deployment). Add a lint step:

yaml
- name: Quality checks
  run: npm run quality
  working-directory: ./Z_TD
- name: Build with Vite
  run: npx vite build
  working-directory: ./Z_TD
Verification Plan
Automated Tests
Run npx @biomejs/biome check . — verify new rules don't have false positives in existing code (or document expected violations)
Run npx tsc --noEmit — verify stricter tsconfig flags don't break existing code
Run npx eslint src/**/*.ts — verify boundary rules match the intended architecture
Run npm run quality — verify the unified script chains correctly
Manual Verification
Review any new lint violations to ensure they're genuine issues, not false positives
Verify that VS Code editor integration still works (format-on-save, lint-on-save)
Summary of Rule Counts
Category	Current Rules	After
Biome correctness	3	6
Biome suspicious	4	10
Biome style	4	12
Biome complexity	2	6
Biome performance	0	3
ESLint boundaries	0 (disabled)	3
TypeScript strictness	1 flag on	4 flags on
Total new rules		~25
