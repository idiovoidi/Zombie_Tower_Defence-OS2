import { Graphics } from 'pixi.js';
import { Waypoint } from '../../managers/PathfindingManager';

/**
 * CampRenderer handles all survivor camp rendering including:
 * - Static camp structures (tents, fences, sandbags, etc.)
 * - Animated elements (campfire, survivors)
 * - Camp decorations and details
 */
export class CampRenderer {
  private pathGraphics: Graphics;
  private campAnimationContainer: Graphics;
  private campX: number = 0;
  private campY: number = 0;
  private campAnimationTime: number = 0;

  constructor(pathGraphics: Graphics, campAnimationContainer: Graphics) {
    this.pathGraphics = pathGraphics;
    this.campAnimationContainer = campAnimationContainer;
  }

  /**
   * Render the survivor camp at the endpoint
   */
  public render(endpoint: Waypoint): void {
    const campX = endpoint.x;
    const campY = endpoint.y;

    // Store camp position for animations
    this.campX = campX;
    this.campY = campY;

    this.renderStaticCampElements(campX, campY);
  }

  /**
   * Update camp animations (called every frame)
   */
  public updateAnimations(deltaTime: number): void {
    if (this.campX === 0 || this.campY === 0) {
      return;
    }

    this.campAnimationTime += deltaTime * 0.001; // Convert to seconds
    this.campAnimationContainer.clear();
    this.renderAnimatedCampElements(this.campX, this.campY);
  }

  /**
   * Get the camp position for external use (e.g., click detection)
   */
  public getCampPosition(): { x: number; y: number } {
    return { x: this.campX, y: this.campY };
  }

  /**
   * Render all static camp elements
   */
  private renderStaticCampElements(campX: number, campY: number): void {
    // === GROUND LAYER (BACK) ===
    // Cleared, compacted earth
    this.pathGraphics.circle(campX, campY, 70).fill({ color: 0x4a3a2a, alpha: 0.5 });

    // Subtle wear patterns (static - use seeded random for consistency)
    const seed = campX + campY;
    for (let i = 0; i < 15; i++) {
      const angle = ((seed + i * 137.5) % 360) * (Math.PI / 180);
      const dist = (seed + i * 73) % 55;
      const x = campX + Math.cos(angle) * dist;
      const y = campY + Math.sin(angle) * dist;
      this.pathGraphics.ellipse(x, y, 2, 4).fill({ color: 0x3a2a1a, alpha: 0.15 });
    }

    // Render camp structures
    this.renderFence(campX, campY);
    this.renderTents(campX, campY);
    this.renderSandbags(campX, campY);
    this.renderSupplyCrates(campX, campY);
    this.renderWatchtower(campX, campY);
    this.renderCampfireStatic(campX, campY);
    this.renderLaundryLine(campX, campY);
    this.renderWarningSign(campX, campY);
    this.renderGenerator(campX, campY);
    this.renderPicnicTable(campX, campY);
    this.renderStringLights(campX, campY);
    this.renderPersonalItems(campX, campY);
    this.renderMemorial(campX, campY);
  }

  /**
   * Render metal fence perimeter with gate
   */
  private renderFence(campX: number, campY: number): void {
    const drawFencePanel = (x: number, y: number, width: number, height: number) => {
      // Metal panel background
      this.pathGraphics.rect(x, y, width, height).fill({ color: 0x5a5a5a, alpha: 0.9 });
      this.pathGraphics.stroke({ width: 2, color: 0x3a3a3a });

      // Simple horizontal bars for texture
      const barCount = Math.floor(height / 6);
      for (let i = 1; i < barCount; i++) {
        this.pathGraphics
          .moveTo(x, y + (i * height) / barCount)
          .lineTo(x + width, y + (i * height) / barCount)
          .stroke({ width: 1, color: 0x4a4a4a, alpha: 0.5 });
      }

      // Vertical supports
      if (width > height) {
        // Horizontal fence - add vertical supports
        const supportCount = Math.floor(width / 8);
        for (let i = 1; i < supportCount; i++) {
          const supportX = x + (i * width) / supportCount;
          this.pathGraphics
            .moveTo(supportX, y)
            .lineTo(supportX, y + height)
            .stroke({ width: 1, color: 0x4a4a4a, alpha: 0.5 });
        }
      }
    };

    const gateHeight = 50;
    const gateCenter = 0; // Gate centered on path

    // Left fence with gate opening (where path enters from graveyard)
    // Top section of left fence (above gate)
    drawFencePanel(campX - 68, campY - 55, 6, campY + gateCenter - gateHeight / 2 - (campY - 55));

    // Bottom section of left fence (below gate)
    drawFencePanel(
      campX - 68,
      campY + gateCenter + gateHeight / 2,
      6,
      campY + 55 - (campY + gateCenter + gateHeight / 2)
    );

    // Right fence (solid)
    drawFencePanel(campX + 62, campY - 55, 6, 110);

    // Top fence (solid)
    drawFencePanel(campX - 62, campY - 60, 124, 6);

    // Bottom fence (solid)
    drawFencePanel(campX - 62, campY + 54, 124, 6);

    // === GATE (on left side where path enters) ===
    this.renderGate(campX, campY, gateHeight);
  }

