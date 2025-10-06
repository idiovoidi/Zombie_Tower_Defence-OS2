# Tower Shop - Apocalyptic RTS Design

## Overview

The Tower Shop has been redesigned with an apocalyptic, old-school RTS aesthetic featuring procedurally generated textures that give it a gritty, weathered look reminiscent of games like Command & Conquer and Starcraft.

## Visual Design

### Main Panel

- **Background**: Corrugated metal texture with rust streaks and ridges
- **Inner Panel**: Rusty metal with scratches, wear marks, and rust spots
- **Frame**: Dark metal border with rivets in corners and edges
- **Title Bar**: "⚠ ARMORY ⚠" with red text and black stroke
- **Caution Stripes**: Yellow warning stripes on title bar edges
- **Subtitle**: "DEFENSE SYSTEMS" in gray military-style text

### Tower Buttons

Each tower button features:

- **Background**: Concrete texture with cracks and dirt spots
- **Metal Frame**: Dark border that glows yellow on hover
- **Icon Plate**: Riveted metal plate (50x70px) with corner rivets
- **Tower Icon**: Centered on the metal plate
- **Info Panel**: Semi-transparent dark background for stats
- **Tower Name**: Uppercase stencil-style font in yellow with black stroke
- **Cost Display**: Green monospace font with "COST:" label
- **Stats**: Red for damage (DMG), cyan for range (RNG)
- **Status LED**: Green indicator light in top-right corner

### Interactive States

- **Default**: Gray border, LED at 50% opacity, concrete at 80% opacity
- **Hover**: Yellow border (3px), LED at 100% opacity, concrete at 100% opacity
- **Selected**: Green border (3px), LED at 100% opacity, concrete at 100% opacity

## Texture Generator

The `TextureGenerator` utility class provides procedural texture generation:

### Available Textures

1. **Rusty Metal** - Base metal with rust spots and scratches
2. **Concrete** - Worn concrete with cracks and dirt
3. **Corrugated Metal** - Ridged metal panels with rust streaks
4. **Weathered Wood** - Wood grain with weathering spots
5. **Bullet Hole** - Impact decal with cracks
6. **Caution Stripes** - Yellow and black warning pattern
7. **Blood Splatter** - Dark red splatter with drips
8. **Riveted Plate** - Metal plate with corner rivets

### Usage

```typescript
import { TextureGenerator } from '@utils/textureGenerator';

// Create a rusty metal background
const metalBg = TextureGenerator.createRustyMetal(200, 500);
this.addChild(metalBg);

// Create concrete texture
const concrete = TextureGenerator.createConcrete(184, 82);
concrete.alpha = 0.8;
this.addChild(concrete);
```

## Typography

- **Title**: Impact/Arial Black, 22px, red (#ff3333) with black stroke
- **Subtitle**: Arial, 9px, gray (#cccccc)
- **Tower Names**: Impact/Arial Black, 13px, yellow (#ffcc00) with black stroke
- **Labels**: Arial, 9px, gray (#888888)
- **Cost**: Courier New, 14px, green (#00ff00)
- **Stats**: Courier New, 10px, red (#ff6666) and cyan (#66ccff)

## Color Palette

### Primary Colors

- **Metal Gray**: #4a4a4a, #5a5a5a, #6a6a6a
- **Dark Metal**: #2a2a2a, #3a3a3a
- **Rust**: #8b4513, #a0522d

### Accent Colors

- **Warning Yellow**: #ffcc00
- **Alert Red**: #ff3333
- **Status Green**: #00ff00
- **Info Cyan**: #66ccff

### UI Colors

- **Text Gray**: #cccccc, #888888
- **Border Gray**: #3a3a3a, #5a5a5a

## Implementation Files

- **TowerShop**: `src/ui/TowerShop.ts`
- **TextureGenerator**: `src/utils/textureGenerator.ts`

## Future Enhancements

Potential additions to enhance the apocalyptic theme:

1. **Animated Elements**
   - Flickering LED indicators
   - Pulsing selection glow
   - Rust particles/dust

2. **Additional Textures**
   - Barbed wire decorations
   - Biohazard symbols
   - Radiation warnings
   - Scratched glass overlays

3. **Sound Effects**
   - Metal clank on button press
   - Radio static on hover
   - Warning beep on selection

4. **Visual Effects**
   - Scan lines overlay
   - CRT screen effect
   - Glitch effects on state changes

5. **Dynamic Elements**
   - Resource availability indicators
   - Tower unlock animations
   - Battle damage accumulation

## Design Philosophy

The design follows these principles:

- **Gritty Realism**: Weathered, worn surfaces that feel lived-in
- **Military Aesthetic**: Stencil fonts, warning stripes, utilitarian layout
- **Functional Design**: Clear information hierarchy, readable stats
- **Apocalyptic Theme**: Rust, concrete, metal - materials of survival
- **RTS Heritage**: Inspired by classic RTS games' command panels

---

_Last Updated: Current Build_  
_For implementation details, see source files in `src/ui/` and `src/utils/`_
