import type { Zombie } from '../objects/Zombie';

/**
 * Shared radius queries over the combat spatial grid.
 * Used by AOE systems (sludge, fire, shotgun/grenade) instead of full O(n) scans.
 */
export interface ZombieSpatialQuery {
  queryZombiesInRadius(x: number, y: number, radius: number): Zombie[];
  queryZombiesInRadiusWithDistance(
    x: number,
    y: number,
    radius: number
  ): Array<{ zombie: Zombie; distance: number }>;
  queryFirstZombieInRadius(x: number, y: number, radius: number): Zombie | null;
}
