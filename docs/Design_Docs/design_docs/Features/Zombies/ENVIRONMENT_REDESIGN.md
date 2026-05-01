# Zombie & Environment Visual Redesign - Technical Plan

## Overview

This document outlines a technical approach to redesigning zombie visuals and environment elements using PixiJS Graphics API (code-based drawing). The goal is to create more dynamic, modular, and visually appealing graphics without relying on external assets.

---

## 1. Zombie Visual System Architecture

### 1.1 Current State Analysis

**Strengths:**

- All 7 zombie types have unique visual identities
- Visual code is embedded in `Zombie.ts` class
- Each type has distinct colors, sizes, and details
- Health bars, damage effects, and death animations exist

**Weaknesses:**

- Monolithic visual code (700+ lines in single class)
- No separation of concerns (logic + rendering mixed)
- Hard to maintain and extend
- No animation system beyond sway
- Visual effects are basic (flash red on damage)
- No particle systems or advanced effects

### 1.2 Proposed Architecture

```
src/renderers/zombies/
├── ZombieRenderer.ts          # Main renderer coordinator
├── ZombieAnimator.ts          # Animation state machine
├── ZombieParticleSystem.ts    # Blood, decay, sparks effects
├── types/
│   ├── BasicZombieRenderer.ts
│   ├── FastZombieRenderer.ts
│   ├── TankZombieRenderer.ts
│   ├── ArmoredZombieRenderer.ts
│   ├── SwarmZombieRenderer.ts
│   ├── StealthZombieRenderer.ts
│   └── MechanicalZombieRenderer.ts
└── components/
    ├── ZombieBodyParts.ts     # Reusable body part generators
    ├── ZombieEffects.ts       # Visual effects (glow, shadow, etc)
    └── ZombieHealthBar.ts     # Enhanced health bar component
```

---

## 2. Zombie Rendering System

### 2.1 Base Renderer Interface

```typescript
interface IZombieRenderer {
  // Core rendering
  render(container: Container, state: ZombieRenderState): void;
  update(deltaTime: number, state: ZombieRenderState): void;

  // Animation states
  playIdleAnimation(): void;
  playWalkAnimation(): void;
  playAttackAnimation(): void;
  playDamageAnimation(): void;
  playDeathAnimation(): void;

  // Effects
  showDamageEffect(damageType: TowerType, amount: number): void;
  showStatusEffect(effect: StatusEffect): void;

  // Cleanup
  destroy(): void;
}

interface ZombieRenderState {
  position: { x: number; y: number };
  health: number;
  maxHealth: number;
  speed: number;
  direction: { x: number; y: number };
  isMoving: boolean;
  isDamaged: boolean;
  statusEffects: StatusEffect[];
}
```

### 2.2 Modular Body Part System

Create reusable components for zombie anatomy:

```typescript
// src/renderers/zombies/components/ZombieBodyParts.ts

class ZombieBodyParts {
  // Head variations
  static drawRottenHead(graphics: Graphics, x: y, size: number, decay: number): void;
  static drawSkullHead(graphics: Graphics, x: y, size: number): void;
  static drawHelmetHead(graphics: Graphics, x: y, size: number): void;

  // Body variations
  static drawHumanoidBody(graphics: Graphics, x: y, width: number, height: number): void;
  static drawBloatedBody(graphics: Graphics, x: y, width: number, height: number): void;
  static drawMechanicalBody(graphics: Graphics, x: y, width: number, height: number): void;

  // Limbs
  static drawArm(graphics: Graphics, x: y, length: number, angle: number, decay: number): void;
  static drawLeg(graphics: Graphics, x: y, length: number, angle: number): void;

  // Details
  static drawWounds(graphics: Graphics, x: y, count: number, severity: number): void;
  static drawBloodStains(graphics: Graphics, x: y, count: number): void;
  static drawExposedBones(graphics: Graphics, x: y, positions: Array<{ x; y }>): void;
  static drawArmor(graphics: Graphics, x: y, type: ArmorType): void;
}
```

---

## 3. Animation System

### 3.1 Animation State Machine

