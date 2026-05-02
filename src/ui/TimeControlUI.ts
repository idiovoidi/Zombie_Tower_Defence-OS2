import { Container, Graphics, Text } from 'pixi.js';
import { TimeControlManager, TimeControlState, TimeSpeed } from '../managers/TimeControlManager';
import { UIComponent } from './UIComponent';

/**
 * TimeControlUI - UI component for controlling game speed and pause state
 *
 * Displays five buttons:
 * - Pause/Resume button (also controlled by Space key)
 * - Slow speed (0.5x)
 * - Normal speed (1x)
 * - Fast speed (2x)
 * - Very Fast speed (4x)
 *
 * Also displays current state indicator
 */
export class TimeControlUI extends UIComponent {
  private timeControlManager: TimeControlManager;
  private pauseButton!: Container;
  private slowSpeedButton!: Container;
  private normalSpeedButton!: Container;
  private fastSpeedButton!: Container;
  private veryFastSpeedButton!: Container;
  private statusText!: Text;
  private buttonBg = 0x3a3a3a;
  private buttonHoverBg = 0x5a5a5a;
  private buttonActiveBg = 0x00aa00;
  private buttonPauseBg = 0xaa5500;
  private buttonSize = 36;
  private buttonSpacing = 8;

  constructor(timeControlManager: TimeControlManager) {
    super();
    this.timeControlManager = timeControlManager;
    this.createUI();

    // Listen for state changes
    this.timeControlManager.setOnStateChangeCallback((state) => {
      this.updateUI(state);
    });
  }

  private createUI(): void {
    // Create pause button
    this.pauseButton = this.createButton('⏸', () => {
      this.timeControlManager.togglePause();
    });
    this.pauseButton.position.set(0, 0);
    this.addChild(this.pauseButton);

    // Create slow speed button (0.5x)
    this.slowSpeedButton = this.createButton('½×', () => {
      this.timeControlManager.setSpeed(TimeSpeed.SLOW);
    });
    this.slowSpeedButton.position.set(this.buttonSize + this.buttonSpacing, 0);
    this.addChild(this.slowSpeedButton);

    // Create normal speed button (1x)
    this.normalSpeedButton = this.createButton('1×', () => {
      this.timeControlManager.setSpeed(TimeSpeed.NORMAL);
    });
    this.normalSpeedButton.position.set((this.buttonSize + this.buttonSpacing) * 2, 0);
    this.addChild(this.normalSpeedButton);

    // Create fast speed button (2x)
    this.fastSpeedButton = this.createButton('2×', () => {
      this.timeControlManager.setSpeed(TimeSpeed.FAST);
    });
    this.fastSpeedButton.position.set((this.buttonSize + this.buttonSpacing) * 3, 0);
    this.addChild(this.fastSpeedButton);

    // Create very fast speed button (4x)
    this.veryFastSpeedButton = this.createButton('4×', () => {
      this.timeControlManager.setSpeed(TimeSpeed.VERY_FAST);
    });
    this.veryFastSpeedButton.position.set((this.buttonSize + this.buttonSpacing) * 4, 0);
    this.addChild(this.veryFastSpeedButton);

    // Create status text
    this.statusText = new Text({
      text: '',
      style: {
        fontSize: 12,
        fill: 0xffffff,
        fontFamily: 'Arial',
      },
    });
    this.statusText.position.set(0, this.buttonSize + 4);
    this.addChild(this.statusText);

    // Initial UI update
    this.updateUI(this.timeControlManager.getState());
  }

  private createButton(label: string, onClick: () => void): Container {
    const button = new Container();
    button.eventMode = 'static';
    button.cursor = 'pointer';

    // Button background
    const bg = new Graphics();
    bg.rect(0, 0, this.buttonSize, this.buttonSize).fill({ color: this.buttonBg });
    bg.stroke({ width: 2, color: 0x666666 });
    button.addChild(bg);

    // Button label
    const text = new Text({
      text: label,
      style: {
        fontSize: 16,
        fill: 0xffffff,
        fontFamily: 'Arial',
      },
    });
    text.anchor.set(0.5);
    text.position.set(this.buttonSize / 2, this.buttonSize / 2);
    button.addChild(text);

    // Hover effect
    button.on('pointerover', () => {
      bg.clear();
      bg.rect(0, 0, this.buttonSize, this.buttonSize).fill({ color: this.buttonHoverBg });
      bg.stroke({ width: 2, color: 0x888888 });
    });

    button.on('pointerout', () => {
      // Don't reset if active - handled by updateUI
      const state = this.timeControlManager.getState();
      this.updateButtonVisuals(state);
    });

    // Click handler
    button.on('pointerdown', () => {
      onClick();
    });

    // Store references for later updates
    (button as unknown as { bg: Graphics; label: Text }).bg = bg;
    (button as unknown as { bg: Graphics; label: Text }).label = text;

    return button;
  }

