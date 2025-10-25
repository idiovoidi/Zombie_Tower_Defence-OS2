# Design Document

## Overview

This design document outlines the architecture for refactoring the Tower.ts monolithic class by extracting all rendering and visual effects logic into dedicated renderer classes. The refactor follows the established pattern used in the codebase (e.g., VisualMapRenderer with sub-renderers) and separates concerns between game logic and visual representation.

The current Tower.ts file (~1470 lines) contains:
- Game logic (damage, range, fire rate, targeting)
- Visual creation methods for 7 tower types
- Idle animations for each tower type
- Shooting effects and muzzle flashes
- Selection effects
- Effect spawning (shell casings, scope glints, laser sights)
- Barrel rotation and recoil animations

This refactor will extract all visual code into `src/renderers/towers/` while maintaining the existing visual behavior.

## Architecture

### High-Level Structure

```
src/
├── objects/
│   ├── Tower.ts (slimmed down - logic only)
│   └── Tower.interface.ts (updated with renderer methods)
└── renderers/
    ├── effects/ (moved from src/effects)
    │   ├── BarrelHeatGlow.ts
    │   ├── BulletTrail.ts
    │   ├── EffectManager.ts
    │   ├── ImpactFlash.ts
    │   ├── LaserSight.ts
    │   ├── MuzzleFlashLight.ts
    │   ├── ScopeGlint.ts
    │   ├── ShellCasing.ts
    │   ├── FogRenderer.ts (already here)
    │   └── index.ts
    └── towers/
        ├── BaseTowerRenderer.ts
        ├── MachineGunTowerRenderer.ts
        ├── SniperTowerRenderer.ts
        ├── ShotgunTowerRenderer.ts
        ├── FlameTowerRenderer.ts
        ├── TeslaTowerRenderer.ts
        ├── GrenadeTowerRenderer.ts
        ├── SludgeTowerRenderer.ts
        └── index.ts
```

### Separation of Concerns

**Tower.ts (Game Logic)**
- Tower stats (damage, range, fire rate)
- Upgrade logic
- Shooting cooldown management
- Component management (Health, Transform)
- Renderer lifecycle management

**TowerRenderers (Visual Representation)**
- PixiJS Graphics creation and management
- Visual appearance for each upgrade level
- Idle animations
- Shooting effects
- Selection effects
- Barrel rotation
- Effect spawning (shell casings, glints, etc.)

## Components and Interfaces

### ITowerRenderer Interface

```typescript
interface ITowerRenderer {
  // Lifecycle
  update(deltaTime: number): void;
  destroy(): void;
  
  // Visual updates
  updateVisual(state: ITowerRenderState): void;
  updateBarrelRotation(rotation: number): void;
  
  // Effects
  showShootingEffect(): void;
  showSelectionEffect(): void;
  hideSelectionEffect(): void;
  showRange(container: Container): void;
  hideRange(): void;
  
  // State queries
  getContainer(): Container;
  getBarrel(): Graphics;
}
```

### ITowerRenderState Interface

```typescript
interface ITowerRenderState {
  type: string;
  upgradeLevel: number;
  position: { x: number; y: number };
  range: number;
  isIdle: boolean;
  timeSinceLastShot: number;
}
```

### BaseTowerRenderer Class

The base class provides common functionality shared across all tower renderers:

```typescript
abstract class BaseTowerRenderer implements ITowerRenderer {
  protected container: Container;
  protected visual: Graphics;
  protected barrel: Graphics;
  protected rangeVisualizer: TowerRangeVisualizer;
  protected upgradeLevel: number;
  protected type: string;
  
  // Idle animation state
  protected idleTime: number;
  protected idleScanDirection: number;
  protected idleScanAngle: number;
  protected currentRotation: number;
  
  // Selection effect state
  protected selectionHighlight?: Graphics;
  protected pulseInterval?: NodeJS.Timeout;
  
  constructor(type: string, x: number, y: number) {
    // Initialize container, graphics, and state
  }
  
  // Common methods
  public update(deltaTime: number): void {
    this.updateIdleAnimation(deltaTime);
    this.updateSpecialEffects(deltaTime);
  }
  
  protected addUpgradeStars(): void {
    // Render upgrade level stars
  }
  
  public showRange(container: Container): void {
    // Delegate to TowerRangeVisualizer
  }
  
  public showSelectionEffect(): void {
    // Create pulsing selection highlight
  }
  
  // Abstract methods for tower-specific behavior
  protected abstract createTowerVisual(): void;
  protected abstract createBarrelVisual(): void;
  protected abstract updateIdleAnimation(deltaTime: number): void;
  protected abstract createShootingEffect(): Graphics;
  
  // Optional hook for special effects (barrel heat, laser sight, etc.)
  protected updateSpecialEffects(deltaTime: number): void {
    // Override in derived classes if needed
  }
}
```

