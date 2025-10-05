import { Zombie } from '../Zombie';
import { GameConfig } from '../../config/gameConfig';

export class MechanicalZombie extends Zombie {
  constructor(x: number, y: number, wave: number) {
    super(GameConfig.ZOMBIE_TYPES.MECHANICAL, x, y, wave);
  }
}
