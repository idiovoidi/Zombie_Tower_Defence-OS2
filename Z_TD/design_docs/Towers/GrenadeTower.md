# Grenade Tower

## Overview

The Grenade Tower is a mid-range explosive tower that launches grenades in an arc trajectory, dealing area damage on impact. It's a budget-friendly alternative to the Flame Tower with better range but lower damage.

---

## Stats

### Base Stats (Level 1)

| Stat | Value |
|------|-------|
| **Cost** | $600 |
| **Damage** | 100 (splash) |
| **Range** | 180 |
| **Fire Rate** | 0.6 shots/second |
| **Health** | 95 HP |
| **Projectile** | Grenade (arc trajectory) |

### Upgrade Scaling

- **Damage:** +50% per level (standard)
- **Range:** +20% per level (standard)
- **Fire Rate:** +10% per level (standard)
- **Health:** +20% per level (standard)

---

## Visual Design

### Tower Appearance

**Level 1-2: Makeshift Mortar**
- Olive drab wooden platform
- Wooden ammo crates with grenade symbols
- Rustic, improvised appearance
- Survivor in basic olive gear

**Level 3-4: Reinforced Launcher**
- Dark olive metal platform
- Metal ammo boxes
- Yellow warning stripes
- Survivor in tactical gear

**Level 5: Military Grenade Launcher**
- Military green armored platform
- Armored ammo storage
- Caution markings and explosive warnings
- Survivor in full combat gear

### Color Scheme

