# Zombie Visual Effects - Usage Example

## Quick Start

The blood particle and corpse systems are automatically integrated into the `ZombieManager`. When a zombie dies, both effects trigger automatically.

## Manual Usage

If you need to trigger effects manually:

### Blood Splatter Effect

```typescript
import { BloodParticleSystem } from '@utils/BloodParticleSystem';

// Create the system
const bloodSystem = new BloodParticleSystem(gameContainer);

// Trigger blood splatter at a position
bloodSystem.createBloodSplatter(x, y, intensity);

// Update in your game loop
function gameLoop(deltaTime: number) {
  bloodSystem.update(deltaTime);
}

// Clean up when done
bloodSystem.clear();
```

### Corpse System

```typescript
import { CorpseManager } from '@managers/CorpseManager';

// Create the manager
const corpseManager = new CorpseManager(gameContainer);

// Create a corpse when zombie dies
corpseManager.createCorpse(x, y, zombieType, size);

// Update in your game loop
function gameLoop(deltaTime: number) {
  corpseManager.update(deltaTime);
}

// Optional: Adjust max corpses
corpseManager.setMaxCorpses(100);

// Clean up when done
corpseManager.clear();
```

## Integration with ZombieManager

The systems are already integrated. Just use `ZombieManager` normally:

```typescript
import { ZombieManager } from '@managers/ZombieManager';

const zombieManager = new ZombieManager(container, waveManager, mapManager);

// Start a wave - zombies will automatically show effects when they die
zombieManager.startWave();

// Update in game loop
function gameLoop(deltaTime: number) {
  zombieManager.update(deltaTime); // Updates zombies, blood, and corpses
}
```

## Customization

### Adjust Blood Intensity

The intensity parameter controls how many particles spawn:
- `1.0` = Normal (15 particles)
- `2.0` = Double (30 particles)
- `0.5` = Half (7-8 particles)

Intensity is automatically scaled based on zombie size in the default integration.

### Adjust Corpse Fade Time

Edit the `maxFadeTime` property in `CorpseManager.createCorpse()`:

```typescript
// In CorpseManager.ts
const corpse: Corpse = {
  graphics: new Graphics(),
  fadeTimer: 0,
  maxFadeTime: 10, // Change from 5 to 10 seconds
};
```

### Adjust Max Corpses

```typescript
corpseManager.setMaxCorpses(25); // Reduce for better performance
corpseManager.setMaxCorpses(100); // Increase for more visual persistence
```

## Performance Tips

1. **Corpse Limit**: Keep max corpses between 25-50 for best performance
2. **Blood Intensity**: Use lower intensity (0.5-1.0) on mobile devices
3. **Cleanup**: Both systems auto-cleanup, but call `clear()` when changing levels
4. **Update Frequency**: Both systems need `update(deltaTime)` called each frame

## Visual Customization

### Change Blood Colors

Edit the `bloodColors` array in `BloodParticleSystem.createBloodSplatter()`:

```typescript
const bloodColors = [0x8b0000, 0xa00000, 0xb00000, 0xc00000]; // Dark to bright red
```

### Change Corpse Appearance

Edit the `drawCorpse()` method in `CorpseManager` to customize corpse visuals.

### Change Zombie Colors

Edit the `getZombieColor()` method in `CorpseManager` to match your zombie visual style.

## Testing

Both systems include comprehensive tests:

```bash
npm test -- BloodParticleSystem.test.ts
npm test -- CorpseManager.test.ts
```

## Example: Custom Death Effect

```typescript
// Listen for zombie death events
zombie.on('zombieDeath', (data) => {
  // Custom blood effect
  bloodSystem.createBloodSplatter(data.x, data.y, 2.0); // Extra intense
  
  // Custom corpse
  corpseManager.createCorpse(data.x, data.y, data.type, data.size);
  
  // Add custom effects
  playDeathSound();
  shakeScreen();
});
```
