// biome-ignore lint/performance/noBarrelFile: intentional barrel file for config exports
export { DevConfig } from './devConfig';
export { GameConfig } from './gameConfig';
export {
  calculateTowerDamage,
  calculateTowerRange,
  calculateUpgradeCost,
  getTowerStats,
  TowerConstants,
  type TowerStats,
} from './towerConstants';
