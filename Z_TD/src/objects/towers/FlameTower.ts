import { Tower } from '../Tower';
import { GameConfig } from '../../config/gameConfig';

export class FlameTower extends Tower {
  constructor(x: number, y: number) {
    super(GameConfig.TOWER_TYPES.FLAME, x, y);
  }
  
  // Override shoot method for flame specific behavior
  public shoot(): void {
    super.shoot();
    // Flame specific shooting logic
    console.log('Flame tower shooting');
  }
}