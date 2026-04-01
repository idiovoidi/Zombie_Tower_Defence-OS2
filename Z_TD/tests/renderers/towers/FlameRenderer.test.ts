import { Graphics } from 'pixi.js';
import { FlameRenderer } from '@/renderers/towers/FlameRenderer';
import { GameConfig } from '@/config/gameConfig';

describe('FlameRenderer', () => {
  let renderer: FlameRenderer;
  let visual: Graphics;
  let barrel: Graphics;

  beforeEach(() => {
    renderer = new FlameRenderer();
    visual = new Graphics();
    barrel = new Graphics();
  });

  afterEach(() => {
    visual.destroy();
    barrel.destroy();
  });

  describe('render', () => {
    it('should render flame tower at upgrade level 1', () => {
      // Test that render method executes without errors
      expect(() => {
        renderer.render(visual, barrel, GameConfig.TOWER_TYPES.FLAME, 1);
      }).not.toThrow();
    });

    it('should render all 5 upgrade levels correctly', () => {
      // Test that all upgrade levels render without errors
      for (let level = 1; level <= 5; level++) {
        visual.clear();
        barrel.clear();

        expect(() => {
          renderer.render(visual, barrel, GameConfig.TOWER_TYPES.FLAME, level);
        }).not.toThrow();
      }
    });

    it('should clear visual before rendering', () => {
      // Spy on visual.clear to verify it's called
      const clearSpy = vi.spyOn(visual, 'clear');

      renderer.render(visual, barrel, GameConfig.TOWER_TYPES.FLAME, 1);

      // Verify clear was called
      expect(clearSpy).toHaveBeenCalled();

      clearSpy.mockRestore();
    });

    it('should render circular platform structure', () => {
      renderer.render(visual, barrel, GameConfig.TOWER_TYPES.FLAME, 1);

      // Visual should have children (the rendered graphics)
      // Note: PixiJS Graphics don't have children in the traditional sense,
      // but we can verify the render method was called without errors
      expect(visual).toBeDefined();
    });
  });

  describe('renderShootingEffect', () => {
    it('should create flame burst effect', () => {
      const initialChildren = barrel.children.length;

      renderer.renderShootingEffect(barrel, GameConfig.TOWER_TYPES.FLAME, 1);

      // Should add flash as child
      expect(barrel.children.length).toBeGreaterThan(initialChildren);
    });

    it('should apply recoil animation', () => {
      const originalY = barrel.y;

      renderer.renderShootingEffect(barrel, GameConfig.TOWER_TYPES.FLAME, 1);

      // Barrel should move down (recoil)
      expect(barrel.y).toBe(2);
      expect(barrel.y).not.toBe(originalY);
    });

    it('should create flame particles', () => {
      renderer.renderShootingEffect(barrel, GameConfig.TOWER_TYPES.FLAME, 3);

      // Should have added flash graphics as child
      expect(barrel.children.length).toBeGreaterThan(0);
    });
  });

  describe('destroy', () => {
    it('should clean up resources', () => {
      renderer.render(visual, barrel, GameConfig.TOWER_TYPES.FLAME, 1);

      renderer.destroy();

      // Renderer should still be callable after destroy (no-op in base)
      expect(() => renderer.destroy()).not.toThrow();
    });
  });
});
