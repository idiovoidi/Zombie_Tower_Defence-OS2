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
  // Upgrades focus on fire rate rather than damage
  MACHINE_GUN: {
    cost: 250,
    damage: 12, // Lower base damage (was 20)
    range: 150,
    fireRate: 8, // 8 shots per second base (was 10)
    specialAbility: 'High fire rate, upgrades increase speed',
    upgradeCostMultiplier: 0.75,
  } as TowerStats,

  // Sniper Tower - High single-target damage, armor-piercing
  SNIPER: {
    cost: 900,
    damage: 150,
    range: 400,
    fireRate: 1, // 1 shot per second
    specialAbility: 'High single-target damage, armor-piercing',
    upgradeCostMultiplier: 0.75,
  } as TowerStats,

  // Shotgun Tower - Short range area denial, double barrel burst fire
  SHOTGUN: {
    cost: 400,
    damage: 60, // Higher damage per shot since it's split among many pellets
    range: 120, // Short range
    fireRate: 0.8, // Base fire rate (modified by burst mechanic)
    specialAbility: 'Double barrel: 2 quick shots then reload, cone spread',
    upgradeCostMultiplier: 0.75,
  } as TowerStats,

  // Flame Tower - Area damage over time, burning effect
  FLAME: {
    cost: 750,
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

  // Grenade Tower - Explosive area damage with arc trajectory
  GRENADE: {
    cost: 1250,
    damage: 90, // Splash damage
    range: 180,
    fireRate: 0.3,
    specialAbility: 'Explosive area damage, arc trajectory',
    upgradeCostMultiplier: 0.75,
  } as TowerStats,

  // Sludge Tower - Crowd control, creates slowing pools
  SLUDGE: {
    cost: 800,
    damage: 0, // No direct damage
    range: 150, // 3 tiles (50px per tile)
    fireRate: 0.83, // ~1.2 seconds between shots
    specialAbility: 'Creates toxic pools that slow zombies',
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
    case 'Grenade':
      return TowerConstants.GRENADE;
    case 'Sludge':
      return TowerConstants.SLUDGE;
    default:
      return undefined;
  }
}

/**
 * Calculate tower damage with upgrades
 */
export function calculateTowerDamage(type: string, upgradeLevel: number): number {
  const stats = getTowerStats(type);
  if (!stats) {
    return 0;
  }

  // Machine gun has lower damage scaling (focuses on fire rate)
  if (type === 'MachineGun') {
    // +25% damage per level instead of +50%
    return Math.floor(stats.damage * (1 + upgradeLevel * 0.25));
  }

  // Grenade has lower damage scaling (focuses on explosion radius)
  if (type === 'Grenade') {
    // +20% damage per level instead of +50%
    return Math.floor(stats.damage * (1 + upgradeLevel * 0.2));
  }

  // Other towers: +50% per upgrade level
  return Math.floor(stats.damage * (1 + upgradeLevel * 0.5));
}

/**
 * Calculate tower fire rate with upgrades
 */
export function calculateTowerFireRate(type: string, upgradeLevel: number): number {
  const stats = getTowerStats(type);
  if (!stats) {
    return 0;
  }

  // Machine gun gets significant fire rate boost with upgrades
  if (type === 'MachineGun') {
    // +30% fire rate per level (8 → 10.4 → 13.5 → 17.6 → 22.9 → 29.7 shots/sec)
    return stats.fireRate * (1 + upgradeLevel * 0.3);
  }

  // Other towers get minor fire rate boost
  // +10% fire rate per level
  return stats.fireRate * (1 + upgradeLevel * 0.1);
}

/**
 * Calculate tower range with upgrades
 */
export function calculateTowerRange(type: string, upgradeLevel: number): number {
  const stats = getTowerStats(type);
  if (!stats) {
    return 0;
  }

  // Simple range scaling: +20% per upgrade level
  return Math.floor(stats.range * (1 + upgradeLevel * 0.2));
}

/**
 * Calculate upgrade cost
 */
export function calculateUpgradeCost(type: string, upgradeLevel: number): number {
  const stats = getTowerStats(type);
  if (!stats) {
    return 0;
  }

  const multiplier = stats.upgradeCostMultiplier || 0.75;
  // Formula: upgradeCost = baseCost × (upgradeLevel + 1) × upgradeCostMultiplier
  return Math.floor(stats.cost * (upgradeLevel + 1) * multiplier);
}