```typescript
enum ZombieAnimationState {
  IDLE = 'idle',
  WALK = 'walk',
  ATTACK = 'attack',
  DAMAGE = 'damage',
  DEATH = 'death',
}

class ZombieAnimator {
  private currentState: ZombieAnimationState;
  private animationTime: number = 0;
  private frameData: Map<ZombieAnimationState, AnimationFrame[]>;

  // Procedural animations
  private limbSwing: number = 0;
  private bodyBob: number = 0;
  private headTilt: number = 0;

  update(deltaTime: number, zombieType: string): AnimationData {
    this.animationTime += deltaTime;

    // Calculate procedural animation values
    this.limbSwing = Math.sin(this.animationTime * this.getSwingSpeed(zombieType));
    this.bodyBob = Math.sin(this.animationTime * 2) * this.getBobAmount(zombieType);
    this.headTilt = Math.sin(this.animationTime * 0.5) * 0.1;

    return {
      limbSwing: this.limbSwing,
      bodyBob: this.bodyBob,
      headTilt: this.headTilt,
      // ... more animation data
    };
  }
}
```

### 3.2 Procedural Animation Techniques

**Walking Animation:**

- Limb swing using sine waves (different frequencies per zombie type)
- Body bobbing (vertical oscillation)
- Head sway (shambling effect)
- Speed-based animation scaling

**Idle Animation:**

- Breathing effect (subtle scale pulsing)
- Random twitches
- Dripping effects (blood, oil)

**Attack Animation:**

- Lunge forward
- Arm swing
- Jaw snap

**Damage Animation:**

- Recoil based on damage direction
- Flash effect (color tint)
- Particle burst (blood, sparks, etc)
- Shake/vibration

**Death Animation:**

- Collapse sequence (multi-stage)
- Fade out
- Particle explosion
- Corpse creation

---

## 4. Particle System

### 4.1 Particle Types

```typescript
enum ParticleType {
  BLOOD_SPLATTER,
  BLOOD_DRIP,
  DECAY_CLOUD,
  SPARKS,
  SMOKE,
  FIRE,
  ELECTRICITY,
  BONE_FRAGMENTS,
  METAL_SHARDS,
}

class ZombieParticleSystem {
  private particles: Particle[] = [];

  emit(type: ParticleType, x: number, y: number, config: ParticleConfig): void {
    // Create particle burst
  }

  update(deltaTime: number): void {
    // Update all particles (physics, lifetime, fade)
  }

  render(graphics: Graphics): void {
    // Draw all active particles
  }
}
```

### 4.2 Particle Effects by Zombie Type

**Basic Zombie:**

- Blood splatters (dark red)
- Decay particles (green mist)
- Flesh chunks on death

**Fast Zombie:**

- Motion blur trails
- Blood spray (high velocity)
- Dust clouds from rapid movement

**Tank Zombie:**

- Ground shake particles
- Large blood pools
- Debris on death

**Armored Zombie:**

- Metal sparks when hit
- Armor fragments on death
- Rust particles

**Swarm Zombie:**

- Small blood droplets
- Swarm cloud effect (multiple zombies)
- Quick dissipation

**Stealth Zombie:**

- Shadow wisps
- Fade in/out particles
- Ghostly trails

**Mechanical Zombie:**

- Electric sparks
- Oil leaks
- Gear fragments
- Smoke from damage

---

## 5. Enhanced Visual Effects

### 5.1 Shader-like Effects (Using Graphics API)

**Glow Effect:**

```typescript
class GlowEffect {
  static apply(graphics: Graphics, x: number, y: number, radius: number, color: number): void {
    // Draw multiple circles with decreasing alpha
    for (let i = 5; i > 0; i--) {
      graphics.circle(x, y, radius * (i / 5)).fill({ color, alpha: 0.1 * (6 - i) });
    }
  }
}
```

**Shadow Effect:**

```typescript
class ShadowEffect {
  static apply(graphics: Graphics, x: number, y: number, size: number, direction: Vector2): void {
    // Elliptical shadow based on light direction
    graphics
      .ellipse(x + direction.x * 5, y + direction.y * 5, size, size * 0.5)
      .fill({ color: 0x000000, alpha: 0.3 });
  }
}
```

**Outline Effect:**

```typescript
class OutlineEffect {
  static apply(graphics: Graphics, shape: Graphics, color: number, width: number): void {
    // Redraw shape with stroke only
    shape.stroke({ color, width });
  }
}
```

