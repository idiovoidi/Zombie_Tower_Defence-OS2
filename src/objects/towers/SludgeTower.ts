import { GameConfig } from '../../config/gameConfig';
import { Tower } from '../Tower';

export class SludgeTower extends Tower {
  constructor(x: number, y: number) {
    super(GameConfig.TOWER_TYPES.SLUDGE, x, y);
  }

  // Override shoot method for sludge specific behavior
  public shoot(): void {
    super.shoot();
    // Sludge specific shooting logic
    console.log('Sludge tower shooting toxic barrel');
  }
}
