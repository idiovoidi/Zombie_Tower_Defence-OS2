import { Container, Text } from 'pixi.js';
import { GameConfig } from '../config/gameConfig';

/**
 * MoneyAnimation - Optimized money gain feedback system
 *
 * Uses smart batching to reduce text spam during high kill rates (waves 20+).
 * Shows immediate feedback for isolated gains, batches rapid consecutive gains.
 *
 * Performance improvements:
 * - Reduces Text object creation from 100+ per second to ~2 per second
 * - Limits concurrent animations to prevent frame drops
 * - Shorter animation duration for better readability
 */
export class MoneyAnimation {
  private container: Container;
  private animations: Array<{ text: Text; startTime: number; duration: number }> = [];

  // Batching system to reduce text spam
  private batchedAmount: number = 0;
  private batchTimer: number = 0;
  private lastGainTime: number = 0;
  private readonly BATCH_INTERVAL = 500; // Batch gains every 500ms
  private readonly IMMEDIATE_THRESHOLD = 200; // Show immediately if >200ms since last gain
  private readonly MAX_ACTIVE_ANIMATIONS = 5; // Limit concurrent animations

  constructor(container: Container) {
    this.container = container;
  }

  /**
   * Show a money gain animation in the bottom left feed
   * Uses smart batching to reduce text spam during high kill rates
   * @param amount Amount of money gained
   */
  public showMoneyGain(amount: number): void {
    const now = performance.now();
    const timeSinceLastGain = now - this.lastGainTime;

    // If it's been a while since last gain, show immediately
    if (timeSinceLastGain > this.IMMEDIATE_THRESHOLD && this.batchedAmount === 0) {
      this.batchedAmount = amount;
      this.flushBatch();
      this.lastGainTime = now;
      this.batchTimer = 0;
    } else {
      // Otherwise, batch it
      this.batchedAmount += amount;
      this.lastGainTime = now;
    }
  }

  /**
   * Flush batched money gains as a single animation
   */
  private flushBatch(): void {
    if (this.batchedAmount <= 0) {
      return;
    }

    // Remove oldest animation if we're at the limit
    if (this.animations.length >= this.MAX_ACTIVE_ANIMATIONS) {
      const oldest = this.animations.shift();
      if (oldest) {
        this.container.removeChild(oldest.text);
        oldest.text.destroy();
      }
    }

    const text = new Text({
      text: `+$${this.batchedAmount}`,
      style: {
        fontFamily: 'Arial',
        fontSize: 28,
        fontWeight: 'bold',
        fill: 0xffdd00, // Gold color for batched gains
        stroke: { color: 0x000000, width: 4 },
      },
    });

    text.anchor.set(0, 1); // Anchor bottom-left

    // Position in bottom left corner (with some padding)
    // Stack animations vertically, offset by existing animations
    const baseX = 20;
    const baseY = GameConfig.SCREEN_HEIGHT - 100; // Above bottom bar (use game canvas height, not window)
    const verticalOffset = this.animations.length * 40; // Stack upward

    text.position.set(baseX, baseY - verticalOffset);
    text.alpha = 1;

    this.container.addChild(text);

    // Add to animations list
    this.animations.push({
      text,
      startTime: performance.now(),
      duration: 1500, // Shorter duration for batched gains
    });

    // Reset batch
    this.batchedAmount = 0;
  }

  /**
   * Update all active animations
   * @param deltaTime Time since last frame in milliseconds
   */
  public update(deltaTime: number): void {
    const currentTime = performance.now();

    // Update batch timer
    this.batchTimer += deltaTime;
    if (this.batchTimer >= this.BATCH_INTERVAL) {
      this.flushBatch();
      this.batchTimer = 0;
    }

    // Update existing animations
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
        // Float upward
        anim.text.y -= deltaTime * 0.05; // Slightly faster float

        // Fade out in the last 50% of animation
        if (progress > 0.5) {
          anim.text.alpha = 1 - (progress - 0.5) / 0.5;
        }

        // Slight scale pulse at the start
        if (progress < 0.15) {
          const scale = 1 + (1 - progress / 0.15) * 0.3;
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
    this.batchedAmount = 0;
    this.batchTimer = 0;
  }
}
