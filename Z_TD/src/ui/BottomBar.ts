import { UIComponent } from './UIComponent';
import { Container, Graphics, Text } from 'pixi.js';
import { TextureGenerator } from '../utils/textureGenerator';

export class BottomBar extends UIComponent {
  private moneyValue!: Text;
  private livesValue!: Text;
  private waveValue!: Text;
  private woodValue!: Text;
  private metalValue!: Text;
  private energyValue!: Text;
  private nextWaveButton!: Container;
  private nextWaveCallback: (() => void) | null = null;

  constructor(width: number = 1000) {
    super();
    this.createBottomBar(width);
  }

  private createBottomBar(width: number): void {
    const barHeight = 80;

    // Main background - corrugated metal
    const metalBg = TextureGenerator.createCorrugatedMetal(width + 20, barHeight + 20);
    metalBg.position.set(-10, -10);
    this.addChild(metalBg);

    // Inner panel - rusty metal
    const innerBg = TextureGenerator.createRustyMetal(width, barHeight);
    this.addChild(innerBg);

    // Top border with rivets
    const topBorder = new Graphics();
    topBorder.rect(0, 0, width, 3).fill(0x2a2a2a);
    this.addChild(topBorder);

    // Add rivets along top
    for (let x = 20; x < width; x += 80) {
      const rivet = this.createRivet();
      rivet.position.set(x, 3);
      this.addChild(rivet);
    }

    // Create info panels
    const panelWidth = 180;
    const panelSpacing = 10;
    let xPos = 10;

    // Money panel
    const moneyPanel = this.createInfoPanel('FUNDS', '$', 0x00ff00, panelWidth);
    moneyPanel.position.set(xPos, 10);
    this.addChild(moneyPanel);
    this.moneyValue = moneyPanel.getChildByName('value') as Text;
    xPos += panelWidth + panelSpacing;

    // Lives panel
    const livesPanel = this.createInfoPanel('SURVIVORS', '', 0xff6666, panelWidth);
    livesPanel.position.set(xPos, 10);
    this.addChild(livesPanel);
    this.livesValue = livesPanel.getChildByName('value') as Text;
    xPos += panelWidth + panelSpacing;

    // Wave panel
    const wavePanel = this.createInfoPanel('WAVE', '', 0xffcc00, panelWidth);
    wavePanel.position.set(xPos, 10);
    this.addChild(wavePanel);
    this.waveValue = wavePanel.getChildByName('value') as Text;
    xPos += panelWidth + panelSpacing;

    // Resources panel (wider)
    const resourcesPanel = this.createResourcesPanel(220);
    resourcesPanel.position.set(xPos, 10);
    this.addChild(resourcesPanel);
    this.woodValue = resourcesPanel.getChildByName('wood') as Text;
    this.metalValue = resourcesPanel.getChildByName('metal') as Text;
    this.energyValue = resourcesPanel.getChildByName('energy') as Text;
    xPos += 220 + panelSpacing;

    // Next wave button (right side)
    this.nextWaveButton = this.createNextWaveButton();
    this.nextWaveButton.position.set(width - 160, 15);
    this.nextWaveButton.visible = false;
    this.addChild(this.nextWaveButton);

    // Bottom warning stripe
    const warningStripe = new Graphics();
    warningStripe.rect(0, barHeight - 5, width, 5).fill(0xffcc00);
    this.addChild(warningStripe);

    // Add diagonal stripes to warning
    for (let x = -10; x < width; x += 20) {
      const stripe = new Graphics();
      stripe.rect(x, barHeight - 5, 10, 5).fill(0x1a1a1a);
      this.addChild(stripe);
    }
  }

  private createRivet(): Graphics {
    const rivet = new Graphics();
    rivet.circle(0, 0, 4).fill(0x5a5a5a);
    rivet.circle(0, 0, 3).fill(0x6a6a6a);
    rivet.circle(-1, -1, 2).fill(0x8a8a8a);
    return rivet;
  }

