import type { RagdollImpulse, RagdollSkeletonConfig } from './RagdollSkeleton';

/**
 * Zombie body color palettes per type for ragdoll bones.
 */
const ZOMBIE_COLORS = {
  basic: { skin: 0x2d5016, dark: 0x1a3010, accent: 0x3a6b20 },
  fast: { skin: 0xd45a00, dark: 0x993f00, accent: 0xff7722 },
  tank: { skin: 0x8b1a1a, dark: 0x661414, accent: 0xaa2222 },
  armored: { skin: 0x556655, dark: 0x445544, accent: 0x888888 },
  swarm: { skin: 0x999900, dark: 0x777700, accent: 0xbbbb22 },
  stealth: { skin: 0x442288, dark: 0x331166, accent: 0x6633aa },
  mechanical: { skin: 0x336666, dark: 0x224444, accent: 0x00aaaa },
};

/**
 * Create a ragdoll skeleton configuration for a specific zombie type.
 * Each zombie has different proportions, mass, and visual style.
 */
export function createRagdollConfig(zombieType: string, groundY = 20): RagdollSkeletonConfig {
  const colors = getColorsForType(zombieType);
  const scale = getScaleForType(zombieType);
  const massScale = getMassScaleForType(zombieType);

  return {
    bones: [
      // Torso (root bone) - vertical, pointing downward from shoulders
      {
        name: 'torso',
        parent: null,
        offsetX: 0,
        offsetY: -4 * scale,
        angle: Math.PI / 2, // Pointing down
        length: 12 * scale,
        mass: 8 * massScale,
        width: 10 * scale,
        color: colors.skin,
      },
      // Head - attached to top of torso
      {
        name: 'head',
        parent: 'torso',
        offsetX: 0,
        offsetY: 0,
        angle: -Math.PI / 2, // Pointing up from torso top
        length: 8 * scale,
        mass: 3 * massScale,
        width: 8 * scale,
        color: colors.accent,
      },
      // Left arm
      {
        name: 'arm_l',
        parent: 'torso',
        offsetX: 0,
        offsetY: 0,
        angle: Math.PI * 0.7, // Reaching forward-down-left
        length: 10 * scale,
        mass: 1.5 * massScale,
        width: 3 * scale,
        color: colors.skin,
      },
      // Right arm
      {
        name: 'arm_r',
        parent: 'torso',
        offsetX: 0,
        offsetY: 0,
        angle: Math.PI * 0.3, // Reaching forward-down-right
        length: 10 * scale,
        mass: 1.5 * massScale,
        width: 3 * scale,
        color: colors.skin,
      },
      // Left leg
      {
        name: 'leg_l',
        parent: 'torso',
        offsetX: 0,
        offsetY: 0,
        angle: Math.PI / 2 + 0.2, // Slightly splayed
        length: 10 * scale,
        mass: 2.5 * massScale,
        width: 4 * scale,
        color: colors.dark,
      },
      // Right leg
      {
        name: 'leg_r',
        parent: 'torso',
        offsetX: 0,
        offsetY: 0,
        angle: Math.PI / 2 - 0.2, // Slightly splayed
        length: 10 * scale,
        mass: 2.5 * massScale,
        width: 4 * scale,
        color: colors.dark,
      },
    ],
    constraints: [
      // Head-torso: limited neck movement
      {
        boneA: 'torso',
        boneB: 'head',
        minAngle: -Math.PI * 0.9,
        maxAngle: -Math.PI * 0.4,
        stiffness: 0.6,
      },
      // Arms: wide range of motion
      {
        boneA: 'torso',
        boneB: 'arm_l',
        minAngle: -Math.PI * 0.2,
        maxAngle: Math.PI * 0.8,
        stiffness: 0.3,
      },
      {
        boneA: 'torso',
        boneB: 'arm_r',
        minAngle: -Math.PI * 0.8,
        maxAngle: Math.PI * 0.2,
        stiffness: 0.3,
      },
      // Legs: limited hip range
      {
        boneA: 'torso',
        boneB: 'leg_l',
        minAngle: -0.8,
        maxAngle: 0.8,
        stiffness: 0.5,
      },
      {
        boneA: 'torso',
        boneB: 'leg_r',
        minAngle: -0.8,
        maxAngle: 0.8,
        stiffness: 0.5,
      },
    ],
    gravity: getGravityForType(zombieType),
    damping: getDampingForType(zombieType),
    groundY,
    bounce: 0.2,
    friction: 0.7,
  };
}

function getColorsForType(type: string): {
  skin: number;
  dark: number;
  accent: number;
} {
  switch (type) {
    case 'Fast':
      return ZOMBIE_COLORS.fast;
    case 'Tank':
      return ZOMBIE_COLORS.tank;
    case 'Armored':
      return ZOMBIE_COLORS.armored;
    case 'Swarm':
      return ZOMBIE_COLORS.swarm;
    case 'Stealth':
      return ZOMBIE_COLORS.stealth;
    case 'Mechanical':
      return ZOMBIE_COLORS.mechanical;
    default:
      return ZOMBIE_COLORS.basic;
  }
}

