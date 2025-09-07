# Resource Management System Design

## 1. Overview

The Resource Management System is a core component of the Zombie Tower Defense game that handles all player resources including money, materials (wood, metal), and energy. This system provides a centralized approach to resource generation, consumption, and validation, ensuring consistent gameplay mechanics and preventing invalid transactions.

The system is designed to support multiple resource types with different behaviors:
- **Money**: The primary currency used for purchasing towers and upgrades
- **Wood & Metal**: Specialized materials used for constructing specific tower types
- **Energy**: A regenerating resource that powers special abilities and advanced towers

## 2. Architecture

The resource management system follows a component-based architecture with centralized control through the ResourceManager class. This design provides:

- Encapsulation of resource state
- Validation of all resource transactions
- Passive resource generation mechanisms
- Integration with game events and progression

```mermaid
classDiagram
    class GameManager {
        -money: number
        -resources: {wood, metal, energy}
        +addMoney(amount): void
        +spendMoney(amount): boolean
        +addResources(wood, metal, energy): void
        +spendResources(wood, metal, energy): boolean
        +getMoney(): number
        +getResources(): {wood, metal, energy}
    }
    
    class ResourceManager {
        -money: number
        -resources: {wood, metal, energy}
        +canAfford(cost): boolean
        +spend(cost): boolean
        +add(money, wood, metal, energy): void
        +generateResources(deltaTime): void
        +getMoney(): number
        +getResources(): {wood, metal, energy}
    }
    
    class ResourceCost {
        +money: number
        +wood: number
        +metal: number
        +energy: number
    }
    
    GameManager --> ResourceManager : uses
    ResourceManager --> ResourceCost : manages
```

## 3. Core Components

### 3.1 ResourceManager Class

The ResourceManager is the primary class responsible for managing all game resources. It maintains internal state for all resource types and provides methods for resource manipulation with built-in validation.

#### Properties:
- `money`: Primary currency for tower purchases
- `resources`: Object containing wood, metal, and energy values

#### Key Methods:
- `canAfford(cost)`: Checks if player can afford a specific cost
- `spend(cost)`: Deducts resources if player can afford them
- `add(...)`: Adds resources to the player's inventory
- `generateResources(deltaTime)`: Passively generates resources over time

### 3.2 ResourceCost Interface

The ResourceCost interface defines a standardized structure for representing resource costs across the game:

```typescript
interface ResourceCost {
  money: number;
  wood?: number;
  metal?: number;
  energy?: number;
}
```

This structure allows for flexible cost definitions where some resources may not be required for specific purchases.

## 4. Resource Types & Behaviors

### 4.1 Money
- Starting amount defined in GameConfig.STARTING_MONEY (500)
- Used for purchasing towers and upgrades
- Earned by defeating zombies
- Does not regenerate passively

### 4.2 Wood
- Starting amount: 0
- Used for constructing nature-based towers
- Generated passively over time (0.1 units per second)
- Can be spent on specific tower types

### 4.3 Metal
- Starting amount: 0
- Used for constructing mechanical towers
- Generated passively over time (0.05 units per second)
- Can be spent on specific tower types

### 4.4 Energy
- Starting amount: 100 (maximum)
- Used for special abilities and advanced towers
- Regenerates passively over time (0.2 units per second)
- Clamped between 0-100

## 5. Resource Generation System

Resources are generated passively over time through the `generateResources(deltaTime)` method. This system provides:

- Continuous resource income without player action
- Different generation rates for each resource type
- Natural resource cap for energy (0-100)
- Scalable generation based on game time

The generation rates are:
- Wood: 0.1 units per second
- Metal: 0.05 units per second
- Energy: 0.2 units per second (up to maximum of 100)

## 6. Transaction Validation

All resource transactions are validated to prevent invalid states:

- **Sufficiency Checks**: Before spending resources, the system verifies the player has sufficient quantities
- **Boundary Enforcement**: Energy is clamped between 0-100 to prevent overflow/underflow
- **Atomic Operations**: Resource spending is atomic - either all resources are spent or none are

## 7. Integration Points

### 7.1 GameManager Integration
The ResourceManager integrates with the GameManager to provide a unified resource management interface. The GameManager maintains its own resource tracking for game state management while delegating detailed resource operations to the ResourceManager.

### 7.2 Tower Purchase System
Tower purchases will utilize the ResourceManager to validate costs and deduct resources when players place towers.

### 7.3 Level System
Different levels may modify resource generation rates or starting amounts through level-specific modifiers.

## 8. Data Models

### 8.1 Resource Storage Structure
```typescript
resources: {
  wood: number;
  metal: number;
  energy: number;
}
```

### 8.2 Resource Cost Structure
```typescript
interface ResourceCost {
  money: number;
  wood?: number;
  metal?: number;
  energy?: number;
}
```

## 9. Business Logic

### 9.1 Resource Spending Logic
1. Check if player can afford the cost using `canAfford()`
2. If affordable, deduct resources using `spend()`
3. Return success/failure status for appropriate UI feedback

### 9.2 Resource Generation Logic
1. Called periodically with deltaTime parameter
2. Calculate resource generation based on time elapsed
3. Add generated resources to player inventory
4. Apply appropriate clamping to energy resource

## 10. Testing Strategy

### 10.1 Unit Tests
- Resource addition and spending validation
- Sufficiency checking for various resource combinations
- Boundary condition testing for energy clamping
- Time-based resource generation calculations

### 10.2 Integration Tests
- Tower purchase resource validation
- Level-specific resource modifier application
- Game state transitions with resource constraints