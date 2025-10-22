import { UIComponent } from './UIComponent';
import { Container, Graphics, Text } from 'pixi.js';
import { GameConfig } from '../config/gameConfig';

interface ZombieInfo {
  type: string;
  name: string;
  color: number;
  health: number;
  speed: number;
  reward: number;
  damage: number;
  description: string;
  characteristics: string[];
}

export class ZombieBestiary extends UIComponent {
  private background!: Graphics;
  private isOpen: boolean = false;
  private toggleButton!: Container;
  private contentContainer!: Container;
  private zombieCards: Container[] = [];
  private onSpawnZombie?: (type: string) => void;

  private zombieData: ZombieInfo[] = [
    {
      type: GameConfig.ZOMBIE_TYPES.BASIC,
      name: 'Basic Zombie',
      color: 0x00ff00,
      health: 100,
      speed: 50,
      reward: 10,
      damage: 1,
      description: 'Standard shambling undead. Your typical zombie.',
      characteristics: ['Balanced stats', 'Most common', 'Easy to kill'],
    },
    {
      type: GameConfig.ZOMBIE_TYPES.FAST,
      name: 'Fast Zombie',
      color: 0xff6600,
      health: 80,
      speed: 100,
      reward: 15,
      damage: 1,
      description: 'Quick runner. Hard to hit with slow towers.',
      characteristics: ['2x speed', 'Lower health', 'Agile threat'],
    },
    {
      type: GameConfig.ZOMBIE_TYPES.TANK,
      name: 'Tank Zombie',
      color: 0xff0000,
      health: 300,
      speed: 25,
      reward: 50,
      damage: 5,
      description: 'Massive brute. Extremely dangerous if it reaches camp.',
      characteristics: ['3x health', 'Very slow', '5 survivors killed!'],
    },
    {
      type: GameConfig.ZOMBIE_TYPES.ARMORED,
      name: 'Armored Zombie',
      color: 0x888888,
      health: 150,
      speed: 40,
      reward: 30,
      damage: 3,
      description: 'Military zombie with protective gear.',
      characteristics: ['Heavy armor', 'Moderate speed', '3 survivors killed'],
    },
    {
      type: GameConfig.ZOMBIE_TYPES.SWARM,
      name: 'Swarm Zombie',
      color: 0xffff00,
      health: 30,
      speed: 60,
      reward: 5,
      damage: 1,
      description: 'Small and weak, but appears in large numbers.',
      characteristics: ['Very low HP', 'Fast', 'Overwhelming numbers'],
    },
    {
      type: GameConfig.ZOMBIE_TYPES.STEALTH,
      name: 'Stealth Zombie',
      color: 0x6600ff,
      health: 70,
      speed: 70,
      reward: 25,
      damage: 2,
      description: 'Semi-transparent and sneaky. Hard to spot.',
      characteristics: ['Fast movement', 'Low visibility', '2 survivors killed'],
    },
    {
      type: GameConfig.ZOMBIE_TYPES.MECHANICAL,
      name: 'Mechanical Zombie',
      color: 0x00ffff,
      health: 120,
      speed: 55,
      reward: 40,
      damage: 4,
      description: 'Cyborg zombie. High-tech threat.',
      characteristics: ['Robotic parts', 'Consistent pattern', '4 survivors killed'],
    },
  ];

  constructor() {
    super();
    this.createBestiary();
  }

  private createBestiary(): void {
    // Toggle button
    this.toggleButton = new Container();
    this.toggleButton.eventMode = 'static';
    this.toggleButton.cursor = 'pointer';

    const buttonBg = new Graphics();
    buttonBg.roundRect(0, 0, 140, 35, 5).fill({ color: 0x1a1a1a, alpha: 0.9 });
    buttonBg.stroke({ width: 2, color: 0xff0000 });
    this.toggleButton.addChild(buttonBg);

    const buttonText = new Text({
      text: '📖 Bestiary',
      style: {
        fontFamily: 'Arial',
        fontSize: 16,
        fill: 0xff0000,
        fontWeight: 'bold',
      },
    });
    buttonText.anchor.set(0.5);
    buttonText.position.set(70, 17.5);
    this.toggleButton.addChild(buttonText);

    this.toggleButton.on('pointerdown', () => {
      this.toggle();
    });

    this.addChild(this.toggleButton);

    // Main content container - will be added to stage separately
    this.contentContainer = new Container();
    this.contentContainer.visible = false;
    this.createContent();
  }

