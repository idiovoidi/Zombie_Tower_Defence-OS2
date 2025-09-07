import { Zombie } from '../Zombie';
import { GameConfig } from '../../config/gameConfig';

export class FastZombie extends Zombie {
  constructor(x: number, y: number, wave: number) {
    super(GameConfig.ZOMBIE_TYPES.FAST, x, y, wave);
  }
}