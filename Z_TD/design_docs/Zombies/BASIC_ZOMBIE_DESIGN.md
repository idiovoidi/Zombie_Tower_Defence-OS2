# Basic Zombie - Complete Design Document

## Overview

The Basic Zombie is the foundational enemy type in Z-TD. It serves as the baseline for all other zombie variants and appears throughout the entire game. Its design emphasizes classic zombie aesthetics with shambling movement, decaying flesh, and relentless forward progression.

---

## Core Identity

**Archetype:** Classic Shambler
**Role:** Baseline threat, testing ground for tower effectiveness
**Theme:** Reanimated corpse, decay, relentless hunger

**Key Characteristics:**
- Slow but steady movement
- Balanced stats (no resistances/weaknesses)
- Iconic zombie appearance
- Most common enemy type

---

## Technical Specifications

### Stats
```typescript
{
  type: 'BASIC',
  baseHealth: 100,
  speed: 50,        // pixels per second
  reward: 10,       // money on death
  size: 10,         // pixels (radius)
  color: 0x00ff00   // green
}
```

### Health Scaling
```typescript
health = 100 * (1 + (wave - 1) * 0.15)
```
- Wave 1: 100 HP
- Wave 5: 160 HP
- Wave 10: 235 HP
- Wave 20: 385 HP

### Combat Properties
- **Damage Modifiers:** 100% from all tower types (no resistances/weaknesses)
- **Attack:** Melee damage to camp (1 damage per hit)
- **Detection:** Always visible, no stealth mechanics

### Spawn Rates
- Waves 1-5: 80% of spawns
- Waves 6-10: 60% of spawns
- Waves 11+: 50% of spawns

---

## Visual Design

### Color Palette
```typescript
PRIMARY_COLOR: 0x00ff00    // Zombie green (body)
DARK_GREEN: 0x006600       // Shadows, decay
PALE_GREEN: 0x88ff88       // Highlights, exposed flesh
BLOOD_RED: 0x8b0000        // Wounds, blood
BONE_WHITE: 0xeeeeee       // Exposed bones
EYE_GLOW: 0xff0000         // Glowing red eyes
```

### Body Proportions
```
Total Height: 25px
├── Head: 8px diameter (top)
├── Neck: 2px height
├── Torso: 12px height
└── Legs: 3px visible (rest below ground)

Width: 10px at shoulders
```

### Anatomy Components

#### 1. Head (8px diameter)
```typescript
// Main skull shape
- Circle: 8px diameter, 0x00ff00
- Eye sockets: 2px circles at (-2, -1) and (2, -1)
- Glowing eyes: 1.5px circles, 0xff0000 with glow effect
- Jaw: Small arc at bottom, slightly open
- Decay patches: 2-3 dark spots (0x006600)
```

#### 2. Torso (10px wide, 12px tall)
```typescript
// Main body
- Rounded rectangle: 10px x 12px, 0x00ff00
- Ribcage detail: 3-4 horizontal lines (0x006600)
- Wounds: 2-3 irregular shapes (0x8b0000)
- Tattered clothing: Ragged edges (0x333333)
```

#### 3. Arms (12px length each)
```typescript
// Left and right arms
- Line segments: 2px thick, 0x00ff00
- Shoulder joint: (-5, 0) and (5, 0)
- Elbow bend: Slight angle
- Hands: 3px circles at end
- Decay: Darker at extremities
```

#### 4. Legs (visible portion)
```typescript
// Partially visible below torso
- Two stumps: 3px visible, 3px wide each
- Positioned at (-3, 12) and (3, 12)
- Shambling stance: Slightly offset
```

---

## Animation System

### 1. Idle Animation (When Stationary)
**Duration:** 2 seconds loop
**Purpose:** Breathing, subtle movement

```typescript
// Breathing effect
bodyScale = 1.0 + Math.sin(time * 2) * 0.03  // ±3% scale
headBob = Math.sin(time * 2) * 0.5           // ±0.5px vertical

// Random twitches
if (Math.random() < 0.01) {
  headTilt = Math.random() * 0.2 - 0.1       // ±0.1 radians
}

// Dripping effect
if (Math.random() < 0.05) {
  emitParticle(BLOOD_DRIP, randomBodyPoint)
}
```

### 2. Walk Animation (Primary State)
**Duration:** 1.2 seconds per cycle
**Purpose:** Shambling forward movement

