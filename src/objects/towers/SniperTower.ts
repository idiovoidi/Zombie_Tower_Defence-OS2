import { GameConfig } from '../../config/gameConfig';
import { Tower } from '../Tower';

export class SniperTower extends Tower {
  constructor(x: number, y: number) {
    super(GameConfig.TOWER_TYPES.SNIPER, x, y);
  }

  // Override shoot method for sniper specific behavior
  public override shoot(): void {
    super.shoot();
  }
}