### Tower-Specific Renderers

Each tower type extends BaseTowerRenderer and implements its unique visual behavior:

```typescript
class MachineGunTowerRenderer extends BaseTowerRenderer {
  private barrelHeatGlow: BarrelHeatGlow;
  
  constructor(x: number, y: number) {
    super(GameConfig.TOWER_TYPES.MACHINE_GUN, x, y);
    this.barrelHeatGlow = new BarrelHeatGlow(this.barrel);
  }
  
  protected createTowerVisual(): void {
    // Machine gun base visual (barricade, sandbags, metal plates)
    // Varies by upgrade level
  }
  
  protected createBarrelVisual(): void {
    // Little man with machine gun
    // Gear improves with upgrades
  }
  
  protected updateIdleAnimation(deltaTime: number): void {
    // Scans left and right slowly
  }
  
  protected createShootingEffect(): Graphics {
    // Muzzle flash at gun tip
    // Returns Graphics object for temporary display
  }
  
  protected updateSpecialEffects(deltaTime: number): void {
    this.barrelHeatGlow.update(deltaTime);
  }
  
  public showShootingEffect(): void {
    super.showShootingEffect();
    this.barrelHeatGlow.addHeat();
    this.spawnShellCasing();
    this.spawnMuzzleFlashLight();
  }
  
  private spawnShellCasing(): void {
    // Create shell casing particle effect
  }
  
  private spawnMuzzleFlashLight(): void {
    // Create muzzle flash light effect
  }
}
```

Similar implementations for:
- **SniperTowerRenderer**: Watchtower visual, laser sight (level 3+), scope glint, bullet trail
- **ShotgunTowerRenderer**: Bunker visual, wide spread muzzle flash, pump animation
- **FlameTowerRenderer**: Fuel tank visual, flame burst effect, pilot light flicker
- **TeslaTowerRenderer**: Capacitor visual, electric discharge, spark effects
- **GrenadeTowerRenderer**: Launcher visual, launch flash, smoke puff
- **SludgeTowerRenderer**: Tank visual, toxic splash, drip animation

### Updated Tower.ts

The refactored Tower.ts delegates all rendering to the renderer:

```typescript
export class Tower extends GameObject implements ITower {
  private type: string;
  private damage: number;
  private range: number;
  private fireRate: number;
  private lastShotTime: number;
  private upgradeLevel: number;
  private renderer: ITowerRenderer;
  
  constructor(type: string, x: number, y: number) {
    super();
    this.type = type;
    this.position.set(x, y);
    
    // Initialize stats
    this.initializeStats();
    
    // Create renderer based on type
    this.renderer = this.createRenderer(type, x, y);
    this.addChild(this.renderer.getContainer());
  }
  
  private createRenderer(type: string, x: number, y: number): ITowerRenderer {
    switch (type) {
      case GameConfig.TOWER_TYPES.MACHINE_GUN:
        return new MachineGunTowerRenderer(x, y);
      case GameConfig.TOWER_TYPES.SNIPER:
        return new SniperTowerRenderer(x, y);
      // ... other cases
      default:
        throw new Error(`Unknown tower type: ${type}`);
    }
  }
  
  public update(deltaTime: number): void {
    super.update(deltaTime);
    
    // Update renderer with current state
    const renderState: ITowerRenderState = {
      type: this.type,
      upgradeLevel: this.upgradeLevel,
      position: { x: this.x, y: this.y },
      range: this.range,
      isIdle: this.isIdle(),
      timeSinceLastShot: performance.now() - this.lastShotTime
    };
    
    this.renderer.update(deltaTime);
  }
  
  public shoot(): void {
    this.lastShotTime = performance.now();
    this.renderer.showShootingEffect();
    // Game logic only - no visual code
  }
  
  public upgrade(): void {
    if (!this.canUpgrade()) return;
    
    this.upgradeLevel++;
    this.updateStatsForLevel();
    
    // Notify renderer of upgrade
    this.renderer.updateVisual({
      type: this.type,
      upgradeLevel: this.upgradeLevel,
      position: { x: this.x, y: this.y },
      range: this.range,
      isIdle: this.isIdle(),
      timeSinceLastShot: performance.now() - this.lastShotTime
    });
  }
  
  public destroy(): void {
    this.renderer.destroy();
    super.destroy();
  }
}
```

