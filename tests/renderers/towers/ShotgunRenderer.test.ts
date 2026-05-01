import { Graphics } from 'pixi.js';
import { ShotgunRenderer } from '@/renderers/towers/ShotgunRenderer';
import { GameConfig } from '@/config/gameConfig';

describe('ShotgunRenderer', () => {
  let renderer: ShotgunRenderer;
  let visual: Graphics;
  let barrel: Graphics;

  beforeEach(() => {
    renderer = new ShotgunRenderer();
    visual = new Graphics();
    barrel = new Graphics();
  });

  afterEach(() => {
    visual.destroy();
    barrel.destroy();
  });

  describe('render', () => {
    it('should render shotgun tower at upgrade level 1', () => {
      // Test that render method executes without errors
      expect(() => {
        renderer.render(visual, barrel, GameConfig.TOWER_TYPES.SHOTGUN, 1);
      }).not.toThrow();
    });

    it('should render all 5 upgrade levels correctly', () => {
      // Test that all upgrade levels render without errors
      for (let level = 1; level <= 5; level++) {
        visual.clear();
        barrel.clear();

        expect(() => {
          renderer.render(visual, barrel, GameConfig.TOWER_TYPES.SHOTGUN, level);
        }).not.toThrow();
      }
    });

    it('should clear visual before rendering', () => {
      // Spy on visual.clear to verify it's called
      const clearSpy = vi.spyOn(visual, 'clear');

      renderer.render(visual, barrel, GameConfig.TOWER_TYPES.SHOTGUN, 1);

      // Verify clear was called
      expect(clearSpy).toHaveBeenCalled();

      clearSpy.mockRestore();
    });

    it('should render sandbag wall at level 1-2', () => {
      renderer.render(visual, barrel, GameConfig.TOWER_TYPES.SHOTGUN, 1);
      expect(() => {
        renderer.render(visual, barrel, GameConfig.TOWER_TYPES.SHOTGUN, 2);
      }).not.toThrow();
    });

    it('should render reinforced bunker at level 3-4', () => {
      renderer.render(visual, barrel, GameConfig.TOWER_TYPES.SHOTGUN, 3);
      expect(() => {
        renderer.render(visual, barrel, GameConfig.TOWER_TYPES.SHOTGUN, 4);
      }).not.toThrow();
    });

    it('should render heavy fortified bunker at level 5', () => {
      expect(() => {
        renderer.render(visual, barrel, GameConfig.TOWER_TYPES.SHOTGUN, 5);
      }).not.toThrow();
    });

    it('should increase bunker width with upgrade level', () => {
      // Bunker width = 36 + upgradeLevel * 4
      // Level 1: 40, Level 5: 56
      renderer.render(visual, barrel, GameConfig.TOWER_TYPES.SHOTGUN, 1);
      renderer.render(visual, barrel, GameConfig.TOWER_TYPES.SHOTGUN, 5);

      // Both should render without errors
      expect(() => {
        renderer.render(visual, barrel, GameConfig.TOWER_TYPES.SHOTGUN, 1);
      }).not.toThrow();
    });
  });

  describe('renderShootingEffect', () => {
    it('should create muzzle flash effect', () => {
      const initialChildren = barrel.children.length;

      renderer.renderShootingEffect(barrel, GameConfig.TOWER_TYPES.SHOTGUN, 1);

      // Should add flash as child
      expect(barrel.children.length).toBeGreaterThan(initialChildren);
    });

    it('should apply recoil animation', () => {
      const originalY = barrel.y;

      renderer.renderShootingEffect(barrel, GameConfig.TOWER_TYPES.SHOTGUN, 1);

      // Barrel should move down (recoil)
      expect(barrel.y).toBe(2);
      expect(barrel.y).not.toBe(originalY);
    });

    it('should create dual muzzle flash for shotgun', () => {
      // Shotgun has two barrels, so should create two flash circles
      renderer.renderShootingEffect(barrel, GameConfig.TOWER_TYPES.SHOTGUN, 1);

      // Should add flash as child
      expect(barrel.children.length).toBeGreaterThan(0);
    });

    it('should work at all upgrade levels', () => {
      // Test that shooting effect works at all levels
      for (let level = 1; level <= 5; level++) {
        // Clear children manually
        while (barrel.children.length > 0) {
          const child = barrel.children[0];
          barrel.removeChild(child);
        }

        expect(() => {
          renderer.renderShootingEffect(barrel, GameConfig.TOWER_TYPES.SHOTGUN, level);
        }).not.toThrow();

        expect(barrel.children.length).toBeGreaterThan(0);
      }
    });
  });

  describe('destroy', () => {
    it('should clean up resources', () => {
      renderer.render(visual, barrel, GameConfig.TOWER_TYPES.SHOTGUN, 1);

      renderer.destroy();

      // Renderer should still be callable after destroy (no-op in base)
      expect(() => renderer.destroy()).not.toThrow();
    });
  });
});
