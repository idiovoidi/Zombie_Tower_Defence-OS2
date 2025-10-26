import { Graphics } from 'pixi.js';
import { MapData } from '../../managers/MapManager';
import { Waypoint } from '../../managers/PathfindingManager';

/**
 * StructureRenderer handles all structure rendering including:
 * - Destroyed houses
 * - Trees (dead and pine)
 * - Decorative elements (bushes, rocks, stumps, grass, bones)
 */
export class StructureRenderer {
  private mapContainer: Graphics;

  constructor(mapContainer: Graphics) {
    this.mapContainer = mapContainer;
  }

  /**
   * Render all structures on the map
   */
  public render(mapData: MapData): void {
    this.renderDestroyedHouses();
    this.renderCornerTrees(mapData);
    this.renderDecorativeElements(mapData);
  }

  /**
   * Render destroyed houses at the top of the map
   */
  private renderDestroyedHouses(): void {
    const houses = [
      { x: 120, y: 20, width: 75, height: 65, destroyed: 0.8, style: 'cottage' },
      { x: 280, y: 45, width: 85, height: 70, destroyed: 0.6, style: 'townhouse' },
      { x: 480, y: 15, width: 70, height: 60, destroyed: 0.9, style: 'cottage' },
      { x: 650, y: 35, width: 80, height: 68, destroyed: 0.7, style: 'farmhouse' },
      { x: 950, y: 50, width: 72, height: 62, destroyed: 0.75, style: 'cottage' },
    ];

    for (const house of houses) {
      this.renderDestroyedHouse(
        house.x,
        house.y,
        house.width,
        house.height,
        house.destroyed,
        house.style as 'cottage' | 'townhouse' | 'farmhouse'
      );
    }
  }

