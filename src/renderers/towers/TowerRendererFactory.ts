import { GameConfig } from '@config/gameConfig';
import { DefaultTowerRenderer } from './DefaultTowerRenderer';
import { FlameRenderer } from './FlameRenderer';
import { GrenadeRenderer } from './GrenadeRenderer';
import type { ITowerRenderer } from './ITowerRenderer';
import { MachineGunRenderer } from './MachineGunRenderer';
import { ShotgunRenderer } from './ShotgunRenderer';
import { SludgeRenderer } from './SludgeRenderer';
import { SniperRenderer } from './SniperRenderer';
import { TeslaRenderer } from './TeslaRenderer';

/**
 * Factory for creating tower renderers
 * Returns the appropriate renderer based on tower type
 */
export class TowerRendererFactory {
  /**
   * Create a renderer for the specified tower type
   * @param type - Tower type from GameConfig.TOWER_TYPES
   * @returns Appropriate renderer instance
   */
  static create(type: string): ITowerRenderer {
    switch (type) {
      case GameConfig.TOWER_TYPES.MACHINE_GUN:
        return new MachineGunRenderer();

      case GameConfig.TOWER_TYPES.SNIPER:
        return new SniperRenderer();

      case GameConfig.TOWER_TYPES.SHOTGUN:
        return new ShotgunRenderer();

      case GameConfig.TOWER_TYPES.FLAME:
        return new FlameRenderer();

      case GameConfig.TOWER_TYPES.TESLA:
        return new TeslaRenderer();

      case GameConfig.TOWER_TYPES.GRENADE:
        return new GrenadeRenderer();

      case GameConfig.TOWER_TYPES.SLUDGE:
        return new SludgeRenderer();

      default:
        console.warn(`Unknown tower type: ${type}, using default renderer`);
        return new DefaultTowerRenderer();
    }
  }
}
