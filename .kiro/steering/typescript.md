---
inclusion: always
---

# TypeScript Patterns

## Imports
```typescript
// Path aliases — always use, never relative
import { Tower } from '@objects/Tower';
import type { ITower } from '@objects/Tower.interface'; // type-only when only used as type
```

## Required: Explicit return types on public functions
```typescript
export function createTower(x: number, y: number): Tower { ... }  // ✅
export function createTower(x: number, y: number) { ... }         // ❌
```

## Unused parameters — prefix with `_`
```typescript
public update(_deltaTime: number): void { ... }
```

## Const objects — use `as const`
```typescript
export const TOWER_TYPES = { SNIPER: 'sniper', FLAME: 'flame' } as const;
export type TowerType = (typeof TOWER_TYPES)[keyof typeof TOWER_TYPES];
```

## Events — discriminated unions
```typescript
type GameEvent =
  | { type: 'zombieKilled'; id: number; reward: number }
  | { type: 'waveComplete'; wave: number };
```

## Null safety — always check indexed access
```typescript
const item = items[i];
if (item !== undefined) { item.doThing(); }  // ✅
// or: items[i]?.doThing();
```

## Interface vs Type
- `interface` — object shapes (extendable)
- `type` — unions, intersections, primitives