  /**
   * Render a single destroyed house with architectural style
   */
  private renderDestroyedHouse(
    x: number,
    y: number,
    width: number,
    height: number,
    destroyedLevel: number,
    style: 'cottage' | 'townhouse' | 'farmhouse' = 'cottage'
  ): void {
    const wallHeight = height * (1 - destroyedLevel * 0.4);
    const wallThickness = 5;

    // Foundation/base - more prominent
    const foundationHeight = 6;
    this.mapContainer.rect(x - 2, y + height, width + 4, foundationHeight).fill(0x5a5a5a);
    this.mapContainer.stroke({ width: 1, color: 0x3a3a3a });

    // Foundation cracks
    for (let i = 0; i < 2; i++) {
      const crackX = x + width * (0.3 + i * 0.4);
      this.mapContainer
        .moveTo(crackX, y + height)
        .lineTo(crackX + (Math.random() - 0.5) * 4, y + height + foundationHeight)
        .stroke({ width: 1, color: 0x2a2a2a, alpha: 0.5 });
    }

    // Back wall (solid, darkest for depth) - consistent color
    const backWallColor = style === 'townhouse' ? 0x7a6a5a : 0x6b5d4f;
    this.mapContainer.rect(x, y + height - wallHeight, width, wallHeight).fill(backWallColor);
    this.mapContainer.stroke({ width: 2, color: 0x4a3a2a });

    // Side walls - consistent thickness and color
    const sideWallColor = 0x8b7355;

    // Left wall (damaged, jagged top)
    if (destroyedLevel < 0.85) {
      const leftWallHeight = wallHeight * (1 - destroyedLevel * 0.25);
      this.mapContainer
        .rect(x, y + height - leftWallHeight, wallThickness, leftWallHeight)
        .fill(sideWallColor);
      this.mapContainer.stroke({ width: 1, color: 0x654321 });

      // Jagged damage at top
      if (destroyedLevel > 0.6) {
        for (let i = 0; i < 3; i++) {
          const jagX = x + Math.random() * wallThickness;
          const jagY = y + height - leftWallHeight + Math.random() * 8;
          const jagSize = 2 + Math.random() * 3;
          this.mapContainer.rect(jagX, jagY, jagSize, jagSize).fill(0x6a5a4a);
        }
      }
    }

    // Right wall (more damaged, jagged top)
    if (destroyedLevel < 0.75) {
      const rightWallHeight = wallHeight * (1 - destroyedLevel * 0.4);
      this.mapContainer
        .rect(
          x + width - wallThickness,
          y + height - rightWallHeight,
          wallThickness,
          rightWallHeight
        )
        .fill(sideWallColor);
      this.mapContainer.stroke({ width: 1, color: 0x654321 });

      // Jagged damage at top
      if (destroyedLevel > 0.5) {
        for (let i = 0; i < 4; i++) {
          const jagX = x + width - wallThickness + Math.random() * wallThickness;
          const jagY = y + height - rightWallHeight + Math.random() * 10;
          const jagSize = 2 + Math.random() * 3;
          this.mapContainer.rect(jagX, jagY, jagSize, jagSize).fill(0x6a5a4a);
        }
      }
    }

    // Front wall sections (with gaps) - consistent color
    const frontWallHeight = wallHeight * 0.88;
    const frontWallColor = 0xa0826d;

    if (destroyedLevel < 0.8) {
      // Left section with brick texture
      const leftSectionWidth = width * 0.32;
      this.mapContainer
        .rect(x + wallThickness, y + height - frontWallHeight, leftSectionWidth, frontWallHeight)
        .fill(frontWallColor);
      this.mapContainer.stroke({ width: 1, color: 0x654321 });

      // Add brick lines for texture
      if (style === 'townhouse' || style === 'farmhouse') {
        for (let i = 0; i < 4; i++) {
          const brickY = y + height - frontWallHeight + (i * frontWallHeight) / 4;
          this.mapContainer
            .moveTo(x + wallThickness, brickY)
            .lineTo(x + wallThickness + leftSectionWidth, brickY)
            .stroke({ width: 1, color: 0x8a7a6a, alpha: 0.4 });
        }
      }

      // Right section with brick texture
      const rightSectionStart = x + width * 0.63;
      const rightSectionWidth = width * 0.37 - wallThickness;
      this.mapContainer
        .rect(rightSectionStart, y + height - frontWallHeight, rightSectionWidth, frontWallHeight)
        .fill(frontWallColor);
      this.mapContainer.stroke({ width: 1, color: 0x654321 });

      // Add brick lines for texture
      if (style === 'townhouse' || style === 'farmhouse') {
        for (let i = 0; i < 4; i++) {
          const brickY = y + height - frontWallHeight + (i * frontWallHeight) / 4;
          this.mapContainer
            .moveTo(rightSectionStart, brickY)
            .lineTo(rightSectionStart + rightSectionWidth, brickY)
            .stroke({ width: 1, color: 0x8a7a6a, alpha: 0.4 });
        }
      }
    }

    // Collapsed roof - more realistic structure
    if (destroyedLevel < 0.9) {
      const roofColor = style === 'farmhouse' ? 0x7a4a3a : 0x8b4513;
      const roofPeakHeight = style === 'townhouse' ? 15 : 12;

      // Main roof section (collapsed/sagging)
      this.mapContainer
        .moveTo(x + wallThickness, y + height - wallHeight)
        .lineTo(x + width * 0.35, y + height - wallHeight - roofPeakHeight)
        .lineTo(x + width * 0.65, y + height - wallHeight - roofPeakHeight * 0.6)
        .lineTo(x + width * 0.85, y + height - wallHeight + 6)
        .lineTo(x + width - wallThickness, y + height - wallHeight * 0.5)
        .lineTo(x + wallThickness, y + height - wallHeight)
        .fill({ color: roofColor, alpha: 0.9 });
      this.mapContainer.stroke({ width: 2, color: 0x654321 });

      // Roof damage holes
      if (destroyedLevel > 0.7) {
        const holeX = x + width * 0.55;
        const holeY = y + height - wallHeight - roofPeakHeight * 0.4;
        this.mapContainer
          .moveTo(holeX, holeY)
          .lineTo(holeX + 8, holeY + 3)
          .lineTo(holeX + 6, holeY + 8)
          .lineTo(holeX - 2, holeY + 6)
          .lineTo(holeX, holeY)
          .fill({ color: 0x2a2a2a, alpha: 0.6 });
      }

      // Roof texture lines
      for (let i = 0; i < 3; i++) {
        const lineY = y + height - wallHeight - roofPeakHeight * 0.8 + i * 4;
        this.mapContainer
          .moveTo(x + width * 0.35, lineY)
          .lineTo(x + width * 0.75, lineY + 2)
          .stroke({ width: 1, color: 0x6a3a2a, alpha: 0.5 });
      }
    }

    // Windows - more detailed and consistent
    if (destroyedLevel < 0.75) {
      const windowWidth = 16;
      const windowHeight = 20;

      // Left window
      const window1X = x + width * 0.18;
      const window1Y = y + height - frontWallHeight * 0.65;

      // Window frame
      this.mapContainer
        .rect(window1X - 2, window1Y - 2, windowWidth + 4, windowHeight + 4)
        .fill(0x654321);

      // Window opening (dark)
      this.mapContainer.rect(window1X, window1Y, windowWidth, windowHeight).fill(0x1a1a1a);

      // Broken glass shards
      this.mapContainer
        .moveTo(window1X, window1Y)
        .lineTo(window1X + windowWidth, window1Y + windowHeight)
        .stroke({ width: 1, color: 0x4a4a4a, alpha: 0.6 });
      this.mapContainer
        .moveTo(window1X + windowWidth, window1Y)
        .lineTo(window1X, window1Y + windowHeight)
        .stroke({ width: 1, color: 0x4a4a4a, alpha: 0.6 });

      // Window divider (cross)
      this.mapContainer
        .moveTo(window1X + windowWidth / 2, window1Y)
        .lineTo(window1X + windowWidth / 2, window1Y + windowHeight)
        .stroke({ width: 2, color: 0x654321 });
      this.mapContainer
        .moveTo(window1X, window1Y + windowHeight / 2)
        .lineTo(window1X + windowWidth, window1Y + windowHeight / 2)
        .stroke({ width: 2, color: 0x654321 });

      // Right window (if less destroyed)
      if (destroyedLevel < 0.7 && style !== 'cottage') {
        const window2X = x + width * 0.72;
        const window2Y = y + height - frontWallHeight * 0.65;

        // Window frame
        this.mapContainer
          .rect(window2X - 2, window2Y - 2, windowWidth + 4, windowHeight + 4)
          .fill(0x654321);

        // Window opening
        this.mapContainer.rect(window2X, window2Y, windowWidth, windowHeight).fill(0x1a1a1a);

        // Broken glass
        this.mapContainer
          .moveTo(window2X, window2Y + windowHeight)
          .lineTo(window2X + windowWidth, window2Y)
          .stroke({ width: 1, color: 0x4a4a4a, alpha: 0.6 });
      }
    }

    // Door - more detailed and realistic
    if (destroyedLevel < 0.8) {
      const doorX = x + width * 0.44;
      const doorY = y + height - frontWallHeight * 0.85;
      const doorWidth = 20;
      const doorHeight = frontWallHeight * 0.75;

      // Door frame (thicker, more prominent)
      this.mapContainer.rect(doorX - 3, doorY - 2, doorWidth + 6, doorHeight + 2).fill(0x4a3a2a);
      this.mapContainer.stroke({ width: 1, color: 0x3a2a1a });

      // Door (hanging off hinges, tilted)
      const tiltOffset = destroyedLevel > 0.7 ? 6 : 3;
      this.mapContainer
        .moveTo(doorX, doorY)
        .lineTo(doorX + doorWidth, doorY + tiltOffset)
        .lineTo(doorX + doorWidth - 4, doorY + doorHeight)
        .lineTo(doorX - 4, doorY + doorHeight - tiltOffset)
        .lineTo(doorX, doorY)
        .fill(0x654321);
      this.mapContainer.stroke({ width: 2, color: 0x4a3a2a });

      // Door panels (vertical planks)
      for (let i = 1; i < 3; i++) {
        const plankX = doorX + (i * doorWidth) / 3;
        this.mapContainer
          .moveTo(plankX, doorY)
          .lineTo(plankX + (i * tiltOffset) / 3, doorY + doorHeight - tiltOffset)
          .stroke({ width: 1, color: 0x5a4a3a, alpha: 0.6 });
      }

      // Door handle (broken)
      if (destroyedLevel < 0.75) {
        const handleX = doorX + doorWidth * 0.8;
        const handleY = doorY + doorHeight * 0.5;
        this.mapContainer.circle(handleX, handleY, 2).fill(0x3a3a3a);
      }
    }

    // Rubble - more varied and realistic
    const rubbleCount = Math.floor(10 + destroyedLevel * 18);
    const rubbleColors = [0x696969, 0x7a6a5a, 0x8b7355, 0x5a5a5a];

    for (let i = 0; i < rubbleCount; i++) {
      const rx = x - 5 + Math.random() * (width + 10);
      const ry = y + height + 6 + Math.random() * 15;
      const size = 3 + Math.random() * 7;

      // Irregular rubble shapes
      const points = 3 + Math.floor(Math.random() * 4);
      const rubblePath: number[] = [];
      for (let j = 0; j < points; j++) {
        const angle = (j / points) * Math.PI * 2 + Math.random() * 0.3;
        const radius = size * (0.6 + Math.random() * 0.6);
        rubblePath.push(rx + Math.cos(angle) * radius);
        rubblePath.push(ry + Math.sin(angle) * radius);
      }

      const rubbleColor = rubbleColors[Math.floor(Math.random() * rubbleColors.length)];
      this.mapContainer.poly(rubblePath).fill(rubbleColor);

      // Add shadow to rubble
      if (size > 5) {
        this.mapContainer
          .ellipse(rx + 1, ry + size * 0.5, size * 0.8, size * 0.4)
          .fill({ color: 0x1a1a1a, alpha: 0.3 });
      }
    }

    // Larger debris pieces
    if (destroyedLevel > 0.7) {
      for (let i = 0; i < 3; i++) {
        const debrisX = x + width * (0.2 + i * 0.3);
        const debrisY = y + height + 8;
        const debrisW = 8 + Math.random() * 6;
        const debrisH = 4 + Math.random() * 4;

        // Broken wall piece
        this.mapContainer.rect(debrisX, debrisY, debrisW, debrisH).fill(frontWallColor);
        this.mapContainer.stroke({ width: 1, color: 0x654321 });
      }
    }

    // Burn marks - more realistic scorch patterns
    if (destroyedLevel > 0.6) {
      // Main burn area (left side)
      const burnX1 = x + width * 0.25;
      const burnY1 = y + height - wallHeight * 0.6;

      // Large scorch mark
      for (let i = 0; i < 6; i++) {
        const offsetX = (Math.random() - 0.5) * 15;
        const offsetY = (Math.random() - 0.5) * 15;
        const burnSize = 10 + Math.random() * 10;
        this.mapContainer
          .ellipse(burnX1 + offsetX, burnY1 + offsetY, burnSize * 0.8, burnSize * 0.6)
          .fill({ color: 0x1a1a1a, alpha: 0.35 - i * 0.03 });
      }

      // Secondary burn area (right side, smaller)
      if (destroyedLevel > 0.7) {
        const burnX2 = x + width * 0.75;
        const burnY2 = y + height - wallHeight * 0.4;

        for (let i = 0; i < 4; i++) {
          const offsetX = (Math.random() - 0.5) * 12;
          const offsetY = (Math.random() - 0.5) * 12;
          const burnSize = 7 + Math.random() * 7;
          this.mapContainer
            .ellipse(burnX2 + offsetX, burnY2 + offsetY, burnSize * 0.7, burnSize * 0.5)
            .fill({ color: 0x1a1a1a, alpha: 0.3 - i * 0.04 });
        }
      }

      // Soot streaks running down walls
      for (let i = 0; i < 3; i++) {
        const streakX = x + width * (0.2 + Math.random() * 0.6);
        const streakY = y + height - wallHeight * (0.4 + Math.random() * 0.3);
        const streakLength = 15 + Math.random() * 10;

        this.mapContainer
          .moveTo(streakX, streakY)
          .lineTo(streakX + (Math.random() - 0.5) * 3, streakY + streakLength)
          .stroke({ width: 2 + Math.random() * 2, color: 0x2a2a2a, alpha: 0.4 });
      }
    }

    // Smoke - rising from heavily damaged houses
    if (destroyedLevel > 0.75) {
      const smokeX = x + width * 0.5;
      const smokeBaseY = y + height - wallHeight - 10;

      for (let i = 0; i < 5; i++) {
        const sx = smokeX + (Math.random() - 0.5) * 20;
        const sy = smokeBaseY - i * 12;
        const smokeSize = 5 + i * 1.2;
        const drift = Math.sin(i * 0.5) * 8;

        this.mapContainer
          .ellipse(sx + drift, sy, smokeSize * 1.3, smokeSize * 0.9)
          .fill({ color: 0x808080, alpha: 0.4 - i * 0.07 });
      }
    }

    // Add cracks in walls
    if (destroyedLevel > 0.5) {
      // Vertical cracks
      for (let i = 0; i < 3; i++) {
        const crackX = x + width * (0.2 + i * 0.3);
        const crackY = y + height - wallHeight;
        this.mapContainer
          .moveTo(crackX, crackY)
          .lineTo(crackX + (Math.random() - 0.5) * 8, crackY + wallHeight * 0.6)
          .stroke({ width: 2, color: 0x2a2a2a, alpha: 0.6 });
      }
    }

    // Add bullet holes / impact marks - use small rectangles
    if (destroyedLevel > 0.6) {
      for (let i = 0; i < 5; i++) {
        const holeX = x + Math.random() * width;
        const holeY = y + height - wallHeight * Math.random();
        const holeSize = 2 + Math.random() * 2;
        // Small dark rectangles for bullet impacts
        this.mapContainer
          .rect(holeX - holeSize / 2, holeY - holeSize / 2, holeSize, holeSize)
          .fill({ color: 0x1a1a1a, alpha: 0.7 });
        // Add small cracks around impact
        for (let j = 0; j < 3; j++) {
          const angle = (j / 3) * Math.PI * 2 + Math.random();
          const crackLength = 3 + Math.random() * 3;
          this.mapContainer
            .moveTo(holeX, holeY)
            .lineTo(holeX + Math.cos(angle) * crackLength, holeY + Math.sin(angle) * crackLength)
            .stroke({ width: 1, color: 0x2a2a2a, alpha: 0.5 });
        }
      }
    }
  }

