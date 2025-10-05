import { CorpseManager } from './CorpseManager';
import { Container } from 'pixi.js';

describe('CorpseManager', () => {
  let container: Container;
  let corpseManager: CorpseManager;

  beforeEach(() => {
    container = new Container();
    corpseManager = new CorpseManager(container);
  });

  afterEach(() => {
    corpseManager.clear();
  });

  it('should create a corpse', () => {
    const initialChildren = container.children.length;
    corpseManager.createCorpse(100, 100, 'basic', 10);

    expect(container.children.length).toBe(initialChildren + 1);
  });

  it('should create corpses for different zombie types', () => {
    const types = ['basic', 'fast', 'tank', 'armored', 'swarm', 'stealth', 'mechanical'];

    types.forEach(type => {
      corpseManager.createCorpse(100, 100, type, 10);
    });

    expect(container.children.length).toBe(types.length);
  });

  it('should respect max corpse limit', () => {
    corpseManager.setMaxCorpses(5);

    // Create more corpses than the limit
    for (let i = 0; i < 10; i++) {
      corpseManager.createCorpse(100 + i * 10, 100, 'basic', 10);
    }

    // Should only have max corpses
    expect(container.children.length).toBe(5);
  });

  it('should fade corpses over time', () => {
    corpseManager.createCorpse(100, 100, 'basic', 10);
    const corpse = container.children[0];
    const initialAlpha = corpse.alpha;

    // Update for half the fade time
    for (let i = 0; i < 30; i++) {
      corpseManager.update(100); // 3 seconds
    }

    // Alpha should have decreased
    expect(corpse.alpha).toBeLessThan(initialAlpha);
  });

  it('should remove corpses after fade time', () => {
    corpseManager.createCorpse(100, 100, 'basic', 10);
    expect(container.children.length).toBe(1);

    // Update for longer than fade time
    for (let i = 0; i < 60; i++) {
      corpseManager.update(100); // 6 seconds
    }

    // Corpse should be removed
    expect(container.children.length).toBe(0);
  });

  it('should clear all corpses', () => {
    corpseManager.createCorpse(100, 100, 'basic', 10);
    corpseManager.createCorpse(200, 200, 'fast', 10);
    expect(container.children.length).toBe(2);

    corpseManager.clear();
    expect(container.children.length).toBe(0);
  });
});
