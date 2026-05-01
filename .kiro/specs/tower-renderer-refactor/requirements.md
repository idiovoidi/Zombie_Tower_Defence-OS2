# Requirements Document

## Introduction

This specification defines the requirements for refactoring the Tower.ts monolithic class by extracting all rendering and visual effects logic into dedicated renderer classes. The current Tower.ts file contains approximately 1470 lines of code with rendering logic tightly coupled to tower behavior. This refactor will separate concerns by moving all visual rendering code to `src/renderers/towers/` with unique files for each tower type, improving maintainability, testability, and code organization.

## Glossary

- **Tower System**: The game system responsible for tower entities that defend against zombies
- **Tower.ts**: The base Tower class located at `src/objects/Tower.ts` containing both logic and rendering code
- **Renderer**: A class responsible solely for visual representation and effects of game entities
- **Visual Effect**: Graphical elements such as muzzle flashes, shell casings, laser sights, and selection highlights
- **Idle Animation**: Visual animations displayed when a tower is not actively shooting
- **PixiJS Graphics**: The graphics rendering objects from the PixiJS library used for drawing
- **Barrel**: The rotatable graphics component representing the tower's weapon
- **Effect Manager**: A container managing temporary visual effects like particles and flashes

## Requirements

### Requirement 1

**User Story:** As a developer, I want tower rendering logic separated from tower behavior logic, so that I can maintain and modify visual representations without affecting game mechanics

#### Acceptance Criteria

1. WHEN the Tower class is instantiated, THE Tower System SHALL delegate all visual rendering to a dedicated tower renderer instance
2. THE Tower System SHALL maintain only game logic (damage, range, fire rate, targeting) in the Tower.ts base class
3. THE Tower System SHALL expose a clean interface for renderers to access tower state without exposing internal implementation details
4. THE Tower System SHALL ensure that tower behavior remains unchanged after the refactor
5. WHERE a tower type requires custom rendering, THE Tower System SHALL use a type-specific renderer class

### Requirement 2

**User Story:** As a developer, I want each tower type to have its own renderer file, so that I can easily locate and modify visual code for specific tower types

#### Acceptance Criteria

1. THE Tower System SHALL create a separate renderer file for each tower type in `src/renderers/towers/`
2. THE Tower System SHALL implement renderers for all seven tower types: MachineGun, Sniper, Shotgun, Flame, Tesla, Grenade, and Sludge
3. WHEN a tower type is added or modified, THE Tower System SHALL require changes only to that tower's specific renderer file
4. THE Tower System SHALL organize renderer files with consistent naming: `{TowerType}TowerRenderer.ts`
5. THE Tower System SHALL export all tower renderers from `src/renderers/towers/index.ts`

### Requirement 3

**User Story:** As a developer, I want visual effects code extracted from Tower.ts, so that effect logic is centralized and reusable

#### Acceptance Criteria

1. THE Tower System SHALL move all muzzle flash rendering logic from Tower.ts to tower-specific renderers
2. THE Tower System SHALL move all idle animation logic from Tower.ts to tower-specific renderers
3. THE Tower System SHALL move all selection effect logic from Tower.ts to tower-specific renderers
4. THE Tower System SHALL move all tower-specific effect spawning (shell casings, scope glints, laser sights) to tower-specific renderers
5. THE Tower System SHALL move all visual creation methods (createMachineGunVisual, createSniperVisual, etc.) to tower-specific renderers

### Requirement 4

**User Story:** As a developer, I want a base tower renderer class, so that common rendering functionality is shared across all tower types

#### Acceptance Criteria

1. THE Tower System SHALL create a BaseTowerRenderer class that implements common rendering patterns
2. THE Tower System SHALL implement range visualization methods in the base renderer
3. THE Tower System SHALL implement upgrade star rendering in the base renderer
4. THE Tower System SHALL provide lifecycle methods (update, destroy) in the base renderer
5. WHERE tower-specific renderers need custom behavior, THE Tower System SHALL allow method overriding in derived classes

### Requirement 5

**User Story:** As a developer, I want proper memory management in renderer classes, so that visual effects do not cause memory leaks

#### Acceptance Criteria

1. THE Tower System SHALL implement destroy() methods in all renderer classes following the cleanup pattern
2. WHEN a renderer is destroyed, THE Tower System SHALL clear all timers using EffectCleanupManager
3. WHEN a renderer is destroyed, THE Tower System SHALL destroy all PixiJS Graphics objects
4. WHEN a renderer is destroyed, THE Tower System SHALL null all object references
5. THE Tower System SHALL register persistent effects with ResourceCleanupManager

### Requirement 6

**User Story:** As a developer, I want the refactored code to maintain existing visual behavior, so that players experience no visual changes

#### Acceptance Criteria

1. THE Tower System SHALL render all tower visuals identically to the current implementation
2. THE Tower System SHALL maintain all idle animation behaviors for each tower type
3. THE Tower System SHALL maintain all shooting effect visuals for each tower type
4. THE Tower System SHALL maintain all upgrade level visual progressions
5. THE Tower System SHALL maintain barrel rotation and recoil animations

### Requirement 7

**User Story:** As a developer, I want clear interfaces between towers and renderers, so that the coupling between logic and visuals is minimized

#### Acceptance Criteria

1. THE Tower System SHALL define an ITowerRenderer interface specifying required renderer methods
2. THE Tower System SHALL define an ITowerRenderState interface for passing tower state to renderers
3. THE Tower System SHALL ensure Tower.ts only calls renderer methods through the defined interface
4. THE Tower System SHALL ensure renderers only access tower state through the defined interface
5. THE Tower System SHALL document all interface methods with clear parameter and return type definitions
