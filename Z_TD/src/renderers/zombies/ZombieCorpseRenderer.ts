import { Graphics } from 'pixi.js';
import { GameConfig } from '../../config/gameConfig';

interface CorpseData {
  x: number;
  y: number;
  type: string;
  rotation: number;
  createdAt: number;
  alpha: number;
}

export class ZombieCorpseRenderer {
  private corpses: CorpseData[] = [];
  private graphics: Graphics;
  private maxCorpses: number = 50; // Limit to prevent performance issues
  private corpseLifetime: number = 30000; // 30 seconds before fade
  private fadeDuration: number = 5000; // 5 seconds fade

  constructor(graphics: Graphics) {
    this.graphics = graphics;
  }

  public addCorpse(x: number, y: number, type: string): void {
    // Random rotation for variety (fallen zombies)
    const rotation = Math.random() * Math.PI * 2;

    this.corpses.push({
      x,
      y,
      type,
      rotation,
      createdAt: Date.now(),
      alpha: 1.0,
    });

    // Remove oldest corpse if we exceed max
    if (this.corpses.length > this.maxCorpses) {
      this.corpses.shift();
    }
  }

  public update(_deltaTime: number): void {
    const now = Date.now();

    // Update corpse alpha based on age
    for (let i = this.corpses.length - 1; i >= 0; i--) {
      const corpse = this.corpses[i];
      const age = now - corpse.createdAt;

      if (age > this.corpseLifetime + this.fadeDuration) {
        // Remove completely faded corpses
        this.corpses.splice(i, 1);
      } else if (age > this.corpseLifetime) {
        // Fade out
        const fadeProgress = (age - this.corpseLifetime) / this.fadeDuration;
        corpse.alpha = 1 - fadeProgress;
      }
    }
  }

  public render(): void {
    // Corpses are rendered on the main graphics object
    for (const corpse of this.corpses) {
      this.renderCorpse(corpse);
    }
  }

  private renderCorpse(corpse: CorpseData): void {
    const { x, y, type, rotation, alpha } = corpse;

    // Save current state
    this.graphics.save();

    // Apply rotation (corpse lying on ground)
    const cos = Math.cos(rotation);
    const sin = Math.sin(rotation);

    switch (type) {
      case GameConfig.ZOMBIE_TYPES.BASIC:
        this.renderBasicCorpse(x, y, cos, sin, alpha);
        break;
      case GameConfig.ZOMBIE_TYPES.FAST:
        this.renderFastCorpse(x, y, cos, sin, alpha);
        break;
      case GameConfig.ZOMBIE_TYPES.TANK:
        this.renderTankCorpse(x, y, cos, sin, alpha);
        break;
      case GameConfig.ZOMBIE_TYPES.ARMORED:
        this.renderArmoredCorpse(x, y, cos, sin, alpha);
        break;
      case GameConfig.ZOMBIE_TYPES.SWARM:
        this.renderSwarmCorpse(x, y, cos, sin, alpha);
        break;
      case GameConfig.ZOMBIE_TYPES.STEALTH:
        this.renderStealthCorpse(x, y, cos, sin, alpha);
        break;
      case GameConfig.ZOMBIE_TYPES.MECHANICAL:
        this.renderMechanicalCorpse(x, y, cos, sin, alpha);
        break;
    }

    this.graphics.restore();
  }

  private renderBasicCorpse(x: number, y: number, cos: number, sin: number, alpha: number): void {
    // Basic zombie corpse - green, humanoid shape lying down
    const bodyWidth = 8;
    const bodyHeight = 12;

    // Body (flattened, lying down)
    const points = [
      { x: -bodyWidth / 2, y: -bodyHeight / 2 },
      { x: bodyWidth / 2, y: -bodyHeight / 2 },
      { x: bodyWidth / 2, y: bodyHeight / 2 },
      { x: -bodyWidth / 2, y: bodyHeight / 2 },
    ];

    const transformed = points.map(p => ({
      x: x + p.x * cos - p.y * sin,
      y: y + p.x * sin + p.y * cos,
    }));

    this.graphics.moveTo(transformed[0].x, transformed[0].y);
    for (let i = 1; i < transformed.length; i++) {
      this.graphics.lineTo(transformed[i].x, transformed[i].y);
    }
    this.graphics.lineTo(transformed[0].x, transformed[0].y);
    this.graphics.fill({ color: 0x00aa00, alpha: alpha * 0.6 });

    // Head
    const headX = x + 0 * cos - (-bodyHeight / 2 - 3) * sin;
    const headY = y + 0 * sin + (-bodyHeight / 2 - 3) * cos;
    this.graphics.circle(headX, headY, 3);
    this.graphics.fill({ color: 0x00cc00, alpha: alpha * 0.6 });

    // Blood pool
    this.graphics.circle(x, y, 8);
    this.graphics.fill({ color: 0x8b0000, alpha: alpha * 0.3 });
  }

