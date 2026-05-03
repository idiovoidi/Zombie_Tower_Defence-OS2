import { Container, Graphics } from 'pixi.js';
import type { Zombie } from '../../objects/Zombie';
import { EffectCleanupManager } from '../../utils/EffectCleanupManager';
import { ResourceCleanupManager } from '../../utils/ResourceCleanupManager';

/**
 * SludgePoolEffect - Animated toxic sludge pool with bubbling/oozing visual effects
 *
 * Creates a toxic pool that slows zombies with animated bubbles that grow, float, and pop.
 * Bubble animation intensity scales with upgrade level.
 */
export class SludgePoolEffect extends Container {
  private poolGraphics: Graphics;
  private bubblesContainer: Container;
  private isActive = true;
  private poolRadius: number;
  private upgradeLevel: number;
  private poolDuration: number;
  private poolData: {
    x: number;
    y: number;
    radius: number;
    slowPercent: number;
    affectedZombies: Set<Zombie>;
  };
  private activeBubbles: Array<{
    graphics: Graphics;
    age: number;
    maxAge: number;
    startX: number;
    startY: number;
    maxSize: number;
  }> = [];

  constructor(
    x: number,
    y: number,
    poolRadius: number,
    upgradeLevel: number,
    poolDuration: number,
    slowPercent: number
  ) {
    super();

    this.position.set(x, y);
    this.zIndex = -100; // Behind zombies

    this.poolRadius = poolRadius;
    this.upgradeLevel = upgradeLevel;
    this.poolDuration = poolDuration;

    this.poolData = {
      x,
      y,
      radius: poolRadius,
      slowPercent,
      affectedZombies: new Set<Zombie>(),
    };

    // Create pool graphics
    this.poolGraphics = new Graphics();
    this.addChild(this.poolGraphics);

    // Container for animated bubbles
    this.bubblesContainer = new Container();
    this.addChild(this.bubblesContainer);

    this.drawPoolBase();
    this.startAnimation();
    this.registerForCleanup();
  }

  /**
   * Draw the static pool base layers
   */
  private drawPoolBase(): void {
    // Outer edge - darker green
    this.poolGraphics.circle(0, 0, this.poolRadius).fill({ color: 0x1a6b1a, alpha: 0.6 });

    // Middle layer - toxic green
    this.poolGraphics.circle(0, 0, this.poolRadius * 0.8).fill({ color: 0x228b22, alpha: 0.7 });

    // Inner layer - bright toxic
    this.poolGraphics.circle(0, 0, this.poolRadius * 0.6).fill({ color: 0x32cd32, alpha: 0.8 });

    // Toxic glow effect at center
    this.poolGraphics.circle(0, 0, this.poolRadius * 0.4).fill({ color: 0x00ff00, alpha: 0.3 });
  }

  /**
   * Spawn a new animated bubble
   */
  private spawnBubble(): void {
    if (!this.isActive) return;

    const bubble = new Graphics();
    const angle = Math.random() * Math.PI * 2;
    const dist = Math.random() * this.poolRadius * 0.85;
    const startX = Math.cos(angle) * dist;
    const startY = Math.sin(angle) * dist;
    const maxSize = 2 + Math.random() * 3 + this.upgradeLevel * 0.5;
    const bubbleColor = Math.random() > 0.5 ? 0x00ff00 : 0x7fff00;

    // Initial bubble draw
    bubble.circle(0, 0, 0.5).fill({ color: bubbleColor, alpha: 0.8 });
    bubble.position.set(startX, startY);
    this.bubblesContainer.addChild(bubble);

    this.activeBubbles.push({
      graphics: bubble,
      age: 0,
      maxAge: 30 + Math.random() * 40, // Frames to live
      startX,
      startY,
      maxSize,
    });
  }

  /**
   * Animation loop for bubbles
   */
  private animateBubbles(): void {
    if (!this.isActive || !this.parent) return;

    // Spawn new bubbles occasionally (more bubbles at higher levels)
    const spawnChance = 0.1 + this.upgradeLevel * 0.03;
    if (Math.random() < spawnChance) {
      this.spawnBubble();
    }

    // Update existing bubbles
    for (let i = this.activeBubbles.length - 1; i >= 0; i--) {
      const b = this.activeBubbles[i];
      b.age++;

      const progress = b.age / b.maxAge;

      // Grow phase (first 60%), then pop
      if (progress < 0.6) {
        const growProgress = progress / 0.6;
        const currentSize = 0.5 + (b.maxSize - 0.5) * growProgress;
        const alpha = 0.8 - growProgress * 0.3;
        const riseOffset = b.age * 0.3; // Float upward slightly

        b.graphics.clear();
        b.graphics.circle(0, 0, currentSize).fill({
          color: progress < 0.3 ? 0x00ff00 : 0x7fff00,
          alpha,
        });
        // Add glow ring as bubble grows
        if (growProgress > 0.5) {
          b.graphics.circle(0, 0, currentSize * 1.3).stroke({
            width: 1,
            color: 0x32cd32,
            alpha: alpha * 0.5,
          });
        }
        b.graphics.position.set(b.startX, b.startY - riseOffset);
      } else {
        // Pop phase - fade out and expand
        const popProgress = (progress - 0.6) / 0.4;
        const popSize = b.maxSize * (1 + popProgress * 0.5);
        const alpha = 0.5 * (1 - popProgress);

        b.graphics.clear();
        b.graphics.circle(0, 0, popSize).stroke({
          width: 2 - popProgress,
          color: 0xadff2f,
          alpha,
        });
      }

      // Remove dead bubbles
      if (b.age >= b.maxAge) {
        if (b.graphics.parent) {
          b.graphics.parent.removeChild(b.graphics);
        }
        b.graphics.destroy();
        this.activeBubbles.splice(i, 1);
      }
    }

    // Continue animation loop
    if (this.isActive && this.parent) {
      requestAnimationFrame(() => this.animateBubbles());
    }
  }

  /**
   * Start the bubble animation
   */
  private startAnimation(): void {
    this.animateBubbles();
  }

  /**
   * Register this pool for cleanup after duration expires
   */
  private registerForCleanup(): void {
    // Register for persistent effect cleanup
    ResourceCleanupManager.registerPersistentEffect(this as unknown as Graphics, {
      type: 'sludge_pool',
      duration: this.poolDuration,
      onCleanup: () => {
        this.destroy();
      },
    });

    // Store pool data reference for external access
    (this as unknown as Record<string, unknown>)['_poolData'] = this.poolData;

    // Schedule automatic cleanup
    EffectCleanupManager.registerTimeout(
      setTimeout(() => {
        this.destroy();
      }, this.poolDuration)
    );
  }

  /**
   * Get pool data for zombie slow effect tracking
   */
  public getPoolData(): {
    x: number;
    y: number;
    radius: number;
    slowPercent: number;
    affectedZombies: Set<Zombie>;
  } {
    return this.poolData;
  }

  /**
   * Clean up the pool and all its animations
   */
  public override destroy(): void {
    if (!this.isActive) return;

    this.isActive = false;

    // Stop animation flag will let bubbles clean themselves up
    this.activeBubbles.length = 0;

    // Remove slow from all affected zombies
    for (const zombie of this.poolData.affectedZombies) {
      if (zombie.parent) {
        zombie.removeSlow();
      }
    }

    ResourceCleanupManager.unregisterPersistentEffect(this as unknown as Graphics);

    if (this.parent) {
      this.parent.removeChild(this);
    }

    super.destroy({ children: true });
  }
}