  private createInfoPanel(label: string, prefix: string, valueColor: number, width: number): Container {
    const panel = new Container();

    // Panel background - concrete
    const concreteBg = TextureGenerator.createConcrete(width, 60);
    concreteBg.alpha = 0.8;
    panel.addChild(concreteBg);

    // Metal frame
    const frame = new Graphics();
    frame.rect(0, 0, width, 60).stroke({ width: 2, color: 0x3a3a3a });
    panel.addChild(frame);

    // Inner border
    const innerBorder = new Graphics();
    innerBorder.rect(2, 2, width - 4, 56).stroke({ width: 1, color: 0x5a5a5a });
    panel.addChild(innerBorder);

    // Label background
    const labelBg = new Graphics();
    labelBg.rect(5, 5, width - 10, 18).fill(0x2a2a2a);
    panel.addChild(labelBg);

    // Label text
    const labelText = new Text({
      text: label,
      style: {
        fontFamily: 'Impact, Arial Black, sans-serif',
        fontSize: 11,
        fill: 0xcccccc,
        fontWeight: 'bold',
        letterSpacing: 1,
      },
    });
    labelText.anchor.set(0.5, 0.5);
    labelText.position.set(width / 2, 14);
    panel.addChild(labelText);

    // Value text
    const valueText = new Text({
      text: `${prefix}0`,
      style: {
        fontFamily: 'Courier New, monospace',
        fontSize: 22,
        fill: valueColor,
        fontWeight: 'bold',
      },
    });
    valueText.name = 'value';
    valueText.anchor.set(0.5, 0.5);
    valueText.position.set(width / 2, 38);
    panel.addChild(valueText);

    // Status LED
    const led = new Graphics();
    led.circle(width - 10, 14, 3).fill(valueColor);
    led.alpha = 0.7;
    panel.addChild(led);

    return panel;
  }

  private createResourcesPanel(width: number): Container {
    const panel = new Container();

    // Panel background - concrete
    const concreteBg = TextureGenerator.createConcrete(width, 60);
    concreteBg.alpha = 0.8;
    panel.addChild(concreteBg);

    // Metal frame
    const frame = new Graphics();
    frame.rect(0, 0, width, 60).stroke({ width: 2, color: 0x3a3a3a });
    panel.addChild(frame);

    // Inner border
    const innerBorder = new Graphics();
    innerBorder.rect(2, 2, width - 4, 56).stroke({ width: 1, color: 0x5a5a5a });
    panel.addChild(innerBorder);

    // Label background
    const labelBg = new Graphics();
    labelBg.rect(5, 5, width - 10, 18).fill(0x2a2a2a);
    panel.addChild(labelBg);

    // Label text
    const labelText = new Text({
      text: 'RESOURCES',
      style: {
        fontFamily: 'Impact, Arial Black, sans-serif',
        fontSize: 11,
        fill: 0xcccccc,
        fontWeight: 'bold',
        letterSpacing: 1,
      },
    });
    labelText.anchor.set(0.5, 0.5);
    labelText.position.set(width / 2, 14);
    panel.addChild(labelText);

    // Resource icons and values
    const resourceWidth = width / 3;

    // Wood
    const woodIcon = this.createResourceIcon('W', 0x8b4513);
    woodIcon.position.set(resourceWidth / 2 - 20, 38);
    panel.addChild(woodIcon);

    const woodValue = new Text({
      text: '0',
      style: {
        fontFamily: 'Courier New, monospace',
        fontSize: 16,
        fill: 0x8b4513,
        fontWeight: 'bold',
      },
    });
    woodValue.name = 'wood';
    woodValue.anchor.set(0, 0.5);
    woodValue.position.set(resourceWidth / 2, 38);
    panel.addChild(woodValue);

    // Metal
    const metalIcon = this.createResourceIcon('M', 0x888888);
    metalIcon.position.set(resourceWidth + resourceWidth / 2 - 20, 38);
    panel.addChild(metalIcon);

    const metalValue = new Text({
      text: '0',
      style: {
        fontFamily: 'Courier New, monospace',
        fontSize: 16,
        fill: 0x888888,
        fontWeight: 'bold',
      },
    });
    metalValue.name = 'metal';
    metalValue.anchor.set(0, 0.5);
    metalValue.position.set(resourceWidth + resourceWidth / 2, 38);
    panel.addChild(metalValue);

    // Energy
    const energyIcon = this.createResourceIcon('E', 0x00ced1);
    energyIcon.position.set(resourceWidth * 2 + resourceWidth / 2 - 20, 38);
    panel.addChild(energyIcon);

    const energyValue = new Text({
      text: '0',
      style: {
        fontFamily: 'Courier New, monospace',
        fontSize: 16,
        fill: 0x00ced1,
        fontWeight: 'bold',
      },
    });
    energyValue.name = 'energy';
    energyValue.anchor.set(0, 0.5);
    energyValue.position.set(resourceWidth * 2 + resourceWidth / 2, 38);
    panel.addChild(energyValue);

    return panel;
  }

