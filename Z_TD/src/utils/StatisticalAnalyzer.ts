/**
 * StatisticalAnalyzer - Statistical analysis utility for balance tracking
 *
 * Provides statistical analysis using external libraries for trend detection,
 * outlier detection, and predictive modeling.
 *
 * Libraries used:
 * - simple-statistics: Mean, standard deviation, regression, statistical summaries
 * - regression: Polynomial regression for predictive modeling
 * - mathjs: Mathematical operations (currently minimal usage)
 */

// Library imports with graceful degradation
let statisticsAvailable = false;
let regressionAvailable = false;
let mathAvailable = false;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let ss: any = null;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let regression: any = null;

// Initialize libraries
(async () => {
  try {
    ss = await import('simple-statistics');
    statisticsAvailable = true;
  } catch {
    console.warn('⚠️ simple-statistics not available. Statistical analysis disabled.');
  }

  try {
    const regressionModule = await import('regression');
    regression = regressionModule.default;
    regressionAvailable = true;
  } catch {
    console.warn('⚠️ regression library not available. Predictive modeling disabled.');
  }

  try {
    await import('mathjs');
    mathAvailable = true;
  } catch {
    console.warn('⚠️ mathjs not available. Advanced math operations disabled.');
  }
})();

/**
 * Outlier analysis result
 */
export interface OutlierAnalysis {
  mean: number;
  standardDeviation: number;
  outliers: Array<{ value: number; index: number; deviation: number }>;
  hasOutliers: boolean;
  error?: string;
}

/**
 * Trend analysis result
 */
export interface TrendAnalysis {
  trend: 'GETTING_HARDER' | 'GETTING_EASIER' | 'STABLE';
  slope: number;
  intercept: number;
  rSquared: number;
  confidence: 'HIGH' | 'MEDIUM' | 'LOW';
  error?: string;
}

/**
 * Wave difficulty prediction
 */
export interface WavePrediction {
  wave: number;
  predictedDifficulty: number;
  recommendedDPS: number;
  confidenceInterval: { lower: number; upper: number };
}

/**
 * Statistical summary
 */
export interface StatisticalSummary {
  mean: number;
  median: number;
  mode: number;
  standardDeviation: number;
  variance: number;
  min: number;
  max: number;
  range: number;
  error?: string;
}

/**
 * StatisticalAnalyzer - Provides statistical analysis for balance tracking
 */
