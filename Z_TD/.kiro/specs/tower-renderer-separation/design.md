# Design Document: Tower Renderer Separation

## Overview

This design separates tower rendering logic from game logic by introducing a renderer layer. The Tower class will delegate all visual representation to dedicated renderer classes, reducing its size from 1400+ lines to ~600 lines and improving maintainability.

## Architecture

### Component Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                         Tower.ts                             │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ Game Logic Layer                                        │ │
│  │ - Stats (damage, range, fireRate)                      │ │
│  │ - Behavior (shoot, upgrade, rotate)                    │ │
│  │ - Components (Health, Transform)                       │ │
│  └────────────────────────────────────────────────────────┘ │
│                            │                                 │
│                            │ delegates to                    │
│                            ▼                                 │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ Renderer Reference (ITowerRenderer)                     │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                             │
                             │ implements
                             ▼
┌─────────────────────────────────────────────────────────────┐
│                  TowerRendererFactory                        │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ create(type: string): ITowerRenderer                    │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                             │
                             │ creates
                             ▼
┌─────────────────────────────────────────────────────────────┐
│                    Renderer Classes                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ MachineGun   │  │   Sniper     │  │   Shotgun    │      │
│  │  Renderer    │  │   Renderer   │  │   Renderer   │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │    Flame     │  │    Tesla     │  │   Grenade    │      │
│  │  Renderer    │  │   Renderer   │  │   Renderer   │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│  ┌──────────────┐                                           │
│  │    Sludge    │                                           │
│  │  Renderer    │                                           │
│  └──────────────┘                                           │
└─────────────────────────────────────────────────────────────┘
```

## Components and Interfaces

### ITowerRenderer Interface

```typescript
export interface ITowerRenderer {
  /**
   * Render the tower's visual representation
   * @param visual - The base Graphics container
   * @param barrel - The rotatable barrel/character Graphics container
   * @param type - The tower type
   * @param upgradeLevel - Current upgrade level (1-5)
   */
  render(visual: Graphics, barrel: Graphics, type: string, upgradeLevel: number): void;

  /**
   * Render shooting effect (muzzle flash, recoil)
   * @param barrel - The barrel Graphics container
   * @param type - The tower type
   * @param upgradeLevel - Current upgrade level (1-5)
   */
  renderShootingEffect(barrel: Graphics, type: string, upgradeLevel: number): void;

  /**
   * Clean up renderer resources
   */
  destroy(): void;
}
```

### TowerRendererFactory

```typescript
export class TowerRendererFactory {
  /**
   * Create a renderer for the specified tower type
   * @param type - Tower type from GameConfig.TOWER_TYPES
   * @returns Appropriate renderer instance
   */
  static create(type: string): ITowerRenderer {
    switch (type) {
      case GameConfig.TOWER_TYPES.MACHINE_GUN:
        return new MachineGunRenderer();
      case GameConfig.TOWER_TYPES.SNIPER:
        return new SniperRenderer();
      case GameConfig.TOWER_TYPES.SHOTGUN:
        return new ShotgunRenderer();
      case GameConfig.TOWER_TYPES.FLAME:
        return new FlameRenderer();
      case GameConfig.TOWER_TYPES.TESLA:
        return new TeslaRenderer();
      case GameConfig.TOWER_TYPES.GRENADE:
        return new GrenadeRenderer();
      case GameConfig.TOWER_TYPES.SLUDGE:
        return new SludgeRenderer();
      default:
        console.warn(`Unknown tower type: ${type}, using default renderer`);
        return new DefaultTowerRenderer();
    }
  }
}
```

### Base Renderer Class (Optional)

```typescript
export abstract class BaseTowerRenderer implements ITowerRenderer {
  abstract render(visual: Graphics, barrel: Graphics, type: string, upgradeLevel: number): void;

  abstract renderShootingEffect(barrel: Graphics, type: string, upgradeLevel: number): void;

  /**
   * Helper method to add upgrade stars
   */
  protected addUpgradeStars(visual: Graphics, upgradeLevel: number): void {
    const starSize = 3;
    const starSpacing = 8;
    const startX = -(upgradeLevel * starSpacing) / 2 + starSpacing / 2;

    for (let i = 0; i < upgradeLevel; i++) {
      const x = startX + i * starSpacing;
      const y = -30;

      // Draw star
      visual.star(x, y, 5, starSize, starSize / 2).fill({
        color: 0xffd700,
        alpha: 0.9,
      });
      visual.stroke({ width: 1, color: 0xffaa00 });
    }
  }

