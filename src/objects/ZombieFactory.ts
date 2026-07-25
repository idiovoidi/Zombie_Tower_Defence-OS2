import { GameConfig } from '../config/gameConfig';
import type { Zombie } from './Zombie';
import { ArmoredZombie } from './zombies/ArmoredZombie';
import { BasicZombie } from './zombies/BasicZombie';
import { BossZombie } from './zombies/BossZombie';
import { FastZombie } from './zombies/FastZombie';
import { MechanicalZombie } from './zombies/MechanicalZombie';
import { NecroTankZombie } from './zombies/NecroTankZombie';
import { StealthZombie } from './zombies/StealthZombie';
import { SwarmZombie } from './zombies/SwarmZombie';
import { TankZombie } from './zombies/TankZombie';

// biome-ignore lint/complexity/noStaticOnlyClass: Factory pattern with static creation method
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
      case GameConfig.ZOMBIE_TYPES.BOSS:
        return new BossZombie(x, y, wave);
      case GameConfig.ZOMBIE_TYPES.NECRO_TANK:
        return new NecroTankZombie(x, y, wave);
      default:
        return null;
    }
  }
}
