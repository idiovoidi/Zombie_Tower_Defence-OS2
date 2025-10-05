import { Tower } from '../Tower';
import { GameConfig } from '../../config/gameConfig';

export class SniperTower extends Tower {
  constructor(x: number, y: number) {
    super(GameConfig.TOWER_TYPES.SNIPER, x, y);
  }

  // Override shoot method for sniper specific behavior
  public shoot(): void {
    super.shoot();
    // Sniper specific shooting logic
    console.log('Sniper tower shooting');
  }
}
