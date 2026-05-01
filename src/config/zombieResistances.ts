/**
 * Zombie Damage Resistance Configuration
 *
 * Defines damage modifiers for each zombie type against each tower type.
 * - Values > 1.0 = Weakness (takes more damage)
 * - Values < 1.0 = Resistance (takes less damage)
 * - Value = 1.0 = Normal damage
 */

export type ZombieType = 'BASIC' | 'FAST' | 'TANK' | 'ARMORED' | 'SWARM' | 'STEALTH' | 'MECHANICAL';
export type TowerType = 'MACHINE_GUN' | 'SNIPER' | 'SHOTGUN' | 'FLAME' | 'TESLA' | 'GRENADE';

export type DamageModifierMap = {
  [key in ZombieType]: {
    [key in TowerType]: number;
  };
};

/**
 * Damage modifier matrix
 * zombie.getDamageModifier(towerType) returns the multiplier
 */
export const DAMAGE_MODIFIERS: DamageModifierMap = {
  // Basic Zombie - No special resistances or weaknesses
  BASIC: {
    MACHINE_GUN: 1.0,
    SNIPER: 1.0,
    SHOTGUN: 1.0,
    FLAME: 1.0,
    TESLA: 1.0,
    GRENADE: 1.0, // Normal explosive damage
  },

  // Fast Zombie - Weak to spread/instant, resistant to sustained
  FAST: {
    MACHINE_GUN: 0.6, // Harder to hit moving target
    SNIPER: 0.9, // Harder to hit moving target
    SHOTGUN: 1.25, // Spread catches fast targets
    FLAME: 0.75, // Runs through fire quickly
    TESLA: 1.25, // Instant hit, no dodging
    GRENADE: 1.15, // Area damage catches fast targets
  },

  // Tank Zombie - Weak to high damage/sustained, resistant to rapid fire
  TANK: {
    MACHINE_GUN: 0.7, // Bullets bounce off armor
    SNIPER: 1.5, // Armor-piercing rounds
    SHOTGUN: 0.8, // Pellets less effective
    FLAME: 1.25, // Sustained burn damage
    TESLA: 1.0, // Normal effectiveness
    GRENADE: 1.3, // High explosive damage effective
  },

  // Armored Zombie - Weak to armor-piercing/electricity, resistant to bullets/fire
  ARMORED: {
    MACHINE_GUN: 0.5, // Armor deflects bullets
    SNIPER: 1.4, // Armor-piercing
    SHOTGUN: 0.85, // Armor absorbs pellets
    FLAME: 0.25, // Heat-resistant armor
    TESLA: 1.2, // Electricity bypasses armor
    GRENADE: 1.5, // Explosives shred armor
  },

  // Swarm Zombie - Weak to area damage, resistant to single-target
  SWARM: {
    MACHINE_GUN: 0.5, // Normal effectiveness
    SNIPER: 0.6, // Overkill, wasted damage
    SHOTGUN: 1.5, // Spread hits multiple
    FLAME: 1.4, // Area damage
    TESLA: 1.3, // Chain lightning
    GRENADE: 1.6, // Explosive area damage devastating to swarms
  },

  // Stealth Zombie - Weak to auto-targeting, resistant to precision
  STEALTH: {
    MACHINE_GUN: 0.95, // Slightly harder to track
    SNIPER: 0.8, // Hard to target precisely
    SHOTGUN: 1.15, // Spread coverage
    FLAME: 1.3, // Reveals and burns
    TESLA: 1.25, // Auto-targeting
    GRENADE: 1.2, // Area damage doesn't need precision
  },

  // Mechanical Zombie - VERY weak to electricity, VERY resistant to fire
  MECHANICAL: {
    MACHINE_GUN: 0.8, // Metal plating
    SNIPER: 1.2, // Precision targeting weak points
    SHOTGUN: 0.85, // Armor plating
    FLAME: 0.5, // Heat-resistant metal
    TESLA: 2.0, // Electricity fries circuits
    GRENADE: 0.9, // Metal frame absorbs some blast
  },
};

/**
 * Convert tower type string to TowerType enum
 * Handles conversion from GameConfig format (e.g., 'MachineGun') to resistance format (e.g., 'MACHINE_GUN')
 */
export function convertToTowerType(towerTypeString: string): TowerType {
  // Convert camelCase to UPPER_SNAKE_CASE
  const converted = towerTypeString
    .replace(/([A-Z])/g, '_$1')
    .toUpperCase()
    .replace(/^_/, '') as TowerType;
  return converted;
}

/**
 * Get damage modifier for a zombie type against a tower type
 */
export function getDamageModifier(zombieType: ZombieType, towerType: TowerType): number {
  return DAMAGE_MODIFIERS[zombieType]?.[towerType] ?? 1.0;
}

/**
 * Check if damage is effective (weakness)
 */
export function isEffectiveDamage(modifier: number): boolean {
  return modifier > 1.0;
}

/**
 * Check if damage is resisted
 */
export function isResistedDamage(modifier: number): boolean {
  return modifier < 1.0;
}

/**
 * Get effectiveness description
 */
export function getEffectivenessDescription(modifier: number): string {
  if (modifier >= 1.5) {
    return 'Very Effective';
  }
  if (modifier >= 1.25) {
    return 'Effective';
  }
  if (modifier > 1.0) {
    return 'Slightly Effective';
  }
  if (modifier === 1.0) {
    return 'Normal';
  }
  if (modifier >= 0.75) {
    return 'Slightly Resisted';
  }
  if (modifier >= 0.5) {
    return 'Resisted';
  }
  return 'Highly Resisted';
}

/**
 * Get color for damage effectiveness (for visual feedback)
 */
export function getEffectivenessColor(modifier: number): number {
  if (modifier >= 1.25) {
    return 0x00ff00; // Green - Effective
  }
  if (modifier > 1.0) {
    return 0x88ff88; // Light green - Slightly effective
  }
  if (modifier === 1.0) {
    return 0xffffff; // White - Normal
  }
  if (modifier >= 0.75) {
    return 0xffaa00; // Orange - Slightly resisted
  }
  return 0xff0000; // Red - Resisted
}