```typescript
// Limb swing (asymmetric for shambling effect)
leftArmAngle = Math.sin(time * 5) * 0.4      // ±0.4 radians
rightArmAngle = Math.sin(time * 5 + 1) * 0.3 // Offset phase

// Body bob (vertical oscillation)
bodyBob = Math.sin(time * 5) * 1.5           // ±1.5px

// Head sway (shambling effect)
headTilt = Math.sin(time * 2.5) * 0.15       // ±0.15 radians
headSway = Math.sin(time * 2.5) * 1.0        // ±1px horizontal

// Leg shuffle
leftLegOffset = Math.sin(time * 5) * 2
rightLegOffset = Math.sin(time * 5 + Math.PI) * 2
```

### 3. Attack Animation (At Camp)
**Duration:** 0.8 seconds
**Purpose:** Melee attack on camp

```typescript
// Lunge forward
Phase 1 (0-0.3s): Wind up
  - Pull back 5px
  - Raise arms

Phase 2 (0.3-0.5s): Strike
  - Lunge forward 10px
  - Swing arms down
  - Emit impact particles

Phase 3 (0.5-0.8s): Recovery
  - Return to idle position
  - Resume walk cycle
```

### 4. Damage Animation
**Duration:** 0.2 seconds
**Purpose:** Visual feedback for taking damage

```typescript
// Recoil effect
recoilX = damageDirection.x * -5             // Push back
recoilY = damageDirection.y * -5

// Flash effect
tint = 0xff0000                              // Red flash
alpha = 0.7                                  // Slight fade

// Particle burst
emitParticles(BLOOD_SPLATTER, hitPoint, 3-5)

// Shake
shakeX = Math.random() * 2 - 1
shakeY = Math.random() * 2 - 1
```

### 5. Death Animation
**Duration:** 1.5 seconds
**Purpose:** Satisfying death sequence

```typescript
Phase 1 (0-0.3s): Impact
  - Large recoil
  - Spin slightly (0.3 radians)
  - Emit blood burst (8-12 particles)

Phase 2 (0.3-0.8s): Collapse
  - Scale down vertically (1.0 → 0.3)
  - Rotate to horizontal (0 → π/2)
  - Fade alpha (1.0 → 0.5)

Phase 3 (0.8-1.5s): Fade Out
  - Continue fade (0.5 → 0)
  - Slight sink into ground (-5px)
  - Leave blood decal

Phase 4: Cleanup
  - Remove from game
  - Pool graphics object
```

---

## Particle Effects

### Blood Splatter (On Damage)
```typescript
{
  count: 3-5,
  color: 0x8b0000,
  size: 2-4px,
  velocity: 30-60 px/s,
  lifetime: 0.5-1.0s,
  gravity: 200 px/s²,
  fadeOut: true
}
```

### Blood Drip (Idle/Walk)
```typescript
{
  count: 1,
  color: 0x8b0000,
  size: 1-2px,
  velocity: 10-20 px/s (downward),
  lifetime: 1.0-2.0s,
  gravity: 100 px/s²,
  spawnRate: 5% per frame
}
```

### Decay Cloud (Low Health)
```typescript
{
  count: 1-2,
  color: 0x006600,
  size: 3-6px,
  velocity: 5-15 px/s (upward),
  lifetime: 2.0-3.0s,
  gravity: -20 px/s² (float up),
  fadeOut: true,
  spawnRate: 10% per frame when health < 30%
}
```

### Death Burst
```typescript
{
  count: 10-15,
  colors: [0x8b0000, 0x006600, 0xeeeeee],
  size: 2-5px,
  velocity: 50-100 px/s (radial),
  lifetime: 0.8-1.5s,
  gravity: 150 px/s²,
  fadeOut: true
}
```

---

## Visual Effects

### 1. Eye Glow
```typescript
// Layered glow effect
for (let i = 3; i > 0; i--) {
  graphics.circle(eyeX, eyeY, 1.5 * (i / 3))
    .fill({ 
      color: 0xff0000, 
      alpha: 0.3 * (4 - i) / 3 
    });
}
```

### 2. Shadow
```typescript
// Elliptical ground shadow
graphics.ellipse(
  zombieX, 
  zombieY + 15,  // Below zombie
  8,             // Width
  4              // Height (flattened)
).fill({ 
  color: 0x000000, 
  alpha: 0.3 
});
```

### 3. Health-Based Degradation

