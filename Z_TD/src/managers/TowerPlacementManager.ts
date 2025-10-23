import { Container, FederatedPointerEvent, Graphics } from 'pixi.js';
import { Tower } from '../objects/Tower';
import { TowerFactory } from '../objects/TowerFactory';
import { TowerManager } from './TowerManager';
import { MapManager } from './MapManager';
import type { TransformComponent } from '../components/TransformComponent';

export class TowerPlacementManager {
  private container: Container;
  private towerManager: TowerManager;
  private mapManager: MapManager;
  private placedTowers: Tower[] = [];
  private ghostTower: Graphics | null = null;
  private selectedTowerType: string | null = null;
  private isPlacementMode: boolean = false;
  private selectedTower: Tower | null = null;
  private onTowerPlacedCallback: ((tower: Tower) => void) | null = null;
  private onTowerSelectedCallback: ((tower: Tower | null) => void) | null = null;
  private canAffordTower: boolean = true;
  private towersDirty: boolean = false; // Track when tower array changes

  constructor(container: Container, towerManager: TowerManager, mapManager: MapManager) {
    this.container = container;
    this.towerManager = towerManager;
    this.mapManager = mapManager;
  }

  // Start placement mode with selected tower type
  public startPlacement(towerType: string): void {
    this.selectedTowerType = towerType;
    this.isPlacementMode = true;
    this.createGhostTower(towerType);
  }

  // Cancel placement mode
  public cancelPlacement(): void {
    this.isPlacementMode = false;
    this.selectedTowerType = null;
    if (this.ghostTower) {
      this.container.removeChild(this.ghostTower);
      this.ghostTower.destroy();
      this.ghostTower = null;
    }
  }

  // Create ghost tower preview
  private createGhostTower(towerType: string): void {
    if (this.ghostTower) {
      this.container.removeChild(this.ghostTower);
      this.ghostTower.destroy();
    }

    this.ghostTower = new Graphics();
    this.ghostTower.alpha = 0.5;

    // Draw tower preview based on type
    this.drawGhostTower(this.ghostTower, towerType);

    // Draw range circle
    const stats = this.towerManager.getTowerStats(towerType);
    if (stats) {
      this.ghostTower.circle(0, 0, stats.range).stroke({ width: 2, color: 0x00ff00, alpha: 0.3 });
    }

    this.container.addChild(this.ghostTower);
  }

  private drawGhostTower(graphics: Graphics, towerType: string): void {
    const stats = this.towerManager.getTowerStats(towerType);
    if (!stats) {
      return;
    }

    // Draw based on tower type (simplified versions)
    switch (towerType) {
      case 'MachineGun':
        graphics.circle(0, 0, 20).fill(0x0000ff);
        graphics.moveTo(0, -20).lineTo(0, -35).stroke({ width: 3, color: 0x4169e1 });
        break;
      case 'Sniper':
        graphics.ellipse(0, 0, 15, 25).fill(0x2f4f4f);
        graphics.moveTo(0, -25).lineTo(0, -45).stroke({ width: 2, color: 0x696969 });
        break;
      case 'Shotgun':
        graphics.roundRect(-18, -18, 36, 36, 8).fill(0x8b4513);
        break;
      case 'Flame':
        graphics.circle(0, 0, 20).fill(0xff4500);
        break;
      case 'Tesla':
        graphics.circle(0, 0, 20).fill(0x00ced1);
        graphics.circle(0, 0, 10).fill(0x7fffd4);
        break;
      case 'Grenade':
        // Olive drab military platform
        graphics.rect(-20, -5, 40, 25).fill(0x6b8e23);
        graphics.rect(-20, -5, 40, 25).stroke({ width: 2, color: 0x556b2f });
        // Ammo crates
        graphics.rect(-12, 2, 10, 8).fill(0x8b7355);
        graphics.rect(2, 2, 10, 8).fill(0x8b7355);
        // Grenade symbols
        graphics.circle(-7, 6, 2).fill(0x2f4f2f);
        graphics.circle(7, 6, 2).fill(0x2f4f2f);
        break;
      case 'Sludge':
        // Toxic barrel platform
        graphics.rect(-18, -5, 36, 25).fill(0x4a5a3a);
        graphics.rect(-18, -5, 36, 25).stroke({ width: 2, color: 0x3a4a2a });
        // Toxic barrels
        graphics.rect(-10, 0, 8, 12).fill(0x228b22);
        graphics.rect(2, 0, 8, 12).fill(0x228b22);
        // Toxic symbols with glow
        graphics.circle(-6, 6, 3).fill({ color: 0x00ff00, alpha: 0.7 });
        graphics.circle(6, 6, 3).fill({ color: 0x00ff00, alpha: 0.7 });
        // Toxic glow effect
        graphics.circle(-6, 6, 5).fill({ color: 0x32cd32, alpha: 0.3 });
        graphics.circle(6, 6, 5).fill({ color: 0x32cd32, alpha: 0.3 });
        break;
    }
  }

  // Update ghost tower position
  public updateGhostPosition(x: number, y: number): void {
    if (this.ghostTower && this.isPlacementMode) {
      this.ghostTower.position.set(x, y);

      // Check if position is valid and if player can afford
      const isValidPosition = this.isValidPlacement(x, y);
      const canPlace = isValidPosition && this.canAffordTower;

      // Red if can't place (either invalid position or can't afford), white if can place
      this.ghostTower.tint = canPlace ? 0xffffff : 0xff0000;
    }
  }

  // Set whether the player can afford the current tower
  public setCanAfford(canAfford: boolean): void {
    this.canAffordTower = canAfford;
  }

