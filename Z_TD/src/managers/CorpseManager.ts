import { Container, Graphics } from 'pixi.js';
import { BasicZombieRenderer } from '../renderers/zombies/types/BasicZombieRenderer';
import { FastZombieRenderer } from '../renderers/zombies/types/FastZombieRenderer';
import { TankZombieRenderer } from '../renderers/zombies/types/TankZombieRenderer';
import { ArmoredZombieRenderer } from '../renderers/zombies/types/ArmoredZombieRenderer';
import { SwarmZombieRenderer } from '../renderers/zombies/types/SwarmZombieRenderer';
import { StealthZombieRenderer } from '../renderers/zombies/types/StealthZombieRenderer';
import { MechanicalZombieRenderer } from '../renderers/zombies/types/MechanicalZombieRenderer';
import { IZombieRenderer, ZombieRenderState } from '../renderers/zombies/ZombieRenderer';

interface Corpse {
  container: Container;
  fadeTimer: number;
  maxFadeTime: number;
}

export class CorpseManager {
  private corpses: Corpse[] = [];
  private container: Container;
  private maxCorpses: number = 50; // Limit to prevent performance issues

  constructor(container: Container) {
    this.container = container;
  }

  // Create a corpse at the given position with zombie type styling
  public createCorpse(x: number, y: number, zombieType: string, _size: number = 10): void {
    // Remove oldest corpse BEFORE adding new one if at limit
    // This ensures we never exceed maxCorpses
    if (this.corpses.length >= this.maxCorpses) {
      const oldCorpse = this.corpses.shift();
      if (oldCorpse) {
        this.container.removeChild(oldCorpse.container);
        // Destroy with children: true to ensure all Graphics objects are destroyed
        oldCorpse.container.destroy({ children: true });
      }
    }

    // Create a container for the corpse
    const corpseContainer = new Container();
    corpseContainer.position.set(x, y);

    // Choose random death pose
    const deathPose = Math.floor(Math.random() * 3); // 0, 1, or 2

    // Render the zombie in death pose
    this.renderDeadZombie(corpseContainer, zombieType, deathPose);

    const corpse: Corpse = {
      container: corpseContainer,
      fadeTimer: 0,
      maxFadeTime: 8, // Corpses fade after 8 seconds
    };

    this.corpses.push(corpse);
    this.container.addChild(corpseContainer);
  }

  private renderDeadZombie(container: Container, zombieType: string, deathPose: number): void {
    // Create the appropriate zombie renderer
    let renderer: IZombieRenderer;

    switch (zombieType) {
      case 'Basic':
        renderer = new BasicZombieRenderer();
        break;
      case 'Fast':
        renderer = new FastZombieRenderer();
        break;
      case 'Tank':
        renderer = new TankZombieRenderer();
        break;
      case 'Armored':
        renderer = new ArmoredZombieRenderer();
        break;
      case 'Swarm':
        renderer = new SwarmZombieRenderer();
        break;
      case 'Stealth':
        renderer = new StealthZombieRenderer();
        break;
      case 'Mechanical':
        renderer = new MechanicalZombieRenderer();
        break;
      default:
        renderer = new BasicZombieRenderer();
    }

    // Create a fake render state for the dead zombie
    const deadState: ZombieRenderState = {
      position: { x: 0, y: 0 },
      health: 0,
      maxHealth: 100,
      speed: 0,
      direction: { x: 0, y: 0 },
      isMoving: false,
      isDamaged: true,
      statusEffects: [],
    };

    // Render the zombie
    renderer.render(container, deadState);

    // Draw blood pool underneath (before applying rotation)
    const bloodGraphics = new Graphics();
    this.drawBloodPool(bloodGraphics, zombieType);
    container.addChildAt(bloodGraphics, 0); // Add at bottom layer

    // Apply death pose transformation
    this.applyDeathPose(container, deathPose);

    // Remove glow effects (dead eyes don't glow)
    this.removeGlowEffects(container);
  }