  // Get the content container to add it to the stage separately
  public getContentContainer(): Container {
    return this.contentContainer;
  }

  private createContent(): void {
    // Position at absolute screen coordinates (top-left)
    this.contentContainer.position.set(20, 20);

    // Background panel - simple positioning from (0,0)
    const panelWidth = 870;
    const panelHeight = 620;
    const panelLeft = 0;
    const panelTop = 0;

    this.background = new Graphics();
    this.background
      .roundRect(panelLeft, panelTop, panelWidth, panelHeight, 10)
      .fill({ color: 0x1a1a1a, alpha: 0.98 });
    this.background.stroke({ width: 3, color: 0xff0000 });
    this.contentContainer.addChild(this.background);

    // Title
    const title = new Text({
      text: '🧟 ZOMBIE BESTIARY 🧟',
      style: {
        fontFamily: 'Arial',
        fontSize: 26,
        fill: 0xff0000,
        fontWeight: 'bold',
      },
    });
    title.anchor.set(0.5, 0);
    title.position.set(panelLeft + panelWidth / 2, panelTop + 15);
    this.contentContainer.addChild(title);

    // Subtitle
    const subtitle = new Text({
      text: 'Know Your Enemy - All Zombie Types',
      style: {
        fontFamily: 'Arial',
        fontSize: 13,
        fill: 0xcccccc,
        fontStyle: 'italic',
      },
    });
    subtitle.anchor.set(0.5, 0);
    subtitle.position.set(panelLeft + panelWidth / 2, panelTop + 47);
    this.contentContainer.addChild(subtitle);

    // Create zombie cards
    let xPos = panelLeft + 20;
    let yPos = panelTop + 80;
    const cardWidth = 270;
    const cardHeight = 235;
    const spacing = 15;

    this.zombieData.forEach((zombie, index) => {
      const card = this.createZombieCard(zombie, cardWidth, cardHeight);
      card.position.set(xPos, yPos);
      this.contentContainer.addChild(card);
      this.zombieCards.push(card);

      // Layout: 3 columns
      xPos += cardWidth + spacing;
      if ((index + 1) % 3 === 0) {
        xPos = panelLeft + 20;
        yPos += cardHeight + spacing;
      }
    });

    // Close button
    const closeButton = new Container();
    closeButton.eventMode = 'static';
    closeButton.cursor = 'pointer';

    const closeBg = new Graphics();
    closeBg.circle(0, 0, 20).fill({ color: 0xff0000, alpha: 0.9 });
    closeBg.stroke({ width: 2, color: 0xffffff });
    closeButton.addChild(closeBg);

    const closeText = new Text({
      text: '✕',
      style: {
        fontFamily: 'Arial',
        fontSize: 20,
        fill: 0xffffff,
        fontWeight: 'bold',
      },
    });
    closeText.anchor.set(0.5);
    closeButton.addChild(closeText);

    closeButton.position.set(panelLeft + panelWidth - 30, panelTop + 20);
    closeButton.on('pointerdown', () => {
      this.close();
    });
    this.contentContainer.addChild(closeButton);
  }

