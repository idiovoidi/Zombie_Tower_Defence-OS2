# Player Logs Directory

This directory stores exported game performance logs from Z-TD.

## How Logs Are Generated

### Automatic Export

- **AI Runs**: When you disable the AI, a log file is automatically downloaded
- **Manual Play**: When the game ends, a log file is automatically downloaded

### Saving to This Folder

1. Play the game (with or without AI)
2. When the log downloads, save it to this `player_logs/` folder
3. Logs are automatically named with date, time, and type

## Log File Format

```
YYYY-MM-DD_HH-MM-SS_[AI/MANUAL]_wave[N].json
```

Examples:

- `2025-10-15_14-30-45_AI_wave12.json`
- `2025-10-15_15-45-20_MANUAL_wave8.json`

## Console Commands

Open browser console (F12) and use these commands:

### View Stored Logs

```javascript
LogExporter.viewStoredLogs();
```

### Export All Logs

```javascript
// Export each log as individual file
LogExporter.exportAllLogs();

// Export all logs as single bundle
LogExporter.exportAllLogsAsBundle();
```

### Get Log Count

```javascript
LogExporter.getStoredLogCount();
```

### Clear Stored Logs

```javascript
LogExporter.clearAllLogs();
```

## Storage

Logs are stored in two places:

1. **Browser localStorage** - Automatic, up to 100 most recent logs
2. **Downloaded files** - Manual, save to this folder for permanent storage

## Analyzing Logs

See `GAME_LOGS_README.md` in the root directory for:

- Log file structure
- Analysis examples
- Best practices
- Comparison techniques

## Git Ignore

This folder is configured to:

- ✅ Track `.gitignore` and `README.md`
- ❌ Ignore all `.json` log files (keep repo clean)

To commit specific logs for reference:

```bash
git add -f player_logs/important_log.json
```

## Workflow

### Daily Testing

1. Run multiple AI sessions
2. Logs auto-download
3. Save to this folder
4. Analyze at end of day

### Version Comparison

```
player_logs/
├── v1.0/
│   ├── 2025-10-15_14-30-45_AI_wave12.json
│   └── 2025-10-15_15-45-20_AI_wave11.json
└── v1.1/
    ├── 2025-10-16_10-15-30_AI_wave15.json
    └── 2025-10-16_11-20-45_AI_wave14.json
```

### Batch Export

```javascript
// In console after multiple test runs
LogExporter.exportAllLogs();
// Save all downloaded files to player_logs/
```

## Tips

- Run AI tests in batches (10-20 runs)
- Export all logs at once with `exportAllLogs()`
- Organize by date or version in subfolders
- Use bundle export for sharing with team
- Clear localStorage periodically to free space

---

_For detailed documentation, see `GAME_LOGS_README.md`_
