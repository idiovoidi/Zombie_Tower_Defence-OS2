import type { Graphics } from 'pixi.js';

/**
 * Tower Constants - Centralized tower stats for easy balancing
 *
 * Adjust these values to quickly balance tower performance
 */

export type IdleAnimationType =
  | 'none'
  | 'machineGun'
  | 'sniper'
  | 'shotgun'
  | 'flame'
  | 'tesla'
  | 'grenade'
  | 'sludge';

export interface TowerStats {
  cost: number;
  damage: number;
  range: number;
  fireRate: number; // shots per second
  health: number;
  specialAbility?: string;
  upgradeCostMultiplier?: number;
  idleAnimation: IdleAnimationType;
  barrelLength: number;
  barrelLengthUpgradeBonus: number;
  projectileType: string;
  ghostDraw: (graphics: Graphics) => void;
}

// Ghost tower draw functions - centralized to eliminate switch statements
const ghostDrawMachineGun = (g: Graphics) => {
  g.circle(0, 0, 20).fill(0x0000ff);
  g.moveTo(0, -20).lineTo(0, -35).stroke({ width: 3, color: 0x4169e1 });
};

const ghostDrawSniper = (g: Graphics) => {
  g.ellipse(0, 0, 15, 25).fill(0x2f4f4f);
  g.moveTo(0, -25).lineTo(0, -45).stroke({ width: 2, color: 0x696969 });
};

const ghostDrawShotgun = (g: Graphics) => {
  g.roundRect(-18, -18, 36, 36, 8).fill(0x8b4513);
};

const ghostDrawFlame = (g: Graphics) => {
  g.circle(0, 0, 20).fill(0xff4500);
};

const ghostDrawTesla = (g: Graphics) => {
  g.circle(0, 0, 20).fill(0x00ced1);
  g.circle(0, 0, 10).fill(0x7fffd4);
};

const ghostDrawGrenade = (g: Graphics) => {
  // Olive drab military platform
  g.rect(-20, -5, 40, 25).fill(0x6b8e23);
  g.rect(-20, -5, 40, 25).stroke({ width: 2, color: 0x556b2f });
  // Ammo crates
  g.rect(-12, 2, 10, 8).fill(0x8b7355);
  g.rect(2, 2, 10, 8).fill(0x8b7355);
  // Grenade symbols
  g.circle(-7, 6, 2).fill(0x2f4f2f);
  g.circle(7, 6, 2).fill(0x2f4f2f);
};

const ghostDrawSludge = (g: Graphics) => {
  // Toxic barrel platform
  g.rect(-18, -5, 36, 25).fill(0x4a5a3a);
  g.rect(-18, -5, 36, 25).stroke({ width: 2, color: 0x3a4a2a });
  // Toxic barrels
  g.rect(-10, 0, 8, 12).fill(0x228b22);
  g.rect(2, 0, 8, 12).fill(0x228b22);
  // Toxic symbols with glow
  g.circle(-6, 6, 3).fill({ color: 0x00ff00, alpha: 0.7 });
  g.circle(6, 6, 3).fill({ color: 0x00ff00, alpha: 0.7 });
  // Toxic glow effect
  g.circle(-6, 6, 5).fill({ color: 0x32cd32, alpha: 0.3 });
  g.circle(6, 6, 5).fill({ color: 0x32cd32, alpha: 0.3 });
};

