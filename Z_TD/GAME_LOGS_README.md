# Game Logs Documentation

## Overview

Z-TD automatically exports game performance data to JSON files for analysis and testing. Logs are generated for both AI and manual play sessions.

## Log File Naming

### Format

```
YYYY-MM-DD_HH-MM-SS_[TYPE]_wave[N].json
```

### Components

- **Date**: `YYYY-MM-DD` - Date of the game session
- **Time**: `HH-MM-SS` - Time when the session ended
- **Type**: `AI` or `MANUAL` - Indicates if AI was playing
- **Wave**: `wave[N]` - Highest wave reached

### Examples

```
2025-10-15_14-30-45_AI_wave12.json      # AI run, reached wave 12
2025-10-15_15-45-20_MANUAL_wave8.json   # Manual play, reached wave 8
2025-10-15_16-20-10_AI_wave25.json      # AI run, reached wave 25
```

## Log File Structure

### Common Fields (All Logs)

```json
{
  "timestamp": "ISO 8601 timestamp",
  "sessionId": "Unique session identifier",
  "isAIRun": true/false,
  "duration": 0,
  "startTime": "ISO 8601 timestamp",
  "endTime": "ISO 8601 timestamp",
  "gameData": { ... }
}
```

### Game Data Section

Present in all logs:

```json
"gameData": {
  "highestWave": 12,           // Maximum wave reached
  "finalMoney": 320,            // Money at end of game
  "finalLives": 85,             // Lives remaining
  "startLives": 100,            // Starting lives
  "survivalRate": 85.0,         // Percentage of lives retained
  "livesLost": 15               // Total lives lost
}
```

### AI Data Section

Only present when `isAIRun: true`:

```json
"aiData": {
  "towersBuilt": 15,            // Total towers placed
  "towersUpgraded": 8,          // Total upgrade actions
  "moneySpent": 2450,           // Total money spent
  "averageBuildRate": 5.0,      // Towers built per minute
  "towerComposition": {         // Breakdown by tower type
    "MachineGun": 6,
    "Sniper": 4,
    "Shotgun": 2,
    "Tesla": 2,
    "Flame": 1
  },
  "performanceRating": "⭐⭐⭐ GOOD",
  "defenseRating": "🛡️ STRONG DEFENSE"
}
```

## Performance Ratings

### Wave Progress Rating

- ⭐⭐⭐⭐⭐ EXCELLENT - Wave 20+
- ⭐⭐⭐⭐ GREAT - Wave 15-19
- ⭐⭐⭐ GOOD - Wave 10-14
- ⭐⭐ FAIR - Wave 5-9
- ⭐ NEEDS IMPROVEMENT - Wave 1-4

### Defense Rating

- 🛡️ PERFECT DEFENSE - 100% survival
- 🛡️ STRONG DEFENSE - 80-99% survival
- ⚠️ MODERATE DEFENSE - 50-79% survival
- ❌ WEAK DEFENSE - Below 50% survival

## Use Cases

### Balance Testing

Compare multiple AI runs to identify:

- Average wave progression
- Survival rates across runs
- Tower composition effectiveness
- Money management patterns

### A/B Testing

Test game changes by comparing logs:

```bash
# Before changes
2025-10-15_14-30-45_AI_wave12.json

# After changes
2025-10-15_15-45-20_AI_wave15.json
```

### Data Analysis

Import logs into spreadsheet software:

1. Collect multiple log files
2. Extract key metrics (wave, survival rate, tower composition)
3. Calculate averages and trends
4. Visualize with charts

### Regression Testing

Verify game balance after code changes:

1. Run AI tests before changes
2. Make code modifications
3. Run AI tests after changes
4. Compare results to ensure no regressions

## Analyzing Logs

### Python Example

```python
import json
import glob

# Load all AI logs
logs = []
for file in glob.glob("*_AI_*.json"):
    with open(file) as f:
        logs.append(json.load(f))

# Calculate average wave reached
avg_wave = sum(log["gameData"]["highestWave"] for log in logs) / len(logs)
print(f"Average wave: {avg_wave:.1f}")

# Find most common tower composition
compositions = [log["aiData"]["towerComposition"] for log in logs]
# ... analyze compositions
```

### JavaScript Example

```javascript
// Load log file
fetch('2025-10-15_14-30-45_AI_wave12.json')
  .then(res => res.json())
  .then(log => {
    console.log(`Wave: ${log.gameData.highestWave}`);
    console.log(`Survival: ${log.gameData.survivalRate}%`);
    console.log(`Towers: ${log.aiData.towersBuilt}`);
  });
```

## Session IDs

Each game session has a unique ID:

```
session_[timestamp]_[random]
```

Example: `session_1729005045123_abc123`

Use session IDs to:

- Group related logs
- Track multiple attempts
- Identify specific test runs

## Best Practices

### Organizing Logs

```
player_logs/
├── 2025-10-15/
│   ├── 2025-10-15_14-30-45_AI_wave12.json
│   ├── 2025-10-15_15-45-20_MANUAL_wave8.json
│   └── 2025-10-15_16-20-10_AI_wave25.json
├── 2025-10-16/
│   └── ...
└── analysis/
    ├── summary.csv
    └── charts.png
```

### Batch Testing

Run multiple AI sessions:

1. Enable AI
2. Let it play until game over
3. Disable AI (exports log)
4. Restart game
5. Repeat 10-20 times
6. Analyze collected logs

### Comparing Versions

```
logs/
├── v1.0/
│   ├── run1_AI_wave10.json
│   ├── run2_AI_wave12.json
│   └── run3_AI_wave11.json
└── v1.1/
    ├── run1_AI_wave15.json
    ├── run2_AI_wave14.json
    └── run3_AI_wave16.json
```

## Troubleshooting

### No Logs Generated

- Check browser console for errors
- Verify AI was enabled/disabled properly
- Ensure game reached game over state

### Missing AI Data

- Confirm `isAIRun: true` in log
- Verify AI was active during session
- Check that AI completed at least one action

### Duplicate Logs

- Each disable/game over creates new log
- Use session IDs to identify unique runs
- Delete duplicates manually if needed

## Future Enhancements

Planned features:

- Automatic upload to cloud storage
- Real-time log streaming
- Built-in analysis dashboard
- Comparison tools in-game
- Historical trend tracking
- Machine learning integration

---

_For more information, see `AI_PLAYER_GUIDE.md`_
