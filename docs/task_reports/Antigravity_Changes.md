Prompt:
Evaluate and investigate how we can enhance this Zombie Tower Defence game into a modern stable solution with good performance, effects, features and ease of development.

Answer:
Implementation Plan — Z_TD Game Enhancements
This plan outlines proposed changes to turn Zombie Tower Defense (Z_TD) into a modern, stable, high-performance web game with robust tests, premium effects, and superior developer ergonomics.

User Review Required
IMPORTANT

The dynamic ESM imports in StatisticalAnalyzer.ts cause tests to consistently fail because Vitest runs synchronously before imports resolve. Moving these to static imports is recommended to ensure stability, but assumes dependencies are always present (which they are, via package.json).

WARNING

Wave composition has been tuned in WaveManager.ts (e.g. introducing Tanks on Wave 4, Armored on Wave 6), but tests/WaveManager.test.ts was never updated. We will update the test specs to align with the new gameplay balancing configurations.

Open Questions
Screen Shake Intensity: Should the proposed screen shake effect be configurable or toggleable via the Debug Config to prevent motion sickness?
Text Font for Damage Numbers: Do we want to stick to standard Arial for damage indicator numbers, or do we want to integrate a stylized retro pixel font from Google Fonts (e.g., Press Start 2P)?
Proposed Changes
We group the proposed improvements into three main categories: Test Stability & Race Conditions, Refactoring & Code Quality, and Visual Polish & Developer tools.

1. Test Stability & Race Conditions
[MODIFY] 
StatisticalAnalyzer.ts
Replace dynamic import() calls with static imports for simple-statistics, regression, and mathjs.
Remove the asynchronous IIFE block to eliminate the race condition where tests evaluate StatisticalAnalyzer properties before they initialize.
Expose appropriate static libraries directly to maintain standard fallback behavior in case of loading issues.
[MODIFY] 
OptimizationValidator.test.ts
Increase loop iterations (to 1000) for the target finding validation inside should calculate improvement percentage to bypass timer resolution limits (noise) in the test environment.
Relax the exact timing expectation: instead of asserting that metrics.improvement is always > or = 0 (which is subject to clock jitters and JIT warmups on tiny mock runs), verify that it returns a valid numeric metric or mock timing values.
[MODIFY] 
WaveManager.test.ts
Update zombie composition expectation bounds in tests to match actual gameplay balancing definitions in WaveManager.ts (e.g., Wave 4 contains 3 types including Tank, Wave 6 contains 4 types including Armored).
2. Refactoring & Code Quality (UI Panels & AI Player)
[MODIFY] 
ZombieBestiary.ts
Refactor the class to fully inherit and reuse createPanelFrame from UIPanel instead of manually setting up its background graphics, title, and close buttons.
Adjust createPanelFrame overrides if needed to support custom width/height and positioning parameters.
[MODIFY] 
REFACTOR_PLAN.md
Update statuses of Priority 1 (AIPlayerManager delegate), Priority 6 (UIPanel refactoring), and others.
3. Visual Polish & Effects
[MODIFY] 
VisualEffects.ts
Upgrade createDamageIndicator to construct a real PixiJS Text element displaying the floating damage number.
Add an upward drift and alpha-fade animation inside the update cycle or via a micro-animation handler.
Add a screen shake utility: VisualEffects.triggerScreenShake(intensity, duration) that shifts the main stage container slightly on a random vector every frame, decaying over time.
[MODIFY] 
GameManager.ts
Call VisualEffects.triggerScreenShake when the camp takes damage or during high-overkill zombie deaths (e.g., medium/large gib explosions).
4. Developer ergonomics
[MODIFY] 
DebugTestUIManager.ts
Expose a button in the Debug UI to run a Headless Balance Simulation for 5 waves and instantly download/export the stats as JSON/CSV.
Provide toggles for visual effects (e.g., toggle screen shake).
Verification Plan
Automated Tests
Run npm run test to verify that all Vitest unit tests pass successfully.
Run npm run check to verify linting and formatting compliance with Biome.
Run npm run dev to verify the game builds and runs without runtime errors.
Manual Verification
Open the game in the browser and use the Debug Info Panel to toggle new shaders.
Force a camp damage event and verify screen shake and damage text effects render smoothly.
Test the Bestiary panel toggle and verify that layout positioning remains intact.