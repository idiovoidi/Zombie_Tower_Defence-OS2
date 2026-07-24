import { GameConfig } from '../../config/gameConfig';
import { Zombie } from '../Zombie';

export class BossZombie extends Zombie {
  constructor(x: number, y: number, wave: number) {
    super(GameConfig.ZOMBIE_TYPES.BOSS, x, y, wave);
  }
}
