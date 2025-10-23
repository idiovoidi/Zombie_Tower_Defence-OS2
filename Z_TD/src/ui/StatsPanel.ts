import { Container, Graphics, Text } from 'pixi.js';
import { UIComponent } from './UIComponent';
import type { GameManager } from '@managers/GameManager';

export class StatsPanel extends UIComponent {
  private background!: Graphics;
  private titleText!: Text;
  private statsTexts: Map<string, Text> = new Map();
  private exportButton!: Container;
  private exportButtonBg!: Graphics;
  private exportButtonText!: Text;
  private isCollapsed: boolean = false;
  private collapseButton!: Container;
  private collapseButtonBg!: Graphics;
  private collapseButtonText!: Text;
  private contentContainer!: Container;

  private readonly PANEL_WIDTH = 280;
  private readonly PANEL_HEIGHT = 400;
  private readonly COLLAPSED_HEIGHT = 40;
  private readonly PADDING = 10;
  private readonly LINE_HEIGHT = 20;

  constructor(private gameManager: GameManager) {
    super();
    this.createPanel();
    this.position.set(10, 100);
  }

  private createPanel(): void {
    this.background = new Graphics();
    this.addChild(this.background);

    this.titleText = new Text({
      text: '📊 Performance Stats',
      style: {
        fontSize: 16,
        fontWeight: 'bold',
        fill: 0xffffff,
      },
    });
    this.titleText.position.set(this.PADDING, this.PADDING);
    this.addChild(this.titleText);

    this.collapseButton = this.createCollapseButton();
    this.addChild(this.collapseButton);

    const hideButton = this.createHideButton();
    this.addChild(hideButton);

    this.contentContainer = new Container();
    this.addChild(this.contentContainer);

    this.exportButton = this.createExportButton();
    this.contentContainer.addChild(this.exportButton);

    this.drawBackground();
  }

  private createCollapseButton(): Container {
    const button = new Container();
    button.eventMode = 'static';
    button.cursor = 'pointer';

    const bg = new Graphics();
    bg.rect(0, 0, 30, 25);
    bg.fill(0x4a4a4a);
    bg.stroke({ width: 1, color: 0x666666 });
    button.addChild(bg);

    const text = new Text({
      text: '−',
      style: { fontSize: 18, fill: 0xffffff },
    });
    text.anchor.set(0.5);
    text.position.set(15, 12);
    button.addChild(text);

    button.position.set(this.PANEL_WIDTH - 40, this.PADDING);

    button.on('pointerdown', () => this.toggleCollapse());
    button.on('pointerover', () => {
      bg.clear();
      bg.rect(0, 0, 30, 25);
      bg.fill(0x5a5a5a);
      bg.stroke({ width: 1, color: 0x888888 });
    });
    button.on('pointerout', () => {
      bg.clear();
      bg.rect(0, 0, 30, 25);
      bg.fill(0x4a4a4a);
      bg.stroke({ width: 1, color: 0x666666 });
    });

    this.collapseButtonBg = bg;
    this.collapseButtonText = text;

    return button;
  }

  private toggleCollapse(): void {
    this.isCollapsed = !this.isCollapsed;
    this.collapseButtonText.text = this.isCollapsed ? '+' : '−';
    this.contentContainer.visible = !this.isCollapsed;
    this.drawBackground();
  }

  private createHideButton(): Container {
    const button = new Container();
    button.eventMode = 'static';
    button.cursor = 'pointer';

    const bg = new Graphics();
    bg.circle(0, 0, 12).fill(0xff4444);
    bg.stroke({ width: 1, color: 0xffffff });
    button.addChild(bg);

    const text = new Text({
      text: '✕',
      style: { fontSize: 14, fill: 0xffffff, fontWeight: 'bold' },
    });
    text.anchor.set(0.5);
    text.position.set(0, 0);
    button.addChild(text);

    button.position.set(this.PANEL_WIDTH - 15, 15);

    button.on('pointerdown', () => this.hide());
    button.on('pointerover', () => {
      bg.clear();
      bg.circle(0, 0, 12).fill(0xff6666);
      bg.stroke({ width: 1, color: 0xffffff });
    });
    button.on('pointerout', () => {
      bg.clear();
      bg.circle(0, 0, 12).fill(0xff4444);
      bg.stroke({ width: 1, color: 0xffffff });
    });

    return button;
  }

