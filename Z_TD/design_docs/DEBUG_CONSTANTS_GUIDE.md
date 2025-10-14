# Debug Constants Guide

## Overview
The `src/config/debugConstants.ts` file provides an easy way to modify game values for testing and debugging without changing the core game code.

## Quick Start

### 1. Enable Debug Mode
```typescript
// In src/config/debugConstants.ts
export const DebugConstants = {
  ENABLED: true,  // Set to false to disable all debug modifications
  // ...
}
```

### 2. Modify Values
Simply change the values you want to test:

```typescript
// Example: Testing with lots of money
STARTING_MONEY: 10000,  // Default: 500

// Example: Make towers super powerful
TOWER_DAMAGE_MULTIPLIER: 5.0,  // 5x damage

// Example: Make zombies easier
ZOMBIE_HEALTH_MULTIPLIER: 0.1,  // 10% health
```

### 3. Reload the Game
Changes take effect when you restart the game (`npm run dev`).

## Common Testing Scenarios

### Testing Tower Placement
```typescript
STARTING_MONEY: 50000,
TOWER_COST_MULTIPLIER: 0,  // Free towers
INSTANT_TOWER_PLACEMENT: true,
```

### Testing Tower Upgrades
```typescript
STARTING_MONEY: 100000,
UPGRADE_COST_MULTIPLIER: 0,  // Free upgrades
INSTANT_UPGRADES: true,
```

### Testing Late Game Waves
```typescript
START_AT_WAVE: 10,
STARTING_MONEY: 50000,
TOWER_DAMAGE_MULTIPLIER: 3.0,
```

### Testing Zombie Behavior
```typescript
ZOMBIE_HEALTH_MULTIPLIER: 10.0,  // Tanky zombies
ZOMBIE_SPEED_MULTIPLIER: 0.3,  // Slow zombies
ZOMBIE_SPAWN_RATE_MULTIPLIER: 0.1,  // Few zombies
```

### Speed Testing
```typescript
GAME_SPEED_MULTIPLIER: 3.0,  // 3x speed
SKIP_WAVE_COMPLETE_SCREEN: true,
WAVE_DELAY: 1000,  // 1 second between waves
```

### Visual Debugging
```typescript
SHOW_TOWER_RANGES: true,
SHOW_ZOMBIE_HEALTH_BARS: true,
SHOW_WAYPOINTS: true,
SHOW_COLLISION_BOXES: true,
```

### God Mode Testing
```typescript
STARTING_MONEY: 999999,
STARTING_LIVES: 999,
TOWER_COST_MULTIPLIER: 0,
TOWER_DAMAGE_MULTIPLIER: 10.0,
INVINCIBLE_TOWERS: true,
DISABLE_GAME_OVER: true,
ONE_HIT_KILL: true,
```

## Available Constants

### Resources
- `STARTING_MONEY` - Initial money amount
- `STARTING_LIVES` - Initial lives
- `STARTING_WOOD` - Initial wood resource
- `STARTING_METAL` - Initial metal resource
- `STARTING_ENERGY` - Initial energy resource
- `WOOD_GENERATION_RATE` - Wood per second
- `METAL_GENERATION_RATE` - Metal per second
- `ENERGY_GENERATION_RATE` - Energy per second

### Tower Costs
- `TOWER_COST_MULTIPLIER` - Multiply all tower costs (0 = free)
- `UPGRADE_COST_MULTIPLIER` - Multiply all upgrade costs (0 = free)

### Tower Stats
- `TOWER_DAMAGE_MULTIPLIER` - Multiply tower damage
- `TOWER_RANGE_MULTIPLIER` - Multiply tower range
- `TOWER_FIRE_RATE_MULTIPLIER` - Multiply tower fire rate

### Zombie Stats
- `ZOMBIE_HEALTH_MULTIPLIER` - Multiply zombie health
- `ZOMBIE_SPEED_MULTIPLIER` - Multiply zombie speed
- `ZOMBIE_SPAWN_RATE_MULTIPLIER` - Multiply spawn rate

### Wave Settings
- `START_AT_WAVE` - Start at specific wave number
- `WAVE_DELAY` - Milliseconds between waves
- `SKIP_WAVE_COMPLETE_SCREEN` - Auto-start next wave

### Game Speed
- `GAME_SPEED_MULTIPLIER` - Overall game speed (1.0 = normal)

### Instant Actions
- `INSTANT_TOWER_PLACEMENT` - No placement validation
- `INSTANT_UPGRADES` - Upgrades are instant and free
- `INVINCIBLE_TOWERS` - Towers can't be damaged
- `ONE_HIT_KILL` - All zombies die in one hit

### Visual Debug
- `SHOW_TOWER_RANGES` - Always show tower ranges
- `SHOW_ZOMBIE_HEALTH_BARS` - Show health bars
- `SHOW_WAYPOINTS` - Show path waypoints
- `SHOW_COLLISION_BOXES` - Show collision boundaries

### Testing Shortcuts
- `UNLOCK_ALL_TOWERS` - All tower types available
- `UNLOCK_ALL_LEVELS` - All levels available
- `DISABLE_GAME_OVER` - Can't lose
- `AUTO_WIN_WAVES` - Automatically complete waves

## Helper Functions

The file also provides helper functions for applying multipliers:

```typescript
import { getDebugTowerCost, getDebugTowerDamage } from './config/debugConstants';

// Use in your code
const cost = getDebugTowerCost(100);  // Returns 10 if multiplier is 0.1
const damage = getDebugTowerDamage(50);  // Returns 100 if multiplier is 2.0
```

## Tips

1. **Start Small**: Change one value at a time to understand its impact
2. **Use Multipliers**: Multipliers (like 0.5 or 2.0) are easier to reason about than absolute values
3. **Disable When Done**: Set `ENABLED: false` when you're done testing
4. **Commit Carefully**: Don't commit debug values to production!

## Integration

To fully integrate debug constants into the game, you'll need to:

1. Import in GameManager and apply starting values
2. Use helper functions in TowerManager for costs/stats
3. Use helper functions in ZombieFactory for zombie stats
4. Apply multipliers in relevant managers

Example integration in GameManager:
```typescript
import { DebugConstants, applyDebugConstants } from './config/debugConstants';

constructor(app: Application) {
  // ... existing code ...
  
  // Apply debug constants if enabled
  if (DebugConstants.ENABLED) {
    applyDebugConstants(this);
  }
}
```

## Notes

- Debug constants only apply when `ENABLED: true`
- Changes require a game restart to take effect
- Some constants may need additional integration in game managers
- Visual debug options may impact performance
