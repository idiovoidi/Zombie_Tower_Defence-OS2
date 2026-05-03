import type { Container } from 'pixi.js';

export interface ZombieRenderState {
  position: { x: number; y: number };
  health: number;
  maxHealth: number;
  speed: number;
  direction: { x: number; y: number };
  isMoving: boolean;
  isDamaged: boolean;
  statusEffects: string[];
}

export interface IZombieRenderer {
  render(container: Container, state: ZombieRenderState): void;
  update(deltaTime: number, state: ZombieRenderState): void;
  showDamageEffect(damageType: string, amount: number): void;
  playDeathAnimation(killerType?: string): Promise<void>;
  destroy(): void;
  reset(): void;
  showBurningEffect?(): void;
  stopBurningEffect?(): void;
  updateBurningEffect?(deltaTime: number): void;
}

export enum AnimationState {
  IDLE = 'idle',
  WALK = 'walk',
  ATTACK = 'attack',
  DAMAGE = 'damage',
  DEATH = 'death',
}
