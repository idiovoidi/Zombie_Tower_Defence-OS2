import { Tower } from '../Tower';
import { GameConfig } from '../../config/gameConfig';

export class MachineGunTower extends Tower {
  constructor(x: number, y: number) {
    super(GameConfig.TOWER_TYPES.MACHINE_GUN, x, y);
  }

  // Override shoot method for machine gun specific behavior
  public shoot(): void {
    super.shoot();
    // Machine gun specific shooting logic
    console.log('Machine gun tower shooting');
  }
}
