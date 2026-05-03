import { Container, Graphics, Text } from 'pixi.js';
import { UIComponent } from './UIComponent';

/**
 * UIPanel — base class for all collapsible debug/info panels.
 *
 * Provides:
 *  - A toggle button (always visible)
 *  - A floating contentContainer added to the stage separately
 *  - Shared open / close / toggle logic
 *  - Helpers for creating the panel background, close button, and action buttons
 */
export abstract class UIPanel extends UIComponent {
  protected background!: Graphics;
  protected contentContainer!: Container;
  protected toggleButton!: Container;
  protected isExpanded = false;

  // ── Toggle button ────────────────────────────────────────────────────────

  protected createToggleButton(label: string, width: number, accentColor: number): void {
    this.toggleButton = new Container();
    this.toggleButton.eventMode = 'static';
    this.toggleButton.cursor = 'pointer';

    const bg = new Graphics();
    bg.roundRect(0, 0, width, 30, 5).fill({ color: 0x1a1a1a, alpha: 0.9 });
    bg.stroke({ width: 2, color: accentColor });
    this.toggleButton.addChild(bg);

    const text = new Text({
      text: label,
      style: { fontFamily: 'Arial', fontSize: 14, fill: accentColor, fontWeight: 'bold' },
    });
    text.anchor.set(0.5);
    text.position.set(width / 2, 15);
    this.toggleButton.addChild(text);

    this.toggleButton.on('pointerdown', () => this.togglePanel());
    this.addChild(this.toggleButton);
  }

  // ── Panel background + title + subtitle + close button ───────────────────

  protected createPanelFrame(
    panelWidth: number,
    panelHeight: number,
    title: string,
    subtitle: string,
    accentColor: number,
    screenCenterX = 640,
    screenCenterY = 384
  ): void {
    this.contentContainer = new Container();
    this.contentContainer.visible = false;
    this.contentContainer.position.set(
      screenCenterX - panelWidth / 2,
      screenCenterY - panelHeight / 2
    );

    // Static background container for caching
    const staticBg = new Container();
    staticBg.cullableChildren = false;
    this.contentContainer.addChild(staticBg);

    // Background
    this.background = new Graphics();
    this.background
      .roundRect(0, 0, panelWidth, panelHeight, 10)
      .fill({ color: 0x1a1a1a, alpha: 0.95 });
    this.background.stroke({ width: 3, color: accentColor });
    staticBg.addChild(this.background);

    // Title
    const titleText = new Text({
      text: title,
      style: {
        fontFamily: 'Impact, Arial Black, sans-serif',
        fontSize: 18,
        fill: accentColor,
        fontWeight: 'bold',
        letterSpacing: 1,
      },
    });
    titleText.position.set(10, 10);
    this.contentContainer.addChild(titleText);

    // Subtitle
    const subtitleText = new Text({
      text: subtitle,
      style: { fontFamily: 'Arial', fontSize: 11, fill: 0xcccccc, fontStyle: 'italic' },
    });
    subtitleText.position.set(10, 35);
    this.contentContainer.addChild(subtitleText);

    // Close button
    const closeButton = new Container();
    closeButton.eventMode = 'static';
    closeButton.cursor = 'pointer';

    const closeBg = new Graphics();
    closeBg.circle(0, 0, 20).fill({ color: accentColor, alpha: 0.9 });
    closeBg.stroke({ width: 2, color: 0xffffff });
    closeButton.addChild(closeBg);

    const closeText = new Text({
      text: '✕',
      style: { fontFamily: 'Arial', fontSize: 20, fill: 0xffffff, fontWeight: 'bold' },
    });
    closeText.anchor.set(0.5);
    closeButton.addChild(closeText);

    closeButton.position.set(panelWidth - 30, 20);
    closeButton.on('pointerdown', () => this.close());
    this.contentContainer.addChild(closeButton);

    // Cache the static background
    staticBg.cacheAsTexture(true);

    this.addChild(this.contentContainer);
  }

  // ── Shared action button ─────────────────────────────────────────────────

  protected createActionButton(
    label: string,
    width: number,
    height: number,
    accentColor: number,
    onClick: () => void
  ): Container {
    const button = new Container();
    button.eventMode = 'static';
    button.cursor = 'pointer';

    const bg = new Graphics();
    bg.roundRect(0, 0, width, height, 5).fill({ color: 0x2a2a2a, alpha: 0.9 });
    bg.stroke({ width: 2, color: accentColor });
    button.addChild(bg);

    const text = new Text({
      text: label,
      style: { fontFamily: 'Arial', fontSize: 13, fill: accentColor, fontWeight: 'bold' },
    });
    text.anchor.set(0.5);
    text.position.set(width / 2, height / 2);
    button.addChild(text);

    button.on('pointerdown', onClick);
    return button;
  }

  // ── Lifecycle ────────────────────────────────────────────────────────────

  public getContentContainer(): Container {
    return this.contentContainer;
  }

  protected togglePanel(): void {
    this.isExpanded = !this.isExpanded;
    this.contentContainer.visible = this.isExpanded;
    if (this.isExpanded) {
      this.onOpen();
    }
  }

  /** Called when the panel is opened. Override to refresh content. */
  protected onOpen(): void {
    // Override in subclasses to refresh content
  }

  public open(): void {
    this.isExpanded = true;
    this.contentContainer.visible = true;
    this.onOpen();
  }

  public close(): void {
    this.isExpanded = false;
    this.contentContainer.visible = false;
  }
}
