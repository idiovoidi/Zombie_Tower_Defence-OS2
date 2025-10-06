import { Application, Graphics, Container } from 'pixi.js';
import { MapManager, MapData } from '../managers/MapManager';
import { Waypoint } from '../managers/PathfindingManager';

export class VisualMapRenderer {
  private app: Application;
  private mapManager: MapManager;
  private mapContainer: Graphics;
  private pathGraphics: Graphics;
  private campClickArea: Container | null = null;
  private onCampClickCallback: (() => void) | null = null;

  constructor(app: Application, mapManager: MapManager) {
    this.app = app;
    this.mapManager = mapManager;
    this.mapContainer = new Graphics();
    this.pathGraphics = new Graphics();

    // Add to stage at the beginning (index 0) so it renders behind everything
    this.app.stage.addChildAt(this.mapContainer, 0);
    this.app.stage.addChildAt(this.pathGraphics, 1);
  }

  public setCampClickCallback(callback: () => void): void {
    console.log('🏕️ setCampClickCallback called, callback is:', typeof callback);
    this.onCampClickCallback = callback;
    console.log('🏕️ Callback stored, onCampClickCallback is now:', typeof this.onCampClickCallback);
  }

  public renderMap(mapName: string): void {
    // Clear previous map
    this.mapContainer.clear();
    this.pathGraphics.clear();

    // Get map data
    const mapData = this.mapManager.getCurrentMap();
    if (!mapData) return;

    // Render map background first
    this.renderMapBackground(mapData);

    // Render path on mapContainer (so it appears under graveyard)
    this.renderPath(mapData);

    // Render graveyard and other foreground elements
    this.renderForegroundElements(mapData);
  }

  private renderMapBackground(mapData: MapData): void {
    // Draw apocalyptic ground texture for play area
    // Base layer - darker, more desolate ground
    this.mapContainer.rect(0, 0, mapData.width, mapData.height);
    this.mapContainer.fill({ color: 0x3a4a2a }); // Darker olive green

    // Add varied dirt/mud patches for texture variation
    for (let i = 0; i < 80; i++) {
      const x = Math.random() * mapData.width;
      const y = Math.random() * mapData.height;
      const size = 30 + Math.random() * 60;
      const points = 6 + Math.floor(Math.random() * 5);

      this.mapContainer.moveTo(x, y);
      for (let j = 0; j < points; j++) {
        const angle = (j / points) * Math.PI * 2;
        const radius = size * (0.6 + Math.random() * 0.7);
        const px = x + Math.cos(angle) * radius;
        const py = y + Math.sin(angle) * radius;
        this.mapContainer.lineTo(px, py);
      }
      this.mapContainer.fill({ color: 0x4a5a3a, alpha: 0.4 + Math.random() * 0.3 });
    }

    // Dead grass patches (lighter, sparse)
    for (let i = 0; i < 120; i++) {
      const x = Math.random() * mapData.width;
      const y = Math.random() * mapData.height;
      const size = 15 + Math.random() * 30;
      const points = 5 + Math.floor(Math.random() * 4);

      this.mapContainer.moveTo(x, y);
      for (let j = 0; j < points; j++) {
        const angle = (j / points) * Math.PI * 2;
        const radius = size * (0.7 + Math.random() * 0.5);
        const px = x + Math.cos(angle) * radius;
        const py = y + Math.sin(angle) * radius;
        this.mapContainer.lineTo(px, py);
      }
      this.mapContainer.fill({ color: 0x5a6a4a, alpha: 0.2 + Math.random() * 0.2 });
    }

    // Barren dirt patches (brown/tan)
    for (let i = 0; i < 70; i++) {
      const x = Math.random() * mapData.width;
      const y = Math.random() * mapData.height;
      const size = 25 + Math.random() * 45;
      const points = 4 + Math.floor(Math.random() * 4);

      this.mapContainer.moveTo(x, y);
      for (let j = 0; j < points; j++) {
        const angle = (j / points) * Math.PI * 2 + Math.random() * 0.5;
        const radius = size * (0.5 + Math.random() * 0.8);
        const px = x + Math.cos(angle) * radius;
        const py = y + Math.sin(angle) * radius;
        this.mapContainer.lineTo(px, py);
      }
      this.mapContainer.fill({ color: 0x6a5a4a, alpha: 0.3 + Math.random() * 0.3 });
    }

    // Scattered rocks and debris
    for (let i = 0; i < 60; i++) {
      const x = Math.random() * mapData.width;
      const y = Math.random() * mapData.height;
      const size = 3 + Math.random() * 12;
      const points = 3 + Math.floor(Math.random() * 4);

      this.mapContainer.moveTo(x, y);
      for (let j = 0; j < points; j++) {
        const angle = (j / points) * Math.PI * 2;
        const radius = size * (0.7 + Math.random() * 0.5);
        const px = x + Math.cos(angle) * radius;
        const py = y + Math.sin(angle) * radius;
        this.mapContainer.lineTo(px, py);
      }
      this.mapContainer.fill({ color: 0x5a5a5a, alpha: 0.4 + Math.random() * 0.4 });
    }

    // Small pebbles scattered around
    for (let i = 0; i < 100; i++) {
      const x = Math.random() * mapData.width;
      const y = Math.random() * mapData.height;
      const size = 1 + Math.random() * 3;
      this.mapContainer
        .circle(x, y, size)
        .fill({ color: 0x6a6a6a, alpha: 0.5 + Math.random() * 0.3 });
    }

    // Add organic ground cracks (branching) - more prominent
    for (let i = 0; i < 35; i++) {
      const x = Math.random() * mapData.width;
      const y = Math.random() * mapData.height;
      const mainLength = 40 + Math.random() * 70;
      const angle = Math.random() * Math.PI * 2;

      // Main crack
      let currentX = x;
      let currentY = y;
      const segments = 4 + Math.floor(Math.random() * 5);

      for (let j = 0; j < segments; j++) {
        const segmentLength = mainLength / segments;
        const segmentAngle = angle + (Math.random() - 0.5) * 0.6;
        const nextX = currentX + Math.cos(segmentAngle) * segmentLength;
        const nextY = currentY + Math.sin(segmentAngle) * segmentLength;

        // Main crack line (darker, thicker)
        this.mapContainer
          .moveTo(currentX, currentY)
          .lineTo(nextX, nextY)
          .stroke({ width: 1.5 + Math.random() * 0.5, color: 0x2a2a1a, alpha: 0.6 });

        // Add small branch cracks
        if (Math.random() > 0.6) {
          const branchAngle = segmentAngle + (Math.random() - 0.5) * Math.PI;
          const branchLength = segmentLength * (0.3 + Math.random() * 0.4);
          const branchX = currentX + Math.cos(branchAngle) * branchLength;
          const branchY = currentY + Math.sin(branchAngle) * branchLength;
          this.mapContainer
            .moveTo(currentX, currentY)
            .lineTo(branchX, branchY)
            .stroke({ width: 1, color: 0x2a2a1a, alpha: 0.4 });
        }

        currentX = nextX;
        currentY = nextY;
      }
    }

    // Add weathering stains and discoloration
    for (let i = 0; i < 40; i++) {
      const x = Math.random() * mapData.width;
      const y = Math.random() * mapData.height;
      const size = 20 + Math.random() * 40;
      this.mapContainer
        .circle(x, y, size)
        .fill({ color: 0x2a3a1a, alpha: 0.15 + Math.random() * 0.15 });
    }

    // Add subtle grass tufts (small details)
    for (let i = 0; i < 150; i++) {
      const x = Math.random() * mapData.width;
      const y = Math.random() * mapData.height;
      const size = 2 + Math.random() * 4;
      // Small irregular shapes for grass
      const points = 3 + Math.floor(Math.random() * 3);
      this.mapContainer.moveTo(x, y);
      for (let j = 0; j < points; j++) {
        const angle = (j / points) * Math.PI * 2;
        const radius = size * (0.8 + Math.random() * 0.4);
        this.mapContainer.lineTo(x + Math.cos(angle) * radius, y + Math.sin(angle) * radius);
      }
      this.mapContainer.fill({ color: 0x4a5a3a, alpha: 0.3 + Math.random() * 0.2 });
    }

    // Draw UI panel background on the right
    this.mapContainer.rect(1024, 0, 256, 768);
    this.mapContainer.fill({ color: 0x2a2a2a });

    // Draw separator line between play area and UI
    this.mapContainer.rect(1024, 0, 4, 768);
    this.mapContainer.fill({ color: 0x654321 });
  }