  private updateUI(state: TimeControlState): void {
    this.updateButtonVisuals(state);
    this.updateStatusText(state);
  }

  private updateButtonVisuals(state: TimeControlState): void {
    // Update pause button
    const pauseBg = (this.pauseButton as unknown as { bg: Graphics }).bg;
    const pauseLabel = (this.pauseButton as unknown as { label: Text }).label;
    pauseBg.clear();
    if (state.isPaused) {
      pauseBg.rect(0, 0, this.buttonSize, this.buttonSize).fill({ color: this.buttonPauseBg });
      pauseLabel.text = '▶';
    } else {
      pauseBg.rect(0, 0, this.buttonSize, this.buttonSize).fill({ color: this.buttonBg });
      pauseLabel.text = '⏸';
    }
    pauseBg.stroke({ width: 2, color: state.isPaused ? 0xffaa00 : 0x666666 });

    // Update normal speed button
    const normalBg = (this.normalSpeedButton as unknown as { bg: Graphics }).bg;
    normalBg.clear();
    if (!state.isPaused && state.speed === TimeSpeed.NORMAL) {
      normalBg.rect(0, 0, this.buttonSize, this.buttonSize).fill({ color: this.buttonActiveBg });
      normalBg.stroke({ width: 2, color: 0x00ff00 });
    } else {
      normalBg.rect(0, 0, this.buttonSize, this.buttonSize).fill({ color: this.buttonBg });
      normalBg.stroke({ width: 2, color: 0x666666 });
    }

    // Update slow speed button
    const slowBg = (this.slowSpeedButton as unknown as { bg: Graphics }).bg;
    slowBg.clear();
    if (!state.isPaused && state.speed === TimeSpeed.SLOW) {
      slowBg.rect(0, 0, this.buttonSize, this.buttonSize).fill({ color: this.buttonActiveBg });
      slowBg.stroke({ width: 2, color: 0x00ff00 });
    } else {
      slowBg.rect(0, 0, this.buttonSize, this.buttonSize).fill({ color: this.buttonBg });
      slowBg.stroke({ width: 2, color: 0x666666 });
    }

    // Update fast speed button (2x)
    const fastBg = (this.fastSpeedButton as unknown as { bg: Graphics }).bg;
    fastBg.clear();
    if (!state.isPaused && state.speed === TimeSpeed.FAST) {
      fastBg.rect(0, 0, this.buttonSize, this.buttonSize).fill({ color: this.buttonActiveBg });
      fastBg.stroke({ width: 2, color: 0x00ff00 });
    } else {
      fastBg.rect(0, 0, this.buttonSize, this.buttonSize).fill({ color: this.buttonBg });
      fastBg.stroke({ width: 2, color: 0x666666 });
    }

    // Update very fast speed button (4x)
    const veryFastBg = (this.veryFastSpeedButton as unknown as { bg: Graphics }).bg;
    veryFastBg.clear();
    if (!state.isPaused && state.speed === TimeSpeed.VERY_FAST) {
      veryFastBg.rect(0, 0, this.buttonSize, this.buttonSize).fill({ color: this.buttonActiveBg });
      veryFastBg.stroke({ width: 2, color: 0x00ff00 });
    } else {
      veryFastBg.rect(0, 0, this.buttonSize, this.buttonSize).fill({ color: this.buttonBg });
      veryFastBg.stroke({ width: 2, color: 0x666666 });
    }
  }

  private updateStatusText(state: TimeControlState): void {
    if (state.isPaused) {
      if (state.isPlacementPause) {
        this.statusText.text = 'PAUSED (Placement)';
        this.statusText.style.fill = 0xffaa00;
      } else {
        this.statusText.text = 'PAUSED';
        this.statusText.style.fill = 0xff6600;
      }
    } else {
      switch (state.speed) {
        case TimeSpeed.SLOW:
          this.statusText.text = '0.5× Speed';
          this.statusText.style.fill = 0x66aaff;
          break;
        case TimeSpeed.FAST:
          this.statusText.text = '2× Speed';
          this.statusText.style.fill = 0xffcc00;
          break;
        case TimeSpeed.VERY_FAST:
          this.statusText.text = '4× Speed';
          this.statusText.style.fill = 0xff6600;
          break;
        case TimeSpeed.NORMAL:
        default:
          this.statusText.text = '';
          break;
      }
    }
  }

  /**
   * Get the width of the control panel for positioning
   */
  public getControlWidth(): number {
    return (this.buttonSize + this.buttonSpacing) * 5 - this.buttonSpacing;
  }

  /**
   * Get the height of the control panel for positioning
   */
  public getControlHeight(): number {
    return this.buttonSize + 20;
  }

  /**
   * Update method required by UIComponent base class
   */
  public update(_deltaTime: number): void {
    // TimeControlUI updates are event-driven through the callback
    // No per-frame updates needed
  }
}
