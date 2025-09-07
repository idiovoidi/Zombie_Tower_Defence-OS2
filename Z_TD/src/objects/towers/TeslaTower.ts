import { Tower } from '../Tower';
import { GameConfig } from '../../config/gameConfig';

export class TeslaTower extends Tower {
  constructor(x: number, y: number) {
    super(GameConfig.TOWER_TYPES.TESLA, x, y);
  }
  
  // Override shoot method for tesla specific behavior
  public shoot(): void {
    super.shoot();
    // Tesla specific shooting logic
    console.log('Tesla tower shooting');
  }
}