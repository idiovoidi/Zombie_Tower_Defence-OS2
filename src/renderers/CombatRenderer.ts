/**
 * CombatRenderer - Handles combat visual effects via EventBus
 *
 * This renderer listens to combat events and creates visual effects,
 * allowing combat logic to run headlessly without PixiJS for simulations.
 */

import type { Tower } from '@objects/Tower';
import type { Zombie } from '@objects/Zombie';
import { EventBus, GameEvents, type EventSubscription } from '@utils/EventBus';
import type { EffectManager } from './effects/EffectManager';

export interface TargetHitEventData {
  tower: Tower;
  target: Zombie;
  spawnPos: { x: number; y: number };
  targetPos: { x: number; y: number };
  damage: number;
  projectileType: string;
  isFirstHit: boolean;
}

export interface LightningArcEventData {
  from: { x: number; y: number };
  to: { x: number; y: number };
  isFirstArc: boolean;
  damage: number;
  chainIndex: number;
}

export interface SniperHitEventData {
  tower: Tower;
  startX: number;
  startY: number;
  targetX: number;
  targetY: number;
  isHeadshot: boolean;
  upgradeLevel: number;
  barrelRotation: number;
}

export interface ShootingEffectEventData {
  tower: Tower;
  barrel: unknown; // Pixi Container - kept as unknown for headless support
  type: string;
  upgradeLevel: number;
}

export interface TowerRotationEventData {
  tower: Tower;
  targetX: number;
  targetY: number;
  rotation: number;
}

export interface TowerDamagedEventData {
  tower: Tower;
  damage: number;
}

export interface DamageDealtEventData {
  damage: number;
  towerType: string;
  killed: boolean;
  overkill: number;
  zombieX?: number;
  zombieY?: number;
  zombieId?: string;
}

export interface GibDeathEventData {
  zombieId: string;
  x: number;
  y: number;
  overkill: number;
  towerType: string;
  gibType: 'small' | 'medium' | 'large' | 'massive'; // Based on overkill amount
}

export class CombatRenderer {
  private effectManager: EffectManager | null = null;
  private eventSubscriptions: EventSubscription[] = [];
  private enabled: boolean = true;

  constructor(effectManager?: EffectManager) {
    if (effectManager) {
      this.effectManager = effectManager;
    }
    this.setupEventListeners();
  }

  /**
   * Set the EffectManager for spawning visual effects
   */
  public setEffectManager(effectManager: EffectManager): void {
    this.effectManager = effectManager;
  }

  /**
   * Enable/disable rendering (for headless mode)
   */
  public setEnabled(enabled: boolean): void {
    this.enabled = enabled;
  }

  /**
   * Check if rendering is enabled
   */
  public isEnabled(): boolean {
    return this.enabled;
  }

  private setupEventListeners(): void {
    const eventBus = EventBus.getInstance();

    // Listen for target hit events (for projectile-based towers)
    this.eventSubscriptions.push(
      eventBus.on<TargetHitEventData>(GameEvents.TARGET_HIT, (data) => {
        if (data && this.enabled) {
          this.onTargetHit(data);
        }
      })
    );

    // Listen for lightning arc events (Tesla tower)
    this.eventSubscriptions.push(
      eventBus.on<LightningArcEventData>(GameEvents.LIGHTNING_ARC, (data) => {
        if (data && this.enabled) {
          this.onLightningArc(data);
        }
      })
    );

    // Listen for sniper hit events
    this.eventSubscriptions.push(
      eventBus.on<SniperHitEventData>(GameEvents.SNIPER_HIT, (data) => {
        if (data && this.enabled) {
          this.onSniperHit(data);
        }
      })
    );

    // Listen for shooting effect events
    this.eventSubscriptions.push(
      eventBus.on<ShootingEffectEventData>(GameEvents.SHOOTING_EFFECT, (data) => {
        if (data && this.enabled) {
          this.onShootingEffect(data);
        }
      })
    );

    // Listen for tower damaged events
    this.eventSubscriptions.push(
      eventBus.on<TowerDamagedEventData>(GameEvents.TOWER_DAMAGED, (data) => {
        if (data && this.enabled) {
          this.onTowerDamaged(data);
        }
      })
    );

    // Listen for damage dealt events (for overkill gib explosions)
    this.eventSubscriptions.push(
      eventBus.on<DamageDealtEventData>(GameEvents.DAMAGE_DEALT, (data) => {
        if (data && this.enabled) {
          this.onDamageDealt(data);
        }
      })
    );

    // Listen for gib death events (unique overkill death animation)
    this.eventSubscriptions.push(
      eventBus.on<GibDeathEventData>(GameEvents.GIB_DEATH, (data) => {
        if (data && this.enabled) {
          this.onGibDeath(data);
        }
      })
    );
  }

  private onTargetHit(data: TargetHitEventData): void {
    // Effects are handled by projectiles in ProjectileManager
    // This event is for future extensibility (e.g., hit markers, damage numbers)
  }