  private renderForegroundElements(mapData: MapData): void {
    // Add graveyard on the left (zombie spawn area)
    this.renderGraveyard(mapData);

    // Add destroyed houses at the top
    this.renderDestroyedHouses(mapData);

    // Add survivor camp at the end of the path
    this.renderSurvivorCamp(mapData.waypoints[mapData.waypoints.length - 1]);

    // Add some visual elements like trees or rocks
    this.addDecorativeElements(mapData);
  }

  private renderPath(mapData: MapData): void {
    if (mapData.waypoints.length < 2) return;

    const pathWidth = 50;
    const cornerRadius = 30;

    // Helper function to draw path
    const drawPathLine = (graphics: Graphics, waypoints: Waypoint[]) => {
      graphics.moveTo(waypoints[0].x, waypoints[0].y);

      for (let i = 0; i < waypoints.length; i++) {
        const prev = i > 0 ? waypoints[i - 1] : null;
        const curr = waypoints[i];
        const next = i < waypoints.length - 1 ? waypoints[i + 1] : null;

        if (!prev) {
          graphics.moveTo(curr.x, curr.y);
        } else if (!next) {
          graphics.lineTo(curr.x, curr.y);
        } else {
          const v1x = curr.x - prev.x;
          const v1y = curr.y - prev.y;
          const v2x = next.x - curr.x;
          const v2y = next.y - curr.y;

          const len1 = Math.sqrt(v1x * v1x + v1y * v1y);
          const len2 = Math.sqrt(v2x * v2x + v2y * v2y);

          const n1x = v1x / len1;
          const n1y = v1y / len1;
          const n2x = v2x / len2;
          const n2y = v2y / len2;

          const curveStart = Math.min(cornerRadius, len1 / 2);
          const curveEnd = Math.min(cornerRadius, len2 / 2);

          const startX = curr.x - n1x * curveStart;
          const startY = curr.y - n1y * curveStart;
          const endX = curr.x + n2x * curveEnd;
          const endY = curr.y + n2y * curveEnd;

          graphics.lineTo(startX, startY);
          graphics.quadraticCurveTo(curr.x, curr.y, endX, endY);
        }
      }
    };

    // Draw dark border first (darker dirt edges)
    drawPathLine(this.mapContainer, mapData.waypoints);
    this.mapContainer.stroke({
      width: pathWidth + 8,
      color: 0x4a3a2a,
      cap: 'round',
      join: 'round',
    });

    // Draw main path (worn dirt)
    drawPathLine(this.mapContainer, mapData.waypoints);
    this.mapContainer.stroke({ width: pathWidth, color: 0x6a5a4a, cap: 'round', join: 'round' });

    // Add center worn track (darker from heavy use)
    drawPathLine(this.mapContainer, mapData.waypoints);
    this.mapContainer.stroke({
      width: pathWidth * 0.6,
      color: 0x5a4a3a,
      cap: 'round',
      join: 'round',
      alpha: 0.7,
    });

    // Add tire/cart tracks (two parallel lines)
    const trackOffset = pathWidth * 0.25;

    // Calculate perpendicular offsets for tracks
    for (let i = 0; i < mapData.waypoints.length - 1; i++) {
      const curr = mapData.waypoints[i];
      const next = mapData.waypoints[i + 1];

      const dx = next.x - curr.x;
      const dy = next.y - curr.y;
      const len = Math.sqrt(dx * dx + dy * dy);
      const nx = -dy / len;
      const ny = dx / len;

      // Left track
      this.mapContainer.moveTo(curr.x + nx * trackOffset, curr.y + ny * trackOffset);
      this.mapContainer.lineTo(next.x + nx * trackOffset, next.y + ny * trackOffset);
      this.mapContainer.stroke({ width: 3, color: 0x4a3a2a, alpha: 0.6 });

      // Right track
      this.mapContainer.moveTo(curr.x - nx * trackOffset, curr.y - ny * trackOffset);
      this.mapContainer.lineTo(next.x - nx * trackOffset, next.y - ny * trackOffset);
      this.mapContainer.stroke({ width: 3, color: 0x4a3a2a, alpha: 0.6 });
    }

    // Add dirt texture - random small patches along path
    for (let i = 0; i < mapData.waypoints.length - 1; i++) {
      const curr = mapData.waypoints[i];
      const next = mapData.waypoints[i + 1];

      const dx = next.x - curr.x;
      const dy = next.y - curr.y;
      const len = Math.sqrt(dx * dx + dy * dy);
      const steps = Math.floor(len / 15);

      for (let j = 0; j < steps; j++) {
        const t = j / steps;
        const x = curr.x + dx * t;
        const y = curr.y + dy * t;

        // Random dirt patches
        if (Math.random() > 0.7) {
          const size = 3 + Math.random() * 5;
          const offsetX = (Math.random() - 0.5) * pathWidth * 0.6;
          const offsetY = (Math.random() - 0.5) * pathWidth * 0.6;
          this.mapContainer.circle(x + offsetX, y + offsetY, size).fill({
            color: 0x4a3a2a,
            alpha: 0.3 + Math.random() * 0.3,
          });
        }

        // Random small rocks
        if (Math.random() > 0.85) {
          const size = 2 + Math.random() * 3;
          const offsetX = (Math.random() - 0.5) * pathWidth * 0.5;
          const offsetY = (Math.random() - 0.5) * pathWidth * 0.5;
          this.mapContainer.circle(x + offsetX, y + offsetY, size).fill({
            color: 0x5a5a5a,
            alpha: 0.5 + Math.random() * 0.3,
          });
        }

        // Footprints (small ovals)
        if (Math.random() > 0.8) {
          const offsetX = (Math.random() - 0.5) * pathWidth * 0.4;
          const offsetY = (Math.random() - 0.5) * pathWidth * 0.4;
          const angle = Math.random() * Math.PI * 2;
          this.mapContainer.ellipse(x + offsetX, y + offsetY, 3, 5).fill({
            color: 0x3a2a1a,
            alpha: 0.2 + Math.random() * 0.2,
          });
        }
      }
    }

    // Add edge wear - lighter dirt at edges
    drawPathLine(this.mapContainer, mapData.waypoints);
    this.mapContainer.stroke({
      width: pathWidth + 4,
      color: 0x7a6a5a,
      cap: 'round',
      join: 'round',
      alpha: 0.3,
    });
  }

