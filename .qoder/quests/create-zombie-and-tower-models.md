# Basic Zombie and Tower Turret Models Design

## Overview

This design document outlines the implementation of basic visual models for zombies and tower turrets in the Zombie Tower Defense game. These models will be created using code-based rendering with Pixi.js v8 to provide early-stage visualization while higher-quality assets are being developed.

The implementation will enhance the existing base classes (`Zombie` and `Tower`) and maintain compatibility with the current game architecture while adding visual enhancements for better gameplay experience. The visual models will use the latest Pixi.js v8 APIs to ensure compatibility with the current version (8.8.1) used in the project.

## Architecture

### Component Structure

The visual models will follow the existing entity-component architecture:
- Base classes (`Zombie`, `Tower`) already contain visual elements
- Each specific zombie/tower type extends the base class
- Visual rendering is handled through Pixi.js Graphics objects
- Visual elements are attached to the game object's container

### Directory Structure

The implementation will work within the existing directory structure without requiring new files, as the visual enhancements will be added to the existing base classes:

```
src/
├── objects/
│   ├── towers/
│   │   └── [existing tower types: MachineGunTower.ts, SniperTower.ts, etc.]
│   ├── zombies/
│   │   └── [existing zombie types: BasicZombie.ts, FastZombie.ts, etc.]
│   ├── Tower.ts (existing, to be enhanced)
│   └── Zombie.ts (existing, to be enhanced)
└── renderers/
    └── VisualMapRenderer.ts (existing)
```

## Visual Model Design

### Tower Models

Each tower type will have a distinct visual representation to differentiate functionality. The visuals will use Pixi.js v8 Graphics API with proper fill() and stroke() methods:

1. **Machine Gun Tower**
   - Shape: Square base with circular turret
   - Color: Blue (0x0000FF) with white (0xFFFFFF) accents
   - Size: 40px base, 20px turret
   - Implementation:
     ```typescript
     private createMachineGunVisual(): void {
       // Clear any existing graphics
       this.visual.clear();
       
       // Draw square base
       this.visual.rect(-20, -20, 40, 40).fill(0x0000FF);
       this.visual.stroke({ width: 2, color: 0xFFFFFF });
       
       // Draw circular turret
       this.visual.circle(0, 0, 10).fill(0xFFFFFF);
       this.visual.stroke({ width: 1, color: 0x0000FF });
     }
     ```

2. **Sniper Tower**
   - Shape: Triangular base with long barrel
   - Color: Gray (0x808080) with black (0x000000) accents
   - Size: 35px base, 30px barrel
   - Implementation:
     ```typescript
     private createSniperVisual(): void {
       // Clear any existing graphics
       this.visual.clear();
       
       // Draw triangular base
       this.visual.poly([0, -15, -15, 15, 15, 15]).fill(0x808080);
       this.visual.stroke({ width: 2, color: 0x000000 });
       
       // Draw long barrel
       this.visual.rect(-1.5, -30, 3, 30).fill(0x000000);
     }
     ```

3. **Shotgun Tower**
   - Shape: Circular base with wide muzzle
   - Color: Brown (0x8B4513) with dark brown (0x5C3317) accents
   - Size: 35px diameter

4. **Flame Tower**
   - Shape: Hexagonal base with flame emitter
   - Color: Red (0xFF0000) with orange (0xFFA500) accents
   - Size: 30px across flats

5. **Tesla Tower**
   - Shape: Circular base with electrical orb
   - Color: Purple (0x800080) with light blue (0xADD8E6) accents
   - Size: 35px diameter

### Zombie Models

Each zombie type will have a distinct visual representation to indicate threat level. The visuals will use Pixi.js v8 Graphics API:

1. **Basic Zombie**
   - Shape: Simple circle
   - Color: Green (0x00FF00)
   - Size: 20px diameter
   - Implementation:
     ```typescript
     private createBasicZombieVisual(): void {
       // Clear any existing graphics
       this.visual.clear();
       
       // Draw circular body
       this.visual.circle(0, 0, 10).fill(0x00FF00);
       this.visual.stroke({ width: 1, color: 0x000000 });
     }
     ```

2. **Fast Zombie**
   - Shape: Elongated oval
   - Color: Yellow-green (0x9ACD32)
   - Size: 18px x 25px
   - Implementation:
     ```typescript
     private createFastZombieVisual(): void {
       // Clear any existing graphics
       this.visual.clear();
       
       // Draw oval body
       this.visual.roundRect(-9, -12.5, 18, 25, 9).fill(0x9ACD32);
       this.visual.stroke({ width: 1, color: 0x000000 });
     }
     ```

