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
      maxFadeTime: 8, // Corpses fade after 8 seconds (longer for atmosphere)
    };

    // Draw blood pool first (underneath)
    this.drawBloodPool(corpse.graphics, size);

    // Draw corpse based on zombie type
    this.drawCorpse(corpse.graphics, zombieType, size);
    corpse.graphics.position.set(x, y);
    corpse.graphics.rotation = Math.random() * Math.PI * 2; // Random rotation
    corpse.graphics.alpha = 0.9;

    this.corpses.push(corpse);
    this.container.addChild(corpse.graphics);

    // Remove oldest corpse if we exceed max
    if (this.corpses.length > this.maxCorpses) {
      const oldCorpse = this.corpses.shift();
      if (oldCorpse) {
        this.container.removeChild(oldCorpse.graphics);
        oldCorpse.graphics.destroy();
      }
    }
  }

  private drawBloodPool(graphics: Graphics, size: number): void {
    // Create irregular blood pool with multiple layers
    const poolSize = size * 2;

    // Outer blood splatter (irregular)
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2 + Math.random() * 0.5;
      const dist = poolSize * (0.8 + Math.random() * 0.4);
      const x = Math.cos(angle) * dist;
      const y = Math.sin(angle) * dist;
      const splatterSize = size * (0.3 + Math.random() * 0.4);
      graphics.circle(x, y, splatterSize).fill({ color: 0x6a0000, alpha: 0.7 });
    }

    // Main blood pool (darker center)
    graphics.ellipse(0, 0, poolSize * 0.9, poolSize * 0.7).fill({ color: 0x5a0000, alpha: 0.8 });
    graphics.ellipse(0, 0, poolSize * 0.6, poolSize * 0.5).fill({ color: 0x4a0000, alpha: 0.85 });

    // Blood drips/streaks
    for (let i = 0; i < 5; i++) {
      const angle = Math.random() * Math.PI * 2;
      const startDist = poolSize * 0.5;
      const endDist = poolSize * (1.2 + Math.random() * 0.5);
      const startX = Math.cos(angle) * startDist;
      const startY = Math.sin(angle) * startDist;
      const endX = Math.cos(angle) * endDist;
      const endY = Math.sin(angle) * endDist;
      graphics
        .moveTo(startX, startY)
        .lineTo(endX, endY)
        .stroke({ width: 2, color: 0x6a0000, alpha: 0.6 });
    }
  }

  private drawCorpse(graphics: Graphics, zombieType: string, size: number): void {
    // Draw a detailed flattened/collapsed version of the zombie
    const corpseColor = this.getZombieColor(zombieType);
    const darkColor = this.getDarkerColor(corpseColor);

    // Main body (flattened, irregular shape)
    graphics.ellipse(0, 0, size * 1.2, size * 0.7).fill({ color: corpseColor, alpha: 0.9 });
    graphics
      .ellipse(0, 0, size * 1.2, size * 0.7)
      .stroke({ width: 1.5, color: darkColor, alpha: 0.7 });

    // Decay/wound patches
    graphics.circle(-size * 0.4, -size * 0.2, size * 0.3).fill({ color: darkColor, alpha: 0.8 });
    graphics.circle(size * 0.3, size * 0.1, size * 0.25).fill({ color: darkColor, alpha: 0.7 });

    // Limbs (arms and legs sprawled out)
    // Left arm
    graphics.ellipse(-size * 1.1, -size * 0.4, size * 0.5, size * 0.2).fill({
      color: corpseColor,
      alpha: 0.85,
    });
    graphics.ellipse(-size * 1.1, -size * 0.4, size * 0.5, size * 0.2).stroke({
      width: 1,
      color: darkColor,
      alpha: 0.6,
    });

    // Right arm
    graphics.ellipse(size * 1.0, -size * 0.3, size * 0.5, size * 0.2).fill({
      color: corpseColor,
      alpha: 0.85,
    });
    graphics.ellipse(size * 1.0, -size * 0.3, size * 0.5, size * 0.2).stroke({
      width: 1,
      color: darkColor,
      alpha: 0.6,
    });

    // Left leg
    graphics.ellipse(-size * 0.5, size * 0.8, size * 0.3, size * 0.6).fill({
      color: corpseColor,
      alpha: 0.85,
    });

    // Right leg
    graphics.ellipse(size * 0.4, size * 0.9, size * 0.3, size * 0.6).fill({
      color: corpseColor,
      alpha: 0.85,
    });

    // Head (partially visible)
    graphics.circle(0, -size * 0.5, size * 0.4).fill({ color: corpseColor, alpha: 0.9 });
    graphics.circle(0, -size * 0.5, size * 0.4).stroke({ width: 1, color: darkColor, alpha: 0.7 });

    // Blood stains on corpse
    for (let i = 0; i < 4; i++) {
      const x = (Math.random() - 0.5) * size * 1.5;
      const y = (Math.random() - 0.5) * size * 0.8;
      const stainSize = size * (0.15 + Math.random() * 0.2);
      graphics.circle(x, y, stainSize).fill({ color: 0x6a0000, alpha: 0.7 });
    }

    // Type-specific details
    if (zombieType === 'armored') {
      // Broken armor pieces
      graphics
        .rect(-size * 0.4, -size * 0.2, size * 0.3, size * 0.2)
        .fill({ color: 0x5a5a5a, alpha: 0.8 });
      graphics.rect(size * 0.2, 0, size * 0.3, size * 0.2).fill({ color: 0x5a5a5a, alpha: 0.8 });
    } else if (zombieType === 'mechanical') {
      // Sparking wires
      graphics.circle(-size * 0.3, 0, size * 0.15).fill({ color: 0xffff00, alpha: 0.6 });
      graphics.circle(size * 0.4, -size * 0.2, size * 0.12).fill({ color: 0xff6600, alpha: 0.6 });
    }
  }

  private getDarkerColor(color: number): number {
    // Darken the color by reducing RGB values
    const r = Math.max(0, ((color >> 16) & 0xff) - 40);
    const g = Math.max(0, ((color >> 8) & 0xff) - 40);
    const b = Math.max(0, (color & 0xff) - 40);
    return (r << 16) | (g << 8) | b;
  }

  private getZombieColor(zombieType: string): number {
    // Return appropriate color based on zombie type (matching improved zombie visuals)
    const colors: { [key: string]: number } = {
      basic: 0x5a6a4a, // Gray-green
      fast: 0x6a7a3a, // Olive
      tank: 0x4a5a2a, // Dark olive
      armored: 0x5a6a4a, // Gray-green with armor
      swarm: 0x7a8a5a, // Yellowish-green
      stealth: 0x3a4a5a, // Dark blue-gray
      mechanical: 0x6a7a8a, // Steel gray
    };
    return colors[zombieType] || 0x5a6a4a;
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