  /**
   * Render trees around the corners of the map
   */
  private renderCornerTrees(mapData: MapData): void {
    // Top-left corner trees
    this.renderTree(80, 80, 35, 'dead');
    this.renderTree(120, 60, 28, 'dead');
    this.renderTree(50, 120, 32, 'dead');

    // Top-right corner trees
    this.renderTree(mapData.width - 80, 80, 38, 'pine');
    this.renderTree(mapData.width - 120, 50, 30, 'pine');
    this.renderTree(mapData.width - 50, 110, 35, 'dead');

    // Bottom-left corner trees
    this.renderTree(70, mapData.height - 80, 40, 'dead');
    this.renderTree(110, mapData.height - 60, 32, 'pine');
    this.renderTree(40, mapData.height - 120, 36, 'dead');

    // Bottom-right corner trees
    this.renderTree(mapData.width - 90, mapData.height - 70, 42, 'pine');
    this.renderTree(mapData.width - 60, mapData.height - 110, 35, 'dead');
    this.renderTree(mapData.width - 130, mapData.height - 90, 38, 'pine');
  }

  /**
   * Render a single tree (dead or pine)
   */
  private renderTree(x: number, y: number, height: number, type: 'dead' | 'pine'): void {
    if (type === 'dead') {
      // Dead/bare tree
      const trunkWidth = height * 0.15;
      const trunkHeight = height * 0.6;

      // Trunk
      this.mapContainer.rect(x - trunkWidth / 2, y, trunkWidth, trunkHeight).fill(0x4a3a2a);
      this.mapContainer
        .rect(x - trunkWidth / 2, y, trunkWidth, trunkHeight)
        .stroke({ width: 1, color: 0x2a1a1a });

      // Bark texture
      for (let i = 0; i < 4; i++) {
        const barkY = y + (i / 4) * trunkHeight;
        this.mapContainer
          .moveTo(x - trunkWidth / 2, barkY)
          .lineTo(x + trunkWidth / 2, barkY)
          .stroke({ width: 1, color: 0x3a2a1a, alpha: 0.5 });
      }

      // Bare branches
      const branchCount = 5 + Math.floor(Math.random() * 3);
      for (let i = 0; i < branchCount; i++) {
        const branchY = y + trunkHeight * (0.2 + (i / branchCount) * 0.6);
        const branchLength = height * (0.3 + Math.random() * 0.2);
        const branchAngle = (Math.random() - 0.5) * 0.8;
        const side = i % 2 === 0 ? 1 : -1;

        const endX = x + side * Math.cos(branchAngle) * branchLength;
        const endY = branchY - Math.sin(Math.abs(branchAngle)) * branchLength * 0.5;

        this.mapContainer
          .moveTo(x, branchY)
          .lineTo(endX, endY)
          .stroke({ width: 2 + Math.random(), color: 0x4a3a2a });

        // Small twigs
        if (Math.random() > 0.5) {
          const twigLength = branchLength * 0.3;
          const twigAngle = branchAngle + (Math.random() - 0.5) * 0.5;
          const twigEndX = endX + Math.cos(twigAngle) * twigLength;
          const twigEndY = endY - Math.sin(Math.abs(twigAngle)) * twigLength * 0.5;
          this.mapContainer
            .moveTo(endX, endY)
            .lineTo(twigEndX, twigEndY)
            .stroke({ width: 1, color: 0x4a3a2a, alpha: 0.8 });
        }
      }

      // Shadow
      this.mapContainer
        .ellipse(x, y + trunkHeight, trunkWidth * 1.5, trunkWidth * 0.8)
        .fill({ color: 0x1a1a1a, alpha: 0.3 });
    } else {
      // Pine/evergreen tree
      const trunkWidth = height * 0.12;
      const trunkHeight = height * 0.4;

      // Trunk
      this.mapContainer.rect(x - trunkWidth / 2, y, trunkWidth, trunkHeight).fill(0x5a4a3a);
      this.mapContainer
        .rect(x - trunkWidth / 2, y, trunkWidth, trunkHeight)
        .stroke({ width: 1, color: 0x3a2a1a });

      // Pine foliage (triangular layers)
      const foliageLayers = 4;
      for (let i = 0; i < foliageLayers; i++) {
        const layerY = y - height * 0.15 - i * height * 0.15;
        const layerWidth = height * (0.6 - i * 0.1);
        const layerHeight = height * 0.2;

        // Triangle for pine layer
        this.mapContainer
          .moveTo(x, layerY)
          .lineTo(x - layerWidth / 2, layerY + layerHeight)
          .lineTo(x + layerWidth / 2, layerY + layerHeight)
          .lineTo(x, layerY)
          .fill({ color: 0x2a4a2a, alpha: 0.9 });

        // Darker outline
        this.mapContainer
          .moveTo(x, layerY)
          .lineTo(x - layerWidth / 2, layerY + layerHeight)
          .lineTo(x + layerWidth / 2, layerY + layerHeight)
          .lineTo(x, layerY)
          .stroke({ width: 1, color: 0x1a3a1a });

        // Texture details
        for (let j = 0; j < 3; j++) {
          const detailX = x + (Math.random() - 0.5) * layerWidth * 0.6;
          const detailY = layerY + layerHeight * (0.3 + Math.random() * 0.5);
          this.mapContainer.circle(detailX, detailY, 2).fill({ color: 0x1a3a1a, alpha: 0.6 });
        }
      }

      // Shadow
      this.mapContainer
        .ellipse(x, y + trunkHeight, height * 0.4, height * 0.15)
        .fill({ color: 0x1a1a1a, alpha: 0.3 });
    }
  }

