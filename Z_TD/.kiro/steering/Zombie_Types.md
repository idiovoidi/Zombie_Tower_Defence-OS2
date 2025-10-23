---
inclusion: fileMatch
fileMatchPattern: ['**/zombies/**/*.ts', '**/Zombie*.ts', '**/WaveManager.ts', '**/Tower*.ts']
---

# Zombie Types Reference

Complete reference for all zombie types including stats, combat modifiers, and strategic counters.

## Zombie Type Definitions

### 1. Basic Zombie 🧟

- **Type ID:** `BASIC` | **Color:** `0x00ff00` (green)
- **Stats:** 100 HP, 50 px/s, $10 reward, 10px size
- **Combat:** No resistances or weaknesses (100% damage from all towers)
- **Spawn:** 80% (waves 1-5), 60% (waves 6-10), 50% (waves 11+)
- **Visual:** Green humanoid, round head, extended arms, shambling gait
- **Strategy:** Balanced baseline enemy, good for testing tower effectiveness

### 2. Fast Zombie 🏃

- **Type ID:** `FAST` | **Color:** `0xff6600` (orange)
- **Stats:** 80 HP, 100 px/s, $15 reward, 10px size
- **Combat:**
  - Resistant: Flame (75% - runs through fire quickly)
  - Weak: Shotgun (125%), Tesla (125% - instant hit, no dodging)
  - Other: Machine Gun (100%), Sniper (90% - harder to hit)
- **Spawn:** 20% (waves 1-5), 30% (waves 6+)
- **Visual:** Orange streamlined body, leaning forward, rapid leg animation
- **Strategy:** Use area-effect and instant-hit towers. Avoid precision towers.

### 3. Tank Zombie 💪

- **Type ID:** `TANK` | **Color:** `0xff0000` (red)
- **Stats:** 300 HP, 25 px/s, $50 reward, 15px size
- **Combat:**
  - Resistant: Machine Gun (70% - bullets bounce off), Shotgun (80%)
  - Weak: Sniper (150% - armor-piercing), Flame (125% - sustained burn)
  - Other: Tesla (100%)
- **Spawn:** 10% (waves 6-10), 15% (waves 11+)
- **Visual:** Large bulky red body, wide shoulders, lumbering gait
- **Strategy:** Use high-damage single-target (Sniper) or sustained damage (Flame)

### 4. Armored Zombie 🛡️

- **Type ID:** `ARMORED` | **Color:** `0x888888` (gray)
- **Stats:** 150 HP, 40 px/s, $30 reward, 11px size
- **Combat:**
  - Resistant: Machine Gun (75%), Shotgun (85%), Flame (90% - heat-resistant)
  - Weak: Sniper (140% - armor-piercing), Tesla (120% - bypasses armor)
- **Spawn:** 5% (waves 11+)
- **Visual:** Gray metallic body, helmet, plated armor, rigid stance
- **Strategy:** Prioritize Sniper and Tesla. Avoid rapid-fire low-damage towers.

### 5. Swarm Zombie 🐝

- **Type ID:** `SWARM` | **Color:** `0xffff00` (yellow)
- **Stats:** 30 HP, 60 px/s, $5 reward, 6px size
- **Combat:**
  - Resistant: Sniper (60% - overkill, wasted damage)
  - Weak: Shotgun (150% - spread hits multiple), Flame (140%), Tesla (130% - chain)
  - Other: Machine Gun (100%)
- **Spawn:** 10-20 at once (waves 11+)
- **Visual:** Small yellow body, hunched scurrying posture
- **Strategy:** Use area-effect towers. Single-target high-damage wastes damage.

### 6. Stealth Zombie 👻

- **Type ID:** `STEALTH` | **Color:** `0x6600ff` (purple)
- **Stats:** 70 HP, 70 px/s, $25 reward, 10px size
- **Combat:**
  - Resistant: Sniper (80% - hard to target precisely)
  - Weak: Flame (130% - reveals and burns), Tesla (125%), Shotgun (115% - spread)
  - Other: Machine Gun (95%)