### 5.2 Dynamic Visual States

**Health-Based Degradation:**

- 100-75% health: Normal appearance
- 75-50% health: More wounds, blood
- 50-25% health: Severe damage, limping
- 25-0% health: Critical state, sparks/smoke

**Status Effect Visuals:**

- Burning: Fire particles, orange glow
- Frozen: Blue tint, ice crystals
- Electrocuted: Lightning arcs, spasms
- Poisoned: Green drips, sickly glow
- Slowed: Purple aura, trail effect

---

## 6. Environment Redesign

### 6.1 Layered Rendering System

```
Environment Layers (back to front):
1. Background terrain
2. Ground details (grass, dirt, rocks)
3. Path/road
4. Path details (tracks, footprints)
5. Decorative elements (trees, debris)
6. Structures (graveyard, houses, camp)
7. Foreground effects (fog, particles)
```

### 6.2 Dynamic Environment Elements

**Weather System:**

```typescript
class WeatherSystem {
  private weatherType: 'clear' | 'fog' | 'rain' | 'storm';

  renderFog(graphics: Graphics, density: number): void {
    // Layered fog clouds with parallax
  }

  renderRain(graphics: Graphics, intensity: number): void {
    // Falling rain particles
  }

  renderLightning(graphics: Graphics): void {
    // Flash effect + lightning bolt
  }
}
```

**Time of Day:**

- Dawn: Orange/pink tints, long shadows
- Day: Bright, short shadows
- Dusk: Purple/red tints, medium shadows
- Night: Dark blue tints, moonlight, long shadows

**Dynamic Shadows:**

```typescript
class ShadowRenderer {
  calculateShadow(object: GameObject, lightSource: Vector2): ShadowData {
    // Calculate shadow direction and length
  }

  renderShadow(graphics: Graphics, shadow: ShadowData): void {
    // Draw elongated shadow shape
  }
}
```

### 6.3 Interactive Environment

**Blood Decals:**

- Persist on ground where zombies die
- Fade over time
- Pool size based on zombie type

**Corpse System:**

- Leave corpse graphics when zombies die
- Fade/decay over time
- Different corpse types per zombie

**Destruction:**

- Craters from explosions
- Burn marks from flame towers
- Scorch marks from tesla towers

**Ambient Details:**

- Swaying grass
- Flickering lights
- Drifting fog
- Falling leaves/debris

---

## 7. Performance Optimization

### 7.1 Rendering Optimizations

**Object Pooling:**

```typescript
class GraphicsPool {
  private pool: Graphics[] = [];

  acquire(): Graphics {
    return this.pool.pop() || new Graphics();
  }

  release(graphics: Graphics): void {
    graphics.clear();
    this.pool.push(graphics);
  }
}
```

**Culling:**

```typescript
class VisibilityManager {
  isVisible(object: GameObject, camera: Camera): boolean {
    // Check if object is in viewport
    return camera.bounds.intersects(object.bounds);
  }

  cullObjects(objects: GameObject[], camera: Camera): GameObject[] {
    return objects.filter(obj => this.isVisible(obj, camera));
  }
}
```

**Level of Detail (LOD):**

```typescript
enum DetailLevel {
  HIGH, // Full details, all effects
  MEDIUM, // Reduced details, fewer particles
  LOW, // Basic shapes only
}

class LODManager {
  getDetailLevel(distance: number, performance: number): DetailLevel {
    // Determine detail level based on distance and FPS
  }
}
```

### 7.2 Particle Optimization

- Maximum particle count limits
- Particle pooling
- Batch rendering
- Distance-based particle reduction

### 7.3 Caching Strategies

**Static Graphics Caching:**

```typescript
class GraphicsCache {
  private cache: Map<string, Graphics> = new Map();

  get(key: string, generator: () => Graphics): Graphics {
    if (!this.cache.has(key)) {
      this.cache.set(key, generator());
    }
    return this.cache.get(key)!;
  }
}
```

**Texture Generation:**

- Pre-render complex graphics to textures
- Use sprites for repeated elements
- Cache rendered frames for animations

---

## 8. Implementation Phases

### Phase 1: Architecture Setup (Week 1)

