---
inclusion: fileMatch
fileMatchPattern: ['**/renderers/**/*.ts', '**/objects/Tower.ts', '**/objects/Zombie.ts']
---

# Renderer Separation Pattern

Architectural pattern for separating rendering logic from game logic in entities.

## Principle

**Separation of Concerns**: Game entities should focus on behavior and state, while dedicated renderer classes handle visual representation.

## Quick Reference

| Concern          | Location           | Responsibility                             |
| ---------------- | ------------------ | ------------------------------------------ |
| **Game Logic**   | `src/objects/`     | State, behavior, components, updates       |
| **Rendering**    | `src/renderers/`   | Visual representation, effects, animations |
| **Coordination** | Entity constructor | Create and assign renderer                 |

## Rules

### Entity Classes (Tower, Zombie, etc.)

✅ **DO:**

- Manage game state (health, position, damage)
- Handle game logic (shooting, movement, upgrades)
- Manage components (HealthComponent, TransformComponent)
- Store renderer reference
- Call renderer methods for visual updates

❌ **DON'T:**

- Create Graphics primitives directly (circles, rects)
- Define colors, sizes, visual layouts
- Implement visual upgrade progression
- Handle visual effects (muzzle flashes, particles)

### Renderer Classes

✅ **DO:**

- Implement `IRenderer` interface
- Handle all visual representation
- Manage Graphics objects lifecycle
- Implement visual upgrade progression
- Create visual effects
- Clean up graphics in `destroy()`

❌ **DON'T:**

- Modify entity game state
- Implement game logic
- Store game-critical data
- Make gameplay decisions

## File Structure

```
src/
├── objects/
│   ├── Tower.ts              # Game logic only
│   └── Zombie.ts             # Game logic only
├── renderers/
│   ├── towers/
│   │   ├── TowerRenderer.ts       # Interface
│   │   ├── TowerRendererFactory.ts
│   │   ├── MachineGunRenderer.ts
│   │   ├── SniperRenderer.ts
│   │   └── ...
│   └── zombies/
│       ├── ZombieRenderer.ts      # Interface
│       ├── ZombieRendererFactory.ts
│       └── ...
```

## Interface Pattern

```typescript
// src/renderers/towers/TowerRenderer.ts
export interface ITowerRenderer {
  render(visual: Graphics, barrel: Graphics, type: string, upgradeLevel: number): void;

  renderShootingEffect(barrel: Graphics, type: string, upgradeLevel: number): void;

  destroy(): void;
}
```

## Factory Pattern

```typescript
// src/renderers/towers/TowerRendererFactory.ts
export class TowerRendererFactory {
  static create(type: string): ITowerRenderer {
    switch (type) {
      case GameConfig.TOWER_TYPES.MACHINE_GUN:
        return new MachineGunRenderer();
      case GameConfig.TOWER_TYPES.SNIPER:
        return new SniperRenderer();
      // ...
      default:
        return new DefaultTowerRenderer();
    }
  }
}
```

## Entity Integration Pattern

```typescript
// src/objects/Tower.ts
export class Tower extends GameObject {
  private renderer: ITowerRenderer;
  private visual: Graphics;
  private barrel: Graphics;

  constructor(type: string, x: number, y: number) {
    super();
    this.type = type;

    // Create graphics containers
    this.visual = new Graphics();
    this.barrel = new Graphics();
    this.addChild(this.visual);
    this.addChild(this.barrel);

    // Assign renderer
    this.renderer = TowerRendererFactory.create(type);
    this.updateVisual();
  }

  public updateVisual(): void {
    this.visual.clear();
    this.renderer.render(this.visual, this.barrel, this.type, this.upgradeLevel);
  }

  public showShootingEffect(): void {
    this.renderer.renderShootingEffect(this.barrel, this.type, this.upgradeLevel);
  }

  public destroy(): void {
    this.renderer.destroy();
    super.destroy();
  }
}
```

## Renderer Implementation Pattern

```typescript
// src/renderers/towers/MachineGunRenderer.ts
export class MachineGunRenderer implements ITowerRenderer {
  render(visual: Graphics, barrel: Graphics, type: string, upgradeLevel: number): void {
    const baseSize = 15 + upgradeLevel * 2;

    // Base structure
    if (upgradeLevel <= 2) {
      visual.rect(-baseSize, -5, baseSize * 2, 25).fill(0x8b7355);
    } else if (upgradeLevel <= 4) {
      visual.rect(-baseSize, -5, baseSize * 2, 25).fill(0x5a5a5a);
    } else {
      visual.rect(-baseSize, -5, baseSize * 2, 25).fill(0x4a4a4a);
    }

    // Barrel/character
    barrel.clear();
    barrel.rect(-3, -13, 6, 8).fill(0x654321);
    // ... more barrel rendering
  }

  renderShootingEffect(barrel: Graphics, type: string, upgradeLevel: number): void {
    const flash = new Graphics();
    const gunLength = 8 + upgradeLevel;
    const gunTip = -10 + gunLength;

    flash.circle(0, gunTip, 3).fill({ color: 0xffffff, alpha: 0.9 });
    barrel.addChild(flash);

    // Cleanup after delay
    EffectCleanupManager.registerTimeout(
      setTimeout(() => {
        if (!barrel.destroyed) {
          barrel.removeChild(flash);
          flash.destroy();
        }
      }, 100)
    );
  }

  destroy(): void {
    // Clean up any renderer-specific resources
  }
}
```

## Benefits

✅ **Maintainability**: Visual changes don't affect game logic  
✅ **Testability**: Test game logic without rendering  
✅ **Reusability**: Swap renderers (2D → 3D, different art styles)  
✅ **File Size**: Smaller, focused files  
✅ **Artist-Friendly**: Artists modify visuals without touching game code  
✅ **Performance**: Optimize rendering separately from logic

## Migration Checklist

When refactoring an entity to use renderers:

- [ ] Create renderer interface in `src/renderers/[entity-type]/`
- [ ] Create renderer factory
- [ ] Implement renderer for each variant
- [ ] Update entity to use renderer
- [ ] Move all visual code to renderer
- [ ] Remove visual code from entity
- [ ] Test each variant renders correctly
- [ ] Update tests to mock renderer if needed

## Common Patterns

### Passing State to Renderer

```typescript
// ✅ GOOD: Pass only what's needed
this.renderer.render(this.visual, this.barrel, this.type, this.upgradeLevel);

// ❌ BAD: Pass entire entity
this.renderer.render(this);
```

### Renderer Lifecycle

```typescript
// Entity manages renderer lifecycle
constructor() {
  this.renderer = RendererFactory.create(type);
}

destroy() {
  this.renderer.destroy(); // Clean up renderer first
  super.destroy();         // Then parent
}
```

### Visual Updates

```typescript
// Entity triggers updates, renderer handles details
public upgrade(): void {
  this.upgradeLevel++;
  this.applyUpgradeEffects(); // Game logic
  this.updateVisual();        // Trigger renderer
}
```

## See Also

- [Cleanup Patterns](../cleanup.md) - Memory management for renderers
- [Tower Development](../../features/towers.md) - Tower-specific patterns
- [Structure Guide](../structure.md) - Project organization
