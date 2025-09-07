import { UpgradeSystem } from './UpgradeSystem';
import { ResourceManager } from './ResourceManager';

// Simple mock for Tower that doesn't depend on Pixi.js
class MockTower {
  private type: string;
  private upgradeLevel: number = 1;
  private maxUpgradeLevel: number = 5;
  private upgradeCost: number = 100;
  private canUpgradeFlag: boolean = true;
  private damage: number = 20;
  private range: number = 150;
  private fireRate: number = 10;
  
  constructor(type: string) {
    this.type = type;
  }
  
  public getType(): string {
    return this.type;
  }
  
  public getUpgradeLevel(): number {
    return this.upgradeLevel;
  }
  
  public getMaxUpgradeLevel(): number {
    return this.maxUpgradeLevel;
  }
  
  public getUpgradeCost(): number {
    return this.upgradeCost;
  }
  
  public canUpgrade(): boolean {
    return this.canUpgradeFlag && this.upgradeLevel < this.maxUpgradeLevel;
  }
  
  public upgrade(): void {
    if (this.canUpgrade()) {
      this.upgradeLevel++;
      // Simple stat scaling for mock
      this.damage = Math.floor(this.damage * 1.5);
      this.range = Math.floor(this.range * 1.2);
    }
  }
  
  public getDamage(): number {
    return this.damage;
  }
  
  public getRange(): number {
    return this.range;
  }
  
  public getFireRate(): number {
    return this.fireRate;
  }
  
  // Test helpers
  public setUpgradeCost(cost: number): void {
    this.upgradeCost = cost;
  }
  
  public setCanUpgrade(canUpgrade: boolean): void {
    this.canUpgradeFlag = canUpgrade;
  }
  
  public setMaxUpgradeLevel(level: number): void {
    this.maxUpgradeLevel = level;
  }
}

describe('UpgradeSystem', () => {
  let upgradeSystem: UpgradeSystem;
  let resourceManager: ResourceManager;
  let mockTower: MockTower;

  beforeEach(() => {
    resourceManager = new ResourceManager();
    upgradeSystem = new UpgradeSystem(resourceManager);
    mockTower = new MockTower('MachineGun');
  });

  it('should be able to check if a tower can be upgraded', () => {
    // Test when player has enough resources
    resourceManager.add(1000, 0, 0, 0);
    mockTower.setUpgradeCost(100);
    mockTower.setCanUpgrade(true);
    
    expect(upgradeSystem.canUpgrade(mockTower)).toBe(true);
  });

  it('should not allow upgrade when tower is at max level', () => {
    // Set tower to max level
    mockTower.setCanUpgrade(false);
    mockTower.setUpgradeCost(100);
    resourceManager.add(1000, 0, 0, 0);
    
    expect(upgradeSystem.canUpgrade(mockTower)).toBe(false);
  });

  it('should not allow upgrade when player lacks resources', () => {
    // Set tower to be upgradeable but player lacks funds
    mockTower.setCanUpgrade(true);
    mockTower.setUpgradeCost(1000);
    resourceManager.add(100, 0, 0, 0); // Only 100 money
    
    expect(upgradeSystem.canUpgrade(mockTower)).toBe(false);
  });

  it('should successfully perform an upgrade when possible', () => {
    // Set up conditions for successful upgrade
    mockTower.setCanUpgrade(true);
    mockTower.setUpgradeCost(100);
    resourceManager.add(500, 0, 0, 0); // 500 money
    
    const initialMoney = resourceManager.getMoney();
    const result = upgradeSystem.performUpgrade(mockTower);
    
    expect(result).toBe(true);
    expect(resourceManager.getMoney()).toBe(initialMoney - 100);
  });

  it('should fail to perform an upgrade when not possible', () => {
    // Set up conditions for failed upgrade (insufficient funds)
    mockTower.setCanUpgrade(true);
    mockTower.setUpgradeCost(1000);
    resourceManager.add(100, 0, 0, 0); // Only 100 money
    
    const initialMoney = resourceManager.getMoney();
    const result = upgradeSystem.performUpgrade(mockTower);
    
    expect(result).toBe(false);
    expect(resourceManager.getMoney()).toBe(initialMoney); // Money should not change
  });

  it('should correctly calculate upgrade costs', () => {
    mockTower.setUpgradeCost(150);
    const cost = upgradeSystem.getUpgradeCost(mockTower);
    
    expect(cost.money).toBe(150);
  });

  it('should provide access to the resource manager', () => {
    expect(upgradeSystem.getResourceManager()).toBe(resourceManager);
  });
});