# Zombie Renderer Creation Guide

## Overview

This guide explains how to create new zombie renderers using the modular rendering system. Follow these steps to create consistent, performant zombie designs.

---

## Step 1: Choose Visual Identity

### Color Palette

Define 6 core colors for your zombie type:

```typescript
private readonly PRIMARY_COLOR = 0x______;  // Main body color
private readonly DARK_COLOR = 0x______;     // Shadows/details
private readonly PALE_COLOR = 0x______;     // Highlights (optional)
private readonly BLOOD_RED = 0x8b0000;      // Blood (standard)
private readonly BONE_WHITE = 0xcccccc;     // Bones (standard)
private readonly EYE_GLOW = 0x______;       // Eye color
```

### Color Scheme Examples

- **Basic**: Dark green (0x2d5016) - Classic zombie
- **Fast**: Dark orange (0x8b4513) - Aggressive/speed
- **Tank**: Dark red (0x5a1a1a) - Massive/dangerous
- **Armored**: Gray (0x4a4a4a) - Metallic/protected
- **Swarm**: Yellow-green (0x6a7a2a) - Sickly/numerous
- **Stealth**: Purple (0x3a2a4a) - Mysterious/shadowy
- **Mechanical**: Cyan-gray (0x3a4a5a) - Robotic/industrial

### Body Proportions

Define size based on zombie role:

```typescript
// Small (Swarm): 6x9px torso, 2px legs
// Normal (Basic/Fast): 8-10x11-12px torso, 2.5-3px legs
// Large (Tank): 14x16px torso, 4px legs
// Armored: 10x12px torso + armor plates
```

---

## Step 2: Create Renderer File

### File Location

```
src/renderers/zombies/types/[ZombieType]Renderer.ts
```

### Template Structure

```typescript
import { Container, Graphics } from 'pixi.js';
import { IZombieRenderer, ZombieRenderState } from '../ZombieRenderer';
import { ZombieAnimator } from '../ZombieAnimator';
import { ParticleType, ZombieParticleSystem } from '../ZombieParticleSystem';
import { GlowEffect, ShadowEffect } from '../components/ZombieEffects';

export class [ZombieType]Renderer implements IZombieRenderer {
  private graphics: Graphics;
  private animator: ZombieAnimator;
  private particles: ZombieParticleSystem;

  // Color palette
  private readonly PRIMARY_COLOR = 0x______;
  private readonly DARK_COLOR = 0x______;
  private readonly BLOOD_RED = 0x8b0000;
  private readonly BONE_WHITE = 0xcccccc;
  private readonly EYE_GLOW = 0x______;

  constructor() {
    this.graphics = new Graphics();
    this.animator = new ZombieAnimator('[ZOMBIE_TYPE]');
    this.particles = new ZombieParticleSystem();
  }

  render(container: Container, state: ZombieRenderState): void {
    // Implementation
  }

  update(deltaTime: number, state: ZombieRenderState): void {
    // Implementation
  }

  private drawArm(x: number, y: number, angle: number, alpha: number): void {
    // Implementation
  }

  private drawWounds(healthPercent: number, torsoY: number): void {
    // Implementation
  }

  showDamageEffect(_damageType: string, _amount: number): void {
    // Implementation
  }

  async playDeathAnimation(): Promise<void> {
    // Implementation
  }

  destroy(): void {
    this.graphics.destroy();
    this.particles.destroy();
  }

  getGraphics(): Graphics {
    return this.graphics;
  }
}
```

---

## Step 3: Implement Render Method

### Rendering Order (Back to Front)

```typescript
render(container: Container, state: ZombieRenderState): void {
  this.graphics.clear();
  const anim = this.animator.getCurrentFrame();
  const healthPercent = state.health / state.maxHealth;

  // 1. Shadow
  ShadowEffect.apply(this.graphics, 0, 15, shadowSize);

  // 2. Legs
  this.drawLegs(anim);

  // 3. Torso
  this.drawTorso(anim);

  // 4. Arms (back arm first)
  this.drawArm(leftX, leftY, anim.leftArmAngle, 0.7);
  this.drawArm(rightX, rightY, anim.rightArmAngle, 1.0);

  // 5. Head
  this.drawHead(anim);

  // 6. Details (wounds, armor, etc)
  this.drawWounds(healthPercent, torsoY);

  // 7. Health-based tinting
  this.applyHealthTint(healthPercent);

  // 8. Particles
  this.particles.render(this.graphics);

  container.addChild(this.graphics);
}
```

### Drawing Guidelines

**Legs:**

```typescript
const leftLegX = -3 + anim.leftLegOffset;
const rightLegX = 1 + anim.rightLegOffset;

this.graphics.rect(leftLegX, 10, width, height).fill(this.PRIMARY_COLOR);
this.graphics.rect(leftLegX, 10, width, height).stroke({
  color: 0x000000,
  width: 0.5,
  alpha: 0.6,
});
```