**100-75% Health:** Normal appearance
```typescript
- Full color saturation
- 2 small wounds
- Minimal blood drips
```

**75-50% Health:** Damaged
```typescript
- Slightly darker tint (0.9 brightness)
- 3-4 wounds
- More frequent blood drips
- 1-2 exposed bone spots
```

**50-25% Health:** Severely Damaged
```typescript
- Darker tint (0.7 brightness)
- 5-6 large wounds
- Constant blood drips
- 3-4 exposed bone areas
- Limping animation (slower arm swing)
```

**25-0% Health:** Critical
```typescript
- Very dark tint (0.5 brightness)
- Body covered in wounds
- Heavy blood trail
- Exposed ribcage visible
- Severe limping (reduced speed visual)
- Decay cloud particles
```

### 4. Status Effect Visuals

**Burning (Flame Tower):**
```typescript
- Orange glow overlay (0xff6600, alpha 0.5)
- Fire particles rising (3-5 per frame)
- Smoke trail (gray particles)
- Flickering brightness
```

**Electrocuted (Tesla Tower):**
```typescript
- Blue-white flash (0x00ffff)
- Lightning arc particles
- Spasm animation (rapid shake)
- Crackling effect (small white particles)
```

**Slowed (Ice/Slow Effect):**
```typescript
- Blue tint overlay (0x0088ff, alpha 0.3)
- Frost particles
- Reduced animation speed
- Ice crystal details
```

---

## Rendering Implementation

### Render Order (Back to Front)
```typescript
1. Shadow
2. Blood decals (if any)
3. Legs
4. Torso
5. Arms (back arm)
6. Head
7. Arms (front arm)
8. Wounds/details
9. Eye glow
10. Particles
11. Status effects
```

### Drawing Code Structure
```typescript
class BasicZombieRenderer implements IZombieRenderer {
  render(container: Container, state: ZombieRenderState): void {
    this.graphics.clear();
    
    // 1. Shadow
    this.drawShadow();
    
    // 2. Body parts with animation
    const anim = this.animator.getCurrentFrame();
    this.drawLegs(anim);
    this.drawTorso(anim);
    this.drawArm('back', anim);
    this.drawHead(anim);
    this.drawArm('front', anim);
    
    // 3. Details based on health
    this.drawHealthDegradation(state.health / state.maxHealth);
    
    // 4. Effects
    this.drawEyeGlow();
    this.drawStatusEffects(state.statusEffects);
    
    // 5. Particles
    this.particles.render(this.graphics);
    
    container.addChild(this.graphics);
  }
}
```

---

## Performance Optimization

### Level of Detail (LOD)

**High Detail (< 300px from camera):**
- Full animation
- All particles
- Eye glow
- Detailed wounds
- Status effects

**Medium Detail (300-600px):**
- Simplified animation
- Reduced particles (50%)
- No eye glow
- Basic wounds
- Status effects

**Low Detail (> 600px):**
- Static pose or simple bob
- No particles
- No details
- Solid color shape
- No status effects

### Culling
```typescript
// Don't render if off-screen
if (!camera.bounds.contains(zombie.position)) {
  return;
}
```

### Object Pooling
```typescript
// Reuse Graphics objects
const graphics = GraphicsPool.acquire();
// ... render zombie
GraphicsPool.release(graphics);
```

---

## Audio Design (Future)

### Sound Effects
- **Footsteps:** Wet, dragging sound (0.3s interval)
- **Groan:** Low moan (random, 3-5s interval)
- **Damage:** Wet impact, grunt
- **Death:** Final groan, body collapse
- **Attack:** Snarl, swipe sound

### Audio Properties
- Volume: Based on distance from camera
- Pitch: Slight random variation (±10%)
- Panning: Based on horizontal position

---

## Strategic Role

### Early Game (Waves 1-5)
- Primary threat (80% of spawns)
- Tests basic tower placement
- Teaches resource management
- Establishes baseline difficulty

### Mid Game (Waves 6-10)
- Still common (60% of spawns)
- Mixed with Fast and Tank zombies
- Fills gaps between special types
- Maintains pressure

### Late Game (Waves 11+)
- Balanced presence (50% of spawns)
- Serves as "filler" between threats
- Tests sustained tower damage
- Provides steady income