## Data Models

### TowerRenderState

Encapsulates all state needed by renderers:

```typescript
interface ITowerRenderState {
  type: string;              // Tower type identifier
  upgradeLevel: number;      // Current upgrade level (1-5)
  position: { x: number; y: number };  // World position
  range: number;             // Attack range for visualization
  isIdle: boolean;           // Whether tower is idle (for animations)
  timeSinceLastShot: number; // Milliseconds since last shot
}
```

### RendererFactory Pattern

```typescript
class TowerRendererFactory {
  static create(type: string, x: number, y: number): ITowerRenderer {
    switch (type) {
      case GameConfig.TOWER_TYPES.MACHINE_GUN:
        return new MachineGunTowerRenderer(x, y);
      case GameConfig.TOWER_TYPES.SNIPER:
        return new SniperTowerRenderer(x, y);
      case GameConfig.TOWER_TYPES.SHOTGUN:
        return new ShotgunTowerRenderer(x, y);
      case GameConfig.TOWER_TYPES.FLAME:
        return new FlameTowerRenderer(x, y);
      case GameConfig.TOWER_TYPES.TESLA:
        return new TeslaTowerRenderer(x, y);
      case GameConfig.TOWER_TYPES.GRENADE:
        return new GrenadeTowerRenderer(x, y);
      case GameConfig.TOWER_TYPES.SLUDGE:
        return new SludgeTowerRenderer(x, y);
      default:
        throw new Error(`Unknown tower type: ${type}`);
    }
  }
}
```

## Error Handling

### Renderer Creation Errors

```typescript
try {
  this.renderer = TowerRendererFactory.create(type, x, y);
} catch (error) {
  console.error(`Failed to create renderer for tower type: ${type}`, error);
  // Fallback to basic renderer or throw
  throw new Error(`Invalid tower type: ${type}`);
}
```

### Memory Leak Prevention

All renderers must implement proper cleanup:

```typescript
public destroy(): void {
  // 1. Clear timers FIRST
  if (this.pulseInterval) {
    EffectCleanupManager.clearInterval(this.pulseInterval);
  }
  
  // 2. Destroy children and clear references
  this.selectionHighlight?.destroy();
  this.selectionHighlight = undefined;
  
  this.barrel.destroy();
  this.visual.destroy();
  
  // 3. Call parent destroy LAST
  this.container.destroy();
}
```

### Invalid State Handling

```typescript
public updateVisual(state: ITowerRenderState): void {
  if (state.upgradeLevel < 1 || state.upgradeLevel > 5) {
    console.warn(`Invalid upgrade level: ${state.upgradeLevel}, clamping to valid range`);
    state.upgradeLevel = Math.max(1, Math.min(5, state.upgradeLevel));
  }
  
  this.upgradeLevel = state.upgradeLevel;
  this.recreateVisuals();
}
```

## Testing Strategy

### Unit Tests

**BaseTowerRenderer Tests**
- Lifecycle: constructor, update, destroy
- Common methods: addUpgradeStars, showRange, showSelectionEffect
- Memory management: verify cleanup in destroy()

**Tower-Specific Renderer Tests**
- Visual creation: verify Graphics objects created correctly
- Idle animations: verify animation state updates
- Shooting effects: verify effect Graphics created and cleaned up
- Upgrade progression: verify visuals change with upgrade level

**Tower.ts Integration Tests**
- Renderer creation: verify correct renderer instantiated for each type
- State synchronization: verify renderer receives correct state updates
- Lifecycle: verify renderer destroyed when tower destroyed

### Visual Regression Tests

Since this refactor should not change visual behavior:

1. **Screenshot Comparison**: Capture screenshots of each tower type at each upgrade level before and after refactor
2. **Animation Verification**: Record idle animations and shooting effects, compare frame-by-frame
3. **Effect Verification**: Verify all effects (shell casings, laser sights, etc.) still appear correctly

