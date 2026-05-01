# Requirements Document

## Introduction

This feature integrates a comprehensive mathematical balance analysis framework into Z-TD's existing logging and stat tracking system. The goal is to enable rapid playtesting and data-driven game balance decisions for solo development. The system will leverage proven mathematical models (Lanchester's Laws, diminishing returns formulas, threat scoring) and statistical analysis libraries to automatically detect balance issues, predict wave difficulty, and provide actionable insights without requiring a full QA team.

The integration will enhance the existing `LogExporter` and `AIPlayerManager` systems with real-time balance analysis, automated issue detection, and predictive modeling capabilities.

## Requirements

### Requirement 1: Mathematical Balance Framework Integration

**User Story:** As a solo developer, I want mathematical balance models integrated into my game's tracking system, so that I can automatically validate game balance without manual calculations.

#### Acceptance Criteria

1. WHEN the game runs THEN the system SHALL calculate Lanchester's Law combat effectiveness for each wave
2. WHEN a wave starts THEN the system SHALL predict whether current tower DPS can defend against the wave using path length and zombie speed
3. WHEN towers are placed or upgraded THEN the system SHALL calculate efficiency scores accounting for DPS, range, and accuracy
4. WHEN multiple towers of the same type exist THEN the system SHALL apply diminishing returns calculations to effective values
5. WHEN a wave completes THEN the system SHALL calculate the threat score for zombie compositions
6. IF threat scores are imbalanced THEN the system SHALL flag potential reward/difficulty mismatches

### Requirement 2: Statistical Analysis Library Integration

**User Story:** As a solo developer, I want statistical analysis tools integrated into my logging system, so that I can automatically detect balance anomalies and trends without manual data analysis.

#### Acceptance Criteria

1. WHEN the game generates reports THEN the system SHALL use `simple-statistics` to calculate mean, standard deviation, and detect outliers in damage values
2. WHEN analyzing wave progression THEN the system SHALL use `regression-js` to perform polynomial regression and predict future wave difficulty
3. WHEN calculating optimal tower placement THEN the system SHALL use `mathjs` for matrix operations and equation solving
4. WHEN damage trends deviate >2 standard deviations from mean THEN the system SHALL flag as potential balance outliers
5. WHEN wave difficulty regression shows slope >0 THEN the system SHALL classify trend as "GETTING_HARDER"
6. WHEN wave difficulty regression shows slope <0 THEN the system SHALL classify trend as "GETTING_EASIER"

### Requirement 3: Real-Time Balance Analyzer

**User Story:** As a solo developer, I want automated balance issue detection during gameplay, so that I can identify problems immediately without waiting for post-game analysis.

#### Acceptance Criteria

1. WHEN damage per dollar falls below 15 THEN the system SHALL flag "INEFFICIENT_TOWERS" issue
2. WHEN survival rate falls below 50% THEN the system SHALL flag "WEAK_DEFENSE" issue
3. WHEN overkill percentage exceeds 15% THEN the system SHALL flag "EXCESSIVE_OVERKILL" issue
4. WHEN economy efficiency falls below 100% THEN the system SHALL flag "NEGATIVE_ECONOMY" issue
5. WHEN balance issues are detected THEN the system SHALL log warnings to console with specific issue descriptions
6. WHEN a game session ends THEN the system SHALL include all detected balance issues in the exported report

### Requirement 4: Optimal Tower Mix Calculator

**User Story:** As a solo developer, I want the system to calculate optimal tower compositions, so that I can validate AI strategies and provide player recommendations.

#### Acceptance Criteria

1. WHEN given a budget and tower stats THEN the system SHALL calculate optimal tower mix using marginal utility
2. WHEN calculating tower mix THEN the system SHALL sort towers by efficiency (DPS × Range / Cost)
3. WHEN placing duplicate towers THEN the system SHALL apply 90% efficiency reduction per duplicate
4. WHEN budget is exhausted THEN the system SHALL return a record of tower types and quantities
5. WHEN tower mix is calculated THEN the system SHALL include the calculation in performance reports
6. IF actual tower composition deviates >30% from optimal THEN the system SHALL flag as suboptimal strategy

### Requirement 5: Effective DPS Calculation with Overkill

**User Story:** As a solo developer, I want accurate DPS calculations that account for wasted overkill damage, so that I can measure true tower effectiveness.

#### Acceptance Criteria

1. WHEN calculating DPS THEN the system SHALL account for overkill damage wastage
2. WHEN a zombie dies THEN the system SHALL calculate wasted damage as (shots to kill × damage per hit) - zombie HP
3. WHEN calculating effective DPS THEN the system SHALL apply formula: nominal DPS × (1 - waste percent)
4. WHEN overkill waste exceeds 15% THEN the system SHALL recommend spreading towers or using different types
5. WHEN generating reports THEN the system SHALL include both nominal DPS and effective DPS metrics
6. WHEN comparing tower types THEN the system SHALL use effective DPS for efficiency calculations

### Requirement 6: Break-Even Analysis

**User Story:** As a solo developer, I want to know how long towers take to pay for themselves, so that I can balance tower costs and rewards appropriately.

#### Acceptance Criteria

1. WHEN a tower is placed THEN the system SHALL calculate break-even time in seconds
2. WHEN calculating break-even THEN the system SHALL use formula: tower cost / (average zombie reward / kill time)
3. WHEN break-even time exceeds 30 seconds THEN the system SHALL flag tower as potentially overpriced
4. WHEN break-even time is below 15 seconds THEN the system SHALL flag tower as potentially underpriced
5. WHEN generating reports THEN the system SHALL include break-even analysis for each tower type
6. WHEN multiple towers exist THEN the system SHALL calculate average break-even time across all towers

