import { Container, Graphics, Text } from 'pixi.js';
import { ResourceCleanupManager } from './ResourceCleanupManager';

// biome-ignore lint/complexity/noStaticOnlyClass: Stateless utility effects
export class VisualEffects {
  // Create a damage indicator that floats upward
  private static activeShakes = new Map<Container, { x: number; y: number }>();

  // Create a damage indicator that floats upward
  public static createDamageIndicator(
    container: Container,
    x: number,
    y: number,
    _damage: number
  ): void {
    const roundedDamage = Math.round(_damage);
    if (roundedDamage <= 0) return;

    const damageText = new Text({
      text: roundedDamage.toString(),
      style: {
        fontFamily: 'Arial Black, Impact, sans-serif',
        fontSize: 16,
        fill: 0xff3333,
        stroke: { color: 0x000000, width: 3 },
        fontWeight: 'bold',
      },
    });

    damageText.anchor.set(0.5);
    damageText.position.set(x, y - 10);
    container.addChild(damageText);

    const duration = 800;
    // Register as persistent effect for immediate cleanup on wave/game end
    ResourceCleanupManager.registerPersistentEffect(damageText, {
      type: 'damage_indicator',
      duration: duration,
    });

    const startTime = performance.now();
    const startY = damageText.position.y;

    const animate = () => {
      if (damageText.destroyed) {
        return;
      }

      const elapsed = performance.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Drift upward
      damageText.position.y = startY - progress * 40;
      damageText.alpha = 1 - progress;

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        if (!damageText.destroyed) {
          ResourceCleanupManager.unregisterPersistentEffect(damageText);
          container.removeChild(damageText);
          damageText.destroy();
        }
      }
    };

    requestAnimationFrame(animate);
  }

  // Trigger screen shake on a target container
  public static triggerScreenShake(container: Container, intensity = 6, duration = 300): void {
    if (container.destroyed) return;

    // Retrieve or store original position
    let originalPos = VisualEffects.activeShakes.get(container);
    if (!originalPos) {
      originalPos = { x: container.position.x, y: container.position.y };
      VisualEffects.activeShakes.set(container, originalPos);
    }

    const startTime = performance.now();
    const startX = originalPos.x;
    const startY = originalPos.y;

    const shake = () => {
      if (container.destroyed) {
        VisualEffects.activeShakes.delete(container);
        return;
      }

      const elapsed = performance.now() - startTime;
      const progress = elapsed / duration;

      if (progress >= 1) {
        container.position.set(startX, startY);
        VisualEffects.activeShakes.delete(container);
        return;
      }

      const currentIntensity = intensity * (1 - progress);
      const offsetX = (Math.random() - 0.5) * 2 * currentIntensity;
      const offsetY = (Math.random() - 0.5) * 2 * currentIntensity;

      container.position.set(startX + offsetX, startY + offsetY);

      requestAnimationFrame(shake);
    };

    shake();
  }

  // Create a screen damage flash effect (red corners)
  public static createDamageFlash(
    container: Container,
    screenWidth: number,
    screenHeight: number
  ): void {
    const cornerSize = 150;
    const flashDuration = 500; // milliseconds

    // Create corner overlays
    const corners = [
      { x: 0, y: 0 }, // Top-left
      { x: screenWidth - cornerSize, y: 0 }, // Top-right
      { x: 0, y: screenHeight - cornerSize }, // Bottom-left
      { x: screenWidth - cornerSize, y: screenHeight - cornerSize }, // Bottom-right
    ];

    const flashGraphics = corners.map(corner => {
      const graphic = new Graphics();
      graphic.rect(0, 0, cornerSize, cornerSize).fill({ color: 0xff0000, alpha: 0.5 });
      graphic.position.set(corner.x, corner.y);
      graphic.zIndex = 10000; // Ensure it's on top
      container.addChild(graphic);

      // Register each corner graphic as persistent effect
      ResourceCleanupManager.registerPersistentEffect(graphic, {
        type: 'damage_flash',
        duration: flashDuration,
      });

      return graphic;
    });

    // Animate the flash
    const startTime = performance.now();
    const animate = () => {
      const elapsed = performance.now() - startTime;
      const progress = Math.min(elapsed / flashDuration, 1);

      // Fade out using easing
      const alpha = 0.5 * (1 - progress);

      flashGraphics.forEach(graphic => {
        // Skip if already destroyed (e.g., wave ended)
        if (!graphic.destroyed) {
          graphic.alpha = alpha;
        }
      });

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        // Clean up
        flashGraphics.forEach(graphic => {
          if (!graphic.destroyed) {
            ResourceCleanupManager.unregisterPersistentEffect(graphic);
            container.removeChild(graphic);
            graphic.destroy();
          }
        });
      }
    };

    animate();
  }

  // Create a health bar for a game object
  // NOTE: Caller is responsible for destroying the returned Container and its Graphics children
  public static createHealthBar(
    container: Container,
    x: number,
    y: number,
    width: number,
    height: number
  ): Container {
    const healthBar = new Container();

    // Background (red)
    const bg = new Graphics();
    bg.rect(0, 0, width, height).fill(0xff0000);
    healthBar.addChild(bg);

    // Foreground (green)
    const fg = new Graphics();
    fg.rect(0, 0, width, height).fill(0x00ff00);
    healthBar.addChild(fg);

    healthBar.position.set(x, y);
    container.addChild(healthBar);

    return healthBar;
  }

  // Update health bar fill percentage
  public static updateHealthBar(healthBar: Container, percentage: number): void {
    if (healthBar.children.length >= 2) {
      const fg = healthBar.children[1] as Graphics;
      fg.width = (fg.parent as Graphics).width * (percentage / 100);
    }
  }
}