export class StatisticalAnalyzer {
  /**
   * Detect outliers using standard deviation method
   *
   * @param values - Array of numeric values to analyze
   * @param threshold - Number of standard deviations to consider as outlier (default: 2)
   * @returns OutlierAnalysis with detected outliers
   */
  static detectOutliers(values: number[], threshold: number = 2): OutlierAnalysis {
    // Handle edge cases
    if (!values || values.length === 0) {
      return {
        mean: 0,
        standardDeviation: 0,
        outliers: [],
        hasOutliers: false,
      };
    }

    if (values.length === 1) {
      return {
        mean: values[0],
        standardDeviation: 0,
        outliers: [],
        hasOutliers: false,
      };
    }

    // Check if library is available
    if (!statisticsAvailable || !ss) {
      return {
        mean: 0,
        standardDeviation: 0,
        outliers: [],
        hasOutliers: false,
        error: 'simple-statistics library not available',
      };
    }

    try {
      // Calculate mean and standard deviation
      const mean = ss.mean(values);
      const stdDev = ss.standardDeviation(values);

      // Find outliers
      const outliers: Array<{ value: number; index: number; deviation: number }> = [];

      values.forEach((value, index) => {
        const deviation = Math.abs(value - mean) / stdDev;
        if (deviation > threshold) {
          outliers.push({ value, index, deviation });
        }
      });

      return {
        mean,
        standardDeviation: stdDev,
        outliers,
        hasOutliers: outliers.length > 0,
      };
    } catch (error) {
      console.error('Error detecting outliers:', error);
      return {
        mean: 0,
        standardDeviation: 0,
        outliers: [],
        hasOutliers: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Analyze trend using linear regression
   *
   * @param waveData - Array of [wave, difficulty] tuples
   * @returns TrendAnalysis with trend classification and statistics
   */
  static analyzeTrend(waveData: Array<[number, number]>): TrendAnalysis {
    // Handle edge cases
    if (!waveData || waveData.length === 0) {
      return {
        trend: 'STABLE',
        slope: 0,
        intercept: 0,
        rSquared: 0,
        confidence: 'LOW',
      };
    }

    if (waveData.length === 1) {
      return {
        trend: 'STABLE',
        slope: 0,
        intercept: waveData[0][1],
        rSquared: 0,
        confidence: 'LOW',
      };
    }

    // Check if library is available
    if (!statisticsAvailable || !ss) {
      return {
        trend: 'STABLE',
        slope: 0,
        intercept: 0,
        rSquared: 0,
        confidence: 'LOW',
        error: 'simple-statistics library not available',
      };
    }

    try {
      // Perform linear regression
      const result = ss.linearRegression(waveData);
      const slope = result.m;
      const intercept = result.b;

      // Calculate R-squared
      const line = ss.linearRegressionLine(result);
      const rSquared = ss.rSquared(waveData, line);

      // Classify trend based on slope
      let trend: 'GETTING_HARDER' | 'GETTING_EASIER' | 'STABLE';
      if (slope > 0.1) {
        trend = 'GETTING_HARDER';
      } else if (slope < -0.1) {
        trend = 'GETTING_EASIER';
      } else {
        trend = 'STABLE';
      }

      // Determine confidence based on R-squared
      let confidence: 'HIGH' | 'MEDIUM' | 'LOW';
      if (rSquared >= 0.85) {
        confidence = 'HIGH';
      } else if (rSquared >= 0.65) {
        confidence = 'MEDIUM';
      } else {
        confidence = 'LOW';
      }

      return {
        trend,
        slope,
        intercept,
        rSquared,
        confidence,
      };
    } catch (error) {
      console.error('Error analyzing trend:', error);
      return {
        trend: 'STABLE',
        slope: 0,
        intercept: 0,
        rSquared: 0,
        confidence: 'LOW',
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Predict future wave difficulty using polynomial regression
   *
   * @param historicalData - Array of [wave, difficulty] tuples from past waves
   * @param futureWaves - Array of wave numbers to predict
   * @returns Array of WavePrediction objects
   */
  static predictWaveDifficulty(
    historicalData: Array<[number, number]>,
    futureWaves: number[]
  ): WavePrediction[] {
    // Handle edge cases
    if (!historicalData || historicalData.length < 2) {
      return futureWaves.map(wave => ({
        wave,
        predictedDifficulty: 0,
        recommendedDPS: 0,
        confidenceInterval: { lower: 0, upper: 0 },
      }));
    }

    if (!futureWaves || futureWaves.length === 0) {
      return [];
    }

    // Check if library is available
    if (!regressionAvailable || !regression) {
      return futureWaves.map(wave => ({
        wave,
        predictedDifficulty: 0,
        recommendedDPS: 0,
        confidenceInterval: { lower: 0, upper: 0 },
      }));
    }

    try {
      // Perform polynomial regression (order 2 for quadratic fit)
      const order = Math.min(2, historicalData.length - 1);
      const model = regression.polynomial(historicalData, { order, precision: 2 });

      // Generate predictions
      const predictions: WavePrediction[] = futureWaves.map(wave => {
        const predictedDifficulty = model.predict(wave)[1];

        // Calculate recommended DPS (assume 1:1 ratio with difficulty)
        const recommendedDPS = predictedDifficulty;

        // Calculate confidence interval (±20% based on model uncertainty)
        const uncertainty = 0.2;
        const confidenceInterval = {
          lower: predictedDifficulty * (1 - uncertainty),
          upper: predictedDifficulty * (1 + uncertainty),
        };

        return {
          wave,
          predictedDifficulty,
          recommendedDPS,
          confidenceInterval,
        };
      });

      return predictions;
    } catch (error) {
      console.error('Error predicting wave difficulty:', error);
      return futureWaves.map(wave => ({
        wave,
        predictedDifficulty: 0,
        recommendedDPS: 0,
        confidenceInterval: { lower: 0, upper: 0 },
      }));
    }
  }

  /**
   * Calculate statistical summary for a dataset
   *
   * @param values - Array of numeric values
   * @returns StatisticalSummary with all calculated metrics
   */
  static calculateSummary(values: number[]): StatisticalSummary {
    // Handle edge cases
    if (!values || values.length === 0) {
      return {
        mean: 0,
        median: 0,
        mode: 0,
        standardDeviation: 0,
        variance: 0,
        min: 0,
        max: 0,
        range: 0,
      };
    }

    if (values.length === 1) {
      return {
        mean: values[0],
        median: values[0],
        mode: values[0],
        standardDeviation: 0,
        variance: 0,
        min: values[0],
        max: values[0],
        range: 0,
      };
    }

    // Check if library is available
    if (!statisticsAvailable || !ss) {
      // Fallback to basic calculations
      const sorted = [...values].sort((a, b) => a - b);
      const sum = values.reduce((acc, val) => acc + val, 0);
      const mean = sum / values.length;
      const min = sorted[0];
      const max = sorted[sorted.length - 1];

      return {
        mean,
        median: sorted[Math.floor(sorted.length / 2)],
        mode: mean, // Approximation
        standardDeviation: 0,
        variance: 0,
        min,
        max,
        range: max - min,
        error: 'simple-statistics library not available - using fallback calculations',
      };
    }

    try {
      const mean = ss.mean(values);
      const median = ss.median(values);
      const mode = ss.mode(values);
      const standardDeviation = ss.standardDeviation(values);
      const variance = ss.variance(values);
      const min = ss.min(values);
      const max = ss.max(values);
      const range = max - min;

      return {
        mean,
        median,
        mode,
        standardDeviation,
        variance,
        min,
        max,
        range,
      };
    } catch (error) {
      console.error('Error calculating summary:', error);
      return {
        mean: 0,
        median: 0,
        mode: 0,
        standardDeviation: 0,
        variance: 0,
        min: 0,
        max: 0,
        range: 0,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Check if statistical libraries are available
   *
   * @returns Object indicating which libraries are available
   */
  static getLibraryStatus(): {
    statistics: boolean;
    regression: boolean;
    math: boolean;
  } {
    return {
      statistics: statisticsAvailable,
      regression: regressionAvailable,
      math: mathAvailable,
    };
  }
}
