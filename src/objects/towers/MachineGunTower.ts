import { GameConfig } from '../../config/gameConfig';
import { Tower } from '../Tower';

export class MachineGunTower extends Tower {
  constructor(x: number, y: number) {
    super(GameConfig.TOWER_TYPES.MACHINE_GUN, x, y);
  }

  // Override shoot method for machine gun specific behavior
  public override shoot(): void {
    super.shoot();
  }
}
