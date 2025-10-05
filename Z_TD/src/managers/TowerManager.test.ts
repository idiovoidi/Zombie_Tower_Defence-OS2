import { TowerManager } from './TowerManager';
import { GameConfig } from '../config/gameConfig';

describe('TowerManager Upgrade Cost Calculation', () => {
  let towerManager: TowerManager;

  beforeEach(() => {
    towerManager = new TowerManager();
  });

  it('should include upgrade cost multiplier in tower stats', () => {
    const machineGunStats = towerManager.getTowerStats(GameConfig.TOWER_TYPES.MACHINE_GUN);
    const sniperStats = towerManager.getTowerStats(GameConfig.TOWER_TYPES.SNIPER);

    expect(machineGunStats?.upgradeCostMultiplier).toBe(0.75);
    expect(sniperStats?.upgradeCostMultiplier).toBe(0.75);
  });

  it('should calculate upgrade costs correctly', () => {
    // For MachineGun tower:
    // Base cost = 100
    // Multiplier = 0.75
    // Level 1 upgrade cost = 100 * (1 + 1) * 0.75 = 150
    expect(towerManager.calculateUpgradeCost(GameConfig.TOWER_TYPES.MACHINE_GUN, 1)).toBe(150);

    // Level 2 upgrade cost = 100 * (2 + 1) * 0.75 = 225
    expect(towerManager.calculateUpgradeCost(GameConfig.TOWER_TYPES.MACHINE_GUN, 2)).toBe(225);

    // For Sniper tower:
    // Base cost = 250
    // Multiplier = 0.75
    // Level 1 upgrade cost = 250 * (1 + 1) * 0.75 = 375
    expect(towerManager.calculateUpgradeCost(GameConfig.TOWER_TYPES.SNIPER, 1)).toBe(375);
  });

  it('should handle missing tower types gracefully', () => {
    expect(towerManager.calculateUpgradeCost('nonexistent', 1)).toBe(0);
  });

  it('should calculate damage with upgrade scaling', () => {
    // For MachineGun tower with base damage 20:
    // Level 1: 20 * (1 + 1 * 0.5) = 30
    expect(towerManager.calculateTowerDamage(GameConfig.TOWER_TYPES.MACHINE_GUN, 1)).toBe(30);

    // Level 2: 20 * (1 + 2 * 0.5) = 40
    expect(towerManager.calculateTowerDamage(GameConfig.TOWER_TYPES.MACHINE_GUN, 2)).toBe(40);
  });

  it('should calculate range with upgrade scaling', () => {
    // For MachineGun tower with base range 150:
    // Level 1: 150 * (1 + 1 * 0.2) = 180
    expect(towerManager.calculateTowerRange(GameConfig.TOWER_TYPES.MACHINE_GUN, 1)).toBe(180);

    // Level 2: 150 * (1 + 2 * 0.2) = 210
    expect(towerManager.calculateTowerRange(GameConfig.TOWER_TYPES.MACHINE_GUN, 2)).toBe(210);
  });
});

