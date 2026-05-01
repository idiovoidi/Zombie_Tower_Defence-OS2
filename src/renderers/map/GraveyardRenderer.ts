import { Graphics } from 'pixi.js';
import { GRAVEYARD_DETAILS } from '../../config/visualConstants';

interface Gravestone {
  x: number;
  y: number;
  type: string;
  size: number;
  tilt: number;
}

/**
 * GraveyardRenderer
 *
 * Responsible for rendering the graveyard area including:
 * - Graveyard ground (cursed earth)
 * - Dead grass patches
 * - Disturbed earth (zombie emergence sites)
 * - Scattered bones and debris
 * - Dark stains (blood/decay)
 * - Weathered iron fence
 * - Gate with stone pillars and skulls
 * - Broken iron gates
 * - RIP sign
 * - Rusty chains
 * - Gravestones (cross, headstone, monument types)
 * - Dead trees
 * - Eerie green glow spots
 * - Open graves with skeletal hands
 */
export class GraveyardRenderer {
  private graphics: Graphics;
  private graveyardX: number;
  private graveyardY: number;
  private graveyardWidth: number;
  private graveyardHeight: number;

  constructor(graphics: Graphics) {
    this.graphics = graphics;
    this.graveyardX = GRAVEYARD_DETAILS.X;
    this.graveyardY = GRAVEYARD_DETAILS.Y;
    this.graveyardWidth = GRAVEYARD_DETAILS.WIDTH;
    this.graveyardHeight = GRAVEYARD_DETAILS.HEIGHT;
  }

  public render(): void {
    this.renderGraveyardGround();
    this.renderDeadGrassPatches();
    this.renderDisturbedEarth();
    this.renderBonesAndDebris();
    this.renderDarkStains();
    this.renderFence();
    this.renderGate();
    this.renderGravestones();
    this.renderDeadTrees();
    this.renderEerieGlow();
    this.renderOpenGraves();
  }

  private renderGraveyardGround(): void {
    // Graveyard ground - base layer (very dark, cursed earth)
    this.graphics
      .rect(this.graveyardX, this.graveyardY, this.graveyardWidth, this.graveyardHeight)
      .fill({ color: GRAVEYARD_DETAILS.GROUND_COLOR });
  }

  private renderDeadGrassPatches(): void {
    // Add dead grass patches (darker than surrounding area)
    for (let i = 0; i < GRAVEYARD_DETAILS.DEAD_GRASS_COUNT; i++) {
      const x = this.graveyardX + Math.random() * this.graveyardWidth;
      const y = this.graveyardY + Math.random() * this.graveyardHeight;
      const size =
        GRAVEYARD_DETAILS.DEAD_GRASS_MIN_SIZE +
        Math.random() *
          (GRAVEYARD_DETAILS.DEAD_GRASS_MAX_SIZE - GRAVEYARD_DETAILS.DEAD_GRASS_MIN_SIZE);
      const points =
        GRAVEYARD_DETAILS.DEAD_GRASS_MIN_POINTS +
        Math.floor(
          Math.random() *
            (GRAVEYARD_DETAILS.DEAD_GRASS_MAX_POINTS - GRAVEYARD_DETAILS.DEAD_GRASS_MIN_POINTS)
        );

      this.graphics.moveTo(x, y);
      for (let j = 0; j < points; j++) {
        const angle = (j / points) * Math.PI * 2;
        const radius =
          size *
          (GRAVEYARD_DETAILS.DEAD_GRASS_MIN_RADIUS_FACTOR +
            Math.random() *
              (GRAVEYARD_DETAILS.DEAD_GRASS_MAX_RADIUS_FACTOR -
                GRAVEYARD_DETAILS.DEAD_GRASS_MIN_RADIUS_FACTOR));
        this.graphics.lineTo(x + Math.cos(angle) * radius, y + Math.sin(angle) * radius);
      }
      this.graphics.fill({
        color: GRAVEYARD_DETAILS.DEAD_GRASS_COLOR,
        alpha:
          GRAVEYARD_DETAILS.DEAD_GRASS_MIN_ALPHA +
          Math.random() *
            (GRAVEYARD_DETAILS.DEAD_GRASS_MAX_ALPHA - GRAVEYARD_DETAILS.DEAD_GRASS_MIN_ALPHA),
      });
    }
  }

  private renderDisturbedEarth(): void {
    // Add disturbed earth patches (where zombies emerged)
    for (let i = 0; i < GRAVEYARD_DETAILS.DISTURBED_EARTH_COUNT; i++) {
      const x = this.graveyardX + Math.random() * this.graveyardWidth;
      const y = this.graveyardY + Math.random() * this.graveyardHeight;
      const size =
        GRAVEYARD_DETAILS.DISTURBED_EARTH_MIN_SIZE +
        Math.random() *
          (GRAVEYARD_DETAILS.DISTURBED_EARTH_MAX_SIZE - GRAVEYARD_DETAILS.DISTURBED_EARTH_MIN_SIZE);
      const points =
        GRAVEYARD_DETAILS.DISTURBED_EARTH_MIN_POINTS +
        Math.floor(
          Math.random() *
            (GRAVEYARD_DETAILS.DISTURBED_EARTH_MAX_POINTS -
              GRAVEYARD_DETAILS.DISTURBED_EARTH_MIN_POINTS)
        );

      this.graphics.moveTo(x, y);
      for (let j = 0; j < points; j++) {
        const angle = (j / points) * Math.PI * 2;
        const radius =
          size *
          (GRAVEYARD_DETAILS.DISTURBED_EARTH_MIN_RADIUS_FACTOR +
            Math.random() *
              (GRAVEYARD_DETAILS.DISTURBED_EARTH_MAX_RADIUS_FACTOR -
                GRAVEYARD_DETAILS.DISTURBED_EARTH_MIN_RADIUS_FACTOR));
        this.graphics.lineTo(x + Math.cos(angle) * radius, y + Math.sin(angle) * radius);
      }
      this.graphics.fill({
        color: GRAVEYARD_DETAILS.DISTURBED_EARTH_COLOR,
        alpha:
          GRAVEYARD_DETAILS.DISTURBED_EARTH_MIN_ALPHA +
          Math.random() *
            (GRAVEYARD_DETAILS.DISTURBED_EARTH_MAX_ALPHA -
              GRAVEYARD_DETAILS.DISTURBED_EARTH_MIN_ALPHA),
      });
    }
  }