  private createZombieCard(zombie: ZombieInfo, width: number, height: number): Container {
    const card = new Container();
    const padding = 10;

    // Card background
    const bg = new Graphics();
    bg.roundRect(0, 0, width, height, 8).fill({ color: 0x2a2a2a, alpha: 0.95 });
    bg.stroke({ width: 2, color: zombie.color });
    card.addChild(bg);

    // Zombie name
    const nameText = new Text({
      text: zombie.name,
      style: {
        fontFamily: 'Arial',
        fontSize: 15,
        fill: zombie.color,
        fontWeight: 'bold',
      },
    });
    nameText.position.set(padding, 8);
    card.addChild(nameText);

    // Visual representation (simplified zombie model)
    const visual = this.createZombieVisual(zombie.type, zombie.color);
    visual.position.set(width / 2, 55);
    card.addChild(visual);

    // Stats section
    let statY = 105;
    const stats = [
      `❤️ HP: ${zombie.health}`,
      `⚡ Speed: ${zombie.speed}`,
      `💰 $${zombie.reward}`,
      `💀 ${zombie.damage} survivor${zombie.damage > 1 ? 's' : ''}`,
    ];

    stats.forEach(stat => {
      const statText = new Text({
        text: stat,
        style: {
          fontFamily: 'Arial',
          fontSize: 10,
          fill: 0xffffff,
        },
      });
      statText.position.set(padding, statY);
      card.addChild(statText);
      statY += 16;
    });

    // Description
    const descText = new Text({
      text: zombie.description,
      style: {
        fontFamily: 'Arial',
        fontSize: 9,
        fill: 0xcccccc,
        wordWrap: true,
        wordWrapWidth: width - padding * 2,
        breakWords: true,
      },
    });
    descText.position.set(padding, statY + 3);
    card.addChild(descText);

    // Characteristics
    const charY = statY + 28;
    zombie.characteristics.forEach((char, index) => {
      const charText = new Text({
        text: `• ${char}`,
        style: {
          fontFamily: 'Arial',
          fontSize: 8,
          fill: 0xaaaaaa,
          wordWrap: true,
          wordWrapWidth: width - padding * 2,
        },
      });
      charText.position.set(padding, charY + index * 13);
      card.addChild(charText);
    });

    // Spawn button (for debugging)
    const spawnButton = new Container();
    spawnButton.eventMode = 'static';
    spawnButton.cursor = 'pointer';

    const spawnBg = new Graphics();
    spawnBg.roundRect(0, 0, width - padding * 2, 25, 5).fill({ color: zombie.color, alpha: 0.8 });
    spawnBg.stroke({ width: 1, color: 0xffffff });
    spawnButton.addChild(spawnBg);

    const spawnText = new Text({
      text: '🧟 Spawn Test',
      style: {
        fontFamily: 'Arial',
        fontSize: 11,
        fill: 0xffffff,
        fontWeight: 'bold',
      },
    });
    spawnText.anchor.set(0.5);
    spawnText.position.set((width - padding * 2) / 2, 12.5);
    spawnButton.addChild(spawnText);

    spawnButton.position.set(padding, height - 30);
    spawnButton.on('pointerdown', () => {
      if (this.onSpawnZombie) {
        this.onSpawnZombie(zombie.type);
      }
    });
    card.addChild(spawnButton);

    return card;
  }

  // Set callback for spawning zombies
  public setSpawnCallback(callback: (type: string) => void): void {
    this.onSpawnZombie = callback;
  }

  private createZombieVisual(type: string, _color: number): Graphics {
    const visual = new Graphics();

    // Use actual zombie visuals from the game
    switch (type) {
      case GameConfig.ZOMBIE_TYPES.BASIC:
        this.createBasicZombieVisual(visual);
        break;
      case GameConfig.ZOMBIE_TYPES.FAST:
        this.createFastZombieVisual(visual);
        break;
      case GameConfig.ZOMBIE_TYPES.TANK:
        this.createTankZombieVisual(visual);
        break;
      case GameConfig.ZOMBIE_TYPES.ARMORED:
        this.createArmoredZombieVisual(visual);
        break;
      case GameConfig.ZOMBIE_TYPES.SWARM:
        this.createSwarmZombieVisual(visual);
        break;
      case GameConfig.ZOMBIE_TYPES.STEALTH:
        this.createStealthZombieVisual(visual);
        break;
      case GameConfig.ZOMBIE_TYPES.MECHANICAL:
        this.createMechanicalZombieVisual(visual);
        break;
      default:
        visual.circle(0, 0, 15).fill(0x6b8e23);
        visual.stroke({ width: 2, color: 0x000000 });
    }

    // Scale up for better visibility in bestiary
    visual.scale.set(1.5);

    return visual;
  }

  // Basic Zombie Visual - Rotting flesh appearance
  private createBasicZombieVisual(visual: Graphics): void {
    visual.circle(0, 0, 10).fill(0x5a6a4a);
    visual.circle(0, 0, 10).stroke({ width: 1.5, color: 0x3a4a2a });
    visual.circle(-4, -2, 3.5).fill({ color: 0x3a4a2a, alpha: 0.8 });
    visual.circle(4, 2, 2.5).fill({ color: 0x2a3a1a, alpha: 0.7 });
    visual.circle(-2, 4, 2).fill({ color: 0x4a3a2a, alpha: 0.6 });
    visual.circle(5, -3, 1.5).fill(0xe5e5cc);
    visual.circle(-5, 3, 1.2).fill(0xe5e5cc);
    visual.circle(-3, -3, 2).fill(0x8b0000);
    visual.circle(-3, -3, 1.2).fill(0xff4444);
    visual.circle(3, -3, 2).fill(0x8b0000);
    visual.circle(3, -3, 1.2).fill(0xff4444);
    visual.rect(-4, 3, 8, 3).fill(0x1a1a1a);
    for (let i = 0; i < 4; i++) {
      visual.rect(-3 + i * 2, 3, 1, 1.5).fill(0xe5e5cc);
    }
    visual.circle(-6, 0, 1.5).fill({ color: 0x8b0000, alpha: 0.7 });
    visual.circle(2, 5, 1).fill({ color: 0x8b0000, alpha: 0.6 });
  }

