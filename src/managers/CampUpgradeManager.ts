export interface CampUpgrade {
  id: string;
  name: string;
  description: string;
  baseCost: number;
  level: number;
  maxLevel: number;
}

export class CampUpgradeManager {
  private upgrades: Map<string, CampUpgrade>;

  constructor() {
    this.upgrades = new Map();
    this.initializeUpgrades();
  }

  private initializeUpgrades(): void {
    // Define available camp upgrades
    this.upgrades.set('defense', {
      id: 'defense',
      name: 'Fortifications',
      description: 'Increase starting lives',
      baseCost: 500,
      level: 0,
      maxLevel: 5,
    });

    this.upgrades.set('economy', {
      id: 'economy',
      name: 'Scavenging',
      description: 'Increase starting money',
      baseCost: 400,
      level: 0,
      maxLevel: 5,
    });

    this.upgrades.set('training', {
      id: 'training',
      name: 'Training Grounds',
      description: 'Reduce tower costs by 5% per level',
      baseCost: 600,
      level: 0,
      maxLevel: 5,
    });
  }

  public getAvailableUpgrades(): CampUpgrade[] {
    return Array.from(this.upgrades.values());
  }

  public canUpgrade(upgradeId: string): boolean {
    const upgrade = this.upgrades.get(upgradeId);
    if (!upgrade) {
      return false;
    }
    return upgrade.level < upgrade.maxLevel;
  }

  public getUpgradeCost(upgradeId: string): number {
    const upgrade = this.upgrades.get(upgradeId);
    if (!upgrade) {
      return 0;
    }

    // Cost increases with each level
    return Math.floor(upgrade.baseCost * Math.pow(1.5, upgrade.level));
  }

  public purchaseUpgrade(upgradeId: string): boolean {
    const upgrade = this.upgrades.get(upgradeId);
    if (!upgrade || !this.canUpgrade(upgradeId)) {
      return false;
    }

    upgrade.level++;
    return true;
  }

  public getUpgradeLevel(upgradeId: string): number {
    const upgrade = this.upgrades.get(upgradeId);
    return upgrade ? upgrade.level : 0;
  }
}
