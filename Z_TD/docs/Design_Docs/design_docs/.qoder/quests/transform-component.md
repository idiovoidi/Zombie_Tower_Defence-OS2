# Transform Component Design Document

## Implementation Plan

This document describes the planned enhancements to the Transform Component. The current implementation will be extended with getter methods for all properties to provide better encapsulation and consistency with the Health Component pattern.

## 1. Overview

The Transform Component is a core component in the Zombie Tower Defense game's Entity-Component-System (ECS) architecture. It manages the spatial properties of game objects, including position, velocity, rotation, and scale. This component enables objects to move, rotate, and be positioned correctly within the game world.

## 2. Architecture

### 2.1 Component Structure

The Transform Component follows the base Component class structure and implements the standard lifecycle methods:

```
class Component {
  +name: string
  +init(): void
  +update(deltaTime: number): void
  +destroy(): void
}

class TransformComponent {
  +position: Position
  +velocity: Velocity
  +rotation: number
  +scale: number
  +constructor(x: number, y: number)
  +update(deltaTime: number): void
  +setPosition(x: number, y: number): void
  +setVelocity(x: number, y: number): void
  +setRotation(rotation: number): void
  +setScale(scale: number): void
  +getPosition(): Position
  +getVelocity(): Velocity
  +getRotation(): number
  +getScale(): number
}

class Position {
  +x: number
  +y: number
}

class Velocity {
  +x: number
  +y: number
}

Component <|-- TransformComponent
TransformComponent --> Position
TransformComponent --> Velocity
```

### 2.2 Integration with GameObject

The Transform Component integrates with the GameObject class through the component system:

```
class Diagram {
  -components: Map<string, Component>
  +addComponent(component: Component): void
  +getComponent<T>(name: string): T | undefined
  +update(deltaTime: number): void
}

class TransformComponent {
  +position: Position
  +velocity: Velocity
  +rotation: number
  +scale: number
}

Diagram --> TransformComponent : contains
```

## 3. Data Models

### 3.1 Position Interface
Represents the 2D coordinates of an object in the game world:
- `x: number` - Horizontal position
- `y: number` - Vertical position

### 3.2 Velocity Interface
Represents the movement speed of an object:
- `x: number` - Horizontal velocity (pixels per second)
- `y: number` - Vertical velocity (pixels per second)

### 3.3 Transform Component Properties
- `position: Position` - Current position of the object
- `velocity: Velocity` - Current movement velocity
- `rotation: number` - Rotation angle in radians
- `scale: number` - Scaling factor (1.0 = normal size)

## 4. API Reference

### 4.1 Constructor
```typescript
constructor(x: number = 0, y: number = 0)
```
Initializes a new Transform Component with optional starting position.

### 4.2 Public Methods

#### update(deltaTime: number): void
Updates the position based on velocity and elapsed time.
- **Parameters**: `deltaTime` - Time elapsed since last update in seconds
- **Implementation**: `position.x += velocity.x * deltaTime` and `position.y += velocity.y * deltaTime`

#### setPosition(x: number, y: number): void
Sets the absolute position of the object.
- **Parameters**: 
  - `x: number` - New x-coordinate
  - `y: number` - New y-coordinate

#### setVelocity(x: number, y: number): void
Sets the movement velocity of the object.
- **Parameters**: 
  - `x: number` - Velocity along x-axis (pixels per second)
  - `y: number` - Velocity along y-axis (pixels per second)

#### setRotation(rotation: number): void
Sets the rotation angle of the object.
- **Parameters**: `rotation: number` - Rotation angle in radians

#### setScale(scale: number): void
Sets the scaling factor of the object.
- **Parameters**: `scale: number` - Scaling factor (1.0 = normal size)

#### getPosition(): Position
Returns the current position.
- **Returns**: Current position object

#### getVelocity(): Velocity
Returns the current velocity.
- **Returns**: Current velocity object

#### getRotation(): number
Returns the current rotation.
- **Returns**: Current rotation in radians

#### getScale(): number
Returns the current scale.
- **Returns**: Current scale factor

## 5. Business Logic

### 5.1 Movement System
The Transform Component implements a basic physics system where position is updated based on velocity and time:
```
newPosition.x = currentPosition.x + velocity.x * deltaTime
newPosition.y = currentPosition.y + velocity.y * deltaTime
```

