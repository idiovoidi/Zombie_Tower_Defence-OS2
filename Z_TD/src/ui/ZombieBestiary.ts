import { UIComponent } from './UIComponent';
import { Container, Graphics, Text } from 'pixi.js';
import { GameConfig } from '../config/gameConfig';
import {
  ArmoredZombieRenderer,
  BasicZombieRenderer,
  FastZombieRenderer,
  MechanicalZombieRenderer,
  StealthZombieRenderer,
  SwarmZombieRenderer,
  TankZombieRenderer,
} from '../renderers/zombies';

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
      color: 0x2d5016, // Dark green
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
      color: 0x8b4513, // Dark orange
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
      color: 0x5a1a1a, // Dark red
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
      color: 0x4a4a4a, // Dark gray
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
      color: 0x6a7a2a, // Yellow-green
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
      color: 0x3a2a4a, // Dark purple
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
      color: 0x3a4a5a, // Cyan-gray
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

  private createZombieVisual(type: string, _color: number): Container {
    const container = new Container();

    // Use new renderer system for accurate visuals
    let renderer;
    switch (type) {
      case GameConfig.ZOMBIE_TYPES.BASIC: {
        renderer = new BasicZombieRenderer();
        break;
      }
      case GameConfig.ZOMBIE_TYPES.FAST: {
        renderer = new FastZombieRenderer();
        break;
      }
      case GameConfig.ZOMBIE_TYPES.TANK: {
        renderer = new TankZombieRenderer();
        break;
      }
      case GameConfig.ZOMBIE_TYPES.ARMORED: {
        renderer = new ArmoredZombieRenderer();
        break;
      }
      case GameConfig.ZOMBIE_TYPES.SWARM: {
        renderer = new SwarmZombieRenderer();
        break;
      }
      case GameConfig.ZOMBIE_TYPES.STEALTH: {
        renderer = new StealthZombieRenderer();
        break;
      }
      case GameConfig.ZOMBIE_TYPES.MECHANICAL: {
        renderer = new MechanicalZombieRenderer();
        break;
      }
      default: {
        const fallback = new Graphics();
        fallback.circle(0, 0, 15).fill(0x6b8e23);
        fallback.stroke({ width: 2, color: 0x000000 });
        container.addChild(fallback);
        container.scale.set(1.5);
        return container;
      }
    }

    // Render the zombie using the new renderer
    const state = {
      position: { x: 0, y: 0 },
      health: 100,
      maxHealth: 100,
      speed: 50,
      direction: { x: 0, y: 1 },
      isMoving: false,
      isDamaged: false,
      statusEffects: [],
    };

    renderer.render(container, state);

    // Scale up for better visibility in bestiary
    container.scale.set(1.5);

    return container;
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
