# Debug Hotkeys Reference

## Overview

Debug hotkeys provide quick access to testing features during development. These hotkeys only work when `DebugConstants.ENABLED` is set to `true` in `src/config/debugConstants.ts`.

---

## Enabling Debug Mode

In `src/config/debugConstants.ts`:

```typescript
export const DebugConstants = {
  ENABLED: true, // Set to true to enable debug hotkeys
  // ... other settings
};
```

---

## Available Hotkeys

### 💰 M - Add Money

**Press:** `M`  
**Shift+M:** Add more money

- **M**: Adds $1,000
- **Shift+M**: Adds $10,000

**Console Output:** `💰 Added $1000 (Total: $2500)`

**Use Case:** Testing tower purchases, upgrades, and economy balance

---

### ❤️ L - Add Lives

**Press:** `L`  
**Shift+L:** Add more lives

- **L**: Adds 10 lives
- **Shift+L**: Adds 100 lives

**Console Output:** `❤️ Added 10 lives (Total: 110)`

**Use Case:** Testing without worrying about game over, stress testing waves

---

### 🪵 W - Add Wood

**Press:** `W`  
**Shift+W:** Add more wood

- **W**: Adds 100 wood
- **Shift+W**: Adds 1,000 wood

**Console Output:** `🪵 Added 100 wood`

**Use Case:** Testing resource-based features, camp upgrades

---

### ⚙️ E - Add Metal

**Press:** `E`  
**Shift+E:** Add more metal

- **E**: Adds 100 metal
- **Shift+E**: Adds 1,000 metal

**Console Output:** `⚙️ Added 100 metal`

**Use Case:** Testing advanced tower upgrades, special features

---

### ⚡ R - Add Energy

**Press:** `R`  
**Shift+R:** Add more energy

- **R**: Adds 100 energy
- **Shift+R**: Adds 1,000 energy

**Console Output:** `⚡ Added 100 energy`

**Use Case:** Testing energy-dependent systems

---

### 🌊 N - Skip to Next Wave

**Press:** `N`

- Immediately starts the next wave
- Only works during "Wave Complete" state
- Bypasses the wave complete screen

**Console Output:** `🌊 Started next wave`

**Use Case:** Quickly testing multiple waves, skipping wait times

---

### 💀 K - Kill All Zombies

**Press:** `K`

- Instantly kills all active zombies on the map
- Awards money and updates stats as normal
- Useful for quickly completing waves

**Console Output:** `💀 Killed 15 zombies`

**Use Case:** Testing wave completion, economy rewards, quickly progressing

---

### ⬆️ U - Upgrade All Towers

**Press:** `U`

- Upgrades all placed towers to maximum level
- Applies all stat bonuses
- Updates visuals to show max upgrade stars

**Console Output:** `⬆️ Upgraded 12 tower levels`

**Use Case:** Testing max-level tower performance, visual effects

---

### 🔧 H - Show Debug Help

**Press:** `H`

- Displays all available debug hotkeys in console
- Quick reference without leaving the game

**Console Output:**

```
🔧 Debug Hotkeys:
  M - Add $1000 (Shift+M for $10000)
  L - Add 10 lives (Shift+L for 100)
  W - Add 100 wood (Shift+W for 1000)
  E - Add 100 metal (Shift+E for 1000)
  R - Add 100 energy (Shift+R for 1000)
  N - Skip to next wave
  K - Kill all zombies
  U - Upgrade all towers to max
  H - Show this help
```

---

## Other Debug Features

### Ctrl+D - Toggle Debug Mode

**Press:** `Ctrl+D`

- Toggles input debug mode
- Shows coordinate transformations in console
- Useful for debugging input/scaling issues

**Console Output:** `🔧 Debug mode enabled: {...}`

---

## Quick Testing Workflows

### Testing Tower Effectiveness

1. Press `M` (Shift+M) to get money
2. Place towers
3. Press `U` to max upgrade them
4. Start wave and observe performance

### Testing Wave Difficulty

1. Press `L` (Shift+L) to get extra lives
2. Press `N` to skip through waves quickly
3. Observe zombie difficulty scaling

### Testing Economy Balance

1. Play normally but use `K` to quickly complete waves
2. Observe money accumulation
3. Test if tower costs are balanced

### Testing Late Game

1. Press `M` repeatedly to get money
2. Build full tower setup
3. Press `U` to max everything
4. Press `N` to skip to late waves
5. Test if defenses hold up

---

## Configuration

### Customizing Hotkey Amounts

Edit `src/main.ts` to change the amounts:

```typescript
// M - Add money
if (key === 'm') {
  const amount = event.shiftKey ? 10000 : 1000; // Change these values
  gameManager.addMoney(amount);
}
```

### Adding New Hotkeys

Add new hotkeys in the same keyboard event listener:

```typescript
// Example: T - Add all resources
if (key === 't') {
  gameManager.addMoney(5000);
  gameManager.addResources(500, 500, 500);
  console.log('💎 Added all resources');
}
```

---

## Troubleshooting

### Hotkeys Not Working

**Check:**

1. `DebugConstants.ENABLED` is `true` in `src/config/debugConstants.ts`
2. You're in the game (not main menu)
3. No input fields are focused
4. Console shows no errors

### Wrong Amounts

**Solution:** Check if you're holding Shift for larger amounts

### "Can only skip to next wave during wave complete state"

**Solution:** Wait for wave to complete, or press `K` to kill all zombies first

---

## Best Practices

### During Development

✅ **DO:**

- Use hotkeys to quickly test specific scenarios
- Combine hotkeys for efficient testing
- Use `H` to remind yourself of available keys

❌ **DON'T:**

- Leave debug mode enabled in production builds
- Rely on hotkeys for normal gameplay testing
- Forget to test without debug features enabled

### Before Release

1. Set `DebugConstants.ENABLED = false`
2. Test game without any debug features
3. Verify hotkeys don't work in production
4. Remove or comment out debug code if needed

---

## Implementation Details

### Location

All debug hotkeys are implemented in `src/main.ts` in the keyboard event listener starting around line 413.

### Dependencies

- `GameManager` - For resource management
- `TowerCombatManager` - For tower access
- `ZombieManager` - For zombie access
- `WaveManager` - For wave control
- `DebugConstants` - For enable/disable flag

### Code Structure

```typescript
window.addEventListener('keydown', event => {
  if (DebugConstants.ENABLED) {
    const key = event.key.toLowerCase();

    if (key === 'm') {
      // Add money logic
    }
    // ... more hotkeys
  }
});
```

---

## Future Enhancements

### Potential Additions

- **T** - Teleport zombies to end of path
- **S** - Slow down/speed up game time
- **G** - Toggle god mode (invincible towers)
- **F** - Spawn specific zombie type
- **P** - Pause/unpause game
- **O** - Toggle tower ranges always visible
- **I** - Toggle zombie info display

### Advanced Features

- Hotkey customization UI
- Save/load debug states
- Replay system with hotkey controls
- Performance profiling hotkeys

---

## Status

✅ **Implemented**

- All basic resource hotkeys (M, L, W, E, R)
- Wave control (N, K)
- Tower upgrades (U)
- Help display (H)

🔄 **Planned**

- More advanced testing features
- Customizable hotkey bindings
- Debug UI panel with buttons

---

**Last Updated:** Current Build  
**Status:** Fully Functional  
**Location:** `src/main.ts` (line ~413)