### 5.2 Usage in Game Objects
Game objects like Zombie use the Transform Component for:
1. Positioning the visual representation
2. Moving along paths
3. Collision detection
4. Targeting calculations

Example usage in Zombie movement:
```typescript
// Get the transform component
const transform = this.getComponent<TransformComponent>('Transform');

// Set velocity to move toward a target
transform.setVelocity(velocityX, velocityY);

// Position is automatically updated in the update loop
```

## 6. Integration Points

### 6.1 Rendering System
The Transform Component provides the spatial data needed by the rendering system to position sprites correctly on screen.

### 6.2 Physics System
Velocity and position data are used by physics calculations for movement, collision detection, and response.

### 6.3 AI System
Position and rotation data are used by AI systems for pathfinding, targeting, and decision making.

### 6.4 UI System
Transform data may be used for UI positioning and animations.

## 7. Design Patterns

### 7.1 Component Pattern
The Transform Component follows the Component pattern, which is part of the larger Entity-Component-System (ECS) architecture. This pattern allows for:
- Composition over inheritance
- Dynamic addition/removal of behaviors
- Better code reuse and modularity

### 7.2 Data Holder Pattern
The Transform Component acts as a data holder, containing spatial properties without complex business logic. This keeps the component lightweight and focused.

## 8. Performance Considerations

1. **Object Pooling**: Consider pooling Transform Components to reduce garbage collection
2. **Batch Updates**: For large numbers of objects, consider batch position updates
3. **Memory Efficiency**: Position and Velocity objects are shared references to reduce memory allocation
4. **Delta Time Consistency**: Ensuring consistent delta time values prevents movement inconsistencies

## 8. Testing

### 8.1 Unit Tests

#### Position Update Test
```typescript
// Test that position updates correctly based on velocity and time
const transform = new TransformComponent(0, 0);
transform.setVelocity(10, 20);
transform.update(0.5); // 0.5 seconds
// Expected position: (5, 10)
```

#### Setter/Getter Tests
```typescript
// Test that setters and getters work correctly
const transform = new TransformComponent();
transform.setPosition(100, 200);
const position = transform.getPosition();
// Expected: position.x = 100, position.y = 200
```

#### Boundary Tests
```typescript
// Test behavior at boundary conditions
const transform = new TransformComponent();
transform.setScale(0); // Should handle zero scale
transform.setRotation(Math.PI * 2); // Should handle full rotation
```

### 8.2 Implementation Plan

The following methods will be added to the TransformComponent class to improve encapsulation and provide consistency with other components in the system:

1. `getPosition(): Position` - Returns the current position object
2. `getVelocity(): Velocity` - Returns the current velocity object
3. `getRotation(): number` - Returns the current rotation value
4. `getScale(): number` - Returns the current scale value

These getter methods will provide read-only access to the component's properties, following the same pattern as the HealthComponent which provides getters for health, maxHealth, and armor values.

### 8.3 Proposed Implementation

```
export class TransformComponent extends Component {
  public position: Position;
  public velocity: Velocity;
  public rotation: number;
  public scale: number;
  
  constructor(x: number = 0, y: number = 0) {
    super('Transform');
    this.position = { x, y };
    this.velocity = { x: 0, y: 0 };
    this.rotation = 0;
    this.scale = 1;
  }
  
  public update(deltaTime: number): void {
    // Update position based on velocity
    this.position.x += this.velocity.x * deltaTime;
    this.position.y += this.velocity.y * deltaTime;
  }
  
  public setPosition(x: number, y: number): void {
    this.position.x = x;
    this.position.y = y;
  }
  
  public setVelocity(x: number, y: number): void {
    this.velocity.x = x;
    this.velocity.y = y;
  }
  
  public setRotation(rotation: number): void {
    this.rotation = rotation;
  }
  
  public setScale(scale: number): void {
    this.scale = scale;
  }
  
  // NEW GETTER METHODS
  public getPosition(): Position {
    return this.position;
  }
  
  public getVelocity(): Velocity {
    return this.velocity;
  }
  
  public getRotation(): number {
    return this.rotation;
  }
  
  public getScale(): number {
    return this.scale;
  }
}
```

## 9. Conclusion

The Transform Component is a fundamental part of the game's architecture, providing essential spatial functionality for all game objects. By following the Component pattern and ECS architecture, it enables flexible and efficient management of object positions, movement, and transformations. The addition of getter methods will improve encapsulation and consistency with other components in the system, making the API more intuitive for developers working with game objects.
