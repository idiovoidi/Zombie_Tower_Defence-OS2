import { Container, Graphics } from 'pixi.js';

export class TowerRangeVisualizer {
  private static instance: TowerRangeVisualizer;
  private rangeIndicator: Graphics | null = null;
  private container: Container | null = null;

  private constructor() {}

  public static getInstance(): TowerRangeVisualizer {
    if (!TowerRangeVisualizer.instance) {
      TowerRangeVisualizer.instance = new TowerRangeVisualizer();
    }
    return TowerRangeVisualizer.instance;
  }

  // Show range indicator for a tower
  public showRange(container: Container, x: number, y: number, range: number): void {
    this.hideRange();

    this.container = container;

    // Create a circle to represent the range
    this.rangeIndicator = new Graphics();
    this.rangeIndicator.circle(0, 0, range).fill({ color: 0x00ff00, alpha: 0.2 });
    this.rangeIndicator.stroke({ width: 2, color: 0x00ff00, alpha: 0.5 });

    this.rangeIndicator.position.set(x, y);
    container.addChild(this.rangeIndicator);
  }

  // Hide range indicator
  public hideRange(): void {
    if (this.rangeIndicator && this.container) {
      this.container.removeChild(this.rangeIndicator);
      this.rangeIndicator.destroy();
      this.rangeIndicator = null;
      this.container = null;
    }
  }

  // Update range indicator position
  public updatePosition(x: number, y: number): void {
    if (this.rangeIndicator) {
      this.rangeIndicator.position.set(x, y);
    }
  }
}
