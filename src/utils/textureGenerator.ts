import { Graphics } from 'pixi.js';

/**
 * Utility class for generating apocalyptic-themed textures procedurally
 * Returns Graphics objects that can be used as sprites or converted to textures
 */
export class TextureGenerator {
  /**
   * Creates a rusty metal texture with scratches and wear
   */
  static createRustyMetal(width: number, height: number, baseColor: number = 0x4a4a4a): Graphics {
    const graphics = new Graphics();

    // Base metal color
    graphics.rect(0, 0, width, height).fill(baseColor);

    // Add rust spots
    for (let i = 0; i < 20; i++) {
      const x = Math.random() * width;
      const y = Math.random() * height;
      const size = Math.random() * 8 + 2;
      const rustColor = Math.random() > 0.5 ? 0x8b4513 : 0xa0522d;
      graphics.circle(x, y, size).fill({ color: rustColor, alpha: 0.3 });
    }

    // Add scratches
    for (let i = 0; i < 15; i++) {
      const x1 = Math.random() * width;
      const y1 = Math.random() * height;
      const x2 = x1 + (Math.random() - 0.5) * 30;
      const y2 = y1 + (Math.random() - 0.5) * 30;
      graphics.moveTo(x1, y1).lineTo(x2, y2).stroke({ width: 1, color: 0x2a2a2a, alpha: 0.5 });
    }

    return graphics;
  }

  /**
   * Creates a worn concrete texture
   */
  static createConcrete(width: number, height: number): Graphics {
    const graphics = new Graphics();

    // Base concrete
    graphics.rect(0, 0, width, height).fill(0x5a5a5a);

    // Add cracks
    for (let i = 0; i < 10; i++) {
      const x = Math.random() * width;
      const y = Math.random() * height;
      const length = Math.random() * 40 + 10;
      const angle = Math.random() * Math.PI * 2;
      graphics
        .moveTo(x, y)
        .lineTo(x + Math.cos(angle) * length, y + Math.sin(angle) * length)
        .stroke({ width: 1, color: 0x3a3a3a, alpha: 0.7 });
    }

    // Add dirt spots
    for (let i = 0; i < 30; i++) {
      const x = Math.random() * width;
      const y = Math.random() * height;
      const size = Math.random() * 5 + 1;
      graphics.circle(x, y, size).fill({ color: 0x3a3a3a, alpha: 0.2 });
    }

    return graphics;
  }

  /**
   * Creates a weathered wood texture
   */
  static createWeatheredWood(width: number, height: number): Graphics {
    const graphics = new Graphics();

    // Base wood color
    graphics.rect(0, 0, width, height).fill(0x6b4423);

    // Wood grain lines
    for (let i = 0; i < height; i += 3) {
      const offset = Math.random() * 5;
      graphics
        .moveTo(0, i + offset)
        .lineTo(width, i + offset)
        .stroke({ width: 1, color: 0x4a2f1a, alpha: 0.3 });
    }

    // Weathering spots
    for (let i = 0; i < 15; i++) {
      const x = Math.random() * width;
      const y = Math.random() * height;
      const size = Math.random() * 10 + 3;
      graphics.circle(x, y, size).fill({ color: 0x3a1f0a, alpha: 0.4 });
    }

    return graphics;
  }

  /**
   * Creates a corrugated metal panel texture
   */
  static createCorrugatedMetal(width: number, height: number): Graphics {
    const graphics = new Graphics();

    // Base metal
    graphics.rect(0, 0, width, height).fill(0x6a6a6a);

    // Corrugation ridges
    for (let x = 0; x < width; x += 8) {
      graphics.rect(x, 0, 4, height).fill({ color: 0x7a7a7a, alpha: 0.5 });
      graphics.rect(x + 4, 0, 4, height).fill({ color: 0x5a5a5a, alpha: 0.5 });
    }

    // Rust streaks
    for (let i = 0; i < 5; i++) {
      const x = Math.random() * width;
      graphics.rect(x, 0, 2, height).fill({ color: 0x8b4513, alpha: 0.3 });
    }

    return graphics;
  }

  /**
   * Creates a bullet hole decal
   */
  static createBulletHole(size: number = 8): Graphics {
    const graphics = new Graphics();

    // Outer impact
    graphics.circle(size / 2, size / 2, size / 2).fill(0x1a1a1a);

    // Inner hole
    graphics.circle(size / 2, size / 2, size / 4).fill(0x000000);

    // Cracks
    for (let i = 0; i < 6; i++) {
      const angle = (i / 6) * Math.PI * 2;
      const x1 = size / 2 + Math.cos(angle) * (size / 4);
      const y1 = size / 2 + Math.sin(angle) * (size / 4);
      const x2 = size / 2 + Math.cos(angle) * (size / 2);
      const y2 = size / 2 + Math.sin(angle) * (size / 2);
      graphics.moveTo(x1, y1).lineTo(x2, y2).stroke({ width: 1, color: 0x2a2a2a });
    }

    return graphics;
  }

  /**
   * Creates a caution stripe pattern
   */
  static createCautionStripes(width: number, height: number): Graphics {
    const graphics = new Graphics();

    const stripeWidth = 20;
    let x = -height;

    while (x < width + height) {
      graphics.rect(x, 0, stripeWidth, height).fill(0xffcc00);
      graphics.rect(x + stripeWidth, 0, stripeWidth, height).fill(0x1a1a1a);
      x += stripeWidth * 2;
    }

    // Rotate the pattern 45 degrees by drawing diagonally
    // (This is a simplified version - for true rotation, use matrix transforms)

    return graphics;
  }

  /**
   * Creates a blood splatter texture
   */
  static createBloodSplatter(size: number = 20): Graphics {
    const graphics = new Graphics();

    // Main splatter
    graphics.circle(size / 2, size / 2, size / 3).fill({ color: 0x8b0000, alpha: 0.7 });

    // Drips and splatters
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      const distance = (Math.random() * size) / 3 + size / 3;
      const x = size / 2 + Math.cos(angle) * distance;
      const y = size / 2 + Math.sin(angle) * distance;
      const dropSize = Math.random() * 3 + 1;
      graphics.circle(x, y, dropSize).fill({ color: 0x8b0000, alpha: 0.6 });
    }

    return graphics;
  }

  /**
   * Creates a riveted metal plate
   */
  static createRivetedPlate(width: number, height: number): Graphics {
    const graphics = new Graphics();

    // Base plate
    graphics.rect(0, 0, width, height).fill(0x4a4a4a);

    // Rivets in corners and edges
    const rivetPositions = [
      [5, 5],
      [width - 5, 5],
      [5, height - 5],
      [width - 5, height - 5],
      [width / 2, 5],
      [width / 2, height - 5],
      [5, height / 2],
      [width - 5, height / 2],
    ];

    rivetPositions.forEach(([x, y]) => {
      // Rivet head
      graphics.circle(x, y, 3).fill(0x6a6a6a);
      // Rivet shadow
      graphics.circle(x + 1, y + 1, 3).fill({ color: 0x2a2a2a, alpha: 0.3 });
    });

    return graphics;
  }
}
