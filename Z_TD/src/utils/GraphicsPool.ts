import { Graphics } from 'pixi.js';
import { ObjectPool } from './ObjectPool';

/**
 * Pool for Graphics objects used in visual effects
 * Reduces garbage collection overhead by reusing Graphics instances
 */
export class GraphicsPool {
  private static circlePool: ObjectPool<Graphics>;
  private static rectanglePool: ObjectPool<Graphics>;
  private static linePool: ObjectPool<Graphics>;

  /**
   * Initialize the graphics pools
   */
  static initialize(): void {
    // Pool for circle graphics (used in particles, explosions, etc.)
    this.circlePool = new ObjectPool<Graphics>(
      () => new Graphics(),
      (graphics: Graphics) => {
        graphics.clear();
        graphics.alpha = 1;
        graphics.visible = true;
        graphics.x = 0;
        graphics.y = 0;
        graphics.rotation = 0;
        graphics.scale.set(1, 1);
      },
      100 // Max 100 pooled circle graphics
    );

    // Pool for rectangle graphics (used in UI, effects, etc.)
    this.rectanglePool = new ObjectPool<Graphics>(
      () => new Graphics(),
      (graphics: Graphics) => {
        graphics.clear();
        graphics.alpha = 1;
        graphics.visible = true;
        graphics.x = 0;
        graphics.y = 0;
        graphics.rotation = 0;
        graphics.scale.set(1, 1);
      },
      50 // Max 50 pooled rectangle graphics
    );

    // Pool for line graphics (used in trails, connections, etc.)
    this.linePool = new ObjectPool<Graphics>(
      () => new Graphics(),
      (graphics: Graphics) => {
        graphics.clear();
        graphics.alpha = 1;
        graphics.visible = true;
        graphics.x = 0;
        graphics.y = 0;
        graphics.rotation = 0;
        graphics.scale.set(1, 1);
      },
      50 // Max 50 pooled line graphics
    );
  }

  /**
   * Acquire a Graphics object for drawing circles
   */
  static acquireCircle(): Graphics {
    if (!this.circlePool) {
      this.initialize();
    }
    return this.circlePool.acquire();
  }

  /**
   * Acquire a Graphics object for drawing rectangles
   */
  static acquireRectangle(): Graphics {
    if (!this.rectanglePool) {
      this.initialize();
    }
    return this.rectanglePool.acquire();
  }

  /**
   * Acquire a Graphics object for drawing lines
   */
  static acquireLine(): Graphics {
    if (!this.linePool) {
      this.initialize();
    }
    return this.linePool.acquire();
  }

  /**
   * Release a circle Graphics object back to the pool
   */
  static releaseCircle(graphics: Graphics): void {
    if (this.circlePool) {
      this.circlePool.release(graphics);
    }
  }

  /**
   * Release a rectangle Graphics object back to the pool
   */
  static releaseRectangle(graphics: Graphics): void {
    if (this.rectanglePool) {
      this.rectanglePool.release(graphics);
    }
  }

  /**
   * Release a line Graphics object back to the pool
   */
  static releaseLine(graphics: Graphics): void {
    if (this.linePool) {
      this.linePool.release(graphics);
    }
  }

  /**
   * Get statistics for all pools
   */
  static getStats(): {
    circles: ReturnType<ObjectPool<Graphics>['getStats']>;
    rectangles: ReturnType<ObjectPool<Graphics>['getStats']>;
    lines: ReturnType<ObjectPool<Graphics>['getStats']>;
  } {
    if (!this.circlePool) {
      this.initialize();
    }
    return {
      circles: this.circlePool.getStats(),
      rectangles: this.rectanglePool.getStats(),
      lines: this.linePool.getStats(),
    };
  }

  /**
   * Clear all pools
   */
  static clear(): void {
    if (this.circlePool) {
      this.circlePool.clear();
    }
    if (this.rectanglePool) {
      this.rectanglePool.clear();
    }
    if (this.linePool) {
      this.linePool.clear();
    }
  }
}
