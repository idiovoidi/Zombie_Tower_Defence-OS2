# Zombie Types Reference Guide

Complete reference for all zombie types in Z-TD, including stats, characteristics, and visual descriptions.

---

## 1. Basic Zombie 🧟

**Type ID:** `BASIC`  
**Color:** Green (`0x00ff00`)

### Stats
- **Base Health:** 100 HP (scales with wave)
- **Speed:** 50 pixels/second (Medium)
- **Reward:** $10
- **Damage:** 1 survivor
- **Size:** 10 pixels

### Characteristics
- Standard zombie type
- Balanced stats
- Most common in early waves
- Good for testing tower effectiveness

### Visual Description
- **Body:** Green humanoid shape
- **Head:** Round green circle
- **Arms:** Extended forward (classic zombie pose)
- **Legs:** Simple walking animation
- **Details:** Basic shambling appearance

### Wave Appearance
- Waves 1-5: 80% of zombies
- Waves 6-10: 60% of zombies
- Waves 11+: 50% of zombies

---

## 2. Fast Zombie 🏃

**Type ID:** `FAST`  
**Color:** Orange (`0xff6600`)

### Stats
- **Base Health:** 80 HP (scales with wave)
- **Speed:** 100 pixels/second (Fast)
- **Reward:** $15
- **Damage:** 1 survivor
- **Size:** 10 pixels

### Characteristics
- Quick runner
- Lower health than basic
- Harder to hit with slow-firing towers
- Dangerous in groups

### Visual Description
- **Body:** Orange/red humanoid shape
- **Head:** Smaller, streamlined
- **Posture:** Leaning forward (running pose)
- **Legs:** Rapid movement animation
- **Details:** Athletic, aggressive appearance

### Wave Appearance
- Waves 1-5: 20% of zombies
- Waves 6-10: 30% of zombies
- Waves 11+: 30% of zombies

---

## 3. Tank Zombie 💪

**Type ID:** `TANK`  
**Color:** Red (`0xff0000`)

### Stats
- **Base Health:** 300 HP (scales with wave)
- **Speed:** 25 pixels/second (Slow)
- **Reward:** $50
- **Damage:** 5 survivors (MASSIVE!)
- **Size:** 15 pixels (Large)

### Characteristics
- Extremely high health
- Very slow movement
- Requires sustained fire to eliminate
- High reward for killing

### Visual Description
- **Body:** Large, bulky red shape
- **Head:** Big, muscular
- **Build:** Wide shoulders, thick limbs
- **Posture:** Heavy, lumbering
- **Details:** Intimidating, powerful appearance

### Wave Appearance
- Waves 6-10: 10% of zombies
- Waves 11+: 15% of zombies

---

## 4. Armored Zombie 🛡️

**Type ID:** `ARMORED`  
**Color:** Gray (`0x888888`)

### Stats
- **Base Health:** 150 HP (scales with wave)
- **Speed:** 40 pixels/second (Medium-Slow)
- **Reward:** $30
- **Damage:** 3 survivors
- **Size:** 11 pixels

### Characteristics
- Moderate health with armor
- Damage resistance (future feature)
- Slower than basic zombies
- Requires armor-piercing damage

### Visual Description
- **Body:** Gray metallic appearance
- **Head:** Helmet or armored head
- **Armor:** Plated chest and limbs
- **Posture:** Rigid, protected stance
- **Details:** Military/tactical look

### Wave Appearance
- Waves 11+: 5% of zombies

---

## 5. Swarm Zombie 🐝

**Type ID:** `SWARM`  
**Color:** Yellow (`0xffff00`)

### Stats
- **Base Health:** 30 HP (scales with wave)
- **Speed:** 60 pixels/second (Fast)
- **Reward:** $5
- **Damage:** 1 survivor
- **Size:** 6 pixels (Small)

### Characteristics
- Very low health
- Fast movement
- Appears in large numbers
- Overwhelming through quantity

### Visual Description
- **Body:** Small yellow shape
- **Head:** Tiny, quick-moving
- **Build:** Thin, agile
- **Posture:** Hunched, scurrying
- **Details:** Swarm-like, numerous

### Wave Appearance
- Waves 11+: Multiple spawns per wave
- Often 10-20 at once

---

## 6. Stealth Zombie 👻

**Type ID:** `STEALTH`  
**Color:** Purple (`0x6600ff`)

### Stats
- **Base Health:** 70 HP (scales with wave)
- **Speed:** 70 pixels/second (Fast)
- **Reward:** $25
- **Damage:** 2 survivors
- **Size:** 10 pixels

### Characteristics
- Semi-transparent appearance
- Fast movement
- Harder to target (future feature)
- Sneaky and evasive

### Visual Description
- **Body:** Purple, semi-transparent
- **Head:** Ghostly appearance
- **Opacity:** 50-70% visible
- **Posture:** Crouched, stealthy
- **Details:** Shadowy, ethereal look

### Wave Appearance
- Waves 11+: 10% of zombies
- Often mixed with other types

