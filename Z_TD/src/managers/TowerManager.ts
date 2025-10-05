import { GameConfig } from '../config/gameConfig';

export interface TowerStats {
  cost: number;
  damage: number;
  range: number;
  fireRate: number; // shots per second
  specialAbility?: string;
  upgradeCostMultiplier?: number; // New property for upgrade cost scaling
}

export class TowerManager {
  private towerData: Map<string, TowerStats>;

  constructor() {
    this.towerData = new Map<string, TowerStats>();
    this.initializeTowerData();
  }

  // Initialize tower data based on design document
  private initializeTowerData(): void {
    // Machine Gun Tower
    this.towerData.set(GameConfig.TOWER_TYPES.MACHINE_GUN, {
      cost: 100,
      damage: 20,
      range: 150,
      fireRate: 10, // 10 shots per second
      specialAbility: 'High fire rate, good against swarms',
      upgradeCostMultiplier: 0.75, // Upgrade cost multiplier
    });

    // Sniper Tower
    this.towerData.set(GameConfig.TOWER_TYPES.SNIPER, {
      cost: 250,
      damage: 150,
      range: 400,
      fireRate: 1, // 1 shot per second
      specialAbility: 'High single-target damage, armor-piercing',
      upgradeCostMultiplier: 0.75,
    });

    // Shotgun Tower
    this.towerData.set(GameConfig.TOWER_TYPES.SHOTGUN, {
      cost: 180,
      damage: 40,
      range: 100,
      fireRate: 3, // 3 shots per second
      specialAbility: 'Multiple target hits, good crowd control',
      upgradeCostMultiplier: 0.75,
    });

    // Flame Tower
    this.towerData.set(GameConfig.TOWER_TYPES.FLAME, {
      cost: 200,
      damage: 30,
      range: 120,
      fireRate: 5, // 5 shots per second
      specialAbility: 'Area damage over time, burning effect',
      upgradeCostMultiplier: 0.75,
    });

    // Tesla Tower
    this.towerData.set(GameConfig.TOWER_TYPES.TESLA, {
      cost: 300,
      damage: 80,
      range: 200,
      fireRate: 2, // 2 shots per second
      specialAbility: 'Chain lightning, affects multiple targets',
      upgradeCostMultiplier: 0.75,
    });
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
