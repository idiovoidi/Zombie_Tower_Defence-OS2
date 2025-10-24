# Zombie Documentation

## Overview

This directory contains all design documentation for the Z-TD zombie system. Zombies are the primary enemies that players must defend against using towers.

---

## Current Zombie Types

### 1. Basic Zombie
- **HP:** 100
- **Speed:** 30 pixels/second
- **Damage:** 10
- **Special:** None (standard zombie)
- **Visual:** Green-gray, shambling gait

### 2. Fast Zombie
- **HP:** 60
- **Speed:** 60 pixels/second
- **Damage:** 5
- **Special:** High speed, low health
- **Visual:** Lean, hunched, rapid movement

### 3. Tank Zombie
- **HP:** 300
- **Speed:** 20 pixels/second
- **Damage:** 20
- **Special:** High health, slow
- **Visual:** Large, bulky, heavy

### 4. Armored Zombie
- **HP:** 150
- **Speed:** 25 pixels/second
- **Damage:** 15
- **Special:** Damage resistance
- **Visual:** Metal plating, industrial look

### 5. Swarm Zombie
- **HP:** 40
- **Speed:** 35 pixels/second
- **Damage:** 5
- **Special:** Spawns in groups
- **Visual:** Small, numerous

### 6. Stealth Zombie
- **HP:** 80
- **Speed:** 40 pixels/second
- **Damage:** 12
- **Special:** Harder to target
- **Visual:** Dark, shadowy

### 7. Mechanical Zombie
- **HP:** 120
- **Speed:** 35 pixels/second
- **Damage:** 15
- **Special:** Weak to Tesla (1.8x damage)
- **Visual:** Robotic parts, exposed wiring

---

## Documents in This Directory

### Visual Reference Documents

#### BASIC_ZOMBIE_VISUAL_REFERENCE.md
Visual design specification for basic zombie type

#### FAST_ZOMBIE_VISUAL_REFERENCE.md
Visual design specification for fast zombie type

#### TANK_ZOMBIE_VISUAL_REFERENCE.md
Visual design specification for tank zombie type

#### ARMORED_ZOMBIE_VISUAL_REFERENCE.md
Visual design specification for armored zombie type

### Design Documents

#### BASIC_ZOMBIE_DESIGN.md
Complete design specification for basic zombie mechanics and visuals

#### ZOMBIE_REFERENCE.md
Comprehensive reference for all zombie types

#### Zombie_Strength&Weakness.md
Combat modifiers and damage type effectiveness

#### IMPLEMENTATION_STATUS.md
Current implementation status of zombie features

### Technical Documents

#### ZOMBIE_RENDERER_CREATION_GUIDE.md
Guide for creating new zombie renderers

#### SPACING_AND_VISIBILITY_IMPROVEMENTS.md
Improvements to zombie spacing and visual clarity

#### ENVIRONMENT_REDESIGN.md
Technical plan for zombie and environment visual redesign

#### corpse_redesign_complete.md
Completed corpse system redesign documentation

---

## Zombie System Architecture

### Core Components

**Zombie Base Class** (`src/objects/Zombie.ts`)
- Health management
- Movement along path
- Damage handling
- Death handling
- Visual rendering

**Zombie Manager** (`src/managers/ZombieManager.ts`)
- Zombie spawning
- Zombie lifecycle
- Zombie array management
- Cleanup

**Zombie Factory** (`src/managers/ZombieFactory.ts`)
- Zombie creation
- Type registration
- Configuration management

**Zombie Renderers** (`src/renderers/zombies/`)
- Type-specific visual rendering
- Animation systems
- Particle effects

---

## Zombie Rendering System

### Renderer Architecture

```
src/renderers/zombies/
├── ZombieRenderer.ts          # Main renderer coordinator
├── ZombieAnimator.ts          # Animation state machine
├── ZombieParticleSystem.ts    # Blood, decay, sparks effects
├── types/
│   ├── BasicZombieRenderer.ts
│   ├── FastZombieRenderer.ts
│   ├── TankZombieRenderer.ts
│   ├── ArmoredZombieRenderer.ts
│   ├── SwarmZombieRenderer.ts
│   ├── StealthZombieRenderer.ts
│   └── MechanicalZombieRenderer.ts
└── components/
    ├── ZombieBodyParts.ts     # Reusable body part generators
    ├── ZombieEffects.ts       # Visual effects (glow, shadow, etc)
    └── ZombieHealthBar.ts     # Enhanced health bar component
```

### Visual Features

**Procedural Animation:**
- Limb swing using sine waves
- Body bobbing (vertical oscillation)
- Head sway (shambling effect)
- Type-specific animation speeds

**Particle Effects:**
- Blood splatters on damage
- Death particles
- Type-specific effects (sparks, shadows, etc.)

**Health Indicators:**
- Health bar above zombie
- Color-coded by health percentage
- Damage flash effect

---

