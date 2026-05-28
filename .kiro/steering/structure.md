---
inclusion: always
---

# Project Structure

Quick reference for navigating and extending the Z-TD tower defense codebase.

## Directory Map

| Directory | Purpose | Key Files |
|-----------|---------|-----------|
| `src/core/` | Application bootstrap, game loop, debug systems | Application.ts, GameLoop.ts, DebugHotkeys.ts |
| `src/managers/` | Game system managers (domain logic) | GameManager.ts, TowerManager.ts, WaveManager.ts, ZombieManager.ts |
| `src/objects/` | Game entities and factories | Tower.ts, Zombie.ts, TowerFactory.ts, ZombieFactory.ts |
| `src/components/` | Reusable entity components | HealthComponent.ts, TransformComponent.ts, ResourceCost.ts |
| `src/config/` | Game constants and configuration | gameConfig.ts, towerConstants.ts, zombieResistances.ts |
| `src/renderers/` | Visual rendering systems | CombatRenderer.ts, VisualMapRenderer.ts |
| `src/ui/` | UI components (HUD, menus, panels) | HUD.ts, TowerShop.ts, MainMenu.ts, UIManager.ts |
| `src/utils/` | Utilities, effects, performance tools | EffectCleanupManager.ts, ResourceCleanupManager.ts, EventBus.ts |
| `src/types/` | TypeScript type definitions | tower-internal.ts, zombie-waypoints.ts |

```
src/
├── core/           # App bootstrap, game loop, debug, input
├── managers/       # Domain-specific game systems
├── objects/        # Entities (Tower, Zombie, Projectile)
│   ├── towers/     # Tower implementations
│   └── zombies/    # Zombie implementations
├── components/     # Composable entity behaviors
├── config/         # Constants, balancing, configuration
├── renderers/      # PixiJS rendering systems
│   ├── effects/    # Visual effects (particles, etc.)
│   ├── map/        # Map rendering
│   ├── towers/     # Tower renderers
│   └── zombies/    # Zombie renderers
├── ui/             # UI components and shaders
├── utils/          # Shared utilities and managers
├── types/          # Type definitions
├── main.ts         # Entry point
└── index.ts        # Public API exports
```

## Architecture Patterns

### Path Aliases (REQUIRED)

Always use `@/` aliases instead of relative paths:

```typescript
// ✅ CORRECT
import { GameManager } from '@/managers/GameManager';
import type { TowerConfig } from '@/config/towerConstants';

// ❌ WRONG
import { GameManager } from '../managers/GameManager';
```

Available aliases: `@/`, `@components/`, `@managers/`, `@objects/`, `@ui/`, `@utils/`, `@config/`, `@renderers/`

### Manager Pattern

Core systems are managers coordinated by GameManager:

- Each manager handles one domain (towers, waves, zombies, projectiles, etc.)
- Expose public methods for cross-manager interaction
- Use callbacks/events for communication, not direct coupling
- Follow the `IGameManager` interface contract

### Component-Based Entities

Game objects use composition over inheritance:

- Extend `GameObject` base class
- Compose with components (HealthComponent, TransformComponent)
- Implement interfaces (`Tower.interface.ts`)

### Factory Pattern

Create entities through factories:

- `TowerFactory.createTower(type, position)` - tower instantiation
- `ZombieFactory.createZombie(type, path)` - zombie instantiation

### UI Components

UI elements extend `UIComponent` base:

- Self-contained PixiJS Container
- Register with `UIManager` for lifecycle
- Use callbacks for game system communication

## File Naming

| Type | Convention | Example |
|------|------------|---------|
| Classes | PascalCase | `GameManager.ts` |
| Interfaces | `.interface.ts` suffix | `Tower.interface.ts` |
| Tests | `.test.ts` suffix | `GameManager.test.ts` |
| Index | `index.ts` | Re-exports module contents |

## Entry Points

- `src/main.ts` - Application bootstrap
- `src/index.ts` - Public API exports
- `index.html` - HTML container (`pixi-container` div)

## Cross-Cutting Concerns

| Concern | Location | When to Use |
|---------|----------|-------------|
| Memory cleanup | `src/utils/EffectCleanupManager.ts`, `ResourceCleanupManager.ts` | All timers, persistent effects |
| Events | `src/utils/EventBus.ts` | Cross-manager communication |
| Performance | `src/utils/PerformanceMonitor.ts`, `PerformanceProfiler.ts` | Profiling, optimization |
| Debug | `src/core/DebugConsole.ts`, `DebugHotkeys.ts` | Development tools |

## Testing

- Tests colocated with source files
- PixiJS mocked in `__mocks__/pixi.js`
- Config: `jest.config.js`, `tsconfig.test.json`
