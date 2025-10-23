# AI Test & Balance System

Complete documentation for Z-TD's AI player and game balancing system.

## Quick Start

1. **Enable AI**: Click robot icon (bottom left)
2. **Let it play**: AI auto-progresses waves
3. **Disable AI**: Click robot icon again
4. **Check logs**: Automatically downloaded to browser
5. **Save logs**: Move to `player_logs/` folder
6. **Analyze**: Use stats to balance game

## Documentation Files

### User Guides

**[AI_PLAYER_GUIDE.md](../../AI_PLAYER_GUIDE.md)**

- How to use the AI player
- AI strategy and behavior
- UI controls and console commands
- Performance logging details

**[GAME_LOGS_README.md](../../GAME_LOGS_README.md)**

- Log file format and structure
- Analysis examples (Python, JavaScript)
- Best practices for organizing logs
- Troubleshooting guide

### Developer Guides

**[BALANCING_STATS_GUIDE.md](./BALANCING_STATS_GUIDE.md)**

- Complete explanation of all metrics
- Balancing use cases for each stat
- Analysis workflows
- Common patterns and solutions
- Target values for each game phase

**[STATS_QUICK_REFERENCE.md](./STATS_QUICK_REFERENCE.md)**

- Quick lookup table of all metrics
- Target values at a glance
- Quick diagnosis guide
- Common metric combinations
- Analysis checklist

**[AI_IMPLEMENTATION_SUMMARY.md](./AI_IMPLEMENTATION_SUMMARY.md)**

- Technical implementation details
- Code structure and architecture
- Integration points

## Key Features

### AI Player

- ✅ Automatic tower placement (15 strategic zones)
- ✅ Smart tower selection (diverse composition)
- ✅ Intelligent upgrades (prioritizes high-value towers)
- ✅ Auto-wave progression (no delays)
- ✅ Floating UI control (robot icon)

### Statistics Collection

- ✅ 20+ tracked metrics
- ✅ Wave-by-wave analysis
- ✅ Economy tracking
- ✅ Tower composition analysis
- ✅ Upgrade distribution tracking
- ✅ Performance ratings

### Log Export

- ✅ Automatic export on AI disable
- ✅ Browser localStorage storage (100 logs)
- ✅ Batch export functionality
- ✅ Timestamped filenames
- ✅ AI/Manual indicators
- ✅ JSON format for analysis

## Tracked Statistics

### Core Metrics

- Session duration and timing
- Wave progression (highest reached)
- Economy (money earned, spent, peak)
- Survival (lives lost, survival rate, lowest point)

### Tower Metrics

- Towers built and upgraded
- Build rate (towers/minute)
- Tower composition (type distribution)
- Upgrade distribution (levels reached)

### Wave Analysis

- Completion times per wave
- Lives lost per wave
- Towers built per wave
- AI decisions per wave
- Average metrics

## Balancing Workflow

### 1. Baseline Testing

```bash
# Run 20 AI sessions
# Let AI play until game over
# Logs auto-export
```

### 2. Data Collection

```javascript
// Export all logs
LogExporter.exportAllLogs();
// Save to player_logs/baseline/
```

### 3. Analysis

- Load logs into spreadsheet
- Calculate averages
- Identify issues
- Prioritize changes

### 4. Make Changes

- Adjust one variable
- Document in git commit
- Keep changes small

### 5. Validation

```bash
# Run 20 more AI sessions
# Compare with baseline
# Verify improvements
```

### 6. Iterate

- Repeat for next issue
- Track changes over time
- Build historical data

## Console Commands

### AI Control

```javascript
gameManager.getAIPlayerManager().setEnabled(true);
gameManager.getAIPlayerManager().setEnabled(false);
gameManager.getAIPlayerManager().getStats();
```

### Log Management

```javascript
LogExporter.viewStoredLogs();
LogExporter.exportAllLogs();
LogExporter.exportAllLogsAsBundle();
LogExporter.getStoredLogCount();
LogExporter.clearAllLogs();
```

## File Structure

```
Z-TD/
├── player_logs/              # Save exported logs here
│   ├── .gitignore           # Ignores *.json files
│   └── README.md            # Usage instructions
├── design_docs/
│   └── AI_Test_Balance/
│       ├── README.md        # This file
│       ├── BALANCING_STATS_GUIDE.md
│       ├── STATS_QUICK_REFERENCE.md
│       └── AI_IMPLEMENTATION_SUMMARY.md
├── src/
│   ├── managers/
│   │   └── AIPlayerManager.ts
│   ├── ui/
│   │   └── AIControlPanel.ts
│   └── utils/
│       └── LogExporter.ts
├── AI_PLAYER_GUIDE.md
└── GAME_LOGS_README.md
```

## Target Performance

### Balanced Game

- AI reaches wave 10-15 consistently
- 70-85% survival rate
- Diverse tower composition (no single tower >50%)
- Smooth difficulty curve (no spikes)

### Too Easy

- AI reaches wave 20+ easily
- 95%+ survival rate
- Peak money >$2000
- Wave times <20s

### Too Hard

- AI fails before wave 5
- <50% survival rate
- Can't afford towers
- Wave times >60s

## Common Issues & Solutions

### Issue: AI Fails Early

**Check:**

- Starting money too low?
- Early zombies too strong?
- Tower costs too high?

**Fix:**

- Increase starting money 20%
- Reduce early zombie health 15%
- Reduce tower costs 10%

### Issue: AI Dominates Late Game

**Check:**

- Money rewards too high?
- Zombie scaling too slow?
- Tower upgrades too powerful?

**Fix:**

- Reduce money rewards 15%
- Increase zombie health scaling 20%
- Reduce upgrade effectiveness 10%

### Issue: One Tower Dominates

**Check:**

- Tower composition in logs
- Cost vs effectiveness ratio
- Upgrade scaling

**Fix:**

- Buff underused towers 20%
- Nerf overused tower 10%
- Adjust costs

## Best Practices

1. ✅ Run 10+ sessions before making changes
2. ✅ Change one variable at a time
3. ✅ Document all changes
4. ✅ Compare before/after data
5. ✅ Test edge cases manually
6. ✅ Keep historical logs
7. ✅ Use version control tags
8. ✅ Iterate quickly with small changes

## Future Enhancements

- [ ] Real-time stats dashboard
- [ ] Automated balance suggestions
- [ ] Machine learning integration
- [ ] Multiple AI difficulty levels
- [ ] A/B testing framework
- [ ] Cloud log storage
- [ ] Comparison visualization tools

## Support

For questions or issues:

1. Check the relevant guide above
2. Review example logs in `player_logs/`
3. Run `LogExporter.viewStoredLogs()` in console
4. Check AI behavior with debug logging

---

_Last Updated: Current Build_  
_For latest changes, see git history_