- [ ] Create renderer directory structure
- [ ] Implement base interfaces
- [ ] Set up ZombieRenderer coordinator
- [ ] Create GraphicsPool and caching systems

### Phase 2: Body Part System (Week 1-2)

- [ ] Implement ZombieBodyParts utility class
- [ ] Create modular body part generators
- [ ] Build composition system
- [ ] Test with Basic zombie type

### Phase 3: Animation System (Week 2)

- [ ] Implement ZombieAnimator class
- [ ] Create procedural animation functions
- [ ] Add animation state machine
- [ ] Test walk/idle/death animations

### Phase 4: Particle System (Week 2-3)

- [ ] Implement ZombieParticleSystem
- [ ] Create particle types
- [ ] Add particle physics
- [ ] Integrate with damage/death events

### Phase 5: Individual Zombie Renderers (Week 3-4)

- [ ] Migrate Basic zombie visuals
- [ ] Migrate Fast zombie visuals
- [ ] Migrate Tank zombie visuals
- [ ] Migrate Armored zombie visuals
- [ ] Migrate Swarm zombie visuals
- [ ] Migrate Stealth zombie visuals
- [ ] Migrate Mechanical zombie visuals

### Phase 6: Visual Effects (Week 4)

- [ ] Implement glow/shadow/outline effects
- [ ] Add health-based degradation
- [ ] Create status effect visuals
- [ ] Add dynamic lighting

### Phase 7: Environment Enhancements (Week 5)

- [ ] Implement weather system
- [ ] Add time of day system
- [ ] Create blood decal system
- [ ] Add corpse persistence
- [ ] Implement destruction effects

### Phase 8: Optimization & Polish (Week 5-6)

- [ ] Implement LOD system
- [ ] Add culling
- [ ] Optimize particle counts
- [ ] Performance profiling
- [ ] Visual polish pass

---

## 9. Technical Considerations

### 9.1 PixiJS Graphics API Limitations

**Pros:**

- No external assets needed
- Fully procedural and dynamic
- Easy to modify and iterate
- Small file size
- Consistent across platforms

**Cons:**

- More CPU intensive than sprites
- Limited visual complexity
- No built-in animation tools
- Requires manual optimization

### 9.2 Best Practices

**Graphics Object Management:**

- Clear graphics before redrawing
- Reuse Graphics objects when possible
- Destroy unused graphics
- Use containers for grouping

**Drawing Efficiency:**

- Minimize draw calls
- Batch similar operations
- Use simple shapes when possible
- Avoid overdraw

**Color Management:**

- Use hex colors (0xRRGGBB)
- Alpha blending for effects
- Color tinting for variations
- Consistent color palette

### 9.3 Testing Strategy

**Visual Testing:**

- Screenshot comparison tests
- Visual regression testing
- Performance benchmarks
- Cross-browser testing

**Unit Testing:**

- Test renderer creation
- Test animation calculations
- Test particle physics
- Test caching systems

---

## 10. Future Enhancements

### 10.1 Advanced Features

**Skeletal Animation:**

- Bone-based animation system
- Inverse kinematics for limbs
- Ragdoll physics on death

**Procedural Generation:**

- Random zombie variations
- Unique appearances per instance
- Mutation system

**Advanced Particles:**

- Particle trails
- Particle collisions
- Particle lighting

**Post-Processing:**

- Screen shake
- Color grading
- Bloom effects
- Motion blur

### 10.2 Content Expansion

**New Zombie Types:**

- Boss zombies (larger, unique)
- Special variants (holiday themes)
- Mutated forms

**Environment Themes:**

- Urban ruins
- Forest wasteland
- Desert apocalypse
- Winter frozen

---

## 11. Code Examples

### 11.1 Basic Zombie Renderer Example

