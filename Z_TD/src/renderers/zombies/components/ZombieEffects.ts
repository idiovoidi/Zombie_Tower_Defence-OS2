import { Graphics } from 'pixi.js';

export class GlowEffect {
  static apply(graphics: Graphics, x: number, y: number, radius: number, color: number): void {
    for (let i = 3; i > 0; i--) {
      graphics.circle(x, y, radius * (i / 3)).fill({
        color,
        alpha: 0.3 * ((4 - i) / 3),
      });
    }
  }
}

export class ShadowEffect {
  static apply(graphics: Graphics, x: number, y: number, size: number): void {
    graphics.ellipse(x, y, size, size * 0.5).fill({
      color: 0x000000,
      alpha: 0.3,
    });
  }
}

export class OutlineEffect {
  static apply(graphics: Graphics, color: number, width: number): void {
    graphics.stroke({ color, width });
  }
}