  /**
   * Render gate with posts and doors
   */
  private renderGate(campX: number, campY: number, gateHeight: number): void {
    // Gate posts
    this.pathGraphics.rect(campX - 71, campY - gateHeight / 2 - 4, 6, 6).fill(0x5a5a5a);
    this.pathGraphics.stroke({ width: 1, color: 0x3a3a3a });
    this.pathGraphics.rect(campX - 71, campY + gateHeight / 2 - 2, 6, 6).fill(0x5a5a5a);
    this.pathGraphics.stroke({ width: 1, color: 0x3a3a3a });

    // Gate doors (opening outward)
    const gateY1 = campY - gateHeight / 2;
    const gateY2 = campY + gateHeight / 2;

    // Top door
    this.pathGraphics
      .moveTo(campX - 68, gateY1)
      .lineTo(campX - 83, gateY1 - 7)
      .lineTo(campX - 83, campY - 2)
      .lineTo(campX - 68, campY + 2)
      .fill({ color: 0x7a7a7a, alpha: 0.85 });
    this.pathGraphics.stroke({ width: 2, color: 0x5a5a5a });
    // Horizontal bar
    this.pathGraphics
      .moveTo(campX - 81, gateY1 - 3)
      .lineTo(campX - 70, campY)
      .stroke({ width: 1.5, color: 0x5a5a5a });

    // Bottom door
    this.pathGraphics
      .moveTo(campX - 68, gateY2)
      .lineTo(campX - 83, gateY2 + 7)
      .lineTo(campX - 83, campY + 2)
      .lineTo(campX - 68, campY - 2)
      .fill({ color: 0x7a7a7a, alpha: 0.85 });
    this.pathGraphics.stroke({ width: 2, color: 0x5a5a5a });
    // Horizontal bar
    this.pathGraphics
      .moveTo(campX - 81, gateY2 + 3)
      .lineTo(campX - 70, campY)
      .stroke({ width: 1.5, color: 0x5a5a5a });
  }

