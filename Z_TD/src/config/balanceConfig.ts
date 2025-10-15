/**
 * Balance Analysis Configuration
 *
 * Defines all thresholds, factors, and parameters used by the balance analysis system.
 * These values control when balance issues are detected and how calculations are performed.
 */

/**
 * Thresholds for detecting balance issues
 */
export const BALANCE_THRESHOLDS = {
  /**
   * Minimum acceptable damage per dollar spent on towers
   * Below this value triggers INEFFICIENT_TOWERS warning
   */
  DAMAGE_PER_DOLLAR_MIN: 15,

  /**
   * Minimum acceptable survival rate (percentage of lives remaining)
   * Below this value triggers WEAK_DEFENSE warning
   */
  SURVIVAL_RATE_MIN: 50,

  /**
   * Maximum acceptable overkill damage percentage
   * Above this value triggers EXCESSIVE_OVERKILL warning
   */
  OVERKILL_PERCENT_MAX: 15,

  /**
   * Minimum acceptable economy efficiency (income/expenses ratio as percentage)
   * Below this value triggers NEGATIVE_ECONOMY warning
   */
  ECONOMY_EFFICIENCY_MIN: 100,

  /**
   * Minimum time (in seconds) for a tower to break even
   * Below this suggests tower is underpriced
   */
  BREAK_EVEN_TIME_MIN: 15,

  /**
   * Maximum time (in seconds) for a tower to break even
   * Above this suggests tower is overpriced
   */
  BREAK_EVEN_TIME_MAX: 30,

  /**
   * Minimum acceptable threat score for zombie types
   * Below this suggests zombies are too weak for their reward
   */
  THREAT_SCORE_MIN: 0.8,

  /**
   * Maximum acceptable threat score for zombie types
   * Above this suggests zombies are too strong for their reward
   */
  THREAT_SCORE_MAX: 1.2,

  /**
   * Minimum safety margin (percentage) for wave defense
   * Below this suggests defense is barely adequate
   */
  SAFETY_MARGIN_MIN: 20,

  /**
   * Minimum acceptable accuracy rate (percentage)
   * Below this suggests poor tower placement or targeting
   */
  ACCURACY_RATE_MIN: 60,

  /**
   * Maximum acceptable deviation from optimal tower mix (percentage)
   * Above this suggests suboptimal strategy
   */
  OPTIMAL_MIX_DEVIATION_MAX: 30,
} as const;

/**
 * Diminishing returns configuration
 */
export const DIMINISHING_RETURNS = {
  /**
   * Factor for tower stacking diminishing returns
   * Higher values = less severe diminishing returns
   * Formula: effectiveValue = (stat / (stat + factor)) * cap
   */
  TOWER_STACKING_FACTOR: 100,

  /**
   * Efficiency reduction per duplicate tower (as decimal)
   * Each duplicate tower operates at this percentage of full efficiency
   * Example: 0.9 = 90% efficiency for each additional tower of same type
   */
  EFFICIENCY_REDUCTION_PER_DUPLICATE: 0.9,

  /**
   * Maximum effective value cap for diminishing returns (as decimal)
   * Prevents infinite stacking from reaching 100% effectiveness
   */
  DIMINISHING_RETURNS_CAP: 0.5,
} as const;

/**
 * Statistical analysis parameters
 */
export const STATISTICAL_PARAMS = {
  /**
   * Number of standard deviations for outlier detection
   * Values beyond this threshold are considered outliers
   */
  OUTLIER_THRESHOLD: 2,

  /**
   * R-squared value for high confidence in trend analysis
   * Above this value indicates strong correlation
   */
  CONFIDENCE_HIGH_R_SQUARED: 0.85,

  /**
   * R-squared value for medium confidence in trend analysis
   * Between medium and high indicates moderate correlation
   */
  CONFIDENCE_MEDIUM_R_SQUARED: 0.65,

  /**
   * Polynomial order for wave difficulty regression
   * Higher orders can model more complex difficulty curves
   */
  REGRESSION_POLYNOMIAL_ORDER: 2,

  /**
   * Number of future waves to predict
   */
  PREDICTION_WAVE_COUNT: 5,

  /**
   * Confidence interval width (as decimal)
   * Example: 0.95 = 95% confidence interval
   */
  CONFIDENCE_INTERVAL: 0.95,

  /**
   * Minimum data points required for statistical analysis
   * Below this, analysis may be unreliable
   */
  MIN_DATA_POINTS: 3,
} as const;

/**
 * Performance and timing configuration
 */
