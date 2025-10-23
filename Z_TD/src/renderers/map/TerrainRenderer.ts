import { Graphics } from 'pixi.js';
import { COLORS, GROUND_TEXTURE, UI_DIMENSIONS } from '../../config/visualConstants';
import { MapData } from '../../managers/MapManager';

/**
 * TerrainRenderer
 *
 * Responsible for rendering the ground terrain including:
 * - Base ground layer
 * - Dirt/mud patches
 * - Dead grass patches
 * - Barren dirt patches
 * - Rocks and debris
 * - Pebbles
 * - Ground cracks
 * - Weathering stains
 * - Grass tufts
 * - UI panel background
 */
export class TerrainRenderer {
  private graphics: Graphics;

  constructor(graphics: Graphics) {
    this.graphics = graphics;
  }

  public render(mapData: MapData): void {
    this.renderBaseLayer(mapData);
    this.renderDirtPatches(mapData);
    this.renderDeadGrassPatches(mapData);
    this.renderBarrenDirtPatches(mapData);
    this.renderRocksAndDebris(mapData);
    this.renderPebbles(mapData);
    this.renderGroundCracks(mapData);
    this.renderWeatheringStains(mapData);
    this.renderGrassTufts(mapData);
    this.renderUIPanel();
  }

  private renderBaseLayer(mapData: MapData): void {
    // Base layer - darker, more desolate ground
    this.graphics.rect(0, 0, mapData.width, mapData.height);
    this.graphics.fill({ color: COLORS.GROUND_BASE });
  }

  private renderDirtPatches(mapData: MapData): void {
    // Add varied dirt/mud patches for texture variation
    for (let i = 0; i < GROUND_TEXTURE.DIRT_PATCH_COUNT; i++) {
      const x = Math.random() * mapData.width;
      const y = Math.random() * mapData.height;
      const size =
        GROUND_TEXTURE.DIRT_PATCH_MIN_SIZE +
        Math.random() * (GROUND_TEXTURE.DIRT_PATCH_MAX_SIZE - GROUND_TEXTURE.DIRT_PATCH_MIN_SIZE);
      const points =
        GROUND_TEXTURE.DIRT_PATCH_MIN_POINTS +
        Math.floor(
          Math.random() *
            (GROUND_TEXTURE.DIRT_PATCH_MAX_POINTS - GROUND_TEXTURE.DIRT_PATCH_MIN_POINTS)
        );

      this.graphics.moveTo(x, y);
      for (let j = 0; j < points; j++) {
        const angle = (j / points) * Math.PI * 2;
        const radius =
          size *
          (GROUND_TEXTURE.DIRT_PATCH_MIN_RADIUS_FACTOR +
            Math.random() *
              (GROUND_TEXTURE.DIRT_PATCH_MAX_RADIUS_FACTOR -
                GROUND_TEXTURE.DIRT_PATCH_MIN_RADIUS_FACTOR));
        const px = x + Math.cos(angle) * radius;
        const py = y + Math.sin(angle) * radius;
        this.graphics.lineTo(px, py);
      }
      this.graphics.fill({
        color: COLORS.GROUND_DIRT_PATCH,
        alpha:
          GROUND_TEXTURE.DIRT_PATCH_MIN_ALPHA +
          Math.random() *
            (GROUND_TEXTURE.DIRT_PATCH_MAX_ALPHA - GROUND_TEXTURE.DIRT_PATCH_MIN_ALPHA),
      });
    }
  }

