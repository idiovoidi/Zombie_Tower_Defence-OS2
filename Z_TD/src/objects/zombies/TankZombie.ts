import { Zombie } from '../Zombie';
import { GameConfig } from '../../config/gameConfig';

export class TankZombie extends Zombie {
  constructor(x: number, y: number, wave: number) {
    super(GameConfig.ZOMBIE_TYPES.TANK, x, y, wave);
  }
}