3. **Tank Zombie**
   - Shape: Square with rounded corners
   - Color: Dark green (0x006400)
   - Size: 30px x 30px

4. **Armored Zombie**
   - Shape: Circle with rectangular armor plate
   - Color: Gray-green (0x556B2F)
   - Size: 22px diameter with 25px x 15px armor

5. **Swarm Zombie**
   - Shape: Small circle
   - Color: Light green (0x90EE90)
   - Size: 12px diameter

6. **Stealth Zombie**
   - Shape: Circle with transparency
   - Color: Dark gray (0x2F4F4F) with alpha 0.6
   - Size: 20px diameter

7. **Mechanical Zombie**
   - Shape: Gear-like shape
   - Color: Metallic gray (0x808080)
   - Size: 25px diameter

## Implementation Details

### Base Tower Visual Enhancements

The existing `Tower` base class will be enhanced with:

```typescript
// In Tower.ts
// Existing visual property
private visual: Graphics;

// Enhanced visual creation in constructor
this.visual = new Graphics();
this.addChild(this.visual);
this.createVisual(); // Create initial visual

// Method to create tower visuals based on type
private createVisual(): void {
  this.visual.clear();
  
  switch(this.type) {
    case GameConfig.TOWER_TYPES.MACHINE_GUN:
      this.createMachineGunVisual();
      break;
    case GameConfig.TOWER_TYPES.SNIPER:
      this.createSniperVisual();
      break;
    case GameConfig.TOWER_TYPES.SHOTGUN:
      this.createShotgunVisual();
      break;
    case GameConfig.TOWER_TYPES.FLAME:
      this.createFlameVisual();
      break;
    case GameConfig.TOWER_TYPES.TESLA:
      this.createTeslaVisual();
      break;
  }
}
```

### Base Zombie Visual Enhancements

The existing `Zombie` base class will be enhanced with:

```typescript
// In Zombie.ts
// Existing visual property
private visual: Graphics;

// Enhanced visual creation in constructor
this.visual = new Graphics();
this.addChild(this.visual);
this.createVisual(); // Create initial visual

// Method to create zombie visuals based on type
private createVisual(): void {
  this.visual.clear();
  
  switch(this.type) {
    case GameConfig.ZOMBIE_TYPES.BASIC:
      this.createBasicZombieVisual();
      break;
    case GameConfig.ZOMBIE_TYPES.FAST:
      this.createFastZombieVisual();
      break;
    case GameConfig.ZOMBIE_TYPES.TANK:
      this.createTankZombieVisual();
      break;
    case GameConfig.ZOMBIE_TYPES.ARMORED:
      this.createArmoredZombieVisual();
      break;
    case GameConfig.ZOMBIE_TYPES.SWARM:
      this.createSwarmZombieVisual();
      break;
    case GameConfig.ZOMBIE_TYPES.STEALTH:
      this.createStealthZombieVisual();
      break;
    case GameConfig.ZOMBIE_TYPES.MECHANICAL:
      this.createMechanicalZombieVisual();
      break;
  }
}
```

## Visual Effects

### Tower Shooting Effects

When towers shoot, they will display visual effects using Pixi.js v8 Graphics API:

1. **Muzzle Flash**
   - Brief bright flash at the firing point
   - Color matches tower type
   - Duration: 100ms
   - Implementation:
     ```typescript
     public showShootingEffect(): void {
       // Store original color
       const originalColor = this.visual.tint;
       
       // Apply flash effect
       this.visual.tint = 0xFFFFFF; // White flash
       
       // Reset after delay
       setTimeout(() => {
         this.visual.tint = originalColor;
       }, 100);
     }
     ```

2. **Recoil Animation**
   - Short backward movement of the turret
   - Returns to original position
   - Implementation:
     ```typescript
     public showRecoilEffect(): void {
       // Store original position
       const originalX = this.visual.x;
       
       // Move backward
       this.visual.x = originalX - 5;
       
       // Return to original position with easing
       setTimeout(() => {
         this.visual.x = originalX;
       }, 50);
     }
     ```

### Zombie Damage Effects

When zombies take damage:

1. **Flash Effect**
   - Brief red flash over the zombie
   - Duration: 150ms
   - Implementation:
     ```typescript
     public showDamageEffect(): void {
       // Store original color
       const originalColor = this.visual.tint;
       
       // Apply flash effect
       this.visual.tint = 0xFF0000; // Red flash
       
       // Reset after delay
       setTimeout(() => {
         this.visual.tint = originalColor;
       }, 150);
     }
     ```