**Torso:**

```typescript
const torsoY = anim.bodyBob;
this.graphics
  .roundRect(-halfWidth, torsoY, width, height, 1)
  .fill(this.PRIMARY_COLOR)
  .stroke({ color: 0x000000, width: 1, alpha: 0.6 });
```

**Head:**

```typescript
const headY = torsoY - offset;
const headX = anim.headSway;

this.graphics.circle(headX, headY, radius).fill(this.PRIMARY_COLOR);
this.graphics.circle(headX, headY, radius).stroke({
  color: 0x000000,
  width: 1,
  alpha: 0.6,
});
```

**Eyes:**

```typescript
// Glow effect
GlowEffect.apply(this.graphics, eyeX, eyeY, glowRadius, this.EYE_GLOW);

// Eye socket
this.graphics.circle(eyeX, eyeY, socketRadius).fill({
  color: 0x000000,
  alpha: 0.9,
});

// Pupil
this.graphics.circle(eyeX, eyeY, pupilRadius).fill(this.EYE_GLOW);
```

---

## Step 4: Implement Update Method

### Standard Update Pattern

```typescript
update(deltaTime: number, state: ZombieRenderState): void {
  this.animator.update(deltaTime, state);
  this.particles.update(deltaTime);

  const healthPercent = state.health / state.maxHealth;

  // Blood drips when damaged
  if (healthPercent < 0.7 && Math.random() < 0.03) {
    this.particles.emit(ParticleType.BLOOD_DRIP, 0, 5, {
      count: 1,
      velocity: 15,
      lifetime: 1000,
      size: 1.5,
    });
  }

  // Type-specific particles
  // Add unique effects here (dust, sparks, smoke, etc)
}
```

### Particle Types

- `BLOOD_SPLATTER` - On damage
- `BLOOD_DRIP` - Continuous when damaged
- `DECAY_CLOUD` - Low health (organic zombies)
- `SMOKE` - Motion blur, fire damage
- `SPARKS` - Mechanical zombies, metal damage
- `FIRE` - Burning effect
- `ELECTRICITY` - Tesla damage

---

## Step 5: Implement Damage & Death

### Damage Effect

```typescript
showDamageEffect(_damageType: string, _amount: number): void {
  // Flash color (match zombie theme)
  const originalTint = this.graphics.tint;
  this.graphics.tint = this.EYE_GLOW; // Or 0xff0000 for red
  setTimeout(() => {
    this.graphics.tint = originalTint;
  }, 100);

  // Emit particles
  this.particles.emit(ParticleType.BLOOD_SPLATTER, 0, 0, {
    count: 3,
    velocity: 40,
    lifetime: 600,
    size: 2,
  });
}
```

### Death Animation

```typescript
async playDeathAnimation(): Promise<void> {
  return new Promise(resolve => {
    const startTime = Date.now();

    const animate = () => {
      const elapsed = Date.now() - startTime;

      if (elapsed < 300) {
        // Phase 1: Impact
        const t = elapsed / 300;
        this.graphics.rotation = t * 0.3;
        this.graphics.scale.set(1 + t * 0.2);
      } else if (elapsed < 800) {
        // Phase 2: Collapse
        const t = (elapsed - 300) / 500;
        this.graphics.rotation = 0.3 + t * (Math.PI / 2 - 0.3);
        this.graphics.scale.y = 1.2 - t * 0.9;
        this.graphics.alpha = 1 - t * 0.5;
      } else if (elapsed < 1500) {
        // Phase 3: Fade out
        const t = (elapsed - 800) / 700;
        this.graphics.alpha = 0.5 - t * 0.5;
        this.graphics.y += t * 5;
      } else {
        resolve();
        return;
      }

      requestAnimationFrame(animate);
    };

    // Death burst
    this.particles.emit(ParticleType.BLOOD_SPLATTER, 0, 0, {
      count: 8,
      velocity: 60,
      lifetime: 1000,
      size: 2.5,
    });

    animate();
  });
}
```

---

## Step 6: Add Animation Speed (Optional)

### For Fast/Slow Zombies

Update `ZombieAnimator.ts`:

```typescript
private getAnimationSpeed(): number {
  switch (this.zombieType) {
    case 'FAST': return 1.5;
    case 'TANK': return 0.7;
    case 'SWARM': return 1.3;
    default: return 1.0;
  }
}
```

---

## Step 7: Integration

### 1. Export Renderer

Add to `src/renderers/zombies/index.ts`:

```typescript
export { [ZombieType]Renderer } from './types/[ZombieType]Renderer';
```

### 2. Import in Zombie.ts

```typescript
import { [ZombieType]Renderer } from '../renderers/zombies/types/[ZombieType]Renderer';
```

### 3. Add to initializeVisual()

```typescript
if (this.useNewRenderer) {
  // ... existing types
  else if (this.type === GameConfig.ZOMBIE_TYPES.[TYPE]) {
    this.renderer = new [ZombieType]Renderer();
    return;
  }
}
```