  private renderBonesAndDebris(): void {
    // Add scattered bones and debris
    for (let i = 0; i < GRAVEYARD_DETAILS.BONES_COUNT; i++) {
      const x = this.graveyardX + Math.random() * this.graveyardWidth;
      const y = this.graveyardY + Math.random() * this.graveyardHeight;
      const size =
        GRAVEYARD_DETAILS.BONES_MIN_SIZE +
        Math.random() * (GRAVEYARD_DETAILS.BONES_MAX_SIZE - GRAVEYARD_DETAILS.BONES_MIN_SIZE);
      this.graphics.rect(x, y, size, size * GRAVEYARD_DETAILS.BONES_HEIGHT_FACTOR).fill({
        color: GRAVEYARD_DETAILS.BONES_COLOR,
        alpha:
          GRAVEYARD_DETAILS.BONES_MIN_ALPHA +
          Math.random() * (GRAVEYARD_DETAILS.BONES_MAX_ALPHA - GRAVEYARD_DETAILS.BONES_MIN_ALPHA),
      });
    }
  }

  private renderDarkStains(): void {
    // Add dark stains (blood/decay)
    for (let i = 0; i < GRAVEYARD_DETAILS.STAINS_COUNT; i++) {
      const x = this.graveyardX + Math.random() * this.graveyardWidth;
      const y = this.graveyardY + Math.random() * this.graveyardHeight;
      const size =
        GRAVEYARD_DETAILS.STAINS_MIN_SIZE +
        Math.random() * (GRAVEYARD_DETAILS.STAINS_MAX_SIZE - GRAVEYARD_DETAILS.STAINS_MIN_SIZE);
      this.graphics.circle(x, y, size).fill({
        color: GRAVEYARD_DETAILS.STAINS_COLOR,
        alpha:
          GRAVEYARD_DETAILS.STAINS_MIN_ALPHA +
          Math.random() * (GRAVEYARD_DETAILS.STAINS_MAX_ALPHA - GRAVEYARD_DETAILS.STAINS_MIN_ALPHA),
      });
    }
  }

