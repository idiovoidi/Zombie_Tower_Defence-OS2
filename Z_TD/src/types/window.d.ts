/**
 * Type definitions for window object extensions
 * This file provides proper typing for debug tools and utilities exposed to the browser console
 */

import type { LogExporter } from '../utils/LogExporter';
import type { WaveBalancing } from '../config/waveBalancing';

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
  }
}

export {};