export const PERFORMANCE_CONFIG = {
  /**
   * Interval between real-time balance analyses (milliseconds)
   * More frequent = more overhead but faster issue detection
   */
  ANALYSIS_INTERVAL_MS: 10000, // 10 seconds

  /**
   * Maximum acceptable analysis execution time (milliseconds)
   * Above this triggers performance warning
   */
  MAX_ANALYSIS_TIME_MS: 5,

  /**
   * Interval for money timeline snapshots (milliseconds)
   */
  MONEY_SNAPSHOT_INTERVAL_MS: 5000, // 5 seconds

  /**
   * Interval for game state timeline snapshots (milliseconds)
   */
  TIMELINE_SNAPSHOT_INTERVAL_MS: 10000, // 10 seconds
} as const;

/**
 * Balance rating thresholds
 */
export const RATING_THRESHOLDS = {
  /**
   * Damage per dollar ratings
   */
  DAMAGE_PER_DOLLAR: {
    EXCELLENT: 100,
    GOOD: 50,
    FAIR: 25,
    // Below FAIR is POOR
  },

  /**
   * Kills per dollar ratings
   */
  KILLS_PER_DOLLAR: {
    EXCELLENT: 1.0,
    GOOD: 0.5,
    FAIR: 0.25,
    // Below FAIR is POOR
  },

  /**
   * Economy efficiency ratings (percentage)
   */
  ECONOMY_EFFICIENCY: {
    EXCELLENT: 150,
    GOOD: 120,
    FAIR: 100,
    // Below FAIR is POOR
  },

  /**
   * Survival rate ratings (percentage)
   */
  SURVIVAL_RATE: {
    PERFECT: 100,
    STRONG: 80,
    MODERATE: 50,
    // Below MODERATE is WEAK
  },

  /**
   * Wave progression ratings
   */
  WAVE_PROGRESSION: {
    EXCELLENT: 20,
    GREAT: 15,
    GOOD: 10,
    FAIR: 5,
    // Below FAIR is NEEDS_IMPROVEMENT
  },
} as const;

/**
 * Issue severity levels
 */
export const SEVERITY_LEVELS = {
  LOW: 'LOW',
  MEDIUM: 'MEDIUM',
  HIGH: 'HIGH',
  CRITICAL: 'CRITICAL',
} as const;

/**
 * Balance issue types
 */
export const ISSUE_TYPES = {
  INEFFICIENT_TOWERS: 'INEFFICIENT_TOWERS',
  WEAK_DEFENSE: 'WEAK_DEFENSE',
  EXCESSIVE_OVERKILL: 'EXCESSIVE_OVERKILL',
  NEGATIVE_ECONOMY: 'NEGATIVE_ECONOMY',
  OVERPRICED_TOWER: 'OVERPRICED_TOWER',
  UNDERPRICED_TOWER: 'UNDERPRICED_TOWER',
  IMBALANCED_THREAT: 'IMBALANCED_THREAT',
  DIFFICULTY_SPIKE: 'DIFFICULTY_SPIKE',
  SUBOPTIMAL_MIX: 'SUBOPTIMAL_MIX',
} as const;

/**
 * Trend classifications
 */
export const TREND_TYPES = {
  GETTING_HARDER: 'GETTING_HARDER',
  GETTING_EASIER: 'GETTING_EASIER',
  STABLE: 'STABLE',
} as const;

/**
 * Cash flow trend types
 */
export const CASH_FLOW_TRENDS = {
  GROWING: 'GROWING',
  STABLE: 'STABLE',
  DECLINING: 'DECLINING',
} as const;

/**
 * Overall balance ratings
 */
export const BALANCE_RATINGS = {
  EXCELLENT: 'EXCELLENT',
  GOOD: 'GOOD',
  FAIR: 'FAIR',
  POOR: 'POOR',
  CRITICAL: 'CRITICAL',
} as const;

/**
 * Confidence levels for predictions
 */
export const CONFIDENCE_LEVELS = {
  HIGH: 'HIGH',
  MEDIUM: 'MEDIUM',
  LOW: 'LOW',
} as const;

/**
 * Helper function to get severity based on threshold deviation
 * @param value Current value
 * @param threshold Threshold value
 * @param isMaxThreshold True if threshold is a maximum, false if minimum
 * @returns Severity level
 */
export function getSeverityFromDeviation(
  value: number,
  threshold: number,
  isMaxThreshold: boolean = false
): keyof typeof SEVERITY_LEVELS {
  const deviation = isMaxThreshold
    ? ((value - threshold) / threshold) * 100
    : ((threshold - value) / threshold) * 100;

  if (deviation < 10) {
    return 'LOW';
  }
  if (deviation < 25) {
    return 'MEDIUM';
  }
  if (deviation < 50) {
    return 'HIGH';
  }
  return 'CRITICAL';
}

