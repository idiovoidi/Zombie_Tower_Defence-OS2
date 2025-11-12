# Requirements Document: Tower Renderer Separation

## Introduction

Refactor the Tower class to separate rendering logic from game logic by introducing dedicated renderer classes. This improves maintainability, testability, and aligns with the Separation of Concerns principle.

## Glossary

- **Tower**: Game entity that attacks zombies, has stats (damage, range, fire rate), and can be upgraded
- **Renderer**: Class responsible for visual representation of a tower
- **Game Logic**: Code that manages tower behavior, state, and gameplay mechanics
- **Rendering Logic**: Code that creates and updates visual representation using PixiJS Graphics
- **Visual Container**: PixiJS Graphics object that holds the tower's visual elements
- **Barrel Container**: PixiJS Graphics object that holds the rotatable weapon/character

## Requirements

### Requirement 1: Renderer Architecture

**User Story:** As a developer, I want a clear separation between game logic and rendering logic, so that I can modify visuals without affecting gameplay.

#### Acceptance Criteria

1. THE System SHALL create an ITowerRenderer interface that defines rendering methods
2. THE System SHALL implement a TowerRendererFactory that creates renderer instances based on tower type
3. THE System SHALL provide separate renderer classes for each tower type (MachineGun, Sniper, Shotgun, Flame, Tesla, Grenade, Sludge)
4. WHEN a tower is created, THE System SHALL assign the appropriate renderer via the factory
5. THE renderer classes SHALL implement the ITowerRenderer interface

### Requirement 2: Visual Rendering Separation

**User Story:** As a developer, I want all visual creation code moved to renderer classes, so that the Tower class focuses only on game logic.

#### Acceptance Criteria

1. THE renderer SHALL handle all Graphics primitive creation (circles, rectangles, lines)
2. THE renderer SHALL define all visual properties (colors, sizes, positions)
3. THE renderer SHALL implement visual upgrade progression (level 1-5 appearance changes)
4. THE renderer SHALL manage visual effects (muzzle flashes, upgrade stars)
5. THE Tower class SHALL NOT contain any Graphics drawing code after refactoring
6. THE Tower class SHALL retain only renderer method calls (updateVisual, showShootingEffect)

### Requirement 3: Tower Class Simplification

**User Story:** As a developer, I want the Tower class to focus on game logic, so that it's easier to understand and maintain.

#### Acceptance Criteria

1. THE Tower class SHALL manage game state (damage, range, fireRate, upgradeLevel)
2. THE Tower class SHALL handle game logic (shooting, targeting, upgrades, component management)
3. THE Tower class SHALL store references to visual and barrel Graphics containers
4. THE Tower class SHALL store a reference to its assigned renderer
5. THE Tower class SHALL call renderer methods to update visuals
6. THE Tower class SHALL NOT implement createMachineGunVisual, createSniperVisual, or similar visual methods
7. THE Tower class SHALL be reduced from 1400+ lines to approximately 600 lines

### Requirement 4: Renderer Interface Contract

**User Story:** As a developer, I want a consistent renderer interface, so that all tower renderers work the same way.

#### Acceptance Criteria

1. THE ITowerRenderer interface SHALL define a render method that accepts visual, barrel, type, and upgradeLevel parameters
2. THE ITowerRenderer interface SHALL define a renderShootingEffect method that accepts barrel, type, and upgradeLevel parameters
3. THE ITowerRenderer interface SHALL define a destroy method for cleanup
4. WHEN render is called, THE renderer SHALL clear and redraw the visual and barrel Graphics
5. WHEN renderShootingEffect is called, THE renderer SHALL create temporary muzzle flash effects
6. WHEN destroy is called, THE renderer SHALL clean up any renderer-specific resources

### Requirement 5: Visual Consistency

**User Story:** As a player, I want towers to look exactly the same after refactoring, so that my gameplay experience is unchanged.

#### Acceptance Criteria

1. THE refactored towers SHALL render identically to the original implementation
2. THE upgrade visual progression SHALL remain unchanged (level 1-5 appearances)
3. THE shooting effects SHALL remain unchanged (muzzle flashes, recoil)
4. THE idle animations SHALL continue to work correctly
5. THE barrel rotation SHALL continue to work correctly
6. THE upgrade stars SHALL continue to display correctly

### Requirement 6: Memory Management

**User Story:** As a developer, I want proper cleanup of renderer resources, so that there are no memory leaks.

#### Acceptance Criteria

1. THE renderer destroy method SHALL be called when a tower is destroyed
2. THE renderer SHALL use EffectCleanupManager for temporary effects
3. THE renderer SHALL properly destroy any Graphics objects it creates
4. THE Tower destroy method SHALL call renderer.destroy() before super.destroy()
5. THE System SHALL NOT introduce new memory leaks during refactoring

### Requirement 7: Factory Pattern Implementation

**User Story:** As a developer, I want a factory to create renderers, so that tower creation is simple and consistent.

#### Acceptance Criteria

1. THE TowerRendererFactory SHALL have a static create method that accepts tower type
2. WHEN create is called with a valid tower type, THE factory SHALL return the appropriate renderer instance
3. WHEN create is called with an invalid tower type, THE factory SHALL return a DefaultTowerRenderer
4. THE factory SHALL support all seven tower types (MachineGun, Sniper, Shotgun, Flame, Tesla, Grenade, Sludge)

### Requirement 8: Backward Compatibility

**User Story:** As a developer, I want existing tower functionality to work unchanged, so that no gameplay features break.

#### Acceptance Criteria

1. THE Tower public API SHALL remain unchanged (getType, upgrade, shoot, rotateTowards, etc.)
2. THE TowerManager SHALL continue to work without modifications
3. THE TowerCombatManager SHALL continue to work without modifications
4. THE tower placement system SHALL continue to work without modifications
5. THE tower upgrade system SHALL continue to work without modifications
6. THE existing tests SHALL pass without modification (or be updated to reflect new structure)
