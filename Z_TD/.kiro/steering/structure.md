---
inclusion: always
---

# Project Structure

## Directory Organization

```
src/
├── assets/          # Game assets (currently empty)
├── components/      # Reusable game components (health, transform, resource cost)
├── config/          # Configuration files (game config, dev config)
├── managers/        # Game system managers
├── objects/         # Game entities (towers, zombies, game objects)
│   ├── towers/      # Tower type implementations
│   └── zombies/     # Zombie type implementations
├── renderers/       # Visual rendering systems
├── types/           # TypeScript type definitions
├── ui/              # UI components (HUD, menus, panels)
├── utils/           # Utility functions (debug, visual effects)
├── index.ts         # Public API exports
├── main.ts          # Application entry point
└── vite-env.d.ts    # Vite type definitions
```

## Architecture Patterns

### Manager Pattern

Core game systems are organized as managers (GameManager, TowerManager, WaveManager, etc.). Each manager:

- Handles a specific domain of game logic
- Is instantiated and coordinated by GameManager
- Exposes public methods for interaction
- Uses callbacks for cross-manager communication

### Component-Based Entities

Game objects (Tower, Zombie) use composition:

- Extend base GameObject class
- Compose functionality with components (HealthComponent, TransformComponent)
- Implement specific interfaces (Tower.interface.ts)

### Factory Pattern

Object creation uses factories:

- TowerFactory for creating tower instances
- ZombieFactory for creating zombie instances

### UI Components

UI elements extend UIComponent base class:

- Self-contained PixiJS Container instances
- Registered with UIManager for lifecycle management
- Use callbacks to communicate with game systems

## Path Aliases

All major directories have path aliases configured:

- `@/` → `src/`
- `@components/` → `src/components/`
- `@managers/` → `src/managers/`
- `@objects/` → `src/objects/`
- `@ui/` → `src/ui/`
- `@utils/` → `src/utils/`
- `@config/` → `src/config/`
- `@renderers/` → `src/renderers/`

Use these aliases in imports for cleaner, more maintainable code.

## File Naming Conventions

- Classes: PascalCase (e.g., `GameManager.ts`, `TowerShop.ts`)
- Tests: `*.test.ts` suffix (e.g., `GameManager.test.ts`)
- Interfaces: PascalCase with `.interface.ts` suffix (e.g., `Tower.interface.ts`)
- Index files: `index.ts` for re-exporting module contents
- Documentation: `.md` suffix for markdown docs alongside code

## Key Entry Points

- `src/main.ts` - Application bootstrap and initialization
- `src/index.ts` - Public API exports for library usage
- `index.html` - HTML entry point with `pixi-container` div

## Testing Structure

- Tests colocated with source files
- PixiJS mocked in `__mocks__/pixi.js`
- Coverage reports generated in `coverage/` directory
- Test configuration in `jest.config.js` and `tsconfig.test.json`
