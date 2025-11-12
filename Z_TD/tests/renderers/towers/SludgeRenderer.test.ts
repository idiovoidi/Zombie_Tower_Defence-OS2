import { Graphics } from 'pixi.js';
import { SludgeRenderer } from '@/renderers/towers/SludgeRenderer';
import { GameConfig } from '@/config/gameConfig';

describe('SludgeRenderer', () => {
  let renderer: SludgeRenderer;
  let visual: Graphics;
  let barrel: Graphics;

  beforeEach(() => {
    renderer = new SludgeRenderer();
    visual = new Graphics();
    barrel = new Graphics();
  });

  afterEach(() => {
    visual.destroy();
    barrel.destroy();
  });

  describe('render', () => {
    it('should render sludge tower at upgrade level 1', () => {
      // Test that render method executes without errors
      expect(() => {
        renderer.render(visual, barrel, GameConfig.TOWER_TYPES.SLUDGE, 1);
      }).not.toThrow();
    });

    it('should render all 5 upgrade levels correctly', () => {
      // Test that all upgrade levels render without errors
      for (let level = 1; level <= 5; level++) {
        visual.clear();
        barrel.clear();

        expect(() => {
          renderer.render(visual, barrel, GameConfig.TOWER_TYPES.SLUDGE, level);
        }).not.toThrow();
      }
    });

    it('should clear visual before rendering', () => {
      // Spy on visual.clear to verify it's called
      const clearSpy = jest.spyOn(visual, 'clear');

      renderer.render(visual, barrel, GameConfig.TOWER_TYPES.SLUDGE, 1);

      // Verify clear was called
      expect(clearSpy).toHaveBeenCalled();

      clearSpy.mockRestore();
    });
  });

  describe('renderShootingEffect', () => {
    it('should create toxic splash effect', () => {
      const initialChildren = barrel.children.length;

      renderer.renderShootingEffect(barrel, GameConfig.TOWER_TYPES.SLUDGE, 1);

      // Should add flash as child
      expect(barrel.children.length).toBeGreaterThan(initialChildren);
    });

    it('should apply recoil animation', () => {
      const originalY = barrel.y;

      renderer.renderShootingEffect(barrel, GameConfig.TOWER_TYPES.SLUDGE, 1);

      // Barrel should move down (recoil)
      expect(barrel.y).toBe(2);
      expect(barrel.y).not.toBe(originalY);
    });

    it('should create consistent effects across upgrade levels', () => {
      // Test that effects are created for different levels
      renderer.renderShootingEffect(barrel, GameConfig.TOWER_TYPES.SLUDGE, 1);
      const level1Children = barrel.children.length;

      // Clear children manually
      while (barrel.children.length > 0) {
        const child = barrel.children[0];
        barrel.removeChild(child);
      }

      renderer.renderShootingEffect(barrel, GameConfig.TOWER_TYPES.SLUDGE, 5);
      const level5Children = barrel.children.length;

      // Both should create effects
      expect(level1Children).toBeGreaterThan(0);
      expect(level5Children).toBeGreaterThan(0);
    });
  });

  describe('destroy', () => {
    it('should clean up resources', () => {
      renderer.render(visual, barrel, GameConfig.TOWER_TYPES.SLUDGE, 1);

      renderer.destroy();

      // Renderer should still be callable after destroy (no-op in base)
      expect(() => renderer.destroy()).not.toThrow();
    });
  });
});
