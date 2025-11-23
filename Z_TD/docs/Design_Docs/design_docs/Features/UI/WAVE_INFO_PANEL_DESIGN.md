# Wave Info Panel - Debug Tool Design

## Overview

The Wave Info Panel is a debug tool that displays detailed information about the current wave and upcoming waves, showing exactly what zombie types will spawn, their quantities, and spawn rates.

## Features

### Toggle Button

- **Position**: Bottom-left corner (20px from left, 48px from bottom)
- **Size**: 120px × 30px
- **Color**: Yellow border (#ffcc00)
- **Text**: "📊 Wave Info"
- **Function**: Click to expand/collapse panel

### Main Panel

- **Size**: 320px × 600px
- **Position**: Centered on screen when expanded
- **Background**: Dark semi-transparent (#1a1a1a, 95% opacity)
- **Border**: 3px yellow (#ffcc00)
- **Style**: Matches apocalyptic RTS aesthetic

## Information Displayed

### Current Wave (Highlighted in Green)

Shows detailed breakdown of the active wave:

- **Wave Number**: "⚡ Wave X (Current)"
- **Total Zombies**: Total count after scaling
- **Zombie Composition**: Each type with:
  - Icon (emoji)
  - Type name
  - Count
  - Percentage of total
  - Spawn interval (seconds)
- **Difficulty Modifier**: If different from 100%

### Next 3 Waves

Shows preview of upcoming waves:

- **Wave Number**: "Wave X"
- **Total Zombies**: Projected count
- **Zombie Composition**: Same details as current wave
- **Color**: Yellow text

### Color-Coded Zombies

Each zombie type displays in its signature color:

- 🧟 **Basic**: Green (#00ff00)
- 🏃 **Fast**: Orange (#ff6600)
- 💪 **Tank**: Red (#ff0000)
- 🛡️ **Armored**: Gray (#888888)
- 🐝 **Swarm**: Yellow (#ffff00)
- 👻 **Stealth**: Purple (#6600ff)
- 🤖 **Mechanical**: Cyan (#00ffff)

### Legend

Bottom section shows color reference for all zombie types.

## Example Display

```
📊 Wave Information
Upcoming Wave Composition

⚡ Wave 6 (Current)
Total: 27 zombies

  🧟 Basic: 16 (59%)
    ↳ Spawn: 1.2s interval
  🏃 Fast: 8 (30%)
    ↳ Spawn: 1.7s interval
  💪 Tank: 3 (11%)
    ↳ Spawn: 2.8s interval

Wave 7
Total: 29 zombies

  🧟 Basic: 17 (59%)
    ↳ Spawn: 1.2s interval
  🏃 Fast: 9 (31%)
    ↳ Spawn: 1.6s interval
  💪 Tank: 3 (10%)
    ↳ Spawn: 2.7s interval

[... Wave 8 and 9 ...]

🎨 Zombie Colors:
  🧟 Basic
  🏃 Fast
  💪 Tank
  🛡️ Armored
  🐝 Swarm
  👻 Stealth
  🤖 Mechanical
```

## Technical Details

### Data Source

- Reads from `WaveManager` instance
- Accesses wave composition data
- Calculates adjusted counts based on:
  - Wave scaling (1.08^wave)
  - Difficulty modifier
  - 20% spikes every 5 waves

### Update Frequency

- Updates when wave changes
- Only updates when panel is visible
- Efficient - no per-frame updates

### Calculations Shown

1. **Adjusted Count**: `baseCount × (1.08^wave) × difficultyMod`
2. **Percentage**: `(zombieCount / totalZombies) × 100`
3. **Spawn Rate**: `baseInterval × (0.95^wave) × difficultyMod`

## Usage

### Opening the Panel

1. Enable debug mode (DebugConstants.ENABLED = true)
2. Click "📊 Wave Info" button in bottom-left
3. Panel expands to show wave information

### Reading the Data

- **Current Wave**: Green highlight, shows active spawns
- **Upcoming Waves**: Yellow text, shows what's coming
- **Percentages**: Quick understanding of wave composition
- **Spawn Rates**: Timing information for spawn patterns

### Strategic Use

- **Plan Tower Placement**: See what's coming
- **Upgrade Decisions**: Prepare for specific threats
- **Resource Management**: Know when to save/spend
- **Tower Type Selection**: Counter upcoming zombie types

## Integration

### With Debug System

- Part of debug tools suite
- Positioned opposite Debug Info Panel
- Same toggle button style
- Consistent visual design

### With Game Manager

- Receives WaveManager reference
- Updates on wave changes
- Reads current wave number
- Accesses difficulty modifier

### With UI System

- Registered as UI component
- Content container added to stage
- Visibility controlled by debug constants
- Responsive to game state

## Design Consistency

### Visual Style

- Matches Debug Info Panel aesthetic
- Yellow accent color (#ffcc00)
- Dark background with transparency
- Rounded corners (10px radius)
- Bold headers with Impact font

### Typography

- **Headers**: Impact/Arial Black, 14-18px
- **Body**: Courier New (monospace), 11px
- **Details**: Arial, 9-11px
- **Icons**: Emoji for visual clarity

### Color Scheme

- **Primary**: Yellow (#ffcc00)
- **Background**: Dark gray (#1a1a1a)
- **Text**: White/gray (#ffffff, #cccccc)
- **Zombie Colors**: Type-specific colors
- **Highlights**: Green for current wave

## Performance

### Optimization

- Static text rendering
- Updates only on wave change
- Lazy loading of wave data
- Efficient text recycling

### Memory Management

- Destroys old text objects
- Clears arrays on update
- No memory leaks
- Minimal overhead

## Future Enhancements

Potential additions:

1. **Wave Timeline**
   - Visual timeline of waves
   - Progress indicator
   - Time estimates

2. **Zombie Stats**
   - Health values
   - Damage values
   - Speed information

3. **Threat Assessment**
   - Danger rating per wave
   - Recommended tower types
   - Difficulty warnings

4. **Historical Data**
   - Past wave performance
   - Kill rates
   - Survival statistics

5. **Export Function**
   - Copy wave data
   - Share compositions
   - Save for reference

## Keyboard Shortcuts

Suggested shortcuts (not yet implemented):

- **W**: Toggle Wave Info Panel
- **Shift+W**: Pin panel open
- **Ctrl+W**: Export wave data

## Accessibility

- High contrast colors
- Clear typography
- Logical information hierarchy
- Color-blind friendly icons (emojis)

---

_Last Updated: Current Build_  
_For implementation details, see `src/ui/WaveInfoPanel.ts`_
