# Grenade Tower Implementation

## ✅ New Tower Added

Successfully created a new Grenade tower based on the Flame tower, with explosive area damage and arc trajectory.

---

## 🎯 Tower Stats

### Base Stats (Level 1)

- **Cost:** $600
- **Damage:** 100 (splash damage)
- **Range:** 180
- **Fire Rate:** 0.6 shots/second (slower than flame)
- **Health:** 95 HP
- **Special:** Explosive area damage with arc trajectory

### Comparison with Flame Tower

| Stat      | Flame       | Grenade       |
| --------- | ----------- | ------------- |
| Cost      | $750        | $600          |
| Damage    | 200         | 100           |
| Range     | 120         | 180           |
| Fire Rate | 0.75/sec    | 0.6/sec       |
| Special   | Burning DoT | Explosive AoE |

---

## 🎨 Visual Design

### Tower Appearance

**Level 1-2: Makeshift Mortar**

- Olive drab platform
- Wooden ammo crates
- Grenade symbols
- Rustic, improvised look

**Level 3-4: Reinforced Launcher**

- Dark olive platform
- Metal ammo boxes
- Yellow warning stripes
- More professional appearance

**Level 5: Military Grenade Launcher**

- Military green with armor
- Armored ammo storage
- Caution markings
- Explosive warning symbol
- Elite military aesthetic

### Survivor Character

**"The Demolitionist"**

- Olive/military green tactical gear
- Grenade launcher (tube style)
- Helmet progression:
  - L1-2: Basic helmet
  - L3-4: Tactical helmet
  - L5: Full combat helmet
- Tactical/military appearance

---

## 💥 Visual Effects

### Launch Flash

- Bright orange/yellow flash
- Multi-layered (5px → 8px → 12px)
- Smoke puff after launch
- Less intense than flame tower

### Idle Animation

- Subtle bob up and down
- Simulates loading/ready state
- Gentle, rhythmic movement

---

## 🎮 Gameplay Role

### Strengths

- **Area Damage:** Hits multiple zombies in explosion radius
- **Arc Trajectory:** Can shoot over obstacles (future feature)
- **Good Range:** 180 range is solid mid-range
- **Cost Effective:** $600 is affordable mid-game

### Weaknesses

- **Slow Fire Rate:** 0.6 shots/sec is quite slow
- **Lower Damage:** 100 base damage vs Flame's 200
- **Projectile Travel:** Grenades take time to reach target

### Best Use Cases

- **Grouped Zombies:** Explosive AoE shines against clusters
- **Mid-Range Defense:** 180 range fills gap between short and long
- **Budget Option:** Cheaper than Flame for AoE damage
- **Choke Points:** Great for narrow paths where zombies bunch up

---

## 🔧 Technical Implementation

### Files Modified

**`src/config/gameConfig.ts`**

- Added `GRENADE: 'Grenade'` to TOWER_TYPES

**`src/config/towerConstants.ts`**

- Added GRENADE tower stats
- Added to getTowerStats() switch

**`src/objects/Tower.ts`**

- Added grenade health (95 HP)
- Added idleAnimationGrenade() method
- Added grenade shooting effect (launch flash)
- Added createGrenadeVisual() method
- Added grenade to updateVisual() switch
- Added 'grenade' to getProjectileType()

---

## 🚀 Next Steps

### Projectile Implementation

The grenade tower needs a projectile type in the ProjectileManager:

```typescript
// In ProjectileManager
case 'grenade':
  // Create grenade projectile
  // Arc trajectory (parabolic path)
  // Explosion on impact
  // Area damage radius
  break;
```

### Explosion Effect

Create explosion visual effect:

- Bright orange/yellow flash
- Expanding shockwave
- Debris particles
- Smoke cloud
- Damage all zombies in radius

### Arc Trajectory

Implement parabolic path:

- Launch angle based on distance
- Gravity simulation
- Visual arc trail
- Impact prediction

---

## 📊 Balance Considerations

### DPS Comparison (Level 1)

| Tower       | Damage | Fire Rate | Single Target DPS | Notes        |
| ----------- | ------ | --------- | ----------------- | ------------ |
| Machine Gun | 12     | 8.0       | 96                | Multi-target |
| Grenade     | 100    | 0.6       | 60                | AoE splash   |
| Flame       | 200    | 0.75      | 150               | DoT + AoE    |
| Shotgun     | 60     | 0.8       | 48                | Multi-pellet |

### Cost Efficiency

- **Grenade:** $600 for 60 DPS = $10 per DPS
- **Flame:** $750 for 150 DPS = $5 per DPS
- **Machine Gun:** $250 for 96 DPS = $2.60 per DPS

Grenade is less efficient than Flame but offers:

- Lower upfront cost
- Better range
- Different damage pattern

---

## 🎯 Design Philosophy

### Distinct Identity

**Grenade vs Flame:**

- Grenade: Burst AoE, arc trajectory, explosive
- Flame: Sustained DoT, direct line, burning

**Grenade vs Shotgun:**

- Grenade: Single explosive projectile, long range
- Shotgun: Multiple pellets, short range, instant

### Tactical Niche

- **Mid-range AoE:** Fills gap between Shotgun (short) and Sniper (long)
- **Burst Damage:** High damage per shot, but slow
- **Predictive Play:** Requires aiming at where zombies will be
- **Budget AoE:** Cheaper alternative to Flame tower

---

## 🧪 Testing Checklist

- [ ] Grenade tower appears in shop
- [ ] Can be placed on map
- [ ] Visual appears correctly (all levels)
- [ ] Idle animation works
- [ ] Launch flash appears when shooting
- [ ] Projectile spawns (once implemented)
- [ ] Upgrades work correctly
- [ ] Stats scale properly
- [ ] Cost is correct ($600)
- [ ] Health is correct (95 HP)

---

## 🔮 Future Enhancements

### Planned Features

1. **Arc Trajectory Projectile**
   - Parabolic path
   - Visual trail
   - Can shoot over obstacles

2. **Explosion Effect**
   - Radial damage
   - Visual explosion
   - Shockwave animation
   - Debris particles

3. **Upgrade Variations**
   - Cluster grenades (multiple explosions)
   - Incendiary grenades (fire DoT)
   - Sticky grenades (attach to zombies)
   - EMP grenades (bonus vs mechanical)

4. **Special Mechanics**
   - Knockback on explosion
   - Stun effect
   - Armor shredding
   - Chain explosions

---

## 📝 Notes

### Projectile Type

The grenade tower returns 'grenade' as its projectile type. The ProjectileManager needs to handle this:

```typescript
// Grenade projectile should:
// - Travel in arc (not straight line)
// - Explode on impact
// - Deal area damage
// - Have visual explosion effect
```

### Balance Tuning

Current stats are initial values. May need adjustment after testing:

- Damage might be too low (100 vs Flame's 200)
- Fire rate might be too slow (0.6/sec)
- Range might need tweaking (180)
- Cost seems reasonable ($600)

### Visual Polish

Consider adding:

- Grenade visible in launcher before firing
- Ammo counter visual
- Reload animation
- Smoke trail from grenade
- Impact crater

---

## Status

✅ **Tower Created:** Complete  
✅ **Visuals:** Complete  
✅ **Stats:** Complete  
⚠️ **Projectile:** Needs implementation  
⚠️ **Explosion:** Needs implementation  
🎯 **Ready for:** Projectile system integration

---

**Created:** Current Build  
**Developer:** Kiro AI Assistant  
**Based On:** Flame Tower  
**Purpose:** Mid-range explosive AoE tower
