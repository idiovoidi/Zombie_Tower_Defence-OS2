Zombie Tower Defense (Z_TD) - Modernization & Enhancement Plan
This document evaluates the current state of the Z_TD project and proposes a comprehensive modernization roadmap focusing on performance, visual effects, gameplay features, and developer experience.

User Review Required
IMPORTANT

The transition to a true Entity-Component System (ECS) represents a significant architectural shift. Please review the Architecture & Ease of Development section carefully, as it will fundamentally change how game objects and logic are structured.

TIP

The proposed visual enhancements (Shaders, Post-processing) will require migrating some raw PIXI.Graphics drawing calls to Sprites/Textures and specific WebGL shaders. This is normal for scaling up a PixiJS v8 game.

Open Questions
Target Platforms: Are we specifically targeting desktop web, or is mobile web a strict requirement for this modernization phase? (Currently, hardcoded resolutions like 1024x768 are present).
ECS Framework: Would you prefer to implement a lightweight custom ECS or use an established, highly optimized library like bitecs?
Art Assets: The game currently heavily uses primitive graphics (rectangles, circles). Do you want to continue with a stylized primitive/vector look using shaders, or transition to sprite-based assets?
Execution Priority: Out of the 4 categories below (Architecture, Performance, Visuals, Features), which is your highest priority for us to tackle first?
1. Architecture & Ease of Development
Current State Evaluation
The game utilizes a hybrid "Manager Architecture" (24+ managers orchestrated by GameManager) with partial component patterns (zombie.getComponent('Health')). While recent refactoring introduced LevelState, EconomyState, and EventBus to reduce coupling, the system is still highly OOP-centric. GameManager remains large and manually syncs arrays between managers.

Proposed Enhancements
True Entity-Component System (ECS): Migrate from the manager-heavy OOP approach to a strict ECS (e.g., using bitecs).
Why: Drastically improves performance through data locality, separates state (Components) from logic (Systems), and makes adding new behaviors trivial without touching core orchestrators.
Data-Driven Configuration: Move tower stats, zombie definitions, and wave compositions entirely into external JSON/TS configurations.
Why: Allows non-programmers to balance the game without recompiling. The current GameConfig.ts is a start, but we should expand it to a full configuration loader.
Dependency Injection (DI): Implement a lightweight DI container.
Why: Reduces boilerplate in GameManager initialization and makes unit testing individual managers/systems significantly easier.
2. Performance Optimizations
Current State Evaluation
Performance monitoring (PerformanceMonitor, OptimizationValidator) is already built-in, which is excellent. However, WebGL is primarily used for basic shape rendering, and collision/combat updates might become a bottleneck during late waves with swarm zombies.

Proposed Enhancements
Strict Object Pooling: Enforce object pooling for everything that spawns frequently (Zombies, Projectiles, Particles, Floating Text).
Spatial Hashing / QuadTrees: Ensure collision detection (projectiles hitting zombies, tower range checks) uses a spatial partition grid rather than iterating over all entities.
Web Workers for Heavy Lifting: Offload pathfinding (if dynamic) and AI Player Analytics/Balance Simulations to Web Workers to prevent blocking the main rendering thread.
Render Texture Caching: Cache static elements (like the map terrain, non-animated corpses, and sludge pools) into a single Render Texture rather than drawing hundreds of primitive shapes every frame.
3. Visual Effects & Polish
Current State Evaluation
The game uses standard PIXI.Graphics for towers, zombies, and effects like lasers or fire. It has basic screenshake and blood particles.

Proposed Enhancements
Post-Processing Pipeline: Utilize @pixi/filter-bloom, chromatic aberration, and color grading filters to give the game a modern, dark, premium "post-apocalyptic" aesthetic.
High-Performance Particles: Migrate custom particle systems to @pixi/particle-emitter for GPU-accelerated explosions, smoke, muzzle flashes, and fire.
Custom WebGL Shaders:
Dynamic 2D Lighting (towers casting shadows, glowing projectiles).
Fog of War and toxic sludge pool distortions.
Juice & Micro-Animations: Add easing and tweening (using GSAP or Pixi Tween) for UI popups, tower recoil, and zombie hit reactions.
4. Gameplay Features
Current State Evaluation
The game has a solid TD loop with 7 tower types, 7 zombie types, a damage resistance matrix, and a unique AI Player balance system.

Proposed Enhancements
Meta-Progression (Skill Tree): Allow players to spend persistent currency (earned from runs) on permanent upgrades (e.g., +5% Machine Gun damage, cheaper camp upgrades).
Dynamic Pathing / Mazing: Allow players to place barricades or towers directly on the path to force zombies to re-route, adding a massive strategic layer.
Endless Mode & Leaderboards: A mode with procedurally scaling health/speed for infinite waves.
Boss Encounters: Special waves featuring massive zombies with unique abilities (e.g., spawning swarms, temporarily disabling towers).
Verification Plan
Automated Tests
Run existing Vitest suite to ensure no regressions in economy or basic manager logic.
Run npm run dupcheck and npm run quality to ensure architectural cleanliness.
Manual Verification
Launch the game with debug hotkeys enabled.
Spawn a late-game wave (Wave 20+) to visually verify performance (target: stable 60 FPS on desktop).
Verify the new visual effects (bloom, particles) render correctly without visual artifacts.