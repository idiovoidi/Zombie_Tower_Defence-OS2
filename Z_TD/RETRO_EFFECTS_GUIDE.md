# Retro Visual Effects Guide

## Overview

Your game now has multiple options for retro visual effects using PixiJS v8. Here are your options from simplest to most advanced:

## Option 1: Simple Retro Filter (Recommended) ✅

**File:** `src/ui/shaders/filters/SimpleRetroFilter.ts`

This is a working, tested filter that provides:
- **Pixelation effect** - Makes the game look like old pixel art
- **Scanlines** - Horizontal lines like old CRT monitors
- **Subtle flicker** - Slight screen flicker for authenticity

### Usage:

```typescript
import { SimpleRetroFilter } from './ui/shaders/filters/SimpleRetroFilter';

// Create the filter
const retroFilter = new SimpleRetroFilter({
  pixelSize: 3,              // Size of pixels (1 = no pixelation, 4 = chunky)
  scanlineIntensity: 0.3,    // Scanline darkness (0 = none, 1 = very dark)
  enabled: true
});

// Apply to your game
app.stage.filters = [retroFilter];

// Update in game loop for animated effects
retroFilter.updateTime(deltaTime);
```

### How to Enable:
Open the **Shader Test Panel** (🎨 button in top-left) and click the **"Retro"** button

## Option 2: RetroEffects Utility (Easy to Use) ✅

**File:** `src/utils/RetroEffects.ts`

A wrapper that makes it even easier to use retro effects with presets.

### Usage:

```typescript
import { RetroEffects } from './utils/RetroEffects';

const retroEffects = new RetroEffects(app.stage);

// Enable with default settings
retroEffects.enable();

// Enable with custom settings
retroEffects.enable({
  pixelSize: 4,
  scanlines: true,
  scanlineIntensity: 0.4,
  colorMode: 'greenscreen'  // 'normal', 'sepia', 'desaturate', 'greenscreen'
});

// Update in game loop
retroEffects.update(deltaTime);

// Toggle on/off
retroEffects.toggle();

// Adjust settings on the fly
retroEffects.setPixelSize(5);
retroEffects.setScanlineIntensity(0.5);
```

### Color Modes:

1. **normal** - Slight desaturation for retro look
2. **sepia** - Old photograph look
3. **desaturate** - Black and white
4. **greenscreen** - Old green phosphor monitor (like early terminals)

## Option 3: PixiJS Built-in Filters (No Custom Code)

PixiJS v8 has built-in filters you can use without any custom shaders:

```typescript
import { ColorMatrixFilter, NoiseFilter } from 'pixi.js';

// Retro color effect
const colorFilter = new ColorMatrixFilter();
colorFilter.desaturate(0.3);  // Slight desaturation
colorFilter.contrast(1.2);     // Increase contrast

// Add some noise for grain
const noiseFilter = new NoiseFilter({
  noise: 0.1,
  seed: Math.random()
});

app.stage.filters = [colorFilter, noiseFilter];
```

## Current Implementation

The game is already set up with **Option 1 (SimpleRetroFilter)** integrated into the Shader Test Panel:

- Click the **🎨 Shader Test** button in the top-left corner
- Click the **"Retro"** button to enable effects
- Use the sliders to adjust:
  - **Pixel Size** (1-8): Controls pixelation amount
  - **Scanline Intensity** (0-1): Controls CRT scanline darkness
- Click "Reset" buttons to restore default values

## Customization Examples

### Subtle Retro Look
```typescript
retroEffects.enable({
  pixelSize: 2,
  scanlineIntensity: 0.2,
  colorMode: 'normal'
});
```

### Heavy Pixelation
```typescript
retroEffects.enable({
  pixelSize: 6,
  scanlineIntensity: 0.5,
  colorMode: 'desaturate'
});
```

### Old Terminal Look
```typescript
retroEffects.enable({
  pixelSize: 3,
  scanlineIntensity: 0.4,
  colorMode: 'greenscreen'
});
```

### Gameboy-style
```typescript
retroEffects.enable({
  pixelSize: 4,
  scanlineIntensity: 0.1,
  colorMode: 'greenscreen'
});
```

## Performance Notes

- **Pixelation** has minimal performance impact
- **Scanlines** are very lightweight
- **Color filters** are hardware-accelerated
- All effects run on GPU, so performance is excellent

## Troubleshooting

### Effects not showing?
1. Make sure you're calling `retroEffects.update(deltaTime)` in your game loop
2. Check that filters are applied: `console.log(app.stage.filters)`
3. Try toggling with Ctrl+R

### Effects too strong?
Adjust the intensity:
```typescript
retroEffects.setPixelSize(2);           // Less pixelation
retroEffects.setScanlineIntensity(0.1); // Lighter scanlines
```

### Want different effects?
You can combine multiple filters:
```typescript
import { BlurFilter, ColorMatrixFilter } from 'pixi.js';

const blur = new BlurFilter({ strength: 0.5 });
const color = new ColorMatrixFilter();
color.sepia(true);

app.stage.filters = [blur, color, retroFilter];
```

## Why the Old Shaders Don't Work

The existing shader files (`CRTFilter.ts`, etc.) were written for PixiJS v7 or earlier. PixiJS v8 changed:

1. **Filter API** - New `GlProgram` system instead of old shader strings
2. **Uniform handling** - New `resources` system
3. **Vertex shader format** - Different attribute names and structure

The `SimpleRetroFilter` is written specifically for PixiJS v8 and follows the new API.

## Next Steps

1. **Try it out**: Press Ctrl+R in your game to see the effects
2. **Customize**: Adjust settings in `main.ts` where `retroEffects.enable()` is called
3. **Experiment**: Try different `pixelSize` and `colorMode` combinations
4. **Add UI**: Create a settings menu to let players adjust effects

## Advanced: Creating Custom Filters

If you want to create your own custom filter for PixiJS v8:

```typescript
import { Filter, GlProgram } from 'pixi.js';

const vertex = `
  in vec2 aPosition;
  out vec2 vTextureCoord;
  // ... vertex shader code
`;

const fragment = `
  in vec2 vTextureCoord;
  uniform sampler2D uTexture;
  out vec4 finalColor;
  // ... fragment shader code
`;

const gpuProgram = GlProgram.from({
  vertex,
  fragment,
  name: 'my-custom-filter',
});

const myFilter = new Filter({
  gpuProgram,
  resources: {
    myUniforms: {
      uMyValue: { value: 1.0, type: 'f32' },
    },
  },
});
```

## Resources

- [PixiJS v8 Filter Documentation](https://pixijs.com/8.x/guides/components/filters)
- [PixiJS v8 Examples](https://pixijs.com/8.x/examples)
- [WebGL Shader Reference](https://www.khronos.org/opengl/wiki/OpenGL_Shading_Language)
