# Zombie Tower Defense - Game Prototype Design

## 1. Overview

This document outlines the design for a basic playable prototype of the Zombie Tower Defense game. The prototype will include core gameplay elements: a map with a path, towers that can be placed and shoot at zombies, and zombies that follow the path toward the player's base.

The prototype will demonstrate the fundamental mechanics of tower defense gameplay:
- Placing towers on the map
- Zombies following a predefined path
- Towers detecting and shooting at zombies
- Basic resource management (money for tower placement)
- Wave-based zombie spawning

## 2. Technology Stack & Dependencies

- **Game Engine**: PixiJS v8.8.1 (2D rendering engine)
- **Language**: TypeScript
- **Build Tool**: Vite
- **Package Manager**: npm
- **Linting**: ESLint with Prettier

## 3. Core Architecture

The game follows a component-based architecture with specialized managers for different systems:

```
Game Application
├── Managers
│   ├── GameManager (Game state, resources)
│   ├── TowerManager (Tower creation, stats)
│   ├── WaveManager (Zombie waves, spawning)
│   ├── MapManager (Map data, waypoints)
│   └── PathfindingManager (Navigation paths)
├── Game Objects
│   ├── Tower (Base tower class)
│   ├── Zombie (Base zombie class)
│   ├── TowerFactory (Tower instantiation)
│   └── ZombieFactory (Zombie instantiation)
├── Components
│   ├── TransformComponent (Position, velocity)
│   └── HealthComponent (Health, damage)
├── UI
│   ├── UIManager (UI component management)
│   ├── HUD (Game information display)
│   └── MainMenu (Main menu interface)
└── Config
    └── GameConfig (Game constants, settings)
```

## 4. Component System

### 4.1 GameObject Base Class
The `GameObject` class extends PixiJS Container and serves as the base for all game entities. It manages components and provides update lifecycle methods.

### 4.2 Components
- **TransformComponent**: Handles position, velocity, rotation, and scale
- **HealthComponent**: Manages health, damage, and armor values

## 5. Game Entities

### 5.1 Tower System

#### 5.1.1 Base Tower Class
The `Tower` class extends `GameObject` and provides common functionality:
- Tower placement and positioning
- Damage, range, and fire rate properties
- Target detection and shooting mechanics
- Upgrade system

#### 5.1.2 Tower Types
The prototype will include the Machine Gun Tower as the initial implementation:
- **Machine Gun Tower**: High fire rate, moderate damage, good against swarms
  - Cost: 100
  - Damage: 20
  - Range: 150
  - Fire Rate: 10 shots/second

### 5.2 Zombie System

#### 5.2.1 Base Zombie Class
The `Zombie` class extends `GameObject` and provides common functionality:
- Path following using waypoints
- Health management
- Reward system for player elimination

#### 5.2.2 Zombie Types
The prototype will include the Basic Zombie as the initial implementation:
- **Basic Zombie**: Standard zombie with moderate health and speed
  - Health: 100
  - Speed: 50 pixels/second
  - Reward: 10 money

## 6. Game Managers

### 6.1 GameManager
Central coordinator for game state and systems:
- Game state management (Main Menu, Playing, Paused, Game Over)
- Player resources (money, lives)
- Wave progression
- Game loop integration

### 6.2 TowerManager
Handles tower-related functionality:
- Tower statistics and balancing
- Cost calculations
- Upgrade mechanics

### 6.3 WaveManager
Manages zombie waves and spawning:
- Wave composition data
- Zombie health and damage scaling
- Spawn timing and intervals

### 6.4 MapManager
Handles map data and navigation:
- Predefined map layouts
- Waypoint paths for zombie navigation

### 6.5 PathfindingManager
Provides pathfinding functionality:
- Waypoint-based navigation system
- Path calculation and validation

## 7. Map System

### 7.1 Map Layout
The prototype will use a simple predefined map with dimensions 1024x768 pixels.

### 7.2 Path System
Zombies follow a predefined path consisting of waypoints:
1. Start at (50, 384)
2. Move to (200, 384)
3. Move to (200, 500)
4. Move to (400, 500)
5. Move to (400, 200)
6. Move to (600, 200)
7. Move to (600, 600)
8. Move to (950, 600) - End point

## 8. UI System

### 8.1 UIManager
Manages UI components and their visibility based on game state.

### 8.2 HUD
Displays critical game information:
- Player money
- Remaining lives
- Current wave number

### 8.3 MainMenu
Provides game start functionality with a title and start button.

## 9. Game Flow

### 9.1 Initialization Sequence
1. Application initializes with PixiJS
2. Game managers are instantiated
3. UI components are created and registered
4. Main menu is displayed

### 9.2 Game Start Sequence
1. Player clicks "Start Game" button
2. Game transitions to PLAYING state
3. First wave of zombies begins spawning
4. Player can place towers using available money

### 9.3 Gameplay Loop
1. Zombies spawn according to wave schedule
2. Zombies follow predefined path
3. Towers detect zombies in range
4. Towers shoot at zombies periodically
5. Zombies take damage and may be eliminated
6. Player earns money for eliminated zombies
7. Zombies that reach the end cause player to lose lives
8. Wave completes when all zombies are eliminated or reach the end
9. Next wave begins after a short delay

## 10. Prototype Features

### 10.1 Core Mechanics
- [ ] Tower placement on map
- [ ] Zombie path following
- [ ] Tower targeting and shooting
- [ ] Damage calculation and health management
- [ ] Resource management (money for towers)
- [ ] Wave-based zombie spawning
- [ ] Game state management

### 10.2 UI Elements
- [ ] Main menu with start button
- [ ] In-game HUD showing money, lives, and wave
- [ ] Visual representation of towers and zombies
- [ ] Visual representation of tower range

### 10.3 Visual Feedback
- [ ] Tower placement indicators
- [ ] Projectile visualization
- [ ] Damage numbers
- [ ] Health bars for zombies

## 11. Implementation Priorities

### 11.1 Phase 1: Basic Framework
1. Set up game managers and core systems
2. Implement base GameObject and Component classes
3. Create basic UI structure with UIManager

### 11.2 Phase 2: Core Gameplay
1. Implement tower and zombie base classes
2. Create pathfinding system for zombie movement
3. Add tower placement mechanics
4. Implement shooting mechanics

### 11.3 Phase 3: Game Flow
1. Implement wave spawning system
2. Add resource management
3. Create game state transitions
4. Implement win/lose conditions

### 11.4 Phase 4: Polish
1. Add visual feedback and effects
2. Improve UI elements
3. Add sound effects (if time permits)
4. Optimize performance

## 12. Technical Considerations

### 12.1 Performance
- Efficient object pooling for towers and zombies
- Optimized collision detection for targeting
- Proper cleanup of destroyed objects

### 12.2 Scalability
- Modular design allows for easy addition of new tower and zombie types
- Config-driven balancing system
- Extensible UI component system

### 12.3 PixiJS v8 Compatibility
- Use updated Graphics API (fill() instead of beginFill()/endFill())
- Use updated Text constructor syntax
- Proper event handling with eventMode and cursor properties
