import type { Graphics } from 'pixi.js';

/**
 * Interface for tower renderers
 * Defines the contract for rendering tower visuals and effects
 */
export interface ITowerRenderer {
  /**
   * Render the tower's visual representation
   * @param visual - The base Graphics container
   * @param barrel - The rotatable barrel/character Graphics container
   * @param type - The tower type
   * @param upgradeLevel - Current upgrade level (1-5)
   */
  render(visual: Graphics, barrel: Graphics, type: string, upgradeLevel: number): void;

  /**
   * Render shooting effect (muzzle flash, recoil)
   * @param barrel - The barrel Graphics container
   * @param type - The tower type
   * @param upgradeLevel - Current upgrade level (1-5)
   */
  renderShootingEffect(barrel: Graphics, type: string, upgradeLevel: number): void;

  /**
   * Clean up renderer resources
   */
  destroy(): void;
}