2. **Health Bar**
   - Displayed when health is below 100%
   - Red background with green foreground that decreases with damage
   - Position: Above the zombie
   - Implementation:
     ```typescript
     private updateHealthBar(): void {
       if (!this.healthBar) return;
       
       const healthComponent = this.getComponent<HealthComponent>('Health');
       if (healthComponent) {
         const healthPercentage = healthComponent.getHealthPercentage();
         
         // Show health bar when damaged
         this.healthBar.visible = healthPercentage < 100;
         
         // Update health bar fill
         if (this.healthBar.children.length >= 2) {
           const fg = this.healthBar.children[1] as Graphics;
           fg.width = 30 * (healthPercentage / 100);
         }
       }
     }
     ```

### Tower Selection Effects

When a tower is selected:

1. **Highlight**
   - Pulsing glow around the tower
   - Range visualization circle (already implemented in TowerRangeVisualizer)

## Data Models

### Visual Properties

Tower and zombie models will use visual properties defined as constants or in the game configuration:

```typescript
// In GameConfig or as constants
const TOWER_VISUALS = {
  MACHINE_GUN: {
    baseShape: 'square',
    baseColor: 0x0000FF,
    turretShape: 'circle',
    turretColor: 0xFFFFFF,
    size: { width: 40, height: 40 }
  },
  // ... other tower types
};

const ZOMBIE_VISUALS = {
  BASIC: {
    bodyShape: 'circle',
    bodyColor: 0x00FF00,
    size: { width: 20, height: 20 },
    transparency: 1
  },
  // ... other zombie types
};
```

## Business Logic

### Visual Update Logic

1. **Initialization**
   - Visuals are created when the object is instantiated
   - Visual properties are determined by object type

2. **State Changes**
   - Visuals update when the object state changes (health, shooting, etc.)
   - Animations are triggered for specific events

3. **Destruction**
   - Visuals are properly destroyed when the object is removed

### Performance Considerations

1. **Efficient Graphics Usage**
   - Graphics objects are reused rather than recreated
   - Clear and redraw instead of creating new objects when possible

2. **Pixi.js v8 Best Practices**
   - Use fill() and stroke() methods instead of deprecated beginFill/endFill
   - Properly destroy visual elements to prevent memory leaks

## API Reference

### Tower Visual Methods

| Method | Description | Parameters | Return |
|--------|-------------|------------|--------|
| `createVisual()` | Creates the tower's visual representation | None | void |
| `showShootingEffect()` | Displays shooting visual effects | None | void |
| `showDamageEffect()` | Displays damage visual effects | None | void |
| `showSelectionEffect()` | Displays selection visual effects | None | void |
| `create[Type]Visual()` | Creates specific visual for tower type | None | void |

### Zombie Visual Methods

| Method | Description | Parameters | Return |
|--------|-------------|------------|--------|
| `createVisual()` | Creates the zombie's visual representation | None | void |
| `showDamageEffect()` | Displays damage visual effects | damage: number | void |
| `showDeathEffect()` | Displays death visual effects | None | void |
| `create[Type]Visual()` | Creates specific visual for zombie type | None | void |

## Testing

### Unit Tests

1. **Visual Creation Tests**
   - Verify that visual elements are created for each tower type
   - Verify that visual elements are created for each zombie type
   - Check that visual properties match design specifications

2. **Visual Update Tests**
   - Test that visuals update correctly when state changes
   - Verify that animations trigger correctly
   - Check that effects are properly cleaned up

3. **Pixi.js API Compliance Tests**
   - Verify correct usage of Pixi.js v8 Graphics API
   - Check that deprecated methods are not used
   - Ensure proper resource cleanup

### Integration Tests

1. **Game Loop Integration**
   - Verify that visuals update correctly in the game loop
   - Check that animations are smooth and consistent
   - Test that visual effects don't impact game performance

2. **Interaction Tests**
   - Test tower selection and highlighting
   - Verify zombie damage and death effects
   - Check that visual feedback is clear and responsive

## Conclusion

This design provides a comprehensive approach to implementing basic visual models for zombies and tower turrets using code-based rendering with Pixi.js v8. The implementation enhances the existing base classes without requiring structural changes to the codebase, maintaining compatibility with current game systems while providing clear visual differentiation between different tower and zombie types.

The design follows Pixi.js v8 best practices, uses efficient graphics rendering techniques, and provides a foundation that can be easily extended or replaced with higher-quality assets in the future. The visual effects system adds polish to the gameplay experience while maintaining good performance through efficient resource management.