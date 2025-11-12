import { BloodParticleSystem } from './BloodParticleSystem';
import { Container } from 'pixi.js';

describe('BloodParticleSystem', () => {
  let container: Container;
  let bloodSystem: BloodParticleSystem;

  beforeEach(() => {
    container = new Container();
    bloodSystem = new BloodParticleSystem(container);
  });

  afterEach(() => {
    bloodSystem.clear();
  });

  it('should create blood splatter particles', () => {
    const initialChildren = container.children.length;
    bloodSystem.createBloodSplatter(100, 100, 1);

    // Should have added particles to container
    expect(container.children.length).toBeGreaterThan(initialChildren);
  });

  it('should create more particles with higher intensity', () => {
    bloodSystem.createBloodSplatter(100, 100, 1);
    const lowIntensityCount = container.children.length;

    bloodSystem.clear();

    bloodSystem.createBloodSplatter(100, 100, 2);
    const highIntensityCount = container.children.length;

    expect(highIntensityCount).toBeGreaterThan(lowIntensityCount);
  });

  it('should update particles over time', () => {
    bloodSystem.createBloodSplatter(100, 100, 1);
    const initialCount = container.children.length;

    // Update for a short time
    bloodSystem.update(100);

    // Particles should still exist
    expect(container.children.length).toBe(initialCount);
  });

  it('should remove particles after they fade', () => {
    bloodSystem.createBloodSplatter(100, 100, 1);
    const initialCount = container.children.length;

    // Update for a long time (particles should fade)
    for (let i = 0; i < 60; i++) {
      bloodSystem.update(100); // 6 seconds total
    }

    // All particles should be removed
    expect(container.children.length).toBeLessThan(initialCount);
  });

  it('should clear all particles', () => {
    bloodSystem.createBloodSplatter(100, 100, 1);
    expect(container.children.length).toBeGreaterThan(0);

    bloodSystem.clear();
    expect(container.children.length).toBe(0);
  });
});
