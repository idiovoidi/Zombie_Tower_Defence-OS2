import { Graphics } from 'pixi.js';

/**
 * Barrel Heat Glow Effect
 * Visual indicator of barrel heating from sustained fire
 */
export class BarrelHeatGlow {
  private heatLevel: number = 0;
  private maxHeat: number = 100;
  private heatPerShot: number = 8;
  private coolingRate: number = 0.015; // Heat units per millisecond
  private glowGraphics: Graphics | null = null;
  private barrelGraphics: Graphics;

  constructor(barrelGraphics: Graphics) {
    this.barrelGraphics = barrelGraphics;
  }

  /**
   * Add heat from firing
   */
  public addHeat(): void {
    this.heatLevel = Math.min(this.maxHeat, this.heatLevel + this.heatPerShot);
  }

  /**
   * Update heat level and visual effect
   */
  public update(deltaTime: number): void {
    // Cool down over time
    if (this.heatLevel > 0) {
      this.heatLevel = Math.max(0, this.heatLevel - this.coolingRate * deltaTime);
    }

    // Update visual
    this.updateVisual();
  }

  /**
   * Update the visual glow effect
   */
  private updateVisual(): void {
    // Remove old glow if exists
    if (this.glowGraphics?.parent) {
      this.barrelGraphics.removeChild(this.glowGraphics);
      this.glowGraphics.destroy();
      this.glowGraphics = null;
    }

    // Only show glow if heat is above threshold
    if (this.heatLevel < 30) {
      return;
    }

    // Calculate glow intensity (0 to 1)
    const intensity = (this.heatLevel - 30) / (this.maxHeat - 30);

    // Create heat glow
    this.glowGraphics = new Graphics();

    // Determine color based on heat level
    let glowColor: number;
    if (intensity < 0.3) {
      // Warm (orange-ish)
      glowColor = 0xff6600;
    } else if (intensity < 0.7) {
      // Hot (red-orange)
      glowColor = 0xff3300;
    } else {
      // Very hot (bright red)
      glowColor = 0xff0000;
    }

    // Add subtle glow lines along the gun barrel only
    // Machine gun barrel is at y: -10 to gunTip
    const gunStart = -10;
    const gunEnd = -2; // Approximate gun tip for level 1

    // Draw subtle heat distortion lines above the barrel
    if (intensity > 0.3) {
      for (let i = 0; i < 2; i++) {
        const yPos = gunStart - 2 - i * 2;
        const xOffset = (Math.random() - 0.5) * 1;
        this.glowGraphics
          .moveTo(-2 + xOffset, yPos)
          .lineTo(2 + xOffset, yPos)
          .stroke({ width: 0.5, color: glowColor, alpha: intensity * 0.3 });
      }
    }

    // Add very subtle glow at gun tip only
    if (intensity > 0.5) {
      this.glowGraphics.circle(0, gunEnd, 1.5).fill({
        color: glowColor,
        alpha: intensity * 0.4,
      });
    }

    this.barrelGraphics.addChild(this.glowGraphics);
  }

  /**
   * Get current heat level (0-100)
   */
  public getHeatLevel(): number {
    return this.heatLevel;
  }

  /**
   * Check if barrel is overheated
   */
  public isOverheated(): boolean {
    return this.heatLevel >= this.maxHeat;
  }

  /**
   * Reset heat to zero
   */
  public reset(): void {
    this.heatLevel = 0;
    this.updateVisual();
  }

  /**
   * Clean up
   */
  public destroy(): void {
    if (this.glowGraphics?.parent) {
      this.barrelGraphics.removeChild(this.glowGraphics);
      this.glowGraphics.destroy();
      this.glowGraphics = null;
    }
  }
}
