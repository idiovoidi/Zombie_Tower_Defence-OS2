/**
 * Debug Constants - Easy to modify values for testing and debugging
 *
 * Change these values to quickly test different game scenarios
 * These override the default game config values when enabled
 */

export const DebugConstants = {
  // Enable/disable debug mode
  ENABLED: true,

  // Starting Resources
  STARTING_MONEY: 10000, // Default: 500
  STARTING_LIVES: 100, // Default: 100 (survivors)
  STARTING_WOOD: 1000, // Default: 0
  STARTING_METAL: 1000, // Default: 0
  STARTING_ENERGY: 100, // Default: 100

  // Resource Generation (per second)
  WOOD_GENERATION_RATE: 10, // Default: 1
  METAL_GENERATION_RATE: 5, // Default: 0.5
  ENERGY_GENERATION_RATE: 2, // Default: 1

  // Tower Costs (set to 0 for free towers)
  TOWER_COST_MULTIPLIER: 0.1, // Multiply all tower costs by this (1.0 = normal, 0 = free)
  UPGRADE_COST_MULTIPLIER: 0.1, // Multiply all upgrade costs by this

  // Tower Stats
  TOWER_DAMAGE_MULTIPLIER: 2.0, // Multiply all tower damage by this
  TOWER_RANGE_MULTIPLIER: 1.5, // Multiply all tower range by this
  TOWER_FIRE_RATE_MULTIPLIER: 2.0, // Multiply all tower fire rates by this

  // Zombie Stats
  ZOMBIE_HEALTH_MULTIPLIER: 0.5, // Multiply all zombie health by this (lower = easier)
  ZOMBIE_SPEED_MULTIPLIER: 0.5, // Multiply all zombie speed by this (lower = slower)
  ZOMBIE_SPAWN_RATE_MULTIPLIER: 0.5, // Multiply spawn rate by this (lower = fewer zombies)

  // Wave Settings
  START_AT_WAVE: 1, // Start at this wave number
  WAVE_DELAY: 5000, // Milliseconds between waves (default: varies)
  SKIP_WAVE_COMPLETE_SCREEN: false, // Auto-start next wave

  // Game Speed
  GAME_SPEED_MULTIPLIER: 1.0, // Multiply game speed (1.0 = normal, 2.0 = double speed)

  // Instant Actions
  INSTANT_TOWER_PLACEMENT: false, // No placement validation
  INSTANT_UPGRADES: false, // Upgrades are instant and free
  INVINCIBLE_TOWERS: false, // Towers can't be damaged
  ONE_HIT_KILL: false, // All zombies die in one hit

  // Visual Debug
  SHOW_TOWER_RANGES: false, // Always show tower ranges
  SHOW_ZOMBIE_HEALTH_BARS: true, // Show health bars above zombies
  SHOW_WAYPOINTS: false, // Show path waypoints
  SHOW_COLLISION_BOXES: false, // Show collision boundaries

  // Testing Shortcuts
  UNLOCK_ALL_TOWERS: true, // All tower types available from start
  UNLOCK_ALL_LEVELS: true, // All levels available
  DISABLE_GAME_OVER: false, // Can't lose the game
  AUTO_WIN_WAVES: false, // Automatically complete waves
};

/**
 * Apply debug constants to game config
 * Call this at game initialization if debug mode is enabled
 */
export function applyDebugConstants(gameManager: any): void {
  if (!DebugConstants.ENABLED) return;

  console.log('🔧 Debug Constants Applied');

  // Apply starting resources
  if (DebugConstants.STARTING_MONEY !== undefined) {
    gameManager.money = DebugConstants.STARTING_MONEY;
    console.log(`💰 Starting Money: ${DebugConstants.STARTING_MONEY}`);
  }

  if (DebugConstants.STARTING_LIVES !== undefined) {
    gameManager.lives = DebugConstants.STARTING_LIVES;
    console.log(`❤️ Starting Lives: ${DebugConstants.STARTING_LIVES}`);
  }

  // Note: Other constants are applied in their respective managers
  // This function is mainly for initial setup
}

/**
 * Get modified tower cost based on debug multiplier
 */
export function getDebugTowerCost(baseCost: number): number {
  if (!DebugConstants.ENABLED) return baseCost;
  return Math.floor(baseCost * DebugConstants.TOWER_COST_MULTIPLIER);
}

/**
 * Get modified tower damage based on debug multiplier
 */
export function getDebugTowerDamage(baseDamage: number): number {
  if (!DebugConstants.ENABLED) return baseDamage;
  return baseDamage * DebugConstants.TOWER_DAMAGE_MULTIPLIER;
}

/**
 * Get modified tower range based on debug multiplier
 */
export function getDebugTowerRange(baseRange: number): number {
  if (!DebugConstants.ENABLED) return baseRange;
  return baseRange * DebugConstants.TOWER_RANGE_MULTIPLIER;
}

/**
 * Get modified zombie health based on debug multiplier
 */
export function getDebugZombieHealth(baseHealth: number): number {
  if (!DebugConstants.ENABLED) return baseHealth;
  return Math.floor(baseHealth * DebugConstants.ZOMBIE_HEALTH_MULTIPLIER);
}

/**
 * Get modified zombie speed based on debug multiplier
 */
export function getDebugZombieSpeed(baseSpeed: number): number {
  if (!DebugConstants.ENABLED) return baseSpeed;
  return baseSpeed * DebugConstants.ZOMBIE_SPEED_MULTIPLIER;
}
