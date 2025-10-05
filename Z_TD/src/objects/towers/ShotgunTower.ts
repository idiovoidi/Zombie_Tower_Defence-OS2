import { Tower } from '../Tower';
import { GameConfig } from '../../config/gameConfig';

export class ShotgunTower extends Tower {
  constructor(x: number, y: number) {
    super(GameConfig.TOWER_TYPES.SHOTGUN, x, y);
  }

  // Override shoot method for shotgun specific behavior
  public shoot(): void {
    super.shoot();
    // Shotgun specific shooting logic
    console.log('Shotgun tower shooting');
  }
}
