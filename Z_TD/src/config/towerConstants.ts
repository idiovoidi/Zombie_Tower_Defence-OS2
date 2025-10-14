/**
 * Tower Constants - Centralized tower stats for easy balancing
 *
 * Adjust these values to quickly balance tower performance
 */

export interface TowerStats {
  cost: number;
  damage: number;
  range: number;
  fireRate: number; // shots per second
  specialAbility?: string;
  upgradeCostMultiplier?: number;
}

export const TowerConstants = {
  // Machine Gun Tower - High fire rate, good against swarms
  MACHINE_GUN: {
    cost: 250,
    damage: 20,
    range: 150,
    fireRate: 10, // 10 shots per second
    specialAbility: 'High fire rate, good against swarms',
    upgradeCostMultiplier: 0.75,
  } as TowerStats,

  // Sniper Tower - High single-target damage, armor-piercing
  SNIPER: {
    cost: 500,
    damage: 150,
    range: 400,
    fireRate: 1, // 1 shot per second
    specialAbility: 'High single-target damage, armor-piercing',
    upgradeCostMultiplier: 0.75,
  } as TowerStats,

  // Shotgun Tower - Multiple target hits, good crowd control
  SHOTGUN: {
    cost: 800,
    damage: 40,
    range: 100,
    fireRate: 3, // 3 shots per second
    specialAbility: 'Multiple target hits, good crowd control',
    upgradeCostMultiplier: 0.75,
  } as TowerStats,

  // Flame Tower - Area damage over time, burning effect
  FLAME: {
    cost: 600,
    damage: 200,
    range: 120,
    fireRate: 0.75, // 0.75 shots per second (one shot every ~1.3 seconds)
    specialAbility: 'Area damage over time, burning effect',
    upgradeCostMultiplier: 0.75,
  } as TowerStats,

  // Tesla Tower - Chain lightning, affects multiple targets
  TESLA: {
    cost: 1500,
    damage: 80,
    range: 200,
    fireRate: 2, // 2 shots per second
    specialAbility: 'Chain lightning, affects multiple targets',
    upgradeCostMultiplier: 0.75,
  } as TowerStats,
};

/**
 * Get tower stats by type name
 */
export function getTowerStats(type: string): TowerStats | undefined {
  switch (type) {
    case 'MachineGun':
      return TowerConstants.MACHINE_GUN;
    case 'Sniper':
      return TowerConstants.SNIPER;
    case 'Shotgun':
      return TowerConstants.SHOTGUN;
    case 'Flame':
      return TowerConstants.FLAME;
    case 'Tesla':
      return TowerConstants.TESLA;
    default:
      return undefined;
  }
}

/**
 * Calculate tower damage with upgrades
 */
export function calculateTowerDamage(type: string, upgradeLevel: number): number {
  const stats = getTowerStats(type);
  if (!stats) return 0;

  // Simple damage scaling: +50% per upgrade level
  return Math.floor(stats.damage * (1 + upgradeLevel * 0.5));
}

/**
 * Calculate tower range with upgrades
 */
export function calculateTowerRange(type: string, upgradeLevel: number): number {
  const stats = getTowerStats(type);
  if (!stats) return 0;

  // Simple range scaling: +20% per upgrade level
  return Math.floor(stats.range * (1 + upgradeLevel * 0.2));
}

/**
 * Calculate upgrade cost
 */
export function calculateUpgradeCost(type: string, upgradeLevel: number): number {
  const stats = getTowerStats(type);
  if (!stats) return 0;

  const multiplier = stats.upgradeCostMultiplier || 0.75;
  // Formula: upgradeCost = baseCost × (upgradeLevel + 1) × upgradeCostMultiplier
  return Math.floor(stats.cost * (upgradeLevel + 1) * multiplier);
}
