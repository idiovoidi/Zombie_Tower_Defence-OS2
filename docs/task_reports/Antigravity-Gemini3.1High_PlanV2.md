Zombie TD Modernization Strategy
This document provides a comprehensive evaluation of the current Zombie Tower Defense (Z_TD) project and proposes a modernized, stable, high-performance architecture.

Current-State Audit
Engine & Tooling:

Engine: PixiJS v8 (Modern WebGL/WebGPU capable).
Language/Build: TypeScript, Vite, Vitest.
Code Quality: Strong integration of Biome (linting/formatting), jscpd (duplicate detection), and dependency-cruiser.
Recent Maintenance: A successful deduplication pass has recently established solid baseline patterns (e.g., BaseZombieRenderer, BaseTowerRenderer, UIPanel).
Architecture & Logic:

Pattern: Manager-heavy (24 distinct managers).
Core Orchestration: GameManager.ts is massive (~25KB) and acts as a central hub, alongside bulky BalanceTrackingManager and WaveManager.
Communication: Decoupled inter-system communication via an EventBus.
Optimization: Spatial Grid for collision and Dirty Flag systems for array updates are currently implemented.
Rendering & Visuals:

Renderers: 52 renderer classes (currently decoupled from core logic).
Visual Features: Post-apocalyptic palette, dynamic lighting (via basic shaders), and blood particle systems.
Analytics: Complex AI Player mode and built-in balance analytics system tracking overkill, efficiency, and survivability.
Risk List
WARNING

God Objects & Manager Bloat: GameManager and BalanceTrackingManager are handling too many responsibilities. This makes unit testing difficult and increases the risk of side-effects during feature additions.

CAUTION

Pseudo-ECS vs Pure ECS: The current "Component Pattern" layered underneath massive Object-Oriented Managers leads to an identity crisis. Logic is fragmented between managers, game objects, and components.

CAUTION

Draw Call Bottlenecks: While rendering is cleanly separated, managing 52 distinct renderer classes might lead to inefficient batching in PixiJS if standard Containers/Graphics are heavily used over advanced batching or Instanced rendering, especially during late-game waves (e.g., Swarm waves).

WARNING

Hardcoded Data: Much of the wave composition, tower stats, and zombie stats are tightly bound to the code. This slows down balance iterations and prevents easy expansion.

Recommended Architecture
Pure Entity-Component-System (ECS):

Shift from the 24 Manager pattern to a lightweight, pure ECS (like bitecs or a custom data-oriented implementation).
Entities: Simple IDs.
Components: Flat data structures (Transform, Health, Velocity, Targetable).
Systems: Pure functions that iterate over specific component signatures (e.g., MovementSystem, CombatSystem).
Data-Driven Content Pipeline:

Decouple all game data (Wave configs, Tower stats, Zombie attributes) into pure JSON/YAML or static configuration files.
Implement hot-reloading for config files in the Vite dev environment so designers can tweak balance in real-time.
Rendering Optimization (PixiJS v8 Native):

Fully leverage Pixi v8's WebGPU backend and batching capabilities.
Consolidate dynamic UI and small health bars into batched geometry.
Use Object Pooling universally for Particles, Projectiles, and generic Zombies.
State Machine Game Flow:

Replace boolean flags and switch statements in GameManager with a formal State Machine library (e.g., XState) to handle transitions between Menu, Preparation, Build, Combat, and Resolution phases.
Feature Roadmap
The Great Decoupling: Break down GameManager into a formal State Machine; extract all hardcoded stats into configuration files.
ECS Integration: Migrate physics (Spatial Grid), movement, and combat targeting to a strict ECS loop.
Rendering Overhaul: Refactor renderer classes to consume raw ECS data directly, applying PixiJS advanced batching and shader instances.
Visual Flourishes: Introduce advanced post-processing (bloom, ambient occlusion), detailed micro-animations, and dynamic 2D lighting (normal maps on 2D sprites).
Developer & Modder Toolkit: Build a web-based balance tweaking UI that saves back to the local JSON config, plus map editor capabilities.
Prioritized Implementation Phases
Phase 1: Foundation & Data Extraction
Extract Tower, Zombie, and Wave definitions into configuration files.
Introduce an explicit FSM (Finite State Machine) for the core game loop to replace GameManager routing.
Goal: Zero logic changes, purely structural decoupling.
Phase 2: Systematization (The ECS Pivot)
Refactor the Spatial Grid and targeting logic into distinct Systems.
Migrate the bulky TowerCombatManager and ZombieManager into stateless ECS Systems operating on component data arrays.
Goal: Predictable, high-performance logic updates.
Phase 3: Rendering & VFX Modernization
Upgrade the 52 renderers to use PixiJS v8's Mesh and batching tools instead of individual Graphics / Sprite nodes where applicable.
Overhaul the BloodParticleSystem to utilize WebGPU compute shaders or optimized particle containers.
Goal: Consistent 60-120 FPS during extreme stress tests (1000+ entities).
Phase 4: Polish & Expansion
Finalize advanced UI, dynamic lighting effects, and tower specific idle micro-animations.
Goal: Premium, modern aesthetic that "wows" users.
Acceptance Criteria
Performance: The game maintains >60 FPS with minimal GC pauses while running 500+ active entities (Zombies + Projectiles + Particles) on screen simultaneously.
Code Health: GameManager size is reduced by >80%; circular dependencies remain at 0 (enforced by dependency-cruiser).
Data-Driven Workflow: A new tower or zombie type can be introduced solely by editing configuration files and providing graphical assets, without writing new logic classes (unless it has a wholly unique mechanic).
Visual Standards: The game features dynamic lighting, particle-based hit impacts, and smooth interpolations natively powered by PixiJS v8 features.
User Review Required
IMPORTANT

Please review this modernization strategy. Specifically:

Do you agree with pivoting from the heavy Manager pattern to a pure ECS?
Are you open to using a state machine library (like XState) to handle the GameManager logic?
Should we prioritize rendering optimizations first, or the data-driven config extraction?