import { Zombie } from '../Zombie';
import { GameConfig } from '../../config/gameConfig';

export class StealthZombie extends Zombie {
  constructor(x: number, y: number, wave: number) {
    super(GameConfig.ZOMBIE_TYPES.STEALTH, x, y, wave);
  }
}
