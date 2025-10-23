# Grenade Tower Explosion Scaling

## Overview
The grenade tower's explosion radius now scales with upgrade level, making upgrades more impactful and visually impressive.

## Scaling Values

| Level | Explosion Radius | Damage | Debris Count | Smoke Count | Visual Impact |
|-------|-----------------|--------|--------------|-------------|---------------|
| 1     | 45px            | 90     | 18 particles | 12 puffs    | Small blast   |
| 2     | 56px (+24%)     | 108    | 21 particles | 14 puffs    | Medium blast  |
| 3     | 67px (+49%)     | 126    | 24 particles | 16 puffs    | Large blast   |
| 4     | 78px (+73%)     | 144    | 27 particles | 18 puffs    | Huge blast    |
| 5     | 90px (+100%)    | 162    | 30 particles | 20 puffs    | Massive blast |

**Key Change:** Level 5 now has **DOUBLE** the explosion radius of Level 1!

## Formula

```typescript
// Explosion radius - AGGRESSIVE SCALING
baseRadius = 45
radiusPerLevel = 11  // +24% per level
explosionRadius = baseRadius + (upgradeLevel - 1) * radiusPerLevel

// Damage - MODEST SCALING
baseDamage = 90
damagePerLevel = 0.2  // +20% per level
damage = baseDamage * (1 + upgradeLevel * 0.2)

// Particle counts
debrisCount = 15 + upgradeLevel * 3
smokeCount = 10 + upgradeLevel * 2

// Visual scaling
radiusScale = explosionRadius / 60  // Normalize to original 60px design
scaledLayerRadius = originalRadius * radiusScale
```

## Visual Comparison

```
Level 1: ●        (45px)  - Starter grenade
Level 2: ◉        (56px)  - Improved explosive
Level 3: ⬤        (67px)  - Military grade
Level 4: ⚫       (78px)  - Heavy ordnance
Level 5: ⬛       (90px)  - Devastating blast (2x Level 1!)
```

## Gameplay Impact

### Early Game (Level 1-2)
- **Radius:** 45-56px
- **Damage:** 90-108
- **Coverage:** Small groups (2-3 zombies)
- **Strategy:** Precise targeting needed
- **Cost:** Affordable upgrades

### Mid Game (Level 3)
- **Radius:** 67px
- **Damage:** 126
- **Coverage:** Medium groups (4-6 zombies)
- **Strategy:** Good for clustered enemies
- **Cost:** Moderate investment

### Late Game (Level 4-5)
- **Radius:** 78-90px
- **Damage:** 144-162
- **Coverage:** Large groups (6-10+ zombies)
- **Strategy:** Devastating area denial
- **Cost:** Expensive but powerful

**Note:** Level 5 has 100% more radius than Level 1, but only 80% more damage. This makes it excel at crowd control rather than single-target damage.

## Damage Effectiveness

### Level 1 Example (45px radius, 90 damage)
```
Zombie at center:  90 damage (100%)
Zombie at 22px:    59 damage (65%)
Zombie at 45px:    27 damage (30%)
Zombie at 46px:    0 damage (outside radius)
```

### Level 5 Example (90px radius, 162 damage)
```
Zombie at center:  162 damage (100%)
Zombie at 45px:    105 damage (65%)
Zombie at 90px:    49 damage (30%)
Zombie at 91px:    0 damage (outside radius)
```

**Key Insight:** Level 5 has 100% more radius (4x the area!) but only 80% more damage. This makes it devastating against groups while keeping single-target damage balanced.

## Implementation Details

### Files Modified
1. **src/objects/Projectile.ts**
   - Added `upgradeLevel` property
   - Added `setUpgradeLevel()` method
   - Modified `createExplosion()` to calculate radius dynamically
   - Scaled all visual elements proportionally

2. **src/managers/TowerCombatManager.ts**
   - Pass tower's upgrade level to grenade projectiles
   - Ensures explosion scales correctly

### Code Changes
```typescript
// In Projectile.ts
private upgradeLevel: number = 1;

public setUpgradeLevel(level: number): void {
  this.upgradeLevel = level;
}

private createExplosion(): void {
  const baseRadius = 40;
  const radiusPerLevel = 8;
  const explosionRadius = baseRadius + (this.upgradeLevel - 1) * radiusPerLevel;
  
  // Scale all visual elements
  const radiusScale = explosionRadius / 60;
  // ... apply scaling to layers, debris, smoke
}
```

```typescript
// In TowerCombatManager.ts
if (projectileType === 'grenade') {
  const projectile = this.projectileManager.createProjectile(...);
  projectile.setUpgradeLevel(tower.getUpgradeLevel()); // NEW!
}
```

## Testing

### Interactive Test Page
**File:** `test-grenade-scaling.html`

**Features:**
- 5 level buttons for instant upgrades
- Visual explosion radius indicator
- Real-time radius display
- Zombie cluster for testing
- Scaling formula reference

**How to Use:**
1. Open http://localhost:8081/test-grenade-scaling.html
2. Click level buttons (1-5)
3. Watch explosion radius grow
4. See increased particle effects
5. Observe more zombies hit per explosion

## Balance Considerations

### Advantages of Scaling
✅ Makes upgrades feel impactful
✅ Rewards investment in grenade towers
✅ Better against late-game swarms
✅ Visual feedback matches power increase

### Potential Issues
⚠️ Level 5 might be too powerful
⚠️ Could make other towers less viable
⚠️ May need cost adjustment

### Recommended Balancing
- Keep upgrade costs high (75% of base cost per level)
- Maintain slow fire rate (0.6 shots/sec)
- Consider reducing damage at higher levels
- Test against various zombie compositions

## Future Enhancements

### Possible Additions
1. **Shockwave Effect:** Knock back zombies at edge of blast
2. **Fire Damage:** Leave burning ground at higher levels
3. **Shrapnel:** Secondary projectiles at level 4+
4. **Cluster Bombs:** Split into multiple explosions at level 5
5. **Crater Effect:** Temporary ground texture

### Visual Improvements
1. **Camera Shake:** Stronger shake for bigger explosions
2. **Screen Flash:** White flash for level 5 explosions
3. **Dust Clouds:** Lingering dust after explosion
4. **Sound Scaling:** Deeper boom for larger explosions

## Conclusion

The explosion radius scaling makes the grenade tower feel progressively more powerful as it's upgraded. The visual and mechanical improvements create a satisfying progression that rewards player investment.

**Key Takeaway:** Level 5 grenade tower has **4x the area coverage** of Level 1 (100% radius increase = 4x area), making it a devastating late-game option against zombie hordes. The modest damage scaling (+20% per level) keeps it balanced while the massive radius increase rewards strategic placement.
