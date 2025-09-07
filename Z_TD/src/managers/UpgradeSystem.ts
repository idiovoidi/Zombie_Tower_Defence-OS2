import { Tower } from '../objects/Tower';
import { ResourceManager, ResourceCost } from './ResourceManager';

export class UpgradeSystem {
  private resourceManager: ResourceManager;
  
  constructor(resourceManager: ResourceManager) {
    this.resourceManager = resourceManager;
  }
  
  // Check if a tower can be upgraded
  public canUpgrade(tower: Tower): boolean {
    // Check if tower is at max level
    if (!tower.canUpgrade()) {
      return false;
    }
    
    // Check if player has enough resources
    const upgradeCost = this.getUpgradeCost(tower);
    return this.resourceManager.canAfford(upgradeCost);
  }
  
  // Perform the upgrade operation
  public performUpgrade(tower: Tower): boolean {
    // Check if upgrade is possible
    if (!this.canUpgrade(tower)) {
      return false;
    }
    
    // Get the cost and deduct it
    const upgradeCost = this.getUpgradeCost(tower);
    if (this.resourceManager.spend(upgradeCost)) {
      // Perform the actual upgrade
      tower.upgrade();
      return true;
    }
    
    return false;
  }
  
  // Get the cost for upgrading a tower
  public getUpgradeCost(tower: Tower): ResourceCost {
    const cost = tower.getUpgradeCost();
    return {
      money: cost
    };
  }
  
  // Get the resource manager (for UI purposes)
  public getResourceManager(): ResourceManager {
    return this.resourceManager;
  }
}