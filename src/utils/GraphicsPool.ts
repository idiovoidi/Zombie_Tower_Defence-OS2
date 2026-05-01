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

  private static resetGraphics(graphics: Graphics): void {
    graphics.clear();
    graphics.alpha = 1;
    graphics.visible = true;
    graphics.x = 0;
    graphics.y = 0;
    graphics.rotation = 0;
    graphics.scale.set(1, 1);
  }

  /**
   * Initialize the graphics pools
   */
  static initialize(): void {
    GraphicsPool.circlePool = new ObjectPool<Graphics>(
      () => new Graphics(),
      GraphicsPool.resetGraphics,
      100 // Max 100 pooled circle graphics
    );
    GraphicsPool.rectanglePool = new ObjectPool<Graphics>(
      () => new Graphics(),
      GraphicsPool.resetGraphics,
      50 // Max 50 pooled rectangle graphics
    );
    GraphicsPool.linePool = new ObjectPool<Graphics>(
      () => new Graphics(),
      GraphicsPool.resetGraphics,
      50 // Max 50 pooled line graphics
    );
  }

  /**
   * Acquire a Graphics object for drawing circles
   */
  static acquireCircle(): Graphics {
    if (!GraphicsPool.circlePool) {
      GraphicsPool.initialize();
    }
    return GraphicsPool.circlePool.acquire();
  }

  /**
   * Acquire a Graphics object for drawing rectangles
   */
  static acquireRectangle(): Graphics {
    if (!GraphicsPool.rectanglePool) {
      GraphicsPool.initialize();
    }
    return GraphicsPool.rectanglePool.acquire();
  }

  /**
   * Acquire a Graphics object for drawing lines
   */
  static acquireLine(): Graphics {
    if (!GraphicsPool.linePool) {
      GraphicsPool.initialize();
    }
    return GraphicsPool.linePool.acquire();
  }

  /**
   * Release a circle Graphics object back to the pool
   */
  static releaseCircle(graphics: Graphics): void {
    if (GraphicsPool.circlePool) {
      GraphicsPool.circlePool.release(graphics);
    }
  }

  /**
   * Release a rectangle Graphics object back to the pool
   */
  static releaseRectangle(graphics: Graphics): void {
    if (GraphicsPool.rectanglePool) {
      GraphicsPool.rectanglePool.release(graphics);
    }
  }

  /**
   * Release a line Graphics object back to the pool
   */
  static releaseLine(graphics: Graphics): void {
    if (GraphicsPool.linePool) {
      GraphicsPool.linePool.release(graphics);
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
    if (!GraphicsPool.circlePool) {
      GraphicsPool.initialize();
    }
    return {
      circles: GraphicsPool.circlePool.getStats(),
      rectangles: GraphicsPool.rectanglePool.getStats(),
      lines: GraphicsPool.linePool.getStats(),
    };
  }

  /**
   * Clear all pools
   */
  static clear(): void {
    if (GraphicsPool.circlePool) {
      GraphicsPool.circlePool.clear();
    }
    if (GraphicsPool.rectanglePool) {
      GraphicsPool.rectanglePool.clear();
    }
    if (GraphicsPool.linePool) {
      GraphicsPool.linePool.clear();
    }
  }
}
