# Bottom Bar - Apocalyptic RTS Design

## Overview

The Bottom Bar is a horizontal information panel that displays key game stats in the same apocalyptic, old-school RTS aesthetic as the Tower Shop. It provides a clean, organized view of money, lives, wave number, resources, and wave control.

## Visual Design

### Main Panel

- **Background**: Corrugated metal texture with rust streaks and ridges
- **Inner Panel**: Rusty metal with scratches, wear marks, and rust spots
- **Top Border**: Dark metal border (3px) with rivets spaced along the top
- **Bottom Warning Stripe**: Yellow and black diagonal caution stripes (5px height)
- **Dimensions**: Full screen width (1280px) × 80px height

### Info Panels

The bottom bar contains 4 main information panels:

#### 1. Funds Panel (180px wide)

- **Label**: "FUNDS" in gray military-style text
- **Value**: Green monospace font with $ prefix
- **LED**: Green status indicator
- **Background**: Concrete texture with metal frame

#### 2. Survivors Panel (180px wide)

- **Label**: "SURVIVORS" in gray military-style text
- **Value**: Red monospace font (no prefix)
- **LED**: Red status indicator
- **Background**: Concrete texture with metal frame

#### 3. Wave Panel (180px wide)

- **Label**: "WAVE" in gray military-style text
- **Value**: Yellow monospace font (no prefix)
- **LED**: Yellow status indicator
- **Background**: Concrete texture with metal frame

#### 4. Resources Panel (220px wide)

- **Label**: "RESOURCES" in gray military-style text
- **Icons**: Circular badges with letters (W, M, E)
  - Wood (W): Brown (#8b4513)
  - Metal (M): Gray (#888888)
  - Energy (E): Cyan (#00ced1)
- **Values**: Monospace font matching icon colors
- **Background**: Concrete texture with metal frame

### Next Wave Button (150px × 50px)

- **Position**: Right side of the bar
- **Background**: Concrete texture with caution stripe overlay
- **Frame**: Green border (3px) that glows brighter on hover
- **Text**: "NEXT WAVE" in Impact font with green color and black stroke
- **Hover Effect**: Border thickens to 4px, text turns yellow
- **Visibility**: Only shown during WAVE_COMPLETE state

## Panel Structure

Each info panel features:

- **Concrete Background**: Worn texture at 80% opacity
- **Metal Frame**: 2px dark border with 1px inner border
- **Label Background**: Dark semi-transparent bar at top
- **Status LED**: Colored indicator in top-right corner (70% opacity)
- **Value Display**: Large monospace font centered in panel

## Typography

- **Panel Labels**: Impact/Arial Black, 11px, gray (#cccccc), letter-spacing: 1px
- **Values**: Courier New, 16-22px, color-coded, bold
- **Button Text**: Impact/Arial Black, 18px, green (#00ff00) with black stroke, letter-spacing: 2px
- **Resource Icons**: Impact/Arial Black, 10px, white

## Color Palette

### Panel Colors

- **Metal Gray**: #4a4a4a, #5a5a5a, #6a6a6a
- **Dark Metal**: #2a2a2a, #3a3a3a
- **Concrete**: #5a5a5a with dirt spots

### Value Colors

- **Money**: Green (#00ff00)
- **Lives**: Red (#ff6666)
- **Wave**: Yellow (#ffcc00)
- **Wood**: Brown (#8b4513)
- **Metal**: Gray (#888888)
- **Energy**: Cyan (#00ced1)

### Accent Colors

- **Warning Yellow**: #ffcc00
- **Warning Black**: #1a1a1a
- **Button Green**: #00aa00, #00ff00

## Layout

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ ● Rivets spaced along top border ●                                      ●  │
├─────────────┬─────────────┬─────────────┬──────────────────┬──────────────┤
│   FUNDS     │  SURVIVORS  │    WAVE     │   RESOURCES      │  NEXT WAVE   │
│   $1000     │     100     │     5       │ W:50 M:30 E:20   │   BUTTON     │
└─────────────┴─────────────┴─────────────┴──────────────────┴──────────────┘
▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓
 Warning stripe (yellow/black diagonal pattern)
```

## Positioning

- **X Position**: 0 (left edge of screen)
- **Y Position**: 688 (screen height 768 - bar height 80)
- **Width**: 1280px (full screen width)
- **Height**: 80px

## Interactive Elements

### Next Wave Button States

- **Default**: Green border (3px), green text
- **Hover**: Thicker green border (4px), yellow text
- **Click**: Triggers next wave, button hides
- **Hidden**: Not visible during active wave

## Integration

### UIManager States

The bottom bar is visible during:

- `PLAYING` - Active gameplay
- `WAVE_COMPLETE` - Between waves (with Next Wave button)
- `PAUSED` - Game paused

Hidden during:

- `MAIN_MENU` - Main menu screen
- `LEVEL_SELECT` - Level selection
- `GAME_OVER` - Game over screen
- `VICTORY` - Victory screen

### Update Cycle

The bottom bar updates every frame with:

- Current money amount
- Current lives/survivors
- Current wave number
- Current resource amounts (wood, metal, energy)
- Next wave button visibility based on game state

## Implementation Files

- **BottomBar**: `src/ui/BottomBar.ts`
- **TextureGenerator**: `src/utils/textureGenerator.ts`
- **Integration**: `src/main.ts`
- **UI Management**: `src/ui/UIManager.ts`

## Design Consistency

The bottom bar maintains visual consistency with the Tower Shop through:

1. **Shared Textures**: Uses same TextureGenerator methods
   - Corrugated metal for outer background
   - Rusty metal for inner panels
   - Concrete for info panels

2. **Common Elements**:
   - Rivets for industrial look
   - Metal frames with inner borders
   - Status LEDs for visual feedback
   - Caution stripes for warning areas

3. **Typography**: Same font families and styling
   - Impact/Arial Black for headers
   - Courier New for values
   - Consistent letter-spacing and stroke effects

4. **Color Scheme**: Matching apocalyptic palette
   - Metal grays and dark tones
   - Warning yellows
   - Status indicator colors

## Future Enhancements

Potential additions to enhance the apocalyptic theme:

1. **Animated Elements**
   - Flickering LEDs
   - Pulsing resource icons when low
   - Glowing effects on critical values

2. **Visual Feedback**
   - Flash red when taking damage
   - Flash green when earning money
   - Pulse yellow when wave complete

3. **Additional Info**
   - Mini-map in unused space
   - Quick stats (kills, accuracy)
   - Tower count indicator

4. **Sound Effects**
   - Metal clank on value changes
   - Warning beep when low on resources
   - Klaxon sound for wave complete

5. **Dynamic Elements**
   - Damage indicators on panel
   - Rust accumulation over time
   - Battle wear effects

## Design Philosophy

The bottom bar follows these principles:

- **Information Density**: Maximum info in minimal space
- **Readability**: Clear, high-contrast values
- **Consistency**: Matches tower shop aesthetic
- **Functionality**: Quick access to critical stats
- **Immersion**: Maintains apocalyptic RTS theme

---

_Last Updated: Current Build_  
_For implementation details, see source files in `src/ui/`_
