/**
 * Basic verification tests for BalanceAnalyzer
 * These tests verify that all methods are implemented and produce reasonable results
 */

import { BalanceAnalyzer } from './BalanceAnalyzer';

describe('BalanceAnalyzer', () => {
  describe('canDefendWave', () => {
    it('should correctly predict defense capability', () => {
      const result = BalanceAnalyzer.canDefendWave(
        100, // totalDPS
        5000, // zombieHP
        50, // zombieSpeed
        1000, // pathLength
        5 // wave
      );

      expect(result.canDefend).toBe(false); // 100 DPS * 20s = 2000 damage < 5000 HP
      expect(result.timeToReachEnd).toBe(20);
      expect(result.damageDealt).toBe(2000);
      expect(result.safetyMargin).toBeLessThan(0);
    });

    it('should handle sufficient defense', () => {
      const result = BalanceAnalyzer.canDefendWave(300, 5000, 50, 1000, 5);

      expect(result.canDefend).toBe(true); // 300 DPS * 20s = 6000 damage > 5000 HP
      expect(result.safetyMargin).toBeGreaterThan(0);
    });
  });

  describe('calculateEfficiencyScore', () => {
    it('should calculate efficiency score correctly', () => {
      const score = BalanceAnalyzer.calculateEfficiencyScore(
        50, // dps
        150, // range
        0.85, // accuracy
        100, // buildCost
        0 // upgradeCost
      );

      expect(score).toBeCloseTo(63.75, 2);
    });

    it('should handle zero cost', () => {
      const score = BalanceAnalyzer.calculateEfficiencyScore(50, 150, 0.85, 0, 0);
      expect(score).toBe(0);
    });
  });

  describe('applyDiminishingReturns', () => {
    it('should not apply diminishing returns for single tower', () => {
      const result = BalanceAnalyzer.applyDiminishingReturns(100, 1, 100);
      expect(result).toBe(100);
    });

    it('should apply diminishing returns for multiple towers', () => {
      const result = BalanceAnalyzer.applyDiminishingReturns(100, 3, 100);
      expect(result).toBeLessThan(100 * 3);
      expect(result).toBeGreaterThan(0);
    });
  });

  describe('calculateThreatScore', () => {
    it('should calculate threat score correctly', () => {
      const result = BalanceAnalyzer.calculateThreatScore(
        100, // health
        50, // speed
        10, // count
        10, // reward
        'Basic'
      );

      expect(result.threatScore).toBe(500); // (100 * 50 * 10) / (10 * 10)
      expect(result.isBalanced).toBe(false); // 500 is not between 0.8 and 1.2
    });

    it('should identify balanced threat', () => {
      // Threat score = (100 * 50 * 1) / (5000 * 10) = 5000 / 50000 = 0.1
      const result = BalanceAnalyzer.calculateThreatScore(100, 50, 1, 500, 'Test');

      expect(result.isBalanced).toBe(true); // Should be between 0.8 and 1.2
    });
  });

  describe('calculateEffectiveDPS', () => {
    it('should calculate effective DPS with overkill', () => {
      const effectiveDPS = BalanceAnalyzer.calculateEffectiveDPS(
        100, // nominalDPS
        80, // averageZombieHP
        30 // damagePerHit
      );

      // 3 shots to kill (90 damage), 10 wasted, ~11% waste
      expect(effectiveDPS).toBeLessThan(100);
      expect(effectiveDPS).toBeGreaterThan(85);
    });

    it('should handle zero damage per hit', () => {
      const effectiveDPS = BalanceAnalyzer.calculateEffectiveDPS(100, 80, 0);
      expect(effectiveDPS).toBe(100);
    });
  });

  describe('calculateBreakEvenPoint', () => {
    it('should calculate break-even time correctly', () => {
      const breakEven = BalanceAnalyzer.calculateBreakEvenPoint(
        100, // towerCost
        50, // towerDPS
        10, // averageZombieReward
        100 // averageZombieHP
      );

      // Kill time = 100/50 = 2s, Revenue = 10/2 = 5/s, Break-even = 100/5 = 20s
      expect(breakEven).toBe(20);
    });

    it('should handle zero DPS', () => {
      const breakEven = BalanceAnalyzer.calculateBreakEvenPoint(100, 0, 10, 100);
      expect(breakEven).toBe(Infinity);
    });
  });

  describe('detectBalanceIssues', () => {
    it('should detect inefficient towers', () => {
      const issues = BalanceAnalyzer.detectBalanceIssues({
        damagePerDollar: 10,
        survivalRate: 80,
        overkillPercent: 5,
        economyEfficiency: 120,
      });

      expect(issues).toHaveLength(1);
      expect(issues[0].type).toBe('INEFFICIENT_TOWERS');
      expect(issues[0].severity).toBe('HIGH'); // 10 is < 12, so HIGH severity
    });

    it('should detect weak defense', () => {
      const issues = BalanceAnalyzer.detectBalanceIssues({
        damagePerDollar: 20,
        survivalRate: 30,
        overkillPercent: 5,
        economyEfficiency: 120,
      });

      expect(issues).toHaveLength(1);
      expect(issues[0].type).toBe('WEAK_DEFENSE');
    });

    it('should detect excessive overkill', () => {
      const issues = BalanceAnalyzer.detectBalanceIssues({
        damagePerDollar: 20,
        survivalRate: 80,
        overkillPercent: 25,
        economyEfficiency: 120,
      });

      expect(issues).toHaveLength(1);
      expect(issues[0].type).toBe('EXCESSIVE_OVERKILL');
    });

    it('should detect negative economy', () => {
      const issues = BalanceAnalyzer.detectBalanceIssues({
        damagePerDollar: 20,
        survivalRate: 80,
        overkillPercent: 5,
        economyEfficiency: 60,
      });

      expect(issues).toHaveLength(1);
      expect(issues[0].type).toBe('NEGATIVE_ECONOMY');
    });

    it('should detect no issues when all metrics are good', () => {
      const issues = BalanceAnalyzer.detectBalanceIssues({
        damagePerDollar: 20,
        survivalRate: 80,
        overkillPercent: 5,
        economyEfficiency: 120,
      });

      expect(issues).toHaveLength(0);
    });
  });

  describe('getOptimalTowerMix', () => {
    it('should calculate optimal tower mix', () => {
      const towerStats = [
        { type: 'MachineGun', cost: 100, dps: 50, range: 150 },
        { type: 'Sniper', cost: 200, dps: 100, range: 300 },
        { type: 'Shotgun', cost: 150, dps: 75, range: 100 },
      ];

      const mix = BalanceAnalyzer.getOptimalTowerMix(500, towerStats);

      expect(mix).toBeDefined();
      expect(Object.keys(mix)).toHaveLength(3);

      // Should have bought some towers
      const totalTowers = Object.values(mix).reduce((sum, count) => sum + count, 0);
      expect(totalTowers).toBeGreaterThan(0);
    });

    it('should handle insufficient budget', () => {
      const towerStats = [{ type: 'Expensive', cost: 1000, dps: 100, range: 200 }];

      const mix = BalanceAnalyzer.getOptimalTowerMix(100, towerStats);

      expect(mix.Expensive).toBe(0);
    });
  });

  describe('analyzeTowerEfficiency', () => {
    it('should analyze tower efficiency comprehensively', () => {
      const analysis = BalanceAnalyzer.analyzeTowerEfficiency(
        'MachineGun',
        100, // cost
        50, // dps
        150, // range
        0.85, // accuracy
        10, // damagePerHit
        80, // averageZombieHP
        10 // averageZombieReward
      );

      expect(analysis.type).toBe('MachineGun');
      expect(analysis.cost).toBe(100);
      expect(analysis.dps).toBe(50);
      expect(analysis.efficiencyScore).toBeGreaterThan(0);
      expect(analysis.effectiveDPS).toBeGreaterThan(0);
      expect(analysis.breakEvenTime).toBeGreaterThan(0);
    });
  });
});
