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