  private createExportButton(): Container {
    const button = new Container();
    button.eventMode = 'static';
    button.cursor = 'pointer';

    const bg = new Graphics();
    bg.roundRect(0, 0, this.PANEL_WIDTH - this.PADDING * 2, 35, 5);
    bg.fill(0x4caf50);
    bg.stroke({ width: 2, color: 0x45a049 });
    button.addChild(bg);

    const text = new Text({
      text: '📥 Export Report',
      style: {
        fontSize: 14,
        fontWeight: 'bold',
        fill: 0xffffff,
      },
    });
    text.anchor.set(0.5);
    text.position.set((this.PANEL_WIDTH - this.PADDING * 2) / 2, 17);
    button.addChild(text);

    button.position.set(this.PADDING, this.PANEL_HEIGHT - 45);

    button.on('pointerdown', () => this.handleExport());
    button.on('pointerover', () => {
      bg.clear();
      bg.roundRect(0, 0, this.PANEL_WIDTH - this.PADDING * 2, 35, 5);
      bg.fill(0x5cb85c);
      bg.stroke({ width: 2, color: 0x4caf50 });
    });
    button.on('pointerout', () => {
      bg.clear();
      bg.roundRect(0, 0, this.PANEL_WIDTH - this.PADDING * 2, 35, 5);
      bg.fill(0x4caf50);
      bg.stroke({ width: 2, color: 0x45a049 });
    });

    this.exportButtonBg = bg;
    this.exportButtonText = text;

    return button;
  }

  private drawBackground(): void {
    this.background.clear();
    const height = this.isCollapsed ? this.COLLAPSED_HEIGHT : this.PANEL_HEIGHT;

    this.background.rect(0, 0, this.PANEL_WIDTH, height);
    this.background.fill({ color: 0x2a2a2a, alpha: 0.95 });
    this.background.stroke({ width: 2, color: 0x4a4a4a });
  }

  private handleExport(): void {
    const statTracker = this.gameManager.getStatTracker();
    if (statTracker && statTracker.isActive()) {
      statTracker.exportCurrentStats();
      this.showExportFeedback();
    }
  }

  private showExportFeedback(): void {
    const originalText = this.exportButtonText.text;
    this.exportButtonText.text = '✓ Exported!';

    setTimeout(() => {
      this.exportButtonText.text = originalText;
    }, 1500);
  }

  public update(): void {
    if (this.isCollapsed) {
      return;
    }

    const statTracker = this.gameManager.getStatTracker();
    if (!statTracker || !statTracker.isActive()) {
      return;
    }

    const stats = statTracker.getCurrentStats();

    let yOffset = 40;

    this.updateStat('Wave', `${stats.currentWave} (High: ${stats.highestWave})`, yOffset);
    yOffset += this.LINE_HEIGHT;

    this.updateStat('Money', `$${stats.currentMoney}`, yOffset);
    yOffset += this.LINE_HEIGHT;

    this.updateStat('Lives', `${stats.currentLives}`, yOffset);
    yOffset += this.LINE_HEIGHT;

    yOffset += 5;
    this.updateStat('─ Combat ─', '', yOffset, 0xffaa00);
    yOffset += this.LINE_HEIGHT;

    this.updateStat('Damage', `${stats.totalDamage.toFixed(0)}`, yOffset);
    yOffset += this.LINE_HEIGHT;

    this.updateStat('Avg DPS', `${stats.averageDPS.toFixed(1)}`, yOffset);
    yOffset += this.LINE_HEIGHT;

    this.updateStat('Peak DPS', `${stats.peakDPS.toFixed(1)}`, yOffset);
    yOffset += this.LINE_HEIGHT;

    this.updateStat('Kills', `${stats.totalKills}`, yOffset);
    yOffset += this.LINE_HEIGHT;

    this.updateStat('Accuracy', `${stats.accuracy.toFixed(1)}%`, yOffset);
    yOffset += this.LINE_HEIGHT;

    yOffset += 5;
    this.updateStat('─ Economy ─', '', yOffset, 0xffaa00);
    yOffset += this.LINE_HEIGHT;

    this.updateStat('Income', `$${stats.totalIncome}`, yOffset);
    yOffset += this.LINE_HEIGHT;

    this.updateStat('Expenses', `$${stats.totalExpenses}`, yOffset);
    yOffset += this.LINE_HEIGHT;

    this.updateStat('Net Profit', `$${stats.netProfit}`, yOffset);
    yOffset += this.LINE_HEIGHT;

    this.updateStat('Efficiency', `${stats.economyEfficiency.toFixed(0)}%`, yOffset);
    yOffset += this.LINE_HEIGHT;

    yOffset += 5;
    this.updateStat('─ Efficiency ─', '', yOffset, 0xffaa00);
    yOffset += this.LINE_HEIGHT;

    this.updateStat('Dmg/$', `${stats.damagePerDollar.toFixed(1)}`, yOffset);
    yOffset += this.LINE_HEIGHT;

    this.updateStat('Kills/$', `${stats.killsPerDollar.toFixed(2)}`, yOffset);
  }

  private updateStat(
    label: string,
    value: string,
    yOffset: number,
    color: number = 0xffffff
  ): void {
    const key = `${label}_${yOffset}`;

    if (!this.statsTexts.has(key)) {
      const text = new Text({
        text: '',
        style: {
          fontSize: 12,
          fill: color,
        },
      });
      text.position.set(this.PADDING, yOffset);
      this.contentContainer.addChild(text);
      this.statsTexts.set(key, text);
    }

    const text = this.statsTexts.get(key)!;
    text.style.fill = color;

    if (value) {
      text.text = `${label}: ${value}`;
    } else {
      text.text = label;
    }
  }

  public destroy(): void {
    this.statsTexts.clear();
    super.destroy();
  }
}
