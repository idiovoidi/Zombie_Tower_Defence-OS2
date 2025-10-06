# Wave Progression Guide - Zombie Variety & Difficulty

## Overview

The game features a comprehensive wave progression system with **7 different zombie types** that are introduced gradually as waves progress. The system includes dynamic difficulty adjustment based on player performance.

## Zombie Types Available

1. **Basic Zombie** 🧟 - Green, standard stats
2. **Fast Zombie** 🏃 - Orange, quick movement
3. **Tank Zombie** 💪 - Red, high health
4. **Armored Zombie** 🛡️ - Gray, damage resistant
5. **Swarm Zombie** 🐝 - Yellow, numerous but weak
6. **Stealth Zombie** 👻 - Purple, fast and evasive
7. **Mechanical Zombie** 🤖 - Cyan, robotic threat

## Wave Progression Breakdown

### **Waves 1-5: Early Game** (Tutorial Phase)
**Zombie Mix:**
- 80% Basic Zombies
- 20% Fast Zombies

**Total Zombies:** 10-17 zombies
**Spawn Interval:** 1.5-2.0 seconds
**Difficulty:** Learning the basics

**Strategy:**
- Focus on Machine Gun towers
- Learn tower placement
- Build economy

---

### **Waves 6-10: Mid-Early Game** (First Challenge)
**Zombie Mix:**
- 60% Basic Zombies
- 30% Fast Zombies
- 10% Tank Zombies ⚠️ NEW

**Total Zombies:** 27-35 zombies
**Spawn Interval:** 1.3-3.0 seconds
**Difficulty:** Tank zombies require sustained fire

**Strategy:**
- Upgrade existing towers
- Add Sniper towers for Tanks
- Maintain economy

---

### **Waves 11-15: Mid Game** (Complexity Increases)
**Zombie Mix:**
- 50% Basic Zombies
- 30% Fast Zombies
- 15% Tank Zombies
- 5% Armored Zombies ⚠️ NEW

**Total Zombies:** 42-57 zombies
**Spawn Interval:** 1.2-3.5 seconds
**Difficulty:** Armored zombies add variety

**Strategy:**
- Diversify tower types
- Focus on upgrades
- Consider Shotgun towers

---

### **Waves 16-20: Late-Mid Game** (Swarm Tactics)
**Zombie Mix:**
- 40% Basic Zombies
- 25% Fast Zombies
- 20% Tank Zombies
- 10% Armored Zombies
- 5% Swarm Zombies ⚠️ NEW

**Total Zombies:** 73-95 zombies
**Spawn Interval:** 1.0-3.0 seconds
**Difficulty:** Swarm zombies overwhelm with numbers

**Strategy:**
- Flame towers for swarms
- Multiple upgraded towers
- Strong economy needed

---

### **Waves 21-25: Late Game** (Stealth Threat)
**Zombie Mix:**
- 35% Basic Zombies
- 20% Fast Zombies
- 20% Tank Zombies
- 15% Armored Zombies
- 5% Swarm Zombies
- 5% Stealth Zombies ⚠️ NEW

**Total Zombies:** 103-133 zombies
**Spawn Interval:** 0.8-2.8 seconds
**Difficulty:** Stealth zombies are fast and evasive

**Strategy:**
- High-level towers required
- Tesla towers for groups
- Multiple defensive lines

---

### **Waves 26-30: End Game** (Heavy Assault)
**Zombie Mix:**
- 30% Basic Zombies
- 15% Fast Zombies
- 20% Tank Zombies
- 20% Armored Zombies
- 10% Swarm Zombies
- 5% Stealth Zombies

**Total Zombies:** 139-174 zombies
**Spawn Interval:** 0.7-2.5 seconds
**Difficulty:** Heavy armored presence

**Strategy:**
- Maxed tower upgrades
- Strategic placement critical
- Resource management key

---

### **Waves 31-35: Post-Game** (Mechanical Age)
**Zombie Mix:**
- 25% Basic Zombies
- 15% Fast Zombies
- 15% Tank Zombies
- 20% Armored Zombies
- 15% Swarm Zombies
- 5% Stealth Zombies
- 5% Mechanical Zombies ⚠️ NEW

**Total Zombies:** 179-217 zombies
**Spawn Interval:** 0.6-2.2 seconds
**Difficulty:** Mechanical zombies add tech threat

**Strategy:**
- All tower types needed
- Perfect placement required
- Maximum upgrades essential

---

### **Waves 36-40: Expert** (All Types Active)
**Zombie Mix:**
- 20% Basic Zombies
- 10% Fast Zombies
- 15% Tank Zombies
- 20% Armored Zombies
- 15% Swarm Zombies
- 10% Stealth Zombies
- 10% Mechanical Zombies

**Total Zombies:** 225-265 zombies
**Spawn Interval:** 0.5-2.0 seconds
**Difficulty:** All zombie types in force