function getScaleForType(type: string): number {
  switch (type) {
    case 'Tank':
      return 1.5;
    case 'Armored':
      return 1.2;
    case 'Swarm':
      return 0.6;
    case 'Mechanical':
      return 1.15;
    default:
      return 1.0;
  }
}

function getMassScaleForType(type: string): number {
  switch (type) {
    case 'Tank':
      return 2.5;
    case 'Armored':
      return 1.8;
    case 'Swarm':
      return 0.4;
    case 'Fast':
      return 0.7;
    default:
      return 1.0;
  }
}

function getGravityForType(type: string): number {
  switch (type) {
    case 'Tank':
      return 600;
    case 'Swarm':
      return 350;
    case 'Fast':
      return 400;
    default:
      return 500;
  }
}

function getDampingForType(type: string): number {
  switch (type) {
    case 'Tank':
      return 0.96; // Heavy, slow to stop
    case 'Fast':
      return 0.93; // Light, stops quickly
    case 'Swarm':
      return 0.92;
    default:
      return 0.95;
  }
}

/**
 * Calculate death impulses based on tower type and impact direction.
 * The direction angle points FROM the tower/projectile TOWARD the zombie.
 */
export function calculateDeathImpulses(
  killerType: string,
  impactAngle: number,
  zombieType: string
): RagdollImpulse[] {
  const impulses: RagdollImpulse[] = [];
  const massScale = getMassScaleForType(zombieType);
  // More force needed for heavier zombies, but cap it
  const forceMultiplier = Math.min(1 / Math.sqrt(massScale), 2.0);

  // Impact direction components (direction zombie should fly)
  const dirX = Math.cos(impactAngle);
  const dirY = Math.sin(impactAngle);

  switch (killerType) {
    case 'Shotgun':
      // Devastating knockback - zombie flies backward from blast
      impulses.push(
        {
          boneName: 'torso',
          forceX: dirX * 350 * forceMultiplier,
          forceY: dirY * 250 * forceMultiplier - 120,
          torque: (Math.random() - 0.5) * 8,
        },
        {
          boneName: 'head',
          forceX: dirX * 400 * forceMultiplier,
          forceY: -180 * forceMultiplier,
          torque: dirX * 6,
        },
        {
          boneName: 'arm_l',
          forceX: dirX * 200 + (Math.random() - 0.5) * 100,
          forceY: -100 - Math.random() * 80,
          torque: (Math.random() - 0.5) * 10,
        },
        {
          boneName: 'arm_r',
          forceX: dirX * 200 + (Math.random() - 0.5) * 100,
          forceY: -100 - Math.random() * 80,
          torque: (Math.random() - 0.5) * 10,
        }
      );
      break;

    case 'Sniper':
      // Precise headshot - head violently jerks, body has delayed reaction
      impulses.push(
        {
          boneName: 'head',
          forceX: dirX * 500 * forceMultiplier,
          forceY: -200 * forceMultiplier,
          torque: dirX * 12,
        },
        {
          boneName: 'torso',
          forceX: dirX * 60,
          forceY: -20,
          torque: dirX * 1.5,
        }
      );
      break;

    case 'Grenade':
      // Explosive - massive upward and outward scatter from center
      {
        const explodeAngle = Math.random() * Math.PI * 2;
        const explodeForce = 300 + Math.random() * 200;
        impulses.push(
          {
            boneName: 'torso',
            forceX: Math.cos(explodeAngle) * explodeForce * 0.7,
            forceY: -explodeForce,
            torque: (Math.random() - 0.5) * 15,
          },
          {
            boneName: 'head',
            forceX: Math.cos(explodeAngle + 0.5) * explodeForce,
            forceY: -explodeForce * 1.2,
            torque: (Math.random() - 0.5) * 20,
          },
          {
            boneName: 'arm_l',
            forceX: -explodeForce * 0.8,
            forceY: -explodeForce * 0.6,
            torque: Math.random() * 15,
          },
          {
            boneName: 'arm_r',
            forceX: explodeForce * 0.8,
            forceY: -explodeForce * 0.6,
            torque: -Math.random() * 15,
          },
          {
            boneName: 'leg_l',
            forceX: -explodeForce * 0.5 + (Math.random() - 0.5) * 100,
            forceY: -explodeForce * 0.4,
            torque: (Math.random() - 0.5) * 10,
          },
          {
            boneName: 'leg_r',
            forceX: explodeForce * 0.5 + (Math.random() - 0.5) * 100,
            forceY: -explodeForce * 0.4,
            torque: (Math.random() - 0.5) * 10,
          }
        );
      }
      break;

    case 'Tesla':
      // Electric convulsion - rapid twitching + upward jolt
      impulses.push(
        {
          boneName: 'torso',
          forceX: (Math.random() - 0.5) * 150,
          forceY: -200,
          torque: (Math.random() - 0.5) * 20,
        },
        {
          boneName: 'head',
          forceX: (Math.random() - 0.5) * 200,
          forceY: -150,
          torque: (Math.random() - 0.5) * 25,
        },
        {
          boneName: 'arm_l',
          forceX: -150 - Math.random() * 100,
          forceY: -80,
          torque: 10 + Math.random() * 10,
        },
        {
          boneName: 'arm_r',
          forceX: 150 + Math.random() * 100,
          forceY: -80,
          torque: -10 - Math.random() * 10,
        }
      );
      break;

    case 'Flame':
      // Slow crumple - minimal force, zombie collapses in place
      impulses.push(
        {
          boneName: 'torso',
          forceX: (Math.random() - 0.5) * 30,
          forceY: -15,
          torque: (Math.random() - 0.5) * 3,
        },
        {
          boneName: 'head',
          forceX: (Math.random() - 0.5) * 20,
          forceY: 10,
          torque: (Math.random() - 0.5) * 4,
        },
        {
          boneName: 'arm_l',
          forceX: -20,
          forceY: 20,
          torque: 2,
        },
        {
          boneName: 'arm_r',
          forceX: 20,
          forceY: 20,
          torque: -2,
        }
      );
      break;

    default:
      // Generic directional death (turret, default)
      impulses.push(
        {
          boneName: 'torso',
          forceX: dirX * 180 * forceMultiplier,
          forceY: dirY * 120 * forceMultiplier - 80,
          torque: (Math.random() - 0.5) * 6,
        },
        {
          boneName: 'head',
          forceX: dirX * 200 * forceMultiplier + (Math.random() - 0.5) * 40,
          forceY: -100 * forceMultiplier,
          torque: (Math.random() - 0.5) * 8,
        },
        {
          boneName: 'arm_l',
          forceX: dirX * 80 + (Math.random() - 0.5) * 60,
          forceY: -50 - Math.random() * 40,
          torque: (Math.random() - 0.5) * 6,
        },
        {
          boneName: 'arm_r',
          forceX: dirX * 80 + (Math.random() - 0.5) * 60,
          forceY: -50 - Math.random() * 40,
          torque: (Math.random() - 0.5) * 6,
        }
      );
  }

  return impulses;
}

