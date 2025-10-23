# Tesla Tower Chain Lightning System

## Overview

The Tesla Tower now features chain lightning that arcs between multiple zombies. The number of targets hit scales with the tower's upgrade level, making upgrades significantly more valuable.

---

## How It Works

### Chain Mechanics

**Upgrade Level = Number of Targets**

- Level 1: Hits 1 zombie
- Level 2: Hits 2 zombies (chains once)
- Level 3: Hits 3 zombies (chains twice)
- Level 4: Hits 4 zombies (chains three times)
- Level 5: Hits 5 zombies (chains four times)

### Damage Scaling

Each chain jump reduces damage:

- **Damage Reduction**: 70% per jump
- **First Target**: 100% damage
- **Second Target**: 70% damage
- **Third Target**: 49% damage (70% of 70%)
- **Fourth Target**: 34.3% damage
- **Fifth Target**: 24% damage

### Chain Range

- **Maximum Jump Distance**: 150 pixels
- Lightning will only jump to zombies within this range
- If no valid target is found, the chain stops

### Target Selection

- Finds nearest zombie within chain range
- Never hits the same zombie twice
- Skips destroyed/dead zombies
- Prioritizes closest targets for natural-looking arcs

---

## Visual Effects

### Primary Arc (First Target)

- **Color**: Bright cyan (0x00ffff)
- **Width**: 3 pixels
- **Glow**: Multiple layers with transparency
- **Branches**: Random side bolts for realism
- **Segments**: 8 segments with random perpendicular offset
- **Flash Points**: Bright white flashes at start/end (8px radius)

### Chain Arcs (Subsequent Targets)

- **Color**: Slightly dimmer cyan (0x00ccff)
- **Width**: 2 pixels (thinner than primary)
- **Glow**: Reduced intensity
- **Branches**: None (cleaner look for chains)
- **Flash Points**: Smaller flashes (6px radius)
- **Duration**: 150ms (slightly longer to see full chain)

### Zombie Electric Particles

When a zombie is hit by lightning, it displays electric particle effects:

**Primary Hit (First Target):**

- 12 cyan electric sparks radiating outward (20px spread)
- Electric ring around zombie (18px radius)
- 6 jagged lightning arcs emanating from body
- Bright white flash on zombie sprite (50ms)
- Particles fade out over 200ms with expansion

**Chain Hit (Subsequent Targets):**

- 8 cyan electric sparks (15px spread)
- Smaller electric ring (14px radius)
- 4 jagged lightning arcs
- White flash on zombie sprite (50ms)
- Particles fade out over 150ms with expansion

**Particle Details:**

- Sparks: 3px (primary) or 2px (chain) cyan circles with white glow
- Rings: 2px cyan stroke with white outer glow
- Arcs: Jagged 3-segment lightning bolts
- Animation: Alpha fade + scale expansion (1.0 → 1.3)

### Arc Generation

Each lightning bolt:

1. Divides path into 8 segments
2. Adds random perpendicular offset to middle segments
3. Draws 3 layers: main bolt, glow, outer glow
4. Adds random branches to primary arc only

---

## Implementation Details

### Code Structure

**Location**: `src/managers/TowerCombatManager.ts`

**Key Methods**:

- `createLightningArc()` - Main chain lightning logic
- `findNearestZombie()` - Finds next chain target
- `drawLightningBolt()` - Renders individual arc

### Chain Algorithm

```typescript
1. Start with initial target and full damage
2. For each upgrade level:
   a. Apply damage with resistance modifier
   b. Track damage for stats
   c. Mark zombie as hit
   d. Find nearest unhit zombie within range
   e. Reduce damage by 70%
   f. Continue to next target
3. Draw all lightning arcs visually
```

### Damage Application

Each target receives:

```typescript
modifiedDamage = baseDamage * chainReduction * zombieResistanceModifier;
```

Where:

- `baseDamage` = Tower's base damage
- `chainReduction` = 0.7^(jumpNumber)
- `zombieResistanceModifier` = From resistance system (e.g., 2.0 for Mechanical)

---

## Strategic Implications

### Upgrade Value

Tesla Tower upgrades are now extremely valuable:

- **Level 1→2**: +100% targets (1→2)
- **Level 2→3**: +50% targets (2→3)
- **Level 3→4**: +33% targets (3→4)
- **Level 4→5**: +25% targets (4→5)

### Positioning Strategy

**Optimal Placement**:

- Near zombie spawn points (high density)
- At path corners where zombies bunch up
- Between multiple paths for cross-chaining

**Avoid**:

- Isolated positions with spread-out zombies
- End of paths where zombies are sparse

### Synergy with Resistance System

**Mechanical Zombies** (2.0x damage):

- Level 5 Tesla can wipe out 5 mechanical zombies
- Even 5th chain target takes 48% of base damage (24% × 2.0)
- Extremely cost-effective against mechanical waves

**Fast Zombies** (1.25x damage):