---

## Step 8: Create Visual Reference Doc

Create `design_docs/Zombies/[TYPE]_ZOMBIE_VISUAL_REFERENCE.md`:

```markdown
# [Type] Zombie - Visual Reference

## Color Palette

[List colors with hex codes]

## Design Philosophy

[Describe visual theme and goals]

## Body Structure

[ASCII art diagram]

## Differences from Basic

[Comparison table]

## Animation Details

[Speed, movements, special effects]

## Strategic Role

[Gameplay purpose]
```

---

## Design Principles

### Visual Clarity

- **Silhouette**: Must be readable at all zoom levels
- **Color**: Distinct from other zombie types
- **Size**: Proportional to threat level
- **Animation**: Matches movement speed

### Performance

- **Simple shapes**: Circles, rectangles, lines
- **Minimal particles**: < 10 per zombie
- **Efficient rendering**: Reuse graphics objects
- **LOD ready**: Design works at low detail

### Consistency

- **Outline**: 0.5-1px black with 60% alpha
- **Eyes**: Always glowing with effect
- **Shadow**: Elliptical, 30% alpha
- **Wounds**: Blood spots, simple circles

### Uniqueness

- **Color scheme**: Unique to zombie type
- **Proportions**: Match role (lean/bulky/small)
- **Details**: 1-2 unique features max
- **Particles**: Type-specific effects

---

## Common Patterns

### Small Zombie (Swarm)

- 6x9px torso
- 2px legs
- 3.5px head
- Fast animation (1.3x)

### Normal Zombie (Basic/Fast)

- 8-10x11-12px torso
- 2.5-3px legs
- 4-4.5px head
- Standard animation (1.0-1.5x)

### Large Zombie (Tank)

- 14x16px torso
- 4px legs
- 6px head
- Slow animation (0.7x)

### Armored Zombie

- Normal base + armor plates
- Metallic colors
- Rivets/bolts details
- Standard animation

---

## Testing Checklist

- [ ] Renders correctly at all zoom levels
- [ ] Animations are smooth (60 FPS)
- [ ] Colors are distinct from other types
- [ ] Particles don't cause lag
- [ ] Health degradation visible
- [ ] Death animation satisfying
- [ ] Outline is subtle but effective
- [ ] Eyes glow properly
- [ ] Shadow renders correctly
- [ ] Works with 100+ zombies on screen

---

## Example: Creating a New Zombie

Let's create a "Toxic Zombie" step by step:

### 1. Visual Identity

- **Color**: Sickly green (0x4a6a2a)
- **Size**: Normal (9x11px torso)
- **Feature**: Dripping toxic ooze
- **Eyes**: Green glow (0x00ff00)

### 2. Create File

`src/renderers/zombies/types/ToxicZombieRenderer.ts`

### 3. Implement Render

- Green body with darker shading
- Toxic drip particles (green)
- Glowing green eyes
- Ooze puddles on ground

### 4. Add Unique Effect

```typescript
// Toxic drips
if (Math.random() < 0.08) {
  this.particles.emit(ParticleType.DECAY_CLOUD, 0, 8, {
    count: 1,
    velocity: 5,
    lifetime: 2000,
    size: 3,
  });
}
```

### 5. Integrate

- Export in index.ts
- Import in Zombie.ts
- Add to initializeVisual()

### 6. Document

Create visual reference with colors, proportions, and features.

---

## Tips & Best Practices

1. **Start with Basic**: Copy BasicZombieRenderer.ts as template
2. **Test Early**: View in-game frequently during development
3. **Keep It Simple**: 3-5 shapes max for body
4. **Subtle Outlines**: 0.5-1px with 50-60% alpha
5. **Unique Color**: Must be distinct from other types
6. **Match Speed**: Animation speed should match movement speed
7. **Particle Sparingly**: < 5% spawn chance per frame
8. **Health Feedback**: Wounds/tint changes with damage
9. **Death Satisfaction**: 3-phase animation with particles
10. **Document Everything**: Visual reference for consistency

---

## Common Issues

**Zombie too detailed:**

- Simplify to 3-5 main shapes
- Remove small details

**Outline too thick:**

- Reduce to 0.5-1px
- Lower alpha to 50-60%

**Particles lag:**

- Reduce spawn rate
- Lower particle count
- Shorter lifetime

**Animation jerky:**

- Check animation speed multiplier
- Smooth sine wave transitions
- Test at 60 FPS

**Colors blend together:**

- Increase contrast
- Use distinct hue
- Add subtle outline

---

## Resources

- **Color Picker**: Use hex codes for consistency
- **Animation Reference**: Watch zombie movies for movement
- **Performance Testing**: Test with 100+ zombies
- **Visual Reference**: Create ASCII art diagrams

---

**Remember**: Simple, readable, performant. These are the keys to great zombie design!