---

## 7. Mechanical Zombie 🤖

**Type ID:** `MECHANICAL`  
**Color:** Cyan (`0x00ffff`)

### Stats
- **Base Health:** 120 HP (scales with wave)
- **Speed:** 55 pixels/second (Medium)
- **Reward:** $40
- **Damage:** 4 survivors
- **Size:** 12 pixels

### Characteristics
- Robot/cyborg zombie
- Consistent movement pattern
- Immune to certain effects (future)
- High-tech threat

### Visual Description
- **Body:** Cyan metallic/robotic
- **Head:** Mechanical, angular
- **Build:** Geometric, artificial
- **Posture:** Rigid, mechanical gait
- **Details:** Glowing parts, tech aesthetic

### Wave Appearance
- Waves 11+: 5-10% of zombies
- Late-game threat

---

## Health Scaling Formula

Zombie health scales with wave number:

```typescript
baseHealth * (1 + (wave - 1) * 0.15)
```

**Examples:**
- Wave 1: 100% base health
- Wave 5: 160% base health
- Wave 10: 235% base health
- Wave 20: 385% base health

---

## Speed Comparison Chart

```
Fastest: Fast Zombie (100 px/s)
         ↓
         Stealth Zombie (70 px/s)
         ↓
         Swarm Zombie (60 px/s)
         ↓
         Mechanical Zombie (55 px/s)
         ↓
         Basic Zombie (50 px/s)
         ↓
         Armored Zombie (40 px/s)
         ↓
Slowest: Tank Zombie (25 px/s)
```

---

## Reward Comparison Chart

```
Highest: Tank Zombie ($50)
         ↓
         Mechanical Zombie ($40)
         ↓
         Armored Zombie ($30)
         ↓
         Stealth Zombie ($25)
         ↓
         Fast Zombie ($15)
         ↓
         Basic Zombie ($10)
         ↓
Lowest:  Swarm Zombie ($5)
```

---

## Damage Comparison Chart

```
Highest: Tank Zombie (5 survivors) 💀💀💀💀💀
         ↓
         Mechanical Zombie (4 survivors) 💀💀💀💀
         ↓
         Armored Zombie (3 survivors) 💀💀💀
         ↓
         Stealth Zombie (2 survivors) 💀💀
         ↓
         Basic Zombie (1 survivor) 💀
         ↓
         Fast Zombie (1 survivor) 💀
         ↓
Lowest:  Swarm Zombie (1 survivor) 💀
```

**Note:** With 100 survivors in the camp:
- 1 Tank zombie reaching the camp = 5% of your survivors lost
- 20 Basic zombies = Game Over
- 100 Swarm zombies = Game Over

---

## Strategy Tips

### Early Waves (1-5)
- Focus on Basic and Fast zombies
- Machine Gun towers are effective
- Build economy with consistent kills

### Mid Waves (6-10)
- Tank zombies appear - need sustained damage
- Mix of all basic types
- Upgrade towers for better DPS

### Late Waves (11+)
- All zombie types active
- Swarm zombies can overwhelm
- Stealth and Mechanical add complexity
- Need diverse tower types

---

## Visual Color Reference

```
🟢 Basic:      Green    (0x00ff00)
🟠 Fast:       Orange   (0xff6600)
🔴 Tank:       Red      (0xff0000)
⚫ Armored:    Gray     (0x888888)
🟡 Swarm:      Yellow   (0xffff00)
🟣 Stealth:    Purple   (0x6600ff)
🔵 Mechanical: Cyan     (0x00ffff)
```

---

## Implementation Files

- **Base Class:** `src/objects/Zombie.ts`
- **Factory:** `src/objects/ZombieFactory.ts`
- **Individual Types:** `src/objects/zombies/`
  - `BasicZombie.ts`
  - `FastZombie.ts`
  - `TankZombie.ts`
  - `ArmoredZombie.ts`
  - `SwarmZombie.ts`
  - `StealthZombie.ts`
  - `MechanicalZombie.ts`

---

## Debug Testing

To test specific zombie types, use the debug constants:

```typescript
// In src/config/debugConstants.ts
ZOMBIE_HEALTH_MULTIPLIER: 0.1,  // Make zombies weak
ZOMBIE_SPEED_MULTIPLIER: 0.5,   // Make zombies slow
```

Or spawn specific types in wave configuration:
```typescript
// In src/managers/WaveManager.ts
// Modify waveData to test specific zombie types
```

---

## Future Enhancements

Planned features for zombie types:

1. **Armored** - Actual damage resistance mechanic
2. **Stealth** - Reduced tower targeting priority
3. **Mechanical** - Immunity to slow effects
4. **Swarm** - Split into smaller zombies on death
5. **Tank** - Area damage on death
6. **Fast** - Dodge chance for projectiles
7. **All** - Unique death animations and effects

---

*Last Updated: Current Build*  
*For gameplay balance changes, see: `src/config/gameConfig.ts`*
