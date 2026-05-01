---
inclusion: always
---

# TypeScript Development Patterns

## Import Rules

### Path Aliases (REQUIRED)

Always use `@/` path aliases for imports within `src/`:

```typescript
// ✅ CORRECT
import { Entity } from '@/core/Entity';
import type { Component } from '@/types/ComponentTypes';

// ❌ WRONG
import { Entity } from '../core/Entity';
import type { Component } from '../../types/ComponentTypes';
```

### Type-Only Imports

Use `type` keyword when importing only for type annotations:

```typescript
// ✅ Type-only import (when used only in type positions)
import type { Entity } from '@/core/Entity';
function process(entity: Entity): void {}

// ✅ Value import (when using instanceof, static methods, or as value)
import { Entity } from '@/core/Entity';
if (obj instanceof Entity) {
}
```

## Type vs Value Pattern

### Const Objects with Types

When exporting const objects alongside types, use clear naming:

```typescript
// ✅ CORRECT - Clear distinction
export const LeaderboardCategory = {
  ENDLESS_SURVIVAL: 'endless_survival',
  SPEED_RUN: 'speed_run',
} as const;

export type LeaderboardCategoryType =
  (typeof LeaderboardCategory)[keyof typeof LeaderboardCategory];

// Usage in other files:
import type { LeaderboardCategoryType } from '@/systems/social/LeaderboardSystem';
import { LeaderboardCategory } from '@/systems/social/LeaderboardSystem';

const category: LeaderboardCategoryType = LeaderboardCategory.ENDLESS_SURVIVAL;
```

### Component Types

Use string literals with const assertions:

```typescript
// ✅ GOOD
export interface PositionComponent {
  type: 'position';
  x: number;
  y: number;
}

// ✅ BETTER (for reusability)
export const POSITION_TYPE = 'position' as const;

export interface PositionComponent {
  type: typeof POSITION_TYPE;
  x: number;
  y: number;
}
```

## Function Signatures

### Explicit Return Types (REQUIRED)

Always specify return types for public functions and factories:

```typescript
// ✅ CORRECT
export function createGuppy(x: number, y: number): Entity {
  return new Entity().addComponent({ type: 'position', x, y });
}

// ❌ WRONG
export function createGuppy(x: number, y: number) {
  return new Entity().addComponent({ type: 'position', x, y });
}
```

### Unused Parameters

Prefix intentionally unused parameters with underscore:

```typescript
// ✅ CORRECT
public update(_deltaTime: number): void {
  // Not using deltaTime in this implementation
}

// ❌ WRONG (triggers warning)
public update(deltaTime: number): void {
  // Not using deltaTime
}
```

## Config Objects

### Immutable Config

Use `as const` for configuration objects:

```typescript
// ✅ CORRECT
export const FISH_CONFIG = {
  guppy: {
    baseHealth: 100,
    growthRate: 1.0,
  },
  carnivore: {
    baseHealth: 150,
    growthRate: 0.8,
  },
} as const;

// Type inference works automatically
type FishType = keyof typeof FISH_CONFIG; // 'guppy' | 'carnivore'
```

## Event System

### Discriminated Unions

Use discriminated unions for type-safe events:

```typescript
// ✅ EXCELLENT - Type-safe event system
type GameEvent =
  | { type: 'fishSpawned'; fishId: number; species: string }
  | { type: 'alienKilled'; alienId: number; reward: number }
  | { type: 'riftOpened'; riftId: number; modifier: string };

function handleEvent(event: GameEvent): void {
  switch (event.type) {
    case 'fishSpawned':
      // TypeScript knows event.fishId and event.species exist
      console.log(`Fish ${event.fishId} spawned`);
      break;
    case 'alienKilled':
      // TypeScript knows event.alienId and event.reward exist
      console.log(`Alien ${event.alienId} killed`);
      break;
    case 'riftOpened':
      // TypeScript knows event.riftId and event.modifier exist
      console.log(`Rift ${event.riftId} opened`);
      break;
  }
}
```

## Null Safety

### Strict Null Checks

Leverage TypeScript's strict null checking:

```typescript
// With noUncheckedIndexedAccess: true
const items: string[] = ['a', 'b', 'c'];

// ✅ CORRECT - Check for undefined
const item = items[10];
if (item !== undefined) {
  item.toUpperCase(); // Safe
}

// ✅ ALSO CORRECT - Optional chaining
items[10]?.toUpperCase();

// ❌ WRONG - Potential runtime error
const item = items[10];
item.toUpperCase(); // Error if undefined
```

## Interface vs Type

### When to Use Each

- **Interfaces**: For object shapes, can be extended
- **Types**: For unions, intersections, primitives

```typescript
// ✅ Interface for object shapes
export interface FishConfig {
  baseHealth: number;
  growthRate: number;
}

// ✅ Type for unions
export type FishSpecies = 'guppy' | 'carnivore' | 'breeder';

// ✅ Type for complex unions
export type EntityType =
  | { kind: 'fish'; species: FishSpecies }
  | { kind: 'alien'; variant: AlienVariant }
  | { kind: 'pet'; name: string };
```

## Quick Checklist

When writing new TypeScript code:

- [ ] Use `@/` path aliases for all imports
- [ ] Add `type` keyword to type-only imports
- [ ] Specify explicit return types on functions
- [ ] Use `as const` for config objects
- [ ] Prefix unused parameters with underscore
- [ ] Use discriminated unions for complex types
- [ ] Leverage strict null checks
- [ ] Choose interface vs type appropriately