  /**
   * Render tents (main command tent, medical tent, supply tent)
   */
  private renderTents(campX: number, campY: number): void {
    // === MAIN COMMAND TENT ===
    // Tent base
    this.pathGraphics.rect(campX - 32, campY - 10, 64, 35).fill(0x6b7c3a);
    this.pathGraphics.stroke({ width: 2, color: 0x4a5a2a });

    // Tent roof - peaked
    this.pathGraphics
      .moveTo(campX - 35, campY - 10)
      .lineTo(campX, campY - 32)
      .lineTo(campX + 35, campY - 10)
      .lineTo(campX - 35, campY - 10)
      .fill(0x5a6a2a);
    this.pathGraphics.stroke({ width: 2, color: 0x3a4a1a });

    // Center seam
    this.pathGraphics
      .moveTo(campX, campY - 32)
      .lineTo(campX, campY - 10)
      .stroke({ width: 2, color: 0x4a5a2a });

    // Single repair patch
    this.pathGraphics.rect(campX - 25, campY - 5, 8, 6).fill({ color: 0x4a4a4a, alpha: 0.6 });

    // Entrance flap
    this.pathGraphics.rect(campX - 10, campY + 15, 20, 10).fill(0x4a5a2a);
    this.pathGraphics.stroke({ width: 2, color: 0x3a4a1a });

    // Guy lines
    this.pathGraphics
      .moveTo(campX - 35, campY - 10)
      .lineTo(campX - 45, campY + 5)
      .stroke({ width: 1, color: 0x654321 });
    this.pathGraphics
      .moveTo(campX + 35, campY - 10)
      .lineTo(campX + 45, campY + 5)
      .stroke({ width: 1, color: 0x654321 });
    // Stakes
    this.pathGraphics.rect(campX - 46, campY + 5, 3, 8).fill(0x654321);
    this.pathGraphics.rect(campX + 43, campY + 5, 3, 8).fill(0x654321);

    // === MEDICAL TENT (Left - Behind main tent) ===
    this.pathGraphics
      .moveTo(campX - 52, campY - 40)
      .lineTo(campX - 37, campY - 50)
      .lineTo(campX - 22, campY - 40)
      .lineTo(campX - 52, campY - 40)
      .fill(0xe5e5cc);
    this.pathGraphics.stroke({ width: 2, color: 0xc5c5ac });
    this.pathGraphics.rect(campX - 50, campY - 40, 28, 18).fill(0xf5f5dc);
    this.pathGraphics.stroke({ width: 1, color: 0xc5c5ac });
    // Red cross
    this.pathGraphics.rect(campX - 39, campY - 34, 5, 2).fill(0xcc0000);
    this.pathGraphics.rect(campX - 38, campY - 36, 2, 5).fill(0xcc0000);

    // === SUPPLY TENT (Right - Behind main tent) ===
    this.pathGraphics
      .moveTo(campX + 22, campY - 40)
      .lineTo(campX + 37, campY - 50)
      .lineTo(campX + 52, campY - 40)
      .lineTo(campX + 22, campY - 40)
      .fill(0x8b7355);
    this.pathGraphics.stroke({ width: 2, color: 0x654321 });
    this.pathGraphics.rect(campX + 24, campY - 40, 26, 18).fill(0xa0826d);
    this.pathGraphics.stroke({ width: 1, color: 0x654321 });
  }

  /**
   * Render sandbag barriers
   */
  private renderSandbags(campX: number, campY: number): void {
    const drawSandbag = (x: number, y: number) => {
      this.pathGraphics.roundRect(x, y, 12, 8, 2).fill(0x8b7355);
      this.pathGraphics.stroke({ width: 1, color: 0x654321 });
    };

    // Left barrier (2 bags)
    drawSandbag(campX - 58, campY + 30);
    drawSandbag(campX - 58, campY + 40);

    // Right barrier (2 bags)
    drawSandbag(campX + 46, campY + 30);
    drawSandbag(campX + 46, campY + 40);
  }

  /**
   * Render supply crates
   */
  private renderSupplyCrates(campX: number, campY: number): void {
    const drawCrate = (x: number, y: number) => {
      this.pathGraphics.rect(x, y, 14, 14).fill(0x8b7355);
      this.pathGraphics.stroke({ width: 2, color: 0x654321 });
      // Wood grain lines
      this.pathGraphics
        .moveTo(x, y + 7)
        .lineTo(x + 14, y + 7)
        .stroke({ width: 1, color: 0x654321 });
      this.pathGraphics
        .moveTo(x + 7, y)
        .lineTo(x + 7, y + 14)
        .stroke({ width: 1, color: 0x654321 });
    };

    // Position crates further back to avoid overlap
    drawCrate(campX - 56, campY - 48);
    drawCrate(campX - 56, campY - 32);
    drawCrate(campX - 40, campY - 48);
  }