```typescript
// src/renderers/zombies/types/BasicZombieRenderer.ts

export class BasicZombieRenderer implements IZombieRenderer {
  private graphics: Graphics;
  private animator: ZombieAnimator;
  private particles: ZombieParticleSystem;

  constructor() {
    this.graphics = new Graphics();
    this.animator = new ZombieAnimator();
    this.particles = new ZombieParticleSystem();
  }

  render(container: Container, state: ZombieRenderState): void {
    this.graphics.clear();

    // Get animation data
    const anim = this.animator.getCurrentFrame();

    // Draw body with animation offset
    ZombieBodyParts.drawHumanoidBody(this.graphics, 0, anim.bodyBob, 10, 15);

    // Draw head with tilt
    ZombieBodyParts.drawRottenHead(this.graphics, 0, -15 + anim.bodyBob, 8, 0.5);

    // Draw arms with swing
    ZombieBodyParts.drawArm(this.graphics, -8, 0, 12, anim.leftArmAngle, 0.5);

    ZombieBodyParts.drawArm(this.graphics, 8, 0, 12, anim.rightArmAngle, 0.5);

    // Add wounds based on health
    const woundCount = Math.floor((1 - state.health / state.maxHealth) * 5);
    ZombieBodyParts.drawWounds(this.graphics, 0, 0, woundCount, 0.7);

    // Add glow to eyes
    GlowEffect.apply(this.graphics, -3, -18, 3, 0xff0000);
    GlowEffect.apply(this.graphics, 3, -18, 3, 0xff0000);

    container.addChild(this.graphics);
  }

  update(deltaTime: number, state: ZombieRenderState): void {
    this.animator.update(deltaTime, state);
    this.particles.update(deltaTime);
  }

  showDamageEffect(damageType: TowerType, amount: number): void {
    // Flash effect
    this.graphics.tint = 0xff0000;
    setTimeout(() => (this.graphics.tint = 0xffffff), 100);

    // Emit blood particles
    this.particles.emit(ParticleType.BLOOD_SPLATTER, 0, 0, { count: 5, velocity: 50 });
  }

  playDeathAnimation(): void {
    // Multi-stage death animation
    // 1. Recoil
    // 2. Collapse
    // 3. Fade out
    // 4. Particle burst
  }

  destroy(): void {
    this.graphics.destroy();
    this.particles.destroy();
  }
}
```

### 11.2 Particle System Example

```typescript
// src/renderers/zombies/ZombieParticleSystem.ts

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  color: number;
  alpha: number;
}

export class ZombieParticleSystem {
  private particles: Particle[] = [];
  private graphics: Graphics;
  private maxParticles: number = 100;

  constructor() {
    this.graphics = new Graphics();
  }

  emit(type: ParticleType, x: number, y: number, config: ParticleConfig): void {
    const count = Math.min(config.count, this.maxParticles - this.particles.length);

    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = config.velocity * (0.5 + Math.random() * 0.5);

      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: config.lifetime || 1000,
        maxLife: config.lifetime || 1000,
        size: config.size || 3,
        color: this.getParticleColor(type),
        alpha: 1,
      });
    }
  }

  update(deltaTime: number): void {
    const dt = deltaTime / 1000;

    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];

      // Update position
      p.x += p.vx * dt;
      p.y += p.vy * dt;

      // Apply gravity
      p.vy += 200 * dt;

      // Update life
      p.life -= deltaTime;
      p.alpha = p.life / p.maxLife;

      // Remove dead particles
      if (p.life <= 0) {
        this.particles.splice(i, 1);
      }
    }
  }

  render(graphics: Graphics): void {
    graphics.clear();

    for (const p of this.particles) {
      graphics.circle(p.x, p.y, p.size).fill({ color: p.color, alpha: p.alpha });
    }
  }

  private getParticleColor(type: ParticleType): number {
    switch (type) {
      case ParticleType.BLOOD_SPLATTER:
        return 0x8b0000;
      case ParticleType.SPARKS:
        return 0xffff00;
      case ParticleType.SMOKE:
        return 0x333333;
      // ... more types
      default:
        return 0xffffff;
    }
  }

  destroy(): void {
    this.graphics.destroy();
    this.particles = [];
  }
}
```

---

## 12. Summary

This technical plan provides a comprehensive approach to redesigning zombie and environment visuals using PixiJS Graphics API. The modular architecture allows for:

- **Maintainability:** Separated concerns, reusable components
- **Extensibility:** Easy to add new zombie types and effects
- **Performance:** Optimized rendering with pooling and culling
- **Visual Quality:** Rich effects through particles and animations
- **Flexibility:** Fully procedural, no asset dependencies

The phased implementation approach ensures steady progress while maintaining a working game at each stage.
