import { GameConfig } from '../../config/gameConfig';
import { ArmoredZombieRenderer } from './ArmoredZombieRenderer';
import { BasicZombieRenderer } from './BasicZombieRenderer';
import { BossZombieRenderer } from './BossZombieRenderer';
import { FastZombieRenderer } from './FastZombieRenderer';
import { MechanicalZombieRenderer } from './MechanicalZombieRenderer';
import { StealthZombieRenderer } from './StealthZombieRenderer';
import { SwarmZombieRenderer } from './SwarmZombieRenderer';
import { TankZombieRenderer } from './TankZombieRenderer';
import type { IZombieRenderer } from './ZombieRenderer';

/**
 * Factory for creating zombie renderers by type.
 */
// biome-ignore lint/complexity/noStaticOnlyClass: Factory pattern with static creation method
export class ZombieRendererFactory {
  static create(type: string): IZombieRenderer {
    switch (type) {
      case GameConfig.ZOMBIE_TYPES.BASIC:
        return new BasicZombieRenderer();

      case GameConfig.ZOMBIE_TYPES.FAST:
        return new FastZombieRenderer();

      case GameConfig.ZOMBIE_TYPES.TANK:
        return new TankZombieRenderer();

      case GameConfig.ZOMBIE_TYPES.ARMORED:
        return new ArmoredZombieRenderer();

      case GameConfig.ZOMBIE_TYPES.SWARM:
        return new SwarmZombieRenderer();

      case GameConfig.ZOMBIE_TYPES.STEALTH:
        return new StealthZombieRenderer();

      case GameConfig.ZOMBIE_TYPES.MECHANICAL:
        return new MechanicalZombieRenderer();

      case GameConfig.ZOMBIE_TYPES.BOSS:
        return new BossZombieRenderer();

      default:
        return new BasicZombieRenderer();
    }
  }
}
