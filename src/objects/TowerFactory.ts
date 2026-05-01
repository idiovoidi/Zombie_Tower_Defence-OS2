import { GameConfig } from '../config/gameConfig';
import type { Tower } from './Tower';
import { FlameTower } from './towers/FlameTower';
import { GrenadeTower } from './towers/GrenadeTower';
import { MachineGunTower } from './towers/MachineGunTower';
import { ShotgunTower } from './towers/ShotgunTower';
import { SludgeTower } from './towers/SludgeTower';
import { SniperTower } from './towers/SniperTower';
import { TeslaTower } from './towers/TeslaTower';

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
      case GameConfig.TOWER_TYPES.SLUDGE:
        return new SludgeTower(x, y);
      default:
        console.warn(`Unknown tower type: ${type}`);
        return null;
    }
  }
}
