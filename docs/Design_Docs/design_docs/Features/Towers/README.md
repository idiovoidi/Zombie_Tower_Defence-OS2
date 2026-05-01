# Tower Documentation

## Overview

This directory contains all design documentation for the Z-TD tower system. Towers are the primary defensive structures players use to combat zombie waves.

---

## Current Tower Types

### 1. Machine Gun Tower

- **Role:** Balanced all-rounder
- **Damage:** Medium
- **Fire Rate:** Fast (10 shots/second)
- **Range:** Medium (180 pixels)
- **Special:** Reliable consistent damage

### 2. Sniper Tower

- **Role:** High single-target damage
- **Damage:** Very High
- **Fire Rate:** Slow (0.5 shots/second)
- **Range:** Very Long (300 pixels)
- **Special:** Long range precision

### 3. Shotgun Tower

- **Role:** Close-range area denial
- **Damage:** High (7 pellets)
- **Fire Rate:** Slow (0.8 shots/second)
- **Range:** Short (120 pixels)
- **Special:** Cone spread pattern

### 4. Flame Tower

- **Role:** Continuous area damage
- **Damage:** Medium over time
- **Fire Rate:** Continuous
- **Range:** Medium (150 pixels)
- **Special:** Fire damage over time

### 5. Tesla Tower

- **Role:** Chain lightning specialist
- **Damage:** Medium
- **Fire Rate:** Medium (2 shots/second)
- **Range:** Medium (180 pixels)
- **Special:** Chains to multiple targets, bonus vs Mechanical zombies

---

## Documents in This Directory

### [IMPROVEMENTS.md](./IMPROVEMENTS.md)

**Purpose:** Consolidated tower improvement suggestions

**Contents:**

- Quick wins (high impact, low effort)
- Medium effort improvements
- Advanced features
- Tower-specific improvements
- Universal improvements
- Implementation priority
- Balance adjustments

**Use this when:**

- Planning tower enhancements
- Prioritizing features
- Understanding improvement roadmap

---

### [IDEAS.md](./IDEAS.md)

**Purpose:** Future tower type ideas and concepts

**Contents:**

- New tower type proposals
- Experimental mechanics
- Advanced tower concepts
- Community suggestions

**Use this when:**

- Brainstorming new towers
- Expanding tower roster
- Exploring new mechanics

---

### [PROGRESSION_DESIGN.md](./PROGRESSION_DESIGN.md)

**Purpose:** Visual progression system for tower upgrades

**Contents:**

- Level 1-5 visual evolution
- Tower-specific progression
- Design philosophy
- Upgrade star system
- Material and theme consistency

**Use this when:**

- Implementing tower visuals
- Understanding upgrade progression
- Designing new tower appearances

---

### Implementation Files

#### GRENADE_TOWER_IMPLEMENTATION.md

Implementation details for grenade tower mechanics

#### GrenadeTower.md

Design specification for grenade tower

#### SHOTGUN_BURST_FIRE.md

Burst fire mechanic for shotgun tower

#### SludgeTower.md

Design specification for sludge tower

#### TESLA_CHAIN_LIGHTNING.md

Chain lightning mechanic for Tesla tower

---

## Tower System Architecture

### Core Components

**Tower Base Class** (`src/objects/Tower.ts`)

- Health management
- Targeting system
- Upgrade system
- Visual rendering
- Combat integration

**Tower Factory** (`src/managers/TowerFactory.ts`)

- Tower creation
- Type registration
- Configuration management

**Tower Placement Manager** (`src/managers/TowerPlacementManager.ts`)

- Placement validation
- Grid management
- Tower lifecycle

**Tower Combat Manager** (`src/managers/TowerCombatManager.ts`)

- Targeting logic
- Damage calculation
- Special effects (Tesla, Flame, etc.)

---

## Tower Upgrade System

### Levels 1-5

Each tower has 5 upgrade levels:

**Level 1-2:** Makeshift/Scavenged

- Basic functionality
- Rusty, weathered appearance
- Low cost

**Level 3:** Reinforced/Improved

- Enhanced stats
- Cleaner construction
- Medium cost

**Level 4:** Professional/Military

- Strong stats
- Military-grade appearance
- High cost

**Level 5:** Elite/Custom

- Maximum stats
- Custom modifications
- Very high cost

### Upgrade Costs

Costs increase exponentially:

- Level 2: Base cost × 1.5
- Level 3: Base cost × 2.25
- Level 4: Base cost × 3.375
- Level 5: Base cost × 5.0625

### Stat Scaling

Most stats scale by 50% per level:

- Damage: +50% per level
- Range: +10% per level
- Fire Rate: +20% per level

---

## Tower Placement Rules

### Valid Placement

- Must be on grass tiles
- Cannot overlap with path
- Cannot overlap with other towers
- Must be within buildable area
- Requires sufficient resources

### Grid System

- 64×64 pixel grid
- Towers occupy 1 grid cell
- Visual ghost preview during placement
- Red tint for invalid placement
- Green tint for valid placement

---

## Tower Targeting System

### Default Targeting

Towers target the first zombie in range by default.

### Proposed Targeting Modes

- **First:** Target first zombie in range
- **Last:** Target zombie closest to exit
- **Strongest:** Target highest HP zombie
- **Weakest:** Target lowest HP zombie
- **Fastest:** Target fastest zombie
- **Closest:** Target closest zombie
- **Mechanical:** Prioritize mechanical zombies (Tesla)

---

## Tower Special Mechanics

### Machine Gun

- Rapid fire with consistent damage
- Proposed: Ammo belt mechanic with reload

### Sniper

- High single-shot damage
- Long range precision
- Proposed: Headshot critical hits

### Shotgun

- Cone spread pattern (7 pellets)
- Short range area damage
- Proposed: Knockback effect

### Flame Tower

- Continuous fire damage
- Damage over time effect
- Proposed: Burning ground patches

### Tesla Tower

- Chain lightning to multiple targets
- Chains increase with level (1-5 targets)
- 1.8x damage vs Mechanical zombies
- Proposed: Smart chaining, overcharge mechanic

---

## Resource Costs

### Base Costs

- Machine Gun: $300
- Sniper: $1000
- Shotgun: $500
- Flame: $750
- Tesla: $1200

### Sell Value

Towers sell for 75% of total investment (base + upgrades)

---

## Performance Considerations

### Optimization

- Dirty flags for zombie/tower arrays
- Efficient targeting algorithms
- Particle effect pooling
- Maximum effect limits

### Memory Management

- Proper cleanup on tower destruction
- Timer tracking for effects
- Graphics object disposal

---

## Future Enhancements

### Planned Features

1. Tower veterancy system (kill tracking)
2. Manual abilities with cooldowns
3. Tower synergy bonuses
4. Upgrade visual progression
5. Critical hit system
6. Enhanced particle effects
7. Survivor personalities
8. Environmental interaction

### Under Consideration

1. Ammo/resource management (optional mode)
2. Tower rotation control
3. Contextual placement bonuses
4. Achievement integration
5. Tower presets/loadouts

---

## Related Documentation

### Core Systems

- [Memory Management](../../Core_Systems/Memory_Management/README.md) - Cleanup patterns
- [Performance](../../Core_Systems/Performance/README.md) - Optimization guides

### Other Features

- [Zombies](../Zombies/README.md) - Enemy types and mechanics
- [Combat](../Combat/README.md) - Damage calculation and effects
- [UI](../UI/README.md) - Tower shop and selection UI

### Archived Implementations

- [Tower Visual Redesign](../../Archive/Towers/TOWER_REDESIGN.md) - Little men with guns implementation
- [Tower Selection Fix](../../Archive/Towers/TOWER_SELECTION_FIX.md) - Selection system improvements
- [Tower Visual Upgrades](../../Archive/Towers/TOWER_UPGRADES_VISUAL.md) - Upgrade progression visuals

---

## Implementation Status

### Completed

- ✅ Basic tower system
- ✅ 5 tower types implemented
- ✅ Upgrade system (5 levels)
- ✅ Visual progression (stars)
- ✅ Placement system
- ✅ Targeting system
- ✅ Special mechanics (Tesla chain, Shotgun spread, Flame DoT)

### In Progress

- 🔄 Enhanced visual effects
- 🔄 Particle system improvements
- 🔄 Audio feedback

### Planned

- 📋 Tower veterancy
- 📋 Manual abilities
- 📋 Tower synergies
- 📋 Critical hit system
- 📋 Upgrade visual progression
- 📋 Survivor personalities

---

**Last Updated:** October 25, 2025
**Status:** Active Development