  private renderFastCorpse(x: number, y: number, cos: number, sin: number, alpha: number): void {
    // Fast zombie corpse - orange, streamlined
    const bodyWidth = 7;
    const bodyHeight = 11;

    // Streamlined body
    const points = [
      { x: -bodyWidth / 2, y: -bodyHeight / 2 },
      { x: bodyWidth / 2, y: -bodyHeight / 2 },
      { x: bodyWidth / 2, y: bodyHeight / 2 },
      { x: -bodyWidth / 2, y: bodyHeight / 2 },
    ];

    const transformed = points.map(p => ({
      x: x + p.x * cos - p.y * sin,
      y: y + p.x * sin + p.y * cos,
    }));

    this.graphics.moveTo(transformed[0].x, transformed[0].y);
    for (let i = 1; i < transformed.length; i++) {
      this.graphics.lineTo(transformed[i].x, transformed[i].y);
    }
    this.graphics.lineTo(transformed[0].x, transformed[0].y);
    this.graphics.fill({ color: 0xff6600, alpha: alpha * 0.6 });

    // Head (smaller)
    const headX = x + 0 * cos - (-bodyHeight / 2 - 2.5) * sin;
    const headY = y + 0 * sin + (-bodyHeight / 2 - 2.5) * cos;
    this.graphics.circle(headX, headY, 2.5);
    this.graphics.fill({ color: 0xff8800, alpha: alpha * 0.6 });

    // Blood splatter (more spread from speed)
    for (let i = 0; i < 3; i++) {
      const angle = Math.random() * Math.PI * 2;
      const dist = 5 + Math.random() * 8;
      const splatterX = x + Math.cos(angle) * dist;
      const splatterY = y + Math.sin(angle) * dist;
      this.graphics.circle(splatterX, splatterY, 2 + Math.random() * 2);
      this.graphics.fill({ color: 0x8b0000, alpha: alpha * 0.4 });
    }
  }

  private renderTankCorpse(x: number, y: number, cos: number, sin: number, alpha: number): void {
    // Tank zombie corpse - large, red, bulky
    const bodyWidth = 12;
    const bodyHeight = 18;

    // Large bulky body
    const points = [
      { x: -bodyWidth / 2, y: -bodyHeight / 2 },
      { x: bodyWidth / 2, y: -bodyHeight / 2 },
      { x: bodyWidth / 2, y: bodyHeight / 2 },
      { x: -bodyWidth / 2, y: bodyHeight / 2 },
    ];

    const transformed = points.map(p => ({
      x: x + p.x * cos - p.y * sin,
      y: y + p.x * sin + p.y * cos,
    }));

    this.graphics.moveTo(transformed[0].x, transformed[0].y);
    for (let i = 1; i < transformed.length; i++) {
      this.graphics.lineTo(transformed[i].x, transformed[i].y);
    }
    this.graphics.lineTo(transformed[0].x, transformed[0].y);
    this.graphics.fill({ color: 0xcc0000, alpha: alpha * 0.7 });

    // Large head
    const headX = x + 0 * cos - (-bodyHeight / 2 - 4) * sin;
    const headY = y + 0 * sin + (-bodyHeight / 2 - 4) * cos;
    this.graphics.circle(headX, headY, 4.5);
    this.graphics.fill({ color: 0xff0000, alpha: alpha * 0.7 });

    // Large blood pool
    this.graphics.circle(x, y, 15);
    this.graphics.fill({ color: 0x8b0000, alpha: alpha * 0.4 });
  }