  /**
   * Render watchtower with guard platform
   */
  private renderWatchtower(campX: number, campY: number): void {
    // Tower legs
    this.pathGraphics.rect(campX - 60, campY - 35, 4, 45).fill(0x654321);
    this.pathGraphics.rect(campX - 46, campY - 35, 4, 45).fill(0x654321);

    // Cross braces
    this.pathGraphics
      .moveTo(campX - 58, campY - 30)
      .lineTo(campX - 48, campY - 20)
      .stroke({ width: 2, color: 0x654321 });
    this.pathGraphics
      .moveTo(campX - 48, campY - 30)
      .lineTo(campX - 58, campY - 20)
      .stroke({ width: 2, color: 0x654321 });

    // Platform
    this.pathGraphics.rect(campX - 64, campY - 40, 26, 8).fill(0x8b7355);
    this.pathGraphics.stroke({ width: 2, color: 0x654321 });

    // Railing
    this.pathGraphics.rect(campX - 64, campY - 42, 26, 2).fill(0x654321);

    // Radio antenna
    this.pathGraphics
      .moveTo(campX - 66, campY - 40)
      .lineTo(campX - 66, campY - 58)
      .stroke({ width: 2, color: 0x4a4a4a });
    this.pathGraphics.circle(campX - 66, campY - 58, 2).fill(0xff0000);
  }

  /**
   * Render static campfire elements (stone ring, fire pit, logs)
   */
  private renderCampfireStatic(campX: number, campY: number): void {
    // Stone ring (elliptical for top-down perspective)
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      const x = campX + Math.cos(angle) * 12;
      const y = campY + 32 + Math.sin(angle) * 6; // Compressed Y for perspective
      this.pathGraphics.circle(x, y, 3).fill(0x5a5a5a);
      this.pathGraphics.stroke({ width: 1, color: 0x3a3a3a });
    }

    // Fire pit base (ellipse for perspective)
    this.pathGraphics.ellipse(campX, campY + 32, 10, 5).fill({ color: 0x2a2a2a, alpha: 0.6 });

    // Seating logs (perspective - wider at bottom)
    // Left log
    this.pathGraphics
      .moveTo(campX - 22, campY + 40)
      .lineTo(campX - 10, campY + 38)
      .lineTo(campX - 10, campY + 42)
      .lineTo(campX - 22, campY + 44)
      .lineTo(campX - 22, campY + 40)
      .fill(0x654321);
    this.pathGraphics.stroke({ width: 1, color: 0x4a3211 });

