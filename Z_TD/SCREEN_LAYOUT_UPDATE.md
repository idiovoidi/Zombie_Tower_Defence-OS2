# Screen Layout Update - Vertical Tower Shop

## Overview
Expanded the game screen width to accommodate a vertical tower shop panel on the right side.

## Screen Dimensions

### Before
- Width: 1024px
- Height: 768px
- Layout: Horizontal UI elements

### After
- Width: 1280px (added 256px)
- Height: 768px
- Layout: Play area (1024px) + UI panel (256px)

## Layout Structure

```
┌─────────────────────────────────┬──────────┐
│                                 │          │
│                                 │  Tower   │
│      Play Area (1024x768)       │  Shop    │
│                                 │  (20px)  │
│      - Map                      │          │
│      - Towers                   │          │
│      - Zombies                  │          │
│      - Survivor Camp            │          │
│                                 ├──────────┤
│                                 │  Tower   │
│                                 │  Info    │
│                                 │  (550px) │
└─────────────────────────────────┴──────────┘
```

## UI Panel (Right Side)

### Background
- Dark gray panel (0x2a2a2a)
- Brown separator line (4px wide)
- Visually distinct from play area

### Tower Shop Position
- X: 1040px (16px padding from separator)
- Y: 20px (top padding)
- Vertical layout with all tower types

### Tower Info Panel Position
- X: 1040px
- Y: 550px
- Shows selected tower details

## Tower Shop Icons

Updated all tower icons to match the new "little men with guns" design:

- **Machine Gun**: Brown tower with man in blue uniform holding machine gun
- **Sniper**: Gray tower with man in dark uniform holding long rifle
- **Shotgun**: Bunker with man holding double-barrel shotgun
- **Flame**: Round orange tower with masked operator holding flamethrower
- **Tesla**: Tech tower with operator holding tesla coil gun

## Files Modified

1. `src/config/gameConfig.ts` - Updated SCREEN_WIDTH to 1280
2. `src/main.ts` - Updated app initialization and UI positioning
3. `src/managers/MapManager.ts` - Added comment about play area vs UI area
4. `src/renderers/VisualMapRenderer.ts` - Added UI panel background and separator
5. `src/ui/TowerShop.ts` - Updated tower icons to match new design

## Benefits

- More vertical space for tower shop
- Cleaner separation between gameplay and UI
- Room for additional UI elements if needed
- Tower icons now match in-game tower appearance
- Better visual hierarchy

## Testing

Run the game to see the new layout:
```bash
npm run dev
```

The tower shop should now appear as a vertical panel on the right side with the new tower icons showing little men with guns!