  private renderGraveyard(mapData: MapData): void {
    const graveyardX = 20;
    const graveyardY = 250;
    const graveyardWidth = 140;
    const graveyardHeight = 280;

    // Graveyard ground (darker, dead grass)
    this.mapContainer
      .rect(graveyardX, graveyardY, graveyardWidth, graveyardHeight)
      .fill({ color: 0x2a4a2a, alpha: 0.8 });

    // Rusty iron fence around graveyard
    this.mapContainer.rect(graveyardX, graveyardY, graveyardWidth, 4).fill(0x8b4513); // Top fence
    this.mapContainer
      .rect(graveyardX, graveyardY + graveyardHeight - 4, graveyardWidth, 4)
      .fill(0x8b4513); // Bottom fence

    // Right fence (with gap for gate at spawn point)
    const gateGapStart = 360 - graveyardY; // Gate starts at y: 360
    const gateGapEnd = gateGapStart + 60; // Gate is 60px tall

    // Left fence (solid)
    this.mapContainer.rect(graveyardX, graveyardY, 4, graveyardHeight).fill(0x8b4513);

    // Right fence - top section (above gate)
    this.mapContainer
      .rect(graveyardX + graveyardWidth - 4, graveyardY, 4, gateGapStart)
      .fill(0x8b4513);

    // Right fence - bottom section (below gate)
    this.mapContainer
      .rect(
        graveyardX + graveyardWidth - 4,
        graveyardY + gateGapEnd,
        4,
        graveyardHeight - gateGapEnd
      )
      .fill(0x8b4513);

    // Fence posts (avoiding gate area on right side)
    for (let i = 0; i <= graveyardHeight; i += 35) {
      this.mapContainer.rect(graveyardX - 2, graveyardY + i, 8, 6).fill(0x654321);
      // Skip posts in gate area on right side
      if (i < gateGapStart || i > gateGapEnd) {
        this.mapContainer
          .rect(graveyardX + graveyardWidth - 6, graveyardY + i, 8, 6)
          .fill(0x654321);
      }
    }

    // Gate opening (where zombies exit) - on RIGHT side, aligned with spawn point
    const gateX = graveyardX + graveyardWidth - 50; // Position on right side
    const gateY = 360; // Aligned with spawn point at y: 384
    const gateWidth = 50;
    const gateHeight = 60;

    // Gate posts (stone pillars)
    this.mapContainer.rect(gateX - 8, gateY, 8, gateHeight).fill(0x696969);
    this.mapContainer.stroke({ width: 2, color: 0x4a4a4a });
    this.mapContainer.rect(gateX + gateWidth, gateY, 8, gateHeight).fill(0x696969);
    this.mapContainer.stroke({ width: 2, color: 0x4a4a4a });

    // Decorative skulls on gate posts
    this.mapContainer.circle(gateX - 4, gateY + 10, 4).fill(0xf5f5dc);
    this.mapContainer.circle(gateX - 6, gateY + 12, 1.5).fill(0x1a1a1a); // Eye
    this.mapContainer.circle(gateX - 2, gateY + 12, 1.5).fill(0x1a1a1a); // Eye

    this.mapContainer.circle(gateX + gateWidth + 4, gateY + 10, 4).fill(0xf5f5dc);
    this.mapContainer.circle(gateX + gateWidth + 2, gateY + 12, 1.5).fill(0x1a1a1a); // Eye
    this.mapContainer.circle(gateX + gateWidth + 6, gateY + 12, 1.5).fill(0x1a1a1a); // Eye

    // Broken iron gate (left side, hanging inward)
    this.mapContainer
      .moveTo(gateX - 8, gateY + 5)
      .lineTo(gateX - 2, gateY + 10)
      .lineTo(gateX - 2, gateY + 45)
      .lineTo(gateX - 8, gateY + 50)
      .fill({ color: 0x4a4a4a, alpha: 0.8 });
    this.mapContainer.stroke({ width: 2, color: 0x2a2a2a });

    // Gate bars (broken)
    for (let i = 0; i < 3; i++) {
      this.mapContainer
        .moveTo(gateX - 6, gateY + 15 + i * 10)
        .lineTo(gateX - 2, gateY + 15 + i * 10)
        .stroke({ width: 2, color: 0x2a2a2a });
    }

    // Broken iron gate (right side, swung open outward)
    this.mapContainer
      .moveTo(gateX + gateWidth + 8, gateY + 5)
      .lineTo(gateX + gateWidth + 20, gateY + 10)
      .lineTo(gateX + gateWidth + 20, gateY + 50)
      .lineTo(gateX + gateWidth + 8, gateY + 55)
      .fill({ color: 0x4a4a4a, alpha: 0.8 });
    this.mapContainer.stroke({ width: 2, color: 0x2a2a2a });

    // Gate bars
    for (let i = 0; i < 3; i++) {
      this.mapContainer
        .moveTo(gateX + gateWidth + 10, gateY + 20 + i * 10)
        .lineTo(gateX + gateWidth + 18, gateY + 20 + i * 10)
        .stroke({ width: 2, color: 0x2a2a2a });
    }

    // "RIP" sign above gate (weathered)
    this.mapContainer.rect(gateX + 10, gateY - 15, 30, 12).fill(0x4a3a2a);
    this.mapContainer.stroke({ width: 1, color: 0x2a1a1a });

    // Chains hanging from gate
    this.mapContainer
      .moveTo(gateX - 8, gateY + 5)
      .lineTo(gateX - 5, gateY + 15)
      .lineTo(gateX - 8, gateY + 25)
      .stroke({ width: 2, color: 0x4a4a4a });
    this.mapContainer
      .moveTo(gateX + gateWidth + 8, gateY + 5)
      .lineTo(gateX + gateWidth + 11, gateY + 15)
      .lineTo(gateX + gateWidth + 8, gateY + 25)
      .stroke({ width: 2, color: 0x4a4a4a });

    // Gravestones (various types)
    const gravestones = [
      { x: 40, y: 280, type: 'cross', tilt: 0.1 },
      { x: 80, y: 290, type: 'rect', tilt: -0.15 },
      { x: 120, y: 285, type: 'round', tilt: 0.05 },
      { x: 50, y: 330, type: 'rect', tilt: 0.2 },
      { x: 95, y: 340, type: 'cross', tilt: -0.1 },
      { x: 135, y: 335, type: 'rect', tilt: 0.15 },
      { x: 35, y: 380, type: 'round', tilt: -0.05 },
      { x: 75, y: 390, type: 'rect', tilt: 0.25 },
      { x: 115, y: 385, type: 'cross', tilt: -0.2 },
      { x: 145, y: 395, type: 'rect', tilt: 0.1 },
      { x: 45, y: 440, type: 'round', tilt: 0.15 },
      { x: 90, y: 450, type: 'rect', tilt: -0.1 },
      { x: 130, y: 445, type: 'cross', tilt: 0.05 },
      { x: 60, y: 490, type: 'rect', tilt: -0.2 },
      { x: 105, y: 500, type: 'round', tilt: 0.1 },
    ];

    for (const stone of gravestones) {
      this.renderGravestone(stone.x, stone.y, stone.type, stone.tilt);
    }

    // Dead tree in graveyard
    this.renderDeadTree(graveyardX + 25, graveyardY + 180);

    // Mist/fog effect
    for (let i = 0; i < 8; i++) {
      const mistX = graveyardX + Math.random() * graveyardWidth;
      const mistY = graveyardY + graveyardHeight - 30 + Math.random() * 20;
      this.mapContainer
        .circle(mistX, mistY, 15 + Math.random() * 10)
        .fill({ color: 0xcccccc, alpha: 0.15 });
    }

    // Open graves (where zombies emerge)
    this.renderOpenGrave(graveyardX + 70, graveyardY + 120);
    this.renderOpenGrave(graveyardX + 110, graveyardY + 160);
  }