  private renderDeadGrassPatches(mapData: MapData): void {
    // Dead grass patches (lighter, sparse)
    for (let i = 0; i < GROUND_TEXTURE.DEAD_GRASS_COUNT; i++) {
      const x = Math.random() * mapData.width;
      const y = Math.random() * mapData.height;
      const size =
        GROUND_TEXTURE.DEAD_GRASS_MIN_SIZE +
        Math.random() *
          (GROUND_TEXTURE.DEAD_GRASS_MAX_SIZE - GROUND_TEXTURE.DEAD_GRASS_MIN_SIZE);
      const points =
        GROUND_TEXTURE.DEAD_GRASS_MIN_POINTS +
        Math.floor(
          Math.random() *
            (GROUND_TEXTURE.DEAD_GRASS_MAX_POINTS - GROUND_TEXTURE.DEAD_GRASS_MIN_POINTS)
        );

      this.graphics.moveTo(x, y);
      for (let j = 0; j < points; j++) {
        const angle = (j / points) * Math.PI * 2;
        const radius =
          size *
          (GROUND_TEXTURE.DEAD_GRASS_MIN_RADIUS_FACTOR +
            Math.random() *
              (GROUND_TEXTURE.DEAD_GRASS_MAX_RADIUS_FACTOR -
                GROUND_TEXTURE.DEAD_GRASS_MIN_RADIUS_FACTOR));
        const px = x + Math.cos(angle) * radius;
        const py = y + Math.sin(angle) * radius;
        this.graphics.lineTo(px, py);
      }
      this.graphics.fill({
        color: COLORS.GROUND_DEAD_GRASS,
        alpha:
          GROUND_TEXTURE.DEAD_GRASS_MIN_ALPHA +
          Math.random() *
            (GROUND_TEXTURE.DEAD_GRASS_MAX_ALPHA - GROUND_TEXTURE.DEAD_GRASS_MIN_ALPHA),
      });
    }
  }

  private renderBarrenDirtPatches(mapData: MapData): void {
    // Barren dirt patches (brown/tan)
    for (let i = 0; i < GROUND_TEXTURE.BARREN_DIRT_COUNT; i++) {
      const x = Math.random() * mapData.width;
      const y = Math.random() * mapData.height;
      const size =
        GROUND_TEXTURE.BARREN_DIRT_MIN_SIZE +
        Math.random() *
          (GROUND_TEXTURE.BARREN_DIRT_MAX_SIZE - GROUND_TEXTURE.BARREN_DIRT_MIN_SIZE);
      const points =
        GROUND_TEXTURE.BARREN_DIRT_MIN_POINTS +
        Math.floor(
          Math.random() *
            (GROUND_TEXTURE.BARREN_DIRT_MAX_POINTS - GROUND_TEXTURE.BARREN_DIRT_MIN_POINTS)
        );

      this.graphics.moveTo(x, y);
      for (let j = 0; j < points; j++) {
        const angle = (j / points) * Math.PI * 2 + Math.random() * 0.5;
        const radius =
          size *
          (GROUND_TEXTURE.BARREN_DIRT_MIN_RADIUS_FACTOR +
            Math.random() *
              (GROUND_TEXTURE.BARREN_DIRT_MAX_RADIUS_FACTOR -
                GROUND_TEXTURE.BARREN_DIRT_MIN_RADIUS_FACTOR));
        const px = x + Math.cos(angle) * radius;
        const py = y + Math.sin(angle) * radius;
        this.graphics.lineTo(px, py);
      }
      this.graphics.fill({
        color: COLORS.GROUND_BARREN_DIRT,
        alpha:
          GROUND_TEXTURE.BARREN_DIRT_MIN_ALPHA +
          Math.random() *
            (GROUND_TEXTURE.BARREN_DIRT_MAX_ALPHA - GROUND_TEXTURE.BARREN_DIRT_MIN_ALPHA),
      });
    }
  }

  private renderRocksAndDebris(mapData: MapData): void {
    // Scattered rocks and debris
    for (let i = 0; i < GROUND_TEXTURE.ROCK_COUNT; i++) {
      const x = Math.random() * mapData.width;
      const y = Math.random() * mapData.height;
      const size =
        GROUND_TEXTURE.ROCK_MIN_SIZE +
        Math.random() * (GROUND_TEXTURE.ROCK_MAX_SIZE - GROUND_TEXTURE.ROCK_MIN_SIZE);
      const points =
        GROUND_TEXTURE.ROCK_MIN_POINTS +
        Math.floor(
          Math.random() * (GROUND_TEXTURE.ROCK_MAX_POINTS - GROUND_TEXTURE.ROCK_MIN_POINTS)
        );

      this.graphics.moveTo(x, y);
      for (let j = 0; j < points; j++) {
        const angle = (j / points) * Math.PI * 2;
        const radius =
          size *
          (GROUND_TEXTURE.ROCK_MIN_RADIUS_FACTOR +
            Math.random() *
              (GROUND_TEXTURE.ROCK_MAX_RADIUS_FACTOR - GROUND_TEXTURE.ROCK_MIN_RADIUS_FACTOR));
        const px = x + Math.cos(angle) * radius;
        const py = y + Math.sin(angle) * radius;
        this.graphics.lineTo(px, py);
      }
      this.graphics.fill({
        color: COLORS.GROUND_ROCK,
        alpha:
          GROUND_TEXTURE.ROCK_MIN_ALPHA +
          Math.random() * (GROUND_TEXTURE.ROCK_MAX_ALPHA - GROUND_TEXTURE.ROCK_MIN_ALPHA),
      });
    }
  }

