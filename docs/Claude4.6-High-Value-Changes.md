High-Value Changes for Z_TD
Analysis of the codebase across code quality, architecture, game design, and performance, ranked by impact-to-effort ratio.

🔴 Tier 1 — High Impact, Moderate Effort
1. Data-Drive the Zombie Class (Eliminate 6 Switch Statements)
Zombie.ts
 has six switch(this.type) blocks that all map the same 7 zombie types to data. The Tower class already solved this with getTowerStats() config lookup.

What to do: Create a zombieConstants.ts config (mirroring towerConstants.ts) with per-type data for speed, reward, damage, sway amplitude, visual size, knockback resistance, and renderer class. Then collapse all switch statements into config lookups.

Why it's high value:

Removes ~120 lines of repetitive branching
Adding a new zombie type becomes adding 1 config entry instead of touching 6+ places
Brings Zombie in line with the Tower pattern (consistency)
Eliminates a class of bugs where one switch is updated but another isn't
diff
-  switch (this.type) {
-    case GameConfig.ZOMBIE_TYPES.BASIC: this.baseSpeed = 50; ...
-    case GameConfig.ZOMBIE_TYPES.FAST: this.baseSpeed = 100; ...
-    ... (7 cases × 6 switches)
+  const stats = getZombieStats(this.type);
+  this.baseSpeed = stats.speed;
+  this.reward = stats.reward;
+  this.damage = stats.damage;
Files: src/config/zombieConstants.ts [NEW], src/objects/Zombie.ts, src/managers/CorpseManager.ts

2. Eliminate CorpseManager's Duplicate Renderer Factory
CorpseManager.ts
 has a hand-rolled switch statement (lines 72-96) that duplicates the exact zombie renderer factory logic already in 
Zombie.ts
. Both construct renderers by type string.

What to do: Extract a ZombieRendererFactory (mirroring TowerRendererFactory) and use it in both places.

Why it's high value:

Eliminates a guaranteed desync bug — if a new zombie type is added, CorpseManager will silently fall back to BasicZombieRenderer
Directly parallels the existing TowerRendererFactory pattern
Files: src/renderers/zombies/ZombieRendererFactory.ts [NEW], src/objects/Zombie.ts, src/managers/CorpseManager.ts

3. Fix the 48 TypeScript Errors
The type checker (tsc --noEmit) currently reports 48 errors. These fall into 3 categories:

Category	Count	Fix
Missing override modifier	~10	Add override keyword
Index signature access (TS4111)	~35	Use bracket notation ['key']
Missing property (TS2339)	2	Declare or fix the property
Why it's high value:

The build script runs tsc — so production builds are currently broken
These are all mechanical fixes, no design decisions needed
Fixes in ~30 minutes
CAUTION

The build pipeline (npm run build) gates on npm run quality which runs tsc --noEmit. These errors mean you cannot ship.

4. Remove the @pixi/spine-pixi Dependency
package.json
 still lists @pixi/spine-pixi: ^2.0.0 as a production dependency. Per conversation history, the Spine architecture was explicitly replaced with procedural ragdolls. This is dead weight.

What to do: npm uninstall @pixi/spine-pixi, verify no imports remain.

Why it's high value: It's a single command that reduces bundle size and removes a confusing dependency.

🟡 Tier 2 — High Impact, Higher Effort
5. Unify the Dual Damage Pipelines
Damage application currently happens in two independent places with subtly different behavior:

TowerCombatManager.applyDamageToZombie()
 — used by Tesla lightning arcs (instant hit)
Projectile.applyDamageToZombie()
 — used by all projectile-based towers
Both compute modifier × damage, emit DAMAGE_DEALT, and have legacy callback support — but the Projectile version also handles knockback and sends zombieX/zombieY/zombieId in the event payload while TowerCombatManager does not.

What to do: Extract a DamageService or utility function that both call. This is the single source of truth for "apply damage to a zombie."

Why it's high value:

Current inconsistency means analytics data differs between instant-hit towers (Tesla) and projectile towers
Adding a new damage feature (e.g., critical hits, damage numbers) requires patching two places
Knockback is silently missing from Tesla — may be intentional but is hidden by the split
6. Complete the Unfinished Refactor Items
From 
REFACTOR_PLAN.md
, two items remain open:

Item	Status	Impact
P1: AIPlayerManager + StatTracker dedup	❌ Todo	~1000 lines of overlap. Largest single duplication.
P6: UI Panel Boilerplate	❌ Todo	4 panels share identical setup boilerplate. UIPanel.ts was created but panels may not be migrated.
P1 is the highest-value item by raw line count.

7. Replace String Types with Enums/Unions
Tower types and zombie types are plain strings throughout the codebase (this.type: string). The config defines them as string constants (TOWER_TYPES.MACHINE_GUN = 'MachineGun') but nothing enforces correctness at the type level.

What to do: Define type TowerType = 'MachineGun' | 'Sniper' | ... and type ZombieType = 'Basic' | 'Fast' | ... union types, then use them instead of string in Tower, Zombie, TowerCombatManager, renderers, etc.

NOTE

zombieResistances.ts already has TowerType and ZombieType enums. They just aren't used in the object classes.

Why it's high value:

Catches typos at compile time instead of runtime
Enables exhaustive switch checking
Makes "add a new tower/zombie type" a compiler-guided process
8. EffectManager is a 1,096-Line God Class
EffectManager.ts
 at 33KB / 1,096 lines handles shell casings, muzzle flashes, bullet trails, impact flashes, scope glints, burning ground, lightning arcs, flame streams, electric particles, damage flashes, and fire pool damage. Each with pool management and lifecycle.

What to do: Extract per-effect-type managers (e.g., ShellCasingManager, LightningArcManager) that the EffectManager orchestrates. The internal pattern is already copy-paste (every spawn* method follows identical acquire/limit/add flow).

Why it's high value:

The file is hard to navigate and modify
Each effect type is already self-contained — they just happen to be in one file
The duplicated spawn/update/cleanup pattern (visible across 6 effect types) can be generalized into a base EffectPool<T> class
🟢 Tier 3 — Game Design Improvements
9. WaveManager Has Overlapping/Conflicting Data
WaveManager.ts
 defines wave data for waves 31-40 twice with conflicting compositions:

Lines 306-345: "Heavy assault" definition for waves 31-40
Lines 348-387: Different "waves 31-35" definition that overwrites the first
Lines 390-429: Different "waves 36-40" definition that overwrites the first
The second and third blocks silently replace the first. This means the "Heavy assault" tier (70 + i5 zombies) is dead code, and actual wave 31-40 difficulty is significantly lower than intended (40 + i4.5 vs 70 + i*5).

WARNING

This is likely a balance bug. Waves 31-40 are significantly easier than waves 21-30 because the second definition uses lower base counts.

10. Game State Machine is Stringly Typed
Game states are plain strings (this.currentState = 'Playing') with no formal state machine. There are duplicate getters:

getCurrentState() and getState() return the same thing
removeLives() and loseLife() do nearly the same thing (both reduce lives, fire damage flash, and trigger game over)
What to do:

Remove one of each duplicate pair
Consider a simple state machine (even just a TypeScript enum + transition validation) to prevent invalid state transitions
11. Tower.applyUpgradeEffects() Creates a New TowerManager Every Call
Tower.ts line 366
:

typescript
const towerManager = new TowerManager();
Every time a tower is upgraded, a brand new TowerManager is instantiated just to call calculateTowerDamage(). These are pure calculation methods that should be static, or the TowerManager should be injected.

📋 Summary — Recommended Execution Order
#	Change	Effort	Impact	Quick Win?
3	Fix 48 TypeScript errors	30min	🔴 Unblocks builds	✅
4	Remove Spine dependency	5min	🟡 Clean deps	✅
11	Fix TowerManager instantiation in Tower	10min	🟡 Perf + correctness	✅
10	Remove duplicate getters	15min	🟡 API clarity	✅
9	Fix wave 31-40 data conflict	20min	🔴 Balance bug	✅
1	Data-drive Zombie class	2h	🔴 Maintainability	
2	Extract ZombieRendererFactory	1h	🔴 Eliminates desync bug	
7	String types → union types	2h	🟡 Type safety	
5	Unify damage pipeline	2h	🔴 Correctness	
6	Complete P1/P6 refactors	4h	🟡 -1000 lines	
8	Split EffectManager	4h	🟡 Maintainability	
The first 5 items are all quick wins that can be done in under an hour total. Items 1-2 are the highest-value architectural changes that set up the codebase for easy extension.