import { GameConfig } from '../config/gameConfig';

/**
 * ZombieStats - Static utility for calculating zombie statistics
 * This file is separate from WaveManager to avoid circular dependencies
 */

export class ZombieStats {
  /**
   * Calculate zombie health based on type and wave number
   */
  public static calculateZombieHealth(type: string, wave: number): number {
    let baseHealth = 100;

    switch (type) {
      case GameConfig.ZOMBIE_TYPES.BASIC:
        baseHealth = 100;
        break;
      case GameConfig.ZOMBIE_TYPES.FAST:
        baseHealth = 70;
        break;
      case GameConfig.ZOMBIE_TYPES.TANK:
        baseHealth = 500;
        break;
      case GameConfig.ZOMBIE_TYPES.ARMORED:
        baseHealth = 300;
        break;
      case GameConfig.ZOMBIE_TYPES.SWARM:
        baseHealth = 50;
        break;
      case GameConfig.ZOMBIE_TYPES.STEALTH:
        baseHealth = 120;
        break;
      case GameConfig.ZOMBIE_TYPES.MECHANICAL:
        baseHealth = 250;
        break;
    }

    // Scale health based on wave (from design document)
    return Math.floor(baseHealth + wave * 1.8);
  }

  /**
   * Calculate zombie damage based on type and wave number
   */
  public static calculateZombieDamage(type: string, wave: number): number {
    let baseDamage = 10;

    switch (type) {
      case GameConfig.ZOMBIE_TYPES.BASIC:
        baseDamage = 10;
        break;
      case GameConfig.ZOMBIE_TYPES.FAST:
        baseDamage = 15;
        break;
      case GameConfig.ZOMBIE_TYPES.TANK:
        baseDamage = 25;
        break;
      case GameConfig.ZOMBIE_TYPES.ARMORED:
        baseDamage = 20;
        break;
      case GameConfig.ZOMBIE_TYPES.SWARM:
        baseDamage = 8;
        break;
      case GameConfig.ZOMBIE_TYPES.STEALTH:
        baseDamage = 12;
        break;
      case GameConfig.ZOMBIE_TYPES.MECHANICAL:
        baseDamage = 18;
        break;
    }

    // Scale damage slightly with wave
    return Math.floor(baseDamage + wave * 0.5);
  }
}
