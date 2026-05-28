---
inclusion: fileMatch
fileMatchPattern: ['**/renderers/**/*.ts', '**/objects/Tower.ts', '**/objects/Zombie.ts']
---

# Renderer Separation Pattern

Game logic lives in `src/objects/`. Visual logic lives in `src/renderers/`. Never mix them.

## Rules

**Entities (Tower, Zombie)** — DO: manage state, call renderer methods. DON'T: create Graphics, define colors/sizes, handle visual effects.

**Renderers** — DO: implement `IRenderer`, manage Graphics lifecycle, handle effects, call `destroy()`. DON'T: modify game state or make gameplay decisions.

## Pattern

```typescript
// Entity owns renderer, passes only what's needed
class Tower extends GameObject {
  private renderer = TowerRendererFactory.create(type);

  updateVisual(): void {
    this.renderer.render(this.visual, this.barrel, this.type, this.upgradeLevel);
  }
  destroy(): void {
    this.renderer.destroy(); // renderer first
    super.destroy();         // parent last
  }
}

// Renderer implements interface
class MachineGunRenderer implements ITowerRenderer {
  render(visual: Graphics, barrel: Container, type: string, upgradeLevel: number): void { ... }
  destroy(): void { ... }
}
```

## File Structure
```
src/renderers/
├── towers/   BaseTowerRenderer.ts, [Type]Renderer.ts, TowerRendererFactory.ts
└── zombies/  BaseZombieRenderer.ts, [Type]ZombieRenderer.ts, ZombieRendererFactory.ts
```

Base classes (`BaseTowerRenderer`, `BaseZombieRenderer`) provide shared shooting effects, death animations, and damage effects. Subclasses override `render()` and type-specific config.