  private renderFence(): void {
    // Weathered iron fence around graveyard
    const gateGapStart = GRAVEYARD_DETAILS.GATE_Y - this.graveyardY;
    const gateGapEnd = gateGapStart + GRAVEYARD_DETAILS.GATE_HEIGHT;

    // Top fence - rusty and weathered
    this.graphics
      .rect(
        this.graveyardX,
        this.graveyardY,
        this.graveyardWidth,
        GRAVEYARD_DETAILS.FENCE_THICKNESS
      )
      .fill(GRAVEYARD_DETAILS.FENCE_COLOR);
    this.graphics
      .rect(
        this.graveyardX,
        this.graveyardY,
        this.graveyardWidth,
        GRAVEYARD_DETAILS.FENCE_THICKNESS
      )
      .stroke({ width: 1, color: GRAVEYARD_DETAILS.FENCE_BORDER_COLOR });
    // Add rust spots on top fence
    for (let i = 0; i < GRAVEYARD_DETAILS.FENCE_RUST_SPOTS; i++) {
      const x = this.graveyardX + (i / GRAVEYARD_DETAILS.FENCE_RUST_SPOTS) * this.graveyardWidth;
      this.graphics
        .circle(x, this.graveyardY + GRAVEYARD_DETAILS.FENCE_THICKNESS / 2, 2)
        .fill({ color: GRAVEYARD_DETAILS.RUST_COLOR, alpha: GRAVEYARD_DETAILS.RUST_ALPHA });
    }

    // Bottom fence - rusty and weathered
    this.graphics
      .rect(
        this.graveyardX,
        this.graveyardY + this.graveyardHeight - GRAVEYARD_DETAILS.FENCE_THICKNESS,
        this.graveyardWidth,
        GRAVEYARD_DETAILS.FENCE_THICKNESS
      )
      .fill(GRAVEYARD_DETAILS.FENCE_COLOR);
    this.graphics
      .rect(
        this.graveyardX,
        this.graveyardY + this.graveyardHeight - GRAVEYARD_DETAILS.FENCE_THICKNESS,
        this.graveyardWidth,
        GRAVEYARD_DETAILS.FENCE_THICKNESS
      )
      .stroke({ width: 1, color: GRAVEYARD_DETAILS.FENCE_BORDER_COLOR });
    // Add rust spots on bottom fence
    for (let i = 0; i < GRAVEYARD_DETAILS.FENCE_RUST_SPOTS; i++) {
      const x = this.graveyardX + (i / GRAVEYARD_DETAILS.FENCE_RUST_SPOTS) * this.graveyardWidth;
      this.graphics
        .circle(
          x,
          this.graveyardY + this.graveyardHeight - GRAVEYARD_DETAILS.FENCE_THICKNESS / 2,
          2
        )
        .fill({ color: GRAVEYARD_DETAILS.RUST_COLOR, alpha: GRAVEYARD_DETAILS.RUST_ALPHA });
    }

    // Left fence (solid) - weathered
    this.graphics
      .rect(
        this.graveyardX,
        this.graveyardY,
        GRAVEYARD_DETAILS.FENCE_THICKNESS,
        this.graveyardHeight
      )
      .fill(GRAVEYARD_DETAILS.FENCE_COLOR);
    this.graphics
      .rect(
        this.graveyardX,
        this.graveyardY,
        GRAVEYARD_DETAILS.FENCE_THICKNESS,
        this.graveyardHeight
      )
      .stroke({ width: 1, color: GRAVEYARD_DETAILS.FENCE_BORDER_COLOR });
    // Add vertical rust streaks
    for (let i = 0; i < GRAVEYARD_DETAILS.FENCE_RUST_STREAKS; i++) {
      const y = this.graveyardY + (i / GRAVEYARD_DETAILS.FENCE_RUST_STREAKS) * this.graveyardHeight;
      this.graphics
        .moveTo(this.graveyardX + GRAVEYARD_DETAILS.FENCE_THICKNESS / 2, y)
        .lineTo(this.graveyardX + GRAVEYARD_DETAILS.FENCE_THICKNESS / 2, y + 20)
        .stroke({ width: 1, color: GRAVEYARD_DETAILS.RUST_COLOR, alpha: 0.5 });
    }

    // Right fence - top section (above gate) - weathered
    this.graphics
      .rect(
        this.graveyardX + this.graveyardWidth - GRAVEYARD_DETAILS.FENCE_THICKNESS,
        this.graveyardY,
        GRAVEYARD_DETAILS.FENCE_THICKNESS,
        gateGapStart
      )
      .fill(GRAVEYARD_DETAILS.FENCE_COLOR);
    this.graphics
      .rect(
        this.graveyardX + this.graveyardWidth - GRAVEYARD_DETAILS.FENCE_THICKNESS,
        this.graveyardY,
        GRAVEYARD_DETAILS.FENCE_THICKNESS,
        gateGapStart
      )
      .stroke({ width: 1, color: GRAVEYARD_DETAILS.FENCE_BORDER_COLOR });

    // Right fence - bottom section (below gate) - weathered
    this.graphics
      .rect(
        this.graveyardX + this.graveyardWidth - GRAVEYARD_DETAILS.FENCE_THICKNESS,
        this.graveyardY + gateGapEnd,
        GRAVEYARD_DETAILS.FENCE_THICKNESS,
        this.graveyardHeight - gateGapEnd
      )
      .fill(GRAVEYARD_DETAILS.FENCE_COLOR);
    this.graphics
      .rect(
        this.graveyardX + this.graveyardWidth - GRAVEYARD_DETAILS.FENCE_THICKNESS,
        this.graveyardY + gateGapEnd,
        GRAVEYARD_DETAILS.FENCE_THICKNESS,
        this.graveyardHeight - gateGapEnd
      )
      .stroke({ width: 1, color: GRAVEYARD_DETAILS.FENCE_BORDER_COLOR });

    // Fence posts (avoiding gate area on right side) - weathered wood
    for (let i = 0; i <= this.graveyardHeight; i += GRAVEYARD_DETAILS.FENCE_POST_SPACING) {
      // Left posts
      this.graphics
        .rect(
          this.graveyardX - 3,
          this.graveyardY + i,
          GRAVEYARD_DETAILS.FENCE_POST_WIDTH,
          GRAVEYARD_DETAILS.FENCE_POST_HEIGHT
        )
        .fill(GRAVEYARD_DETAILS.FENCE_POST_COLOR);
      this.graphics
        .rect(
          this.graveyardX - 3,
          this.graveyardY + i,
          GRAVEYARD_DETAILS.FENCE_POST_WIDTH,
          GRAVEYARD_DETAILS.FENCE_POST_HEIGHT
        )
        .stroke({ width: 1, color: GRAVEYARD_DETAILS.FENCE_POST_BORDER_COLOR });
      // Wood grain
      this.graphics
        .moveTo(this.graveyardX - 2, this.graveyardY + i + 1)
        .lineTo(this.graveyardX + 4, this.graveyardY + i + 1)
        .stroke({ width: 1, color: GRAVEYARD_DETAILS.WOOD_GRAIN_COLOR, alpha: 0.5 });

      // Right posts (skip gate area)
      if (i < gateGapStart || i > gateGapEnd) {
        this.graphics
          .rect(
            this.graveyardX + this.graveyardWidth - 6,
            this.graveyardY + i,
            GRAVEYARD_DETAILS.FENCE_POST_WIDTH,
            GRAVEYARD_DETAILS.FENCE_POST_HEIGHT
          )
          .fill(GRAVEYARD_DETAILS.FENCE_POST_COLOR);
        this.graphics
          .rect(
            this.graveyardX + this.graveyardWidth - 6,
            this.graveyardY + i,
            GRAVEYARD_DETAILS.FENCE_POST_WIDTH,
            GRAVEYARD_DETAILS.FENCE_POST_HEIGHT
          )
          .stroke({ width: 1, color: GRAVEYARD_DETAILS.FENCE_POST_BORDER_COLOR });
        // Wood grain
        this.graphics
          .moveTo(this.graveyardX + this.graveyardWidth - 5, this.graveyardY + i + 1)
          .lineTo(this.graveyardX + this.graveyardWidth + 1, this.graveyardY + i + 1)
          .stroke({ width: 1, color: GRAVEYARD_DETAILS.WOOD_GRAIN_COLOR, alpha: 0.5 });
      }
    }
  }