- Good effectiveness, chains catch runners
- Instant hit prevents dodging

**Tank Zombies** (1.0x damage):

- Normal effectiveness
- Multiple hits from chain can take down tanks
- Better to focus on single targets

---

## Balance Considerations

### Strengths

✅ Excellent against grouped enemies  
✅ Scales powerfully with upgrades  
✅ Instant damage (no projectile travel)  
✅ Ignores zombie speed  
✅ Very effective vs Mechanical zombies

### Weaknesses

❌ Reduced effectiveness against spread-out zombies  
❌ Damage falls off quickly on later chain targets  
❌ Requires zombies within 150px of each other  
❌ Less effective vs single high-HP targets  
❌ Expensive to upgrade to max level

### Comparison to Other Towers

**vs Machine Gun**:

- Tesla: Better burst damage, area control
- MG: Better sustained DPS, single target

**vs Shotgun**:

- Tesla: Longer range, more targets at high level
- Shotgun: More consistent multi-target damage

**vs Sniper**:

- Tesla: Better vs groups
- Sniper: Better vs single high-HP targets

**vs Flame**:

- Tesla: Instant damage, better range
- Flame: Sustained damage, area denial

---

## Testing Scenarios

### Scenario 1: Dense Swarm

**Setup**: 10 Swarm zombies clustered together  
**Expected**: Level 5 Tesla chains through 5 zombies  
**Result**: Massive damage, very efficient

### Scenario 2: Spread Out Basics

**Setup**: 5 Basic zombies spread 200px apart  
**Expected**: Only hits 1-2 zombies  
**Result**: Less efficient, chains break

### Scenario 3: Mechanical Wave

**Setup**: 5 Mechanical zombies in a line  
**Expected**: Full chain with 2x damage multiplier  
**Result**: Extremely effective, rapid elimination

### Scenario 4: Mixed Types

**Setup**: Tank, Fast, Basic, Swarm, Mechanical  
**Expected**: Chains through all if close enough  
**Result**: Variable damage based on resistances

---

## Configuration

### Tunable Parameters

Located in `TowerCombatManager.ts`:

```typescript
const chainRange = 150; // Maximum jump distance
const damageReduction = 0.7; // Damage multiplier per jump
const maxJumps = tower.getUpgradeLevel(); // Scales with level
```

### Balancing Adjustments

**If Tesla is too strong**:

- Reduce `chainRange` (e.g., 120px)
- Increase `damageReduction` (e.g., 0.6 = 60% per jump)
- Cap `maxJumps` at 3 or 4

**If Tesla is too weak**:

- Increase `chainRange` (e.g., 180px)
- Decrease `damageReduction` (e.g., 0.8 = 80% per jump)
- Add bonus damage to chained targets

---

## Future Enhancements

### Potential Features

1. **Stun Effect**: Chain lightning briefly stuns zombies
2. **Arc Damage**: Zombies near the arc take splash damage
3. **Overcharge**: Chance for chain to not reduce damage
4. **Smart Targeting**: Prioritize high-value targets
5. **Visual Upgrades**: More impressive effects at higher levels
6. **Sound Effects**: Crackling electricity sounds
7. **Combo System**: Bonus damage if all targets are same type

### Advanced Mechanics

**Conductivity System**:

- Wet zombies (from water) take extra damage
- Metal-armored zombies conduct to nearby enemies
- Mechanical zombies explode when killed by lightning

**Upgrade Branches**:

- Path A: More chains, less damage reduction
- Path B: Fewer chains, more damage per hit
- Path C: Shorter range, but stuns targets

---

## Performance Notes

### Optimization

- Chain calculation is O(n×m) where n=jumps, m=zombies
- Visual rendering is lightweight (Graphics API)
- No physics simulation needed (instant hit)
- Minimal memory allocation (reuses graphics)

### Potential Issues

- Many zombies + high upgrade level = more calculations
- Should be fine for typical gameplay (< 50 zombies)
- Consider capping at 5 chains even if more upgrades added

---

## Code Example

### Using Chain Lightning

```typescript
// In TowerCombatManager
if (projectileType === 'tesla') {
  this.createLightningArc(tower, spawnPos, target, damage);
  return;
}
```

### Customizing Chain Behavior

```typescript
// Modify in createLightningArc()
const maxJumps = Math.min(tower.getUpgradeLevel(), 5); // Cap at 5
const chainRange = 150 + tower.getUpgradeLevel() * 10; // Increase with level
const damageReduction = 0.7 - tower.getUpgradeLevel() * 0.02; // Less reduction at high level
```

---

## Status

✅ **Implementation Complete**

- Chain lightning system working
- Damage scaling implemented
- Visual effects polished
- Resistance system integrated

🎮 **Ready for Testing**

- Test with various zombie formations
- Verify damage calculations
- Check visual performance
- Balance tuning may be needed

---

**Last Updated**: Current Build  
**Status**: Ready for Gameplay Testing  
**Next Steps**: Balance testing and player feedback
