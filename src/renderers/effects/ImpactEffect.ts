import { Container, Graphics } from 'pixi.js';
import { EffectCleanupManager } from '../../utils/EffectCleanupManager';
import { ResourceCleanupManager } from '../../utils/ResourceCleanupManager';

/**
 * ImpactEffect - Simple hit impact visual effects
 *
 * Lightweight impact effects for various projectile types.
 */
export class ImpactEffect extends Container {
  constructor(
    x: number,
    y: number,
    type: 'tesla' | 'bullet' | 'default' = 'default',
    duration = 100
  ) {
    super();

    this.position.set(x, y);

    const graphics = new Graphics();
    this.addChild(graphics);

    switch (type) {
      case 'tesla':
        // Blue electric impact
        graphics.circle(0, 0, 10).fill({ color: 0x00bfff, alpha: 0.6 });
        break;
      case 'bullet':
      default:
        // Yellow bullet impact
        graphics.circle(0, 0, 5).fill({ color: 0xffff00, alpha: 0.6 });
        break;
    }

    this.registerForCleanup(duration);
  }

  /**
   * Register this effect for cleanup after duration expires
   */
  private registerForCleanup(duration: number): void {
    // Register for persistent effect cleanup
    ResourceCleanupManager.registerPersistentEffect(this as unknown as Graphics, {
      type: 'impact',
      duration: duration,
    });

    // Schedule automatic cleanup
    EffectCleanupManager.registerTimeout(
      setTimeout(() => {
        this.destroy();
      }, duration)
    );
  }

  /**
   * Clean up the impact effect
   */
  public override destroy(): void {
    ResourceCleanupManager.unregisterPersistentEffect(this as unknown as Graphics);

    if (this.parent) {
      this.parent.removeChild(this);
    }

    super.destroy({ children: true });
  }
}
