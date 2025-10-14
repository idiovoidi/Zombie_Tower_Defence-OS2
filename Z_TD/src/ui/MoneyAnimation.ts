import { Container, Text } from 'pixi.js';

export class MoneyAnimation {
  private container: Container;
  private animations: Array<{ text: Text; startTime: number; duration: number }> = [];

  constructor(container: Container) {
    this.container = container;
  }

  /**
   * Show a money gain animation in the bottom left feed
   * @param amount Amount of money gained
   */
  public showMoneyGain(amount: number): void {
    const text = new Text({
      text: `+$${amount}`,
      style: {
        fontFamily: 'Arial',
        fontSize: 24,
        fontWeight: 'bold',
        fill: 0x00ff00,
        stroke: { color: 0x000000, width: 4 },
      },
    });

    text.anchor.set(0, 1); // Anchor bottom-left

    // Position in bottom left corner (with some padding)
    // Stack animations vertically, offset by existing animations
    const baseX = 20;
    const baseY = window.innerHeight - 100; // Above bottom bar
    const verticalOffset = this.animations.length * 35; // Stack upward

    text.position.set(baseX, baseY - verticalOffset);
    text.alpha = 1;

    this.container.addChild(text);

    // Add to animations list
    this.animations.push({
      text,
      startTime: performance.now(),
      duration: 2000, // 2 seconds (slightly longer for readability)
    });
  }

  /**
   * Update all active animations
   * @param deltaTime Time since last frame in milliseconds
   */
  public update(deltaTime: number): void {
    const currentTime = performance.now();

    for (let i = this.animations.length - 1; i >= 0; i--) {
      const anim = this.animations[i];
      const elapsed = currentTime - anim.startTime;
      const progress = elapsed / anim.duration;

      if (progress >= 1) {
        // Animation complete, remove it
        this.container.removeChild(anim.text);
        anim.text.destroy();
        this.animations.splice(i, 1);
      } else {
        // Update animation
        // Float upward slowly
        anim.text.y -= deltaTime * 0.03;

        // Fade out in the last 40% of animation
        if (progress > 0.6) {
          anim.text.alpha = 1 - (progress - 0.6) / 0.4;
        }

        // Slight scale pulse at the start
        if (progress < 0.2) {
          const scale = 1 + (1 - progress / 0.2) * 0.2;
          anim.text.scale.set(scale);
        }
      }
    }
  }

  /**
   * Clear all animations
   */
  public clear(): void {
    for (const anim of this.animations) {
      this.container.removeChild(anim.text);
      anim.text.destroy();
    }
    this.animations = [];
  }
}
