import { Container, Graphics, Text } from 'pixi.js';
import { UIComponent } from './UIComponent';

// Extended Container type for AI button
interface AIButton extends Container {
  bg: Graphics;
  innerBorder: Graphics;
  icon: Graphics;
  statusText: Text;
}

export class AIControlPanel extends UIComponent {
  private button!: AIButton;
  private isEnabled: boolean = false;
  private toggleCallback: ((enabled: boolean) => void) | null = null;

  constructor() {
    super();
    this.createButton();
  }

  public update(_deltaTime: number): void {
    // No update logic needed
  }

  private createButton(): void {
    this.button = new Container() as AIButton;
    this.button.eventMode = 'static';
    this.button.cursor = 'pointer';

    const width = 80;
    const height = 80;

    // Static background container for caching
    const staticBg = new Container();
    staticBg.cullableChildren = false;
    this.button.addChild(staticBg);

    // Background - dark panel
    const bg = new Graphics();
    bg.roundRect(0, 0, width, height, 8).fill({ color: 0x1a1a1a, alpha: 0.95 });
    bg.roundRect(0, 0, width, height, 8).stroke({ width: 2, color: 0x333333 });
    staticBg.addChild(bg);

    // Inner border
    const innerBorder = new Graphics();
    innerBorder.roundRect(3, 3, width - 6, height - 6, 6).stroke({ width: 1, color: 0x444444 });
    staticBg.addChild(innerBorder);

    // Robot icon (static part)
    const icon = this.createRobotIcon();
    icon.position.set(width / 2, 30);
    staticBg.addChild(icon);

    // Cache the static background
    staticBg.cacheAsTexture(true);

    // Status text (dynamic)
    const statusText = new Text({
      text: 'OFF',
      style: {
        fontFamily: 'Impact, Arial Black, sans-serif',
        fontSize: 14,
        fill: 0x888888,
        fontWeight: 'bold',
      },
    });
    statusText.label = 'statusText';
    statusText.anchor.set(0.5);
    statusText.position.set(width / 2, height - 15);
    this.button.addChild(statusText);

    // Store references
    this.button.bg = bg;
    this.button.innerBorder = innerBorder;
    this.button.icon = icon;
    this.button.statusText = statusText;

    // Hover effects
    this.button.on('pointerover', () => {
      bg.clear();
      bg.roundRect(0, 0, width, height, 8).fill({ color: 0x2a2a2a, alpha: 0.95 });
      bg.roundRect(0, 0, width, height, 8).stroke({
        width: 2,
        color: this.isEnabled ? 0x00ff00 : 0x555555,
      });
    });

    this.button.on('pointerout', () => {
      bg.clear();
      bg.roundRect(0, 0, width, height, 8).fill({ color: 0x1a1a1a, alpha: 0.95 });
      bg.roundRect(0, 0, width, height, 8).stroke({
        width: 2,
        color: this.isEnabled ? 0x00aa00 : 0x333333,
      });
    });

    this.button.on('pointerdown', event => {
      event.stopPropagation();
      this.toggle();
    });

    this.addChild(this.button);
  }

  private createRobotIcon(): Graphics {
    const icon = new Graphics();

    // Robot head
    icon.roundRect(-15, -15, 30, 25, 4).fill(0x666666);
    icon.roundRect(-15, -15, 30, 25, 4).stroke({ width: 2, color: 0x888888 });

    // Eyes
    icon.circle(-8, -8, 3).fill(0x00ff00);
    icon.circle(8, -8, 3).fill(0x00ff00);

    // Antenna
    icon.rect(-2, -18, 4, 3).fill(0x888888);
    icon.circle(0, -20, 3).fill(0xff0000);

    // Mouth
    icon.rect(-8, 2, 16, 2).fill(0x444444);

    return icon;
  }

  private toggle(): void {
    this.isEnabled = !this.isEnabled;
    this.updateVisuals();

    if (this.toggleCallback) {
      this.toggleCallback(this.isEnabled);
    }
  }

  private updateVisuals(): void {
    const bg = this.button.bg;
    const innerBorder = this.button.innerBorder;
    const icon = this.button.icon;
    const statusText = this.button.statusText;

    if (this.isEnabled) {
      // Enabled state - green
      bg.clear();
      bg.roundRect(0, 0, 80, 80, 8).fill({ color: 0x1a1a1a, alpha: 0.95 });
      bg.roundRect(0, 0, 80, 80, 8).stroke({ width: 2, color: 0x00aa00 });

      innerBorder.clear();
      innerBorder.roundRect(3, 3, 74, 74, 6).stroke({ width: 1, color: 0x00ff00 });

      if (statusText.text !== 'ON') {
        statusText.text = 'ON';
      }
      statusText.style.fill = 0x00ff00;

      // Animate eyes
      icon.clear();
      icon.roundRect(-15, -15, 30, 25, 4).fill(0x666666);
      icon.roundRect(-15, -15, 30, 25, 4).stroke({ width: 2, color: 0x00ff00 });
      icon.circle(-8, -8, 3).fill(0x00ff00);
      icon.circle(8, -8, 3).fill(0x00ff00);
      icon.rect(-2, -18, 4, 3).fill(0x00ff00);
      icon.circle(0, -20, 3).fill(0x00ff00);
      icon.rect(-8, 2, 16, 2).fill(0x00ff00);
    } else {
      // Disabled state - gray
      bg.clear();
      bg.roundRect(0, 0, 80, 80, 8).fill({ color: 0x1a1a1a, alpha: 0.95 });
      bg.roundRect(0, 0, 80, 80, 8).stroke({ width: 2, color: 0x333333 });

      innerBorder.clear();
      innerBorder.roundRect(3, 3, 74, 74, 6).stroke({ width: 1, color: 0x444444 });

      if (statusText.text !== 'OFF') {
        statusText.text = 'OFF';
      }
      statusText.style.fill = 0x888888;

      // Reset icon
      icon.clear();
      icon.roundRect(-15, -15, 30, 25, 4).fill(0x666666);
      icon.roundRect(-15, -15, 30, 25, 4).stroke({ width: 2, color: 0x888888 });
      icon.circle(-8, -8, 3).fill(0x00ff00);
      icon.circle(8, -8, 3).fill(0x00ff00);
      icon.rect(-2, -18, 4, 3).fill(0x888888);
      icon.circle(0, -20, 3).fill(0xff0000);
      icon.rect(-8, 2, 16, 2).fill(0x444444);
    }
  }

  public setToggleCallback(callback: (enabled: boolean) => void): void {
    this.toggleCallback = callback;
  }

  public setEnabled(enabled: boolean): void {
    if (this.isEnabled !== enabled) {
      this.isEnabled = enabled;
      this.updateVisuals();
    }
  }

  public getEnabled(): boolean {
    return this.isEnabled;
  }
}
