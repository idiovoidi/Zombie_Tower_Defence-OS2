# Performance Stats Panel Integration

## Summary

Moved the Performance Stats Panel to be managed by DebugTestUIManager and added a shortcut button in the Debug Info Panel for easy access.

## Changes Made

### DebugTestUIManager (`src/managers/DebugTestUIManager.ts`)

**Added:**

- Import for `StatsPanel` and `GameManager` type
- `statsPanel` private field
- `createStatsPanel()` method
- Stats panel positioning in `layoutPanels()`
- Stats panel update in `update()` method
- Stats panel show/hide in `showAll()`/`hideAll()`
- `getStatsPanel()` getter method
- `openStatsPanel()` method
- Stats panel cleanup in `dispose()`

**Result:**

- Stats panel now centrally managed
- Positioned at left side, top (10, 100)
- Updates automatically with other debug panels

### Debug Info Panel (`src/ui/DebugInfoPanel.ts`)

**Added:**

- `onOpenStats` callback field
- `setStatsCallback()` method
- Performance Stats button (first in list, green color)
- Panel height increased to 460px to accommodate new button

### Main Integration (`src/main.ts`)

**Removed:**

- `StatsPanel` import
- Manual stats panel creation and positioning
- `uiManager.registerComponent('statsPanel', ...)` call

**Added:**

- `setStatsCallback()` connection to debug test UI manager

## Benefits

✅ **Centralized Management** - All debug panels in one place
✅ **Consistent Access** - Via Debug Info Panel like other tools  
✅ **Reduced Boilerplate** - No manual positioning in main.ts  
✅ **Better Organization** - Part of unified debug system

## Panel Order in Debug Info

1. 📊 **Performance Stats** (Green) - Real-time metrics
2. 🎨 **Shader Test** (Purple) - Visual effects
3. 📊 **Wave Info** (Yellow) - Wave composition
4. 📖 **Bestiary** (Red) - Zombie encyclopedia

## Usage

```typescript
// Open via Debug Info Panel
// 1. Click 🐛 Debug Info button
// 2. Click 📊 Performance Stats button

// Or programmatically
debugTestUIManager.openStatsPanel();

// Get panel reference
const statsPanel = debugTestUIManager.getStatsPanel();
```

## Testing

1. Enable debug mode: `DebugConstants.ENABLED = true`
2. Run game: `npm run dev`
3. Click 🐛 Debug Info button (right side)
4. Click 📊 Performance Stats button
5. Verify stats panel appears on left side
6. Verify stats update in real-time

---

**Status**: ✅ Complete
