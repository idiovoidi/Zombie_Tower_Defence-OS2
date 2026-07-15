import type { Graphics } from 'pixi.js';

/**
 * A single bone in the ragdoll skeleton.
 * Bones are line segments with a position (joint), length, and angle.
 */
export interface RagdollBone {
  /** Unique name for this bone */
  name: string;
  /** Parent bone name (null for root) */
  parent: string | null;
  /** Position of the bone's joint (where it connects to parent) */
  x: number;
  y: number;
  /** Bone angle in radians (relative to world) */
  angle: number;
  /** Bone segment length in pixels */
  length: number;
  /** Mass affects how much force moves this bone */
  mass: number;
  /** Linear velocity */
  vx: number;
  vy: number;
  /** Angular velocity (radians/sec) */
  angularVelocity: number;
  /** Visual width for rendering */
  width: number;
  /** Color for rendering */
  color: number;
  /** Whether this bone has detached (for extreme deaths) */
  detached: boolean;
}

/**
 * Constraint between two connected bones limiting relative angle.
 */
export interface RagdollJointConstraint {
  boneA: string;
  boneB: string;
  /** Minimum relative angle (radians) */
  minAngle: number;
  /** Maximum relative angle (radians) */
  maxAngle: number;
  /** Stiffness of the constraint (0-1, higher = more rigid) */
  stiffness: number;
}

/**
 * Configuration for creating a ragdoll skeleton for a specific zombie type.
 */
export interface RagdollSkeletonConfig {
  bones: Array<{
    name: string;
    parent: string | null;
    /** Offset from parent's end point */
    offsetX: number;
    offsetY: number;
    angle: number;
    length: number;
    mass: number;
    width: number;
    color: number;
  }>;
  constraints: RagdollJointConstraint[];
  /** Gravity strength (pixels/sec²) */
  gravity: number;
  /** Velocity damping per frame (0-1, lower = more drag) */
  damping: number;
  /** Ground Y level */
  groundY: number;
  /** Bounciness on ground collision (0-1) */
  bounce: number;
  /** Ground friction (0-1) */
  friction: number;
}

/**
 * A directional impulse to apply to specific bones on death.
 */
export interface RagdollImpulse {
  /** Target bone name */
  boneName: string;
  /** Force in pixels/sec */
  forceX: number;
  forceY: number;
  /** Torque in radians/sec */
  torque: number;
}

/**
 * Blood emission point tied to a bone for continuous blood trails during ragdoll.
 */
export interface BloodEmitPoint {
  boneName: string;
  /** Offset along bone length (0 = joint, 1 = tip) */
  boneT: number;
  /** Emission rate (particles per second) */
  rate: number;
  /** How long to emit (ms) */
  duration: number;
  /** Timer tracking */
  elapsed: number;
  /** Accumulator for emission timing */
  emitAccumulator: number;
}

/**
 * Procedural ragdoll skeleton for zombie death animations.
 *
 * Creates an articulated skeleton from the zombie's visual bone structure,
 * applies physics impulses based on death direction, and simulates ragdoll
 * collapse with constraints, gravity, and ground collision.
 */
export class RagdollSkeleton {
  private bones: Map<string, RagdollBone> = new Map();
  private boneOrder: string[] = []; // Ordered for parent-first traversal
  private constraints: RagdollJointConstraint[] = [];
  private gravity: number;
  private damping: number;
  private groundY: number;
  private bounce: number;
  private friction: number;
  private settled = false;
  private elapsedTime = 0;
  private maxDuration = 2500; // Max ragdoll duration (ms)
  private settlementThreshold = 2.0; // Total velocity threshold for settlement
  private bloodEmitPoints: BloodEmitPoint[] = [];

  // Callback for blood emission during ragdoll
  public onBloodEmit: ((x: number, y: number, vx: number, vy: number) => void) | null = null;

  constructor(config: RagdollSkeletonConfig) {
    this.gravity = config.gravity;
    this.damping = config.damping;
    this.groundY = config.groundY;
    this.bounce = config.bounce;
    this.friction = config.friction;
    this.constraints = config.constraints;

    // Create bones
    for (const boneDef of config.bones) {
      const bone: RagdollBone = {
        name: boneDef.name,
        parent: boneDef.parent,
        x: boneDef.offsetX,
        y: boneDef.offsetY,
        angle: boneDef.angle,
        length: boneDef.length,
        mass: boneDef.mass,
        vx: 0,
        vy: 0,
        angularVelocity: 0,
        width: boneDef.width,
        color: boneDef.color,
        detached: false,
      };
      this.bones.set(boneDef.name, bone);
      this.boneOrder.push(boneDef.name);
    }
  }