  private renderGate(): void {
    // Gate opening (where zombies exit) - on RIGHT side, aligned with spawn point
    const gateX = this.graveyardX + this.graveyardWidth - GRAVEYARD_DETAILS.GATE_WIDTH;
    const gateY = GRAVEYARD_DETAILS.GATE_Y;
    const gateWidth = GRAVEYARD_DETAILS.GATE_WIDTH;
    const gateHeight = GRAVEYARD_DETAILS.GATE_HEIGHT;

    // Gate posts (weathered stone pillars with cracks)
    this.graphics
      .rect(
        gateX - GRAVEYARD_DETAILS.GATE_PILLAR_WIDTH,
        gateY,
        GRAVEYARD_DETAILS.GATE_PILLAR_WIDTH,
        gateHeight
      )
      .fill(GRAVEYARD_DETAILS.GATE_PILLAR_COLOR);
    this.graphics
      .rect(
        gateX - GRAVEYARD_DETAILS.GATE_PILLAR_WIDTH,
        gateY,
        GRAVEYARD_DETAILS.GATE_PILLAR_WIDTH,
        gateHeight
      )
      .stroke({ width: 2, color: GRAVEYARD_DETAILS.GATE_PILLAR_BORDER_COLOR });
    // Add cracks to left pillar
    this.graphics
      .moveTo(gateX - 6, gateY + 10)
      .lineTo(gateX - 4, gateY + 25)
      .stroke({
        width: 1,
        color: GRAVEYARD_DETAILS.GATE_CRACK_COLOR,
        alpha: GRAVEYARD_DETAILS.GATE_CRACK_ALPHA,
      });
    // Moss/weathering on left pillar
    for (let i = 0; i < GRAVEYARD_DETAILS.GATE_MOSS_SPOTS; i++) {
      this.graphics.circle(gateX - 5 + Math.random() * 3, gateY + 15 + i * 15, 2).fill({
        color: GRAVEYARD_DETAILS.GATE_MOSS_COLOR,
        alpha: GRAVEYARD_DETAILS.GATE_MOSS_ALPHA,
      });
    }

    this.graphics
      .rect(gateX + gateWidth, gateY, GRAVEYARD_DETAILS.GATE_PILLAR_WIDTH, gateHeight)
      .fill(GRAVEYARD_DETAILS.GATE_PILLAR_COLOR);
    this.graphics
      .rect(gateX + gateWidth, gateY, GRAVEYARD_DETAILS.GATE_PILLAR_WIDTH, gateHeight)
      .stroke({ width: 2, color: GRAVEYARD_DETAILS.GATE_PILLAR_BORDER_COLOR });
    // Add cracks to right pillar
    this.graphics
      .moveTo(gateX + gateWidth + 2, gateY + 15)
      .lineTo(gateX + gateWidth + 4, gateY + 30)
      .stroke({
        width: 1,
        color: GRAVEYARD_DETAILS.GATE_CRACK_COLOR,
        alpha: GRAVEYARD_DETAILS.GATE_CRACK_ALPHA,
      });
    // Moss/weathering on right pillar
    for (let i = 0; i < GRAVEYARD_DETAILS.GATE_MOSS_SPOTS; i++) {
      this.graphics.circle(gateX + gateWidth + 2 + Math.random() * 3, gateY + 20 + i * 15, 2).fill({
        color: GRAVEYARD_DETAILS.GATE_MOSS_COLOR,
        alpha: GRAVEYARD_DETAILS.GATE_MOSS_ALPHA,
      });
    }

    // Decorative skulls on gate posts (more detailed)
    this.renderSkull(gateX - 4, gateY + 10);
    this.renderSkull(gateX + gateWidth + 4, gateY + 10);

    // Broken iron gate (left side, hanging inward) - more rusted
    this.graphics
      .moveTo(gateX - GRAVEYARD_DETAILS.GATE_PILLAR_WIDTH, gateY + 5)
      .lineTo(gateX - 2, gateY + 10)
      .lineTo(gateX - 2, gateY + 45)
      .lineTo(gateX - GRAVEYARD_DETAILS.GATE_PILLAR_WIDTH, gateY + 50)
      .fill({
        color: GRAVEYARD_DETAILS.GATE_IRON_COLOR,
        alpha: GRAVEYARD_DETAILS.GATE_IRON_ALPHA,
      });
    this.graphics.stroke({ width: 2, color: GRAVEYARD_DETAILS.GATE_IRON_BORDER_COLOR });
    // Rust spots on left gate
    for (let i = 0; i < GRAVEYARD_DETAILS.GATE_RUST_SPOTS; i++) {
      this.graphics.circle(gateX - 5, gateY + 15 + i * 10, 2).fill({
        color: GRAVEYARD_DETAILS.RUST_COLOR,
        alpha: GRAVEYARD_DETAILS.GATE_RUST_ALPHA,
      });
    }

    // Gate bars (broken and rusted)
    for (let i = 0; i < GRAVEYARD_DETAILS.GATE_BAR_COUNT; i++) {
      this.graphics
        .moveTo(gateX - 6, gateY + 15 + i * 10)
        .lineTo(gateX - 2, gateY + 15 + i * 10)
        .stroke({ width: 2, color: GRAVEYARD_DETAILS.GATE_IRON_BORDER_COLOR });
    }

    // Broken iron gate (right side, swung open outward) - more rusted
    this.graphics
      .moveTo(gateX + gateWidth + GRAVEYARD_DETAILS.GATE_PILLAR_WIDTH, gateY + 5)
      .lineTo(gateX + gateWidth + 20, gateY + 10)
      .lineTo(gateX + gateWidth + 20, gateY + 50)
      .lineTo(gateX + gateWidth + GRAVEYARD_DETAILS.GATE_PILLAR_WIDTH, gateY + 55)
      .fill({
        color: GRAVEYARD_DETAILS.GATE_IRON_COLOR,
        alpha: GRAVEYARD_DETAILS.GATE_IRON_ALPHA,
      });
    this.graphics.stroke({ width: 2, color: GRAVEYARD_DETAILS.GATE_IRON_BORDER_COLOR });
    // Rust spots on right gate
    for (let i = 0; i < GRAVEYARD_DETAILS.GATE_RUST_SPOTS; i++) {
      this.graphics.circle(gateX + gateWidth + 14, gateY + 20 + i * 10, 2).fill({
        color: GRAVEYARD_DETAILS.RUST_COLOR,
        alpha: GRAVEYARD_DETAILS.GATE_RUST_ALPHA,
      });
    }

    // Gate bars
    for (let i = 0; i < GRAVEYARD_DETAILS.GATE_BAR_COUNT; i++) {
      this.graphics
        .moveTo(gateX + gateWidth + 10, gateY + 20 + i * 10)
        .lineTo(gateX + gateWidth + 18, gateY + 20 + i * 10)
        .stroke({ width: 2, color: GRAVEYARD_DETAILS.GATE_IRON_BORDER_COLOR });
    }

    // "RIP" sign above gate (heavily weathered)
    this.graphics
      .rect(
        gateX + 10,
        gateY - 15,
        GRAVEYARD_DETAILS.GATE_SIGN_WIDTH,
        GRAVEYARD_DETAILS.GATE_SIGN_HEIGHT
      )
      .fill(GRAVEYARD_DETAILS.GATE_SIGN_COLOR);
    this.graphics
      .rect(
        gateX + 10,
        gateY - 15,
        GRAVEYARD_DETAILS.GATE_SIGN_WIDTH,
        GRAVEYARD_DETAILS.GATE_SIGN_HEIGHT
      )
      .stroke({ width: 2, color: GRAVEYARD_DETAILS.GATE_SIGN_BORDER_COLOR });
    // Cracks in sign
    this.graphics
      .moveTo(gateX + 15, gateY - 15)
      .lineTo(gateX + 18, gateY - 3)
      .stroke({
        width: 1,
        color: GRAVEYARD_DETAILS.GATE_SIGN_CRACK_COLOR,
        alpha: GRAVEYARD_DETAILS.GATE_CRACK_ALPHA,
      });

    // Rusty chains hanging from gate
    this.renderChain(gateX - GRAVEYARD_DETAILS.GATE_PILLAR_WIDTH, gateY + 5, -5, -6);
    this.renderChain(gateX + gateWidth + GRAVEYARD_DETAILS.GATE_PILLAR_WIDTH, gateY + 5, 11, 9);
  }

