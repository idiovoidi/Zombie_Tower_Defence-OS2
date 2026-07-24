import { DebugConstants } from '../config/debugConstants';
import { GameConfig } from '../config/gameConfig';
import { TowerConstants, type TowerStats } from '../config/towerConstants';
import { debugMul, debugMulFloor } from '../debug/debugScale';

export class TowerManager {
  private static instance: TowerManager | null = null;
  private towerData: Map<string, TowerStats>;

  private constructor() {
    this.towerData = new Map<string, TowerStats>();
    this.initializeTowerData();
  }

  public static getInstance(): TowerManager {
    if (!TowerManager.instance) {
      TowerManager.instance = new TowerManager();
    }
    return TowerManager.instance;
  }

  // Initialize tower data from constants
  private initializeTowerData(): void {
    // Load tower stats from centralized constants
    this.towerData.set(GameConfig.TOWER_TYPES.MACHINE_GUN, TowerConstants.MACHINE_GUN);
    this.towerData.set(GameConfig.TOWER_TYPES.SNIPER, TowerConstants.SNIPER);
    this.towerData.set(GameConfig.TOWER_TYPES.SHOTGUN, TowerConstants.SHOTGUN);
    this.towerData.set(GameConfig.TOWER_TYPES.FLAME, TowerConstants.FLAME);
    this.towerData.set(GameConfig.TOWER_TYPES.TESLA, TowerConstants.TESLA);
    this.towerData.set(GameConfig.TOWER_TYPES.GRENADE, TowerConstants.GRENADE);
    this.towerData.set(GameConfig.TOWER_TYPES.SLUDGE, TowerConstants.SLUDGE);
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
    if (!baseStats) {
      return 0;
    }

    // Simple damage scaling with upgrades
    const damage = Math.floor(baseStats.damage * (1 + upgradeLevel * 0.5));
    return debugMulFloor(damage, DebugConstants.TOWER_DAMAGE_MULTIPLIER);
  }

  // Calculate tower range with upgrades
  public calculateTowerRange(type: string, upgradeLevel: number): number {
    const baseStats = this.towerData.get(type);
    if (!baseStats) {
      return 0;
    }

    // Simple range scaling with upgrades
    const range = Math.floor(baseStats.range * (1 + upgradeLevel * 0.2));
    return debugMulFloor(range, DebugConstants.TOWER_RANGE_MULTIPLIER);
  }

  // Calculate tower fire rate with upgrades
  public calculateTowerFireRate(type: string, upgradeLevel: number): number {
    const baseStats = this.towerData.get(type);
    if (!baseStats) {
      return 0;
    }

    // Machine gun gets significant fire rate boost with upgrades
    let fireRate: number;
    if (type === 'MachineGun') {
      // +30% fire rate per level
      fireRate = baseStats.fireRate * (1 + upgradeLevel * 0.3);
    } else {
      // Other towers get minor fire rate boost
      // +10% fire rate per level
      fireRate = baseStats.fireRate * (1 + upgradeLevel * 0.1);
    }
    return debugMul(fireRate, DebugConstants.TOWER_FIRE_RATE_MULTIPLIER);
  }

  // Calculate upgrade cost based on design formula
  public calculateUpgradeCost(type: string, upgradeLevel: number): number {
    const baseStats = this.towerData.get(type);
    if (!baseStats) {
      return 0;
    }

    // Use the upgrade cost multiplier if available, otherwise default to 0.75
    const multiplier = baseStats.upgradeCostMultiplier || 0.75;

    // Formula: upgradeCost = baseCost × (upgradeLevel + 1) × upgradeCostMultiplier
    const cost = Math.floor(baseStats.cost * (upgradeLevel + 1) * multiplier);
    return debugMulFloor(cost, DebugConstants.UPGRADE_COST_MULTIPLIER);
  }

  // Get tower cost by type
  public getTowerCost(type: string): number {
    const baseStats = this.towerData.get(type);
    if (!baseStats) {
      return 0;
    }
    return debugMulFloor(baseStats.cost, DebugConstants.TOWER_COST_MULTIPLIER);
  }
}
