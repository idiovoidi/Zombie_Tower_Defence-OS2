# Tower-Specific Zombie Death Animations

## Overview
Implement distinct death animations for zombies based on the tower type that delivers the killing blow. This enhances visual feedback, improves game feel, and reinforces tower identity.

## Current Architecture Analysis

### Damage Flow
```
Tower -> Projectile (with towerType) -> Zombie.takeDamage(modifiedDamage)
                                      -> HealthComponent.takeDamage(damage)
                                      -> if dead: onDeath()
                                        -> emit 'zombieDeath' event
                                        -> renderer.playDeathAnimation()
```

### Identified Gaps
1. **Projectile.ts**: `takeDamage(modifiedDamage)` is called without passing `towerType`
2. **Zombie.ts**: No tracking of which tower type dealt damage
3. **Death event**: `zombieDeath` event doesn't include `towerType`
4. **Renderer**: `playDeathAnimation()` has no tower type context

## Implementation Plan

### Phase 1: Propagate Tower Type Through Damage Chain

#### 1.1 Update Projectile.ts
**File**: `src/objects/Projectile.ts`
**Lines**: 223, 327

Pass `towerType` to `takeDamage()` calls:
```typescript
// Line 223 - direct hit
this.target.takeDamage(modifiedDamage, this.towerType);

// Line 327 - splash damage
zombie.takeDamage(modifiedDamage, this.towerType);
```

#### 1.2 Update Zombie.ts
**File**: `src/objects/Zombie.ts`

Add last damage source tracking:
```typescript
private lastDamageSource: string = 'unknown';

public takeDamage(damage: number, towerType?: string): number {
  // Track damage source for death animation selection
  if (towerType && damage > 0) {
    this.lastDamageSource = towerType;
  }
  // ... rest of method
}

private async onDeath(): Promise<void> {
  this.emit('zombieDeath', {
    x: this.position.x,
    y: this.position.y,
    type: this.type,
    size: this.getVisualSize(),
    killerType: this.lastDamageSource, // NEW: Add killer info
  });

  if (this.renderer) {
    await this.renderer.playDeathAnimation(this.lastDamageSource); // NEW: Pass killer type
  }
}
```

#### 1.3 Update ZombieManager.ts
**File**: `src/managers/ZombieManager.ts`
**Lines**: 158, 172

Update event handler to receive killer type:
```typescript
zombie.on('zombieDeath', (data: { 
  x: number; 
  y: number; 
  type: string; 
  size: number;
  killerType: string; // NEW
}) => {
  this.onZombieDeath(data);
});
```

### Phase 2: Implement Animation Variants

#### 2.1 Update BaseZombieRenderer.ts
**File**: `src/renderers/zombies/BaseZombieRenderer.ts`

Modify `playDeathAnimation()` signature and add animation selection:
```typescript
async playDeathAnimation(killerType: string = 'unknown'): Promise<void> {
  // Select animation variant based on killer
  switch (killerType) {
    case 'Flame':
      return this.playBurnDeathAnimation();
    case 'Grenade':
    case 'Tesla':
      return this.playExplosiveDeathAnimation();
    case 'Shotgun':
      return this.playKnockbackDeathAnimation();
    case 'Sniper':
      return this.playPrecisionDeathAnimation();
    case 'MachineGun':
    default:
      return this.playDefaultDeathAnimation();
  }
}
```

#### 2.2 Animation Specifications

| Tower Type | Animation Style | Visual Elements | Duration |
|------------|-----------------|-----------------|----------|
| **MachineGun** | Standard 3-phase rotation + scale | Blood spray, body drop | 800ms |
| **Sniper** | Precision headshot | Head separates, delayed body collapse | 1000ms |
| **Shotgun** | Violent knockback | Body thrown backward, blood spread | 900ms |
| **Flame** | Burning collapse | Orange tint, smoke particles, charred corpse | 1200ms |
| **Tesla** | Electrical disintegration | Blue sparks, body shrink, flash fade | 1000ms |
| **Grenade** | Explosive ragdoll | Limbs separate, debris spray | 800ms |
| **Sludge** | Melting dissolve | Green dissolve effect, puddle form | 1100ms |

### Phase 3: Corpse Variants (Optional Enhancement)

Update `CorpseManager.ts` to render different corpse styles:

```typescript
// Add to corpse data structure
interface CorpseData {
  x: number;
  y: number;
  type: string;
  rotation: number;
  createdAt: number;
  alpha: number;
  killerType: string; // NEW: Affects corpse appearance
}

// Render burned corpse for flame kills
private renderBurnedCorpse(...): void {
  // Darkened colors, char marks
}

// Render gibbed corpse for explosive kills
private renderGibbedCorpse(...): void {
  // Multiple body parts
}
```

## Performance Considerations

### Time Budget
- Current corpse budget: **1ms/frame** (`@/src/config/devConfig.ts:67`)
- Animation overhead: +0.5ms during death bursts
- Mitigation: Limit simultaneous death animations to 5 per frame

### Memory Impact
- No additional persistent objects
- Particle systems reuse existing pools
- Animation state is transient (per-zombie, short duration)

### Fallback Strategy
If FPS drops below 40 during testing:
1. Reduce animation complexity for non-lethal damage sources
2. Skip corpse variants, keep only animation
3. Defer to static death poses for mass kills (>3 simultaneous)

## Testing Strategy

### Unit Tests
```typescript
// Zombie.test.ts
it('should track last damage source', () => {
  zombie.takeDamage(50, 'Sniper');
  expect(zombie.getLastDamageSource()).toBe('Sniper');
});

// BaseZombieRenderer.test.ts
it('should play burn animation for flame kills', async () => {
  const spy = vi.spyOn(renderer, 'playBurnDeathAnimation');
  await renderer.playDeathAnimation('Flame');
  expect(spy).toHaveBeenCalled();
});
```

### Integration Tests
- Spawn each tower type, verify distinct death animations
- Test rapid kills (wave 10+) for performance impact
- Verify corpse appearance matches killer type

## Implementation Checklist

- [ ] 1. Update `Projectile.ts` to pass `towerType` to `takeDamage()`
- [ ] 2. Add `lastDamageSource` tracking in `Zombie.ts`
- [ ] 3. Update `zombieDeath` event to include `killerType`
- [ ] 4. Update `ZombieManager.ts` event handler signature
- [ ] 5. Modify `playDeathAnimation()` to accept `killerType` parameter
- [ ] 6. Implement animation variants per tower type
- [ ] 7. Add corpse styling based on killer type (optional)
- [ ] 8. Performance testing with max wave density
- [ ] 9. Update documentation

## Future Extensions

1. **Combo Animations**: Special animations for same-tower multi-kills
2. **Environmental Deaths**: Different animations for environmental hazards
3. **Boss Deaths**: Extended sequences for special zombie types
4. **Player Stats**: Track "favorite kill method" based on animation triggers

## References

- Current death animation: `@/src/renderers/zombies/BaseZombieRenderer.ts:104-150`
- Death event emission: `@/src/objects/Zombie.ts:320-325`
- Corpse rendering: `@/src/managers/CorpseManager.ts:59-114`
- Performance budgets: `@/src/config/devConfig.ts:62-68`
