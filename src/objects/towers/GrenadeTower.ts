import { Tower } from '../Tower';
import { GameConfig } from '../../config/gameConfig';

export class GrenadeTower extends Tower {
  constructor(x: number, y: number) {
    super(GameConfig.TOWER_TYPES.GRENADE, x, y);
  }

  // Override shoot method for grenade specific behavior
  public shoot(): void {
    super.shoot();
    // Grenade specific shooting logic
    console.log('Grenade tower shooting');
  }
}
