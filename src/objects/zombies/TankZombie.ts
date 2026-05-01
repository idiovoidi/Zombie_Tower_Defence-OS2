import { GameConfig } from '../../config/gameConfig';
import { Zombie } from '../Zombie';

export class TankZombie extends Zombie {
  constructor(x: number, y: number, wave: number) {
    super(GameConfig.ZOMBIE_TYPES.TANK, x, y, wave);
  }
}