### Requirement 7: Enhanced Report Generation

**User Story:** As a solo developer, I want comprehensive balance analysis included in game reports, so that I can make data-driven balance decisions after each playtest.

#### Acceptance Criteria

1. WHEN a game session ends THEN the system SHALL generate a report including all balance analysis metrics
2. WHEN generating reports THEN the system SHALL include Lanchester's Law predictions vs actual outcomes
3. WHEN generating reports THEN the system SHALL include statistical analysis (outliers, trends, regressions)
4. WHEN generating reports THEN the system SHALL include detected balance issues with severity ratings
5. WHEN generating reports THEN the system SHALL include optimal vs actual tower mix comparison
6. WHEN generating reports THEN the system SHALL include break-even analysis for all tower types
7. WHEN generating reports THEN the system SHALL include predictive modeling for next 5 waves
8. WHEN reports are saved THEN the system SHALL maintain backward compatibility with existing report format

### Requirement 8: Balance Dashboard Data Export

**User Story:** As a solo developer, I want balance data formatted for visualization, so that I can create charts and graphs to understand trends over multiple playtests.

#### Acceptance Criteria

1. WHEN generating reports THEN the system SHALL include data formatted for Chart.js visualization
2. WHEN exporting dashboard data THEN the system SHALL include player DPS vs required DPS over time
3. WHEN exporting dashboard data THEN the system SHALL include damage per dollar trends across waves
4. WHEN exporting dashboard data THEN the system SHALL include economy efficiency trends
5. WHEN exporting dashboard data THEN the system SHALL include survival rate predictions
6. WHEN multiple reports exist THEN the system SHALL support aggregating data across sessions for trend analysis

### Requirement 9: Predictive Wave Difficulty Modeling

**User Story:** As a solo developer, I want the system to predict future wave difficulty, so that I can proactively balance upcoming waves before playtesting them.

#### Acceptance Criteria

1. WHEN a wave completes THEN the system SHALL use polynomial regression to model difficulty progression
2. WHEN predicting difficulty THEN the system SHALL calculate recommended DPS for next 5 waves
3. WHEN predicted difficulty exceeds player capability by >50% THEN the system SHALL flag as difficulty spike
4. WHEN generating reports THEN the system SHALL include difficulty predictions with confidence intervals
5. WHEN difficulty model shows exponential growth THEN the system SHALL recommend scaling adjustments
6. IF player consistently fails at predicted difficulty THEN the system SHALL suggest reducing scaling factors

### Requirement 10: Integration with Existing Systems

**User Story:** As a solo developer, I want the balance analysis system to integrate seamlessly with existing code, so that I don't need to refactor large portions of the game.

#### Acceptance Criteria

1. WHEN integrating balance analysis THEN the system SHALL extend existing `LogExporter` class without breaking changes
2. WHEN integrating balance analysis THEN the system SHALL extend existing `AIPlayerManager` without breaking changes
3. WHEN balance analysis is active THEN the system SHALL not impact game performance (< 5ms per frame)
4. WHEN balance analysis fails THEN the system SHALL gracefully degrade without crashing the game
5. WHEN generating reports THEN the system SHALL maintain compatibility with existing report server
6. WHEN libraries are missing THEN the system SHALL log warnings but continue basic functionality
7. WHEN balance analysis is disabled THEN the system SHALL function identically to current implementation

---

## Success Criteria

The feature will be considered successful when:

1. ✅ All mathematical models (Lanchester's Laws, diminishing returns, threat scoring) are integrated and producing accurate calculations
2. ✅ Statistical libraries (`simple-statistics`, `regression-js`, `mathjs`) are installed and functioning correctly
3. ✅ Balance issues are automatically detected and flagged in real-time during gameplay
4. ✅ Reports include comprehensive balance analysis with actionable insights
5. ✅ Predictive modeling accurately forecasts wave difficulty within 20% margin
6. ✅ System integrates without breaking existing functionality or impacting performance
7. ✅ Developer can playtest, receive automated balance feedback, and iterate on game balance within minutes

---

## Out of Scope

The following are explicitly out of scope for this feature:

- Visual dashboard UI for displaying balance charts (data export only)
- Automated game balance adjustments (analysis and recommendations only)
- Machine learning models for balance prediction (statistical models only)
- Multiplayer balance considerations
- Real-time balance adjustments during gameplay
- Integration with external analytics platforms
- Historical balance tracking across game versions

---

## Dependencies

- `simple-statistics` npm package (v7.8.3 or later)
- `regression` npm package (v2.0.1 or later)
- `mathjs` npm package (v12.0.0 or later)
- Existing `LogExporter` class
- Existing `AIPlayerManager` class
- Existing report server (`server.js`)
- TypeScript 5.7.3+
- Node.js runtime environment

---

## Technical Constraints

- Balance analysis calculations must complete within 5ms per frame to avoid performance impact
- Statistical analysis must handle edge cases (empty datasets, single data points) gracefully
- Library bundle size should not exceed 500KB to maintain fast load times
- All calculations must use TypeScript strict mode and proper type definitions
- Reports must remain under 5MB to ensure fast saving and loading
- System must work offline without external API dependencies

---

## Assumptions

- The existing stat tracking system accurately captures combat, economy, and efficiency data
- The report server is running when balance analysis reports are generated
- Tower and zombie stats remain relatively stable during development (no major rebalancing mid-session)
- The developer has basic understanding of statistical concepts (mean, standard deviation, regression)
- The game runs at stable 60 FPS for accurate time-based calculations
- Path length and zombie speeds are accessible from game managers

---

_Requirements Version: 1.0_  
_Last Updated: 2025-10-15_
