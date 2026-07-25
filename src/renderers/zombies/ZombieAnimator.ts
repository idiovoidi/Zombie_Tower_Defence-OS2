import { AnimationState } from './ZombieRenderer';

export interface AnimationData {
  bodyBob: number;
  headTilt: number;
  headSway: number;
  leftArmAngle: number;
  rightArmAngle: number;
  leftLegOffset: number;
  rightLegOffset: number;
  limbSwing: number;
  /** Per-type personality twitches */
  twitch: number;
  /** Damage-reactive limp factor (0 = healthy, 1 = near death) */
  damageLevel: number;
}

export class ZombieAnimator {
  private currentState: AnimationState = AnimationState.WALK;
  private animationTime = 0;
  private zombieType: string;
  private swayOffset: number;
  private damageLevel = 0; // 0 = full health, 1 = near death
  private twitchTimer = 0;
  private twitchValue = 0;

  constructor(zombieType: string) {
    this.zombieType = zombieType;
    this.swayOffset = Math.random() * Math.PI * 2;
  }

  update(
    deltaTime: number,
    state: { isMoving: boolean; health?: number; maxHealth?: number }
  ): void {
    this.animationTime += deltaTime / 1000;
    this.currentState = state.isMoving ? AnimationState.WALK : AnimationState.IDLE;

    // Update damage level for damage-reactive animations
    if (state.health !== undefined && state.maxHealth !== undefined && state.maxHealth > 0) {
      this.damageLevel = 1 - state.health / state.maxHealth;
    }

    // Random twitches - more frequent when damaged
    this.twitchTimer += deltaTime / 1000;
    const twitchFrequency = 2 + this.damageLevel * 5; // More twitches when hurt
    if (this.twitchTimer > 1 / twitchFrequency && Math.random() > 0.7) {
      this.twitchValue = (Math.random() - 0.5) * (0.5 + this.damageLevel);
      this.twitchTimer = 0;
    }
    // Decay twitches
    this.twitchValue *= 0.9;
  }

  getCurrentFrame(): AnimationData {
    const time = this.animationTime + this.swayOffset;

    if (this.currentState === AnimationState.WALK) {
      return this.getWalkFrame(time);
    }
    return this.getIdleFrame(time);
  }

  private getWalkFrame(time: number): AnimationData {
    const speed = this.getAnimationSpeed();
    const gait = this.getGaitStyle();

    // Primary and secondary walk cycles
    const primaryWalk = Math.sin(time * 4 * speed);
    const secondaryWalk = Math.sin(time * 3.2 * speed) * 0.3;
    const tertiaryWalk = Math.sin(time * 7.1 * speed) * 0.1; // Subtle high-frequency tremor

    // Damage-reactive modifications
    const limpFactor = this.damageLevel * 0.5;
    const limpOffset = Math.sin(time * 2 * speed) * limpFactor * 3;

    return {
      bodyBob: primaryWalk * (2 + gait.bobIntensity) + secondaryWalk * 0.5 + limpOffset,
      headTilt:
        Math.sin(time * 2 * speed) * (0.2 + gait.headBobIntensity) +
        tertiaryWalk * gait.headJerkiness +
        this.twitchValue * 0.3,
      headSway:
        Math.sin(time * (2.3 + gait.headSwayFreq) * speed) * (1.5 + gait.headSwayAmp) +
        Math.sin(time * 4.1 * speed) * 0.5 +
        this.twitchValue * 0.8,
      leftArmAngle:
        Math.sin(time * 4 * speed) * (0.6 + gait.armSwing) +
        gait.armForwardReach +
        this.damageLevel * 0.2, // Wounded arm drops
      rightArmAngle:
        Math.sin(time * 4 * speed + Math.PI) * (0.5 + gait.armSwing) + gait.armForwardReach,
      leftLegOffset: Math.sin(time * 4 * speed) * (2.5 + gait.legStride) + limpOffset,
      rightLegOffset: Math.sin(time * 4 * speed + Math.PI) * (2.5 + gait.legStride) - limpOffset,
      limbSwing: primaryWalk,
      twitch: this.twitchValue,
      damageLevel: this.damageLevel,
    };
  }

