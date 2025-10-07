import { GameConfig } from '../config/gameConfig';
import { TowerConstants, getTowerStats, type TowerStats } from '../config/towerConstants';

export class TowerManager {
  private towerData: Map<string, TowerStats>;

  constructor() {
    this.towerData = new Map<string, TowerStats>();
    this.initializeTowerData();
  }

  // Initialize tower data from constants
  private initializeTowerData(): void {
    // Load tower stats from centralized constants
    this.towerData.set(GameConfig.TOWER_TYPES.MACHINE_GUN, TowerConstants.MACHINE_GUN);
    this.towerData.set(GameConfig.TOWER_TYPES.SNIPER, TowerConstants.SNIPER);
    this.towerData.set(GameConfig.TOWER_TYPES.SHOTGUN, TowerConstants.SHOTGUN);
    this.towerData.set(GameConfig.TOWER_TYPES.FLAME, TowerConstants.FLAME);
    this.towerData.set(GameConfig.TOWER_TYPES.TESLA, TowerConstants.TESLA);
  }

  // Get tower stats by type
  public getTowerStats(type: string): TowerStats | undefined {
    return this.towerData.get(type);
  }

  // Get all tower types
  public getTowerTypes(): string[] {
    return Array.from(this.towerData.keys());
  }

  // Calculate tower damage with upgrades
  public calculateTowerDamage(type: string, upgradeLevel: number): number {
    const baseStats = this.towerData.get(type);
    if (!baseStats) return 0;

    // Simple damage scaling with upgrades
    return Math.floor(baseStats.damage * (1 + upgradeLevel * 0.5));
  }

  // Calculate tower range with upgrades
  public calculateTowerRange(type: string, upgradeLevel: number): number {
    const baseStats = this.towerData.get(type);
    if (!baseStats) return 0;

    // Simple range scaling with upgrades
    return Math.floor(baseStats.range * (1 + upgradeLevel * 0.2));
  }

  // Calculate upgrade cost based on design formula
  public calculateUpgradeCost(type: string, upgradeLevel: number): number {
    const baseStats = this.towerData.get(type);
    if (!baseStats) return 0;

    // Use the upgrade cost multiplier if available, otherwise default to 0.75
    const multiplier = baseStats.upgradeCostMultiplier || 0.75;

    // Formula: upgradeCost = baseCost × (upgradeLevel + 1) × upgradeCostMultiplier
    return Math.floor(baseStats.cost * (upgradeLevel + 1) * multiplier);
  }

  // Get tower cost by type
  public getTowerCost(type: string): number {
    const baseStats = this.towerData.get(type);
    return baseStats ? baseStats.cost : 0;
  }
}
