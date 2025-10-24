import { Container } from 'pixi.js';
import { ProjectileManager } from './ProjectileManager';

describe('ProjectileManager Dirty Flags', () => {
  let container: Container;
  let projectileManager: ProjectileManager;

  beforeEach(() => {
    container = new Container();
    projectileManager = new ProjectileManager(container);
  });

  afterEach(() => {
    projectileManager.clear();
  });

  it('should start with dirty flag as false', () => {
    expect(projectileManager.areProjectilesDirty()).toBe(false);
  });

  it('should clear dirty flag when clearProjectilesDirty is called', () => {
    // Manually set dirty by clearing (which marks as dirty)
    projectileManager.clear();
    expect(projectileManager.areProjectilesDirty()).toBe(true);

    projectileManager.clearProjectilesDirty();

    expect(projectileManager.areProjectilesDirty()).toBe(false);
  });

  it('should mark projectiles as dirty when clearing all projectiles', () => {
    expect(projectileManager.areProjectilesDirty()).toBe(false);

    projectileManager.clear();

    expect(projectileManager.areProjectilesDirty()).toBe(true);
  });
});