  private renderSkull(x: number, y: number): void {
    // Skull
    this.graphics.circle(x, y, GRAVEYARD_DETAILS.SKULL_SIZE).fill(GRAVEYARD_DETAILS.SKULL_COLOR);
    this.graphics
      .circle(x, y, GRAVEYARD_DETAILS.SKULL_SIZE)
      .stroke({ width: 1, color: GRAVEYARD_DETAILS.SKULL_BORDER_COLOR });
    this.graphics.circle(x - 2, y - 1, 2).fill(GRAVEYARD_DETAILS.SKULL_EYE_COLOR); // Left eye
    this.graphics.circle(x + 2, y - 1, 2).fill(GRAVEYARD_DETAILS.SKULL_EYE_COLOR); // Right eye
    // Nose cavity
    this.graphics
      .moveTo(x, y + 1)
      .lineTo(x, y + 3)
      .stroke({ width: 1, color: GRAVEYARD_DETAILS.SKULL_EYE_COLOR });
    // Jaw
    this.graphics
      .moveTo(x - 2, y + 3)
      .lineTo(x + 2, y + 3)
      .stroke({ width: 1, color: GRAVEYARD_DETAILS.SKULL_EYE_COLOR });
  }

  private renderChain(
    startX: number,
    startY: number,
    midOffsetX: number,
    linkOffsetX: number
  ): void {
    this.graphics
      .moveTo(startX, startY)
      .lineTo(startX + midOffsetX, startY + 10)
      .lineTo(startX, startY + 20)
      .stroke({ width: 2, color: GRAVEYARD_DETAILS.CHAIN_COLOR });
    // Chain links
    for (let i = 0; i < GRAVEYARD_DETAILS.CHAIN_LINK_COUNT; i++) {
      this.graphics
        .circle(startX + linkOffsetX, startY + 5 + i * 8, 2)
        .stroke({ width: 1, color: GRAVEYARD_DETAILS.GATE_IRON_BORDER_COLOR });
    }
  }

