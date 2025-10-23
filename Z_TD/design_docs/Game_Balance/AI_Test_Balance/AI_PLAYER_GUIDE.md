# AI Player Guide

## Overview

The AI Player is a basic automated system that plays the game for you, useful for quickly testing game balance and tower effectiveness without manual intervention.

## How to Use

1. **Start the game** - Load any level
2. **Click the robot icon button** on the left side of the screen (floating panel)
3. The button will turn green and show "ON"
4. The AI will automatically:
   - Place and upgrade towers
   - Progress to the next wave immediately (no delay)
   - Log performance metrics every 10 seconds
5. Click the button again to disable the AI and see the final report

## AI Strategy

The AI follows a simple but effective strategy focused on building diverse tower compositions:

### Tower Placement

- Places towers at pre-defined strategic zones
- Prioritizes corners and choke points (higher priority zones)
- Maintains minimum distance from other towers
- Avoids placing towers on the path

### Tower Selection Strategy

**Target Composition (All Waves):**

- 40% Machine Gun (DPS backbone)
- 25% Sniper (high damage, long range)
- 15% Shotgun (area damage)
- 10% Tesla (chain lightning)
- 10% Flame (damage over time)

**Wave-Based Unlocks:**

- Wave 1+: Machine Gun (minimum 2 for early defense)
- Wave 3+: Sniper towers
- Wave 5+: Shotgun towers
- Wave 7+: Tesla towers
- Wave 9+: Flame towers

The AI builds towers to maintain these target ratios, ensuring a balanced and diverse defense from the start

### Upgrade Strategy

- Upgrades towers when money exceeds $200
- Prioritizes:
  1. Sniper towers (highest value)
  2. Tesla towers
  3. Shotgun towers
  4. Lower-level towers (spreads upgrades evenly)
- Never upgrades beyond max level

### Wave Progression

- Automatically starts the next wave immediately after completion
- No delay - continuous gameplay for rapid testing
- Continues until game over or AI is disabled

### Decision Timing

- Makes decisions every 1 second
- Checks upgrade opportunities before placing new towers
- Balances between building new towers and upgrading existing ones

## Strategic Placement Zones

The AI uses 15 pre-defined zones optimized for the default map:

**High Priority Zones (14-15):**

- Corners where zombies turn (maximum coverage)

**Medium Priority Zones (10-13):**

- Path segments with good coverage
- Secondary corner positions

**Low Priority Zones (7-9):**

- Additional coverage areas
- Gap fillers

## Limitations

This is a **basic AI** designed for testing, not competitive play:

- Uses fixed placement zones (doesn't adapt to different maps)
- Simple decision-making (no complex strategy)
- No resource management (wood, metal, energy)
- Doesn't react to specific zombie types
- Doesn't optimize tower positioning dynamically

## Performance Logging

The AI automatically logs detailed performance metrics:

### Periodic Reports (Every 10 seconds)

- Current wave and highest wave reached
- Lives remaining and lives lost
- Money available and total spent
- Towers built and upgraded
- Tower composition breakdown with percentages

### Final Report (When AI is disabled)

- Session duration
- Highest wave reached
- Survival rate percentage
- Total money spent
- Average build rate (towers/minute)
- Complete tower composition
- Performance rating (⭐ to ⭐⭐⭐⭐⭐)
- Defense rating (🛡️ Perfect to ❌ Weak)

All logs are prefixed with 🤖 for easy filtering in the console.

### Exported Log Files

When the AI is disabled, performance data is automatically exported to a JSON file:

**Filename Format:**

```
YYYY-MM-DD_HH-MM-SS_AI_waveX.json
```

Example: `2025-10-15_14-30-45_AI_wave12.json`

**File Contents:**

```json
{
  "timestamp": "2025-10-15T14:30:45.123Z",
  "sessionId": "session_1729005045123_abc123",
  "isAIRun": true,
  "duration": 180000,
  "startTime": "2025-10-15T14:27:45.123Z",
  "endTime": "2025-10-15T14:30:45.123Z",
  "gameData": {
    "highestWave": 12,
    "finalMoney": 320,
    "finalLives": 85,
    "startLives": 100,
    "survivalRate": 85.0,
    "livesLost": 15
  },
  "aiData": {
    "towersBuilt": 15,
    "towersUpgraded": 8,
    "moneySpent": 2450,
    "averageBuildRate": 5.0,
    "towerComposition": {
      "MachineGun": 6,
      "Sniper": 4,
      "Shotgun": 2,
      "Tesla": 2,
      "Flame": 1
    },
    "performanceRating": "⭐⭐⭐ GOOD",
    "defenseRating": "🛡️ STRONG DEFENSE"
  }
}
```

**Manual Play Logs:**

- Manual (non-AI) games also export logs on game over
- Filename format: `YYYY-MM-DD_HH-MM-SS_MANUAL_waveX.json`
- Contains `gameData` but no `aiData` section
- Useful for comparing AI vs human performance

### Storage and Organization

**Browser Storage:**

- Logs automatically stored in browser localStorage
- Up to 100 most recent logs kept
- Older logs automatically removed when limit reached

**File Storage:**

- Each log also downloads as a file
- Save downloaded files to `player_logs/` folder in repo
- Folder is git-ignored (keeps repo clean)

**Batch Export:**

```javascript
// After running multiple tests, export all at once
LogExporter.exportAllLogs();
// Save all downloaded files to player_logs/
```

**Workflow:**

1. Run AI tests (logs stored in browser)
2. When done, run `LogExporter.exportAllLogs()`
3. Save all downloaded files to `player_logs/` folder
4. Organize by date or version in subfolders
5. Analyze with your preferred tools

## Use Cases

Perfect for:

- **Balance Testing** - See how far the AI can progress with detailed metrics
- **Tower Effectiveness** - Compare different tower combinations via composition logs
- **Wave Difficulty** - Test if waves are too easy/hard based on survival rates
- **Alpha Testing** - Automated playtesting with comprehensive performance data
- **Regression Testing** - Verify game balance after changes
- **Data Analysis** - Export JSON logs for spreadsheet analysis or visualization
- **A/B Testing** - Compare multiple AI runs to identify patterns
- **Performance Tracking** - Track improvements over time with timestamped logs

## UI Location

The AI control panel is a floating button on the **left side** of the screen:

- Position: Bottom left, similar to Wave Info panel
- Icon: Robot face with antenna
- Status: Shows "ON" (green) or "OFF" (gray)
- Always visible during gameplay

## Console Commands

### AI Control

```javascript
// Enable AI
gameManager.getAIPlayerManager().setEnabled(true);

// Disable AI
gameManager.getAIPlayerManager().setEnabled(false);

// Check if AI is enabled
gameManager.getAIPlayerManager().isEnabled();

// Reset AI state
gameManager.getAIPlayerManager().reset();

// Get current stats
gameManager.getAIPlayerManager().getStats();
```

### Log Management

```javascript
// View all stored logs
LogExporter.viewStoredLogs();

// Export all logs as individual files
LogExporter.exportAllLogs();

// Export all logs as single bundle
LogExporter.exportAllLogsAsBundle();

// Get number of stored logs
LogExporter.getStoredLogCount();

// Clear all stored logs
LogExporter.clearAllLogs();
```

## Future Improvements

Potential enhancements for the AI:

- Dynamic zone calculation based on actual map paths
- Resource management integration
- Zombie type awareness (build counters)
- Adaptive difficulty (adjust strategy based on performance)
- Multiple AI personalities (aggressive, defensive, balanced)
- Machine learning integration for optimal play

---

_The AI is intentionally simple to make balance testing straightforward. A perfect AI would make it hard to identify game balance issues!_
