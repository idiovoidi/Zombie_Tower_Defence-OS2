# Grenade Tower Explosion Scaling

## Overview
The grenade tower's explosion radius now scales with upgrade level, making upgrades more impactful and visually impressive.

## Scaling Values

| Level | Explosion Radius | Debris Count | Smoke Count | Visual Impact |
|-------|-----------------|--------------|-------------|---------------|
| 1     | 40px            | 18 particles | 12 puffs    | Small blast   |
| 2     | 48px (+20%)     | 21 particles | 14 puffs    | Medium blast  |
| 3     | 56px (+40%)     | 24 particles | 16 puffs    | Large blast   |
| 4     | 64px (+60%)     | 27 particles | 18 puffs    | Huge blast    |
| 5     | 72px (+80%)     | 30 particles | 20 puffs    | Massive blast |

## Formula

```typescript
// Explosion radius
baseRadius = 40
radiusPerLevel = 8
explosionRadius = baseRadius + (upgradeLevel - 1) * radiusPerLevel

// Particle counts
debrisCount = 15 + upgradeLevel * 3
smokeCount = 10 + upgradeLevel * 2

// Visual scaling
radiusScale = explosionRadius / 60  // Normalize to original 60px design
scaledLayerRadius = originalRadius * radiusScale
```

## Visual Comparison

```
Level 1: ●        (40px)  - Starter grenade
Level 2: ◉        (48px)  - Improved explosive
Level 3: ⬤        (56px)  - Military grade
Level 4: ⚫       (64px)  - Heavy ordnance
Level 5: ⬛       (72px)  - Devastating blast
```

## Gameplay Impact

### Early Game (Level 1-2)
- **Radius:** 40-48px
- **Coverage:** Small groups (2-3 zombies)
- **Strategy:** Precise targeting needed
- **Cost:** Affordable upgrades

### Mid Game (Level 3)
- **Radius:** 56px
- **Coverage:** Medium groups (3-5 zombies)
- **Strategy:** Good for clustered enemies
- **Cost:** Moderate investment

### Late Game (Level 4-5)
- **Radius:** 64-72px
- **Coverage:** Large groups (5-8 zombies)
- **Strategy:** Devastating area denial
- **Cost:** Expensive but powerful

## Damage Effectiveness

### Level 1 Example
```
Zombie at center:  100 damage (100%)
Zombie at 20px:    65 damage (65%)
Zombie at 40px:    30 damage (30%)
Zombie at 41px:    0 damage (outside radius)
```

### Level 5 Example
```
Zombie at center:  100 damage (100%)
Zombie at 36px:    65 damage (65%)
Zombie at 72px:    30 damage (30%)
Zombie at 73px:    0 damage (outside radius)
```

**Note:** Level 5 has 80% more coverage area than Level 1!

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

**Key Takeaway:** Level 5 grenade tower has 80% more area coverage than Level 1, making it a devastating late-game option against zombie hordes.
