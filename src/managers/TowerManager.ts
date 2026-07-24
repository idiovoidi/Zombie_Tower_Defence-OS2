import { DebugConstants } from '../config/debugConstants';
import { GameConfig } from '../config/gameConfig';
import {
  calculateTowerDamage as calcDamageFromConstants,
  calculateTowerFireRate as calcFireRateFromConstants,
  calculateTowerRange as calcRangeFromConstants,
  calculateUpgradeCost as calcUpgradeCostFromConstants,
  TowerConstants,
  type TowerStats,
} from '../config/towerConstants';
import { debugMul, debugMulFloor } from '../debug/debugScale';

export class TowerManager {
  private static instance: TowerManager | null = null;
  private towerData: Map<string, TowerStats>;

  public constructor() {
    this.towerData = new Map<string, TowerStats>();
    this.initializeTowerData();
  }

  /** Composition root registers the shared catalog used by getInstance() callers. */
  public static setInstance(manager: TowerManager): void {
    TowerManager.instance = manager;
  }

  public static getInstance(): TowerManager {
    if (!TowerManager.instance) {
      TowerManager.instance = new TowerManager();
    }
    return TowerManager.instance;
  }

  /** Test helper */
  public static resetInstance(): void {
    TowerManager.instance = null;
  }

  private initializeTowerData(): void {
    this.towerData.set(GameConfig.TOWER_TYPES.MACHINE_GUN, TowerConstants.MACHINE_GUN);
    this.towerData.set(GameConfig.TOWER_TYPES.SNIPER, TowerConstants.SNIPER);
    this.towerData.set(GameConfig.TOWER_TYPES.SHOTGUN, TowerConstants.SHOTGUN);
    this.towerData.set(GameConfig.TOWER_TYPES.FLAME, TowerConstants.FLAME);
    this.towerData.set(GameConfig.TOWER_TYPES.TESLA, TowerConstants.TESLA);
    this.towerData.set(GameConfig.TOWER_TYPES.GRENADE, TowerConstants.GRENADE);
    this.towerData.set(GameConfig.TOWER_TYPES.SLUDGE, TowerConstants.SLUDGE);
  }

  public getTowerStats(type: string): TowerStats | undefined {
    return this.towerData.get(type);
  }

  public getTowerTypes(): string[] {
    return Array.from(this.towerData.keys());
  }

  /** Damage at display level — L1 equals catalog base (see balanceConstants). */
  public calculateTowerDamage(type: string, upgradeLevel: number): number {
    return debugMulFloor(
      calcDamageFromConstants(type, upgradeLevel),
      DebugConstants.TOWER_DAMAGE_MULTIPLIER
    );
  }

  public calculateTowerRange(type: string, upgradeLevel: number): number {
    return debugMulFloor(
      calcRangeFromConstants(type, upgradeLevel),
      DebugConstants.TOWER_RANGE_MULTIPLIER
    );
  }

  public calculateTowerFireRate(type: string, upgradeLevel: number): number {
    return debugMul(
      calcFireRateFromConstants(type, upgradeLevel),
      DebugConstants.TOWER_FIRE_RATE_MULTIPLIER
    );
  }

  public calculateUpgradeCost(type: string, upgradeLevel: number): number {
    return calcUpgradeCostFromConstants(type, upgradeLevel);
  }

  public getTowerCost(type: string): number {
    const baseStats = this.towerData.get(type);
    if (!baseStats) {
      return 0;
    }
    return debugMulFloor(baseStats.cost, DebugConstants.TOWER_COST_MULTIPLIER);
  }
}
