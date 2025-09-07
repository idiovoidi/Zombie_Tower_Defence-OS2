# Basic Zombie and Tower Turret Models Design

## Overview

This design document outlines the implementation of basic visual models for zombies and tower turrets in the Zombie Tower Defense game. These models will be created using code-based rendering with Pixi.js to provide early-stage visualization while higher-quality assets are being developed.

The implementation will extend the existing base classes (`Zombie` and `Tower`) and maintain compatibility with the current game architecture while adding visual enhancements for better gameplay experience.

## Architecture

### Component Structure

The visual models will follow the existing entity-component architecture:
- Base classes (`Zombie`, `Tower`) already contain visual elements
- Each specific zombie/tower type extends the base class
- Visual rendering is handled through Pixi.js Graphics objects
- Visual elements are attached to the game object's container

### Directory Structure

```
src/
├── objects/
│   ├── towers/
│   │   ├── BasicTowerModel.ts
│   │   └── [existing tower types]
│   ├── zombies/
│   │   ├── BasicZombieModel.ts
│   │   └── [existing zombie types]
│   ├── Tower.ts (existing)
│   └── Zombie.ts (existing)
└── renderers/
    └── VisualMapRenderer.ts (existing)
```

## Visual Model Design

### Tower Models

Each tower type will have a distinct visual representation to differentiate functionality:

1. **Machine Gun Tower**
   - Shape: Square base with circular turret
   - Color: Blue with white accents
   - Size: 40px base, 20px turret

2. **Sniper Tower**
   - Shape: Triangular base with long barrel
   - Color: Gray with black accents
   - Size: 35px base, 30px barrel

3. **Shotgun Tower**
   - Shape: Circular base with wide muzzle
   - Color: Brown with dark brown accents
   - Size: 35px diameter

4. **Flame Tower**
   - Shape: Hexagonal base with flame emitter
   - Color: Red with orange accents
   - Size: 30px across flats

5. **Tesla Tower**
   - Shape: Circular base with electrical orb
   - Color: Purple with light blue accents
   - Size: 35px diameter

### Zombie Models

Each zombie type will have a distinct visual representation to indicate threat level:

1. **Basic Zombie**
   - Shape: Simple circle
   - Color: Green
   - Size: 20px diameter

2. **Fast Zombie**
   - Shape: Elongated oval
   - Color: Yellow-green
   - Size: 18px x 25px

3. **Tank Zombie**
   - Shape: Square with rounded corners
   - Color: Dark green
   - Size: 30px x 30px

4. **Armored Zombie**
   - Shape: Circle with rectangular armor plate
   - Color: Gray-green
   - Size: 22px diameter with 25px x 15px armor

5. **Swarm Zombie**
   - Shape: Small circle
   - Color: Light green
   - Size: 12px diameter

6. **Stealth Zombie**
   - Shape: Circle with transparency
   - Color: Dark gray with low alpha
   - Size: 20px diameter

7. **Mechanical Zombie**
   - Shape: Gear-like shape
   - Color: Metallic gray
   - Size: 25px diameter

## Implementation Details

### Base Tower Visual Enhancements

The existing `Tower` base class will be enhanced with:

```typescript
// In Tower.ts
private visual: Graphics;
private visualContainer: Container;

// Create visual representation in constructor
this.visualContainer = new Container();
this.visual = new Graphics();
this.visualContainer.addChild(this.visual);
this.addChild(this.visualContainer);

// Method to update tower visuals based on type
private updateVisual(): void {
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
private visual: Graphics;
private visualContainer: Container;

// Create visual representation in constructor
this.visualContainer = new Container();
this.visual = new Graphics();
this.visualContainer.addChild(this.visual);
this.addChild(this.visualContainer);

// Method to update zombie visuals based on type
private updateVisual(): void {
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
    // ... other zombie types
  }
}
```

## Visual Effects

### Tower Shooting Effects

When towers shoot, they will display visual effects:

1. **Muzzle Flash**



























































































































































































