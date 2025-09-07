# Wave Manager Design Document

## 1. Overview

The Wave Manager is a core component of the Zombie Tower Defense game responsible for managing zombie wave progression, difficulty scaling, and zombie composition throughout the game. It implements a progressive difficulty curve by carefully balancing zombie types, health, damage, and spawn rates across 50+ waves.

The Wave Manager follows a data-driven design pattern where wave parameters are defined algorithmically and processed to create dynamic gameplay experiences. It interfaces with the GameManager for state coordination, ZombieFactory for zombie instantiation, and game configuration for constants.

## 2. Architecture

### 2.1 Component Structure

The Wave Manager is implemented as a standalone class with no direct dependencies on other game systems except for configuration constants. It maintains internal state for the current wave, wave data, player performance metrics, and difficulty modifiers.

The Wave Manager connects to:
- Game configuration for zombie type constants
- Zombie Factory for creating zombie instances
- Game Manager for state coordination
- Zombie entities and their components (Health, Transform)

### 2.2 Class Design

The WaveManager class contains:
- Current wave tracking
- Wave data storage using a Map structure
- Player performance metrics
- Difficulty modifier for adaptive scaling

It provides methods for:
- Getting current wave zombies
- Advancing to the next wave
- Calculating zombie health and damage
- Updating performance metrics
- Calculating spawn rates and zombie counts

## 3. Wave Composition and Progression

### 3.1 Wave Progression Flow

The Wave Manager implements a progressive difficulty curve through carefully designed wave compositions that evolve as players advance. Each wave range introduces new zombie types and adjusts the proportions of existing types to create escalating challenges.

Progression follows this pattern:
- Waves 1-5: 80% Basic, 20% Fast
- Waves 6-10: 60% Basic, 30% Fast, 10% Tank
- Waves 11-15: 50% Basic, 30% Fast, 15% Tank, 5% Armored
- Waves 16-20: 40% Basic, 25% Fast, 20% Tank, 10% Armored, 5% Swarm
- Waves 21-25: 35% Basic, 20% Fast, 20% Tank, 15% Armored, 5% Swarm, 5% Stealth
- Waves 26-30: 30% Basic, 15% Fast, 20% Tank, 20% Armored, 10% Swarm, 5% Stealth
- Waves 31-35: 25% Basic, 15% Fast, 15% Tank, 20% Armored, 15% Swarm, 5% Stealth, 5% Mechanical
- Waves 36-40: 20% Basic, 10% Fast, 15% Tank, 20% Armored, 15% Swarm, 10% Stealth, 10% Mechanical
- Waves 41+: 15% Basic, 10% Fast, 10% Tank, 20% Armored, 20% Swarm, 15% Stealth, 10% Mechanical

### 3.2 Wave Tiers and Composition

| Wave Range | Basic | Fast | Tank | Armored | Swarm | Stealth | Mechanical |
|------------|-------|------|------|---------|-------|---------|------------|
| 1–5 | 80% | 20% | - | - | - | - | - |
| 6–10 | 60% | 30% | 10% | - | - | - | - |
| 11–15 | 50% | 30% | 15% | 5% | - | - | - |
| 16–20 | 40% | 25% | 20% | 10% | 5% | - | - |
| 21–25 | 35% | 20% | 20% | 15% | 5% | 5% | - |
| 26–30 | 30% | 15% | 20% | 20% | 10% | 5% | - |
| 31–35 | 25% | 15% | 15% | 20% | 15% | 5% | 5% |
| 36–40 | 20% | 10% | 15% | 20% | 15% | 10% | 10% |
| 41+ | 15% | 10% | 10% | 20% | 20% | 15% | 10% |

## 4. Zombie Spawning Lifecycle

### 4.1 Wave Execution Sequence

The wave execution follows this sequence:
1. Wave Manager retrieves current wave zombie groups
2. For each zombie group:
   - Calculate adjusted zombie count based on wave and difficulty
   - Calculate spawn rates with scaling applied
   - Spawn zombies at calculated intervals
3. Zombie Factory creates zombie instances with wave parameters
4. Zombies are initialized with wave-scaled stats and components
5. During gameplay, zombies update their position using pathfinding
6. When all zombies are eliminated, advance to next wave
7. GameManager is notified of wave completion for resource awards

### 4.2 Zombie Entity Creation

Zombie entities are created with appropriate components and initialized with wave-scaled attributes. The Zombie class serves as the base for all zombie types, providing common functionality while allowing specialization through inheritance.

## 5. Difficulty Scaling System

### 5.1 Health Scaling

Zombie health is calculated using a linear formula:

Health = BaseHealth + (WaveNumber × 1.8)

Each zombie type has a different base health value:
- **Basic Zombie**: 100 base health
- **Tank Zombie**: 500 base health
- **Swarm Zombie**: 50 base health

This ensures that tougher zombies scale from a higher baseline while all types grow stronger as waves progress.