### Counter Strategy
- **Effective Towers:** All towers equally effective (100% damage)
- **Placement:** Any defensive position works
- **Upgrades:** Benefits from all upgrade types
- **Economy:** Good money-to-threat ratio ($10 for 100 HP)

---

## Testing Checklist

### Visual Testing
- [ ] Renders correctly at all zoom levels
- [ ] Animations are smooth (60 FPS)
- [ ] Colors match specification
- [ ] Particles don't cause lag
- [ ] Health degradation visible
- [ ] Death animation satisfying

### Gameplay Testing
- [ ] Movement speed feels right (50 px/s)
- [ ] Health scales correctly with waves
- [ ] Takes correct damage from all towers
- [ ] Rewards correct amount ($10)
- [ ] Spawns at correct rates
- [ ] Attacks camp correctly

### Performance Testing
- [ ] 100 zombies maintain 60 FPS
- [ ] LOD system works correctly
- [ ] Memory doesn't leak
- [ ] Graphics pool functions
- [ ] Culling reduces draw calls

---

## Implementation Priority

### Phase 1: Core Rendering ✓
- [x] Basic shape rendering
- [x] Color and size
- [x] Simple movement

### Phase 2: Animation (Current Focus)
- [ ] Walk cycle implementation
- [ ] Idle breathing
- [ ] Damage recoil
- [ ] Death sequence

### Phase 3: Details
- [ ] Wounds and decay
- [ ] Eye glow effect
- [ ] Shadow rendering
- [ ] Health degradation

### Phase 4: Particles
- [ ] Blood splatter system
- [ ] Drip particles
- [ ] Death burst
- [ ] Decay cloud

### Phase 5: Polish
- [ ] Status effect visuals
- [ ] LOD system
- [ ] Performance optimization
- [ ] Audio integration

---

## Code Example: Complete Renderer

