# Hotkey System Implementation

**Completed:** 2024 (Estimated)  
**Verification Status:** ✅ Verified - Feature is live in current codebase

## Overview

Implemented a comprehensive hotkey system for tower placement and game controls with centralized configuration for easy rebinding.

## Features

### Tower Placement Hotkeys

Quick tower selection via keyboard:

| Key   | Tower       | Description                 |
| ----- | ----------- | --------------------------- |
| **1** | Machine Gun | Rapid-fire tower            |
| **2** | Sniper      | High-damage precision tower |
| **3** | Shotgun     | Spread damage tower         |
| **4** | Flame       | Area damage tower           |
| **5** | Grenade     | Explosive area tower        |
| **6** | Tesla       | Chain lightning tower       |
| **7** | Sludge      | Slow/crowd control tower    |

### Game Control Hotkeys

| Key        | Action          | Description                     |
| ---------- | --------------- | ------------------------------- |
| **Space**  | Start Next Wave | Begin next zombie wave          |
| **Escape** | Cancel/Pause    | Cancel tower placement or pause |

### Visual Indicators

- Hotkey badges displayed on tower shop buttons
- Gold-colored key labels (e.g., "G", "T")
- Easy to see at a glance

## Implementation

### 1. Hotkey Configuration (`src/config/hotkeyConfig.ts`)

Centralized configuration file for all hotkeys with type-safe bindings categorized by function.

### 2. Input Manager Enhancement (`src/managers/InputManager.ts`)

Added keyboard input support:

```typescript
// Keyboard event handling
public onKeyDown(callback: (key: string, event: KeyboardEvent) => void): void
public onKeyUp(callback: (key: string, event: KeyboardEvent) => void): void
public isKeyPressed(key: string): boolean
```

**Features:**

- Prevents key repeat events
- Tracks pressed keys
- Prevents default browser shortcuts
- Debug logging support

### 3. Tower Shop Integration (`src/ui/TowerShop.ts`)

Added programmatic tower selection with visual hotkey badges on buttons and consistent behavior with mouse selection.

### 4. Main Game Loop Integration (`src/main.ts`)

Hotkey handling in game loop with game state checks, affordability validation, and automatic UI updates.

## Usage

### For Players

1. **Quick Tower Placement:**
   - Press hotkey (e.g., **5** for Grenade)
   - Move mouse to position
   - Click to place

2. **Cancel Placement:**
   - Press **Escape** or **Right Click**

3. **Start Wave:**
   - Press **Space** when wave is complete

## Technical Details

### Key Press Handling

1. **Key Down Event:**
   - Check if key already pressed (prevent repeat)
   - Add to pressed keys set
   - Call registered callbacks

2. **Key Up Event:**
   - Remove from pressed keys set
   - Call registered callbacks

3. **Prevent Default:**
   - Space (prevents page scroll)
   - Tab (prevents focus change)
   - Escape

### Affordability Check

Hotkeys automatically check if player can afford tower before starting placement.

### Visual Feedback

Hotkey badges on tower shop buttons:

- **Background:** Dark badge with gold border
- **Text:** Gold-colored key letter
- **Position:** Bottom-right of button
- **Size:** 32x24 pixels

## Performance

- **Minimal overhead:** Event listeners only
- **No polling:** Event-driven architecture
- **Efficient lookup:** O(1) key-to-tower mapping
- **Memory:** ~1KB for hotkey configuration

## Files Created/Modified

### Created:

- `src/config/hotkeyConfig.ts` - Hotkey configuration

### Modified:

- `src/managers/InputManager.ts` - Added keyboard support
- `src/ui/TowerShop.ts` - Added selectTower method and hotkey badges
- `src/main.ts` - Integrated hotkey handling

## Testing

Test the hotkey system:

1. **Tower Placement:**
   - Press **5** → Should select Grenade Tower
   - Press **6** → Should select Tesla Tower
   - Click to place → Should place tower

2. **Affordability:**
   - Press hotkey with insufficient funds
   - Should show debug message
   - Should not start placement

3. **Cancellation:**
   - Press hotkey to select tower
   - Press **Escape** → Should cancel
   - Press **Right Click** → Should cancel

4. **Visual Feedback:**
   - Check tower shop buttons
   - Should show hotkey badges
   - Should highlight selected tower

## Related Documentation

- [Input Manager](../../Core_Systems/README.md)
- [Tower Shop](../../Features/Towers/README.md)
- [UI Architecture](../../Features/UI/README.md)

---

**Status**: ✅ Complete