  private renderArmoredCorpse(x: number, y: number, cos: number, sin: number, alpha: number): void {
    // Armored zombie corpse - gray, metallic
    const bodyWidth = 9;
    const bodyHeight = 14;

    // Armored body
    const points = [
      { x: -bodyWidth / 2, y: -bodyHeight / 2 },
      { x: bodyWidth / 2, y: -bodyHeight / 2 },
      { x: bodyWidth / 2, y: bodyHeight / 2 },
      { x: -bodyWidth / 2, y: bodyHeight / 2 },
    ];

    const transformed = points.map(p => ({
      x: x + p.x * cos - p.y * sin,
      y: y + p.x * sin + p.y * cos,
    }));

    this.graphics.moveTo(transformed[0].x, transformed[0].y);
    for (let i = 1; i < transformed.length; i++) {
      this.graphics.lineTo(transformed[i].x, transformed[i].y);
    }
    this.graphics.lineTo(transformed[0].x, transformed[0].y);
    this.graphics.fill({ color: 0x666666, alpha: alpha * 0.7 });

    // Helmet
    const headX = x + 0 * cos - (-bodyHeight / 2 - 3.5) * sin;
    const headY = y + 0 * sin + (-bodyHeight / 2 - 3.5) * cos;
    this.graphics.circle(headX, headY, 3.5);
    this.graphics.fill({ color: 0x888888, alpha: alpha * 0.7 });

    // Armor plates (scattered)
    for (let i = 0; i < 3; i++) {
      const plateX = x + (Math.random() - 0.5) * 10 * cos - (Math.random() - 0.5) * 10 * sin;
      const plateY = y + (Math.random() - 0.5) * 10 * sin + (Math.random() - 0.5) * 10 * cos;
      this.graphics.rect(plateX - 2, plateY - 1.5, 4, 3);
      this.graphics.fill({ color: 0x999999, alpha: alpha * 0.6 });
    }

    // Blood pool (less blood due to armor)
    this.graphics.circle(x, y, 6);
    this.graphics.fill({ color: 0x8b0000, alpha: alpha * 0.25 });
  }

  private renderSwarmCorpse(x: number, y: number, cos: number, sin: number, alpha: number): void {
    // Swarm zombie corpse - small, yellow
    const bodyWidth = 4;
    const bodyHeight = 6;

    // Small body
    const points = [
      { x: -bodyWidth / 2, y: -bodyHeight / 2 },
      { x: bodyWidth / 2, y: -bodyHeight / 2 },
      { x: bodyWidth / 2, y: bodyHeight / 2 },
      { x: -bodyWidth / 2, y: bodyHeight / 2 },
    ];

    const transformed = points.map(p => ({
      x: x + p.x * cos - p.y * sin,
      y: y + p.x * sin + p.y * cos,
    }));

    this.graphics.moveTo(transformed[0].x, transformed[0].y);
    for (let i = 1; i < transformed.length; i++) {
      this.graphics.lineTo(transformed[i].x, transformed[i].y);
    }
    this.graphics.lineTo(transformed[0].x, transformed[0].y);
    this.graphics.fill({ color: 0xcccc00, alpha: alpha * 0.5 });

    // Small head
    const headX = x + 0 * cos - (-bodyHeight / 2 - 1.5) * sin;
    const headY = y + 0 * sin + (-bodyHeight / 2 - 1.5) * cos;
    this.graphics.circle(headX, headY, 1.5);
    this.graphics.fill({ color: 0xffff00, alpha: alpha * 0.5 });

    // Small blood pool
    this.graphics.circle(x, y, 4);
    this.graphics.fill({ color: 0x8b0000, alpha: alpha * 0.2 });
  }

