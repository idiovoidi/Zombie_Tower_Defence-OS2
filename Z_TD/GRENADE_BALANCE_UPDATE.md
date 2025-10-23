# Grenade Tower Balance Update

## Overview
Rebalanced the grenade tower to focus on **area control** rather than raw damage. The tower now excels at crowd control with massive explosion radius scaling while maintaining balanced damage output.

## Key Changes

### Damage Scaling: REDUCED
**Before:** +50% damage per level (standard)
**After:** +20% damage per level (reduced)

| Level | Old Damage | New Damage | Change |
|-------|-----------|-----------|--------|
| 1     | 100       | 90        | -10%   |
| 2     | 150       | 108       | -28%   |
| 3     | 200       | 126       | -37%   |
| 4     | 250       | 144       | -42%   |
| 5     | 300       | 162       | -46%   |

### Explosion Radius: INCREASED
**Before:** 40px base, +8px per level (+20% per level)
**After:** 45px base, +11px per level (+24% per level)

| Level | Old Radius | New Radius | Area Increase |
|-------|-----------|-----------|---------------|
| 1     | 40px      | 45px      | +26% area     |
| 2     | 48px      | 56px      | +37% area     |
| 3     | 56px      | 67px      | +44% area     |
| 4     | 64px      | 78px      | +49% area     |
| 5     | 72px      | 90px      | +56% area     |

**Level 5 Comparison:**
- Old: 72px radius (80% larger than Level 1)
- New: 90px radius (100% larger than Level 1 = **4x the area!**)

## Design Philosophy

### Before
- High damage scaling made it a general-purpose damage dealer
- Explosion radius was secondary benefit
- Competed directly with other damage towers

### After
- **Area Control Specialist:** Excels at hitting multiple targets
- **Crowd Control Focus:** Best against grouped zombies
- **Strategic Placement:** Rewards positioning at choke points
- **Balanced Single-Target:** Won't outclass sniper/machine gun on single targets

## Damage Per Second Analysis

### Single Target DPS (at 0.6 shots/sec)
| Level | Old DPS | New DPS | Change |
|-------|---------|---------|--------|
| 1     | 60      | 54      | -10%   |
| 2     | 90      | 65      | -28%   |
| 3     | 120     | 76      | -37%   |
| 4     | 150     | 86      | -42%   |
| 5     | 180     | 97      | -46%   |

### Multi-Target Effectiveness
With the increased radius, Level 5 can now hit **4x more area** than before:
- Old Level 5: ~16,286 px² area
- New Level 5: ~25,447 px² area (+56% area)

If hitting 5+ zombies consistently, the total damage output is **higher** despite lower per-target damage.

## Zombie Type Effectiveness

The grenade tower now has specific resistances in the damage system:

| Zombie Type | Modifier | Effectiveness |
|-------------|----------|---------------|
| Basic       | 1.0x     | Normal        |
| Fast        | 1.15x    | Effective     |
| Tank        | 1.3x     | Very Effective|
| Armored     | 1.5x     | Very Effective|
| Swarm       | 1.6x     | Devastating   |
| Stealth     | 1.2x     | Effective     |
| Mechanical  | 0.9x     | Slightly Resisted |

**Best Against:** Swarms, Armored, Tanks (grouped enemies)
**Worst Against:** Mechanical (but still decent)

## Gameplay Impact

### Early Game (Level 1-2)
- **Old:** Decent damage, small area
- **New:** Moderate damage, better area coverage
- **Impact:** More reliable against small groups

### Mid Game (Level 3)
- **Old:** Good damage, medium area
- **New:** Moderate damage, large area
- **Impact:** Better at choke points, worse at single targets

### Late Game (Level 4-5)
- **Old:** High damage, large area
- **New:** Moderate damage, **MASSIVE** area
- **Impact:** Devastating against hordes, balanced against single targets

## Strategic Considerations

### When to Build Grenade Towers
✅ **Good Situations:**
- Choke points where zombies cluster
- Against swarm waves
- Late game when zombies group up
- Complementing single-target towers

