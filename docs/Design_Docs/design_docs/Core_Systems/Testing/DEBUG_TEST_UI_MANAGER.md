# Debug Test UI Manager

## Overview

The `DebugTestUIManager` is a centralized manager that handles all debug and test UI panels in one unified system. It consolidates the shader test panel, wave info panel, and bestiary panel into a single, easy-to-manage interface.

## Purpose

Previously, debug panels were scattered throughout `main.ts` with individual initialization, positioning, and update logic. This manager centralizes all that logic, making it easier to:

- Add new debug panels
- Toggle all debug panels at once
- Maintain consistent positioning
- Update all panels in one place
- Clean up resources properly

## Managed Panels

### 1. Performance Stats Panel 📊

- **Location**: Left side, top
- **Purpose**: Real-time performance and game statistics
- **Features**:
  - Combat stats (damage, DPS, kills, accuracy)
  - Economy stats (income, expenses, efficiency)
  - Efficiency metrics (damage/dollar, kills/dollar)
  - Export report button
  - Collapsible interface
- **Access**: Via Debug Info Panel

### 2. Shader Test Panel 🎨

- **Location**: Bottom-left corner
- **Purpose**: Test and adjust retro shader effects
- **Features**:
  - Visual presets (Cinematic, Retro-Arcade, Horror, etc.)
  - Pixel art renderer toggle
  - Real-time shader parameter adjustment
- **Access**: Click button or via Debug Info Panel

### 3. Wave Info Panel 📊

- **Location**: Bottom-right corner
- **Purpose**: Display upcoming wave composition
- **Features**:
  - Current and next 3 waves
  - Zombie type breakdown
  - Spawn rates and percentages
  - Color-coded zombie types
- **Access**: Click button or via Debug Info Panel

### 4. Bestiary Panel 📖

- **Location**: Right side, below wave info panel
- **Purpose**: View all zombie types and spawn test zombies
- **Features**:
  - Complete zombie encyclopedia
  - Stats for each zombie type
  - Visual representations
  - Spawn test buttons for debugging
- **Access**: Click button or via Debug Info Panel

### 5. Debug Info Panel 🐛 (Integration Point)

- **Location**: Right side, below bestiary
- **Purpose**: Central hub for accessing all debug panels
- **Features**:
  - Quick access buttons to all debug panels
  - Debug keyboard shortcuts reference
  - Configuration file location
  - Auto-closes when a panel is selected
- **Note**: This panel provides shortcuts to open the other debug panels and automatically closes after selection for a cleaner UI

## Usage

### Initialization

```typescript
// In main.ts
const debugTestUIManager = new DebugTestUIManager(app);
debugTestUIManager.initialize(gameManager, waveManager, pixelArtRenderer);

// Set up zombie spawn callback
debugTestUIManager.setZombieSpawnCallback((type: string) => {
  gameManager.getZombieManager().spawnZombieType(type);
});
```

### Update Loop

```typescript
// In game loop
if (DebugConstants.ENABLED) {
  debugTestUIManager.update(deltaTime);
  debugTestUIManager.updateWaveInfo(gameManager.getWave());
}
```

### Toggle Visibility

```typescript
// Show all debug panels
debugTestUIManager.showAll();

// Hide all debug panels
debugTestUIManager.hideAll();

// Toggle all panels
debugTestUIManager.toggleAll();
```

### Access Individual Panels

```typescript
// Get panel references
const shaderPanel = debugTestUIManager.getShaderTestPanel();
const wavePanel = debugTestUIManager.getWaveInfoPanel();
const bestiary = debugTestUIManager.getBestiaryPanel();

// Open panels programmatically
debugTestUIManager.openShaderTestPanel();
debugTestUIManager.openWaveInfoPanel();
debugTestUIManager.openBestiaryPanel();
```

## Panel Positioning

Panels are automatically positioned to avoid overlap:

```
Left Side:                    Right Side:
┌─────────────────────┐      ┌─────────────────────┐
│ Performance Stats   │      │  Wave Info Panel    │
│     (Top)           │      ├─────────────────────┤
└─────────────────────┘      │  Bestiary Panel     │
                             ├─────────────────────┤
┌─────────────────────┐      │  Debug Info Panel   │
│  Shader Test Panel  │      └─────────────────────┘
│     (Bottom)        │
└─────────────────────┘
```

Each panel has a toggle button that's always visible, with the full panel content appearing on click.

## API Reference

### Constructor

```typescript
constructor(app: Application)
```

### Methods

#### `initialize(gameManager, waveManager, pixelArtRenderer)`

Initialize all debug panels with required dependencies.

#### `update(deltaTime: number)`

Update all visible panels (called every frame).

#### `updateWaveInfo(wave: number)`

Update wave info panel with current wave number.

#### `setZombieSpawnCallback(callback: (type: string) => void)`

Set callback for spawning zombies from bestiary.

#### `showAll()` / `hideAll()` / `toggleAll()`

Control visibility of all panels at once.

#### `getShaderTestPanel()` / `getWaveInfoPanel()` / `getBestiaryPanel()`

Get individual panel references for direct access.

#### `onResize()`

Reposition panels after window resize.

#### `dispose()`

Clean up all panels and resources.

## Benefits

### Before (Scattered in main.ts)

```typescript
// 60+ lines of panel initialization
const waveInfoPanel = new WaveInfoPanel();
waveInfoPanel.position.set(x, y);
uiManager.registerComponent('waveInfoPanel', waveInfoPanel);
app.stage.addChild(waveInfoPanel.getContentContainer());
waveInfoPanel.setWaveManager(waveManager);
// ... repeat for each panel

// Update logic scattered throughout
if (DebugConstants.ENABLED && waveInfoPanel.visible) {
  waveInfoPanel.updateCurrentWave(wave);
}
// ... repeat for each panel
```

### After (Centralized)

```typescript
// 3 lines of initialization
const debugTestUIManager = new DebugTestUIManager(app);
debugTestUIManager.initialize(gameManager, waveManager, pixelArtRenderer);
debugTestUIManager.setZombieSpawnCallback(spawnCallback);

// Single update call
debugTestUIManager.update(deltaTime);
debugTestUIManager.updateWaveInfo(wave);
```

## Debug Constants Integration

The manager respects `DebugConstants.ENABLED`:

- When `true`: All panels are visible by default
- When `false`: All panels are hidden by default

Users can still toggle individual panels regardless of the debug setting.

## Future Enhancements

Potential additions to the manager:

1. **Debug Info Panel** - Add FPS, memory, entity counts
2. **Performance Profiler** - Track frame times and bottlenecks
3. **Entity Inspector** - Click entities to view their properties
4. **Console Panel** - In-game console for commands
5. **Save/Load State** - Quick save/load for testing
6. **Keyboard Shortcuts** - Toggle panels with hotkeys

## Related Files

- **Manager**: `src/managers/DebugTestUIManager.ts`
- **Shader Panel**: `src/ui/ShaderTestPanel.ts`
- **Wave Info**: `src/ui/WaveInfoPanel.ts`
- **Bestiary**: `src/ui/ZombieBestiary.ts`
- **Integration**: `src/main.ts`

## Testing

To test the manager:

1. Enable debug mode: `DebugConstants.ENABLED = true`
2. Run the game: `npm run dev`
3. Verify all three panels appear on the left side
4. Click each toggle button to expand/collapse panels
5. Test shader effects, wave info updates, and zombie spawning

---

_Last Updated: Current Build_
