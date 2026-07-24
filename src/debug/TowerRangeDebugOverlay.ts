import { type Application, Graphics } from 'pixi.js';
import { DebugConstants } from '../config/debugConstants';
import type { Tower } from '../objects/Tower';

/**
 * Draws all placed tower ranges when SHOW_TOWER_RANGES is enabled.
 */
export class TowerRangeDebugOverlay {
  private readonly graphics: Graphics;

  constructor(app: Application) {
    this.graphics = new Graphics();
    this.graphics.eventMode = 'none';
    app.stage.addChild(this.graphics);
  }

  public update(towers: readonly Tower[]): void {
    this.graphics.clear();

    if (!DebugConstants.ENABLED || !DebugConstants.SHOW_TOWER_RANGES) {
      this.graphics.visible = false;
      return;
    }

    this.graphics.visible = true;
    for (const tower of towers) {
      const pos = tower.position;
      const range = tower.getRange();
      this.graphics.circle(pos.x, pos.y, range).fill({ color: 0x00ff00, alpha: 0.08 });
      this.graphics.circle(pos.x, pos.y, range).stroke({ width: 1, color: 0x00ff00, alpha: 0.35 });
    }
  }

  public clear(): void {
    this.graphics.clear();
    this.graphics.visible = false;
  }

  public destroy(): void {
    this.clear();
    this.graphics.destroy();
  }
}
