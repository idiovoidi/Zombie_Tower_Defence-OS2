/**
 * BalanceTrackingManager Integration Tests
 */

import { BalanceTrackingManager } from './BalanceTrackingManager';
import { GameManager } from './GameManager';

// Mock GameManager
const createMockGameManager = (): GameManager => {
  return {
    getWave: () => 1,
    getMoney: () => 500,
    getLives: () => 20,
  } as unknown as GameManager;
};

describe('BalanceTrackingManager Integration', () => {
  let manager: BalanceTrackingManager;
  let mockGameManager: GameManager;

  beforeEach(() => {
    mockGameManager = createMockGameManager();
    manager = new BalanceTrackingManager(mockGameManager);
  });

  describe('Lifecycle', () => {
    it('should start disabled', () => {
      expect(manager.isEnabled()).toBe(false);
    });

    it('should enable tracking', () => {
      manager.enable();
      expect(manager.isEnabled()).toBe(true);
    });

    it('should disable tracking', () => {
      manager.enable();
      manager.disable();
      expect(manager.isEnabled()).toBe(false);
    });

    it('should reset tracking data', () => {
      manager.enable();
      manager.trackDamage('MachineGun', 100, true, 0);
      manager.reset();
      expect(manager.isEnabled()).toBe(false);
    });
  });

  describe('Event Tracking', () => {
    beforeEach(() => {
      manager.enable();
    });

    it('should track damage events', () => {
      manager.trackDamage('MachineGun', 100, true, 10);
      const report = manager.generateReportData();
      expect((report as any).eventCounts.damageEvents).toBe(1);
    });

    it('should track economy events', () => {
      manager.trackEconomy('BUILD', 100);
      const report = manager.generateReportData();
      expect((report as any).eventCounts.economyEvents).toBe(1);
    });

    it('should track tower events', () => {
      manager.trackTowerPlaced('MachineGun', 100);
      const report = manager.generateReportData();
      expect((report as any).eventCounts.towerEvents).toBe(1);
    });

    it('should not track when disabled', () => {
      manager.disable();
      manager.trackDamage('MachineGun', 100, true, 0);
      const report = manager.generateReportData();
      expect((report as any).eventCounts.damageEvents).toBe(0);
    });
  });

  describe('Report Generation', () => {
    beforeEach(() => {
      manager.enable();
    });

    it('should generate report data', () => {
      manager.trackDamage('MachineGun', 100, true, 10);
      manager.trackEconomy('BUILD', 100);

      const report = manager.generateReportData();

      expect(report).toHaveProperty('sessionId');
      expect(report).toHaveProperty('summary');
      expect(report).toHaveProperty('eventCounts');
      expect(report).toHaveProperty('balanceIssues');
    });

    it('should include performance stats', () => {
      const report = manager.generateReportData();
      expect(report).toHaveProperty('performanceStats');
    });
  });

  describe('Performance Monitoring', () => {
    beforeEach(() => {
      manager.enable();
    });

    it('should track performance stats', () => {
      const stats = manager.getPerformanceStats();
      expect(stats).toHaveProperty('analysisCount');
      expect(stats).toHaveProperty('avgAnalysisTime');
      expect(stats).toHaveProperty('maxAnalysisTime');
    });
  });
});
