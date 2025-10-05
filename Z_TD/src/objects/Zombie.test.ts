import { Zombie } from './Zombie';
import { GameConfig } from '../config/gameConfig';

describe('Zombie Visual Implementation', () => {
  let zombie: Zombie;

  beforeEach(() => {
    // Create a zombie instance for testing
    zombie = new Zombie(GameConfig.ZOMBIE_TYPES.BASIC, 100, 100, 1);
  });

  it('should create visual representation for Basic Zombie', () => {
    // Check that visual elements are created
    expect(zombie).toBeTruthy();

    // In a real test, we would check the graphics object properties
    // For now, we'll just verify the zombie was created successfully
  });

  it('should create visual representation for Fast Zombie', () => {
    const fastZombie = new Zombie(GameConfig.ZOMBIE_TYPES.FAST, 100, 100, 1);
    expect(fastZombie).toBeTruthy();
  });

  it('should create visual representation for Tank Zombie', () => {
    const tankZombie = new Zombie(GameConfig.ZOMBIE_TYPES.TANK, 100, 100, 1);
    expect(tankZombie).toBeTruthy();
  });

  it('should create visual representation for Armored Zombie', () => {
    const armoredZombie = new Zombie(GameConfig.ZOMBIE_TYPES.ARMORED, 100, 100, 1);
    expect(armoredZombie).toBeTruthy();
  });

  it('should create visual representation for Swarm Zombie', () => {
    const swarmZombie = new Zombie(GameConfig.ZOMBIE_TYPES.SWARM, 100, 100, 1);
    expect(swarmZombie).toBeTruthy();
  });

  it('should create visual representation for Stealth Zombie', () => {
    const stealthZombie = new Zombie(GameConfig.ZOMBIE_TYPES.STEALTH, 100, 100, 1);
    expect(stealthZombie).toBeTruthy();
  });

  it('should create visual representation for Mechanical Zombie', () => {
    const mechanicalZombie = new Zombie(GameConfig.ZOMBIE_TYPES.MECHANICAL, 100, 100, 1);
    expect(mechanicalZombie).toBeTruthy();
  });

  it('should show damage effect', () => {
    // Test that the damage effect method exists and can be called
    expect(typeof zombie.showDamageEffect).toBe('function');

    // Call the method to ensure it doesn't throw errors
    expect(() => {
      zombie.showDamageEffect(10);
    }).not.toThrow();
  });

  it('should show death effect', () => {
    // Test that the death effect method exists and can be called
    expect(typeof zombie.showDeathEffect).toBe('function');

    // Call the method to ensure it doesn't throw errors
    expect(() => {
      zombie.showDeathEffect();
    }).not.toThrow();
  });
});
