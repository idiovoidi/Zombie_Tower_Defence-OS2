import { Container, Graphics, Text } from 'pixi.js';
import { UIComponent } from './UIComponent';

export class AIControlPanel extends UIComponent {
  private button!: Container;
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
    this.button = new Container();
    this.button.eventMode = 'static';
    this.button.cursor = 'pointer';

    const width = 80;
    const height = 80;

    // Background - dark panel
    const bg = new Graphics();
    bg.roundRect(0, 0, width, height, 8).fill({ color: 0x1a1a1a, alpha: 0.95 });
    bg.roundRect(0, 0, width, height, 8).stroke({ width: 2, color: 0x333333 });
    this.button.addChild(bg);

    // Inner border
    const innerBorder = new Graphics();
    innerBorder.roundRect(3, 3, width - 6, height - 6, 6).stroke({ width: 1, color: 0x444444 });
    this.button.addChild(innerBorder);

    // Robot icon
    const icon = this.createRobotIcon();
    icon.position.set(width / 2, 30);
    this.button.addChild(icon);

    // Status text
    const statusText = new Text({
      text: 'OFF',
      style: {
        fontFamily: 'Impact, Arial Black, sans-serif',
        fontSize: 14,
        fill: 0x888888,
        fontWeight: 'bold',
      },
    });
    statusText.name = 'statusText';
    statusText.anchor.set(0.5);
    statusText.position.set(width / 2, height - 15);
    this.button.addChild(statusText);

    // Store references
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (this.button as any).bg = bg;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (this.button as any).innerBorder = innerBorder;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (this.button as any).icon = icon;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (this.button as any).statusText = statusText;

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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const bg = (this.button as any).bg as Graphics;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const innerBorder = (this.button as any).innerBorder as Graphics;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const icon = (this.button as any).icon as Graphics;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const statusText = (this.button as any).statusText as Text;

    if (this.isEnabled) {
      // Enabled state - green
      bg.clear();
      bg.roundRect(0, 0, 80, 80, 8).fill({ color: 0x1a1a1a, alpha: 0.95 });
      bg.roundRect(0, 0, 80, 80, 8).stroke({ width: 2, color: 0x00aa00 });

      innerBorder.clear();
      innerBorder.roundRect(3, 3, 74, 74, 6).stroke({ width: 1, color: 0x00ff00 });

      statusText.text = 'ON';
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

      statusText.text = 'OFF';
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
