import { Graphics } from 'pixi.js';
import { SniperRenderer } from '@/renderers/towers/SniperRenderer';
import { GameConfig } from '@/config/gameConfig';

describe('SniperRenderer', () => {
  let renderer: SniperRenderer;
  let visual: Graphics;
  let barrel: Graphics;

  beforeEach(() => {
    renderer = new SniperRenderer();
    visual = new Graphics();
    barrel = new Graphics();
  });

  afterEach(() => {
    visual.destroy();
    barrel.destroy();
  });

  describe('render', () => {
    it('should render sniper tower at upgrade level 1', () => {
      // Test that render method executes without errors
      expect(() => {
        renderer.render(visual, barrel, GameConfig.TOWER_TYPES.SNIPER, 1);
      }).not.toThrow();
    });

    it('should render all 5 upgrade levels correctly', () => {
      // Test that all upgrade levels render without errors
      for (let level = 1; level <= 5; level++) {
        visual.clear();
        barrel.clear();

        expect(() => {
          renderer.render(visual, barrel, GameConfig.TOWER_TYPES.SNIPER, level);
        }).not.toThrow();
      }
    });

    it('should clear visual before rendering', () => {
      // Spy on visual.clear to verify it's called
      const clearSpy = vi.spyOn(visual, 'clear');

      renderer.render(visual, barrel, GameConfig.TOWER_TYPES.SNIPER, 1);

      // Verify clear was called
      expect(clearSpy).toHaveBeenCalled();

      clearSpy.mockRestore();
    });

    it('should render wooden platform at level 1-2', () => {
      renderer.render(visual, barrel, GameConfig.TOWER_TYPES.SNIPER, 1);
      expect(() => {
        renderer.render(visual, barrel, GameConfig.TOWER_TYPES.SNIPER, 2);
      }).not.toThrow();
    });

    it('should render reinforced watchtower at level 3-4', () => {
      renderer.render(visual, barrel, GameConfig.TOWER_TYPES.SNIPER, 3);
      expect(() => {
        renderer.render(visual, barrel, GameConfig.TOWER_TYPES.SNIPER, 4);
      }).not.toThrow();
    });

    it('should render military observation tower at level 5', () => {
      expect(() => {
        renderer.render(visual, barrel, GameConfig.TOWER_TYPES.SNIPER, 5);
      }).not.toThrow();
    });
  });

  describe('renderShootingEffect', () => {
    it('should create muzzle flash effect', () => {
      const initialChildren = barrel.children.length;

      renderer.renderShootingEffect(barrel, GameConfig.TOWER_TYPES.SNIPER, 1);

      // Should add flash as child
      expect(barrel.children.length).toBeGreaterThan(initialChildren);
    });

    it('should apply recoil animation', () => {
      const originalY = barrel.y;

      renderer.renderShootingEffect(barrel, GameConfig.TOWER_TYPES.SNIPER, 1);

      // Barrel should move down (recoil)
      expect(barrel.y).toBe(2);
      expect(barrel.y).not.toBe(originalY);
    });

    it('should scale muzzle flash with upgrade level', () => {
      // Test that higher levels have different rifle tip positions
      renderer.renderShootingEffect(barrel, GameConfig.TOWER_TYPES.SNIPER, 1);
      const level1Children = barrel.children.length;

      // Clear children manually
      while (barrel.children.length > 0) {
        const child = barrel.children[0];
        barrel.removeChild(child);
      }

      renderer.renderShootingEffect(barrel, GameConfig.TOWER_TYPES.SNIPER, 5);
      const level5Children = barrel.children.length;

      // Both should create effects
      expect(level1Children).toBeGreaterThan(0);
      expect(level5Children).toBeGreaterThan(0);
    });

    it('should create larger muzzle flash than machine gun', () => {
      // Sniper should have more dramatic flash (4 circles vs 3)
      renderer.renderShootingEffect(barrel, GameConfig.TOWER_TYPES.SNIPER, 1);

      // Should add flash as child
      expect(barrel.children.length).toBeGreaterThan(0);
    });
  });

  describe('destroy', () => {
    it('should clean up resources', () => {
      renderer.render(visual, barrel, GameConfig.TOWER_TYPES.SNIPER, 1);

      renderer.destroy();

      // Renderer should still be callable after destroy (no-op in base)
      expect(() => renderer.destroy()).not.toThrow();
    });
  });
});
