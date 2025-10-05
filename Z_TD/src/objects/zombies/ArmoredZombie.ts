import { Zombie } from '../Zombie';
import { GameConfig } from '../../config/gameConfig';

export class ArmoredZombie extends Zombie {
  constructor(x: number, y: number, wave: number) {
    super(GameConfig.ZOMBIE_TYPES.ARMORED, x, y, wave);
  }
}
