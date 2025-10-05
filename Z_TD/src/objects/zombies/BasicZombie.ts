import { Zombie } from '../Zombie';
import { GameConfig } from '../../config/gameConfig';

export class BasicZombie extends Zombie {
  constructor(x: number, y: number, wave: number) {
    super(GameConfig.ZOMBIE_TYPES.BASIC, x, y, wave);
  }
}