  /**
   * Get per-type gait personality parameters.
   */
  private getGaitStyle(): {
    bobIntensity: number;
    headBobIntensity: number;
    headJerkiness: number;
    headSwayFreq: number;
    headSwayAmp: number;
    armSwing: number;
    armForwardReach: number;
    legStride: number;
  } {
    switch (this.zombieType) {
      case 'FAST':
        return {
          bobIntensity: 0.5,
          headBobIntensity: 0.1,
          headJerkiness: 2.0, // Darting, twitchy head
          headSwayFreq: 1.5,
          headSwayAmp: 0.3,
          armSwing: 0.3,
          armForwardReach: 0.1,
          legStride: 1.5,
        };
      case 'TANK':
        return {
          bobIntensity: 1.5, // Heavy lumbering bob
          headBobIntensity: 0.05,
          headJerkiness: 0.2,
          headSwayFreq: 0.3,
          headSwayAmp: 0.8, // Wide, slow head sway
          armSwing: 0.2, // Arms hang heavy
          armForwardReach: 0.4, // Arms reach forward menacingly
          legStride: 0.5, // Short, heavy steps
        };
      case 'BOSS':
        return {
          bobIntensity: 2.0, // Massive ground-shaking bob
          headBobIntensity: 0.04,
          headJerkiness: 0.15,
          headSwayFreq: 0.25,
          headSwayAmp: 1.0, // Slow, menacing head sway
          armSwing: 0.15,
          armForwardReach: 0.5,
          legStride: 0.4, // Slow, crushing steps
        };
      case 'NECRO_TANK':
        return {
          bobIntensity: 1.8,
          headBobIntensity: 0.045,
          headJerkiness: 0.18,
          headSwayFreq: 0.28,
          headSwayAmp: 0.9,
          armSwing: 0.18,
          armForwardReach: 0.45,
          legStride: 0.45,
        };
      case 'STEALTH':
        return {
          bobIntensity: 0.3,
          headBobIntensity: 0.15,
          headJerkiness: 1.5,
          headSwayFreq: 2.0,
          headSwayAmp: 0.2, // Quick, scanning head movements
          armSwing: 0.1, // Arms close to body
          armForwardReach: -0.1, // Arms pulled back
          legStride: 0.8,
        };
      case 'SWARM':
        return {
          bobIntensity: 1.0,
          headBobIntensity: 0.3,
          headJerkiness: 3.0, // Very erratic
          headSwayFreq: 2.5,
          headSwayAmp: 0.5,
          armSwing: 0.5, // Wild arm flailing
          armForwardReach: 0.3,
          legStride: 1.8, // Scurrying stride
        };
      case 'ARMORED':
        return {
          bobIntensity: 0.8,
          headBobIntensity: 0.05,
          headJerkiness: 0.3,
          headSwayFreq: 0.5,
          headSwayAmp: 0.4,
          armSwing: 0.15, // Restricted by armor
          armForwardReach: 0.2,
          legStride: 0.6,
        };
      case 'MECHANICAL':
        return {
          bobIntensity: 0.2, // Smooth mechanical movement
          headBobIntensity: 0.02,
          headJerkiness: 0.1, // Very precise
          headSwayFreq: 0.8,
          headSwayAmp: 0.1,
          armSwing: 0.1,
          armForwardReach: 0.0,
          legStride: 0.4,
        };
      default: // BASIC
        return {
          bobIntensity: 0.5,
          headBobIntensity: 0.15,
          headJerkiness: 0.8,
          headSwayFreq: 0.8,
          headSwayAmp: 0.5,
          armSwing: 0.2,
          armForwardReach: 0.3,
          legStride: 0.8,
        };
    }
  }

  private getAnimationSpeed(): number {
    switch (this.zombieType) {
      case 'FAST':
        return 1.5;
      case 'SWARM':
        return 1.3;
      case 'STEALTH':
        return 1.2;
      case 'TANK':
        return 0.7;
      case 'BOSS':
        return 0.55;
      case 'NECRO_TANK':
        return 0.6;
      default:
        return 1.0;
    }
  }

  private getIdleFrame(time: number): AnimationData {
    const breathe = Math.sin(time * 1.5);
    const twitch = Math.sin(time * 7.3) * 0.1;

    // More pronounced idle twitching when damaged
    const damagetwitch = this.damageLevel * Math.sin(time * 11.7) * 0.15;

    return {
      bodyBob: breathe * 0.8 + twitch + damagetwitch,
      headTilt: Math.sin(time * 1.2) * 0.08 + twitch * 0.5 + this.twitchValue * 0.4,
      headSway: Math.sin(time * 1.3) * 0.5 + Math.sin(time * 3.7) * 0.2 + this.twitchValue * 0.6,
      leftArmAngle: Math.sin(time * 1.8) * 0.15 + 0.2 + this.damageLevel * 0.3,
      rightArmAngle: Math.sin(time * 1.8 + 0.7) * 0.12 + 0.15,
      leftLegOffset: 0,
      rightLegOffset: 0,
      limbSwing: breathe * 0.1,
      twitch: this.twitchValue,
      damageLevel: this.damageLevel,
    };
  }

  setState(state: AnimationState): void {
    this.currentState = state;
  }
}
