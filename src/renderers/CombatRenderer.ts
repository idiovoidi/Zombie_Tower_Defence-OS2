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

  /**
   * Clean up event listeners
   */
  public dispose(): void {
    this.eventSubscriptions.forEach(sub => sub.unsubscribe());
    this.eventSubscriptions = [];
  }
}
