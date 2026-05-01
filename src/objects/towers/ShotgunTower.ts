import { Tower } from '../Tower';
import { GameConfig } from '../../config/gameConfig';

export class ShotgunTower extends Tower {
  private burstCount: number = 0; // Track shots in current burst
  private readonly shotsPerBurst: number = 2; // Double barrel
  private readonly burstDelay: number = 150; // 150ms between shots in burst
  private readonly reloadDelay: number = 1250; // 1.25s reload after burst
  private lastBurstShotTime: number = 0;
  private isReloading: boolean = false;

  constructor(x: number, y: number) {
    super(GameConfig.TOWER_TYPES.SHOTGUN, x, y);
  }

  // Override canShoot to implement burst fire mechanic
  public canShoot(currentTime: number): boolean {
    // If reloading, check if reload is complete
    if (this.isReloading) {
      const timeSinceLastShot = currentTime - this.lastBurstShotTime;
      if (timeSinceLastShot >= this.reloadDelay) {
        this.isReloading = false;
        this.burstCount = 0;
        return true;
      }
      return false;
    }

    // If in middle of burst, check burst delay
    if (this.burstCount > 0 && this.burstCount < this.shotsPerBurst) {
      const timeSinceLastShot = currentTime - this.lastBurstShotTime;
      return timeSinceLastShot >= this.burstDelay;
    }

    // If burst complete, start reload
    if (this.burstCount >= this.shotsPerBurst) {
      this.isReloading = true;
      return false;
    }

    // Ready to start new burst
    return true;
  }

  // Override shoot method for shotgun burst behavior
  public shoot(): void {
    super.shoot();
    this.lastBurstShotTime = performance.now();
    this.burstCount++;

    // Log for debugging
    if (this.burstCount === 1) {
      console.log('Shotgun: First barrel fired');
    } else if (this.burstCount === 2) {
      console.log('Shotgun: Second barrel fired - reloading...');
    }
  }

  // Reset burst when tower is sold or destroyed
  public destroy(): void {
    this.burstCount = 0;
    this.isReloading = false;
    super.destroy();
  }
}
