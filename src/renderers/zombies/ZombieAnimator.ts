import { footfallPulse, stepWave } from '../../utils/WalkStagger';
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
  private phaseOffset: number;
  private damageLevel = 0; // 0 = full health, 1 = near death
  private twitchTimer = 0;
  private twitchValue = 0;

  constructor(zombieType: string) {
    this.zombieType = zombieType;
    this.phaseOffset = Math.random() * Math.PI * 2;
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
    const time = this.animationTime + this.phaseOffset;

    if (this.currentState === AnimationState.WALK) {
      return this.getWalkFrame(time);
    }
    return this.getIdleFrame(time);
  }

  private getWalkFrame(time: number): AnimationData {
    const speed = this.getAnimationSpeed();
    const gait = this.getGaitStyle();

    // Stride phase — shaped step waves, not stacked sines
    const stridePhase = time * 4 * speed;
    const limpDrag = this.damageLevel * 0.55 + gait.limpBias;
    const leftStep = stepWave(stridePhase, gait.stepSharpness, limpDrag);
    const rightStep = stepWave(stridePhase + Math.PI, gait.stepSharpness, -limpDrag * 0.35);

    // Body dips on each foot plant (twice per stride), with a slight limp hitch
    const plants = footfallPulse(stridePhase, gait.stepSharpness);
    const limpHitch = leftStep > 0 ? limpDrag * plants * 1.2 : 0;

    // Head follows the stride with a delayed, softer step (not an independent sine)
    const headPhase = stridePhase * 0.5 - 0.4;
    const headStep = stepWave(headPhase, 0.75, limpDrag * 0.4);

    return {
      bodyBob: plants * (2 + gait.bobIntensity) + limpHitch,
      headTilt: headStep * (0.12 + gait.headBobIntensity) + this.twitchValue * 0.3,
      headSway:
        headStep * (1.2 + gait.headSwayAmp) +
        rightStep * 0.35 * gait.headSwayAmp +
        this.twitchValue * 0.8,
      leftArmAngle:
        leftStep * (0.55 + gait.armSwing) + gait.armForwardReach + this.damageLevel * 0.2,
      rightArmAngle: rightStep * (0.45 + gait.armSwing) + gait.armForwardReach,
      leftLegOffset: leftStep * (2.5 + gait.legStride) + limpHitch,
      rightLegOffset: rightStep * (2.5 + gait.legStride) - limpHitch * 0.4,
      limbSwing: leftStep,
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
    headSwayAmp: number;
    armSwing: number;
    armForwardReach: number;
    legStride: number;
    stepSharpness: number;
    limpBias: number;
  } {
    switch (this.zombieType) {
      case 'FAST':
        return {
          bobIntensity: 0.5,
          headBobIntensity: 0.1,
          headSwayAmp: 0.3,
          armSwing: 0.3,
          armForwardReach: 0.1,
          legStride: 1.5,
          stepSharpness: 0.55, // Snappy, darting steps
          limpBias: 0.05,
        };
      case 'TANK':
        return {
          bobIntensity: 1.5,
          headBobIntensity: 0.05,
          headSwayAmp: 0.8,
          armSwing: 0.2,
          armForwardReach: 0.4,
          legStride: 0.5,
          stepSharpness: 0.45, // Heavy, flat-footed stomps
          limpBias: 0.2,
        };
      case 'BOSS':
        return {
          bobIntensity: 2.0,
          headBobIntensity: 0.04,
          headSwayAmp: 1.0,
          armSwing: 0.15,
          armForwardReach: 0.5,
          legStride: 0.4,
          stepSharpness: 0.4,
          limpBias: 0.25,
        };
      case 'NECRO_TANK':
        return {
          bobIntensity: 1.8,
          headBobIntensity: 0.045,
          headSwayAmp: 0.9,
          armSwing: 0.18,
          armForwardReach: 0.45,
          legStride: 0.45,
          stepSharpness: 0.42,
          limpBias: 0.22,
        };
      case 'STEALTH':
        return {
          bobIntensity: 0.3,
          headBobIntensity: 0.15,
          headSwayAmp: 0.2,
          armSwing: 0.1,
          armForwardReach: -0.1,
          legStride: 0.8,
          stepSharpness: 0.7, // Softer, quieter plants
          limpBias: 0.1,
        };
      case 'SWARM':
        return {
          bobIntensity: 1.0,
          headBobIntensity: 0.3,
          headSwayAmp: 0.5,
          armSwing: 0.5,
          armForwardReach: 0.3,
          legStride: 1.8,
          stepSharpness: 0.5,
          limpBias: 0.15,
        };
      case 'ARMORED':
        return {
          bobIntensity: 0.8,
          headBobIntensity: 0.05,
          headSwayAmp: 0.4,
          armSwing: 0.15,
          armForwardReach: 0.2,
          legStride: 0.6,
          stepSharpness: 0.5,
          limpBias: 0.12,
        };
      case 'MECHANICAL':
        return {
          bobIntensity: 0.2,
          headBobIntensity: 0.02,
          headSwayAmp: 0.1,
          armSwing: 0.1,
          armForwardReach: 0.0,
          legStride: 0.4,
          stepSharpness: 0.85, // Near-sine, precise servo motion
          limpBias: 0,
        };
      default: // BASIC
        return {
          bobIntensity: 0.5,
          headBobIntensity: 0.15,
          headSwayAmp: 0.5,
          armSwing: 0.2,
          armForwardReach: 0.3,
          legStride: 0.8,
          stepSharpness: 0.6,
          limpBias: 0.15,
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
    // Idle can stay sine-based — breathing should feel smooth
    const breathe = Math.sin(time * 1.5);
    const twitch = Math.sin(time * 7.3) * 0.1;
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
