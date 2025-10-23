# AI Control Panel Integration

## Summary

Integrated the AI Control Panel into the DebugTestUIManager and added a shortcut button in the Debug Info Panel for easy access.

## Changes Made

### DebugTestUIManager (`src/managers/DebugTestUIManager.ts`)

**Added:**

- Import for `AIControlPanel`
- `aiControlPanel` private field
- `createAIControlPanel()` method
- AI panel positioning in `layoutPanels()` (left side, above shader test)
- AI panel update in `update()` method
- AI panel show/hide in `showAll()`/`hideAll()`
- `getAIControlPanel()` getter method
- `openAIControlPanel()` method
- `setAIToggleCallback()` method to wire up AI toggle
- AI panel cleanup in `dispose()`

**Result:**

- AI Control Panel now centrally managed
- Positioned at left side, above shader test panel (20, screenHeight - 230)
- Updates automatically with other debug panels

### Debug Info Panel (`src/ui/DebugInfoPanel.ts`)

**Added:**

- `onOpenAIControl` callback field
- `setAIControlCallback()` method
- AI Control button (5th button, cyan/blue color)
- Panel height increased to 500px to accommodate new button

### Main Integration (`src/main.ts`)

**Removed:**

- `AIControlPanel` import
- Manual AI control panel creation and positioning
- `uiManager.registerComponent('aiControlPanel', ...)` call
- Direct `aiControlPanel.setToggleCallback()` call

**Added:**

- `setAIControlCallback()` connection to debug test UI manager
- `setAIToggleCallback()` on debug test UI manager

## Panel Order in Debug Info

1. 📊 **Performance Stats** (Green)
2. 🎨 **Shader Test** (Purple)
3. 📊 **Wave Info** (Yellow)
4. 📖 **Bestiary** (Red)
5. 🤖 **AI Control** (Cyan/Blue) - NEW

## Panel Layout

```
Left Side:                    Right Side:
┌─────────────────────┐      ┌─────────────────────┐
│  AI Control Panel   │      │  Wave Info Panel    │
│   (Top-Left)        │      ├─────────────────────┤
└─────────────────────┘      │  Bestiary Panel     │
                             ├─────────────────────┤
┌─────────────────────┐      │  Debug Info Panel   │
│ Performance Stats   │      └─────────────────────┘
│   (Below AI)        │
└─────────────────────┘

┌─────────────────────┐
│  Shader Test Panel  │
│     (Bottom)        │
└─────────────────────┘
```

## Usage

```typescript
// Toggle visibility via Debug Info Panel
// 1. Click 🐛 Debug Info button
// 2. Click 🤖 AI Control button (toggles show/hide)

// Or programmatically (toggles visibility)
debugTestUIManager.openAIControlPanel();

// Get panel reference
const aiPanel = debugTestUIManager.getAIControlPanel();

// Set AI toggle callback
debugTestUIManager.setAIToggleCallback(enabled => {
  console.log(`AI ${enabled ? 'enabled' : 'disabled'}`);
});
```

## Benefits

✅ **Centralized Management** - All debug panels in one system
✅ **Consistent Access** - Via Debug Info Panel like other tools
✅ **Reduced Boilerplate** - No manual positioning in main.ts
✅ **Better Organization** - Part of unified debug system
✅ **Easy Toggle** - Quick access to enable/disable AI player
✅ **Visibility Control** - Show/hide AI button via Debug Info shortcut

## Testing

1. Enable debug mode: `DebugConstants.ENABLED = true`
2. Run game: `npm run dev`
3. Click 🐛 Debug Info button (right side)
4. Click 🤖 AI Control button
5. Verify AI Control Panel appears on left side
6. Click the AI button to toggle AI on/off
7. Verify AI player activates/deactivates

---

**Status**: ✅ Complete
