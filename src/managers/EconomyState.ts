/**
 * EconomyState - Contextual object that encapsulates resource and upgrade management
 *
 * This groups ResourceManager and UpgradeManager to handle all economy-related
 * functionality in a cohesive unit, reducing direct dependencies in GameManager.
 * GameManager must delegate money reads/writes here — this is the single money owner.
 */

import { GameConfig } from '../config/gameConfig';
import type { ITower } from '../objects/Tower.interface';
import { EventBus, GameEvents } from '../utils/EventBus';
import { ResourceManager } from './ResourceManager';
import { UpgradeManager } from './UpgradeManager';

interface EconomyConfig {
  startingMoney?: number;
}

export class EconomyState {
  private resourceManager: ResourceManager;
  private upgradeManager: UpgradeManager;

  constructor(config?: EconomyConfig) {
    this.resourceManager = new ResourceManager();
    this.upgradeManager = new UpgradeManager(this.resourceManager);

    const startingMoney = config?.startingMoney ?? GameConfig.STARTING_MONEY;
    this.applyStartingMoney(startingMoney);
  }

  private applyStartingMoney(startingMoney: number): void {
    const current = this.resourceManager.getMoney();
    if (startingMoney !== current) {
      this.resourceManager.add(startingMoney - current);
    }
  }

  // Money management
  public addMoney(amount: number): void {
    this.resourceManager.add(amount);
    // Emit event for notification (not for action - prevents circular flow)
    EventBus.getInstance().emit(GameEvents.MONEY_EARNED, amount);
  }

  public spendMoney(amount: number): boolean {
    const success = this.resourceManager.spend({ money: amount });
    if (success) {
      // Emit event for notification (not for action - prevents circular flow)
      EventBus.getInstance().emit(GameEvents.MONEY_SPENT, amount);
    }
    return success;
  }

  public getMoney(): number {
    return this.resourceManager.getMoney();
  }

  public canAfford(amount: number): boolean {
    return this.resourceManager.canAfford({ money: amount });
  }

  // Upgrade management
  public canUpgradeTower(tower: ITower): boolean {
    return this.upgradeManager.canUpgrade(tower);
  }

  public upgradeTower(tower: ITower): boolean {
    const cost = this.getUpgradeCost(tower);
    const success = this.upgradeManager.performUpgrade(tower);
    if (success) {
      // Emit event for successful upgrade
      EventBus.getInstance().emit(GameEvents.TOWER_UPGRADED, {
        type: tower.getType(),
        cost: cost,
        level: tower.getUpgradeLevel(),
      });
    }
    return success;
  }

  public getUpgradeCost(tower: ITower): number {
    const cost = this.upgradeManager.getUpgradeCost(tower);
    return cost.money;
  }

  // Manager getters
  public getResourceManager(): ResourceManager {
    return this.resourceManager;
  }

  public getUpgradeManager(): UpgradeManager {
    return this.upgradeManager;
  }

  /**
   * Reset economy state for a new game
   * @param startingMoney - Initial money amount
   */
  public reset(startingMoney: number): void {
    this.resourceManager = new ResourceManager();
    this.applyStartingMoney(startingMoney);
    this.upgradeManager = new UpgradeManager(this.resourceManager);
  }

  /**
   * Dispose of resources
   */
  public dispose(): void {
    // No event listeners to clean up in this refactored version
  }
}
