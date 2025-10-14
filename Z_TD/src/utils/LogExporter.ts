/**
 * Utility for exporting game logs and AI performance data
 *
 * Logs are stored in localStorage and can be exported to files.
 * In development, logs can be saved directly to player_logs/ folder.
 */

export interface GameLogEntry {
  timestamp: string;
  sessionId: string;
  isAIRun: boolean;
  duration: number;
  startTime: string;
  endTime: string;
  gameData: {
    highestWave: number;
    finalMoney: number;
    finalLives: number;
    startLives: number;
    survivalRate: number;
    livesLost: number;
  };
  aiData?: {
    towersBuilt: number;
    towersUpgraded: number;
    moneySpent: number;
    moneyEarned: number;
    peakMoney: number;
    lowestLives: number;
    averageBuildRate: number;
    towerComposition: Record<string, number>;
    upgradeDistribution: Record<string, number[]>;
    waveStats: {
      completionTimes: number[];
      averageCompletionTime: number;
      livesLostPerWave: number[];
      averageLivesLostPerWave: number;
      towersBuiltPerWave: number[];
      decisionsPerWave: number[];
    };
    performanceRating: string;
    defenseRating: string;
  };
}

export class LogExporter {
  private static sessionId: string = LogExporter.generateSessionId();
  private static readonly STORAGE_KEY = 'ztd_game_logs';
  private static readonly MAX_STORED_LOGS = 100; // Limit to prevent localStorage overflow

  private static generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  }

  /**
   * Save log to localStorage and optionally download
   */
  public static async exportLog(logEntry: GameLogEntry): Promise<void> {
    try {
      // Format filename with date and AI indicator
      const date = new Date(logEntry.timestamp);
      const dateStr = date.toISOString().split('T')[0]; // YYYY-MM-DD
      const timeStr = date.toTimeString().split(' ')[0].replace(/:/g, '-'); // HH-MM-SS
      const aiIndicator = logEntry.isAIRun ? 'AI' : 'MANUAL';
      const filename = `${dateStr}_${timeStr}_${aiIndicator}_wave${logEntry.gameData.highestWave}.json`;

      // Store in localStorage
      this.storeLog(filename, logEntry);

      // Try to save to server first (if running)
      const savedToServer = await this.saveToServer(filename, logEntry);

      if (!savedToServer) {
        // Fallback to browser download
        const jsonData = JSON.stringify(logEntry, null, 2);
        const blob = new Blob([jsonData], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        link.click();
        URL.revokeObjectURL(url);
        console.log(`📊 Log downloaded: ${filename}`);
        console.log(`💡 Move to player_reports/ folder or start server with: node server.js`);
      }

      console.log(`📁 Total logs stored: ${this.getStoredLogCount()}`);
      console.log(`💡 Use LogExporter.exportAllLogs() to download all stored logs`);
    } catch (error) {
      console.error('Failed to export log:', error);
    }
  }

  /**
   * Try to save report to local server
   */
  private static async saveToServer(filename: string, data: GameLogEntry): Promise<boolean> {
    try {
      const response = await fetch('http://localhost:3001/api/save-report', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ filename, data }),
      });

      if (response.ok) {
        const result = await response.json();
        console.log(`✅ Report saved to: ${result.filepath}`);
        return true;
      }
      return false;
    } catch (error) {
      // Server not running, silently fail
      return false;
    }
  }

  /**
   * Store log in localStorage
   */
  private static storeLog(filename: string, logEntry: GameLogEntry): void {
    try {
      const logs = this.getStoredLogs();
      logs[filename] = logEntry;

      // Limit number of stored logs
      const logKeys = Object.keys(logs);
      if (logKeys.length > this.MAX_STORED_LOGS) {
        // Remove oldest logs
        const sortedKeys = logKeys.sort();
        const toRemove = sortedKeys.slice(0, logKeys.length - this.MAX_STORED_LOGS);
        toRemove.forEach(key => delete logs[key]);
        console.warn(`⚠️ Removed ${toRemove.length} old logs (max: ${this.MAX_STORED_LOGS})`);
      }

      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(logs));
    } catch (error) {
      console.error('Failed to store log in localStorage:', error);
    }
  }

  /**
   * Get all stored logs from localStorage
   */
  private static getStoredLogs(): Record<string, GameLogEntry> {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      return stored ? JSON.parse(stored) : {};
    } catch (error) {
      console.error('Failed to retrieve logs from localStorage:', error);
      return {};
    }
  }

  /**
   * Get count of stored logs
   */
  public static getStoredLogCount(): number {
    return Object.keys(this.getStoredLogs()).length;
  }

  /**
   * Export all stored logs as individual files
   */
  public static exportAllLogs(): void {
    const logs = this.getStoredLogs();
    const logCount = Object.keys(logs).length;

    if (logCount === 0) {
      console.log('📊 No logs to export');
      return;
    }

    console.log(`📊 Exporting ${logCount} logs...`);

    Object.entries(logs).forEach(([filename, logEntry]) => {
      const jsonData = JSON.stringify(logEntry, null, 2);
      const blob = new Blob([jsonData], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      link.click();
      URL.revokeObjectURL(url);
    });

    console.log(`✅ Exported ${logCount} logs`);
    console.log(`💡 Save these files to the player_logs/ folder in your repo`);
  }

  /**
   * Export all logs as a single JSON file
   */
  public static exportAllLogsAsBundle(): void {
    const logs = this.getStoredLogs();
    const logCount = Object.keys(logs).length;

    if (logCount === 0) {
      console.log('📊 No logs to export');
      return;
    }

    const bundle = {
      exportDate: new Date().toISOString(),
      logCount: logCount,
      logs: logs,
    };

    const jsonData = JSON.stringify(bundle, null, 2);
    const blob = new Blob([jsonData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `ztd_logs_bundle_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);

    console.log(`✅ Exported ${logCount} logs as bundle`);
  }

  /**
   * Clear all stored logs
   */
  public static clearAllLogs(): void {
    const count = this.getStoredLogCount();
    localStorage.removeItem(this.STORAGE_KEY);
    console.log(`🗑️ Cleared ${count} stored logs`);
  }

  /**
   * View all stored logs in console
   */
  public static viewStoredLogs(): void {
    const logs = this.getStoredLogs();
    console.log('📊 Stored Logs:', logs);
    console.log(`Total: ${Object.keys(logs).length} logs`);
  }

  /**
   * Get current session ID
   */
  public static getSessionId(): string {
    return this.sessionId;
  }

  /**
   * Generate new session ID (call when starting new game)
   */
  public static newSession(): string {
    this.sessionId = this.generateSessionId();
    return this.sessionId;
  }

  /**
   * Calculate performance rating based on wave reached
   */
  public static getPerformanceRating(wave: number): string {
    if (wave >= 20) {
      return '⭐⭐⭐⭐⭐ EXCELLENT';
    }
    if (wave >= 15) {
      return '⭐⭐⭐⭐ GREAT';
    }
    if (wave >= 10) {
      return '⭐⭐⭐ GOOD';
    }
    if (wave >= 5) {
      return '⭐⭐ FAIR';
    }
    return '⭐ NEEDS IMPROVEMENT';
  }

  /**
   * Calculate defense rating based on survival rate
   */
  public static getDefenseRating(survivalRate: number): string {
    if (survivalRate === 100) {
      return '🛡️ PERFECT DEFENSE';
    }
    if (survivalRate >= 80) {
      return '🛡️ STRONG DEFENSE';
    }
    if (survivalRate >= 50) {
      return '⚠️ MODERATE DEFENSE';
    }
    return '❌ WEAK DEFENSE';
  }
}