  // Fast Zombie Visual - Leaner, more aggressive
  private createFastZombieVisual(visual: Graphics): void {
    visual.ellipse(0, 0, 7, 13).fill(0x6a7a3a);
    visual.ellipse(0, 0, 7, 13).stroke({ width: 1.5, color: 0x4a5a2a });
    visual.circle(-3, -5, 2.5).fill({ color: 0x8b2a2a, alpha: 0.8 });
    visual.circle(4, 3, 2).fill({ color: 0x7a1a1a, alpha: 0.7 });
    visual.circle(-2, 5, 1.5).fill({ color: 0x6a1a1a, alpha: 0.6 });
    for (let i = 0; i < 3; i++) {
      visual
        .moveTo(-4, -2 + i * 3)
        .lineTo(4, -2 + i * 3)
        .stroke({ width: 1, color: 0xe5e5cc, alpha: 0.6 });
    }
    visual.circle(-2, -6, 2.5).fill(0xff0000);
    visual.circle(-2, -6, 1.5).fill(0xff6666);
    visual.circle(2, -6, 2.5).fill(0xff0000);
    visual.circle(2, -6, 1.5).fill(0xff6666);
    visual.rect(-4, 5, 8, 3).fill(0x1a1a1a);
    visual.moveTo(-3, 5).lineTo(-2, 8).lineTo(-1, 5).fill(0xe5e5cc);
    visual.moveTo(1, 5).lineTo(2, 8).lineTo(3, 5).fill(0xe5e5cc);
    visual.circle(0, 9, 1).fill({ color: 0x8b0000, alpha: 0.8 });
    visual.circle(-2, 10, 0.8).fill({ color: 0x8b0000, alpha: 0.7 });
  }

  // Tank Zombie Visual - Massive and bloated
  private createTankZombieVisual(visual: Graphics): void {
    visual.roundRect(-15, -15, 30, 30, 6).fill(0x4a5a2a);
    visual.roundRect(-15, -15, 30, 30, 6).stroke({ width: 2.5, color: 0x2a3a1a });
    visual.circle(-6, -6, 7).fill({ color: 0x6a7a3a, alpha: 0.8 });
    visual.circle(7, 5, 6).fill({ color: 0x5a6a2a, alpha: 0.7 });
    visual.circle(-4, 8, 5).fill({ color: 0x7a8a4a, alpha: 0.6 });
    visual.circle(-8, -2, 3).fill({ color: 0xaaaa44, alpha: 0.7 });
    visual.circle(9, -4, 2.5).fill({ color: 0x999933, alpha: 0.7 });
    visual.circle(2, 10, 2).fill({ color: 0x888822, alpha: 0.6 });
    visual.circle(-7, -10, 2.5).fill(0x4a0000);
    visual.circle(-7, -10, 1.5).fill(0xff0000);
    visual.circle(7, -10, 2.5).fill(0x4a0000);
    visual.circle(7, -10, 1.5).fill(0xff0000);
    for (let i = 0; i < 4; i++) {
      visual
        .moveTo(-12, -8 + i * 6)
        .lineTo(12, -8 + i * 6)
        .stroke({ width: 2, color: 0x1a1a1a });
      for (let j = 0; j < 5; j++) {
        visual.circle(-10 + j * 5, -8 + i * 6, 1).fill(0x1a1a1a);
      }
    }
    visual.circle(10, 0, 2).fill(0xe5e5cc);
    visual.circle(-10, 4, 1.8).fill(0xe5e5cc);
    visual.circle(-9, 10, 2).fill({ color: 0x8b0000, alpha: 0.8 });
    visual.circle(8, -8, 1.5).fill({ color: 0x8b0000, alpha: 0.7 });
  }