## Zombie Spawning System

### Wave-Based Spawning

Zombies spawn in waves with increasing difficulty:
- Wave number determines zombie count
- Zombie types unlock progressively
- Spawn rate increases with waves
- Difficulty modifiers based on player performance

### Spawn Configuration

```typescript
interface ZombieSpawnConfig {
  type: ZombieType;
  count: number;
  spawnDelay: number;
  waveUnlock: number;
}
```

### Spawn Locations

Zombies spawn at the start of the path and follow waypoints to the exit.

---

## Zombie Combat System

### Damage Types

Zombies take different damage from different tower types:

**Basic Zombie:**
- Normal damage from all towers

**Fast Zombie:**
- Vulnerable to area damage
- Hard to hit with slow projectiles

**Tank Zombie:**
- Resistant to low damage
- Vulnerable to high single-shot damage

**Armored Zombie:**
- Damage resistance
- Vulnerable to armor-piercing

**Swarm Zombie:**
- Low individual health
- Vulnerable to area damage

**Stealth Zombie:**
- Harder to target
- Normal damage when hit

**Mechanical Zombie:**
- 1.8x damage from Tesla towers
- Normal damage from other towers

### Status Effects

**Burning (Flame Tower):**
- Damage over time
- Visual fire effect
- Spreads to nearby zombies

**Slowed (Sludge Tower):**
- Reduced movement speed
- Visual sludge effect
- Duration-based

**Electrified (Tesla Tower):**
- Chains to nearby zombies
- Visual electric effect
- Instant damage

---

## Zombie Death System

### Death Handling

When a zombie dies:
1. Death animation plays
2. Corpse is created
3. Blood particles spawn
4. Zombie is removed from active list
5. Kill count incremented

### Corpse System

**Corpse Manager** (`src/managers/CorpseManager.ts`)
- Creates corpse graphics
- Manages corpse lifecycle
- Fades corpses over time
- Limits max corpses (50)

**Corpse Features:**
- Type-specific appearance
- Fade out over 10-15 seconds
- Blood pool underneath
- Stacking visual effect

### Blood Particle System

**Blood Particle System** (`src/managers/BloodParticleSystem.ts`)
- Spawns blood particles on damage
- Manages particle lifecycle
- Fades particles over time
- Performance-optimized

---

## Zombie Pathfinding

### Waypoint System

Zombies follow a predefined path of waypoints:
1. Spawn at start waypoint
2. Move toward next waypoint
3. Rotate to face movement direction
4. Reach exit waypoint → damage player

### Movement

- Constant speed (type-specific)
- Smooth rotation toward target
- No collision with other zombies
- No pathfinding (follows fixed path)

---

## Performance Considerations

### Optimization

- Dirty flags for zombie arrays
- Efficient rendering (one draw call per zombie)
- Particle pooling
- Corpse limits
- Blood particle limits

### Memory Management

- Proper cleanup on zombie death
- Timer tracking for effects
- Graphics object disposal
- Renderer cleanup

---

## Future Enhancements

### Planned Features

1. More zombie types
2. Boss zombies
3. Zombie abilities
4. Environmental interactions
5. Dynamic pathfinding
6. Zombie formations
7. Special wave events

### Under Consideration

1. Zombie mutations
2. Zombie evolution
3. Zombie AI improvements
4. Zombie synergies
5. Zombie weaknesses system

---

## Related Documentation

### Core Systems
- [Memory Management](../../Core_Systems/Memory_Management/README.md) - Cleanup patterns
- [Performance](../../Core_Systems/Performance/README.md) - Optimization guides

### Other Features
- [Towers](../Towers/README.md) - Tower types and mechanics
- [Combat](../Combat/README.md) - Damage calculation and effects
- [Waves](../Waves/README.md) - Wave progression system

### Archived Implementations
- [Zombie Visual Enhancements](../../Archive/Zombies/ZOMBIE_ENHANCEMENTS_SUMMARY.md) - Blood particles and corpse system
- [Zombie Spawning](../../Archive/Zombies/ZOMBIE_SPAWNING.md) - Spawning and movement implementation
- [Zombie Visuals](../../Archive/Zombies/ZOMBIE_VISUALS.md) - Enhanced visual system details

---

## Implementation Status

### Completed
- ✅ 7 zombie types implemented
- ✅ Zombie rendering system
- ✅ Zombie spawning system
- ✅ Zombie pathfinding
- ✅ Zombie death system
- ✅ Corpse system
- ✅ Blood particle system
- ✅ Health bars
- ✅ Damage effects

### In Progress
- 🔄 Enhanced visual effects
- 🔄 Animation improvements
- 🔄 Particle system optimization

### Planned
- 📋 More zombie types
- 📋 Boss zombies
- 📋 Zombie abilities
- 📋 Environmental interactions
- 📋 Dynamic pathfinding

---

**Last Updated:** October 25, 2025
**Status:** Active Development
