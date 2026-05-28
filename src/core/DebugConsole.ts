import { DevConfig } from '../config/devConfig';
import type { GameManager } from '../managers/GameManager';
import type { TimeControlManager } from '../managers/TimeControlManager';
import { LogExporter } from '../utils/LogExporter';
import { debug, info, warn } from '../utils/Logger';

export async function registerDebugConsoleAPIs(
  gameManager: GameManager,
  timeControlManager: TimeControlManager
): Promise<void> {
  window.LogExporter = LogExporter;

  if (import.meta.env.PROD) {
    warn('⚠️ Running in production mode - server features disabled');
    info('📊 LogExporter available in console (localStorage only)');
  } else {
    info('📊 LogExporter available in console');
  }

  info('💡 Commands:');
  info('  LogExporter.viewStoredLogs() - View all stored logs');
  info('  LogExporter.exportAllLogs() - Export all logs as files');
  info('  LogExporter.exportAllLogsAsBundle() - Export as single bundle');
  info('  LogExporter.getStoredLogCount() - Get number of stored logs');
  info('  LogExporter.clearAllLogs() - Clear all stored logs');

  window.balanceTracking = {
    enable: () => gameManager.enableBalanceTracking(),
    disable: () => gameManager.disableBalanceTracking(),
    isEnabled: () => gameManager.isBalanceTrackingEnabled(),
    getReport: () => gameManager.getBalanceTrackingManager().generateReportData(),
    reset: () => gameManager.getBalanceTrackingManager().reset(),
  };
  info('📊 Balance Tracking available in console');
  info('💡 Balance Tracking Commands:');
  info('  balanceTracking.enable() - Enable balance tracking');
  info('  balanceTracking.disable() - Disable balance tracking');
  info('  balanceTracking.isEnabled() - Check if tracking is enabled');
  info('  balanceTracking.getReport() - Get current balance report');
  info('  balanceTracking.reset() - Reset tracking data');

  if (DevConfig.DEBUG.ENABLED) {
    window.waveBalance = async () => {
      const { WaveBalancing, printWaveBalance } = await import('../config/waveBalancing');
      window.WaveBalancing = WaveBalancing;
      window.printWaveBalance = printWaveBalance;
      debug('Wave balancing tools loaded!');
      debug('Usage:');
      debug('  printWaveBalance(1, 10) - Print balance report for waves 1-10');
      debug('  WaveBalancing.updateConfig({ difficultyMultiplier: 1.5 }) - Adjust difficulty');
      debug('  WaveBalancing.calculateZombieHealth(5) - Get zombie health for wave 5');
    };
    debug('💡 Type waveBalance() in console to load wave balancing tools');
  }

  window.performanceTest = async () => {
    const { runBalancePerformanceTests, runFrameRateTest } = await import(
      '../utils/BalanceAnalysisPerformanceTest'
    );
    window.runBalancePerformanceTests = runBalancePerformanceTests;
    window.runFrameRateTest = runFrameRateTest;
    debug('🔬 Performance testing tools loaded!');
    debug('Usage:');
    debug('  runBalancePerformanceTests() - Run all performance tests');
    debug('  runFrameRateTest() - Test frame rate impact');
  };
  debug('💡 Type performanceTest() in console to load performance testing tools');

  const { PerformanceMonitor } = await import('../utils/PerformanceMonitor');
  const { ResourceCleanupManager } = await import('../utils/ResourceCleanupManager');

  window.debugPerformance = () => {
    debug('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    debug('🔍 Performance Debug Information');
    debug('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    PerformanceMonitor.logMetrics();
    debug('\n📦 Resource Cleanup State:');
    ResourceCleanupManager.logState();
    debug('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  };

  window.debugCleanup = () => {
    debug('🧹 Forcing cleanup of all wave resources...');
    warn('⚠️ Limited cleanup - some resources may require game restart');
    ResourceCleanupManager.cleanupPersistentEffects();
    debug('✅ Cleanup complete');
  };

  window.debugToggleMonitoring = () => {
    PerformanceMonitor.toggle();
    const status = PerformanceMonitor.isEnabled() ? 'enabled' : 'disabled';
    debug(`🔧 Performance monitoring ${status}`);
  };

  info('📊 Performance Monitoring available in console');
  info('💡 Performance Monitoring Commands:');
  info('  debugPerformance() - Log current performance metrics');
  info('  debugCleanup() - Force cleanup of wave resources');
  info('  debugToggleMonitoring() - Enable/disable performance monitoring');

  const { TimeSpeed } = await import('../managers/TimeControlManager');

  window.timeControl = {
    pause: () => timeControlManager.pause(),
    resume: () => timeControlManager.resume(),
    toggle: () => timeControlManager.togglePause(),
    setNormal: () => timeControlManager.setSpeed(TimeSpeed.NORMAL),
    setSlow: () => timeControlManager.setSpeed(TimeSpeed.SLOW),
    setFast: () => timeControlManager.setSpeed(TimeSpeed.FAST),
    setVeryFast: () => timeControlManager.setSpeed(TimeSpeed.VERY_FAST),
    getState: () => timeControlManager.getState(),
  };
  info('⏱️ Time Control available in console');
  info('💡 Time Control Commands:');
  info('  timeControl.pause() - Pause the game');
  info('  timeControl.resume() - Resume the game');
  info('  timeControl.toggle() - Toggle pause state');
  info('  timeControl.setNormal() - Set 1× speed');
  info('  timeControl.setSlow() - Set 0.5× speed');
  info('  timeControl.setFast() - Set 2× speed');
  info('  timeControl.setVeryFast() - Set 4× speed');
  info('  timeControl.getState() - Get current time control state');
  info('⌨️ Hotkeys: Space = pause, 1 = 1×, 2 = 0.5×, 3 = 2×, 4 = 4×');
}
