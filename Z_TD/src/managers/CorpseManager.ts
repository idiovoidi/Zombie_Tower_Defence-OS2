import { Container, Graphics } from 'pixi.js';

interface Corpse {
  graphics: Graphics;
  fadeTimer: number;
  maxFadeTime: number;
}

export class CorpseManager {
  private corpses: Corpse[] = [];
  private container: Container;
  private maxCorpses: number = 50; // Limit to prevent performance issues

  constructor(container: Container) {
    this.container = container;
  }

  // Create a corpse at the given position with zombie type styling
  public createCorpse(x: number, y: number, zombieType: string, size: number = 10): void {
    const corpse: Corpse = {
      graphics: new Graphics(),
      fadeTimer: 0,
      maxFadeTime: 5, // Corpses fade after 5 seconds
    };

    // Draw corpse based on zombie type
    this.drawCorpse(corpse.graphics, zombieType, size);
    corpse.graphics.position.set(x, y);
    corpse.graphics.rotation = Math.random() * Math.PI * 2; // Random rotation
    corpse.graphics.alpha = 0.8;

    // Add blood pool under corpse
    const bloodPool = new Graphics();
    bloodPool.ellipse(0, 0, size * 1.5, size * 1.2).fill({ color: 0x8b0000, alpha: 0.6 });
    corpse.graphics.addChild(bloodPool);

    this.corpses.push(corpse);
    this.container.addChild(corpse.graphics);

    // Remove oldest corpse if we exceed max
    if (this.corpses.length > this.maxCorpses) {
      const oldCorpse = this.corpses.shift()!;
      this.container.removeChild(oldCorpse.graphics);
      oldCorpse.graphics.destroy();
    }
  }

  private drawCorpse(graphics: Graphics, zombieType: string, size: number): void {
    // Draw a flattened/collapsed version of the zombie
    const corpseColor = this.getZombieColor(zombieType);

    // Main body (flattened)
    graphics.ellipse(0, 0, size * 0.8, size * 0.5).fill({ color: corpseColor, alpha: 0.9 });

    // Add some detail (limbs)
    graphics.rect(-size * 0.6, -size * 0.3, size * 0.4, size * 0.2).fill({
      color: corpseColor,
      alpha: 0.8,
    });
    graphics.rect(size * 0.2, -size * 0.3, size * 0.4, size * 0.2).fill({
      color: corpseColor,
      alpha: 0.8,
    });

    // Dark outline
    graphics.stroke({ width: 1, color: 0x000000, alpha: 0.5 });
  }

  private getZombieColor(zombieType: string): number {
    // Return appropriate color based on zombie type
    const colors: { [key: string]: number } = {
      basic: 0x6b8e23,
      fast: 0x7a9b3a,
      tank: 0x556b2f,
      armored: 0x696969,
      swarm: 0x8fbc8f,
      stealth: 0x2f4f4f,
      mechanical: 0x708090,
    };
    return colors[zombieType] || 0x6b8e23;
  }

  // Update corpses (fade out over time)
  public update(deltaTime: number): void {
    const dt = deltaTime / 1000;

    for (let i = this.corpses.length - 1; i >= 0; i--) {
      const corpse = this.corpses[i];
      corpse.fadeTimer += dt;

      // Start fading after half the max fade time
      if (corpse.fadeTimer > corpse.maxFadeTime / 2) {
        const fadeProgress = (corpse.fadeTimer - corpse.maxFadeTime / 2) / (corpse.maxFadeTime / 2);
        corpse.graphics.alpha = Math.max(0, 0.8 * (1 - fadeProgress));
      }

      // Remove fully faded corpses
      if (corpse.fadeTimer >= corpse.maxFadeTime) {
        this.container.removeChild(corpse.graphics);
        corpse.graphics.destroy();
        this.corpses.splice(i, 1);
      }
    }
  }

  // Clear all corpses
  public clear(): void {
    for (const corpse of this.corpses) {
      this.container.removeChild(corpse.graphics);
      corpse.graphics.destroy();
    }
    this.corpses = [];
  }

  // Set maximum number of corpses
  public setMaxCorpses(max: number): void {
    this.maxCorpses = max;
  }
}