  /**
   * Initialize bone positions from the zombie's current rendered pose.
   * Call this before applying death impulses.
   */
  public initializeFromPose(centerX: number, centerY: number, rotation: number): void {
    // Position root bone at zombie center
    const root = this.bones.get(this.boneOrder[0]);
    if (root) {
      root.x = centerX;
      root.y = centerY;
      root.angle += rotation;
    }

    // Position child bones relative to parents
    for (let i = 1; i < this.boneOrder.length; i++) {
      const bone = this.bones.get(this.boneOrder[i]);
      if (!bone?.parent) continue;

      const parent = this.bones.get(bone.parent);
      if (!parent) continue;

      // Place bone at parent's tip
      const parentTipX = parent.x + Math.cos(parent.angle) * parent.length;
      const parentTipY = parent.y + Math.sin(parent.angle) * parent.length;

      bone.x = parentTipX + bone.x;
      bone.y = parentTipY + bone.y;
    }
  }

  /**
   * Apply death impulses to specific bones.
   */
  public applyImpulses(impulses: RagdollImpulse[]): void {
    for (const impulse of impulses) {
      const bone = this.bones.get(impulse.boneName);
      if (!bone) continue;

      bone.vx += impulse.forceX / bone.mass;
      bone.vy += impulse.forceY / bone.mass;
      bone.angularVelocity += impulse.torque / bone.mass;
    }
  }

  /**
   * Add a blood emission point on a bone.
   */
  public addBloodEmitPoint(boneName: string, boneT: number, rate: number, duration: number): void {
    this.bloodEmitPoints.push({
      boneName,
      boneT,
      rate,
      duration,
      elapsed: 0,
      emitAccumulator: 0,
    });
  }

  /**
   * Step the ragdoll physics simulation.
   * @param deltaTime - Frame time in milliseconds
   * @returns true if ragdoll is still active, false if settled
   */
  public update(deltaTime: number): boolean {
    if (this.settled) return false;

    this.elapsedTime += deltaTime;
    const dt = deltaTime / 1000;

    // Apply gravity to all bones
    for (const bone of this.bones.values()) {
      if (bone.detached) {
        // Detached bones get extra gravity and less damping
        bone.vy += this.gravity * 1.3 * dt;
        bone.vx *= 0.995;
        bone.vy *= 0.995;
      } else {
        bone.vy += this.gravity * dt;
      }
    }

    // Integrate velocities
    for (const bone of this.bones.values()) {
      bone.x += bone.vx * dt;
      bone.y += bone.vy * dt;
      bone.angle += bone.angularVelocity * dt;

      // Apply damping
      bone.vx *= this.damping;
      bone.vy *= this.damping;
      bone.angularVelocity *= this.damping * 0.98; // Extra angular damping
    }

    // Enforce parent-child constraints (keep children attached)
    this.enforceHierarchy();

    // Apply joint angle constraints
    this.enforceJointConstraints();

    // Ground collision
    this.handleGroundCollision();

    // Update blood emission
    this.updateBloodEmission(deltaTime);

    // Check for settlement
    this.checkSettlement();

    return !this.settled;
  }

  /**
   * Enforce parent-child bone hierarchy (children stay attached to parent tips).
   */
  private enforceHierarchy(): void {
    for (let i = 1; i < this.boneOrder.length; i++) {
      const bone = this.bones.get(this.boneOrder[i]);
      if (!bone?.parent || bone.detached) continue;

      const parent = this.bones.get(bone.parent);
      if (!parent) continue;

      // Bone should be attached at parent's tip
      const tipX = parent.x + Math.cos(parent.angle) * parent.length;
      const tipY = parent.y + Math.sin(parent.angle) * parent.length;

      // Calculate correction needed
      const corrX = tipX - bone.x;
      const corrY = tipY - bone.y;

      // Apply correction (split between parent and child based on mass ratio)
      const totalMass = parent.mass + bone.mass;
      const childRatio = parent.mass / totalMass;
      const parentRatio = bone.mass / totalMass;

      bone.x += corrX * childRatio;
      bone.y += corrY * childRatio;
      parent.x -= corrX * parentRatio * 0.3; // Parents move less
      parent.y -= corrY * parentRatio * 0.3;

      // Transfer some velocity through the joint
      bone.vx += corrX * 5; // Constraint velocity correction
      bone.vy += corrY * 5;
    }
  }

