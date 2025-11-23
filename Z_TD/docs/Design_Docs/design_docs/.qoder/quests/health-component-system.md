# Health Component System Design

## 1. Overview

The Health Component System is a core part of the Zombie Tower Defence game's Entity-Component architecture. It provides a standardized way to manage health, damage calculation, healing, and death events for all game entities that require health management, such as zombies and towers.

This system implements the Entity-Component pattern, where the `HealthComponent` class extends the base `Component` class and can be attached to any `GameObject` to provide health-related functionality.

## 2. Architecture

### 2.1 Component System Structure

The Health Component System follows the Entity-Component-System (ECS) architectural pattern:

```mermaid
classDiagram
class Component {
  +name : string
  +init() : void
  +update(deltaTime : number) : void
  +destroy() : void
}

class HealthComponent {
  -currentHealth : number
  -maxHealth : number
  -armor : number
  +takeDamage(damage : number) : number
  +heal(amount : number) : void
  +isAlive() : boolean
  +getHealth() : number
  +getMaxHealth() : number
  +getHealthPercentage() : number
  +setArmor(armor : number) : void
  +getArmor() : number
}

class GameObject {
  -components : Map~string, Component~
  -active : boolean
  +addComponent(component : Component) : void
  +removeComponent(name : string) : void
  +getComponent~T~(name : string) : T | undefined
  +hasComponent(name : string) : boolean
  +update(deltaTime : number) : void
  +setActive(active : boolean) : void
  +isActive() : boolean
  +destroy() : void
}

class Zombie {
  +takeDamage(damage : number) : number
}

class Tower {
  +takeDamage(damage : number) : number
}

Component <|-- HealthComponent
GameObject --> Component
GameObject --> HealthComponent
Zombie --|> GameObject
Tower --|> GameObject
```

### 2.2 Core Properties

The HealthComponent maintains three primary internal state variables:

- **currentHealth**: Tracks the entity's current health value, initialized to `maxHealth` and reduced when taking damage.
- **maxHealth**: Defines the upper limit of health, determined at instantiation based on entity type and game progression.
- **armor**: Represents damage reduction as a percentage (0–100), where 100 blocks all damage and 0 applies no mitigation.

These properties are private to enforce encapsulation, with public accessor methods providing controlled read and write operations.

## 3. Component Implementation

### 3.1 Constructor

The HealthComponent constructor initializes the health values:

```typescript
constructor(maxHealth: number, armor: number = 0) {
  super('Health');
  this.maxHealth = maxHealth;
  this.currentHealth = maxHealth;
  this.armor = armor;
}
```

### 3.2 Damage Calculation and Armor Mitigation

When an entity takes damage, the `takeDamage()` method computes the effective damage after applying armor reduction. The formula used is:

```
reducedDamage = damage * (1 - armor / 100)
```

This scales linearly—e.g., 30 armor reduces incoming damage by 30%. The result is floored and clamped to a minimum of 1 to prevent negligible damage from being ignored entirely.

```typescript
public takeDamage(damage: number): number {
  const reducedDamage = damage * (1 - this.armor / 100);
  const actualDamage = Math.max(1, Math.floor(reducedDamage));
  
  this.currentHealth -= actualDamage;
  this.currentHealth = Math.max(0, this.currentHealth);
  
  return actualDamage;
}
```

This ensures that even highly armored entities can be damaged, maintaining gameplay balance. The method returns the actual damage dealt, which can be used for visual effects or UI feedback.

### 3.3 Healing and Health Management

The `heal()` method safely increases the current health without exceeding `maxHealth`, using `Math.min()` to cap the value:

```typescript
public heal(amount: number): void {
  this.currentHealth = Math.min(this.maxHealth, this.currentHealth + amount);
}
```

Additional utility methods provide health status information:

- `isAlive()`: Returns `true` if `currentHealth > 0`
- `getHealth()`: Returns current health value
- `getMaxHealth()`: Returns maximum health
- `getHealthPercentage()`: Returns health as a percentage of max

```typescript
public isAlive(): boolean {
  return this.currentHealth > 0;
}

public getHealthPercentage(): number {
  return (this.currentHealth / this.maxHealth) * 100;
}
```

These methods support UI elements like health bars and death checks in game logic.

### 3.4 Armor Management

Armor values are clamped between 0 and 100 to prevent invalid states:

```typescript
public setArmor(armor: number): void {
  this.armor = Math.max(0, Math.min(100, armor));
}

public getArmor(): number {
  return this.armor;
}
```

## 4. Entity Integration Examples

### 4.1 Zombie Entity Initialization

In the `Zombie` class, the `HealthComponent` is instantiated during setup using wave-scaled health values from `WaveManager`.

```typescript
private initializeStats(wave: number): void {
  const waveManager = new WaveManager();
  const health = waveManager.calculateZombieHealth(this.type, wave);
  
  // Add health component
  const healthComponent = new HealthComponent(health);
  this.addComponent(healthComponent);
  
  // Set speed based on type
  // ... rest of initialization
}
```

### 4.2 Tower Entity Integration

Similarly, towers can use the HealthComponent for durability:

