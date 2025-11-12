import { GameConfig } from '@config/gameConfig';
import type { ITowerRenderer } from './ITowerRenderer';
import { DefaultTowerRenderer } from './DefaultTowerRenderer';
import { MachineGunRenderer } from './MachineGunRenderer';
import { SniperRenderer } from './SniperRenderer';
import { ShotgunRenderer } from './ShotgunRenderer';
import { FlameRenderer } from './FlameRenderer';

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
        // TODO: Implement TeslaRenderer in Phase 2
        console.warn(`TeslaRenderer not yet implemented, using default`);
        return new DefaultTowerRenderer();

      case GameConfig.TOWER_TYPES.GRENADE:
        // TODO: Implement GrenadeRenderer in Phase 2
        console.warn(`GrenadeRenderer not yet implemented, using default`);
        return new DefaultTowerRenderer();

      case GameConfig.TOWER_TYPES.SLUDGE:
        // TODO: Implement SludgeRenderer in Phase 2
        console.warn(`SludgeRenderer not yet implemented, using default`);
        return new DefaultTowerRenderer();

      default:
        console.warn(`Unknown tower type: ${type}, using default renderer`);
        return new DefaultTowerRenderer();
    }
  }
}