  /**
   * Default destroy implementation
   */
  destroy(): void {
    // Override if renderer has specific cleanup needs
  }
}
```

### Example Renderer Implementation

```typescript
export class MachineGunRenderer extends BaseTowerRenderer {
  render(visual: Graphics, barrel: Graphics, type: string, upgradeLevel: number): void {
    const baseSize = 15 + upgradeLevel * 2;

    // Render base structure based on upgrade level
    if (upgradeLevel <= 2) {
      this.renderWoodenBase(visual, baseSize);
    } else if (upgradeLevel <= 4) {
      this.renderReinforcedBase(visual, baseSize);
    } else {
      this.renderMilitaryBase(visual, baseSize);
    }

    // Add upgrade stars
    this.addUpgradeStars(visual, upgradeLevel);

    // Render barrel/character
    this.renderBarrel(barrel, upgradeLevel);
  }

  private renderWoodenBase(visual: Graphics, baseSize: number): void {
    // Wooden barricade with sandbags
    visual.rect(-baseSize, -5, baseSize * 2, 25).fill(0x8b7355);
    visual.stroke({ width: 2, color: 0x654321 });
    // ... rest of wooden base rendering
  }

  private renderReinforcedBase(visual: Graphics, baseSize: number): void {
    // Reinforced position with metal plates
    visual.rect(-baseSize, -5, baseSize * 2, 25).fill(0x5a5a5a);
    visual.stroke({ width: 2, color: 0x3a3a3a });
    // ... rest of reinforced base rendering
  }

  private renderMilitaryBase(visual: Graphics, baseSize: number): void {
    // Military fortification
    visual.rect(-baseSize, -5, baseSize * 2, 25).fill(0x4a4a4a);
    visual.stroke({ width: 3, color: 0x2a2a2a });
    // ... rest of military base rendering
  }

  private renderBarrel(barrel: Graphics, upgradeLevel: number): void {
    barrel.clear();

    // Body color improves with upgrades
    let bodyColor = 0x654321; // Brown civilian
    if (upgradeLevel >= 3) bodyColor = 0x4a4a4a; // Gray tactical
    if (upgradeLevel >= 5) bodyColor = 0x2a2a2a; // Black military

    // Render character body
    barrel.rect(-3, -13, 6, 8).fill(bodyColor);
    // ... rest of barrel rendering
  }

  renderShootingEffect(barrel: Graphics, type: string, upgradeLevel: number): void {
    const flash = new Graphics();
    const gunLength = 8 + upgradeLevel;
    const gunTip = -10 + gunLength;

    // Enhanced muzzle flash
    flash.circle(0, gunTip, 3).fill({ color: 0xffffff, alpha: 0.9 });
    flash.circle(0, gunTip, 5).fill({ color: 0xffcc00, alpha: 0.6 });
    flash.circle(0, gunTip, 7).fill({ color: 0xff9933, alpha: 0.3 });

    barrel.addChild(flash);

    // Apply recoil animation
    const originalY = barrel.y;
    barrel.y = 2;

    // Cleanup after delay
    EffectCleanupManager.registerTimeout(
      setTimeout(() => {
        if (barrel && !barrel.destroyed) {
          barrel.removeChild(flash);
          flash.destroy();
          barrel.y = originalY;
        }
      }, 100)
    );
  }
}
```

### Modified Tower Class

```typescript
export class Tower extends GameObject implements ITower, TowerEffects {
  // Game logic properties
  private type: string;
  private damage: number = 0;
  private range: number = 0;
  private fireRate: number = 0;
  private lastShotTime: number = 0;
  private upgradeLevel: number = 1;
  private maxUpgradeLevel: number = 5;

  // Visual containers (managed by renderer)
  private visual: Graphics;
  private barrel: Graphics;

  // Renderer reference
  private renderer: ITowerRenderer;

  // Other properties...
  private currentRotation: number = 0;
  private idleTime: number = 0;
  // ...

  constructor(type: string, x: number, y: number) {
    super();
    this.type = type;
    this.position.set(x, y);

    // Add transform component
    const transform = new TransformComponent(x, y);
    this.addComponent(transform);

    // Create visual containers
    this.visual = new Graphics();
    this.barrel = new Graphics();
    this.addChild(this.visual);
    this.addChild(this.barrel);

    // Assign renderer via factory
    this.renderer = TowerRendererFactory.create(type);

    // Initial render
    this.updateVisual();

    // Initialize tower stats
    this.initializeStats();
  }

  public updateVisual(): void {
    this.visual.clear();
    this.renderer.render(this.visual, this.barrel, this.type, this.upgradeLevel);
  }

  public showShootingEffect(): void {
    this.renderer.renderShootingEffect(this.barrel, this.type, this.upgradeLevel);
  }

  public destroy(): void {
    // Clean up renderer first
    this.renderer.destroy();

    // Then parent cleanup
    super.destroy();
  }

