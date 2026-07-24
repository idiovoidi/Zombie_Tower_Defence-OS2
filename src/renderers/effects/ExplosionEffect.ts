import { Container, Graphics } from 'pixi.js';
import { calculateGrenadeBlastRadius } from '../../config/towerConstants';
import { EffectCleanupManager } from '../../utils/EffectCleanupManager';
import { ResourceCleanupManager } from '../../utils/ResourceCleanupManager';

/**
 * ExplosionEffect - Animated explosion visual effect with debris and smoke
 *
 * Creates a multi-layered explosion with shockwave, fire layers, debris particles,
 * and smoke. Scales in size and intensity based on upgrade level.
 */
export class ExplosionEffect extends Container {
  private explosionGraphics: Graphics;
  private upgradeLevel: number;
  private explosionRadius: number;

  constructor(x: number, y: number, upgradeLevel: number, duration = 400) {
    super();

    this.position.set(x, y);
    this.upgradeLevel = upgradeLevel;
    this.explosionRadius = calculateGrenadeBlastRadius(upgradeLevel);

    this.explosionGraphics = new Graphics();
    this.addChild(this.explosionGraphics);

    this.drawExplosion();
    this.registerForCleanup(duration);
  }

  /**
   * Get the explosion radius for damage calculations
   */
  public getExplosionRadius(): number {
    return this.explosionRadius;
  }

  /**
   * Get the upgrade level
   */
  public getUpgradeLevel(): number {
    return this.upgradeLevel;
  }

  /**
   * Draw the complete explosion effect
   */
  private drawExplosion(): void {
    const radiusScale = this.explosionRadius / 60; // Normalize to original 60px radius

    // Outer shockwave ring
    this.explosionGraphics.circle(0, 0, this.explosionRadius).stroke({
      width: 4,
      color: 0xff6600,
      alpha: 0.8,
    });
    this.explosionGraphics.circle(0, 0, this.explosionRadius - 5).stroke({
      width: 3,
      color: 0xff8800,
      alpha: 0.6,
    });

    // Multiple explosion layers - scale with explosion radius
    const layers = [
      { radius: 50 * radiusScale, color: 0xff4500, alpha: 0.7 },
      { radius: 40 * radiusScale, color: 0xff6600, alpha: 0.8 },
      { radius: 30 * radiusScale, color: 0xff8800, alpha: 0.85 },
      { radius: 20 * radiusScale, color: 0xffaa00, alpha: 0.9 },
      { radius: 12 * radiusScale, color: 0xffff00, alpha: 0.95 },
      { radius: 6 * radiusScale, color: 0xffffff, alpha: 1.0 },
    ];

    for (const layer of layers) {
      this.explosionGraphics
        .circle(0, 0, layer.radius)
        .fill({ color: layer.color, alpha: layer.alpha });
    }

    // Explosion debris/particles - more debris for higher levels
    const debrisCount = 15 + this.upgradeLevel * 3;
    for (let i = 0; i < debrisCount; i++) {
      const angle = (i / debrisCount) * Math.PI * 2;
      const distance = (25 + Math.random() * 20) * radiusScale;
      const x = Math.cos(angle) * distance;
      const y = Math.sin(angle) * distance;
      const size = (2 + Math.random() * 4) * radiusScale;
      const color = Math.random() > 0.5 ? 0xff6600 : 0x8b4513;
      this.explosionGraphics.circle(x, y, size).fill({ color, alpha: 0.8 });
    }

    // Smoke puffs - more smoke for higher levels
    const smokeCount = 10 + this.upgradeLevel * 2;
    for (let i = 0; i < smokeCount; i++) {
      const angle = (i / smokeCount) * Math.PI * 2;
      const distance = (30 + Math.random() * 15) * radiusScale;
      const x = Math.cos(angle) * distance;
      const y = Math.sin(angle) * distance;
      const size = (8 + Math.random() * 8) * radiusScale;
      this.explosionGraphics.circle(x, y, size).fill({ color: 0x4a4a4a, alpha: 0.5 });
    }

    // Set initial scale for animation
    this.scale.set(0.5);
    this.alpha = 1;
  }

  /**
   * Register this explosion for cleanup after duration expires
   */
  private registerForCleanup(duration: number): void {
    // Register for persistent effect cleanup
    ResourceCleanupManager.registerPersistentEffect(this as unknown as Graphics, {
      type: 'explosion',
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
   * Clean up the explosion effect
   */
  public override destroy(): void {
    ResourceCleanupManager.unregisterPersistentEffect(this as unknown as Graphics);

    if (this.parent) {
      this.parent.removeChild(this);
    }

    super.destroy({ children: true });
  }
}
