/**
 * Type definitions for window object extensions
 * This file provides proper typing for debug tools and utilities exposed to the browser console
 */

import type { WaveBalancing } from '../config/waveBalancing';
import type { LogExporter } from '../utils/LogExporter';

declare global {
  interface Window {
    // Log exporter utility
    LogExporter: typeof LogExporter;

    // Balance tracking controls
    balanceTracking: {
      enable: () => void;
      disable: () => void;
      isEnabled: () => boolean;
      getReport: () => unknown;
      reset: () => void;
    };

    // Wave balancing tools (loaded dynamically)
    waveBalance?: () => Promise<void>;
    WaveBalancing?: typeof WaveBalancing;
    printWaveBalance?: (startWave: number, endWave: number) => void;

    // Performance testing tools (loaded dynamically)
    performanceTest?: () => Promise<void>;
    runBalancePerformanceTests?: () => void;
    runFrameRateTest?: () => void;

    // Performance monitoring debug commands
    debugPerformance: () => void;
    debugCleanup: () => void;
    debugToggleMonitoring: () => void;

    // Time control commands
    timeControl: {
      pause: () => void;
      resume: () => void;
      toggle: () => void;
      setNormal: () => void;
      setSlow: () => void;
      getState: () => { speed: number; isPaused: boolean; isPlacementPause: boolean };
    };
  }
}