  // All game logic methods remain unchanged
  public shoot(): void {
    /* ... */
  }
  public upgrade(): void {
    /* ... */
  }
  public rotateTowards(x: number, y: number): void {
    /* ... */
  }
  // ...
}
```

## Data Models

### Renderer State

Renderers are stateless - they receive all necessary information through method parameters:

- `visual`: Graphics container for base structure
- `barrel`: Graphics container for rotatable weapon/character
- `type`: Tower type identifier
- `upgradeLevel`: Current upgrade level (1-5)

### Tower State (Unchanged)

Tower continues to manage:

- Game stats (damage, range, fireRate)
- Upgrade level
- Components (Health, Transform)
- Visual containers (Graphics objects)
- Renderer reference

## Error Handling

### Unknown Tower Type

```typescript
// In TowerRendererFactory
static create(type: string): ITowerRenderer {
  switch (type) {
    // ... cases
    default:
      console.warn(`Unknown tower type: ${type}, using default renderer`);
      return new DefaultTowerRenderer();
  }
}
```

### Renderer Cleanup Failure

```typescript
// In Tower.destroy()
public destroy(): void {
  try {
    this.renderer.destroy();
  } catch (error) {
    console.error('Error destroying tower renderer:', error);
  }
  super.destroy();
}
```

### Graphics Object Destroyed

```typescript
// In renderer shooting effect
EffectCleanupManager.registerTimeout(
  setTimeout(() => {
    if (barrel && !barrel.destroyed) {
      barrel.removeChild(flash);
      flash.destroy();
    }
  }, 100)
);
```

## Testing Strategy

### Unit Tests

1. **Renderer Interface Tests**
   - Test each renderer implements ITowerRenderer
   - Test render method creates expected Graphics
   - Test renderShootingEffect creates temporary effects
   - Test destroy cleans up resources

2. **Factory Tests**
   - Test factory creates correct renderer for each type
   - Test factory returns default renderer for unknown types
   - Test factory instances are independent

3. **Tower Integration Tests**
   - Test Tower constructor assigns renderer
   - Test updateVisual calls renderer.render
   - Test showShootingEffect calls renderer.renderShootingEffect
   - Test destroy calls renderer.destroy

### Visual Regression Tests

1. **Before/After Comparison**
   - Capture screenshots of each tower type at each upgrade level
   - Compare before and after refactoring
   - Ensure pixel-perfect match (or document intentional changes)

2. **Animation Tests**
   - Test idle animations still work
   - Test shooting effects still work
   - Test barrel rotation still works
   - Test upgrade visual progression

### Integration Tests

1. **Gameplay Tests**
   - Test tower placement works
   - Test tower shooting works
   - Test tower upgrades work
   - Test tower destruction works
   - Test tower targeting works

## Migration Plan

### Phase 1: Create Renderer Infrastructure

1. Create `src/renderers/towers/` directory
2. Create `ITowerRenderer` interface
3. Create `TowerRendererFactory`
4. Create `BaseTowerRenderer` (optional)
5. Create `DefaultTowerRenderer`

### Phase 2: Implement Renderers (One at a Time)

1. Create `MachineGunRenderer`
   - Extract `createMachineGunVisual()` code
   - Extract machine gun shooting effect code
   - Test rendering matches original
2. Repeat for each tower type:
   - SniperRenderer
   - ShotgunRenderer
   - FlameRenderer
   - TeslaRenderer
   - GrenadeRenderer
   - SludgeRenderer

### Phase 3: Refactor Tower Class

1. Add renderer property to Tower
2. Update constructor to use factory
3. Replace `updateVisual()` implementation
4. Replace `showShootingEffect()` implementation
5. Update `destroy()` to clean up renderer
6. Remove all `create*Visual()` methods
7. Remove `addUpgradeStars()` method

### Phase 4: Testing and Validation

1. Run unit tests
2. Run visual regression tests
3. Run integration tests
4. Manual gameplay testing
5. Performance testing

### Phase 5: Cleanup

1. Remove commented-out code
2. Update documentation
3. Update steering rules
4. Archive old implementation (if needed)

## Performance Considerations

### Memory Impact

- **Before**: Visual code embedded in Tower class
- **After**: Separate renderer instances per tower
- **Impact**: Minimal (~1KB per tower for renderer instance)

### Rendering Performance

- **No change**: Same Graphics operations, just organized differently
- **Potential improvement**: Could optimize renderers independently

### Instantiation Cost

- **Added**: Factory method call + renderer instantiation
- **Impact**: Negligible (happens once per tower placement)

## Rollback Plan

If issues arise during refactoring:

1. **Git Revert**: Revert to pre-refactoring commit
2. **Feature Flag**: Add flag to toggle between old/new rendering
3. **Gradual Migration**: Keep old methods, add new ones, switch gradually

## Future Enhancements

Once renderer separation is complete:

1. **Sprite-Based Rendering**: Replace Graphics with Sprites
2. **Animation System**: Add sprite sheet animations
3. **Theme System**: Multiple visual themes (medieval, sci-fi, etc.)
4. **Level of Detail**: Simplified rendering for distant towers
5. **Particle Effects**: Enhanced visual effects in renderers
