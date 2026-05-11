import { GameConfig } from '../../config/gameConfig';
import { Tower } from '../Tower';

export class GrenadeTower extends Tower {
  constructor(x: number, y: number) {
    super(GameConfig.TOWER_TYPES.GRENADE, x, y);
  }

  // Override shoot method for grenade specific behavior
  public override shoot(): void {
    super.shoot();
  }
}
