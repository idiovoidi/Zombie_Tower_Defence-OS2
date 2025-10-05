/**
 * Interface for Tower objects to be used in the UpgradeSystem
 */
export interface ITower {
  getType(): string;
  getUpgradeLevel(): number;
  getMaxUpgradeLevel(): number;
  getUpgradeCost(): number;
  canUpgrade(): boolean;
  upgrade(): void;
  getDamage(): number;
  getRange(): number;
  getFireRate(): number;
}
