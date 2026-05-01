import { Text } from 'pixi.js';
import { WaveManager, type ZombieGroup } from '../managers/WaveManager';
import { UIPanel } from './UIPanel';

export class WaveInfoPanel extends UIPanel {
  private waveManager: WaveManager | null = null;
  private currentWave: number = 1;
  private waveInfoTexts: Text[] = [];

  constructor() {
    super();
    this.createToggleButton('📊 Wave Info', 120, 0xffcc00);
    this.createPanelFrame(320, 600, 'Wave Information', 'Upcoming Wave Composition', 0xffcc00);
  }

  public setWaveManager(waveManager: WaveManager): void {
    this.waveManager = waveManager;
    this.updateWaveInfo();
  }

  protected override onOpen(): void {
    this.updateWaveInfo();
  }

  public updateCurrentWave(wave: number): void {
    this.currentWave = wave;
    if (this.isExpanded) {
      this.updateWaveInfo();
    }
  }

  private updateWaveInfo(): void {
    if (!this.waveManager) {
      return;
    }

    // Clear previous wave info texts
    this.waveInfoTexts.forEach(text => {
      this.contentContainer.removeChild(text);
      text.destroy();
    });
    this.waveInfoTexts = [];

    const panelLeft = 0;
    const panelTop = 0;
    let yPos = panelTop + 60;

    // Show current wave and next 3 waves
    for (let i = 0; i < 4; i++) {
      const waveNum = this.currentWave + i;
      const zombieGroups = this.getWaveZombies(waveNum);

      if (zombieGroups.length === 0) {
        continue;
      }

      // Wave header
      const waveHeader = new Text({
        text: i === 0 ? `⚡ Wave ${waveNum} (Current)` : `Wave ${waveNum}`,
        style: {
          fontFamily: 'Impact, Arial Black, sans-serif',
          fontSize: 14,
          fill: i === 0 ? 0x00ff00 : 0xffcc00,
          fontWeight: 'bold',
        },
      });
      waveHeader.position.set(panelLeft + 15, yPos);
      this.contentContainer.addChild(waveHeader);
      this.waveInfoTexts.push(waveHeader);
      yPos += 25;

      // Calculate total zombies
      let totalZombies = 0;
      zombieGroups.forEach(group => {
        const adjustedCount = this.waveManager?.calculateZombieCount(group.count, waveNum);
        totalZombies += adjustedCount;
      });

      // Total count
      const totalText = new Text({
        text: `Total: ${totalZombies} zombies`,
        style: {
          fontFamily: 'Arial',
          fontSize: 11,
          fill: 0xcccccc,
          fontStyle: 'italic',
        },
      });
      totalText.position.set(panelLeft + 25, yPos);
      this.contentContainer.addChild(totalText);
      this.waveInfoTexts.push(totalText);
      yPos += 20;

      // Zombie composition
      zombieGroups.forEach(group => {
        const adjustedCount = this.waveManager?.calculateZombieCount(group.count, waveNum);
        const percentage = ((adjustedCount / totalZombies) * 100).toFixed(0);
        const spawnRate = this.waveManager?.calculateSpawnRate(group.spawnInterval, waveNum);

        const zombieColor = this.getZombieColor(group.type);
        const zombieIcon = this.getZombieIcon(group.type);

        const zombieText = new Text({
          text: `${zombieIcon} ${group.type}: ${adjustedCount} (${percentage}%)`,
          style: {
            fontFamily: 'Courier New, monospace',
            fontSize: 11,
            fill: zombieColor,
          },
        });
        zombieText.position.set(panelLeft + 30, yPos);
        this.contentContainer.addChild(zombieText);
        this.waveInfoTexts.push(zombieText);
        yPos += 16;

        // Spawn rate info
        const rateText = new Text({
          text: `  ↳ Spawn: ${spawnRate.toFixed(1)}s interval`,
          style: {
            fontFamily: 'Arial',
            fontSize: 9,
            fill: 0x888888,
            fontStyle: 'italic',
          },
        });
        rateText.position.set(panelLeft + 30, yPos);
        this.contentContainer.addChild(rateText);
        this.waveInfoTexts.push(rateText);
        yPos += 14;
      });

      // Difficulty info
      const difficultyMod = this.waveManager?.getDifficultyModifier();
      if (i === 0 && difficultyMod !== 1.0) {
        const diffText = new Text({
          text: `Difficulty: ${(difficultyMod * 100).toFixed(0)}%`,
          style: {
            fontFamily: 'Arial',
            fontSize: 10,
            fill: difficultyMod > 1.0 ? 0xff6666 : 0x66ff66,
            fontStyle: 'italic',
          },
        });
        diffText.position.set(panelLeft + 25, yPos);
        this.contentContainer.addChild(diffText);
        this.waveInfoTexts.push(diffText);
        yPos += 18;
      }

      yPos += 10; // Space between waves
    }

    // Legend at bottom
    yPos += 10;
    const legendTitle = new Text({
      text: '🎨 Zombie Colors:',
      style: {
        fontFamily: 'Arial',
        fontSize: 12,
        fill: 0xffcc00,
        fontWeight: 'bold',
      },
    });
    legendTitle.position.set(panelLeft + 15, yPos);
    this.contentContainer.addChild(legendTitle);
    this.waveInfoTexts.push(legendTitle);
    yPos += 20;

    const legend = [
      { type: 'Basic', color: 0x00ff00 },
      { type: 'Fast', color: 0xff6600 },
      { type: 'Tank', color: 0xff0000 },
      { type: 'Armored', color: 0x888888 },
      { type: 'Swarm', color: 0xffff00 },
      { type: 'Stealth', color: 0x6600ff },
      { type: 'Mechanical', color: 0x00ffff },
    ];

    legend.forEach(item => {
      const icon = this.getZombieIcon(item.type);
      const legendText = new Text({
        text: `${icon} ${item.type}`,
        style: {
          fontFamily: 'Arial',
          fontSize: 10,
          fill: item.color,
        },
      });
      legendText.position.set(panelLeft + 25, yPos);
      this.contentContainer.addChild(legendText);
      this.waveInfoTexts.push(legendText);
      yPos += 16;
    });
  }

  private getWaveZombies(wave: number): ZombieGroup[] {
    if (!this.waveManager) {
      return [];
    }

    // Access the wave data through a temporary instance
    const tempManager = new WaveManager();
    // Get the current wave zombies by setting the wave
    for (let i = 1; i < wave; i++) {
      tempManager.nextWave();
    }
    return tempManager.getCurrentWaveZombies();
  }

  private getZombieColor(type: string): number {
    switch (type) {
      case 'Basic':
        return 0x00ff00;
      case 'Fast':
        return 0xff6600;
      case 'Tank':
        return 0xff0000;
      case 'Armored':
        return 0x888888;
      case 'Swarm':
        return 0xffff00;
      case 'Stealth':
        return 0x6600ff;
      case 'Mechanical':
        return 0x00ffff;
      default:
        return 0xffffff;
    }
  }

  private getZombieIcon(type: string): string {
    switch (type) {
      case 'Basic':
        return '🧟';
      case 'Fast':
        return '🏃';
      case 'Tank':
        return '💪';
      case 'Armored':
        return '🛡️';
      case 'Swarm':
        return '🐝';
      case 'Stealth':
        return '👻';
      case 'Mechanical':
        return '🤖';
      default:
        return '❓';
    }
  }

  public update(_deltaTime: number): void {
    // Update logic if needed
  }
}