/**
 * Get which bones should detach for extreme explosive deaths.
 */
export function getDetachableBones(killerType: string): string[] {
  switch (killerType) {
    case 'Grenade': // Random chance to detach limbs on grenade kills
      {
        const detachable: string[] = [];
        if (Math.random() > 0.4) detachable.push('arm_l');
        if (Math.random() > 0.4) detachable.push('arm_r');
        if (Math.random() > 0.7) detachable.push('head');
        if (Math.random() > 0.6) detachable.push('leg_l');
        if (Math.random() > 0.6) detachable.push('leg_r');
        return detachable;
      }
    case 'Tesla': // Rare chance of limb detachment on tesla
      {
        const detachable: string[] = [];
        if (Math.random() > 0.8) detachable.push('arm_l');
        if (Math.random() > 0.8) detachable.push('arm_r');
        return detachable;
      }
    case 'Shotgun': // Rare but violent dismemberment
      {
        const detachable: string[] = [];
        if (Math.random() > 0.7) detachable.push('arm_l');
        if (Math.random() > 0.7) detachable.push('arm_r');
        return detachable;
      }
    default:
      return [];
  }
}

/**
 * Get blood emission configuration for a death type.
 * More violent deaths = more blood emission points.
 */
export function getDeathBloodConfig(killerType: string): Array<{
  boneName: string;
  boneT: number;
  rate: number;
  duration: number;
}> {
  switch (killerType) {
    case 'Shotgun':
      return [
        { boneName: 'torso', boneT: 0.5, rate: 30, duration: 1200 },
        { boneName: 'head', boneT: 0.8, rate: 20, duration: 800 },
        { boneName: 'torso', boneT: 0.2, rate: 15, duration: 1000 },
      ];
    case 'Sniper':
      return [
        { boneName: 'head', boneT: 1.0, rate: 40, duration: 600 },
        { boneName: 'head', boneT: 0.5, rate: 25, duration: 800 },
      ];
    case 'Grenade':
      return [
        { boneName: 'torso', boneT: 0.5, rate: 25, duration: 1500 },
        { boneName: 'arm_l', boneT: 0.5, rate: 15, duration: 1000 },
        { boneName: 'arm_r', boneT: 0.5, rate: 15, duration: 1000 },
        { boneName: 'leg_l', boneT: 0.5, rate: 10, duration: 800 },
        { boneName: 'leg_r', boneT: 0.5, rate: 10, duration: 800 },
      ];
    case 'Tesla':
      // Less blood, more charred
      return [{ boneName: 'torso', boneT: 0.3, rate: 8, duration: 600 }];
    case 'Flame':
      // Minimal blood - cauterized
      return [{ boneName: 'torso', boneT: 0.5, rate: 5, duration: 400 }];
    default:
      return [
        { boneName: 'torso', boneT: 0.5, rate: 20, duration: 1000 },
        { boneName: 'head', boneT: 0.7, rate: 12, duration: 700 },
      ];
  }
}