  private renderGravestones(): void {
    // Gravestones (various types with better variety)
    const gravestones: Gravestone[] = [
      // Top row
      { x: 40, y: 280, type: 'cross', size: 12, tilt: 0.1 },
      { x: 70, y: 275, type: 'headstone', size: 14, tilt: -0.08 },
      { x: 100, y: 285, type: 'cross', size: 10, tilt: 0.15 },
      { x: 130, y: 280, type: 'headstone', size: 13, tilt: -0.12 },

      // Second row
      { x: 35, y: 320, type: 'headstone', size: 15, tilt: 0.2 },
      { x: 65, y: 315, type: 'cross', size: 11, tilt: -0.1 },
      { x: 95, y: 325, type: 'monument', size: 18, tilt: 0.05 },
      { x: 125, y: 320, type: 'headstone', size: 12, tilt: 0.18 },

      // Third row (middle - avoid gate area)
      { x: 40, y: 365, type: 'cross', size: 13, tilt: -0.15 },
      { x: 70, y: 370, type: 'headstone', size: 14, tilt: 0.1 },
      { x: 100, y: 360, type: 'cross', size: 10, tilt: -0.2 },

      // Fourth row
      { x: 35, y: 410, type: 'headstone', size: 16, tilt: 0.12 },
      { x: 65, y: 405, type: 'cross', size: 11, tilt: -0.08 },
      { x: 95, y: 415, type: 'headstone', size: 13, tilt: 0.25 },
      { x: 125, y: 410, type: 'cross', size: 12, tilt: -0.15 },

      // Bottom row
      { x: 45, y: 455, type: 'monument', size: 17, tilt: 0.08 },
      { x: 75, y: 450, type: 'headstone', size: 14, tilt: -0.1 },
      { x: 105, y: 460, type: 'cross', size: 10, tilt: 0.15 },
      { x: 135, y: 455, type: 'headstone', size: 13, tilt: -0.18 },

      // Last row
      { x: 50, y: 500, type: 'cross', size: 11, tilt: 0.2 },
      { x: 80, y: 495, type: 'headstone', size: 12, tilt: -0.12 },
      { x: 110, y: 505, type: 'cross', size: 10, tilt: 0.1 },
    ];

    for (const stone of gravestones) {
      this.renderGravestone(stone.x, stone.y, stone.type, stone.size, stone.tilt);
    }
  }

  private renderGravestone(x: number, y: number, type: string, size: number, tilt: number): void {
    const graphics = this.graphics;

    if (type === 'cross') {
      // Wooden cross - weathered and tilted
      const crossWidth = size * 0.6;
      const crossHeight = size;
      const beamThickness = size * 0.15;

      // Apply tilt transformation
      const cos = Math.cos(tilt);
      const sin = Math.sin(tilt);

      // Vertical beam
      const v1x = x + (-beamThickness / 2) * cos - 0 * sin;
      const v1y = y + (-beamThickness / 2) * sin + 0 * cos;
      const v2x = x + (beamThickness / 2) * cos - 0 * sin;
      const v2y = y + (beamThickness / 2) * sin + 0 * cos;
      const v3x = x + (beamThickness / 2) * cos - crossHeight * sin;
      const v3y = y + (beamThickness / 2) * sin + crossHeight * cos;
      const v4x = x + (-beamThickness / 2) * cos - crossHeight * sin;
      const v4y = y + (-beamThickness / 2) * sin + crossHeight * cos;

      graphics.moveTo(v1x, v1y).lineTo(v2x, v2y).lineTo(v3x, v3y).lineTo(v4x, v4y).lineTo(v1x, v1y);
      graphics.fill({ color: GRAVEYARD_DETAILS.CROSS_COLOR });
      graphics.moveTo(v1x, v1y).lineTo(v2x, v2y).lineTo(v3x, v3y).lineTo(v4x, v4y).lineTo(v1x, v1y);
      graphics.stroke({ width: 1, color: GRAVEYARD_DETAILS.CROSS_BORDER_COLOR });

      // Horizontal beam
      const hBeamY = crossHeight * 0.3;
      const h1x = x + (-crossWidth / 2) * cos - hBeamY * sin;
      const h1y = y + (-crossWidth / 2) * sin + hBeamY * cos;
      const h2x = x + (crossWidth / 2) * cos - hBeamY * sin;
      const h2y = y + (crossWidth / 2) * sin + hBeamY * cos;
      const h3x = x + (crossWidth / 2) * cos - (hBeamY + beamThickness) * sin;
      const h3y = y + (crossWidth / 2) * sin + (hBeamY + beamThickness) * cos;
      const h4x = x + (-crossWidth / 2) * cos - (hBeamY + beamThickness) * sin;
      const h4y = y + (-crossWidth / 2) * sin + (hBeamY + beamThickness) * cos;

      graphics.moveTo(h1x, h1y).lineTo(h2x, h2y).lineTo(h3x, h3y).lineTo(h4x, h4y).lineTo(h1x, h1y);
      graphics.fill({ color: GRAVEYARD_DETAILS.CROSS_COLOR });
      graphics.moveTo(h1x, h1y).lineTo(h2x, h2y).lineTo(h3x, h3y).lineTo(h4x, h4y).lineTo(h1x, h1y);
      graphics.stroke({ width: 1, color: GRAVEYARD_DETAILS.CROSS_BORDER_COLOR });

      // Shadow
      graphics.ellipse(x + 2, y + crossHeight + 2, size * 0.4, size * 0.2);
      graphics.fill({
        color: GRAVEYARD_DETAILS.SHADOW_COLOR,
        alpha: GRAVEYARD_DETAILS.SHADOW_ALPHA,
      });
    } else if (type === 'headstone') {
      this.renderHeadstone(x, y, size, tilt);
    } else if (type === 'monument') {
      this.renderMonument(x, y, size, tilt);
    }
  }