  private createResourceIcon(letter: string, color: number): Graphics {
    const icon = new Graphics();
    icon.circle(0, 0, 8).fill(0x2a2a2a);
    icon.circle(0, 0, 7).fill(color);
    icon.circle(0, 0, 7).stroke({ width: 1, color: 0x1a1a1a });

    const text = new Text({
      text: letter,
      style: {
        fontFamily: 'Impact, Arial Black, sans-serif',
        fontSize: 10,
        fill: 0xffffff,
        fontWeight: 'bold',
      },
    });
    text.anchor.set(0.5, 0.5);
    icon.addChild(text);

    return icon;
  }

  private createNextWaveButton(): Container {
    const button = new Container();
    button.eventMode = 'static';
    button.cursor = 'pointer';

    const width = 150;
    const height = 50;

    // Button background - concrete
    const concreteBg = TextureGenerator.createConcrete(width, height);
    button.addChild(concreteBg);

    // Button frame
    const frame = new Graphics();
    frame.roundRect(0, 0, width, height, 5).stroke({ width: 3, color: 0x00aa00 });
    button.addChild(frame);

    // Inner glow
    const innerGlow = new Graphics();
    innerGlow.roundRect(3, 3, width - 6, height - 6, 3).stroke({ width: 1, color: 0x00ff00 });
    button.addChild(innerGlow);

    // Caution stripes background
    for (let x = 0; x < width; x += 20) {
      const stripe = new Graphics();
      stripe.rect(x, 0, 10, height).fill({ color: 0xffcc00, alpha: 0.1 });
      button.addChild(stripe);
    }

    // Button text
    const text = new Text({
      text: 'NEXT WAVE',
      style: {
        fontFamily: 'Impact, Arial Black, sans-serif',
        fontSize: 18,
        fill: 0x00ff00,
        stroke: { color: 0x000000, width: 3 },
        fontWeight: 'bold',
        letterSpacing: 2,
      },
    });
    text.anchor.set(0.5);
    text.position.set(width / 2, height / 2);
    button.addChild(text);

    // Store references for hover effects
    (button as any).frame = frame;
    (button as any).text = text;

    // Hover effects
    button.on('pointerover', () => {
      frame.clear();
      frame.roundRect(0, 0, width, height, 5).stroke({ width: 4, color: 0x00ff00 });
      text.style.fill = 0xffff00;
    });

    button.on('pointerout', () => {
      frame.clear();
      frame.roundRect(0, 0, width, height, 5).stroke({ width: 3, color: 0x00aa00 });
      text.style.fill = 0x00ff00;
    });

    button.on('pointerdown', (event) => {
      event.stopPropagation();
      if (this.nextWaveCallback) {
        this.nextWaveCallback();
      }
    });

    return button;
  }

  // Update methods
  public updateMoney(money: number): void {
    this.moneyValue.text = `$${money}`;
  }

  public updateLives(lives: number): void {
    this.livesValue.text = `${lives}`;
  }

  public updateWave(wave: number): void {
    this.waveValue.text = `${wave}`;
  }

  public updateResources(wood: number, metal: number, energy: number): void {
    this.woodValue.text = `${Math.floor(wood)}`;
    this.metalValue.text = `${Math.floor(metal)}`;
    this.energyValue.text = `${Math.floor(energy)}`;
  }

  public showNextWaveButton(): void {
    this.nextWaveButton.visible = true;
  }

  public hideNextWaveButton(): void {
    this.nextWaveButton.visible = false;
  }

  public setNextWaveCallback(callback: () => void): void {
    this.nextWaveCallback = callback;
  }

  public update(_deltaTime: number): void {
    // Update logic if needed
  }
}