  private renderPebbles(mapData: MapData): void {
    // Small pebbles scattered around
    for (let i = 0; i < GROUND_TEXTURE.PEBBLE_COUNT; i++) {
      const x = Math.random() * mapData.width;
      const y = Math.random() * mapData.height;
      const size =
        GROUND_TEXTURE.PEBBLE_MIN_SIZE +
        Math.random() * (GROUND_TEXTURE.PEBBLE_MAX_SIZE - GROUND_TEXTURE.PEBBLE_MIN_SIZE);
      this.graphics.circle(x, y, size).fill({
        color: COLORS.GROUND_PEBBLE,
        alpha:
          GROUND_TEXTURE.PEBBLE_MIN_ALPHA +
          Math.random() * (GROUND_TEXTURE.PEBBLE_MAX_ALPHA - GROUND_TEXTURE.PEBBLE_MIN_ALPHA),
      });
    }
  }

  private renderGroundCracks(mapData: MapData): void {
    // Add organic ground cracks (branching) - more prominent
    for (let i = 0; i < GROUND_TEXTURE.CRACK_COUNT; i++) {
      const x = Math.random() * mapData.width;
      const y = Math.random() * mapData.height;
      const mainLength =
        GROUND_TEXTURE.CRACK_MIN_LENGTH +
        Math.random() * (GROUND_TEXTURE.CRACK_MAX_LENGTH - GROUND_TEXTURE.CRACK_MIN_LENGTH);
      const angle = Math.random() * Math.PI * 2;

      // Main crack
      let currentX = x;
      let currentY = y;
      const segments =
        GROUND_TEXTURE.CRACK_MIN_SEGMENTS +
        Math.floor(
          Math.random() * (GROUND_TEXTURE.CRACK_MAX_SEGMENTS - GROUND_TEXTURE.CRACK_MIN_SEGMENTS)
        );

      for (let j = 0; j < segments; j++) {
        const segmentLength = mainLength / segments;
        const segmentAngle =
          angle + (Math.random() - 0.5) * GROUND_TEXTURE.CRACK_ANGLE_VARIATION;
        const nextX = currentX + Math.cos(segmentAngle) * segmentLength;
        const nextY = currentY + Math.sin(segmentAngle) * segmentLength;

        // Main crack line (darker, thicker)
        this.graphics
          .moveTo(currentX, currentY)
          .lineTo(nextX, nextY)
          .stroke({
            width:
              GROUND_TEXTURE.CRACK_MIN_WIDTH +
              Math.random() * (GROUND_TEXTURE.CRACK_MAX_WIDTH - GROUND_TEXTURE.CRACK_MIN_WIDTH),
            color: COLORS.GROUND_CRACK,
            alpha: GROUND_TEXTURE.CRACK_ALPHA,
          });

        // Add small branch cracks
        if (Math.random() > GROUND_TEXTURE.CRACK_BRANCH_PROBABILITY) {
          const branchAngle = segmentAngle + (Math.random() - 0.5) * Math.PI;
          const branchLength =
            segmentLength *
            (GROUND_TEXTURE.CRACK_BRANCH_MIN_LENGTH_FACTOR +
              Math.random() *
                (GROUND_TEXTURE.CRACK_BRANCH_MAX_LENGTH_FACTOR -
                  GROUND_TEXTURE.CRACK_BRANCH_MIN_LENGTH_FACTOR));
          const branchX = currentX + Math.cos(branchAngle) * branchLength;
          const branchY = currentY + Math.sin(branchAngle) * branchLength;
          this.graphics
            .moveTo(currentX, currentY)
            .lineTo(branchX, branchY)
            .stroke({
              width: GROUND_TEXTURE.CRACK_BRANCH_WIDTH,
              color: COLORS.GROUND_CRACK,
              alpha: GROUND_TEXTURE.CRACK_BRANCH_ALPHA,
            });
        }

        currentX = nextX;
        currentY = nextY;
      }
    }
  }