  private onLightningArc(data: LightningArcEventData): void {
    if (!this.effectManager) {
      return;
    }

    // Spawn lightning arc visual
    this.effectManager.spawnLightningArc(
      data.from.x,
      data.from.y,
      data.to.x,
      data.to.y,
      data.isFirstArc
    );

    // Spawn electric particles at target
    if (data.chainIndex === 0) {
      // For the first arc, we'd need the zombie reference
      // This is handled by the tower spawning particles separately
      // or we could extend the event data
    }
  }

  private onSniperHit(data: SniperHitEventData): void {
    if (!this.effectManager) {
      return;
    }

    // Spawn bullet trail
    this.effectManager.spawnBulletTrail(
      data.startX,
      data.startY,
      data.targetX,
      data.targetY
    );

    // Spawn impact flash
    this.effectManager.spawnImpactFlash(data.targetX, data.targetY, data.isHeadshot);
  }

  private onShootingEffect(data: ShootingEffectEventData): void {
    // The actual shooting effect is rendered by the Tower's renderer
    // This event is for additional global effects if needed
  }

  private onTowerDamaged(data: TowerDamagedEventData): void {
    if (!this.effectManager) {
      return;
    }

    // Spawn damage flash effect on tower
    this.effectManager.spawnDamageFlash(data.tower, 30);
  }

  private onDamageDealt(data: DamageDealtEventData): void {
    // Check for 100%+ overkill (overkill >= damage = zombie gibbed/exploded)
    // This creates satisfying "overkill" moments and prevents corpse spawning
    if (data.killed && data.overkill >= data.damage && data.zombieX !== undefined && data.zombieY !== undefined) {
      // Determine gib type based on overkill magnitude
      // 100-199% overkill = small gib, 200-399% = medium, 400-799% = large, 800%+ = massive
      const overkillRatio = data.overkill / data.damage;
      let gibType: GibDeathEventData['gibType'] = 'small';
      if (overkillRatio >= 8) gibType = 'massive';
      else if (overkillRatio >= 4) gibType = 'large';
      else if (overkillRatio >= 2) gibType = 'medium';

      // Emit dedicated GIB_DEATH event for unique death animation
      // This is separate from regular ZOMBIE_KILLED for distinct visual handling
      EventBus.getInstance().emit(GameEvents.GIB_DEATH, {
        zombieId: data.zombieId || 'unknown',
        x: data.zombieX,
        y: data.zombieY,
        overkill: data.overkill,
        towerType: data.towerType,
        gibType,
      });

      console.log(`💥 ${data.towerType} gibbed a zombie with ${data.overkill.toFixed(0)} overkill damage! (${gibType} gib)`);
    }
  }

  private onGibDeath(data: GibDeathEventData): void {
    if (!this.effectManager) {
      return;
    }

    // Play UNIQUE death animation based on gib type
    // This is visually distinct from regular zombie death
    switch (data.gibType) {
      case 'small':
        // Small pop - quick explosion, minimal gibs
        this.effectManager.spawnImpactFlash(data.x, data.y, true);
        console.log(`🔴 Small gib at (${data.x.toFixed(0)}, ${data.y.toFixed(0)})`);
        break;

      case 'medium':
        // Medium explosion - visible gibs, blood spray
        this.effectManager.spawnImpactFlash(data.x, data.y, true);
        // Could add: this.effectManager.spawnBloodSpray(data.x, data.y, 'medium');
        console.log(`🔴💥 Medium gib at (${data.x.toFixed(0)}, ${data.y.toFixed(0)})`);
        break;

      case 'large':
        // Large explosion - chunks fly everywhere
        this.effectManager.spawnImpactFlash(data.x, data.y, true);
        // Could add: this.effectManager.spawnGibs(data.x, data.y, 5); // 5 chunks
        // Could add: this.effectManager.spawnBloodPool(data.x, data.y);
        console.log(`🔴💥💥 LARGE GIB at (${data.x.toFixed(0)}, ${data.y.toFixed(0)})`);
        break;

      case 'massive':
        // Massive overkill - screen shake, huge explosion, no body left
        this.effectManager.spawnImpactFlash(data.x, data.y, true);
        // Could add: this.effectManager.spawnScreenShake(0.3);
        // Could add: this.effectManager.spawnExplosion(data.x, data.y, 'massive');
        // Could add: this.effectManager.spawnBloodRain(data.x, data.y);
        console.log(`🔴💥💥💥 MASSIVE GIB! ${data.towerType} VAPORIZED a zombie at (${data.x.toFixed(0)}, ${data.y.toFixed(0)})`);
        break;
    }

    // Notify corpse manager to NOT spawn a corpse (zombie was vaporized)
    // This is handled by the gibbed event being distinct from regular death
  }

  /**
   * Clean up event listeners
   */
  public dispose(): void {
    this.eventSubscriptions.forEach(sub => sub.unsubscribe());
    this.eventSubscriptions = [];
  }
}