  private renderGravestone(x: number, y: number, type: string, tilt: number): void {
    const baseColor = 0x696969;
    const darkColor = 0x4a4a4a;

    if (type === 'rect') {
      // Rectangular gravestone
      this.mapContainer.rect(x - 8, y, 16, 25).fill(baseColor);
      this.mapContainer.stroke({ width: 1, color: darkColor });
      // Moss/weathering
      this.mapContainer.circle(x - 3, y + 5, 3).fill({ color: 0x2a4a2a, alpha: 0.5 });
      this.mapContainer.circle(x + 4, y + 15, 2).fill({ color: 0x2a4a2a, alpha: 0.5 });
    } else if (type === 'round') {
      // Rounded top gravestone
      this.mapContainer.rect(x - 8, y + 8, 16, 20).fill(baseColor);
      this.mapContainer.circle(x, y + 8, 8).fill(baseColor);
      this.mapContainer.stroke({ width: 1, color: darkColor });
      // Crack
      this.mapContainer
        .moveTo(x - 2, y + 5)
        .lineTo(x + 1, y + 20)
        .stroke({ width: 1, color: darkColor });
    } else if (type === 'cross') {
      // Cross gravestone
      this.mapContainer.rect(x - 2, y, 4, 25).fill(baseColor); // Vertical
      this.mapContainer.rect(x - 8, y + 8, 16, 4).fill(baseColor); // Horizontal
      this.mapContainer.stroke({ width: 1, color: darkColor });
    }

    // Shadow/base
    this.mapContainer.rect(x - 10, y + 25, 20, 3).fill({ color: 0x1a1a1a, alpha: 0.4 });
  }

