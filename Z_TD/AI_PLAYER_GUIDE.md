# AI Player Guide

## Overview

The AI Player is a basic automated system that plays the game for you, useful for quickly testing game balance and tower effectiveness without manual intervention.

## How to Use

1. **Start the game** - Load any level
2. **Click the robot icon button** on the left side of the screen (floating panel)
3. The button will turn green and show "ON"
4. The AI will automatically:
   - Place and upgrade towers
   - Progress to the next wave (2 second delay after wave complete)
   - Log performance metrics every 10 seconds
5. Click the button again to disable the AI and see the final report

## AI Strategy

The AI follows a simple but effective strategy focused on building diverse tower compositions:

### Tower Placement

- Places towers at pre-defined strategic zones
- Prioritizes corners and choke points (higher priority zones)
- Maintains minimum distance from other towers
- Avoids placing towers on the path

### Tower Selection Strategy

**Target Composition (All Waves):**
- 40% Machine Gun (DPS backbone)
- 25% Sniper (high damage, long range)
- 15% Shotgun (area damage)
- 10% Tesla (chain lightning)
- 10% Flame (damage over time)

**Wave-Based Unlocks:**
- Wave 1+: Machine Gun (minimum 2 for early defense)
- Wave 3+: Sniper towers
- Wave 5+: Shotgun towers
- Wave 7+: Tesla towers
- Wave 9+: Flame towers

The AI builds towers to maintain these target ratios, ensuring a balanced and diverse defense from the start

### Upgrade Strategy

- Upgrades towers when money exceeds $200
- Prioritizes:
  1. Sniper towers (highest value)
  2. Tesla towers
  3. Shotgun towers
  4. Lower-level towers (spreads upgrades evenly)
- Never upgrades beyond max level

### Wave Progression

- Automatically starts the next wave after completion
- 2 second delay between waves (allows for brief analysis)
- Continues until game over or AI is disabled

### Decision Timing

- Makes decisions every 1 second
- Checks upgrade opportunities before placing new towers
- Balances between building new towers and upgrading existing ones

## Strategic Placement Zones

The AI uses 15 pre-defined zones optimized for the default map:

**High Priority Zones (14-15):**
- Corners where zombies turn (maximum coverage)

**Medium Priority Zones (10-13):**
- Path segments with good coverage
- Secondary corner positions

**Low Priority Zones (7-9):**
- Additional coverage areas
- Gap fillers

## Limitations

This is a **basic AI** designed for testing, not competitive play:

- Uses fixed placement zones (doesn't adapt to different maps)
- Simple decision-making (no complex strategy)
- No resource management (wood, metal, energy)
- Doesn't react to specific zombie types
- Doesn't optimize tower positioning dynamically

## Performance Logging

The AI automatically logs detailed performance metrics:

### Periodic Reports (Every 10 seconds)
- Current wave and highest wave reached
- Lives remaining and lives lost
- Money available and total spent
- Towers built and upgraded
- Tower composition breakdown with percentages

### Final Report (When AI is disabled)
- Session duration
- Highest wave reached
- Survival rate percentage
- Total money spent
- Average build rate (towers/minute)
- Complete tower composition
- Performance rating (⭐ to ⭐⭐⭐⭐⭐)
- Defense rating (🛡️ Perfect to ❌ Weak)

All logs are prefixed with 🤖 for easy filtering in the console.

## Use Cases

Perfect for:
- **Balance Testing** - See how far the AI can progress with detailed metrics
- **Tower Effectiveness** - Compare different tower combinations via composition logs
- **Wave Difficulty** - Test if waves are too easy/hard based on survival rates
- **Alpha Testing** - Automated playtesting with comprehensive performance data
- **Regression Testing** - Verify game balance after changes

## UI Location

The AI control panel is a floating button on the **left side** of the screen:
- Position: Bottom left, similar to Wave Info panel
- Icon: Robot face with antenna
- Status: Shows "ON" (green) or "OFF" (gray)
- Always visible during gameplay

## Console Commands

You can also control the AI via console:

```javascript
// Enable AI
gameManager.getAIPlayerManager().setEnabled(true);

// Disable AI
gameManager.getAIPlayerManager().setEnabled(false);

// Check if AI is enabled
gameManager.getAIPlayerManager().isEnabled();

// Reset AI state
gameManager.getAIPlayerManager().reset();

// Get current stats
gameManager.getAIPlayerManager().getStats();
```

## Future Improvements

Potential enhancements for the AI:

- Dynamic zone calculation based on actual map paths
- Resource management integration
- Zombie type awareness (build counters)
- Adaptive difficulty (adjust strategy based on performance)
- Multiple AI personalities (aggressive, defensive, balanced)
- Machine learning integration for optimal play

---

_The AI is intentionally simple to make balance testing straightforward. A perfect AI would make it hard to identify game balance issues!_
