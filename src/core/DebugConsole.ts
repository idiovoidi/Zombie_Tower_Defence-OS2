import { DevConfig } from '../config/devConfig';
import type { GameManager } from '../managers/GameManager';
import type { TimeControlManager } from '../managers/TimeControlManager';
import { LogExporter } from '../utils/LogExporter';

export async function registerDebugConsoleAPIs(
  gameManager: GameManager,
  timeControlManager: TimeControlManager
): Promise<void> {
  window.LogExporter = LogExporter;

  if (import.meta.env.PROD) {
    console.warn('⚠️ Running in production mode - server features disabled');
    console.log('📊 LogExporter available in console (localStorage only)');
  } else {
    console.log('📊 LogExporter available in console');
  }

  console.log('💡 Commands:');
  console.log('  LogExporter.viewStoredLogs() - View all stored logs');
  console.log('  LogExporter.exportAllLogs() - Export all logs as files');
  console.log('  LogExporter.exportAllLogsAsBundle() - Export as single bundle');
  console.log('  LogExporter.getStoredLogCount() - Get number of stored logs');
  console.log('  LogExporter.clearAllLogs() - Clear all stored logs');

  window.balanceTracking = {
    enable: () => gameManager.enableBalanceTracking(),
    disable: () => gameManager.disableBalanceTracking(),
    isEnabled: () => gameManager.isBalanceTrackingEnabled(),
    getReport: () => gameManager.getBalanceTrackingManager().generateReportData(),
    reset: () => gameManager.getBalanceTrackingManager().reset(),
  };
  console.log('📊 Balance Tracking available in console');
  console.log('💡 Balance Tracking Commands:');
  console.log('  balanceTracking.enable() - Enable balance tracking');
  console.log('  balanceTracking.disable() - Disable balance tracking');
  console.log('  balanceTracking.isEnabled() - Check if tracking is enabled');
  console.log('  balanceTracking.getReport() - Get current balance report');
  console.log('  balanceTracking.reset() - Reset tracking data');

  if (DevConfig.DEBUG.ENABLED) {
    window.waveBalance = async () => {
      const { WaveBalancing, printWaveBalance } = await import('../config/waveBalancing');
      window.WaveBalancing = WaveBalancing;
      window.printWaveBalance = printWaveBalance;
      console.log('Wave balancing tools loaded!');
      console.log('Usage:');
      console.log('  printWaveBalance(1, 10) - Print balance report for waves 1-10');
      console.log(
        '  WaveBalancing.updateConfig({ difficultyMultiplier: 1.5 }) - Adjust difficulty'
      );
      console.log('  WaveBalancing.calculateZombieHealth(5) - Get zombie health for wave 5');
    };
    console.log('💡 Type waveBalance() in console to load wave balancing tools');
  }

  window.performanceTest = async () => {
    const { runBalancePerformanceTests, runFrameRateTest } = await import(
      '../utils/BalanceAnalysisPerformanceTest'
    );
    window.runBalancePerformanceTests = runBalancePerformanceTests;
    window.runFrameRateTest = runFrameRateTest;
    console.log('🔬 Performance testing tools loaded!');
    console.log('Usage:');
    console.log('  runBalancePerformanceTests() - Run all performance tests');
    console.log('  runFrameRateTest() - Test frame rate impact');
  };
  console.log('💡 Type performanceTest() in console to load performance testing tools');

  const { PerformanceMonitor } = await import('../utils/PerformanceMonitor');
  const { ResourceCleanupManager } = await import('../utils/ResourceCleanupManager');

  window.debugPerformance = () => {
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🔍 Performance Debug Information');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    PerformanceMonitor.logMetrics();
    console.log('\n📦 Resource Cleanup State:');
    ResourceCleanupManager.logState();
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  };

  window.debugCleanup = () => {
    console.log('🧹 Forcing cleanup of all wave resources...');
    console.warn('⚠️ Limited cleanup - some resources may require game restart');
    ResourceCleanupManager.cleanupPersistentEffects();
    console.log('✅ Cleanup complete');
  };

  window.debugToggleMonitoring = () => {
    PerformanceMonitor.toggle();
    const status = PerformanceMonitor.isEnabled() ? 'enabled' : 'disabled';
    console.log(`🔧 Performance monitoring ${status}`);
  };

  console.log('📊 Performance Monitoring available in console');
  console.log('💡 Performance Monitoring Commands:');
  console.log('  debugPerformance() - Log current performance metrics');
  console.log('  debugCleanup() - Force cleanup of wave resources');
  console.log('  debugToggleMonitoring() - Enable/disable performance monitoring');

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
  console.log('⏱️ Time Control available in console');
  console.log('💡 Time Control Commands:');
  console.log('  timeControl.pause() - Pause the game');
  console.log('  timeControl.resume() - Resume the game');
  console.log('  timeControl.toggle() - Toggle pause state');
  console.log('  timeControl.setNormal() - Set 1× speed');
  console.log('  timeControl.setSlow() - Set 0.5× speed');
  console.log('  timeControl.setFast() - Set 2× speed');
  console.log('  timeControl.setVeryFast() - Set 4× speed');
  console.log('  timeControl.getState() - Get current time control state');
  console.log('⌨️ Hotkeys: Space = pause, 1 = 1×, 2 = 0.5×, 3 = 2×, 4 = 4×');
}