- **Primary:** Olive drab (#6B8E23)
- **Secondary:** Dark olive (#556B2F)
- **Accent:** Military green (#3A4A1F)
- **Warning:** Yellow (#FFCC00)
- **Explosive:** Orange-red (#FF6600)

---

## Gameplay

### Role

**Mid-Range Area Damage**
- Fills gap between Shotgun (short) and Sniper (long)
- Explosive AoE damage
- Burst damage pattern
- Predictive targeting required

### Strengths

✅ **Good Range:** 180 range is solid mid-range  
✅ **Area Damage:** Hits multiple zombies in explosion  
✅ **Cost Effective:** $600 is affordable  
✅ **Arc Trajectory:** Can shoot over obstacles (future)  

### Weaknesses

❌ **Slow Fire Rate:** 0.6 shots/sec is quite slow  
❌ **Lower Damage:** 100 vs Flame's 200  
❌ **Projectile Travel:** Grenades take time to reach target  
❌ **Predictive Aiming:** Need to lead moving targets  

### Best Against

- **Grouped Zombies:** Explosive AoE shines
- **Choke Points:** Where zombies bunch up
- **Mid-Range Threats:** 180 range sweet spot

### Weak Against

- **Fast Zombies:** Hard to predict movement
- **Spread Out Enemies:** AoE wasted
- **Close Range:** Slow fire rate struggles

---

## Comparison with Other Towers

### vs Flame Tower

| Aspect | Flame | Grenade |
|--------|-------|---------|
| Cost | $750 | $600 |
| Damage | 200 | 100 |
| Range | 120 | 180 |
| Fire Rate | 0.75/sec | 0.6/sec |
| Pattern | Sustained DoT | Burst AoE |
| **Advantage** | Higher DPS | Better range, cheaper |

### vs Shotgun Tower

| Aspect | Shotgun | Grenade |
|--------|---------|---------|
| Cost | $400 | $600 |
| Damage | 60 | 100 |
| Range | 120 | 180 |
| Fire Rate | 0.8/sec | 0.6/sec |
| Pattern | Cone spread | Single explosion |
| **Advantage** | Cheaper, faster | Better range, AoE |

---

## Implementation

### File Structure

```
src/objects/towers/GrenadeTower.ts  - Tower class
design_docs/Towers/GrenadeTower.md  - This documentation
```

### Code

```typescript
import { Tower } from '../Tower';
import { GameConfig } from '../../config/gameConfig';

export class GrenadeTower extends Tower {
  constructor(x: number, y: number) {
    super(GameConfig.TOWER_TYPES.GRENADE, x, y);
  }

  public shoot(): void {
    super.shoot();
    // Grenade specific shooting logic
  }
}
```

### Projectile Type

Returns `'grenade'` from `getProjectileType()`

**Projectile Requirements:**
- Arc trajectory (parabolic path)
- Explosion on impact
- Area damage radius
- Visual explosion effect

---

## Visual Effects

### Launch Flash

- Bright orange/yellow flash (5px → 8px → 12px)
- Smoke puff after launch
- Less intense than flame tower

### Idle Animation

- Subtle bob up and down
- Simulates loading/ready state
- Gentle, rhythmic movement

### Future Effects

- **Grenade Trail:** Smoke trail during flight
- **Explosion:** Large orange/yellow explosion
- **Shockwave:** Expanding ring effect
- **Debris:** Particles flying outward
- **Impact Crater:** Ground scorch mark

---

## Balance

### DPS Analysis (Level 1)

**Single Target:**
- Damage: 100
- Fire Rate: 0.6/sec
- DPS: 60

**Multi-Target (3 zombies):**
- Effective DPS: 180 (60 × 3)

### Cost Efficiency

- **Cost per DPS:** $10 per DPS (single target)
- **Cost per DPS:** $3.33 per DPS (3 targets)

**Comparison:**
- Machine Gun: $2.60 per DPS
- Flame: $5 per DPS
- Grenade: $10 per DPS (single) / $3.33 (multi)

### Upgrade Value

| Level | Damage | Fire Rate | DPS | Cost |
|-------|--------|-----------|-----|------|
| 1 | 100 | 0.6 | 60 | $600 |
| 2 | 150 | 0.66 | 99 | +$450 |
| 3 | 225 | 0.73 | 164 | +$675 |
| 4 | 338 | 0.80 | 270 | +$900 |
| 5 | 506 | 0.88 | 445 | +$1125 |

---

## Strategy Tips

### Placement

**Best Locations:**
- Choke points where zombies group
- Mid-range coverage areas
- Behind front-line towers
- Covering multiple paths

**Avoid:**
- Front line (too slow)
- Long range positions (wasted range)
- Isolated spots (needs support)

### Synergies

**Good With:**
- **Shotgun:** Slows zombies for easier hits
- **Machine Gun:** Finishes wounded zombies
- **Sniper:** Takes out high-HP targets

**Weak With:**
- **Flame:** Overlapping AoE is redundant
- **Tesla:** Both are burst damage

### Upgrade Priority

1. **Early Game:** Don't build (too expensive)
2. **Mid Game:** Build 1-2 at choke points
3. **Late Game:** Upgrade to level 3-4
4. **End Game:** Max out for massive AoE

---

## Future Enhancements

### Planned Features

**Arc Trajectory:**
- Parabolic projectile path
- Can shoot over obstacles
- Visual grenade trail

**Explosion System:**
- Radial damage calculation
- Visual explosion effect
- Shockwave animation
- Debris particles

**Upgrade Variations:**
- **Cluster Grenades:** Multiple explosions
- **Incendiary:** Fire DoT after explosion
- **Sticky:** Attach to zombies before exploding
- **EMP:** Bonus damage vs Mechanical

### Special Mechanics

**Knockback:**
- Explosion pushes zombies back
- Delays zombie progress
- Stacks with other knockback

**Stun:**
- Brief stun on explosion
- Interrupts zombie movement
- Synergizes with other towers

**Armor Shred:**
- Reduces zombie armor
- Makes them vulnerable
- Team support role

---

## Testing Checklist

- [x] Tower class created
- [x] Added to TowerFactory
- [x] Added to tower constants
- [x] Visual design implemented
- [x] Idle animation working
- [x] Launch flash effect
- [ ] Grenade projectile
- [ ] Explosion effect
- [ ] Area damage
- [ ] Arc trajectory
- [ ] Balance testing

---

## Status

✅ **Tower Class:** Complete  
✅ **Visual Design:** Complete  
✅ **Stats:** Complete  
⚠️ **Projectile:** Needs implementation  
⚠️ **Explosion:** Needs implementation  
📋 **Balance:** Needs testing

---

**Created:** Current Build  
**Type:** Mid-Range AoE  
**Difficulty:** Medium  
**Cost:** $600