  // Check if placement position is valid
  private isValidPlacement(x: number, y: number): boolean {
    // Check if position is on the path (should not be)
    const waypoints = this.mapManager.getWaypoints();
    for (let i = 0; i < waypoints.length - 1; i++) {
      const wp1 = waypoints[i];
      const wp2 = waypoints[i + 1];

      // Check distance to path segment
      const dist = this.distanceToSegment(x, y, wp1.x, wp1.y, wp2.x, wp2.y);
      if (dist < 50) {
        return false;
      } // Too close to path
    }

    // Check if too close to other towers
    for (const tower of this.placedTowers) {
      const transform = tower.getComponent<TransformComponent>('Transform');
      if (transform) {
        const pos = transform.position;
        const distance = Math.sqrt(Math.pow(x - pos.x, 2) + Math.pow(y - pos.y, 2));
        if (distance < 60) {
          return false;
        } // Too close to another tower
      }
    }

    // Check if within map bounds
    if (x < 50 || x > 974 || y < 50 || y > 718) {
      return false;
    }

    return true;
  }

  // Calculate distance from point to line segment
  private distanceToSegment(
    px: number,
    py: number,
    x1: number,
    y1: number,
    x2: number,
    y2: number
  ): number {
    const dx = x2 - x1;
    const dy = y2 - y1;
    const lengthSquared = dx * dx + dy * dy;

    if (lengthSquared === 0) {
      return Math.sqrt((px - x1) * (px - x1) + (py - y1) * (py - y1));
    }

    let t = ((px - x1) * dx + (py - y1) * dy) / lengthSquared;
    t = Math.max(0, Math.min(1, t));

    const projX = x1 + t * dx;
    const projY = y1 + t * dy;

    return Math.sqrt((px - projX) * (px - projX) + (py - projY) * (py - projY));
  }

  // Place tower at position
  public placeTower(x: number, y: number): Tower | null {
    if (!this.isPlacementMode || !this.selectedTowerType) {
      return null;
    }
    if (!this.isValidPlacement(x, y)) {
      return null;
    }

    const tower = TowerFactory.createTower(this.selectedTowerType, x, y);
    if (tower) {
      this.placedTowers.push(tower);
      this.towersDirty = true; // Mark towers as changed
      this.container.addChild(tower);

      // Make tower interactive for selection
      this.setupTowerInteraction(tower);

      if (this.onTowerPlacedCallback) {
        this.onTowerPlacedCallback(tower);
      }

      this.cancelPlacement();
      return tower;
    }

    return null;
  }

  // Set up tower interaction (separated for reusability)
  private setupTowerInteraction(tower: Tower): void {
    tower.eventMode = 'static';
    tower.cursor = 'pointer';

    // Remove any existing listeners to prevent duplicates
    tower.removeAllListeners('pointerdown');

    tower.on('pointerdown', (event: FederatedPointerEvent) => {
      event.stopPropagation();
      this.selectTower(tower);
    });
  }

  // Select a tower
  public selectTower(tower: Tower | null): void {
    // Deselect previous
    if (this.selectedTower) {
      this.selectedTower.hideSelectionEffect();
      this.selectedTower.hideRange();
    }

    this.selectedTower = tower;

    // Select new
    if (this.selectedTower) {
      this.selectedTower.showSelectionEffect();
      this.selectedTower.showRange(this.container);

      // Ensure tower interaction is set up (in case it was lost)
      this.setupTowerInteraction(this.selectedTower);
    }

    if (this.onTowerSelectedCallback) {
      this.onTowerSelectedCallback(tower);
    }
  }

  // Remove selected tower
  public removeSelectedTower(): boolean {
    if (!this.selectedTower) {
      return false;
    }

    const index = this.placedTowers.indexOf(this.selectedTower);
    if (index > -1) {
      this.container.removeChild(this.selectedTower);
      this.selectedTower.hideRange();
      this.selectedTower.destroy();
      this.placedTowers.splice(index, 1);
      this.towersDirty = true; // Mark towers as changed
      this.selectedTower = null;

      if (this.onTowerSelectedCallback) {
        this.onTowerSelectedCallback(null);
      }

      return true;
    }

    return false;
  }

  // Upgrade selected tower
  public upgradeSelectedTower(): boolean {
    if (!this.selectedTower) {
      return false;
    }

    if (this.selectedTower.canUpgrade()) {
      this.selectedTower.upgrade();

      // Re-setup interaction after upgrade (visual update might affect hit areas)
      this.setupTowerInteraction(this.selectedTower);

      // Refresh selection visuals
      this.selectedTower.hideSelectionEffect();
      this.selectedTower.showSelectionEffect();
      this.selectedTower.hideRange();
      this.selectedTower.showRange(this.container);

      return true;
    }

    return false;
  }

  // Getters
  public isInPlacementMode(): boolean {
    return this.isPlacementMode;
  }

  public getSelectedTower(): Tower | null {
    return this.selectedTower;
  }

  public getPlacedTowers(): Tower[] {
    return this.placedTowers;
  }

  // Check if towers array has changed since last check
  public areTowersDirty(): boolean {
    return this.towersDirty;
  }

  // Reset dirty flag after consuming the change
  public clearTowersDirty(): void {
    this.towersDirty = false;
  }

  // Callbacks
  public setTowerPlacedCallback(callback: (tower: Tower) => void): void {
    this.onTowerPlacedCallback = callback;
  }

  public setTowerSelectedCallback(callback: (tower: Tower | null) => void): void {
    this.onTowerSelectedCallback = callback;
  }

  // Clear all towers
  public clear(): void {
    for (const tower of this.placedTowers) {
      this.container.removeChild(tower);
      tower.destroy();
    }
    this.placedTowers = [];
    this.towersDirty = true; // Mark towers as changed
    this.selectedTower = null;
    this.cancelPlacement();
  }
}