  private renderHeadstone(x: number, y: number, size: number, tilt: number): void {
    const graphics = this.graphics;
    // Stone headstone - rectangular with rounded top
    const width = size * 0.8;
    const height = size;

    // Apply tilt
    const cos = Math.cos(tilt);
    const sin = Math.sin(tilt);

    // Draw rounded rectangle (simplified)
    const points = [
      { x: -width / 2, y: height * 0.2 },
      { x: -width / 2, y: height },
      { x: width / 2, y: height },
      { x: width / 2, y: height * 0.2 },
    ];

    const transformedPoints = points.map(p => ({
      x: x + p.x * cos - p.y * sin,
      y: y + p.x * sin + p.y * cos,
    }));

    graphics.moveTo(transformedPoints[0].x, transformedPoints[0].y);
    for (let i = 1; i < transformedPoints.length; i++) {
      graphics.lineTo(transformedPoints[i].x, transformedPoints[i].y);
    }
    graphics.lineTo(transformedPoints[0].x, transformedPoints[0].y);
    graphics.fill({ color: GRAVEYARD_DETAILS.HEADSTONE_COLOR });

    graphics.moveTo(transformedPoints[0].x, transformedPoints[0].y);
    for (let i = 1; i < transformedPoints.length; i++) {
      graphics.lineTo(transformedPoints[i].x, transformedPoints[i].y);
    }
    graphics.lineTo(transformedPoints[0].x, transformedPoints[0].y);
    graphics.stroke({ width: 1, color: GRAVEYARD_DETAILS.HEADSTONE_BORDER_COLOR });

    // Rounded top
    const topCenterX = x + 0 * cos - height * 0.2 * sin;
    const topCenterY = y + 0 * sin + height * 0.2 * cos;
    graphics.arc(topCenterX, topCenterY, width / 2, Math.PI, 0);
    graphics.fill({ color: GRAVEYARD_DETAILS.HEADSTONE_COLOR });
    graphics.arc(topCenterX, topCenterY, width / 2, Math.PI, 0);
    graphics.stroke({ width: 1, color: GRAVEYARD_DETAILS.HEADSTONE_BORDER_COLOR });

    // Add crack
    const crackStartX = x + -width * 0.2 * cos - height * 0.4 * sin;
    const crackStartY = y + -width * 0.2 * sin + height * 0.4 * cos;
    const crackEndX = x + width * 0.1 * cos - height * 0.7 * sin;
    const crackEndY = y + width * 0.1 * sin + height * 0.7 * cos;
    graphics.moveTo(crackStartX, crackStartY).lineTo(crackEndX, crackEndY);
    graphics.stroke({
      width: 1,
      color: GRAVEYARD_DETAILS.HEADSTONE_CRACK_COLOR,
      alpha: GRAVEYARD_DETAILS.GATE_CRACK_ALPHA,
    });

    // Moss patches
    for (let i = 0; i < 2; i++) {
      const mossX = x + (Math.random() - 0.5) * width * 0.5 * cos - height * (0.5 + i * 0.2) * sin;
      const mossY = y + (Math.random() - 0.5) * width * 0.5 * sin + height * (0.5 + i * 0.2) * cos;
      graphics.circle(mossX, mossY, 2);
      graphics.fill({
        color: GRAVEYARD_DETAILS.GATE_MOSS_COLOR,
        alpha: GRAVEYARD_DETAILS.GATE_MOSS_ALPHA,
      });
    }

    // Shadow
    graphics.ellipse(x + 3, y + height + 2, width * 0.5, width * 0.25);
    graphics.fill({
      color: GRAVEYARD_DETAILS.SHADOW_COLOR,
      alpha: GRAVEYARD_DETAILS.SHADOW_ALPHA,
    });
  }

  private renderMonument(x: number, y: number, size: number, tilt: number): void {
    const graphics = this.graphics;
    // Larger stone monument
    const width = size * 0.9;
    const height = size * 1.2;

    // Apply tilt
    const cos = Math.cos(tilt);
    const sin = Math.sin(tilt);

    // Base
    const basePoints = [
      { x: -width / 2, y: height * 0.8 },
      { x: -width / 2, y: height },
      { x: width / 2, y: height },
      { x: width / 2, y: height * 0.8 },
    ];

    const transformedBase = basePoints.map(p => ({
      x: x + p.x * cos - p.y * sin,
      y: y + p.x * sin + p.y * cos,
    }));

    graphics.moveTo(transformedBase[0].x, transformedBase[0].y);
    for (let i = 1; i < transformedBase.length; i++) {
      graphics.lineTo(transformedBase[i].x, transformedBase[i].y);
    }
    graphics.lineTo(transformedBase[0].x, transformedBase[0].y);
    graphics.fill({ color: GRAVEYARD_DETAILS.MONUMENT_BASE_COLOR });
    graphics.stroke({ width: 1, color: GRAVEYARD_DETAILS.MONUMENT_BASE_BORDER_COLOR });

    // Main body
    const bodyPoints = [
      { x: -width * 0.4, y: height * 0.2 },
      { x: -width * 0.4, y: height * 0.8 },
      { x: width * 0.4, y: height * 0.8 },
      { x: width * 0.4, y: height * 0.2 },
    ];

    const transformedBody = bodyPoints.map(p => ({
      x: x + p.x * cos - p.y * sin,
      y: y + p.x * sin + p.y * cos,
    }));

    graphics.moveTo(transformedBody[0].x, transformedBody[0].y);
    for (let i = 1; i < transformedBody.length; i++) {
      graphics.lineTo(transformedBody[i].x, transformedBody[i].y);
    }
    graphics.lineTo(transformedBody[0].x, transformedBody[0].y);
    graphics.fill({ color: GRAVEYARD_DETAILS.HEADSTONE_COLOR });
    graphics.stroke({ width: 1, color: GRAVEYARD_DETAILS.HEADSTONE_BORDER_COLOR });

    // Top (pointed)
    const topPoints = [
      { x: -width * 0.4, y: height * 0.2 },
      { x: 0, y: 0 },
      { x: width * 0.4, y: height * 0.2 },
    ];

    const transformedTop = topPoints.map(p => ({
      x: x + p.x * cos - p.y * sin,
      y: y + p.x * sin + p.y * cos,
    }));

    graphics.moveTo(transformedTop[0].x, transformedTop[0].y);
    for (let i = 1; i < transformedTop.length; i++) {
      graphics.lineTo(transformedTop[i].x, transformedTop[i].y);
    }
    graphics.lineTo(transformedTop[0].x, transformedTop[0].y);
    graphics.fill({ color: GRAVEYARD_DETAILS.MONUMENT_BASE_COLOR });
    graphics.stroke({ width: 1, color: GRAVEYARD_DETAILS.MONUMENT_BASE_BORDER_COLOR });

    // Shadow
    graphics.ellipse(x + 4, y + height + 2, width * 0.6, width * 0.3);
    graphics.fill({
      color: GRAVEYARD_DETAILS.SHADOW_COLOR,
      alpha: GRAVEYARD_DETAILS.SHADOW_ALPHA,
    });
  }