  /**
   * Enforce joint angle constraints between connected bones.
   */
  private enforceJointConstraints(): void {
    for (const constraint of this.constraints) {
      const boneA = this.bones.get(constraint.boneA);
      const boneB = this.bones.get(constraint.boneB);
      if (!boneA || !boneB || boneA.detached || boneB.detached) continue;

      // Calculate relative angle
      let relAngle = boneB.angle - boneA.angle;

      // Normalize to -PI to PI
      while (relAngle > Math.PI) relAngle -= Math.PI * 2;
      while (relAngle < -Math.PI) relAngle += Math.PI * 2;

      // Clamp to constraint limits
      let clamped = relAngle;
      if (relAngle < constraint.minAngle) {
        clamped = constraint.minAngle;
      } else if (relAngle > constraint.maxAngle) {
        clamped = constraint.maxAngle;
      }

      if (clamped !== relAngle) {
        const correction = (clamped - relAngle) * constraint.stiffness;
        boneA.angle -= correction * 0.3;
        boneB.angle += correction * 0.7;

        // Dampen angular velocity at constraint limits
        boneB.angularVelocity *= 0.8;
      }
    }
  }

  /**
   * Handle ground collision for all bones.
   */
  private handleGroundCollision(): void {
    for (const bone of this.bones.values()) {
      // Check bone joint position
      if (bone.y > this.groundY) {
        bone.y = this.groundY;
        bone.vy *= -this.bounce;
        bone.vx *= this.friction;
        bone.angularVelocity *= this.friction;
      }

      // Check bone tip position
      const tipY = bone.y + Math.sin(bone.angle) * bone.length;
      if (tipY > this.groundY) {
        // Push bone up and add rotation correction
        const penetration = tipY - this.groundY;
        bone.y -= penetration * 0.5;
        bone.angle -= penetration * 0.02;
        bone.vy *= -this.bounce;
        bone.angularVelocity *= 0.7;
      }
    }
  }

  /**
   * Check if the ragdoll has settled (low total kinetic energy).
   */
  private checkSettlement(): void {
    // Force settle after max duration
    if (this.elapsedTime > this.maxDuration) {
      this.settled = true;
      return;
    }

    // Don't settle too early
    if (this.elapsedTime < 400) return;

    let totalEnergy = 0;
    for (const bone of this.bones.values()) {
      totalEnergy += Math.abs(bone.vx) + Math.abs(bone.vy) + Math.abs(bone.angularVelocity) * 10;
    }

    if (totalEnergy < this.settlementThreshold) {
      this.settled = true;
    }
  }

  /**
   * Update blood emission from wound points.
   */
  private updateBloodEmission(deltaTime: number): void {
    if (!this.onBloodEmit) return;

    for (let i = this.bloodEmitPoints.length - 1; i >= 0; i--) {
      const point = this.bloodEmitPoints[i];
      point.elapsed += deltaTime;

      if (point.elapsed > point.duration) {
        this.bloodEmitPoints.splice(i, 1);
        continue;
      }

      const bone = this.bones.get(point.boneName);
      if (!bone) continue;

      // Calculate emission position along bone
      const emitX = bone.x + Math.cos(bone.angle) * bone.length * point.boneT;
      const emitY = bone.y + Math.sin(bone.angle) * bone.length * point.boneT;

      // Accumulate emission timing
      point.emitAccumulator += deltaTime;
      const emitInterval = 1000 / point.rate;

      while (point.emitAccumulator >= emitInterval) {
        point.emitAccumulator -= emitInterval;

        // Emit blood with bone's velocity plus some random spread
        const spreadAngle = (Math.random() - 0.5) * 1.5;
        const spreadSpeed = 20 + Math.random() * 40;
        this.onBloodEmit(
          emitX,
          emitY,
          bone.vx * 0.3 + Math.cos(bone.angle + spreadAngle) * spreadSpeed,
          bone.vy * 0.3 + Math.sin(bone.angle + spreadAngle) * spreadSpeed
        );
      }
    }
  }