  // Armored Zombie Visual - Plated and protected
  private createArmoredZombieVisual(visual: Graphics): void {
    visual.circle(0, 0, 11).fill(0x5a6a4a);
    visual.circle(0, 0, 11).stroke({ width: 1, color: 0x3a4a2a });
    visual.rect(-10, -7, 20, 5).fill(0x5a5a5a);
    visual.rect(-10, -7, 20, 5).stroke({ width: 1.5, color: 0x3a3a3a });
    visual.rect(-10, 3, 20, 5).fill(0x5a5a5a);
    visual.rect(-10, 3, 20, 5).stroke({ width: 1.5, color: 0x3a3a3a });
    visual.circle(-7, -5, 1.5).fill({ color: 0x8b4513, alpha: 0.8 });
    visual.circle(6, -4, 1.2).fill({ color: 0x8b4513, alpha: 0.7 });
    visual.circle(-5, 5, 1.3).fill({ color: 0x8b4513, alpha: 0.8 });
    visual.circle(7, 6, 1).fill({ color: 0x8b4513, alpha: 0.7 });
    visual.moveTo(-8, -5).lineTo(-4, -3).stroke({ width: 1.5, color: 0x2a2a2a });
    visual.moveTo(5, 5).lineTo(8, 7).stroke({ width: 1.5, color: 0x2a2a2a });
    visual.rect(-9, -13, 18, 7).fill(0x6a6a6a);
    visual.rect(-9, -13, 18, 7).stroke({ width: 2, color: 0x4a4a4a });
    visual.circle(-6, -10, 1.5).fill(0x3a3a3a);
    visual.circle(5, -11, 1.2).fill(0x3a3a3a);
    visual.rect(-7, -10, 5, 2.5).fill(0x8b0000);
    visual.rect(-7, -10, 3, 1.5).fill(0xff0000);
    visual.rect(2, -10, 5, 2.5).fill(0x8b0000);
    visual.rect(2, -10, 3, 1.5).fill(0xff0000);
    visual.circle(-8, -5, 1).fill(0x4a4a4a);
    visual.circle(8, -5, 1).fill(0x4a4a4a);
    visual.circle(-8, 5, 1).fill(0x4a4a4a);
    visual.circle(8, 5, 1).fill(0x4a4a4a);
    visual.circle(-3, 0, 2).fill({ color: 0x8b0000, alpha: 0.6 });
    visual.circle(4, -2, 1.5).fill({ color: 0x8b0000, alpha: 0.5 });
  }

  // Swarm Zombie Visual - Small and numerous
  private createSwarmZombieVisual(visual: Graphics): void {
    visual.circle(0, 0, 6).fill(0x7a8a5a);
    visual.circle(0, 0, 6).stroke({ width: 1, color: 0x5a6a3a });
    visual.circle(-2, -1, 2.5).fill({ color: 0x5a6a3a, alpha: 0.8 });
    visual.circle(2, 2, 2).fill({ color: 0x4a5a2a, alpha: 0.7 });
    visual.circle(-1, 3, 1.5).fill({ color: 0x3a4a1a, alpha: 0.6 });
    visual.circle(3, -2, 1).fill(0xe5e5cc);
    visual.circle(-3, 2, 0.8).fill(0xe5e5cc);
    visual.circle(-2, -2, 1.5).fill(0x8b0000);
    visual.circle(-2, -2, 1).fill(0xff3333);
    visual.circle(2, -2, 1.5).fill(0x8b0000);
    visual.circle(2, -2, 1).fill(0xff3333);
    visual.rect(-2, 2, 4, 1.5).fill(0x1a1a1a);
    visual.rect(-1, 2, 0.5, 1).fill(0xe5e5cc);
    visual.rect(0.5, 2, 0.5, 1).fill(0xe5e5cc);
    visual.circle(-3, 0, 0.8).fill({ color: 0x8b0000, alpha: 0.7 });
    visual.circle(1, 4, 0.6).fill({ color: 0x8b0000, alpha: 0.6 });
  }

  // Stealth Zombie Visual - Shadowy and translucent
  private createStealthZombieVisual(visual: Graphics): void {
    visual.circle(0, 0, 12).fill({ color: 0x4a5a6a, alpha: 0.3 });
    visual.circle(0, 0, 10).fill({ color: 0x3a4a5a, alpha: 0.5 });
    visual.circle(0, 0, 10).stroke({ width: 1, color: 0x2a3a4a, alpha: 0.6 });
    visual.circle(0, 0, 6).fill({ color: 0x2a3a4a, alpha: 0.7 });
    for (let i = 0; i < 6; i++) {
      const angle = (i / 6) * Math.PI * 2;
      const x = Math.cos(angle) * 10;
      const y = Math.sin(angle) * 10;
      visual.moveTo(0, 0).lineTo(x, y).stroke({ width: 1.5, color: 0x3a4a5a, alpha: 0.4 });
    }
    visual.circle(-3, -3, 2.5).fill({ color: 0x00aa00, alpha: 0.9 });
    visual.circle(-3, -3, 1.5).fill({ color: 0x00ff00, alpha: 0.9 });
    visual.circle(3, -3, 2.5).fill({ color: 0x00aa00, alpha: 0.9 });
    visual.circle(3, -3, 1.5).fill({ color: 0x00ff00, alpha: 0.9 });
    visual.circle(-3, -3, 3.5).fill({ color: 0x00ff00, alpha: 0.2 });
    visual.circle(3, -3, 3.5).fill({ color: 0x00ff00, alpha: 0.2 });
    visual.circle(0, 0, 3).fill({ color: 0xe5e5cc, alpha: 0.3 });
    visual.circle(-2, 2, 1.5).fill({ color: 0xe5e5cc, alpha: 0.25 });
    visual.circle(2, 2, 1.5).fill({ color: 0xe5e5cc, alpha: 0.25 });
  }

