/**
 * EconomyState - Single owner for money, tower upgrades, and tower sales.
 *
 * GameManager and UI must route economy mutations through this object.
 */

import { GameConfig } from '../config/gameConfig';
import type { ITower } from '../objects/Tower.interface';
import { EventBus, GameEvents } from '../utils/EventBus';
import { ResourceManager } from './ResourceManager';
import { TowerManager } from './TowerManager';
import { UpgradeManager } from './UpgradeManager';

interface EconomyConfig {
  startingMoney?: number;
  /** Defaults to TowerManager.getInstance() — inject from GameManager composition root. */
  costCatalog?: TowerManager;
  eventBus?: EventBus;
}

export class EconomyState {
  private resourceManager: ResourceManager;
  private upgradeManager: UpgradeManager;
  private costCatalog: TowerManager;
  private eventBus: EventBus;

  constructor(config?: EconomyConfig) {
    this.resourceManager = new ResourceManager();
    this.costCatalog = config?.costCatalog ?? TowerManager.getInstance();
    this.eventBus = config?.eventBus ?? EventBus.getInstance();
    this.upgradeManager = new UpgradeManager(this.resourceManager, this.costCatalog);

    const startingMoney = config?.startingMoney ?? GameConfig.STARTING_MONEY;
    this.applyStartingMoney(startingMoney);
  }

  private applyStartingMoney(startingMoney: number): void {
    const current = this.resourceManager.getMoney();
    if (startingMoney !== current) {
      this.resourceManager.add(startingMoney - current);
    }
  }

  private recreateUpgradeManager(): void {
    this.upgradeManager = new UpgradeManager(this.resourceManager, this.costCatalog);
  }

  // Money management
  public addMoney(amount: number): void {
    this.resourceManager.add(amount);
    this.eventBus.emit(GameEvents.MONEY_EARNED, amount);
  }

  public spendMoney(amount: number): boolean {
    const success = this.resourceManager.spend({ money: amount });
    if (success) {
      this.eventBus.emit(GameEvents.MONEY_SPENT, amount);
    }
    return success;
  }

  public getMoney(): number {
    return this.resourceManager.getMoney();
  }

  public canAfford(amount: number): boolean {
    return this.resourceManager.canAfford({ money: amount });
  }

  // Upgrade / sell
  public canUpgradeTower(tower: ITower): boolean {
    return this.upgradeManager.canUpgrade(tower);
  }

  public getUpgradeCost(tower: ITower): number {
    return this.upgradeManager.getUpgradeCost(tower).money;
  }

  public getSellValue(tower: ITower): number {
    return this.upgradeManager.getSellValue(tower);
  }

  /**
   * Spend for the next upgrade and apply tower.upgrade().
   * Emits MONEY_SPENT and TOWER_UPGRADED. Caller refreshes placement visuals.
   */
  public upgradeTower(tower: ITower): boolean {
    if (!tower.canUpgrade()) {
      return false;
    }

    const cost = this.getUpgradeCost(tower);
    if (!this.spendMoney(cost)) {
      return false;
    }

    tower.upgrade();

    this.eventBus.emit(GameEvents.TOWER_UPGRADED, {
      type: tower.getType(),
      cost,
      level: tower.getUpgradeLevel(),
    });

    return true;
  }

  /**
   * Refund sell value for a tower (does not remove it from the map).
   * Emits MONEY_EARNED and TOWER_SOLD. Caller must remove the tower afterward.
   */
  public sellTower(tower: ITower): number {
    const sellValue = this.getSellValue(tower);
    const type = tower.getType();

    this.addMoney(sellValue);

    this.eventBus.emit(GameEvents.TOWER_SOLD, {
      type,
      cost: sellValue,
    });

    return sellValue;
  }

  public getResourceManager(): ResourceManager {
    return this.resourceManager;
  }

  public getUpgradeManager(): UpgradeManager {
    return this.upgradeManager;
  }

  public reset(startingMoney: number): void {
    this.resourceManager = new ResourceManager();
    this.applyStartingMoney(startingMoney);
    this.recreateUpgradeManager();
  }

  public dispose(): void {
    // No event listeners owned here
  }
}