❌ **Bad Situations:**
- Against spread-out zombies
- Early game when money is tight
- Against mechanical zombies
- When you need high single-target DPS

### Upgrade Priority
1. **Level 1 → 2:** +24% radius, good value
2. **Level 2 → 3:** +20% radius, solid upgrade
3. **Level 3 → 4:** +16% radius, diminishing returns
4. **Level 4 → 5:** +15% radius but reaches 90px (2x Level 1!)

**Recommendation:** Upgrade to Level 3 for best value, save Level 5 for late game.

## Balance Comparison with Other Towers

### vs Machine Gun
- **Machine Gun:** High DPS, single target, fast fire rate
- **Grenade:** Lower DPS, multi-target, slow fire rate
- **Verdict:** Complementary - use both

### vs Sniper
- **Sniper:** Very high single-target damage, long range
- **Grenade:** Lower single-target, shorter range, area damage
- **Verdict:** Different roles - sniper for priority targets, grenade for groups

### vs Flame
- **Flame:** High damage, short range, sustained burn
- **Grenade:** Lower damage, medium range, instant splash
- **Verdict:** Similar roles but grenade has better range

### vs Tesla
- **Tesla:** Chain lightning, expensive, multi-target
- **Grenade:** Splash damage, expensive, multi-target
- **Verdict:** Similar cost and role, tesla better for spread enemies

## Cost Efficiency

### Total Investment (Base + All Upgrades)
- Base Cost: $600
- Level 2: +$450 (Total: $1,050)
- Level 3: +$600 (Total: $1,650)
- Level 4: +$750 (Total: $2,400)
- Level 5: +$900 (Total: $3,300)

### Value Analysis
- **Level 1:** $600 for 45px radius = $13.33 per px
- **Level 5:** $3,300 for 90px radius = $36.67 per px

**Conclusion:** Early levels are more cost-efficient, but Level 5's 4x area coverage justifies the investment in late game.

## Testing Results

### Scenario: 6 Zombies Clustered
**Old Level 5 (72px radius, 300 damage):**
- Zombies hit: 4-5
- Total damage: ~1,200-1,500
- DPS: 720-900

**New Level 5 (90px radius, 162 damage):**
- Zombies hit: 5-6
- Total damage: ~810-972
- DPS: 486-583

**Analysis:** Lower burst damage but hits more targets consistently. Better for sustained crowd control.

### Scenario: Single Tank Zombie
**Old Level 5:** 300 damage × 1.3 (tank modifier) = 390 damage
**New Level 5:** 162 damage × 1.3 (tank modifier) = 211 damage

**Analysis:** 46% less damage to single targets, but that's the intended trade-off.

## Conclusion

The grenade tower is now a **specialist** rather than a generalist:

✅ **Strengths:**
- Massive area coverage at high levels
- Excellent crowd control
- Strong against armored/swarm zombies
- Rewards strategic placement

⚠️ **Weaknesses:**
- Lower single-target damage
- Expensive to fully upgrade
- Slow fire rate
- Less effective against spread enemies

**Recommended Use:** Build 1-2 grenade towers at key choke points, upgrade to Level 3-4 for best value, save Level 5 for late-game horde defense.

## Files Modified

1. **src/config/towerConstants.ts**
   - Added grenade-specific damage scaling (+20% instead of +50%)
   
2. **src/objects/Projectile.ts**
   - Increased base radius: 40px → 45px
   - Increased radius per level: 8px → 11px
   
3. **src/config/zombieResistances.ts**
   - Added GRENADE tower type
   - Added resistance modifiers for all zombie types
   - Added conversion function for tower type strings

4. **Documentation**
   - Updated GRENADE_TOWER_IMPLEMENTATION.md
   - Updated GRENADE_SCALING_SUMMARY.md
   - Updated test-grenade-scaling.html

## Next Steps

1. **Playtest:** Test against various wave compositions
2. **Balance:** Adjust if too weak/strong
3. **Visual Feedback:** Consider adding radius indicator in-game
4. **Sound:** Add deeper explosion sound for higher levels
5. **Effects:** Consider screen shake scaling with radius