### Integration Tests

**TowerCombatManager Integration**
- Verify shooting effects triggered correctly
- Verify barrel rotation updates correctly
- Verify target tracking works with new renderer architecture

**TowerManager Integration**
- Verify tower placement creates correct renderer
- Verify tower upgrades update renderer correctly
- Verify tower removal cleans up renderer

### Performance Tests

- **Memory Usage**: Monitor memory before/after refactor, verify no leaks
- **Frame Rate**: Verify FPS remains stable with multiple towers
- **Renderer Creation**: Verify renderer instantiation time is acceptable

## Migration Strategy

### Phase 1: Move Effects Folder
1. Move `src/effects/` to `src/renderers/effects/`
2. Update all imports across the codebase
3. Update path aliases in tsconfig.json if needed
4. Run tests to verify nothing broke

### Phase 2: Create Infrastructure
1. Create ITowerRenderer and ITowerRenderState interfaces
2. Create BaseTowerRenderer with common functionality
3. Create TowerRendererFactory

### Phase 3: Implement Renderers (One at a Time)
1. Start with MachineGunTowerRenderer (simplest)
2. Extract visual code from Tower.ts
3. Test thoroughly before moving to next type
4. Repeat for each tower type

### Phase 4: Update Tower.ts
1. Add renderer property and factory call
2. Replace visual method calls with renderer calls
3. Remove all visual code from Tower.ts
4. Update tests

### Phase 5: Cleanup
1. Remove unused imports from Tower.ts
2. Update documentation
3. Run full test suite
4. Visual regression testing

## Dependencies

- **PixiJS**: Graphics, Container classes for rendering
- **EffectCleanupManager**: Timer management for animations
- **ResourceCleanupManager**: Persistent effect registration
- **TowerRangeVisualizer**: Range indicator visualization
- **BarrelHeatGlow**: Machine gun heat effect (moved to src/renderers/effects)
- **LaserSight, BulletTrail, etc.**: Tower effects (moved to src/renderers/effects)
- **GameConfig**: Tower type constants

## Effects Folder Reorganization

The `src/effects/` folder will be moved to `src/renderers/effects/` to better organize rendering-related code. This makes sense because:

1. **Logical Grouping**: Effects are visual/rendering concerns, not game logic
2. **Consistency**: Aligns with the existing `src/renderers/effects/FogRenderer.ts` pattern
3. **Clearer Separation**: Keeps all rendering code under the `renderers/` directory
4. **Import Paths**: Makes it clear that effects are rendering utilities

### Files to Move

All files from `src/effects/` → `src/renderers/effects/`:
- BarrelHeatGlow.ts
- BulletTrail.ts
- EffectManager.ts
- ImpactFlash.ts
- LaserSight.ts
- MuzzleFlashLight.ts
- ScopeGlint.ts
- ShellCasing.ts
- index.ts
- README.md

### Import Updates Required

After moving, update imports in:
- Tower.ts (currently imports from `../effects/`)
- Tower-specific classes (FlameTower.ts, etc.)
- TowerCombatManager.ts
- Any other files importing from `src/effects/`

New import pattern:
```typescript
// Old
import { BarrelHeatGlow } from '../effects/BarrelHeatGlow';

// New
import { BarrelHeatGlow } from '../renderers/effects/BarrelHeatGlow';
```

## Performance Considerations

### Renderer Instantiation
- Renderers created once per tower, not per frame
- Factory pattern allows for future optimizations (object pooling)

### Update Loop
- Renderer update() called once per frame per tower
- Idle animations only update when tower is idle
- Special effects (heat glow, laser sight) only update when active

### Memory Management
- All Graphics objects properly destroyed
- Timers cleared using EffectCleanupManager
- No circular references between Tower and Renderer

### Visual Complexity
- Upgrade level visuals progressively more detailed
- Effect spawning throttled by fire rate
- Temporary effects cleaned up after short duration

## Future Enhancements

### Renderer Swapping
- Allow runtime renderer swapping for visual themes
- Support multiple visual styles per tower type

### Effect Library
- Extract common effects (muzzle flash, shell casing) into reusable library
- Share effect code across tower types

### Animation System
- Implement keyframe animation system for complex idle animations
- Support animation blending and transitions

### Shader Effects
- Add shader-based effects for advanced visuals
- Integrate with retro-shaders spec if applicable