  private renderDeadTrees(): void {
    // Dead trees in graveyard (multiple for atmosphere)
    this.renderDeadTree(this.graveyardX + 25, this.graveyardY + 180);
    this.renderDeadTree(this.graveyardX + 115, this.graveyardY + 220);
  }

  private renderDeadTree(x: number, y: number): void {
    // Trunk
    this.graphics.rect(x - 3, y, 6, 40).fill(GRAVEYARD_DETAILS.DEAD_TREE_TRUNK_COLOR);
    this.graphics.stroke({ width: 1, color: GRAVEYARD_DETAILS.DEAD_TREE_TRUNK_BORDER_COLOR });

    // Bare branches
    this.graphics
      .moveTo(x, y + 10)
      .lineTo(x - 15, y)
      .stroke({ width: 2, color: GRAVEYARD_DETAILS.DEAD_TREE_TRUNK_COLOR });
    this.graphics
      .moveTo(x, y + 15)
      .lineTo(x + 12, y + 5)
      .stroke({ width: 2, color: GRAVEYARD_DETAILS.DEAD_TREE_TRUNK_COLOR });
    this.graphics
      .moveTo(x, y + 25)
      .lineTo(x - 10, y + 18)
      .stroke({ width: 2, color: GRAVEYARD_DETAILS.DEAD_TREE_TRUNK_COLOR });
    this.graphics
      .moveTo(x, y + 30)
      .lineTo(x + 8, y + 25)
      .stroke({ width: 1, color: GRAVEYARD_DETAILS.DEAD_TREE_TRUNK_COLOR });

    // Broken branch on ground
    this.graphics
      .moveTo(x + 10, y + 45)
      .lineTo(x + 20, y + 48)
      .stroke({ width: 2, color: GRAVEYARD_DETAILS.DEAD_TREE_TRUNK_COLOR });
  }

  private renderEerieGlow(): void {
    // Add eerie green glow spots (supernatural effect) - static
    for (let i = 0; i < GRAVEYARD_DETAILS.GLOW_SPOT_COUNT; i++) {
      const glowX = this.graveyardX + Math.random() * this.graveyardWidth;
      const glowY = this.graveyardY + Math.random() * this.graveyardHeight;
      this.graphics
        .circle(
          glowX,
          glowY,
          GRAVEYARD_DETAILS.GLOW_MIN_SIZE +
            Math.random() * (GRAVEYARD_DETAILS.GLOW_MAX_SIZE - GRAVEYARD_DETAILS.GLOW_MIN_SIZE)
        )
        .fill({ color: GRAVEYARD_DETAILS.GLOW_COLOR, alpha: GRAVEYARD_DETAILS.GLOW_ALPHA });
    }
  }

  private renderOpenGraves(): void {
    // Open graves (where zombies emerge)
    this.renderOpenGrave(this.graveyardX + 70, this.graveyardY + 120);
    this.renderOpenGrave(this.graveyardX + 110, this.graveyardY + 160);
  }

  private renderOpenGrave(x: number, y: number): void {
    // Grave hole (dark opening)
    this.graphics.rect(x - 15, y, 30, 20).fill(GRAVEYARD_DETAILS.OPEN_GRAVE_HOLE_COLOR);
    this.graphics.stroke({ width: 2, color: GRAVEYARD_DETAILS.OPEN_GRAVE_BORDER_COLOR });

    // Dirt piles on sides
    this.graphics.circle(x - 20, y + 10, 8).fill(GRAVEYARD_DETAILS.OPEN_GRAVE_DIRT_COLOR);
    this.graphics.circle(x - 25, y + 15, 6).fill(GRAVEYARD_DETAILS.OPEN_GRAVE_DIRT_COLOR);
    this.graphics.circle(x + 20, y + 10, 8).fill(GRAVEYARD_DETAILS.OPEN_GRAVE_DIRT_COLOR);
    this.graphics.circle(x + 25, y + 15, 6).fill(GRAVEYARD_DETAILS.OPEN_GRAVE_DIRT_COLOR);

    // Broken coffin pieces
    this.graphics.rect(x - 10, y + 5, 8, 3).fill(GRAVEYARD_DETAILS.COFFIN_COLOR);
    this.graphics.rect(x + 5, y + 12, 6, 3).fill(GRAVEYARD_DETAILS.COFFIN_COLOR);

    // Skeletal hand reaching out
    this.graphics.circle(x - 5, y + 8, 2).fill(GRAVEYARD_DETAILS.BONES_COLOR); // Palm
    this.graphics.rect(x - 6, y + 6, 1, 4).fill(GRAVEYARD_DETAILS.BONES_COLOR); // Finger
    this.graphics.rect(x - 4, y + 5, 1, 5).fill(GRAVEYARD_DETAILS.BONES_COLOR); // Finger
    this.graphics.rect(x - 2, y + 6, 1, 4).fill(GRAVEYARD_DETAILS.BONES_COLOR); // Finger
  }
}
