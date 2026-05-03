import { GameConfig } from '../../config/gameConfig';
import { Tower } from '../Tower';

export class TeslaTower extends Tower {
  constructor(x: number, y: number) {
    super(GameConfig.TOWER_TYPES.TESLA, x, y);
  }

  // Override shoot method for tesla specific behavior
  public shoot(): void {
    super.shoot();
  }
}
