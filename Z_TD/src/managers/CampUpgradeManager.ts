export interface CampUpgrade {
  id: string;
  name: string;
  description: string;
  level: number;
  maxLevel: number;
  baseCost: number;
  effect: {
    type: 'resource_generation' | 'tower_damage' | 'tower_range' | 'starting_money' | 'lives';
    value: number; // Percentage or flat value
  };
}

export interface CampUpgradeState {
  upgrades: Map<string, number>; // upgrade id -> current level
  totalInvested: number;
}

export class CampUpgradeManager {
  private upgradeStates: Map<string, number> = new Map();
  private totalInvested: number = 0;
  private availableUpgrades: Map<string, CampUpgrade>;

  constructor() {
    this.availableUpgrades = new Map();
    this.initializeUpgrades();
  }

  private initializeUpgrades(): void {
    // Resource Generation Upgrades
    this.availableUpgrades.set('resource_gen_wood', {
      id: 'resource_gen_wood',
      name: 'Lumber Mill',
      description: '+20% wood generation per level',
      level: 0,
      maxLevel: 5,
      baseCost: 150,
      effect: {
        type: 'resource_generation',
        value: 0.2, // 20% per level
      },
    });

    this.availableUpgrades.set('resource_gen_metal', {
      id: 'resource_gen_metal',
      name: 'Scrap Yard',
      description: '+20% metal generation per level',
      level: 0,
      maxLevel: 5,
      baseCost: 150,
      effect: {
        type: 'resource_generation',
        value: 0.2,
      },
    });

    this.availableUpgrades.set('resource_gen_energy', {
      id: 'resource_gen_energy',
      name: 'Generator',
      description: '+20% energy generation per level',
      level: 0,
      maxLevel: 5,
      baseCost: 150,
      effect: {
        type: 'resource_generation',
        value: 0.2,
      },
    });

    // Tower Upgrades
    this.availableUpgrades.set('tower_damage', {
      id: 'tower_damage',
      name: 'Armory',
      description: '+10% tower damage per level',
      level: 0,
      maxLevel: 5,
      baseCost: 200,
      effect: {
        type: 'tower_damage',
        value: 0.1,
      },
    });

    this.availableUpgrades.set('tower_range', {
      id: 'tower_range',
      name: 'Watchtower Network',
      description: '+8% tower range per level',
      level: 0,
      maxLevel: 5,
      baseCost: 200,
      effect: {
        type: 'tower_range',
        value: 0.08,
      },
    });

    // Economy Upgrades
    this.availableUpgrades.set('starting_money', {
      id: 'starting_money',
      name: 'Supply Cache',
      description: '+$100 starting money per level',
      level: 0,
      maxLevel: 3,
      baseCost: 300,
      effect: {
        type: 'starting_money',
        value: 100,
      },
    });

    // Survival Upgrades
    this.availableUpgrades.set('extra_lives', {
      id: 'extra_lives',
      name: 'Reinforcements',
      description: '+10 max survivors per level',
      level: 0,
      maxLevel: 3,
      baseCost: 400,
      effect: {
        type: 'lives',
        value: 10,
      },
    });

    // Initialize all upgrades at level 0
    this.availableUpgrades.forEach((upgrade, id) => {
      this.upgradeStates.set(id, 0);
    });
  }

  public getAvailableUpgrades(): CampUpgrade[] {
    const upgrades: CampUpgrade[] = [];
    this.availableUpgrades.forEach((upgrade, id) => {
      const currentLevel = this.upgradeStates.get(id) || 0;
      upgrades.push({
        ...upgrade,
        level: currentLevel,
      });
    });
    return upgrades;
  }

  public getUpgrade(id: string): CampUpgrade | undefined {
    const upgrade = this.availableUpgrades.get(id);
    if (!upgrade) {
      return undefined;
    }

    const currentLevel = this.upgradeStates.get(id) || 0;
    return {
      ...upgrade,
      level: currentLevel,
    };
  }

  public canUpgrade(id: string): boolean {
    const upgrade = this.availableUpgrades.get(id);
    if (!upgrade) {
      return false;
    }

    const currentLevel = this.upgradeStates.get(id) || 0;
    return currentLevel < upgrade.maxLevel;
  }

  public getUpgradeCost(id: string): number {
    const upgrade = this.availableUpgrades.get(id);
    if (!upgrade) {
      return 0;
    }

    const currentLevel = this.upgradeStates.get(id) || 0;
    // Cost increases by 50% per level
    return Math.floor(upgrade.baseCost * Math.pow(1.5, currentLevel));
  }

  public purchaseUpgrade(id: string): boolean {
    if (!this.canUpgrade(id)) {
      return false;
    }

    const currentLevel = this.upgradeStates.get(id) || 0;
    const cost = this.getUpgradeCost(id);

    this.upgradeStates.set(id, currentLevel + 1);
    this.totalInvested += cost;

    return true;
  }

  public getUpgradeLevel(id: string): number {
    return this.upgradeStates.get(id) || 0;
  }

  public getTotalInvested(): number {
    return this.totalInvested;
  }

  // Get total bonus for a specific effect type
  public getTotalBonus(effectType: string): number {
    let totalBonus = 0;

    this.availableUpgrades.forEach((upgrade, id) => {
      if (upgrade.effect.type === effectType) {
        const level = this.upgradeStates.get(id) || 0;
        totalBonus += upgrade.effect.value * level;
      }
    });

    return totalBonus;
  }

  // Get multiplier for percentage-based bonuses
  public getMultiplier(effectType: string): number {
    return 1 + this.getTotalBonus(effectType);
  }

  // Get flat bonus for value-based bonuses
  public getFlatBonus(effectType: string): number {
    return this.getTotalBonus(effectType);
  }

  // Reset all upgrades (for new game)
  public reset(): void {
    this.upgradeStates.clear();
    this.totalInvested = 0;
    this.availableUpgrades.forEach((upgrade, id) => {
      this.upgradeStates.set(id, 0);
    });
  }

  // Save/Load state
  public getState(): CampUpgradeState {
    return {
      upgrades: new Map(this.upgradeStates),
      totalInvested: this.totalInvested,
    };
  }

  public loadState(state: CampUpgradeState): void {
    this.upgradeStates = new Map(state.upgrades);
    this.totalInvested = state.totalInvested;
  }
}