```typescript
// In Tower class constructor
const healthComponent = new HealthComponent(towerHealth);
this.addComponent(healthComponent);
```

## 5. Damage Flow Process

The damage flow process is illustrated in the following diagram:

```mermaid
flowchart TD
Start([takeDamage called]) --> ApplyArmor["Apply armor reduction: damage * (1 - armor/100)"]
ApplyArmor --> MinDamage["Ensure minimum 1 damage"]
MinDamage --> UpdateHealth["Subtract from currentHealth"]
UpdateHealth --> ClampHealth["Clamp health to >= 0"]
ClampHealth --> ReturnDamage["Return actual damage dealt"]
ReturnDamage --> End([Method complete])
```

## 6. WaveManager Integration and Resource Rewards

When a zombie is eliminated:
1. The game checks if `isAlive()` returns `false`
2. The zombie's `reward` value is added to player resources
3. The entity is destroyed and removed from the scene

```typescript
// In zombie update or death handler
if (!zombie.getComponent<HealthComponent>('Health').isAlive()) {
  player.addResources(zombie.getReward());
  zombie.destroy();
}
```

This integration ensures consistent reward scaling and progression.

## 7. Common Issues and Edge Cases

### 7.1 Floating-Point Health Values

Although health is stored as a number, all operations use `Math.floor()` on damage and `Math.max()`/`Math.min()` for bounds, preventing fractional health states.

### 7.2 Armor Overflow

The `setArmor()` method clamps values between 0 and 100:

```typescript
public setArmor(armor: number): void {
  this.armor = Math.max(0, Math.min(100, armor));
}
```

This prevents invalid states like negative armor or over-100% damage reduction.

### 7.3 Event Cleanup on Destroy

When a zombie dies, its components are automatically cleaned up via the entity system's `destroyEntity()` method. No manual event unbinding is required, reducing memory leak risks.

## 8. Extension Points and Future Components

The system supports easy extension with new components:

### 8.1 BuffComponent

Could apply temporary modifiers (e.g., speed boost, damage increase).

```typescript
class BuffComponent extends Component {
  private duration: number;
  private effects: Map<string, number>;
  public update(deltaTime: number) { /* reduce duration, remove if expired */ }
}
```

### 8.2 ShieldComponent

Could provide temporary damage absorption before health is affected.

```typescript
class ShieldComponent extends Component {
  private shieldPoints: number;
  private maxShieldPoints: number;
  public absorbDamage(damage: number): number { /* return damage after absorption */ }
}
```

### 8.3 RegenerationComponent

Could provide periodic health regeneration for entities.

```typescript
class RegenerationComponent extends Component {
  private regenerationRate: number;
  private regenerationAmount: number;
  public update(deltaTime: number) { /* apply periodic healing */ }
}
```

These components would follow the same lifecycle and attachment pattern.

## 9. Testing Strategy

The HealthComponent should be tested with unit tests covering all functionality:

- Damage calculation with various armor values
- Healing behavior and clamping
- Health percentage calculations
- Alive/death state transitions
- Armor value clamping

```typescript
// Example test cases
it('should calculate damage correctly with armor', () => {
  const healthComponent = new HealthComponent(100, 50); // 50% armor
  const damage = healthComponent.takeDamage(20);
  expect(damage).toBe(10); // 50% reduction, minimum 1
});

it('should clamp armor values', () => {
  const healthComponent = new HealthComponent(100);
  healthComponent.setArmor(150);
  expect(healthComponent.getArmor()).toBe(100);
  healthComponent.setArmor(-20);
  expect(healthComponent.getArmor()).toBe(0);
});
```

## 10. Best Practices for Component Lifecycle and Memory

- **Initialize in `init()`**: Perform setup logic when component is added.
- **Update in `update()`**: Handle time-based logic; avoid heavy computations.
- **Clean Up in `destroy()`**: Release resources, remove event listeners.
- **Avoid Memory Leaks**: Always call `super.destroy()` in `GameObject.destroy()`.
- **Use `Map<string, Component>` Efficiently**: Remove components explicitly when no longer needed.

```typescript
public destroy(): void {
  for (const component of this.components.values()) {
    component.destroy();
  }
  this.components.clear();
  super.destroy();
}
```

## 11. Performance Considerations

The HealthComponent is designed for optimal performance in a game environment:

- **Minimal computational overhead**: Damage calculations use simple arithmetic operations
- **Efficient memory usage**: Only stores essential health-related data
- **No unnecessary object creation**: Reuses existing objects and avoids garbage collection pressure
- **Fast state checks**: `isAlive()` method provides O(1) complexity for death checks

For games with many entities, the component's lightweight design ensures smooth performance even with hundreds of simultaneous health calculations.

## 12. Conclusion

The Health Component System provides a robust, scalable foundation for the Zombie Tower Defence game. By leveraging the Entity-Component pattern, it enables flexible entity composition, promotes code reuse, and simplifies gameplay logic. The `HealthComponent` serves as a critical building block for health and damage systems.

With proper lifecycle management and thoughtful extension, this architecture supports both current functionality and future enhancements. The component's design allows for easy integration with visual effects, UI elements, and gameplay mechanics while maintaining clean separation of concerns.