```typescript
// src/renderers/zombies/types/BasicZombieRenderer.ts

import { Graphics, Container } from 'pixi.js';
import { IZombieRenderer, ZombieRenderState } from '../ZombieRenderer';
import { ZombieAnimator } from '../ZombieAnimator';
import { ZombieParticleSystem, ParticleType } from '../ZombieParticleSystem';
import { ZombieBodyParts } from '../components/ZombieBodyParts';
import { GlowEffect, ShadowEffect } from '../components/ZombieEffects';

export class BasicZombieRenderer implements IZombieRenderer {
  private graphics: Graphics;
  private animator: ZombieAnimator;
  private particles: ZombieParticleSystem;
  
  private readonly PRIMARY_COLOR = 0x00ff00;
  private readonly DARK_GREEN = 0x006600;
  private readonly BLOOD_RED = 0x8b0000;
  private readonly EYE_GLOW = 0xff0000;
  
  constructor() {
    this.graphics = new Graphics();
    this.animator = new ZombieAnimator('BASIC');
    this.particles = new ZombieParticleSystem();
  }
  
  render(container: Container, state: ZombieRenderState): void {
    this.graphics.clear();
    
    const anim = this.animator.getCurrentFrame();
    const healthPercent = state.health / state.maxHealth;
    
    // Shadow
    ShadowEffect.apply(this.graphics, 0, 15, 8);
    
    // Legs (with shuffle animation)
    this.graphics
      .rect(-4 + anim.leftLegOffset, 10, 3, 5)
      .fill(this.PRIMARY_COLOR);
    this.graphics
      .rect(1 + anim.rightLegOffset, 10, 3, 5)
      .fill(this.PRIMARY_COLOR);
    
    // Torso (with bob)
    const torsoY = anim.bodyBob;
    this.graphics
      .roundRect(-5, torsoY, 10, 12, 2)
      .fill(this.PRIMARY_COLOR);
    
    // Ribcage detail
    for (let i = 0; i < 4; i++) {
      this.graphics
        .rect(-4, torsoY + 2 + i * 2.5, 8, 1)
        .fill({ color: this.DARK_GREEN, alpha: 0.5 });
    }
    
    // Arms (with swing)
    this.drawArm(-5, torsoY + 2, anim.leftArmAngle, 'back');
    this.drawArm(5, torsoY + 2, anim.rightArmAngle, 'front');
    
    // Head (with tilt and sway)
    const headY = torsoY - 10;
    const headX = anim.headSway;
    this.graphics.save();
    this.graphics.translate(headX, headY);
    this.graphics.rotate(anim.headTilt);
    
    // Head circle
    this.graphics.circle(0, 0, 4).fill(this.PRIMARY_COLOR);
    
    // Eyes with glow
    GlowEffect.apply(this.graphics, -2, -1, 1.5, this.EYE_GLOW);
    GlowEffect.apply(this.graphics, 2, -1, 1.5, this.EYE_GLOW);
    
    // Jaw
    this.graphics
      .arc(0, 1, 3, 0.3, Math.PI - 0.3)
      .stroke({ color: this.DARK_GREEN, width: 1 });
    
    this.graphics.restore();
    
    // Wounds based on health
    this.drawWounds(healthPercent);
    
    // Status effects
    this.drawStatusEffects(state.statusEffects);
    
    // Particles
    this.particles.render(this.graphics);
    
    container.addChild(this.graphics);
  }
  
  update(deltaTime: number, state: ZombieRenderState): void {
    this.animator.update(deltaTime, state);
    this.particles.update(deltaTime);
    
    // Emit drip particles occasionally
    if (Math.random() < 0.05) {
      this.particles.emit(ParticleType.BLOOD_DRIP, 0, 5, {
        count: 1,
        velocity: 15,
        lifetime: 1000
      });
    }
    
    // Emit decay cloud when low health
    if (state.health / state.maxHealth < 0.3 && Math.random() < 0.1) {
      this.particles.emit(ParticleType.DECAY_CLOUD, 0, 0, {
        count: 1,
        velocity: 10,
        lifetime: 2000
      });
    }
  }
  
  private drawArm(x: number, y: number, angle: number, layer: 'front' | 'back'): void {
    const alpha = layer === 'back' ? 0.7 : 1.0;
    
    // Upper arm
    const elbowX = x + Math.cos(angle) * 6;
    const elbowY = y + Math.sin(angle) * 6;
    
    this.graphics
      .moveTo(x, y)
      .lineTo(elbowX, elbowY)
      .stroke({ color: this.PRIMARY_COLOR, width: 2, alpha });
    
    // Lower arm
    const handX = elbowX + Math.cos(angle + 0.3) * 6;
    const handY = elbowY + Math.sin(angle + 0.3) * 6;
    
    this.graphics
      .moveTo(elbowX, elbowY)
      .lineTo(handX, handY)
      .stroke({ color: this.PRIMARY_COLOR, width: 2, alpha });
    
    // Hand
    this.graphics
      .circle(handX, handY, 1.5)
      .fill({ color: this.PRIMARY_COLOR, alpha });
  }
  
  private drawWounds(healthPercent: number): void {
    const woundCount = Math.floor((1 - healthPercent) * 6);
    
    for (let i = 0; i < woundCount; i++) {
      const x = (Math.random() - 0.5) * 8;
      const y = (Math.random() - 0.5) * 10;
      const size = 1 + Math.random() * 2;
      
      this.graphics
        .circle(x, y, size)
        .fill({ color: this.BLOOD_RED, alpha: 0.8 });
    }
  }
  
  private drawStatusEffects(effects: string[]): void {
    // Implementation for burning, frozen, etc.
  }
  
  showDamageEffect(damageType: string, amount: number): void {
    // Flash red
    this.graphics.tint = 0xff0000;
    setTimeout(() => this.graphics.tint = 0xffffff, 100);
    
    // Emit blood particles
    this.particles.emit(ParticleType.BLOOD_SPLATTER, 0, 0, {
      count: 5,
      velocity: 50,
      lifetime: 800
    });
  }
  
  playDeathAnimation(): Promise<void> {
    return new Promise(resolve => {
      // Death animation sequence
      // ... implementation
      setTimeout(resolve, 1500);
    });
  }
  
  destroy(): void {
    this.graphics.destroy();
    this.particles.destroy();
  }
}
```

---

## Summary

The Basic Zombie is the cornerstone of Z-TD's enemy design. Its simple yet effective visual style, balanced stats, and smooth animations create a satisfying baseline enemy that players will encounter throughout the entire game. The modular rendering system allows for easy extension to other zombie types while maintaining consistent quality and performance.

**Key Strengths:**
- Clear visual identity (green shambling corpse)
- Smooth procedural animations
- Rich particle effects
- Performance-optimized rendering
- Extensible architecture

**Next Steps:**
1. Implement walk cycle animation
2. Add particle system integration
3. Create health degradation visuals
4. Optimize for 100+ simultaneous zombies
5. Polish death animation sequence
