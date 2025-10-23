# Debug Info Panel - Shortcuts Update

## Summary

Updated the Debug Info Panel to remove redundant sections and add quick-access shortcuts to all debug test UI panels.

## Changes Made

### Debug Info Panel (`src/ui/DebugInfoPanel.ts`)

**Removed:**
- 🧟 Zombie Types section (moved to Bestiary)
- 📊 Game Stats section (redundant with other panels)

**Added:**
- 🔧 Debug Panels section with three shortcut buttons:
  - 🎨 Shader Test - Opens shader test panel
  - 📊 Wave Info - Opens wave info panel
  - 📖 Bestiary - Opens bestiary panel
- Callback methods for panel opening

**Result:**
- Panel height reduced from 580px to 420px
- Cleaner, more focused interface
- Direct access to all debug tools

### Wave Info Panel (`src/ui/WaveInfoPanel.ts`)

**Added:**
- `open()` method - Opens panel programmatically
- `close()` method - Closes panel programmatically

### Debug Test UI Manager (`src/managers/DebugTestUIManager.ts`)

**Added:**
- `openShaderTestPanel()` - Opens shader test panel
- `openWaveInfoPanel()` - Opens wave info panel
- `openBestiaryPanel()` - Opens bestiary panel

### Main Integration (`src/main.ts`)

**Added:**
- Connected Debug Info Panel callbacks to Debug Test UI Manager
- Enables one-click access to all debug panels

## User Experience

### Before
- Debug Info Panel showed zombie types and game stats
- Users had to find individual panel buttons scattered around screen
- Redundant information across multiple panels

### After
- Debug Info Panel is a central hub for debug tools
- One-click access to all specialized debug panels
- Each panel focuses on its specific purpose
- Cleaner, more organized debug interface

## Usage

1. **Open Debug Info Panel** - Click 🐛 Debug Info button (right side)
2. **Access Debug Tools** - Click any of the three shortcut buttons:
   - 🎨 Shader Test - Visual effects and shaders
   - 📊 Wave Info - Upcoming wave composition
   - 📖 Bestiary - Zombie encyclopedia and spawn testing

## Panel Layout

```
Right Side (Top to Bottom):
┌─────────────────────┐
│  Wave Info Panel    │ ← Direct access or via Debug Info
├─────────────────────┤
│  Bestiary Panel     │ ← Direct access or via Debug Info
├─────────────────────┤
│  Debug Info Panel   │ ← Central hub with shortcuts
└─────────────────────┘

Left Side:
┌─────────────────────┐
│  Shader Test Panel  │ ← Direct access or via Debug Info
└─────────────────────┘
```

## Benefits

✅ **Reduced Redundancy** - No duplicate information  
✅ **Better Organization** - Each panel has clear purpose  
✅ **Easier Access** - One-click to any debug tool  
✅ **Cleaner UI** - Smaller, focused panels  
✅ **Better UX** - Central hub for all debug features

## API Reference

### Debug Info Panel

```typescript
// Set callbacks for opening panels
debugInfoPanel.setShaderTestCallback(() => { ... });
debugInfoPanel.setWaveInfoCallback(() => { ... });
debugInfoPanel.setBestiaryCallback(() => { ... });
```

### Debug Test UI Manager

```typescript
// Open panels programmatically
debugTestUIManager.openShaderTestPanel();
debugTestUIManager.openWaveInfoPanel();
debugTestUIManager.openBestiaryPanel();
```

### Wave Info Panel

```typescript
// New methods
waveInfoPanel.open();  // Open panel
waveInfoPanel.close(); // Close panel
```

## Testing

To test the changes:

1. Enable debug mode: `DebugConstants.ENABLED = true`
2. Run the game: `npm run dev`
3. Click 🐛 Debug Info button (right side)
4. Click each shortcut button to verify panels open
5. Verify panels can still be opened via their direct buttons

## Bug Fixes

### Removed updateStats Call

**Issue**: Game crashed with `debugInfoPanel.updateStats is not a function`

**Fix**: Removed the `updateStats()` call from main.ts game loop since we removed the game stats section from the Debug Info Panel.

**Location**: `src/main.ts` line ~569

---

**Status**: ✅ Complete and tested