**Strategy:**
- Optimized tower network
- No weak points allowed
- Expert-level play required

---

### **Waves 41-50: Master** (Ultimate Challenge)
**Zombie Mix:**
- 15% Basic Zombies
- 10% Fast Zombies
- 10% Tank Zombies
- 20% Armored Zombies
- 20% Swarm Zombies
- 15% Stealth Zombies
- 10% Mechanical Zombies

**Total Zombies:** 306-548 zombies
**Spawn Interval:** 0.4-1.8 seconds
**Difficulty:** Maximum challenge

**Strategy:**
- Perfect execution required
- All systems optimized
- Master-level gameplay

---

## Scaling Mechanics

### Health Scaling
```
Zombie Health = Base Health + (Wave × 1.8)
```

**Examples:**
- Wave 1 Basic: 100 HP
- Wave 10 Basic: 118 HP
- Wave 20 Basic: 136 HP
- Wave 50 Basic: 190 HP

### Damage Scaling
```
Zombie Damage = Base Damage + (Wave × 1.5 × Difficulty Modifier)
```

**Examples:**
- Wave 1 Basic: 10 damage
- Wave 10 Basic: 25 damage
- Wave 20 Basic: 40 damage

### Spawn Rate Scaling
```
Spawn Interval = Base Interval × (0.95 ^ Wave) × Difficulty Modifier
Minimum: 0.5 seconds
```

### Count Scaling
```
Zombie Count = Base Count × (1.08 ^ Wave) × Difficulty Modifier
Wave 5, 10, 15, etc.: +20% spike
```

## Dynamic Difficulty System

### Performance Tracking
- **Kill Rate**: % of zombies eliminated
- **Lives Lost**: Damage taken
- **Resource Efficiency**: Economy management

### Difficulty Adjustments

**Struggling Players (< 60% kill rate):**
- -10% zombie count
- Minimum modifier: 0.7 (30% reduction)

**Below Average (60-70% kill rate):**
- -15% zombie count
- Minimum modifier: 0.85 (15% reduction)

**Average (70-90% kill rate):**
- No adjustment
- Modifier: 1.0 (standard)

**Above Average (90-95% kill rate):**
- +10% zombie count
- Maximum modifier: 1.2 (20% increase)

**Expert Players (> 95% kill rate):**
- +5% additional difficulty
- Maximum modifier: 1.3 (30% increase)

## Zombie Type Introduction Schedule

| Wave Range | New Type Introduced | Total Types Active |
|------------|--------------------|--------------------|
| 1-5        | Basic, Fast        | 2                  |
| 6-10       | Tank               | 3                  |
| 11-15      | Armored            | 4                  |
| 16-20      | Swarm              | 5                  |
| 21-25      | Stealth            | 6                  |
| 31-35      | Mechanical         | 7                  |

## Spawn Queue System

### Features
- **Shuffled Spawning**: Zombie types are mixed for variety
- **Timed Delays**: Each zombie has specific spawn timing
- **Group Spawning**: Zombies spawn in swarms (40px radius)
- **Wave Completion**: Tracked when all zombies spawned and eliminated

### Spawn Patterns
- Early waves: Predictable, slower
- Mid waves: Mixed types, moderate speed
- Late waves: Chaotic, rapid spawning

## Strategy Tips by Wave Range

### Waves 1-10
- Build economy first
- Basic towers sufficient
- Learn zombie patterns
- Upgrade key towers

### Waves 11-20
- Diversify tower types
- Focus on upgrades
- Manage resources carefully
- Prepare for swarms

### Waves 21-30
- All tower types needed
- High-level upgrades essential
- Strategic placement critical
- Resource generation important

### Waves 31-40
- Optimized tower network
- Maximum upgrades
- Perfect placement
- Expert execution

### Waves 41-50
- Master-level play
- No mistakes allowed
- All systems optimized
- Ultimate challenge

## Current Implementation Status

✅ **Fully Implemented:**
- 7 zombie types with unique stats
- Wave progression system (50 waves)
- Dynamic difficulty adjustment
- Health/damage scaling
- Spawn rate scaling
- Shuffled spawn queue
- Swarm positioning
- Performance tracking

✅ **Active Systems:**
- WaveManager: Handles wave composition
- ZombieManager: Spawns and updates zombies
- ZombieFactory: Creates all zombie types
- Dynamic difficulty based on performance

## Testing the System

To see different zombie types:
1. Start a new game
2. Progress through waves
3. Wave 6: First Tank zombies appear
4. Wave 11: Armored zombies join
5. Wave 16: Swarm zombies appear
6. Wave 21: Stealth zombies arrive
7. Wave 31: Mechanical zombies activate

Or use the Zombie Bestiary (debug panel) to spawn specific types for testing!

---

_Last Updated: Current Build_  
_For implementation details, see `src/managers/WaveManager.ts` and `src/managers/ZombieManager.ts`_