  // Mechanical Zombie Visual - Robotic and industrial
  private createMechanicalZombieVisual(visual: Graphics): void {
    visual.circle(0, 0, 12).fill(0x6a7a8a);
    visual.circle(0, 0, 12).stroke({ width: 2, color: 0x4a5a6a });
    for (let i = 0; i < 8; i++) {
      const angle = (i * Math.PI) / 4;
      const x1 = Math.cos(angle) * 12;
      const y1 = Math.sin(angle) * 12;
      const x2 = Math.cos(angle) * 15;
      const y2 = Math.sin(angle) * 15;
      visual.moveTo(x1, y1).lineTo(x2, y2).stroke({ width: 2.5, color: 0x3a4a5a });
    }
    visual.circle(-7, -5, 2).fill({ color: 0x8b4513, alpha: 0.7 });
    visual.circle(8, 3, 1.8).fill({ color: 0x8b4513, alpha: 0.6 });
    visual.circle(-4, 7, 1.5).fill({ color: 0x8b4513, alpha: 0.7 });
    visual.circle(0, 0, 7).fill(0x4a5a6a);
    visual.circle(0, 0, 5).fill(0x3a4a5a);
    visual.circle(0, 0, 3).fill({ color: 0xff6600, alpha: 0.6 });
    visual.circle(-4, -5, 3).fill(0xaa8800);
    visual.circle(-4, -5, 2).fill(0xffcc00);
    visual.circle(-4, -5, 1).fill(0xffff00);
    visual.circle(4, -5, 3).fill(0xaa8800);
    visual.circle(4, -5, 2).fill(0xffcc00);
    visual.circle(4, -5, 1).fill(0xffff00);
    visual.circle(-4, -5, 4).fill({ color: 0xffff00, alpha: 0.3 });
    visual.circle(4, -5, 4).fill({ color: 0xffff00, alpha: 0.3 });
    visual.circle(-7, 0, 2).fill(0x3a3a3a);
    visual.circle(-7, 0, 1).fill(0x5a5a5a);
    visual.circle(7, 0, 2).fill(0x3a3a3a);
    visual.circle(7, 0, 1).fill(0x5a5a5a);
    visual.circle(0, 8, 2).fill(0x3a3a3a);
    visual.circle(0, 8, 1).fill(0x5a5a5a);
    visual
      .moveTo(-8, -8)
      .lineTo(-6, -4)
      .lineTo(-7, 0)
      .stroke({ width: 1.5, color: 0xff6600, alpha: 0.8 });
    visual
      .moveTo(8, -6)
      .lineTo(6, -2)
      .lineTo(7, 2)
      .stroke({ width: 1.5, color: 0xff6600, alpha: 0.8 });
    for (let i = 0; i < 3; i++) {
      const angle = Math.random() * Math.PI * 2;
      const dist = 10 + Math.random() * 3;
      visual
        .circle(Math.cos(angle) * dist, Math.sin(angle) * dist, 0.8)
        .fill({ color: 0xffff00, alpha: 0.9 });
    }
    visual.circle(-5, 5, 2).fill({ color: 0x1a1a1a, alpha: 0.7 });
    visual.circle(6, -3, 1.5).fill({ color: 0x1a1a1a, alpha: 0.6 });
  }

  public toggle(): void {
    this.isOpen = !this.isOpen;
    this.contentContainer.visible = this.isOpen;
  }

  public open(): void {
    this.isOpen = true;
    this.contentContainer.visible = true;
  }

  public close(): void {
    this.isOpen = false;
    this.contentContainer.visible = false;
  }

  public update(_deltaTime: number): void {
    // Update logic if needed
  }
}