  /**
   * Render decorative elements (bushes, rocks, stumps, grass, bones)
   */
  private renderDecorativeElements(mapData: MapData): void {
    // Add apocalyptic decorative elements with organic shapes
    for (let i = 0; i < 25; i++) {
      const x = Math.random() * mapData.width;
      const y = Math.random() * mapData.height;

      // Only place decorations away from the path and not at the top (where houses are)
      if (y > 150 && this.isAwayFromPath(x, y, mapData.waypoints)) {
        const decorType = Math.random();

        if (decorType < 0.3) {
          // Dead bushes/shrubs (organic blob shapes)
          const size = 10 + Math.random() * 15;
          const points = 6 + Math.floor(Math.random() * 4);

          this.mapContainer.moveTo(x, y);
          for (let j = 0; j < points; j++) {
            const angle = (j / points) * Math.PI * 2;
            const radius = size * (0.6 + Math.random() * 0.6);
            const px = x + Math.cos(angle) * radius;
            const py = y + Math.sin(angle) * radius;
            this.mapContainer.lineTo(px, py);
          }
          this.mapContainer.fill({ color: 0x4a3a2a, alpha: 0.7 });
        } else if (decorType < 0.5) {
          // Rocks/debris (irregular polygons)
          const size = 8 + Math.random() * 12;
          const points = 4 + Math.floor(Math.random() * 3);

          this.mapContainer.moveTo(x, y);
          for (let j = 0; j < points; j++) {
            const angle = (j / points) * Math.PI * 2 + Math.random() * 0.3;
            const radius = size * (0.7 + Math.random() * 0.5);
            const px = x + Math.cos(angle) * radius;
            const py = y + Math.sin(angle) * radius;
            this.mapContainer.lineTo(px, py);
          }
          this.mapContainer.fill(0x6a6a6a);
          this.mapContainer.stroke({ width: 1, color: 0x4a4a4a });
        } else if (decorType < 0.7) {
          // Dead tree stumps (organic trunk shape)
          const width = 5 + Math.random() * 4;
          const height = 10 + Math.random() * 8;

          // Irregular trunk
          this.mapContainer
            .moveTo(x - width / 2, y + height)
            .lineTo(x - width / 2 - 1, y + height * 0.6)
            .lineTo(x - width / 2, y + height * 0.3)
            .lineTo(x, y)
            .lineTo(x + width / 2, y + height * 0.3)
            .lineTo(x + width / 2 + 1, y + height * 0.6)
            .lineTo(x + width / 2, y + height)
            .fill(0x5a4a3a);

          // Broken branch
          this.mapContainer
            .moveTo(x, y + height * 0.4)
            .lineTo(x - 10, y + height * 0.3)
            .stroke({ width: 2, color: 0x5a4a3a });
        } else {
          // Withered grass patches (organic clumps)
          const size = 12 + Math.random() * 18;
          const points = 8 + Math.floor(Math.random() * 5);

          this.mapContainer.moveTo(x, y);
          for (let j = 0; j < points; j++) {
            const angle = (j / points) * Math.PI * 2;
            const radius = size * (0.5 + Math.random() * 0.7);
            const px = x + Math.cos(angle) * radius;
            const py = y + Math.sin(angle) * radius;
            this.mapContainer.lineTo(px, py);
          }
          this.mapContainer.fill({ color: 0x3a4a2a, alpha: 0.6 });
        }
      }
    }

    // Add some scattered bones/skulls for extra apocalyptic feel
    for (let i = 0; i < 8; i++) {
      const x = Math.random() * mapData.width;
      const y = Math.random() * mapData.height;

      if (y > 150 && this.isAwayFromPath(x, y, mapData.waypoints)) {
        // Small skull (slightly irregular)
        this.mapContainer
          .moveTo(x - 4, y)
          .lineTo(x - 3, y - 3)
          .lineTo(x, y - 4)
          .lineTo(x + 3, y - 3)
          .lineTo(x + 4, y)
          .lineTo(x + 3, y + 3)
          .lineTo(x - 3, y + 3)
          .fill(0xf5f5dc);
        this.mapContainer.circle(x - 2, y - 1, 1.5).fill(0x1a1a1a); // Eye socket
        this.mapContainer.circle(x + 2, y - 1, 1.5).fill(0x1a1a1a); // Eye socket
      }
    }
  }

