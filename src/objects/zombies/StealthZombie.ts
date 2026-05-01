import { GameConfig } from '../../config/gameConfig';
import { Zombie } from '../Zombie';

export class StealthZombie extends Zombie {
  constructor(x: number, y: number, wave: number) {
    super(GameConfig.ZOMBIE_TYPES.STEALTH, x, y, wave);
  }
}