/**
 * Helper function to get cost efficiency rating
 * @param damagePerDollar Damage per dollar value
 * @returns Rating string
 */
export function getCostEfficiencyRating(damagePerDollar: number): string {
  if (damagePerDollar >= RATING_THRESHOLDS.DAMAGE_PER_DOLLAR.EXCELLENT) {
    return 'EXCELLENT';
  }
  if (damagePerDollar >= RATING_THRESHOLDS.DAMAGE_PER_DOLLAR.GOOD) {
    return 'GOOD';
  }
  if (damagePerDollar >= RATING_THRESHOLDS.DAMAGE_PER_DOLLAR.FAIR) {
    return 'FAIR';
  }
  return 'POOR';
}

/**
 * Helper function to get economy efficiency rating
 * @param efficiency Economy efficiency percentage
 * @returns Rating string
 */
export function getEconomyEfficiencyRating(efficiency: number): string {
  if (efficiency >= RATING_THRESHOLDS.ECONOMY_EFFICIENCY.EXCELLENT) {
    return 'EXCELLENT';
  }
  if (efficiency >= RATING_THRESHOLDS.ECONOMY_EFFICIENCY.GOOD) {
    return 'GOOD';
  }
  if (efficiency >= RATING_THRESHOLDS.ECONOMY_EFFICIENCY.FAIR) {
    return 'FAIR';
  }
  return 'POOR';
}

/**
 * Helper function to get survival rate rating
 * @param survivalRate Survival rate percentage
 * @returns Rating string with emoji
 */
export function getSurvivalRateRating(survivalRate: number): string {
  if (survivalRate >= RATING_THRESHOLDS.SURVIVAL_RATE.PERFECT) {
    return '🛡️ PERFECT DEFENSE';
  }
  if (survivalRate >= RATING_THRESHOLDS.SURVIVAL_RATE.STRONG) {
    return '🛡️ STRONG DEFENSE';
  }
  if (survivalRate >= RATING_THRESHOLDS.SURVIVAL_RATE.MODERATE) {
    return '⚠️ MODERATE DEFENSE';
  }
  return '❌ WEAK DEFENSE';
}

/**
 * Helper function to get wave progression rating
 * @param highestWave Highest wave reached
 * @returns Rating string with stars
 */
export function getWaveProgressionRating(highestWave: number): string {
  if (highestWave >= RATING_THRESHOLDS.WAVE_PROGRESSION.EXCELLENT) {
    return '⭐⭐⭐⭐⭐ EXCELLENT';
  }
  if (highestWave >= RATING_THRESHOLDS.WAVE_PROGRESSION.GREAT) {
    return '⭐⭐⭐⭐ GREAT';
  }
  if (highestWave >= RATING_THRESHOLDS.WAVE_PROGRESSION.GOOD) {
    return '⭐⭐⭐ GOOD';
  }
  if (highestWave >= RATING_THRESHOLDS.WAVE_PROGRESSION.FAIR) {
    return '⭐⭐ FAIR';
  }
  return '⭐ NEEDS IMPROVEMENT';
}

/**
 * Helper function to determine overall balance rating from issues
 * @param issues Array of balance issues
 * @returns Overall balance rating
 */
export function getOverallBalanceRating(
  issues: Array<{ severity: keyof typeof SEVERITY_LEVELS }>
): keyof typeof BALANCE_RATINGS {
  if (issues.length === 0) {
    return 'EXCELLENT';
  }

  const criticalCount = issues.filter(i => i.severity === 'CRITICAL').length;
  const highCount = issues.filter(i => i.severity === 'HIGH').length;
  const mediumCount = issues.filter(i => i.severity === 'MEDIUM').length;

  if (criticalCount > 0) {
    return 'CRITICAL';
  }
  if (highCount >= 2) {
    return 'POOR';
  }
  if (highCount >= 1 || mediumCount >= 3) {
    return 'FAIR';
  }
  if (mediumCount >= 1) {
    return 'GOOD';
  }
  return 'EXCELLENT';
}

/**
 * Export all configuration as a single object for easy access
 */
export const BalanceConfig = {
  THRESHOLDS: BALANCE_THRESHOLDS,
  DIMINISHING_RETURNS,
  STATISTICAL: STATISTICAL_PARAMS,
  PERFORMANCE: PERFORMANCE_CONFIG,
  RATINGS: RATING_THRESHOLDS,
  SEVERITY: SEVERITY_LEVELS,
  ISSUES: ISSUE_TYPES,
  TRENDS: TREND_TYPES,
  CASH_FLOW: CASH_FLOW_TRENDS,
  BALANCE_RATINGS,
  CONFIDENCE: CONFIDENCE_LEVELS,
} as const;

export default BalanceConfig;