export const TowerConstants = {
  // Machine Gun Tower - High fire rate, good against swarms
  // Upgrades focus on fire rate rather than damage
  // BALANCED: Reduced damage from 12 to 6 (50% nerf) - advanced sim showed 8.3x more efficient than Grenade
  MACHINE_GUN: {
    cost: 250,
    damage: 6,
    range: 150,
    fireRate: 8,
    health: 120,
    specialAbility: 'High fire rate, upgrades increase speed',
    upgradeCostMultiplier: 0.75,
    idleAnimation: 'machineGun',
    barrelLength: 18,
    barrelLengthUpgradeBonus: 1,
    projectileType: 'bullet',
    ghostDraw: ghostDrawMachineGun,
  } as TowerStats,

  // Sniper Tower - High single-target damage, armor-piercing
  // BALANCED: Reduced damage from 225 to 140 (-38%) - advanced sim showed 79.8% overkill waste on normal zombies
  // Snipers should excel vs tanks/elites, not overkill swarms. Lower damage = less waste, faster fire rate compensates
  SNIPER: {
    cost: 900,
    damage: 140,
    range: 400,
    fireRate: 1,
    health: 80,
    specialAbility: 'High single-target damage, armor-piercing',
    upgradeCostMultiplier: 0.75,
    idleAnimation: 'sniper',
    barrelLength: 24,
    barrelLengthUpgradeBonus: 2,
    projectileType: 'sniper',
    ghostDraw: ghostDrawSniper,
  } as TowerStats,

  // Shotgun Tower - Short range area denial, double barrel burst fire
  SHOTGUN: {
    cost: 400,
    damage: 60,
    range: 120,
    fireRate: 0.8,
    health: 100,
    specialAbility: 'Double barrel: 2 quick shots then reload, cone spread',
    upgradeCostMultiplier: 0.75,
    idleAnimation: 'shotgun',
    barrelLength: 16,
    barrelLengthUpgradeBonus: 0,
    projectileType: 'shotgun',
    ghostDraw: ghostDrawShotgun,
  } as TowerStats,

  // Flame Tower - Area damage over time, burning effect
  // BALANCED: Reduced damage from 300 to 180 (-40%) - advanced sim showed 83.3% overkill, DoT towers should tick slowly
  FLAME: {
    cost: 750,
    damage: 180,
    range: 120,
    fireRate: 0.75,
    health: 90,
    specialAbility: 'Area damage over time, burning effect',
    upgradeCostMultiplier: 0.75,
    idleAnimation: 'flame',
    barrelLength: 16,
    barrelLengthUpgradeBonus: 0,
    projectileType: 'flame',
    ghostDraw: ghostDrawFlame,
  } as TowerStats,

  // Tesla Tower - Chain lightning, affects multiple targets
  // NERF: Reduced fire rate from 2 to 1.5 (220→165 DPS) - was dominating late-game horde tests
  TESLA: {
    cost: 1500,
    damage: 110,
    range: 200,
    fireRate: 1.5,
    health: 110,
    specialAbility: 'Chain lightning, affects multiple targets',
    upgradeCostMultiplier: 0.75,
    idleAnimation: 'tesla',
    barrelLength: 17,
    barrelLengthUpgradeBonus: 0,
    projectileType: 'tesla',
    ghostDraw: ghostDrawTesla,
  } as TowerStats,

  // Grenade Tower - Explosive area damage with arc trajectory

  GRENADE: {
    cost: 1250,
    damage: 90,
    range: 180,
    fireRate: 0.3,
    health: 95,
    specialAbility: 'Explosive area damage, arc trajectory',
    upgradeCostMultiplier: 0.75,
    idleAnimation: 'grenade',
    barrelLength: 20,
    barrelLengthUpgradeBonus: 0,
    projectileType: 'grenade',
    ghostDraw: ghostDrawGrenade,
  } as TowerStats,

  // Sludge Tower - Crowd control, creates slowing pools
  SLUDGE: {
    cost: 800,
    damage: 0,
    range: 100,
    fireRate: 0.25,
    health: 110,
    specialAbility: 'Creates toxic pools that slow zombies',
    upgradeCostMultiplier: 0.6,
    idleAnimation: 'sludge',
    barrelLength: 10,
    barrelLengthUpgradeBonus: 2,
    projectileType: 'sludge',
    ghostDraw: ghostDrawSludge,
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
 * Helper to get tower stats with guard clause
 * Returns null if stats not found, letting caller handle the default
 */
function withTowerStats<T>(type: string, fn: (stats: TowerStats) => T, defaultValue: T): T {
  const stats = getTowerStats(type);
  if (!stats) {
    return defaultValue;
  }
  return fn(stats);
}

/**
 * Calculate tower damage with upgrades
 */
export function calculateTowerDamage(type: string, upgradeLevel: number): number {
  return withTowerStats(
    type,
    stats => {
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
    },
    0
  );
}

/**
 * Calculate tower fire rate with upgrades
 */
export function calculateTowerFireRate(type: string, upgradeLevel: number): number {
  return withTowerStats(
    type,
    stats => {
      // Machine gun gets significant fire rate boost with upgrades
      if (type === 'MachineGun') {
        // +30% fire rate per level (8 → 10.4 → 13.5 → 17.6 → 22.9 → 29.7 shots/sec)
        return stats.fireRate * (1 + upgradeLevel * 0.3);
      }

      // Other towers get minor fire rate boost
      // +10% fire rate per level
      return stats.fireRate * (1 + upgradeLevel * 0.1);
    },
    0
  );
}

/**
 * Calculate tower range with upgrades
 */
export function calculateTowerRange(type: string, upgradeLevel: number): number {
  return withTowerStats(
    type,
    stats => {
      // Simple range scaling: +20% per upgrade level
      return Math.floor(stats.range * (1 + upgradeLevel * 0.2));
    },
    0
  );
}

/**
 * Calculate upgrade cost
 */
export function calculateUpgradeCost(type: string, upgradeLevel: number): number {
  return withTowerStats(
    type,
    stats => {
      const multiplier = stats.upgradeCostMultiplier || 0.75;
      // Formula: upgradeCost = baseCost × (upgradeLevel + 1) × upgradeCostMultiplier
      return Math.floor(stats.cost * (upgradeLevel + 1) * multiplier);
    },
    0
  );
}