  private renderDeadTree(x: number, y: number): void {
    // Trunk
    this.mapContainer.rect(x - 3, y, 6, 40).fill(0x4a3a2a);
    this.mapContainer.stroke({ width: 1, color: 0x2a1a1a });

    // Bare branches
    this.mapContainer
      .moveTo(x, y + 10)
      .lineTo(x - 15, y)
      .stroke({ width: 2, color: 0x4a3a2a });
    this.mapContainer
      .moveTo(x, y + 15)
      .lineTo(x + 12, y + 5)
      .stroke({ width: 2, color: 0x4a3a2a });
    this.mapContainer
      .moveTo(x, y + 25)
      .lineTo(x - 10, y + 18)
      .stroke({ width: 2, color: 0x4a3a2a });
    this.mapContainer
      .moveTo(x, y + 30)
      .lineTo(x + 8, y + 25)
      .stroke({ width: 1, color: 0x4a3a2a });

    // Broken branch on ground
    this.mapContainer
      .moveTo(x + 10, y + 45)
      .lineTo(x + 20, y + 48)
      .stroke({ width: 2, color: 0x4a3a2a });
  }

  private renderOpenGrave(x: number, y: number): void {
    // Grave hole (dark opening)
    this.mapContainer.rect(x - 15, y, 30, 20).fill(0x1a1a1a);
    this.mapContainer.stroke({ width: 2, color: 0x2a2a2a });

    // Dirt piles on sides
    this.mapContainer.circle(x - 20, y + 10, 8).fill(0x654321);
    this.mapContainer.circle(x - 25, y + 15, 6).fill(0x654321);
    this.mapContainer.circle(x + 20, y + 10, 8).fill(0x654321);
    this.mapContainer.circle(x + 25, y + 15, 6).fill(0x654321);

    // Broken coffin pieces
    this.mapContainer.rect(x - 10, y + 5, 8, 3).fill(0x4a3a2a);
    this.mapContainer.rect(x + 5, y + 12, 6, 3).fill(0x4a3a2a);

    // Skeletal hand reaching out
    this.mapContainer.circle(x - 5, y + 8, 2).fill(0xf5f5dc); // Palm
    this.mapContainer.rect(x - 6, y + 6, 1, 4).fill(0xf5f5dc); // Finger
    this.mapContainer.rect(x - 4, y + 5, 1, 5).fill(0xf5f5dc); // Finger
    this.mapContainer.rect(x - 2, y + 6, 1, 4).fill(0xf5f5dc); // Finger
  }

  private renderDestroyedHouses(mapData: MapData): void {
    // Render several destroyed houses at the top of the map with varied positions
    const houses = [
      { x: 120, y: 20, width: 70, height: 60, destroyed: 0.8 },
      { x: 280, y: 45, width: 80, height: 70, destroyed: 0.6 },
      { x: 480, y: 15, width: 65, height: 55, destroyed: 0.9 },
      { x: 650, y: 35, width: 75, height: 65, destroyed: 0.7 },
      { x: 950, y: 50, width: 55, height: 58, destroyed: 0.75 },
    ];

    for (const house of houses) {
      this.renderDestroyedHouse(house.x, house.y, house.width, house.height, house.destroyed);
    }
  }

