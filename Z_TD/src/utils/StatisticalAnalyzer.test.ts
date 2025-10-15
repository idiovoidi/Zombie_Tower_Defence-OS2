/**
 * StatisticalAnalyzer Tests
 *
 * Tests for statistical analysis functionality including outlier detection,
 * trend analysis, predictive modeling, and statistical summaries.
 */

import { StatisticalAnalyzer } from './StatisticalAnalyzer';

describe('StatisticalAnalyzer', () => {
  describe('detectOutliers', () => {
    it('should detect outliers in a dataset', () => {
      const values = [10, 12, 11, 13, 10, 12, 50, 11, 13]; // 50 is an outlier
      const result = StatisticalAnalyzer.detectOutliers(values, 2);

      expect(result.hasOutliers).toBe(true);
      expect(result.outliers.length).toBeGreaterThan(0);
      expect(result.mean).toBeGreaterThan(0);
      expect(result.standardDeviation).toBeGreaterThan(0);
    });

    it('should handle empty array', () => {
      const result = StatisticalAnalyzer.detectOutliers([]);

      expect(result.hasOutliers).toBe(false);
      expect(result.outliers.length).toBe(0);
      expect(result.mean).toBe(0);
    });

    it('should handle single value', () => {
      const result = StatisticalAnalyzer.detectOutliers([42]);

      expect(result.hasOutliers).toBe(false);
      expect(result.mean).toBe(42);
      expect(result.standardDeviation).toBe(0);
    });

    it('should not detect outliers in uniform data', () => {
      const values = [10, 11, 12, 11, 10, 12, 11];
      const result = StatisticalAnalyzer.detectOutliers(values, 2);

      expect(result.hasOutliers).toBe(false);
      expect(result.outliers.length).toBe(0);
    });
  });

  describe('analyzeTrend', () => {
    it('should detect GETTING_HARDER trend', () => {
      const waveData: Array<[number, number]> = [
        [1, 100],
        [2, 150],
        [3, 200],
        [4, 250],
        [5, 300],
      ];
      const result = StatisticalAnalyzer.analyzeTrend(waveData);

      expect(result.trend).toBe('GETTING_HARDER');
      expect(result.slope).toBeGreaterThan(0);
    });

    it('should detect GETTING_EASIER trend', () => {
      const waveData: Array<[number, number]> = [
        [1, 300],
        [2, 250],
        [3, 200],
        [4, 150],
        [5, 100],
      ];
      const result = StatisticalAnalyzer.analyzeTrend(waveData);

      expect(result.trend).toBe('GETTING_EASIER');
      expect(result.slope).toBeLessThan(0);
    });

    it('should detect STABLE trend', () => {
      const waveData: Array<[number, number]> = [
        [1, 100],
        [2, 100],
        [3, 100],
        [4, 100],
        [5, 100],
      ];
      const result = StatisticalAnalyzer.analyzeTrend(waveData);

      expect(result.trend).toBe('STABLE');
      expect(Math.abs(result.slope)).toBeLessThan(0.1);
    });

    it('should handle empty array', () => {
      const result = StatisticalAnalyzer.analyzeTrend([]);

      expect(result.trend).toBe('STABLE');
      expect(result.slope).toBe(0);
      expect(result.confidence).toBe('LOW');
    });

    it('should handle single data point', () => {
      const result = StatisticalAnalyzer.analyzeTrend([[1, 100]]);

      expect(result.trend).toBe('STABLE');
      expect(result.intercept).toBe(100);
    });
  });

  describe('predictWaveDifficulty', () => {
    it('should predict future wave difficulty', () => {
      const historicalData: Array<[number, number]> = [
        [1, 100],
        [2, 150],
        [3, 200],
        [4, 250],
        [5, 300],
      ];
      const futureWaves = [6, 7, 8];
      const predictions = StatisticalAnalyzer.predictWaveDifficulty(historicalData, futureWaves);

      expect(predictions.length).toBe(3);
      expect(predictions[0].wave).toBe(6);
      expect(predictions[0].predictedDifficulty).toBeGreaterThan(0);
      expect(predictions[0].recommendedDPS).toBeGreaterThan(0);
      expect(predictions[0].confidenceInterval.lower).toBeLessThan(
        predictions[0].confidenceInterval.upper
      );
    });

    it('should handle insufficient historical data', () => {
      const predictions = StatisticalAnalyzer.predictWaveDifficulty([[1, 100]], [2, 3]);

      expect(predictions.length).toBe(2);
      expect(predictions[0].predictedDifficulty).toBe(0);
    });

    it('should handle empty future waves', () => {
      const historicalData: Array<[number, number]> = [
        [1, 100],
        [2, 150],
      ];
      const predictions = StatisticalAnalyzer.predictWaveDifficulty(historicalData, []);

      expect(predictions.length).toBe(0);
    });
  });

  describe('calculateSummary', () => {
    it('should calculate statistical summary', () => {
      const values = [10, 20, 30, 40, 50];
      const summary = StatisticalAnalyzer.calculateSummary(values);

      expect(summary.mean).toBe(30);
      expect(summary.median).toBe(30);
      expect(summary.min).toBe(10);
      expect(summary.max).toBe(50);
      expect(summary.range).toBe(40);
      expect(summary.standardDeviation).toBeGreaterThan(0);
      expect(summary.variance).toBeGreaterThan(0);
    });

    it('should handle empty array', () => {
      const summary = StatisticalAnalyzer.calculateSummary([]);

      expect(summary.mean).toBe(0);
      expect(summary.median).toBe(0);
      expect(summary.min).toBe(0);
      expect(summary.max).toBe(0);
    });

    it('should handle single value', () => {
      const summary = StatisticalAnalyzer.calculateSummary([42]);

      expect(summary.mean).toBe(42);
      expect(summary.median).toBe(42);
      expect(summary.min).toBe(42);
      expect(summary.max).toBe(42);
      expect(summary.range).toBe(0);
      expect(summary.standardDeviation).toBe(0);
    });
  });

  describe('getLibraryStatus', () => {
    it('should return library availability status', () => {
      const status = StatisticalAnalyzer.getLibraryStatus();

      expect(status).toHaveProperty('statistics');
      expect(status).toHaveProperty('regression');
      expect(status).toHaveProperty('math');
      expect(typeof status.statistics).toBe('boolean');
      expect(typeof status.regression).toBe('boolean');
      expect(typeof status.math).toBe('boolean');
    });
  });
});
