import { ResourceCost, ResourceManager } from './ResourceManager';
import { ITower } from '../objects/Tower.interface';

export class UpgradeSystem {
  private resourceManager: ResourceManager;

  constructor(resourceManager: ResourceManager) {
    this.resourceManager = resourceManager;
  }

  /**
   * Check if a tower can be upgraded
   * @param tower The tower to check
   * @returns True if the tower can be upgraded, false otherwise
   */
  public canUpgrade(tower: ITower): boolean {
    // Check if tower is at max level
    if (tower.getUpgradeLevel() >= tower.getMaxUpgradeLevel()) {
      return false;
    }

    // Check if player has enough resources
    const cost = this.getUpgradeCost(tower);
    return this.resourceManager.canAfford(cost);
  }

  /**
   * Perform an upgrade on a tower
   * @param tower The tower to upgrade
   * @returns True if upgrade was successful, false otherwise
   */
  public performUpgrade(tower: ITower): boolean {
    if (!this.canUpgrade(tower)) {
      return false;
    }

    // Spend resources
    const cost = this.getUpgradeCost(tower);
    this.resourceManager.spend(cost);

    // Upgrade the tower
    tower.upgrade();

    return true;
  }

  /**
   * Get the cost to upgrade a tower
   * @param tower The tower to get upgrade cost for
   * @returns The resource cost for upgrading
   */
  public getUpgradeCost(tower: ITower): ResourceCost {
    const baseCost = tower.getUpgradeCost();
    const level = tower.getUpgradeLevel();

    // Scale cost based on current level (simple exponential scaling)
    const costMultiplier = Math.pow(1.5, level - 1);

    return {
      money: Math.floor(baseCost * costMultiplier),
    };
  }

  /**
   * Get the resource manager
   * @returns The resource manager
   */
  public getResourceManager(): ResourceManager {
    return this.resourceManager;
  }
}
