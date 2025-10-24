# Hotkey System Implementation

## Overview

Implemented a comprehensive hotkey system for tower placement and game controls with centralized configuration for easy rebinding.

## Features

### Tower Placement Hotkeys

Quick tower selection via keyboard:

| Key | Tower | Description |
|-----|-------|-------------|
| **M** | Machine Gun | Rapid-fire tower |
| **S** | Sniper | High-damage precision tower |
| **H** | Shotgun | Spread damage tower |
| **F** | Flame | Area damage tower |
| **G** | Grenade | Explosive area tower |
| **T** | Tesla | Chain lightning tower |
| **L** | Sludge | Slow/crowd control tower |

### Game Control Hotkeys

| Key | Action | Description |
|-----|--------|-------------|
| **Space** | Start Next Wave | Begin next zombie wave |
| **Escape** | Cancel/Pause | Cancel tower placement or pause |

### Visual Indicators

- Hotkey badges displayed on tower shop buttons
- Gold-colored key labels (e.g., "G", "T")
- Easy to see at a glance

## Implementation

### 1. Hotkey Configuration (`src/config/hotkeyConfig.ts`)

Centralized configuration file for all hotkeys:

```typescript
export const TOWER_HOTKEYS: Record<string, TowerHotkey> = {
  G: {
    key: 'G',
    towerType: GameConfig.TOWER_TYPES.GRENADE,
    description: 'Grenade Tower',
    category: 'tower',
  },
  T: {
    key: 'T',
    towerType: GameConfig.TOWER_TYPES.TESLA,
    description: 'Tesla Tower',
    category: 'tower',
  },
  // ... more hotkeys
};
```

**Benefits:**
- Easy to rebind keys
- Centralized configuration
- Type-safe bindings
- Categorized by function

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

Added programmatic tower selection:

```typescript
public selectTower(type: string): void {
  // Clear previous selection
  this.clearSelection();
  
  // Select new tower
  // Update visuals
  // Trigger callback
}
```

**Features:**
- Visual hotkey badges on buttons
- Programmatic selection support
- Consistent with mouse selection

### 4. Main Game Loop Integration (`src/main.ts`)

Hotkey handling in game loop:

```typescript
inputManager.onKeyDown((key, event) => {
  // Tower placement hotkeys
  const towerType = getTowerTypeFromKey(key);
  if (towerType) {
    // Check affordability
    // Start placement
    // Update UI
  }
  
  // Game control hotkeys
  // ...
});
```

**Features:**
- Checks game state
- Validates affordability
- Cancels previous placement
- Updates UI automatically

## Usage

### For Players

1. **Quick Tower Placement:**
   - Press hotkey (e.g., **G** for Grenade)
   - Move mouse to position
   - Click to place

2. **Cancel Placement:**
   - Press **Escape** or **Right Click**

3. **Start Wave:**
   - Press **Space** when wave is complete

### For Developers

#### Rebinding Hotkeys

Edit `src/config/hotkeyConfig.ts`:

```typescript
export const TOWER_HOTKEYS: Record<string, TowerHotkey> = {
  // Change 'G' to '1' for Grenade Tower
  '1': {
    key: '1',
    towerType: GameConfig.TOWER_TYPES.GRENADE,
    description: 'Grenade Tower',
    category: 'tower',
  },
};
```

#### Adding New Hotkeys

1. Add to `hotkeyConfig.ts`:
```typescript
export const GAME_HOTKEYS: Record<string, HotkeyBinding> = {
  R: {
    key: 'R',
    description: 'Restart Wave',
    category: 'game',
  },
};
```

2. Handle in `main.ts`:
```typescript
inputManager.onKeyDown((key, event) => {
  if (key === 'R') {
    // Restart wave logic
  }
});
```

#### Utility Functions

```typescript
// Get tower type from key
const towerType = getTowerTypeFromKey('G'); // Returns GRENADE

// Get hotkey for tower type
const hotkey = getHotkeyForTowerType(GameConfig.TOWER_TYPES.TESLA); // Returns 'T'

// Check if key is tower hotkey
const isTower = isTowerHotkey('G'); // Returns true

// Format hotkey for display
const formatted = formatHotkey(' '); // Returns 'Space'
```

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

Hotkeys automatically check if player can afford tower:

```typescript
const cost = gameManager.getTowerManager().getTowerCost(towerType);
if (gameManager.getMoney() >= cost) {
  // Start placement
} else {
  // Show debug message
}
```

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

## Future Enhancements

Potential improvements:

1. **Customizable Hotkeys:**
   - UI for rebinding keys
   - Save preferences to localStorage
   - Import/export key bindings

2. **Hotkey Hints:**
   - Tooltip showing hotkey on hover
   - Help screen with all hotkeys
   - Tutorial highlighting hotkeys

3. **Advanced Hotkeys:**
   - Modifier keys (Ctrl, Shift, Alt)
   - Hotkey combos (Ctrl+G)
   - Context-sensitive hotkeys

4. **Accessibility:**
   - Configurable key repeat delay
   - Alternative input methods
   - Screen reader support

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
   - Press **G** → Should select Grenade Tower
   - Press **T** → Should select Tesla Tower
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

## Conclusion

The hotkey system provides quick, efficient tower placement with minimal code changes. The centralized configuration makes it easy to rebind keys or add new hotkeys in the future.

**Key Benefits:**
- ✅ Fast tower placement (1 keypress vs 1 click)
- ✅ Easy to rebind keys
- ✅ Visual hotkey indicators
- ✅ Consistent with existing UI
- ✅ Minimal performance impact