describe('TowerManager', () => {
  let towerManager: TowerManager;

  beforeEach(() => {
    towerManager = new TowerManager();
  });

  it('should initialize with all tower types', () => {
    const towerTypes = towerManager.getTowerTypes();
    expect(towerTypes).toContain(GameConfig.TOWER_TYPES.MACHINE_GUN);
    expect(towerTypes).toContain(GameConfig.TOWER_TYPES.SNIPER);
    expect(towerTypes).toContain(GameConfig.TOWER_TYPES.SHOTGUN);
    expect(towerTypes).toContain(GameConfig.TOWER_TYPES.FLAME);
    expect(towerTypes).toContain(GameConfig.TOWER_TYPES.TESLA);
    expect(towerTypes.length).toBe(5);
  });

  it('should return correct tower stats', () => {
    const machineGunStats = towerManager.getTowerStats(GameConfig.TOWER_TYPES.MACHINE_GUN);
    expect(machineGunStats).toBeDefined();
    expect(machineGunStats?.cost).toBe(100);
    expect(machineGunStats?.damage).toBe(20);
    expect(machineGunStats?.range).toBe(150);
    expect(machineGunStats?.fireRate).toBe(10);
    expect(machineGunStats?.specialAbility).toBe('High fire rate, good against swarms');

    const sniperStats = towerManager.getTowerStats(GameConfig.TOWER_TYPES.SNIPER);
    expect(sniperStats).toBeDefined();
    expect(sniperStats?.cost).toBe(250);
    expect(sniperStats?.damage).toBe(150);
    expect(sniperStats?.range).toBe(400);
    expect(sniperStats?.fireRate).toBe(1);
    expect(sniperStats?.specialAbility).toBe('High single-target damage, armor-piercing');
  });

  it('should return undefined for non-existent tower types', () => {
    const stats = towerManager.getTowerStats('NonExistentTower');
    expect(stats).toBeUndefined();
  });

  it('should calculate tower damage with upgrades correctly', () => {
    // Machine gun base damage: 20
    // Upgrade formula: base damage * (1 + upgradeLevel * 0.5)

    // Level 1 (no upgrade)
    const damageLevel1 = towerManager.calculateTowerDamage(GameConfig.TOWER_TYPES.MACHINE_GUN, 1);
    expect(damageLevel1).toBe(30); // 20 * (1 + 1 * 0.5) = 30

    // Level 2
    const damageLevel2 = towerManager.calculateTowerDamage(GameConfig.TOWER_TYPES.MACHINE_GUN, 2);
    expect(damageLevel2).toBe(40); // 20 * (1 + 2 * 0.5) = 40

    // Level 3
    const damageLevel3 = towerManager.calculateTowerDamage(GameConfig.TOWER_TYPES.MACHINE_GUN, 3);
    expect(damageLevel3).toBe(50); // 20 * (1 + 3 * 0.5) = 50
  });

  it('should calculate tower range with upgrades correctly', () => {
    // Machine gun base range: 150
    // Upgrade formula: base range * (1 + upgradeLevel * 0.2)

    // Level 1 (no upgrade)
    const rangeLevel1 = towerManager.calculateTowerRange(GameConfig.TOWER_TYPES.MACHINE_GUN, 1);
    expect(rangeLevel1).toBe(180); // 150 * (1 + 1 * 0.2) = 180

    // Level 2
    const rangeLevel2 = towerManager.calculateTowerRange(GameConfig.TOWER_TYPES.MACHINE_GUN, 2);
    expect(rangeLevel2).toBe(210); // 150 * (1 + 2 * 0.2) = 210

    // Level 3
    const rangeLevel3 = towerManager.calculateTowerRange(GameConfig.TOWER_TYPES.MACHINE_GUN, 3);
    expect(rangeLevel3).toBe(240); // 150 * (1 + 3 * 0.2) = 240
  });

  it('should return 0 for damage/range calculations of non-existent tower types', () => {
    const damage = towerManager.calculateTowerDamage('NonExistentTower', 1);
    expect(damage).toBe(0);

    const range = towerManager.calculateTowerRange('NonExistentTower', 1);
    expect(range).toBe(0);
  });

  it('should return correct tower costs', () => {
    expect(towerManager.getTowerCost(GameConfig.TOWER_TYPES.MACHINE_GUN)).toBe(100);
    expect(towerManager.getTowerCost(GameConfig.TOWER_TYPES.SNIPER)).toBe(250);
    expect(towerManager.getTowerCost(GameConfig.TOWER_TYPES.SHOTGUN)).toBe(180);
    expect(towerManager.getTowerCost(GameConfig.TOWER_TYPES.FLAME)).toBe(200);
    expect(towerManager.getTowerCost(GameConfig.TOWER_TYPES.TESLA)).toBe(300);
  });

  it('should return 0 for cost of non-existent tower types', () => {
    expect(towerManager.getTowerCost('NonExistentTower')).toBe(0);
  });
});
