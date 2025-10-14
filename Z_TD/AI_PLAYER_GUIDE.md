# AI Player Guide

## Overview

The AI Player is a basic automated system that plays the game for you, useful for quickly testing game balance and tower effectiveness without manual intervention.

## How to Use

1. **Start the game** - Load any level
2. **Click the "AI: OFF" button** in the bottom bar (left side)
3. The button will turn green and show "AI: ON"
4. The AI will automatically place and upgrade towers
5. Click the button again to disable the AI

## AI Strategy

The AI follows a simple but effective strategy:

### Tower Placement

- Places towers at pre-defined strategic zones
- Prioritizes corners and choke points (higher priority zones)
- Maintains minimum distance from other towers
- Avoids placing towers on the path

### Tower Selection by Wave

**Early Game (Waves 1-5):**
- Focuses on Machine Gun towers
- Builds economy with consistent kills

**Mid Game (Waves 6-10):**
- Primarily Machine Gun towers
- Adds 1-2 Sniper towers once 3+ Machine Guns are placed

**Late Game (Wave 11+):**
- Diverse tower mix with priority order:
  1. Sniper (max 3)
  2. Shotgun (max 2)
  3. Tesla (max 2)
  4. Machine Gun (unlimited)
  5. Flame (max 1)

### Upgrade Strategy

- Upgrades towers when money exceeds $200
- Prioritizes:
  1. Sniper towers (highest value)
  2. Tesla towers
  3. Shotgun towers
  4. Lower-level towers (spreads upgrades evenly)
- Never upgrades beyond max level

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

## Use Cases

Perfect for:
- **Balance Testing** - See how far the AI can progress
- **Tower Effectiveness** - Compare different tower combinations
- **Wave Difficulty** - Test if waves are too easy/hard
- **Performance Testing** - Run the game at high speed
- **AFK Farming** - Let the AI play while you do other things

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
