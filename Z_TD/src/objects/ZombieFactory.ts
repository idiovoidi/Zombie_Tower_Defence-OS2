import { Zombie } from './Zombie';
import { BasicZombie } from './zombies/BasicZombie';
import { FastZombie } from './zombies/FastZombie';
import { TankZombie } from './zombies/TankZombie';
import { ArmoredZombie } from './zombies/ArmoredZombie';
import { SwarmZombie } from './zombies/SwarmZombie';
import { StealthZombie } from './zombies/StealthZombie';
import { MechanicalZombie } from './zombies/MechanicalZombie';
import { GameConfig } from '../config/gameConfig';

export class ZombieFactory {
  public static createZombie(type: string, x: number, y: number, wave: number): Zombie | null {
    switch (type) {
      case GameConfig.ZOMBIE_TYPES.BASIC:
        return new BasicZombie(x, y, wave);
      case GameConfig.ZOMBIE_TYPES.FAST:
        return new FastZombie(x, y, wave);
      case GameConfig.ZOMBIE_TYPES.TANK:
        return new TankZombie(x, y, wave);
      case GameConfig.ZOMBIE_TYPES.ARMORED:
        return new ArmoredZombie(x, y, wave);
      case GameConfig.ZOMBIE_TYPES.SWARM:
        return new SwarmZombie(x, y, wave);
      case GameConfig.ZOMBIE_TYPES.STEALTH:
        return new StealthZombie(x, y, wave);
      case GameConfig.ZOMBIE_TYPES.MECHANICAL:
        return new MechanicalZombie(x, y, wave);
      default:
        console.warn(`Unknown zombie type: ${type}`);
        return null;
    }
  }
}