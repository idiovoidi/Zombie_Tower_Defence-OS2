import { ResourceManager } from './ResourceManager';
import { ResourceCost } from '../components/ResourceCost';

describe('ResourceManager', () => {
  let resourceManager: ResourceManager;

  beforeEach(() => {
    resourceManager = new ResourceManager();
  });

  describe('canAfford', () => {
    it('should return true when player can afford a cost with only money', () => {
      const cost: ResourceCost = { money: 100 };
      expect(resourceManager.canAfford(cost)).toBe(true);
    });

    it('should return false when player cannot afford a cost with only money', () => {
      const cost: ResourceCost = { money: 1000 };
      expect(resourceManager.canAfford(cost)).toBe(false);
    });

    it('should return true when player can afford a cost with all resources', () => {
      // Add some resources first
      resourceManager.add(200, 50, 30, 50);
      
      const cost: ResourceCost = { money: 100, wood: 20, metal: 10, energy: 20 };
      expect(resourceManager.canAfford(cost)).toBe(true);
    });

    it('should return false when player cannot afford a specific resource', () => {
      const cost: ResourceCost = { money: 100, wood: 100 }; // Need 100 wood but have 0
      expect(resourceManager.canAfford(cost)).toBe(false);
    });
  });

  describe('spend', () => {
    it('should deduct resources when player can afford the cost', () => {
      // Add some resources first
      resourceManager.add(200, 50, 30, 50);
      
      const cost: ResourceCost = { money: 100, wood: 20, metal: 10, energy: 20 };
      expect(resourceManager.spend(cost)).toBe(true);
      
      expect(resourceManager.getMoney()).toBe(600); // 500 starting + 200 added - 100 spent
      expect(resourceManager.getResources()).toEqual({
        wood: 30,   // 0 starting + 50 added - 20 spent
        metal: 20,  // 0 starting + 30 added - 10 spent
        energy: 80  // 100 starting + 50 added = 150, but clamped at 100. Then 100 - 20 spent = 80
      });
    });

    it('should not deduct resources when player cannot afford the cost', () => {
      const initialMoney = resourceManager.getMoney();
      const initialResources = resourceManager.getResources();
      
      const cost: ResourceCost = { money: 1000 }; // More than player has
      expect(resourceManager.spend(cost)).toBe(false);
      
      // Resources should remain unchanged
      expect(resourceManager.getMoney()).toBe(initialMoney);
      expect(resourceManager.getResources()).toEqual(initialResources);
    });
  });

  describe('add', () => {
    it('should add resources correctly', () => {
      resourceManager.add(100, 20, 15, 30);
      
      expect(resourceManager.getMoney()).toBe(600); // 500 starting + 100 added
      expect(resourceManager.getResources()).toEqual({
        wood: 20,
        metal: 15,
        energy: 100 // 100 starting + 30 added = 130, but clamped at 100
      });
    });

    it('should clamp energy between 0 and 100', () => {
      // Energy should be clamped at 100
      resourceManager.add(0, 0, 0, 50); // Add 50 to already 100
      expect(resourceManager.getResources().energy).toBe(100);
      
      // Spend energy to reduce it
      resourceManager.add(0, 0, 0, -30); // Subtract 30
      expect(resourceManager.getResources().energy).toBe(70);
      
      // Add a large amount to test upper clamping
      resourceManager.add(0, 0, 0, 50); // Add 50 to 70
      expect(resourceManager.getResources().energy).toBe(100);
    });
  });

  describe('generateResources', () => {
    it('should generate resources over time', () => {
      const initialResources = resourceManager.getResources();
      
      // Generate resources for 10 seconds
      resourceManager.generateResources(10);
      
      expect(resourceManager.getResources().wood).toBeCloseTo(initialResources.wood + 1); // 0.1 * 10
      expect(resourceManager.getResources().metal).toBeCloseTo(initialResources.metal + 0.5); // 0.05 * 10
      expect(resourceManager.getResources().energy).toBeCloseTo(Math.min(100, initialResources.energy + 2)); // 0.2 * 10
    });

    it('should not exceed energy cap of 100', () => {
      // Set energy to near maximum
      resourceManager.add(0, 0, 0, 0); // Energy should still be 100
      
      // Generate resources for a long time
      resourceManager.generateResources(1000);
      
      // Energy should still be capped at 100
      expect(resourceManager.getResources().energy).toBe(100);
    });
  });

  describe('getters', () => {
    it('should return correct money amount', () => {
      expect(resourceManager.getMoney()).toBe(500); // Starting amount
    });

    it('should return correct resource amounts', () => {
      expect(resourceManager.getResources()).toEqual({
        wood: 0,
        metal: 0,
        energy: 100
      });
    });
  });
});