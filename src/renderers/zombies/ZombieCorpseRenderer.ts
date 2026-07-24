import type { Graphics } from 'pixi.js';
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
  private maxCorpses = 50; // Limit to prevent performance issues
  private corpseLifetime = 30000; // 30 seconds before fade
  private fadeDuration = 5000; // 5 seconds fade

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
    this.graphics.save();
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
      case GameConfig.ZOMBIE_TYPES.BOSS:
        this.renderBossCorpse(x, y, cos, sin, alpha);
        break;
    }

    this.graphics.restore();
  }

  /** Draw a rotated rectangular body and circular head, then fill with the given colors/alpha. */
  private drawRotatedRect(
    x: number,
    y: number,
    cos: number,
    sin: number,
    width: number,
    height: number
  ): number {
    const hw = width / 2;
    const hh = height / 2;
    const corners = [
      { x: -hw, y: -hh },
      { x: hw, y: -hh },
      { x: hw, y: hh },
      { x: -hw, y: hh },
    ];
    const transformedCorners = corners.map(point => ({
      x: x + point.x * cos - point.y * sin,
      y: y + point.x * sin + point.y * cos,
    }));
    this.graphics.moveTo(transformedCorners[0].x, transformedCorners[0].y);
    for (let i = 1; i < transformedCorners.length; i++) {
      this.graphics.lineTo(transformedCorners[i].x, transformedCorners[i].y);
    }
    this.graphics.lineTo(transformedCorners[0].x, transformedCorners[0].y);
    return hh;
  }

  private drawCorpseBody(
    x: number,
    y: number,
    cos: number,
    sin: number,
    alpha: number,
    bodyWidth: number,
    bodyHeight: number,
    bodyColor: number,
    bodyAlpha: number,
    headRadius: number,
    headColor: number,
    headAlpha: number,
    headOffset: number
  ): void {
    const hh = this.drawRotatedRect(x, y, cos, sin, bodyWidth, bodyHeight);
    this.graphics.fill({ color: bodyColor, alpha: alpha * bodyAlpha });

    const headX = x + 0 * cos - (-hh - headOffset) * sin;
    const headY = y + 0 * sin + (-hh - headOffset) * cos;
    this.graphics.circle(headX, headY, headRadius);
    this.graphics.fill({ color: headColor, alpha: alpha * headAlpha });
  }

  private renderBasicCorpse(x: number, y: number, cos: number, sin: number, alpha: number): void {
    this.drawCorpseBody(x, y, cos, sin, alpha, 8, 12, 0x00aa00, 0.6, 3, 0x00cc00, 0.6, 3);
    this.graphics.circle(x, y, 8);
    this.graphics.fill({ color: 0x8b0000, alpha: alpha * 0.3 });
  }

  private renderFastCorpse(x: number, y: number, cos: number, sin: number, alpha: number): void {
    this.drawCorpseBody(x, y, cos, sin, alpha, 7, 11, 0xff6600, 0.6, 2.5, 0xff8800, 0.6, 2.5);
    for (let i = 0; i < 3; i++) {
      const angle = Math.random() * Math.PI * 2;
      const dist = 5 + Math.random() * 8;
      const r = 2 + Math.random() * 2;
      this.graphics.circle(x + Math.cos(angle) * dist, y + Math.sin(angle) * dist, r);
      this.graphics.fill({ color: 0x8b0000, alpha: alpha * 0.4 });
    }
  }

  private renderTankCorpse(x: number, y: number, cos: number, sin: number, alpha: number): void {
    this.drawCorpseBody(x, y, cos, sin, alpha, 12, 18, 0xcc0000, 0.7, 4.5, 0xff0000, 0.7, 4);
    this.graphics.circle(x, y, 15);
    this.graphics.fill({ color: 0x8b0000, alpha: alpha * 0.4 });
  }

  private renderArmoredCorpse(x: number, y: number, cos: number, sin: number, alpha: number): void {
    this.drawCorpseBody(x, y, cos, sin, alpha, 9, 14, 0x666666, 0.7, 3.5, 0x888888, 0.7, 3.5);
    for (let i = 0; i < 3; i++) {
      const plateX = x + (Math.random() - 0.5) * 10 * cos - (Math.random() - 0.5) * 10 * sin;
      const plateY = y + (Math.random() - 0.5) * 10 * sin + (Math.random() - 0.5) * 10 * cos;
      this.graphics.rect(plateX - 2, plateY - 1.5, 4, 3);
      this.graphics.fill({ color: 0x999999, alpha: alpha * 0.6 });
    }
    this.graphics.circle(x, y, 6);
    this.graphics.fill({ color: 0x8b0000, alpha: alpha * 0.25 });
  }

  private renderSwarmCorpse(x: number, y: number, cos: number, sin: number, alpha: number): void {
    this.drawCorpseBody(x, y, cos, sin, alpha, 4, 6, 0xcccc00, 0.5, 1.5, 0xffff00, 0.5, 1.5);
    this.graphics.circle(x, y, 4);
    this.graphics.fill({ color: 0x8b0000, alpha: alpha * 0.2 });
  }

  private renderStealthCorpse(x: number, y: number, cos: number, sin: number, alpha: number): void {
    this.drawCorpseBody(x, y, cos, sin, alpha, 8, 12, 0x6600ff, 0.4, 3, 0x8800ff, 0.4, 3);
    for (let i = 0; i < 3; i++) {
      const angle = (i / 3) * Math.PI * 2;
      this.graphics.circle(x + Math.cos(angle) * 6, y + Math.sin(angle) * 6, 2);
      this.graphics.fill({ color: 0x6600ff, alpha: alpha * 0.2 });
    }
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
    // Body + square head (mechanical, so we draw head manually after body)
    const bodyWidth = 10;
    const bodyHeight = 15;
    const hh = this.drawRotatedRect(x, y, cos, sin, bodyWidth, bodyHeight);
    this.graphics.fill({ color: 0x006666, alpha: alpha * 0.7 });

    // Square mechanical head
    const headX = x + 0 * cos - (-hh - 3.5) * sin;
    const headY = y + 0 * sin + (-hh - 3.5) * cos;
    this.graphics.rect(headX - 3, headY - 3, 6, 6);
    this.graphics.fill({ color: 0x00ffff, alpha: alpha * 0.6 });

    for (let i = 0; i < 4; i++) {
      const partX = x + (Math.random() - 0.5) * 12 * cos - (Math.random() - 0.5) * 12 * sin;
      const partY = y + (Math.random() - 0.5) * 12 * sin + (Math.random() - 0.5) * 12 * cos;
      this.graphics.circle(partX, partY, 1.5);
      this.graphics.fill({ color: 0x00aaaa, alpha: alpha * 0.5 });
    }
    this.graphics.circle(x, y, 10);
    this.graphics.fill({ color: 0x1a1a1a, alpha: alpha * 0.4 });
    for (let i = 0; i < 3; i++) {
      const angle = Math.random() * Math.PI * 2;
      const dist = 8 + Math.random() * 5;
      this.graphics.circle(x + Math.cos(angle) * dist, y + Math.sin(angle) * dist, 1);
      this.graphics.fill({ color: 0xffff00, alpha: alpha * 0.6 });
    }
  }

  private renderBossCorpse(x: number, y: number, cos: number, sin: number, alpha: number): void {
    this.drawCorpseBody(x, y, cos, sin, alpha, 16, 24, 0x1a0a12, 0.8, 6, 0x2a1018, 0.75, 5.5);
    this.graphics.circle(x, y, 20);
    this.graphics.fill({ color: 0x8b0000, alpha: alpha * 0.45 });
    // Amber eye glow residue
    this.graphics.circle(x - 4, y - 2, 2);
    this.graphics.fill({ color: 0xffaa00, alpha: alpha * 0.5 });
    this.graphics.circle(x + 4, y - 2, 2);
    this.graphics.fill({ color: 0xffaa00, alpha: alpha * 0.5 });
  }

  public clear(): void {
    this.corpses = [];
  }

  public getCorpseCount(): number {
    return this.corpses.length;
  }
}
