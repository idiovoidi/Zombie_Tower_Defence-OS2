# Shotgun Tower - Double Barrel Burst Fire

## Overview

The shotgun tower now features a realistic double-barrel burst fire mechanic. It fires two quick shots in succession, then requires a reload period before the next burst.

## Burst Fire Mechanics

### Timing

- **Shot 1:** Fires immediately when target is in range
- **Burst Delay:** 150ms between first and second shot
- **Shot 2:** Fires 150ms after first shot
- **Reload Delay:** 1.25 seconds (1,250ms) after second shot
- **Total Cycle:** ~1.4 seconds per burst

### Behavior

```
[READY] → [SHOT 1] → 150ms → [SHOT 2] → 1.25s → [READY]
   ↑                                              ↓
   └──────────────────────────────────────────────┘
```

### States

1. **Ready:** Tower can start a new burst
2. **Burst (Shot 1):** First barrel fired
3. **Burst (Shot 2):** Second barrel fired (150ms later)
4. **Reloading:** Cannot fire for 1.25 seconds

## Implementation Details

### ShotgunTower Class

```typescript
private burstCount: number = 0;              // Current shot in burst (0-2)
private readonly shotsPerBurst: number = 2;  // Double barrel
private readonly burstDelay: number = 150;   // 150ms between shots
private readonly reloadDelay: number = 1250; // 1.25s reload
private lastBurstShotTime: number = 0;       // Timing tracker
private isReloading: boolean = false;        // Reload state
```

### canShoot() Logic

1. **If Reloading:** Check if reload time has elapsed
2. **If In Burst:** Check if burst delay has elapsed
3. **If Burst Complete:** Enter reload state
4. **Otherwise:** Ready to start new burst

### shoot() Logic

1. Call parent shoot() method
2. Increment burst counter
3. Track shot timing
4. Log barrel fired (for debugging)

## Gameplay Impact

### Damage Output

- **Per Shot:** 60 damage (split among 7 pellets = ~8.6 per pellet)
- **Per Burst:** 120 damage total (14 pellets)
- **Effective DPS:** ~85 DPS (120 damage / 1.4s cycle)

### Comparison to Old System

**Before (0.8 shots/sec):**

- 60 damage every 1.25 seconds
- 48 DPS
- Consistent fire rate

**After (Burst Fire):**

- 120 damage every 1.4 seconds
- 85 DPS (+77% increase!)
- Bursty damage pattern

### Tactical Advantages

✅ **Higher burst damage** - Can quickly eliminate weak enemies
✅ **Better against groups** - Two shots hit more targets
✅ **Realistic feel** - Matches double-barrel shotgun behavior
✅ **Reload timing** - Creates tactical decision points

### Tactical Disadvantages

⚠️ **Reload vulnerability** - 1.25s window where tower can't fire
⚠️ **Wasted shots** - If target dies after first shot, second shot may miss
⚠️ **Timing dependent** - Less consistent than steady fire rate

## Visual Feedback

### Recommended Additions (Future)

1. **Barrel Smoke:** Show smoke from both barrels after burst
2. **Shell Ejection:** Eject two shells during reload
3. **Reload Animation:** Show character reloading animation
4. **Audio:** Distinct sounds for each shot and reload
5. **UI Indicator:** Show reload progress bar

## Balance Considerations

### Strengths

- 77% higher DPS than before
- Excellent burst damage
- Good against clustered enemies
- Realistic and satisfying

### Potential Issues

- May be too strong with 77% DPS increase
- Reload timing might feel awkward
- Could dominate early game

### Recommended Adjustments

If too strong:

1. Increase reload delay to 1.5s (reduces DPS to 75)
2. Reduce damage per shot to 55 (reduces DPS to 78)
3. Increase burst delay to 200ms (reduces DPS to 82)

If too weak:

1. Reduce reload delay to 1.0s (increases DPS to 100)
2. Add third shot (triple barrel) for 180 damage bursts
3. Reduce burst delay to 100ms (increases DPS to 92)

## Testing

### Test File

**File:** `test-shotgun-burst.html`

**Features:**

- Visual status indicator (Ready/Firing/Reloading)
- Shot counter and burst tracker
- Timing display
- Real-time combat demonstration

**How to Test:**

1. Open http://localhost:8081/test-shotgun-burst.html
2. Watch the shotgun tower engage zombies
3. Observe the burst pattern:
   - Green indicator: Ready
   - Orange indicator: Firing
   - Red indicator: Reloading
4. Check timing display for burst/reload status

### Expected Behavior

- Tower fires first shot immediately
- Second shot fires 150ms later
- Tower enters reload for 1.25s
- Cycle repeats

## Code Changes

### Files Modified

1. **src/objects/towers/ShotgunTower.ts**
   - Added burst fire state tracking
   - Overrode `canShoot()` method
   - Overrode `shoot()` method
   - Added `destroy()` cleanup

2. **src/config/towerConstants.ts**
   - Updated special ability description

### Compatibility

- ✅ Works with existing projectile system
- ✅ Compatible with tower upgrades
- ✅ No changes needed to combat manager
- ✅ Maintains cone spread mechanic

## Future Enhancements

### Possible Additions

1. **Pump Action:** Add pump animation between bursts
2. **Shell Types:** Different ammo types (buckshot, slug, etc.)
3. **Reload Speed Upgrades:** Reduce reload time at higher levels
4. **Triple Barrel:** Add third shot at max upgrade level
5. **Reload Cancel:** Allow manual reload before burst complete

### Visual Improvements

1. **Muzzle Flash:** Larger flash for shotgun blasts
2. **Recoil Animation:** Tower rocks back with each shot
3. **Smoke Effects:** Lingering smoke after burst
4. **Shell Casings:** Visible ejected shells
5. **Reload Progress:** Visual indicator during reload

## Performance Notes

### Optimization

- Burst state tracked with simple counters
- No additional timers or intervals
- Minimal memory overhead
- No performance impact on other towers

### Edge Cases Handled

- Tower destroyed during burst: State reset
- Target dies during burst: Second shot still fires
- Multiple targets: Burst continues normally
- Upgrade during burst: State maintained

## Conclusion

The double-barrel burst fire mechanic makes the shotgun tower feel more realistic and powerful. The 77% DPS increase is significant but balanced by the reload vulnerability. The bursty damage pattern creates interesting tactical gameplay and rewards good positioning.

**Key Takeaway:** The shotgun tower is now a high-risk, high-reward option that excels at quickly eliminating groups of weak enemies but has a vulnerable reload window.
