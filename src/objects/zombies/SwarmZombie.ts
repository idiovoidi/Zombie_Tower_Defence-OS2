import { GameConfig } from '../../config/gameConfig';
import { Zombie } from '../Zombie';

export class SwarmZombie extends Zombie {
  constructor(x: number, y: number, wave: number) {
    super(GameConfig.ZOMBIE_TYPES.SWARM, x, y, wave);
  }
}