  private renderStealthCorpse(x: number, y: number, cos: number, sin: number, alpha: number): void {
    // Stealth zombie corpse - purple, semi-transparent
    const bodyWidth = 8;
    const bodyHeight = 12;

    // Semi-transparent body
    const points = [
      { x: -bodyWidth / 2, y: -bodyHeight / 2 },
      { x: bodyWidth / 2, y: -bodyHeight / 2 },
      { x: bodyWidth / 2, y: bodyHeight / 2 },
      { x: -bodyWidth / 2, y: bodyHeight / 2 },
    ];

    const transformed = points.map(p => ({
      x: x + p.x * cos - p.y * sin,
      y: y + p.x * sin + p.y * cos,
    }));

    this.graphics.moveTo(transformed[0].x, transformed[0].y);
    for (let i = 1; i < transformed.length; i++) {
      this.graphics.lineTo(transformed[i].x, transformed[i].y);
    }
    this.graphics.lineTo(transformed[0].x, transformed[0].y);
    this.graphics.fill({ color: 0x6600ff, alpha: alpha * 0.4 }); // More transparent

    // Head
    const headX = x + 0 * cos - (-bodyHeight / 2 - 3) * sin;
    const headY = y + 0 * sin + (-bodyHeight / 2 - 3) * cos;
    this.graphics.circle(headX, headY, 3);
    this.graphics.fill({ color: 0x8800ff, alpha: alpha * 0.4 });

    // Shadow wisps (fading)
    for (let i = 0; i < 3; i++) {
      const angle = (i / 3) * Math.PI * 2;
      const dist = 6;
      const wispX = x + Math.cos(angle) * dist;
      const wispY = y + Math.sin(angle) * dist;
      this.graphics.circle(wispX, wispY, 2);
      this.graphics.fill({ color: 0x6600ff, alpha: alpha * 0.2 });
    }

    // Blood pool (minimal)
    this.graphics.circle(x, y, 5);
    this.graphics.fill({ color: 0x8b0000, alpha: alpha * 0.2 });
  }

  private renderMechanicalCorpse(
    x: number,
    y: number,
    cos: number,
    sin: number,
    alpha: number
  ): void {
    // Mechanical zombie corpse - cyan, angular, with sparks
    const bodyWidth = 10;
    const bodyHeight = 15;

    // Angular mechanical body
    const points = [
      { x: -bodyWidth / 2, y: -bodyHeight / 2 },
      { x: bodyWidth / 2, y: -bodyHeight / 2 },
      { x: bodyWidth / 2, y: bodyHeight / 2 },
      { x: -bodyWidth / 2, y: bodyHeight / 2 },
    ];

    const transformed = points.map(p => ({
      x: x + p.x * cos - p.y * sin,
      y: y + p.x * sin + p.y * cos,
    }));

    this.graphics.moveTo(transformed[0].x, transformed[0].y);
    for (let i = 1; i < transformed.length; i++) {
      this.graphics.lineTo(transformed[i].x, transformed[i].y);
    }
    this.graphics.lineTo(transformed[0].x, transformed[0].y);
    this.graphics.fill({ color: 0x006666, alpha: alpha * 0.7 });

    // Mechanical head
    const headX = x + 0 * cos - (-bodyHeight / 2 - 3.5) * sin;
    const headY = y + 0 * sin + (-bodyHeight / 2 - 3.5) * cos;
    this.graphics.rect(headX - 3, headY - 3, 6, 6);
    this.graphics.fill({ color: 0x00ffff, alpha: alpha * 0.6 });

    // Broken parts (gears, wires)
    for (let i = 0; i < 4; i++) {
      const partX = x + (Math.random() - 0.5) * 12 * cos - (Math.random() - 0.5) * 12 * sin;
      const partY = y + (Math.random() - 0.5) * 12 * sin + (Math.random() - 0.5) * 12 * cos;
      this.graphics.circle(partX, partY, 1.5);
      this.graphics.fill({ color: 0x00aaaa, alpha: alpha * 0.5 });
    }

    // Oil leak (instead of blood)
    this.graphics.circle(x, y, 10);
    this.graphics.fill({ color: 0x1a1a1a, alpha: alpha * 0.4 });

    // Sparks (small yellow dots)
    for (let i = 0; i < 3; i++) {
      const angle = Math.random() * Math.PI * 2;
      const dist = 8 + Math.random() * 5;
      const sparkX = x + Math.cos(angle) * dist;
      const sparkY = y + Math.sin(angle) * dist;
      this.graphics.circle(sparkX, sparkY, 1);
      this.graphics.fill({ color: 0xffff00, alpha: alpha * 0.6 });
    }
  }

  public clear(): void {
    this.corpses = [];
  }

  public getCorpseCount(): number {
    return this.corpses.length;
  }
}