- **Spawn:** 10% (waves 11+)
- **Visual:** Purple semi-transparent (50-70% opacity), crouched posture
- **Strategy:** Use auto-targeting and area towers. Avoid precision towers.

### 7. Mechanical Zombie 🤖

- **Type ID:** `MECHANICAL` | **Color:** `0x00ffff` (cyan)
- **Stats:** 120 HP, 55 px/s, $40 reward, 12px size
- **Combat:**
  - Resistant: Machine Gun (80% - metal plating), Shotgun (85%), Flame (50% - heat-resistant)
  - Weak: Tesla (200% - fries circuits), Sniper (120% - precision weak points)
- **Spawn:** 5-10% (waves 11+)
- **Visual:** Cyan metallic body, angular geometric design, glowing parts
- **Strategy:** Tesla is HIGHLY effective (200%). Flame is nearly useless (50%).

---

## Tower Effectiveness Matrix

| Zombie     | Machine Gun | Sniper | Shotgun | Flame | Tesla |
| ---------- | ----------- | ------ | ------- | ----- | ----- |
| Basic      | 100%        | 100%   | 100%    | 100%  | 100%  |
| Fast       | 100%        | 90%    | 125%    | 75%   | 125%  |
| Tank       | 70%         | 150%   | 80%     | 125%  | 100%  |
| Armored    | 75%         | 140%   | 85%     | 90%   | 120%  |
| Swarm      | 100%        | 60%    | 150%    | 140%  | 130%  |
| Stealth    | 95%         | 80%    | 115%    | 130%  | 125%  |
| Mechanical | 80%         | 120%   | 85%     | 50%   | 200%  |

### Tower Strategy Guide

- **Tesla:** Most versatile. Excellent vs Mechanical (200%), good vs Fast/Stealth/Armored
- **Shotgun:** Great vs Fast/Swarm (125-150%), decent vs Stealth
- **Sniper:** Essential vs Tank/Armored (140-150%), poor vs Swarm (60%)
- **Flame:** Good vs Tank/Stealth/Swarm, nearly useless vs Mechanical (50%)
- **Machine Gun:** Balanced but weak vs armored types (70-80%)

---

## Game Mechanics

### Health Scaling

```typescript
baseHealth * (1 + (wave - 1) * 0.15);
```

Wave 1: 100% | Wave 5: 160% | Wave 10: 235% | Wave 20: 385%

### Damage Calculation

```typescript
finalDamage = baseDamage * damageModifier * (1 + upgrades);
```

### Wave Composition Strategy

- **Waves 1-5:** Basic (80%), Fast (20%) → Machine Gun, Shotgun effective
- **Waves 6-10:** Basic (60%), Fast (30%), Tank (10%) → Add Sniper towers
- **Waves 11+:** All types active → Diverse tower composition required

### Speed Rankings

Fast (100) > Stealth (70) > Swarm (60) > Mechanical (55) > Basic (50) > Armored (40) > Tank (25)

### Reward Rankings

Tank ($50) > Mechanical ($40) > Armored ($30) > Stealth ($25) > Fast ($15) > Basic ($10) > Swarm ($5)

---

## Implementation Reference

### File Locations

- Base: `src/objects/Zombie.ts`
- Factory: `src/objects/ZombieFactory.ts`
- Types: `src/objects/zombies/*.ts`

### Debug Testing

```typescript
// src/config/debugConstants.ts
ZOMBIE_HEALTH_MULTIPLIER: 0.1; // Weak zombies
ZOMBIE_SPEED_MULTIPLIER: 0.5; // Slow zombies
```

### Color Constants

Basic: `0x00ff00` | Fast: `0xff6600` | Tank: `0xff0000` | Armored: `0x888888`
Swarm: `0xffff00` | Stealth: `0x6600ff` | Mechanical: `0x00ffff`
