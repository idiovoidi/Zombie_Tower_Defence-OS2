import { Container, Graphics, Ticker } from 'pixi.js';

/**
 * GooCoatingEffect - Visual effect that coats zombies in toxic goo
 *
 * Creates animated goo drips and coating that appear when zombies are slowed by sludge pools.
 * The effect intensity scales with the slow percentage and is masked to the zombie's body shape.
 */
export class GooCoatingEffect extends Container {
  private gooContainer: Container;
  private maskGraphics: Graphics;
  private isActive = true;
  private slowPercent: number;
  private ticker: Ticker;
  private gooDrips: Array<{
    graphics: Graphics;
    age: number;
    maxAge: number;
    startX: number;
    startY: number;
    size: number;
    speed: number;
  }> = [];

  constructor(slowPercent: number) {
    super();

    this.slowPercent = slowPercent;
    this.ticker = new Ticker();

    // Create mask for constraining goo to zombie body shape
    this.maskGraphics = new Graphics();
    this.createZombieMask();

    // Container for goo effect elements
    this.gooContainer = new Container();
    this.gooContainer.mask = this.maskGraphics;
    this.addChild(this.maskGraphics);
    this.addChild(this.gooContainer);

    this.createGooCoating();
    this.startAnimation();
  }

  /**
   * Create a mask in the shape of a zombie body
   */
  private createZombieMask(): void {
    // Create a basic zombie body shape mask
    // This approximates the typical zombie silhouette

    // Head (circle)
    this.maskGraphics.circle(0, -8, 6).fill({ color: 0xffffff, alpha: 1 });

    // Torso (rounded rectangle)
    this.maskGraphics.roundRect(-6, -2, 12, 14, 2).fill({ color: 0xffffff, alpha: 1 });

    // Arms
    this.maskGraphics.rect(-8, 0, 3, 8).fill({ color: 0xffffff, alpha: 1 }); // Left arm
    this.maskGraphics.rect(5, 0, 3, 8).fill({ color: 0xffffff, alpha: 1 }); // Right arm

    // Legs
    this.maskGraphics.rect(-4, 10, 3, 8).fill({ color: 0xffffff, alpha: 1 }); // Left leg
    this.maskGraphics.rect(1, 10, 3, 8).fill({ color: 0xffffff, alpha: 1 }); // Right leg
  }

  /**
   * Create the initial goo coating visual
   */
  private createGooCoating(): void {
    // Create base goo coating with multiple layers
    const layers = 3 + Math.floor(this.slowPercent * 5); // More layers for higher slow percentages

    for (let i = 0; i < layers; i++) {
      const goo = new Graphics();
      const radius = 15 + Math.random() * 10 + this.slowPercent * 20;
      const x = (Math.random() - 0.5) * 30;
      const y = (Math.random() - 0.5) * 30;

      // Toxic green goo with varying opacity
      const alpha = 0.3 + Math.random() * 0.4 + this.slowPercent * 0.2;
      const color = Math.random() > 0.5 ? 0x228b22 : 0x32cd32;

      goo.circle(x, y, radius).fill({ color, alpha });
      this.gooContainer.addChild(goo);
    }

    // Create initial goo drips
    const dripCount = 2 + Math.floor(this.slowPercent * 3);
    for (let i = 0; i < dripCount; i++) {
      this.spawnGooDrip();
    }
  }

  /**
   * Spawn a new goo drip
   */
  private spawnGooDrip(): void {
    if (!this.isActive) return;

    const drip = new Graphics();
    const startX = (Math.random() - 0.5) * 20;
    const startY = -10 + Math.random() * 10;
    const size = 2 + Math.random() * 3 + this.slowPercent * 2;
    const speed = 0.5 + Math.random() * 0.5 + this.slowPercent * 0.3;
    const maxAge = 60 + Math.random() * 40;

    // Initial drip shape
    drip.circle(0, 0, size).fill({ color: 0x228b22, alpha: 0.7 });
    drip.position.set(startX, startY);
    this.gooContainer.addChild(drip);

    this.gooDrips.push({
      graphics: drip,
      age: 0,
      maxAge,
      startX,
      startY,
      size,
      speed,
    });
  }

  /**
   * Animation loop for goo effects
   */
  private animateGoo(): void {
    if (!this.isActive) return;

    // Spawn new drips occasionally
    const spawnChance = 0.05 + this.slowPercent * 0.02;
    if (Math.random() < spawnChance) {
      this.spawnGooDrip();
    }

    // Update existing drips
    for (let i = this.gooDrips.length - 1; i >= 0; i--) {
      const drip = this.gooDrips[i];
      drip.age++;

      const progress = drip.age / drip.maxAge;
      const fallDistance = drip.age * drip.speed;

      // Stretch the drip as it falls
      const stretchY = drip.size * (1 + progress * 2);
      const stretchX = drip.size * (1 - progress * 0.3); // Narrow as it falls
      const alpha = 0.7 * (1 - progress * 0.5);

      drip.graphics.clear();
      drip.graphics.ellipse(0, fallDistance, stretchX, stretchY).fill({
        color: progress < 0.5 ? 0x228b22 : 0x32cd32,
        alpha,
      });

      // Remove dead drips
      if (drip.age >= drip.maxAge) {
        if (drip.graphics.parent) {
          drip.graphics.parent.removeChild(drip.graphics);
        }
        drip.graphics.destroy();
        this.gooDrips.splice(i, 1);
      }
    }
  }

  /**
   * Start the goo animation
   */
  private startAnimation(): void {
    this.ticker.add(() => this.animateGoo(), this);
    this.ticker.start();
  }

  /**
   * Update the slow percentage (for when slow effect changes)
   */
  public updateSlowPercent(newSlowPercent: number): void {
    this.slowPercent = newSlowPercent;
  }

  /**
   * Clean up the goo effect
   */
  public override destroy(): void {
    if (!this.isActive) return;

    this.isActive = false;

    // Stop the ticker
    this.ticker.stop();
    this.ticker.destroy();

    // Clean up drips
    this.gooDrips.length = 0;

    if (this.parent) {
      this.parent.removeChild(this);
    }

    super.destroy({ children: true });
  }
}