    // Right log
    this.pathGraphics
      .moveTo(campX + 10, campY + 38)
      .lineTo(campX + 22, campY + 40)
      .lineTo(campX + 22, campY + 44)
      .lineTo(campX + 10, campY + 42)
      .lineTo(campX + 10, campY + 38)
      .fill(0x654321);
    this.pathGraphics.stroke({ width: 1, color: 0x4a3211 });
  }

  /**
   * Render laundry line with clothes
   */
  private renderLaundryLine(campX: number, campY: number): void {
    this.pathGraphics
      .moveTo(campX - 20, campY - 25)
      .lineTo(campX + 20, campY - 25)
      .stroke({ width: 1, color: 0x3a3a3a });
    // Clothes
    this.pathGraphics.rect(campX - 10, campY - 25, 6, 8).fill({ color: 0x4169e1, alpha: 0.7 });
    this.pathGraphics.rect(campX + 4, campY - 25, 6, 8).fill({ color: 0x228b22, alpha: 0.7 });
  }

  /**
   * Render warning sign
   */
  private renderWarningSign(campX: number, campY: number): void {
    this.pathGraphics.rect(campX - 40, campY - 60, 80, 18).fill(0x8b7355);
    this.pathGraphics.stroke({ width: 3, color: 0x654321 });
    // Warning stripes
    this.pathGraphics.rect(campX - 38, campY - 58, 6, 14).fill({ color: 0xffcc00, alpha: 0.8 });
    this.pathGraphics.rect(campX + 32, campY - 58, 6, 14).fill({ color: 0xffcc00, alpha: 0.8 });
    // Safe zone area
    this.pathGraphics.rect(campX - 35, campY - 56, 70, 12).fill({ color: 0x00aa00, alpha: 0.7 });
    this.pathGraphics.stroke({ width: 2, color: 0x008800 });
    // Nails
    this.pathGraphics.circle(campX - 36, campY - 56, 1.5).fill(0x4a4a4a);
    this.pathGraphics.circle(campX + 36, campY - 56, 1.5).fill(0x4a4a4a);
    this.pathGraphics.circle(campX - 36, campY - 44, 1.5).fill(0x4a4a4a);
    this.pathGraphics.circle(campX + 36, campY - 44, 1.5).fill(0x4a4a4a);
  }

  /**
   * Render generator with fuel can
   */
  private renderGenerator(campX: number, campY: number): void {
    // Generator (small)
    this.pathGraphics.rect(campX + 48, campY + 20, 12, 10).fill(0x6a6a6a);
    this.pathGraphics.stroke({ width: 2, color: 0x4a4a4a });
    // Exhaust pipe
    this.pathGraphics.rect(campX + 54, campY + 16, 2, 4).fill(0x2a2a2a);
    // Fuel can nearby
    this.pathGraphics.rect(campX + 48, campY + 32, 6, 8).fill(0xcc0000);
    this.pathGraphics.stroke({ width: 1, color: 0xaa0000 });
  }

  /**
   * Render picnic table with items
   */
  private renderPicnicTable(campX: number, campY: number): void {
    // Picnic table
    this.pathGraphics.rect(campX - 12, campY + 12, 24, 3).fill(0x8b7355);
    this.pathGraphics.rect(campX - 10, campY + 15, 2, 6).fill(0x654321);
    this.pathGraphics.rect(campX + 8, campY + 15, 2, 6).fill(0x654321);
    // Items on table
    this.pathGraphics.circle(campX - 6, campY + 13, 2).fill(0x4a6a8a); // Cup
    this.pathGraphics.rect(campX + 2, campY + 12, 4, 2).fill(0x8b4513); // Book
  }

  /**
   * Render string lights
   */
  private renderStringLights(campX: number, campY: number): void {
    // String lights between posts (festive but practical)
    this.pathGraphics
      .moveTo(campX - 50, campY - 10)
      .quadraticCurveTo(campX - 25, campY - 5, campX, campY - 8)
      .quadraticCurveTo(campX + 25, campY - 5, campX + 50, campY - 10)
      .stroke({ width: 1, color: 0x3a3a3a });
    // Light bulbs
    for (let i = -40; i <= 40; i += 20) {
      this.pathGraphics.circle(campX + i, campY - 7, 2).fill({ color: 0xffaa00, alpha: 0.6 });
      this.pathGraphics.circle(campX + i, campY - 7, 3).fill({ color: 0xffaa00, alpha: 0.2 });
    }
  }

  /**
   * Render scattered personal items
   */
  private renderPersonalItems(campX: number, campY: number): void {
    // Backpack
    this.pathGraphics.rect(campX - 26, campY - 2, 6, 8).fill(0x3a4a2a);
    this.pathGraphics.stroke({ width: 1, color: 0x2a3a1a });
    // Boots
    this.pathGraphics.rect(campX + 20, campY - 4, 4, 6).fill(0x4a3a2a);
    this.pathGraphics.rect(campX + 26, campY - 4, 4, 6).fill(0x4a3a2a);
    // Guitar leaning on crate
    this.pathGraphics.ellipse(campX - 32, campY - 32, 4, 6).fill(0x8b7355);
    this.pathGraphics.rect(campX - 32, campY - 38, 2, 12).fill(0x654321);
  }

  /**
   * Render memorial marker
   */
  private renderMemorial(campX: number, campY: number): void {
    // Memorial marker (small cross)
    this.pathGraphics.rect(campX + 60, campY + 42, 2, 10).fill(0x8b7355);
    this.pathGraphics.rect(campX + 56, campY + 44, 10, 2).fill(0x8b7355);
    // Flowers at base
    this.pathGraphics.circle(campX + 60, campY + 52, 2).fill({ color: 0xff6666, alpha: 0.6 });
    this.pathGraphics.circle(campX + 62, campY + 52, 2).fill({ color: 0xffff66, alpha: 0.6 });
  }

  /**
   * Render animated camp elements (campfire, survivors)
   */
  private renderAnimatedCampElements(campX: number, campY: number): void {
    // === ANIMATED CAMPFIRE ===
    // Animated fire with flicker
    const flicker1 = Math.sin(this.campAnimationTime * 8) * 0.5 + 0.5;
    const flicker2 = Math.sin(this.campAnimationTime * 10 + 1) * 0.5 + 0.5;
    const flicker3 = Math.sin(this.campAnimationTime * 12 + 2) * 0.5 + 0.5;

    // Fire layers (from bottom to top)
    this.campAnimationContainer
      .ellipse(campX, campY + 32, 8 + flicker1, 4)
      .fill({ color: 0xff4500, alpha: 0.9 });
    this.campAnimationContainer
      .ellipse(campX, campY + 30, 6 + flicker2 * 0.5, 3)
      .fill({ color: 0xffa500, alpha: 0.9 });
    this.campAnimationContainer
      .ellipse(campX, campY + 28, 4 + flicker3 * 0.3, 2)
      .fill({ color: 0xffff00, alpha: 0.95 });
    this.campAnimationContainer
      .ellipse(campX, campY + 27, 2, 1)
      .fill({ color: 0xffffaa, alpha: 1 });

    // === ANIMATED SURVIVORS (5 total) ===
    this.renderAnimatedSurvivors(campX, campY);
  }

  /**
   * Render animated survivors
   */
  private renderAnimatedSurvivors(campX: number, campY: number): void {
    // Animation values
    const breathe = Math.sin(this.campAnimationTime * 2) * 0.3;
    const breathe2 = Math.sin(this.campAnimationTime * 2.3 + 1) * 0.3; // Offset breathing
    const sway = Math.sin(this.campAnimationTime * 1.5) * 0.5;
    const headTurn = Math.sin(this.campAnimationTime * 0.8) * 1;
    const headTurn2 = Math.sin(this.campAnimationTime * 0.9 + 2) * 1; // Different timing

    // Survivor 1 - Watchtower guard (scanning, breathing)
    this.campAnimationContainer
      .circle(campX - 51 + headTurn2 * 0.5, campY - 38 + breathe * 0.1, 4)
      .fill(0xffdbac);
    this.campAnimationContainer
      .rect(campX - 54 + headTurn2 * 0.5, campY - 34 + breathe * 0.1, 6, 8)
      .fill(0x654321);
    // Rifle
    this.campAnimationContainer
      .rect(campX - 51 + headTurn2 * 0.5, campY - 43 + breathe * 0.1, 1, 7)
      .fill(0x4a4a4a);

    // Survivor 2 - sitting by fire (breathing, slight sway)
    this.campAnimationContainer.circle(campX - 18, campY + 36 + breathe * 0.2, 4).fill(0xffdbac);
    this.campAnimationContainer.rect(campX - 21, campY + 40, 6, 6 + breathe * 0.5).fill(0x4169e1);

    // Survivor 3 - standing guard with weapon (swaying, head turning)
    this.campAnimationContainer
      .circle(campX + 25 + headTurn, campY + 20 + sway * 0.3, 4)
      .fill(0xffdbac);
    this.campAnimationContainer.rect(campX + 22 + sway * 0.5, campY + 24, 6, 8).fill(0x654321);
    this.campAnimationContainer.rect(campX + 25 + sway * 0.5, campY + 18, 1, 6).fill(0x2a2a2a);

    // Survivor 4 - working on crate (bobbing up and down)
    const workBob = Math.abs(Math.sin(this.campAnimationTime * 3)) * 2;
    this.campAnimationContainer.circle(campX - 50, campY - 36 - workBob, 4).fill(0xffdbac);
    this.campAnimationContainer.rect(campX - 53, campY - 32 - workBob, 6, 8).fill(0x4a4a4a);

    // Survivor 5 - medic near medical tent (breathing, slight head turn)
    this.campAnimationContainer
      .circle(campX - 32 + headTurn * 0.3, campY - 26 + breathe2 * 0.15, 4)
      .fill(0xffdbac);
    this.campAnimationContainer
      .rect(campX - 35 + headTurn * 0.3, campY - 22 + breathe2 * 0.15, 6, 8)
      .fill(0xf5f5dc);
    // Red cross armband
    this.campAnimationContainer
      .rect(campX - 34 + headTurn * 0.3, campY - 20 + breathe2 * 0.15, 4, 2)
      .fill(0xcc0000);
  }
}
