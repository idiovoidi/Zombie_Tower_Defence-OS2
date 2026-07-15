import { Graphics } from 'pixi.js';
import { ShadowEffect } from './components/ZombieEffects';

export const STANDARD_HUMANOID_OFFSETS = {
  leftLegX: -3,
  leftLegY: 10,
  rightLegX: 1,
  rightLegY: 10,
  torsoY: 6,
  leftArmX: -5,
  leftArmY: -4,
  rightArmX: 5,
  rightArmY: -4,
  headY: -12,
} as const;

export function createHumanoidShadow(y = 15, size = 8): Graphics {
  const shadow = new Graphics();
  ShadowEffect.apply(shadow, 0, y, size);
  return shadow;
}

export function createHumanoidLegs(
  primaryColor: number,
  strokeAlpha = 0.6
): { leftLeg: Graphics; rightLeg: Graphics } {
  const leftLeg = new Graphics();
  leftLeg.rect(-1.5, 0, 3, 6).fill(primaryColor);
  leftLeg.rect(-1.5, 0, 3, 6).stroke({ color: 0x000000, width: 0.5, alpha: strokeAlpha });

  const rightLeg = new Graphics();
  rightLeg.rect(-1.5, 0, 3, 6).fill(primaryColor);
  rightLeg.rect(-1.5, 0, 3, 6).stroke({ color: 0x000000, width: 0.5, alpha: strokeAlpha });

  return { leftLeg, rightLeg };
}