  private applyDeathPose(container: Container, pose: number): void {
    // Add slight random variation to each pose
    const randomVariation = (Math.random() - 0.5) * 0.2;

    switch (pose) {
      case 0: // Lying on back
        container.rotation = Math.PI / 2 + randomVariation; // ~90 degrees
        container.scale.y = 0.7; // Flattened
        // Adjust position to compensate for rotation
        // When rotated 90°, the zombie's vertical extent becomes horizontal
        container.position.x += 8; // Shift right by half the zombie's height
        break;
      case 1: // Lying on side
        container.rotation = Math.PI / 2 + 0.3 + randomVariation; // Slightly tilted
        container.scale.y = 0.8;
        container.position.x += 8;
        container.position.y -= 2; // Slight vertical adjustment for tilt
        break;
      case 2: // Face down
        container.rotation = -Math.PI / 2 + randomVariation; // ~-90 degrees
        container.scale.y = 0.6; // More flattened
        // When rotated -90°, shift left
        container.position.x -= 8;
        break;
    }
  }

  private removeGlowEffects(container: Container): void {
    // Recursively dim all graphics to remove glow effects
    for (const child of container.children) {
      if (child instanceof Graphics) {
        // Dim the graphics to remove glow (dead eyes don't glow)
        child.alpha = Math.min(child.alpha, 0.7);
      } else if (child instanceof Container) {
        // Recursively process nested containers
        this.removeGlowEffects(child);
      }
    }
  }

  private drawBloodPool(graphics: Graphics, zombieType: string): void {
    // Mechanical zombies leak oil instead of blood
    if (zombieType === 'Mechanical') {
      graphics.ellipse(0, 12, 20, 15).fill({ color: 0x1a1a1a, alpha: 0.7 });
      // Oil drips
      for (let i = 0; i < 3; i++) {
        const angle = Math.random() * Math.PI * 2;
        const dist = 15 + Math.random() * 10;
        const x = Math.cos(angle) * dist;
        const y = 12 + Math.sin(angle) * dist;
        graphics.circle(x, y, 3).fill({ color: 0x1a1a1a, alpha: 0.6 });
      }
      return;
    }

    // Create irregular blood pool
    const poolSize = 15;

    // Outer blood splatter (irregular)
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2 + Math.random() * 0.5;
      const dist = poolSize * (0.8 + Math.random() * 0.4);
      const x = Math.cos(angle) * dist;
      const y = 12 + Math.sin(angle) * dist;
      const splatterSize = 3 + Math.random() * 4;
      graphics.circle(x, y, splatterSize).fill({ color: 0x6a0000, alpha: 0.7 });
    }

    // Main blood pool (darker center)
    graphics.ellipse(0, 12, poolSize * 0.9, poolSize * 0.7).fill({ color: 0x5a0000, alpha: 0.8 });
    graphics.ellipse(0, 12, poolSize * 0.6, poolSize * 0.5).fill({ color: 0x4a0000, alpha: 0.85 });

    // Blood drips/streaks
    for (let i = 0; i < 5; i++) {
      const angle = Math.random() * Math.PI * 2;
      const startDist = poolSize * 0.5;
      const endDist = poolSize * (1.2 + Math.random() * 0.5);
      const startX = Math.cos(angle) * startDist;
      const startY = 12 + Math.sin(angle) * startDist;
      const endX = Math.cos(angle) * endDist;
      const endY = 12 + Math.sin(angle) * endDist;
      graphics
        .moveTo(startX, startY)
        .lineTo(endX, endY)
        .stroke({ width: 2, color: 0x6a0000, alpha: 0.6 });
    }
  }

  // Update corpses (fade out over time)
  public update(deltaTime: number): void {
    const dt = deltaTime / 1000;

    for (let i = this.corpses.length - 1; i >= 0; i--) {
      const corpse = this.corpses[i];
      corpse.fadeTimer += dt;

      // Start fading after half the max fade time
      if (corpse.fadeTimer > corpse.maxFadeTime / 2) {
        const fadeProgress = (corpse.fadeTimer - corpse.maxFadeTime / 2) / (corpse.maxFadeTime / 2);
        corpse.container.alpha = Math.max(0, 0.9 * (1 - fadeProgress));
      }

      // Remove fully faded corpses
      if (corpse.fadeTimer >= corpse.maxFadeTime) {
        this.container.removeChild(corpse.container);
        corpse.container.destroy({ children: true });
        this.corpses.splice(i, 1);
      }
    }
  }

  // Clear all corpses
  public clear(): void {
    for (const corpse of this.corpses) {
      this.container.removeChild(corpse.container);
      // Destroy with children: true to ensure all Graphics objects are destroyed
      corpse.container.destroy({ children: true });
    }
    this.corpses = [];
  }

  // Set maximum number of corpses
  public setMaxCorpses(max: number): void {
    this.maxCorpses = max;
  }
}
