---
inclusion: always
---

# Project Structure

## Directory Map

| Path | Purpose |
|------|---------|
| `src/core/` | App bootstrap, game loop, debug, input |
| `src/managers/` | Domain game systems (GameManager coordinates all) |
| `src/objects/` | Entities: Tower, Zombie, Projectile + factories |
| `src/components/` | Composable behaviors: HealthComponent, TransformComponent |
| `src/config/` | Constants: gameConfig, towerConstants, zombieResistances |
| `src/renderers/` | PixiJS rendering (towers/, zombies/, map/, effects/) |
| `src/ui/` | HUD, menus, panels, shaders |
| `src/utils/` | EffectCleanupManager, ResourceCleanupManager, EventBus, pools |
| `src/types/` | Shared TypeScript type definitions |

## Path Aliases (REQUIRED — no relative paths in src/)

```typescript
import { GameManager } from '@managers/GameManager';   // @managers/ → src/managers/
import type { TowerConfig } from '@config/towerConstants';
// Also: @/ @components/ @objects/ @ui/ @utils/ @config/ @renderers/
```

## Architecture

**Manager Pattern** — each manager owns one domain, coordinated by `GameManager`. Cross-manager communication via callbacks or `EventBus`. Follow `IGameManager` interface.

**Entities** — extend `GameObject`, compose with components, implement `.interface.ts` contracts.

**Factories** — `TowerFactory` / `ZombieFactory` for all entity creation.

**UI** — extend `UIComponent`, register with `UIManager`, communicate via callbacks.

**Renderers** — separate from game logic. Entities own a renderer reference; renderers handle all PixiJS Graphics. See `core/renderers.md`.

## File Naming

| Type | Convention |
|------|------------|
| Classes | `GameManager.ts` (PascalCase) |
| Interfaces | `Tower.interface.ts` |
| Tests | `test-[feature]_DD-MM-YYYY.test.ts` |
| Index | `index.ts` (re-exports only) |

## Entry Points
- `src/main.ts` — bootstrap
- `index.html` — `pixi-container` div
