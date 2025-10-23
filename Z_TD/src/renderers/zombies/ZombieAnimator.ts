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
}

export class ZombieAnimator {
  private currentState: AnimationState = AnimationState.WALK;
  private animationTime: number = 0;
  private zombieType: string;
  private swayOffset: number;

  constructor(zombieType: string) {
    this.zombieType = zombieType;
    this.swayOffset = Math.random() * Math.PI * 2;
  }

  update(deltaTime: number, state: { isMoving: boolean }): void {
    this.animationTime += deltaTime / 1000;
    this.currentState = state.isMoving ? AnimationState.WALK : AnimationState.IDLE;
  }

  getCurrentFrame(): AnimationData {
    const time = this.animationTime + this.swayOffset;

    if (this.currentState === AnimationState.WALK) {
      return this.getWalkFrame(time);
    } else {
      return this.getIdleFrame(time);
    }
  }

  private getWalkFrame(time: number): AnimationData {
    // More pronounced shambling with multiple frequencies
    const primaryWalk = Math.sin(time * 4);
    const secondaryWalk = Math.sin(time * 3.2) * 0.3;

    return {
      bodyBob: primaryWalk * 2 + secondaryWalk * 0.5,
      headTilt: Math.sin(time * 2) * 0.2 + Math.sin(time * 3.7) * 0.1,
      headSway: Math.sin(time * 2.3) * 1.5 + Math.sin(time * 4.1) * 0.5,
      leftArmAngle: Math.sin(time * 4) * 0.6 + 0.3,
      rightArmAngle: Math.sin(time * 4 + Math.PI) * 0.5 + 0.2,
      leftLegOffset: Math.sin(time * 4) * 2.5,
      rightLegOffset: Math.sin(time * 4 + Math.PI) * 2.5,
      limbSwing: primaryWalk,
    };
  }

  private getIdleFrame(time: number): AnimationData {
    // Breathing and subtle twitching
    const breathe = Math.sin(time * 1.5);
    const twitch = Math.sin(time * 7.3) * 0.1;

    return {
      bodyBob: breathe * 0.8 + twitch,
      headTilt: Math.sin(time * 1.2) * 0.08 + twitch * 0.5,
      headSway: Math.sin(time * 1.3) * 0.5 + Math.sin(time * 3.7) * 0.2,
      leftArmAngle: Math.sin(time * 1.8) * 0.15 + 0.2,
      rightArmAngle: Math.sin(time * 1.8 + 0.7) * 0.12 + 0.15,
      leftLegOffset: 0,
      rightLegOffset: 0,
      limbSwing: breathe * 0.1,
    };
  }

  setState(state: AnimationState): void {
    this.currentState = state;
  }
}
