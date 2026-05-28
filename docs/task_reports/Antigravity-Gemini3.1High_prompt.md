# Zombie TD Modernization Skill

## Objective
Evaluate the current Zombie Tower Defence project and propose a modern, stable, high-performance architecture with strong visuals, scalable systems, and low-friction development workflows.

## Inputs
- Current codebase / skill file / architecture notes
- Engine + renderer details
- Known bottlenecks
- Current feature set

## Evaluation Areas
- Runtime performance
- Rendering and effects
- Enemy/tower simulation
- Pathfinding and map logic
- UI/UX clarity
- Content pipeline
- Save/meta progression
- Developer workflow

## Outputs
- Current-state audit
- Risk list
- Recommended architecture
- Feature roadmap
- Prioritized implementation phases
- Acceptance criteria

---
To Adapt into new one:
# Zombie TD Modernization Skill

## Role & Objective
You are a senior game architect. Evaluate the current Zombie Tower Defence project and propose a modern, stable, high-performance architecture. Focus heavily on stable frame times, scalable systems, and low-friction development workflows. Avoid generic advice; provide concrete, actionable technical patterns.

## Context & Inputs
- **Tech Stack:** [Insert your stack here, e.g., TypeScript, Pixi.js, HTML5 Canvas/WebGL]
- **Current codebase constraints:** [Insert briefly, e.g., "Currently using OOP with heavy GC allocation per frame"]
- **Target scale:** Support hundreds of concurrent zombies and projectiles without dropping below 60FPS.

## Evaluation & Architecture Guidelines
When generating your evaluation and target architecture, you must adhere to the following principles:

1. **Runtime Performance & Memory:** Prioritize zero-allocation game loops. Propose object pooling for all projectiles, enemies, and VFX. 
2. **Rendering & Effects:** Recommend batching strategies. Separate UI rendering from world rendering. Suggest LOD-style effects (e.g., less complex particles when entity counts are high).
3. **Simulation & Pathfinding:** Decouple logic from presentation. Prefer grid-based path caching or flow fields over expensive per-entity physics/navmesh calculations.
4. **Developer Workflow (Data-Driven):** Design the system so that waves, tower stats, and enemy types are entirely data-driven (JSON/TS configs) rather than hardcoded, enabling rapid balancing.
5. **Game Design & UX:** Recommend modern TD features (e.g., lane previews, distinct armor/shield/healer zombie types, clear DPS/range UI indicators).

## Required Outputs
Please generate a comprehensive technical document structured exactly as follows:
1. **Current-State Audit:** Identify the most likely bottlenecks in a standard TD implementation.
2. **Target Architecture:** Concrete structural patterns (e.g., ECS, Data-Driven Content Pipeline, Flow Field Pathfinding).
3. **Feature Roadmap:** High-value gameplay and QoL enhancements specific to a modern Zombie TD.
4. **Implementation Phases:** A 3-step prioritized execution plan (1. Stabilize/Refactor, 2. Expand Core, 3. Polish).
5. **Acceptance Criteria:** Strict technical performance and workflow metrics to measure success.