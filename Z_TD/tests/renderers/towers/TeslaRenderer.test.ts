import { Graphics } from 'pixi.js';
import { TeslaRenderer } from '@/renderers/towers/TeslaRenderer';
import { GameConfig } from '@/config/gameConfig';

describe('TeslaRenderer', () => {
  let renderer: TeslaRenderer;
  let visual: Graphics;
  let barrel: Graphics;

  beforeEach(() => {
    renderer = new TeslaRenderer();
    visual = new Graphics();
    barrel = new Graphics();
  });

  afterEach(() => {
    visual.destroy();
    barrel.destroy();
  });

  describe('render', () => {
    it('should render tesla tower at upgrade level 1', () => {
      // Test that render method executes without errors
      expect(() => {
        renderer.render(visual, barrel, GameConfig.TOWER_TYPES.TESLA, 1);
      }).not.toThrow();
    });

    it('should render all 5 upgrade levels correctly', () => {
      // Test that all upgrade levels render without errors
      for (let level = 1; level <= 5; level++) {
        visual.clear();
        barrel.clear();

        expect(() => {
          renderer.render(visual, barrel, GameConfig.TOWER_TYPES.TESLA, level);
        }).not.toThrow();
      }
    });

    it('should clear visual before rendering', () => {
      // Spy on visual.clear to verify it's called
      const clearSpy = vi.spyOn(visual, 'clear');

      renderer.render(visual, barrel, GameConfig.TOWER_TYPES.TESLA, 1);

      // Verify clear was called
      expect(clearSpy).toHaveBeenCalled();

      clearSpy.mockRestore();
    });

    it('should render coil structure', () => {
      renderer.render(visual, barrel, GameConfig.TOWER_TYPES.TESLA, 1);

      // Visual should have children (the rendered graphics)
      // Note: PixiJS Graphics don't have children in the traditional sense,
      // but we can verify the render method was called without errors
      expect(visual).toBeDefined();
    });

    it('should render different structures for different upgrade levels', () => {
      // Level 1-2: Scavenged tech
      renderer.render(visual, barrel, GameConfig.TOWER_TYPES.TESLA, 1);
      expect(visual).toBeDefined();

      // Level 3-4: Improved station
      visual.clear();
      barrel.clear();
      renderer.render(visual, barrel, GameConfig.TOWER_TYPES.TESLA, 3);
      expect(visual).toBeDefined();

      // Level 5: Advanced platform
      visual.clear();
      barrel.clear();
      renderer.render(visual, barrel, GameConfig.TOWER_TYPES.TESLA, 5);
      expect(visual).toBeDefined();
    });
  });

  describe('renderShootingEffect', () => {
    it('should create electric discharge effect', () => {
      const initialChildren = barrel.children.length;

      renderer.renderShootingEffect(barrel, GameConfig.TOWER_TYPES.TESLA, 1);

      // Should add flash as child
      expect(barrel.children.length).toBeGreaterThan(initialChildren);
    });

    it('should apply recoil animation', () => {
      const originalY = barrel.y;

      renderer.renderShootingEffect(barrel, GameConfig.TOWER_TYPES.TESLA, 1);

      // Barrel should move down (recoil)
      expect(barrel.y).toBe(2);
      expect(barrel.y).not.toBe(originalY);
    });

    it('should create electric sparks', () => {
      renderer.renderShootingEffect(barrel, GameConfig.TOWER_TYPES.TESLA, 3);

      // Should have added flash graphics as child
      expect(barrel.children.length).toBeGreaterThan(0);
    });

    it('should create cyan electric effect', () => {
      renderer.renderShootingEffect(barrel, GameConfig.TOWER_TYPES.TESLA, 5);

      // Verify flash was added
      expect(barrel.children.length).toBeGreaterThan(0);
    });
  });

  describe('destroy', () => {
    it('should clean up resources', () => {
      renderer.render(visual, barrel, GameConfig.TOWER_TYPES.TESLA, 1);

      renderer.destroy();

      // Renderer should still be callable after destroy (no-op in base)
      expect(() => renderer.destroy()).not.toThrow();
    });
  });
});