### 5.2 Damage Scaling

Zombie damage follows a similar linear progression:

Damage = BaseDamage + (WaveNumber × 1.5 × DifficultyModifier)

The DifficultyModifier allows dynamic adjustment based on player performance, making the game harder or easier depending on how well the player is doing.

### 5.3 Spawn Frequency Scaling

Spawn intervals decrease exponentially to increase pressure:

SpawnInterval = BaseInterval × (0.95^WaveNumber) × DifficultyModifier

This results in faster spawns as waves progress, with a minimum interval of 0.5 seconds to prevent overwhelming spawn rates.

### 5.4 Zombie Count Scaling

The number of zombies per wave grows exponentially:

ZombieCount = BaseCount × (1.08^WaveNumber) × DifficultyModifier

Additionally, every 5th wave includes a 20% spike in zombie count to create periodic difficulty surges.

### 5.5 Adaptive Difficulty

The Wave Manager implements an adaptive difficulty system that adjusts based on player performance:

Process flow:
1. Start wave and get base stats
2. Apply wave scaling formulas
3. Apply difficulty modifier
4. Check if wave number is multiple of 5
5. If yes, apply 20% count bonus
6. If no, use scaled count
7. Instantiate zombies
8. Schedule spawns

The difficulty modifier responds to player performance:
- **Underperforming players** (kill rate < 70%): Reduced difficulty (modifier decreased by 15%)
- **Overperforming players** (kill rate > 90%): Increased challenge (modifier increased by 10%)
- **Consistently high performance** (kill rate > 95%): Additional difficulty boost (modifier increased by 5%)
- **Struggling players** (kill rate < 60% for 3 consecutive waves): Difficulty reduction (modifier decreased by 10%)

## 6. Zombie Types and Characteristics

### 6.1 Basic Zombie
- **Speed:** 50 pixels/second
- **Base Health:** 100
- **Base Damage:** 10
- **Reward:** 10 currency

### 6.2 Fast Zombie
- **Speed:** 100 pixels/second
- **Base Health:** 70
- **Base Damage:** 8
- **Reward:** 15 currency

### 6.3 Tank Zombie
- **Speed:** 25 pixels/second
- **Base Health:** 500
- **Base Damage:** 25
- **Reward:** 50 currency

### 6.4 Armored Zombie
- **Speed:** 40 pixels/second
- **Base Health:** 300
- **Base Damage:** 15
- **Reward:** 30 currency

### 6.5 Swarm Zombie
- **Speed:** 60 pixels/second
- **Base Health:** 50
- **Base Damage:** 5
- **Reward:** 5 currency

### 6.6 Stealth Zombie
- **Speed:** 70 pixels/second
- **Base Health:** 120
- **Base Damage:** 12
- **Reward:** 25 currency

### 6.7 Mechanical Zombie
- **Speed:** 55 pixels/second
- **Base Health:** 250
- **Base Damage:** 20
- **Reward:** 40 currency

## 7. Integration Points

### 7.1 GameManager Integration

The Wave Manager coordinates with the GameManager to:
- Track current wave number
- Transition between game states (WAVE_COMPLETE)
- Update player resources and score
- Handle wave progression events

### 7.2 ZombieFactory Integration

The Wave Manager works with the ZombieFactory to:
- Create zombie instances with appropriate parameters
- Apply wave-scaled stats to zombie entities
- Initialize zombie components (HealthComponent, TransformComponent)

### 7.3 Game Configuration

The Wave Manager uses constants from gameConfig.ts:
- Zombie type identifiers
- Game state constants
- Screen dimensions for spawn positioning

## 8. Performance Considerations

The Wave Manager implementation demonstrates good performance characteristics through:
- Efficient data structures (Map for wave data enabling O(1) lookup)
- Simple arithmetic operations for difficulty adjustments
- Pre-calculated wave data to avoid runtime computations

Potential performance improvements could include:
- Object pooling for zombie instances to reduce garbage collection overhead
- Caching of calculated values to avoid redundant computations
- Lazy initialization of wave data beyond the current progression

## 9. Troubleshooting Guide

### 9.1 Memory Leaks from Unremoved Zombies
**Issue**: Zombies not properly removed from the game scene can cause memory leaks.
**Solution**: Ensure zombies are removed when destroyed or reaching the end. Implement proper cleanup in the Zombie class destructor or removal methods.

### 9.2 Timing Inaccuracies in Spawn Intervals
**Issue**: Spawn intervals may not be precise due to frame rate variations.
**Solution**: Use delta time compensation in the spawning logic and consider implementing a more robust timing system.

### 9.3 Difficulty Scaling Issues
**Issue**: Players may find the game too easy or too difficult.
**Solution**: Adjust the scaling factors (1.8 for health, 1.5 for damage, 0.95 for spawn rate) and monitor player performance metrics to fine-tune the progression curve.