  /**
   * Detach a bone from its parent (for explosive deaths).
   */
  public detachBone(boneName: string): void {
    const bone = this.bones.get(boneName);
    if (bone) {
      bone.detached = true;
    }
  }

  /**
   * Render the ragdoll skeleton onto a Graphics object.
   */
  public render(graphics: Graphics, alpha = 1): void {
    for (const name of this.boneOrder) {
      const bone = this.bones.get(name);
      if (!bone) continue;

      const tipX = bone.x + Math.cos(bone.angle) * bone.length;
      const tipY = bone.y + Math.sin(bone.angle) * bone.length;

      // Draw bone segment as a tapered shape
      const halfWidth = bone.width / 2;
      const perpAngle = bone.angle + Math.PI / 2;
      const perpX = Math.cos(perpAngle) * halfWidth;
      const perpY = Math.sin(perpAngle) * halfWidth;

      // Tapered bone shape (wider at joint, narrower at tip)
      const tipHalfWidth = halfWidth * 0.6;
      const tipPerpX = Math.cos(perpAngle) * tipHalfWidth;
      const tipPerpY = Math.sin(perpAngle) * tipHalfWidth;

      graphics
        .moveTo(bone.x + perpX, bone.y + perpY)
        .lineTo(tipX + tipPerpX, tipY + tipPerpY)
        .lineTo(tipX - tipPerpX, tipY - tipPerpY)
        .lineTo(bone.x - perpX, bone.y - perpY)
        .closePath()
        .fill({ color: bone.color, alpha: alpha * 0.9 });

      // Bone outline
      graphics
        .moveTo(bone.x + perpX, bone.y + perpY)
        .lineTo(tipX + tipPerpX, tipY + tipPerpY)
        .lineTo(tipX - tipPerpX, tipY - tipPerpY)
        .lineTo(bone.x - perpX, bone.y - perpY)
        .closePath()
        .stroke({ color: 0x000000, width: 0.5, alpha: alpha * 0.5 });

      // Joint circle at bone's origin
      graphics
        .circle(bone.x, bone.y, halfWidth * 0.8)
        .fill({ color: bone.color, alpha: alpha * 0.8 });
    }
  }

  /**
   * Get the center of mass position (for camera/effects).
   */
  public getCenterOfMass(): { x: number; y: number } {
    let totalMass = 0;
    let cx = 0;
    let cy = 0;

    for (const bone of this.bones.values()) {
      const midX = bone.x + Math.cos(bone.angle) * bone.length * 0.5;
      const midY = bone.y + Math.sin(bone.angle) * bone.length * 0.5;
      cx += midX * bone.mass;
      cy += midY * bone.mass;
      totalMass += bone.mass;
    }

    return totalMass > 0 ? { x: cx / totalMass, y: cy / totalMass } : { x: 0, y: 0 };
  }

  /**
   * Get bone tip position (for blood/particle effects).
   */
  public getBoneTipPosition(boneName: string): { x: number; y: number } | null {
    const bone = this.bones.get(boneName);
    if (!bone) return null;
    return {
      x: bone.x + Math.cos(bone.angle) * bone.length,
      y: bone.y + Math.sin(bone.angle) * bone.length,
    };
  }

  /**
   * Get a bone's current velocity (for directional blood).
   */
  public getBoneVelocity(boneName: string): { vx: number; vy: number } | null {
    const bone = this.bones.get(boneName);
    if (!bone) return null;
    return { vx: bone.vx, vy: bone.vy };
  }

  /**
   * Check if ragdoll has settled.
   */
  public isSettled(): boolean {
    return this.settled;
  }

  /**
   * Get all bone names for iteration.
   */
  public getBoneNames(): string[] {
    return this.boneOrder;
  }

  /**
   * Get a bone by name.
   */
  public getBone(name: string): RagdollBone | undefined {
    return this.bones.get(name);
  }

  /**
   * Get the final resting rotation of the skeleton (for corpse orientation).
   */
  public getFinalRotation(): number {
    const torso = this.bones.get('torso');
    return torso ? torso.angle : 0;
  }
}