  /**
   * Check if a point is away from the path
   */
  private isAwayFromPath(x: number, y: number, waypoints: Waypoint[]): boolean {
    // Simple distance check from path
    for (let i = 0; i < waypoints.length - 1; i++) {
      const p1 = waypoints[i];
      const p2 = waypoints[i + 1];

      // Calculate distance from point to line segment
      const distance = this.distanceToLineSegment(x, y, p1.x, p1.y, p2.x, p2.y);
      if (distance < 50) {
        return false;
      } // Too close to path
    }
    return true;
  }

  /**
   * Calculate distance from a point to a line segment
   */
  private distanceToLineSegment(
    x: number,
    y: number,
    x1: number,
    y1: number,
    x2: number,
    y2: number
  ): number {
    const A = x - x1;
    const B = y - y1;
    const C = x2 - x1;
    const D = y2 - y1;

    const dot = A * C + B * D;
    const lenSq = C * C + D * D;
    let param = -1;

    if (lenSq !== 0) {
      param = dot / lenSq;
    }

    let xx, yy;

    if (param < 0) {
      xx = x1;
      yy = y1;
    } else if (param > 1) {
      xx = x2;
      yy = y2;
    } else {
      xx = x1 + param * C;
      yy = y1 + param * D;
    }

    const dx = x - xx;
    const dy = y - yy;
    return Math.sqrt(dx * dx + dy * dy);
  }
}
