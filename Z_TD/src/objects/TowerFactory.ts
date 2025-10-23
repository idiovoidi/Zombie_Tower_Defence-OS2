import { Tower } from './Tower';
import { MachineGunTower } from './towers/MachineGunTower';
import { SniperTower } from './towers/SniperTower';
import { ShotgunTower } from './towers/ShotgunTower';
import { FlameTower } from './towers/FlameTower';
import { TeslaTower } from './towers/TeslaTower';
import { GrenadeTower } from './towers/GrenadeTower';
import { GameConfig } from '../config/gameConfig';

export class TowerFactory {
  public static createTower(type: string, x: number, y: number): Tower | null {
    switch (type) {
      case GameConfig.TOWER_TYPES.MACHINE_GUN:
        return new MachineGunTower(x, y);
      case GameConfig.TOWER_TYPES.SNIPER:
        return new SniperTower(x, y);
      case GameConfig.TOWER_TYPES.SHOTGUN:
        return new ShotgunTower(x, y);
      case GameConfig.TOWER_TYPES.FLAME:
        return new FlameTower(x, y);
      case GameConfig.TOWER_TYPES.TESLA:
        return new TeslaTower(x, y);
      case GameConfig.TOWER_TYPES.GRENADE:
        return new GrenadeTower(x, y);
      default:
        console.warn(`Unknown tower type: ${type}`);
        return null;
    }
  }
}