  private renderDestroyedHouse(
    x: number,
    y: number,
    width: number,
    height: number,
    destroyedLevel: number
  ): void {
    const wallHeight = height * (1 - destroyedLevel * 0.5);
    const wallThickness = 6;

    // Floor/foundation
    this.mapContainer.rect(x, y + height, width, 8).fill(0x696969);
    this.mapContainer.stroke({ width: 1, color: 0x4a4a4a });

    // Back wall (solid, darkest for depth)
    this.mapContainer.rect(x, y + height - wallHeight, width, wallHeight).fill(0x6b5d4f);
    this.mapContainer.stroke({ width: 2, color: 0x4a3a2a });

    // Left wall (damaged)
    if (destroyedLevel < 0.85) {
      const leftWallHeight = wallHeight * (1 - destroyedLevel * 0.3);
      this.mapContainer
        .rect(x, y + height - leftWallHeight, wallThickness, leftWallHeight)
        .fill(0x8b7355);
      this.mapContainer.stroke({ width: 1, color: 0x654321 });
    }

    // Right wall (more damaged)
    if (destroyedLevel < 0.75) {
      const rightWallHeight = wallHeight * (1 - destroyedLevel * 0.5);
      this.mapContainer
        .rect(
          x + width - wallThickness,
          y + height - rightWallHeight,
          wallThickness,
          rightWallHeight
        )
        .fill(0x8b7355);
      this.mapContainer.stroke({ width: 1, color: 0x654321 });
    }

    // Front wall sections (with gaps)
    const frontWallHeight = wallHeight * 0.9;
    if (destroyedLevel < 0.8) {
      // Left section
      this.mapContainer
        .rect(x + wallThickness, y + height - frontWallHeight, width * 0.3, frontWallHeight)
        .fill(0xa0826d);
      this.mapContainer.stroke({ width: 1, color: 0x654321 });
      // Right section
      this.mapContainer
        .rect(
          x + width * 0.65,
          y + height - frontWallHeight,
          width * 0.35 - wallThickness,
          frontWallHeight
        )
        .fill(0xa0826d);
      this.mapContainer.stroke({ width: 1, color: 0x654321 });
    }

    // Collapsed roof
    if (destroyedLevel < 0.9) {
      this.mapContainer
        .moveTo(x + wallThickness, y + height - wallHeight)
        .lineTo(x + width * 0.4, y + height - wallHeight - 12)
        .lineTo(x + width * 0.8, y + height - wallHeight + 8)
        .lineTo(x + width - wallThickness, y + height - wallHeight * 0.6)
        .lineTo(x + wallThickness, y + height - wallHeight)
        .fill({ color: 0x8b4513, alpha: 0.9 });
      this.mapContainer.stroke({ width: 2, color: 0x654321 });
    }

    // Window
    if (destroyedLevel < 0.75) {
      const windowX = x + width * 0.2;
      const windowY = y + height - frontWallHeight * 0.6;
      this.mapContainer.rect(windowX, windowY, 14, 18).fill(0x1a1a1a);
      this.mapContainer.stroke({ width: 2, color: 0x654321 });
      // Broken glass
      this.mapContainer
        .moveTo(windowX, windowY)
        .lineTo(windowX + 14, windowY + 18)
        .stroke({ width: 1, color: 0x4a4a4a });
      this.mapContainer
        .moveTo(windowX + 14, windowY)
        .lineTo(windowX, windowY + 18)
        .stroke({ width: 1, color: 0x4a4a4a });
    }

    // Door
    if (destroyedLevel < 0.8) {
      const doorX = x + width * 0.45;
      const doorY = y + height - frontWallHeight * 0.8;
      const doorWidth = 18;
      const doorHeight = frontWallHeight * 0.7;
      // Frame
      this.mapContainer.rect(doorX - 2, doorY, doorWidth + 4, doorHeight).fill(0x4a3a2a);
      // Door (tilted)
      this.mapContainer
        .moveTo(doorX, doorY)
        .lineTo(doorX + doorWidth, doorY + 5)
        .lineTo(doorX + doorWidth - 3, doorY + doorHeight)
        .lineTo(doorX - 3, doorY + doorHeight - 5)
        .lineTo(doorX, doorY)
        .fill(0x654321);
      this.mapContainer.stroke({ width: 1, color: 0x4a3a2a });
    }

    // Rubble - irregular chunks
    const rubbleCount = Math.floor(8 + destroyedLevel * 15);
    for (let i = 0; i < rubbleCount; i++) {
      const rx = x + Math.random() * width;
      const ry = y + height + 8 + Math.random() * 12;
      const size = 4 + Math.random() * 6;
      // Irregular rubble shapes - use poly for closed shapes
      const points = 3 + Math.floor(Math.random() * 3);
      const rubblePath: number[] = [];
      for (let j = 0; j < points; j++) {
        const angle = (j / points) * Math.PI * 2;
        const radius = size * (0.7 + Math.random() * 0.5);
        rubblePath.push(rx + Math.cos(angle) * radius);
        rubblePath.push(ry + Math.sin(angle) * radius);
      }
      this.mapContainer.poly(rubblePath).fill(0x696969);
    }

    // Burn marks - irregular scorch patterns using rectangles instead
    if (destroyedLevel > 0.6) {
      // Left burn mark - multiple overlapping rectangles for organic look
      const burnX1 = x + width * 0.3;
      const burnY1 = y + height - wallHeight * 0.5;
      for (let i = 0; i < 5; i++) {
        const offsetX = (Math.random() - 0.5) * 12;
        const offsetY = (Math.random() - 0.5) * 12;
        const burnSize = 8 + Math.random() * 8;
        this.mapContainer
          .rect(
            burnX1 + offsetX - burnSize / 2,
            burnY1 + offsetY - burnSize / 2,
            burnSize,
            burnSize
          )
          .fill({ color: 0x1a1a1a, alpha: 0.3 });
      }

      // Right burn mark
      const burnX2 = x + width * 0.7;
      const burnY2 = y + height - wallHeight * 0.3;
      for (let i = 0; i < 4; i++) {
        const offsetX = (Math.random() - 0.5) * 10;
        const offsetY = (Math.random() - 0.5) * 10;
        const burnSize = 6 + Math.random() * 6;
        this.mapContainer
          .rect(
            burnX2 + offsetX - burnSize / 2,
            burnY2 + offsetY - burnSize / 2,
            burnSize,
            burnSize
          )
          .fill({ color: 0x1a1a1a, alpha: 0.25 });
      }
    }

    // Smoke - use ellipses for organic puffs
    if (destroyedLevel > 0.7) {
      for (let i = 0; i < 4; i++) {
        const sx = x + width * 0.5 + (Math.random() - 0.5) * 25;
        const sy = y + height - wallHeight - 15 - i * 10;
        const smokeSize = 4 + i * 0.5;
        // Use ellipse for organic smoke
        this.mapContainer
          .ellipse(sx, sy, smokeSize * 1.2, smokeSize * 0.8)
          .fill({ color: 0x808080, alpha: 0.35 - i * 0.08 });
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

  private addDecorativeElements(mapData: MapData): void {
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

  private isAwayFromPath(x: number, y: number, waypoints: Waypoint[]): boolean {
    // Simple distance check from path
    for (let i = 0; i < waypoints.length - 1; i++) {
      const p1 = waypoints[i];
      const p2 = waypoints[i + 1];

      // Calculate distance from point to line segment
      const distance = this.distanceToLineSegment(x, y, p1.x, p1.y, p2.x, p2.y);
      if (distance < 50) return false; // Too close to path
    }
    return true;
  }

  private distanceToLineSegment(
    x: number,
    y: number,
    x1: number,
    y1: number,
    x2: number,
    y2: number
  ): number {
    // Simplified distance calculation
    const A = x - x1;
    const B = y - y1;
    const C = x2 - x1;
    const D = y2 - y1;

    const dot = A * C + B * D;
    const lenSq = C * C + D * D;
    let param = -1;

    if (lenSq !== 0) param = dot / lenSq;

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

  private renderSurvivorCamp(endpoint: Waypoint): void {
    const campX = endpoint.x;
    const campY = endpoint.y;

    // Makeshift perimeter - scrap metal fence with gaps
    // Left fence section
    for (let i = 0; i < 5; i++) {
      const y = campY - 50 + i * 22;
      this.pathGraphics.rect(campX - 65, y, 8, 18).fill(0x5a5a5a);
      this.pathGraphics.stroke({ width: 2, color: 0x3a3a3a });
      // Rust spots
      this.pathGraphics.circle(campX - 61, y + 5, 2).fill({ color: 0x8b4513, alpha: 0.5 });
      // Rivets
      this.pathGraphics.circle(campX - 63, y + 3, 1.5).fill(0x6a6a6a);
      this.pathGraphics.circle(campX - 63, y + 15, 1.5).fill(0x6a6a6a);
    }

    // Right fence section
    for (let i = 0; i < 5; i++) {
      const y = campY - 50 + i * 22;
      this.pathGraphics.rect(campX + 57, y, 8, 18).fill(0x5a5a5a);
      this.pathGraphics.stroke({ width: 2, color: 0x3a3a3a });
      // Rust spots
      this.pathGraphics.circle(campX + 61, y + 8, 2).fill({ color: 0x8b4513, alpha: 0.5 });
      // Rivets
      this.pathGraphics.circle(campX + 59, y + 3, 1.5).fill(0x6a6a6a);
      this.pathGraphics.circle(campX + 59, y + 15, 1.5).fill(0x6a6a6a);
    }

    // Back fence - chain link style
    for (let x = -55; x < 55; x += 12) {
      this.pathGraphics.rect(campX + x, campY - 58, 10, 6).fill(0x5a5a5a);
      this.pathGraphics.stroke({ width: 1, color: 0x3a3a3a });
    }

    // Main tent - military style with weathered tarp
    // Tent base
    this.pathGraphics.rect(campX - 32, campY - 10, 64, 35).fill(0x6b7c3a); // Olive green
    this.pathGraphics.stroke({ width: 2, color: 0x4a5a2a });

    // Tent roof - peaked
    this.pathGraphics
      .moveTo(campX - 35, campY - 10)
      .lineTo(campX, campY - 32)
      .lineTo(campX + 35, campY - 10)
      .lineTo(campX - 35, campY - 10)
      .fill(0x5a6a2a);
    this.pathGraphics.stroke({ width: 2, color: 0x3a4a1a });

    // Tent panels/seams
    this.pathGraphics
      .moveTo(campX, campY - 32)
      .lineTo(campX, campY - 10)
      .stroke({ width: 2, color: 0x4a5a2a });
    this.pathGraphics
      .moveTo(campX - 17, campY - 21)
      .lineTo(campX - 17, campY - 10)
      .stroke({ width: 1, color: 0x4a5a2a });
    this.pathGraphics
      .moveTo(campX + 17, campY - 21)
      .lineTo(campX + 17, campY - 10)
      .stroke({ width: 1, color: 0x4a5a2a });

    // Tent patches/repairs
    this.pathGraphics.rect(campX - 25, campY - 5, 8, 6).fill({ color: 0x4a4a4a, alpha: 0.6 });
    this.pathGraphics.rect(campX + 18, campY - 18, 6, 5).fill({ color: 0x3a3a3a, alpha: 0.6 });

    // Tent entrance flap
    this.pathGraphics.rect(campX - 10, campY + 15, 20, 10).fill(0x4a5a2a);
    this.pathGraphics.stroke({ width: 2, color: 0x3a4a1a });

    // Tent ropes/stakes
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

    // Smaller tent on left
    this.pathGraphics
      .moveTo(campX - 50, campY - 25)
      .lineTo(campX - 35, campY - 38)
      .lineTo(campX - 20, campY - 25)
      .lineTo(campX - 50, campY - 25)
      .fill(0x8b7355);
    this.pathGraphics.stroke({ width: 2, color: 0x654321 });
    this.pathGraphics.rect(campX - 48, campY - 25, 28, 20).fill(0xa0826d);
    this.pathGraphics.stroke({ width: 1, color: 0x654321 });

    // Sandbag barriers - more organic placement
    const drawSandbag = (x: number, y: number, rotation = 0) => {
      this.pathGraphics.roundRect(x, y, 12, 8, 2).fill(0x8b7355);
      this.pathGraphics.stroke({ width: 1, color: 0x654321 });
      // Texture lines
      this.pathGraphics
        .moveTo(x + 3, y)
        .lineTo(x + 3, y + 8)
        .stroke({ width: 1, color: 0x654321, alpha: 0.3 });
    };

    // Left barrier cluster
    drawSandbag(campX - 58, campY + 35);
    drawSandbag(campX - 58, campY + 25);
    drawSandbag(campX - 45, campY + 30);
    drawSandbag(campX - 45, campY + 40);

    // Right barrier cluster
    drawSandbag(campX + 46, campY + 35);
    drawSandbag(campX + 46, campY + 25);
    drawSandbag(campX + 33, campY + 30);
    drawSandbag(campX + 33, campY + 40);

    // Supply crates - wooden with metal bands
    const drawWoodenCrate = (x: number, y: number) => {
      this.pathGraphics.rect(x, y, 16, 16).fill(0x8b7355);
      this.pathGraphics.stroke({ width: 2, color: 0x654321 });
      // Wood planks
      for (let i = 0; i < 16; i += 4) {
        this.pathGraphics
          .moveTo(x, y + i)
          .lineTo(x + 16, y + i)
          .stroke({ width: 1, color: 0x654321, alpha: 0.3 });
      }
      // Metal bands
      this.pathGraphics.rect(x, y + 3, 16, 2).fill({ color: 0x4a4a4a, alpha: 0.7 });
      this.pathGraphics.rect(x, y + 11, 16, 2).fill({ color: 0x4a4a4a, alpha: 0.7 });
    };

    drawWoodenCrate(campX - 55, campY - 40);
    drawWoodenCrate(campX - 55, campY - 22);
    drawWoodenCrate(campX - 37, campY - 40);

    // Makeshift watchtower - wood and scrap
    // Tower legs
    this.pathGraphics.rect(campX + 42, campY - 35, 4, 45).fill(0x654321);
    this.pathGraphics.rect(campX + 56, campY - 35, 4, 45).fill(0x654321);
    // Cross braces
    this.pathGraphics
      .moveTo(campX + 44, campY - 30)
      .lineTo(campX + 58, campY - 20)
      .stroke({ width: 2, color: 0x654321 });
    this.pathGraphics
      .moveTo(campX + 58, campY - 30)
      .lineTo(campX + 44, campY - 20)
      .stroke({ width: 2, color: 0x654321 });

    // Platform - wood planks
    this.pathGraphics.rect(campX + 38, campY - 40, 26, 8).fill(0x8b7355);
    this.pathGraphics.stroke({ width: 2, color: 0x654321 });
    // Plank lines
    for (let x = 40; x < 62; x += 5) {
      this.pathGraphics
        .moveTo(campX + x, campY - 40)
        .lineTo(campX + x, campY - 32)
        .stroke({ width: 1, color: 0x654321 });
    }

    // Railing
    this.pathGraphics.rect(campX + 38, campY - 42, 26, 2).fill(0x654321);

    // Guard
    this.pathGraphics.circle(campX + 51, campY - 38, 4).fill(0xffdbac); // Head
    this.pathGraphics.rect(campX + 48, campY - 34, 6, 8).fill(0x654321); // Body
    this.pathGraphics.rect(campX + 51, campY - 43, 1, 7).fill(0x4a4a4a); // Rifle

    // Radio antenna on tower
    this.pathGraphics
      .moveTo(campX + 60, campY - 40)
      .lineTo(campX + 60, campY - 55)
      .stroke({ width: 2, color: 0x4a4a4a });
    this.pathGraphics.circle(campX + 60, campY - 55, 2).fill(0xff0000);

    // Central campfire - stone ring
    // Fire pit stones
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      const x = campX + Math.cos(angle) * 12;
      const y = campY + 32 + Math.sin(angle) * 12;
      this.pathGraphics.circle(x, y, 3).fill(0x5a5a5a);
      this.pathGraphics.stroke({ width: 1, color: 0x3a3a3a });
    }
    // Fire
    this.pathGraphics.circle(campX, campY + 32, 8).fill(0xff4500);
    this.pathGraphics.circle(campX, campY + 30, 6).fill(0xffa500);
    this.pathGraphics.circle(campX - 2, campY + 28, 4).fill(0xffff00);
    this.pathGraphics.circle(campX + 2, campY + 28, 3).fill(0xffff00);

    // Logs around fire
    this.pathGraphics.rect(campX - 20, campY + 38, 12, 4).fill(0x654321);
    this.pathGraphics.rect(campX + 8, campY + 38, 12, 4).fill(0x654321);

    // Survivors around camp
    // Survivor 1 - sitting by fire
    this.pathGraphics.circle(campX - 18, campY + 36, 4).fill(0xffdbac);
    this.pathGraphics.rect(campX - 21, campY + 40, 6, 6).fill(0x4169e1);

    // Survivor 2 - standing with weapon
    this.pathGraphics.circle(campX + 25, campY + 20, 4).fill(0xffdbac);
    this.pathGraphics.rect(campX + 22, campY + 24, 6, 8).fill(0x654321);
    this.pathGraphics.rect(campX + 25, campY + 18, 1, 6).fill(0x2a2a2a);

    // Survivor 3 - working on crate
    this.pathGraphics.circle(campX - 48, campY - 12, 4).fill(0xffdbac);
    this.pathGraphics.rect(campX - 51, campY - 8, 6, 8).fill(0x4a4a4a);

    // Hanging laundry line
    this.pathGraphics
      .moveTo(campX - 20, campY - 25)
      .lineTo(campX + 20, campY - 25)
      .stroke({ width: 1, color: 0x3a3a3a });
    // Clothes
    this.pathGraphics.rect(campX - 10, campY - 25, 6, 8).fill({ color: 0x4169e1, alpha: 0.7 });
    this.pathGraphics.rect(campX + 4, campY - 25, 6, 8).fill({ color: 0x228b22, alpha: 0.7 });

    // Warning sign - makeshift
    this.pathGraphics.rect(campX - 40, campY - 60, 80, 18).fill(0x8b7355);
    this.pathGraphics.stroke({ width: 3, color: 0x654321 });
    // Painted warning stripes
    this.pathGraphics.rect(campX - 38, campY - 58, 6, 14).fill({ color: 0xffcc00, alpha: 0.8 });
    this.pathGraphics.rect(campX + 32, campY - 58, 6, 14).fill({ color: 0xffcc00, alpha: 0.8 });
    // Text area
    this.pathGraphics.rect(campX - 35, campY - 56, 70, 12).fill({ color: 0x00aa00, alpha: 0.7 });
    this.pathGraphics.stroke({ width: 2, color: 0x008800 });
    // Nails/screws
    this.pathGraphics.circle(campX - 36, campY - 56, 1.5).fill(0x4a4a4a);
    this.pathGraphics.circle(campX + 36, campY - 56, 1.5).fill(0x4a4a4a);
    this.pathGraphics.circle(campX - 36, campY - 44, 1.5).fill(0x4a4a4a);
    this.pathGraphics.circle(campX + 36, campY - 44, 1.5).fill(0x4a4a4a);

    // Create clickable area for camp
    this.createCampClickArea(campX, campY);
  }

  private createCampClickArea(campX: number, campY: number): void {
    // Remove old click area if it exists
    if (this.campClickArea) {
      this.app.stage.removeChild(this.campClickArea);
      this.campClickArea.destroy();
    }

    console.log('🏕️ Creating camp click area at', campX, campY);

    // Create new clickable container
    this.campClickArea = new Container();
    this.campClickArea.eventMode = 'static';
    this.campClickArea.cursor = 'pointer';

    // Create invisible hitbox covering the camp area
    const hitbox = new Graphics();
    hitbox.rect(campX - 65, campY - 60, 130, 110).fill({ color: 0x000000, alpha: 0.001 });
    hitbox.eventMode = 'static';
    this.campClickArea.addChild(hitbox);

    // Add hover effect - highlight border
    const hoverBorder = new Graphics();
    hoverBorder.visible = false;
    this.campClickArea.addChild(hoverBorder);

    // Hover events
    this.campClickArea.on('pointerover', () => {
      console.log('🏕️ Camp hover');
      hoverBorder.clear();
      hoverBorder.rect(campX - 65, campY - 60, 130, 110).stroke({ width: 3, color: 0xffcc00 });
      hoverBorder.visible = true;
    });

    this.campClickArea.on('pointerout', () => {
      console.log('🏕️ Camp hover out');
      hoverBorder.visible = false;
    });

    // Click event
    this.campClickArea.on('pointerdown', event => {
      console.log('🏕️ Camp pointerdown event fired!');
      event.stopPropagation();
      event.preventDefault();
      if (this.onCampClickCallback) {
        console.log('🏕️ Calling camp click callback');
        this.onCampClickCallback();
      } else {
        console.log('⚠️ No camp click callback set!');
      }
    });

    // Add to stage at a high z-index to ensure it's on top
    const stageChildCount = this.app.stage.children.length;
    console.log('🏕️ Stage has', stageChildCount, 'children, adding camp click area');
    this.app.stage.addChild(this.campClickArea);
    console.log(
      '🏕️ Camp click area added, now stage has',
      this.app.stage.children.length,
      'children'
    );
  }

  public clear(): void {
    this.mapContainer.clear();
    this.pathGraphics.clear();

    // Clean up click area
    if (this.campClickArea) {
      this.app.stage.removeChild(this.campClickArea);
      this.campClickArea.destroy();
      this.campClickArea = null;
    }
  }
}