  private renderWeatheringStains(mapData: MapData): void {
    // Add weathering stains and discoloration
    for (let i = 0; i < GROUND_TEXTURE.STAIN_COUNT; i++) {
      const x = Math.random() * mapData.width;
      const y = Math.random() * mapData.height;
      const size =
        GROUND_TEXTURE.STAIN_MIN_SIZE +
        Math.random() * (GROUND_TEXTURE.STAIN_MAX_SIZE - GROUND_TEXTURE.STAIN_MIN_SIZE);
      this.graphics.circle(x, y, size).fill({
        color: COLORS.GROUND_STAIN,
        alpha:
          GROUND_TEXTURE.STAIN_MIN_ALPHA +
          Math.random() * (GROUND_TEXTURE.STAIN_MAX_ALPHA - GROUND_TEXTURE.STAIN_MIN_ALPHA),
      });
    }
  }

  private renderGrassTufts(mapData: MapData): void {
    // Add subtle grass tufts (small details)
    for (let i = 0; i < GROUND_TEXTURE.GRASS_TUFT_COUNT; i++) {
      const x = Math.random() * mapData.width;
      const y = Math.random() * mapData.height;
      const size =
        GROUND_TEXTURE.GRASS_TUFT_MIN_SIZE +
        Math.random() *
          (GROUND_TEXTURE.GRASS_TUFT_MAX_SIZE - GROUND_TEXTURE.GRASS_TUFT_MIN_SIZE);
      // Small irregular shapes for grass
      const points =
        GROUND_TEXTURE.GRASS_TUFT_MIN_POINTS +
        Math.floor(
          Math.random() *
            (GROUND_TEXTURE.GRASS_TUFT_MAX_POINTS - GROUND_TEXTURE.GRASS_TUFT_MIN_POINTS)
        );
      this.graphics.moveTo(x, y);
      for (let j = 0; j < points; j++) {
        const angle = (j / points) * Math.PI * 2;
        const radius =
          size *
          (GROUND_TEXTURE.GRASS_TUFT_MIN_RADIUS_FACTOR +
            Math.random() *
              (GROUND_TEXTURE.GRASS_TUFT_MAX_RADIUS_FACTOR -
                GROUND_TEXTURE.GRASS_TUFT_MIN_RADIUS_FACTOR));
        this.graphics.lineTo(x + Math.cos(angle) * radius, y + Math.sin(angle) * radius);
      }
      this.graphics.fill({
        color: COLORS.GROUND_GRASS_TUFT,
        alpha:
          GROUND_TEXTURE.GRASS_TUFT_MIN_ALPHA +
          Math.random() *
            (GROUND_TEXTURE.GRASS_TUFT_MAX_ALPHA - GROUND_TEXTURE.GRASS_TUFT_MIN_ALPHA),
      });
    }
  }

  private renderUIPanel(): void {
    // Draw UI panel background on the right
    this.graphics.rect(
      UI_DIMENSIONS.PLAY_AREA_WIDTH,
      0,
      UI_DIMENSIONS.PANEL_WIDTH,
      UI_DIMENSIONS.HEIGHT
    );
    this.graphics.fill({ color: COLORS.UI_PANEL_BG });

    // Draw separator line between play area and UI
    this.graphics.rect(
      UI_DIMENSIONS.PLAY_AREA_WIDTH,
      0,
      UI_DIMENSIONS.SEPARATOR_WIDTH,
      UI_DIMENSIONS.HEIGHT
    );
    this.graphics.fill({ color: COLORS.UI_SEPARATOR });
  }
}

