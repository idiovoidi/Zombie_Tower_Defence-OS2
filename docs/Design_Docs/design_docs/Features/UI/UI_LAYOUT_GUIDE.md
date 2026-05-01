# UI Layout Guide

## Screen Layout Optimization

The game UI has been optimized for standard aspect ratio screens (16:10 and 16:9) with a base resolution of 1280x768.

## Layout Structure

```
┌─────────────────────────────────────────────────────────────┬──────────┐
│                                                             │          │
│                                                             │          │
│                    GAME AREA                                │  TOWER   │
│                    (1060x688)                               │  SHOP    │
│                                                             │  (220x   │
│                                                             │  768)    │
│                                                             │          │
│                                                             │          │
│                                                             │          │
├─────────────────────────────────────────────────────────────┤          │
│              BOTTOM BAR (1060x80)                           │          │
└─────────────────────────────────────────────────────────────┴──────────┘
```

## Component Dimensions

### Tower Shop (Right Side)

- **Width:** 220px (fixed)
- **Height:** 768px (full screen height)
- **Position:** Right edge (x: 1060, y: 0)
- **Features:**
  - Full-height panel extending from top to bottom
  - Contains all tower purchase buttons
  - Apocalyptic metal theme with rivets
  - Scrollable if more towers are added

### Bottom Bar

- **Width:** 1060px (screen width - shop width)
- **Height:** 80px (fixed)
- **Position:** Bottom left (x: 0, y: 688)
- **Features:**
  - Responsive panel widths based on available space
  - 4 info panels: Money, Lives, Wave, Resources
  - Next Wave button on the right side
  - Panels automatically resize to fit content

### Game Area

- **Width:** 1060px (screen width - shop width)
- **Height:** 688px (screen height - bottom bar height)
- **Position:** Top left (x: 0, y: 0)
- **Features:**
  - Main gameplay area for tower placement
  - Path rendering for zombie movement
  - Tower range indicators
  - Projectile effects

## Responsive Calculations

The layout uses calculated positions based on screen dimensions:

```typescript
const screenWidth = GameConfig.SCREEN_WIDTH; // 1280
const screenHeight = GameConfig.SCREEN_HEIGHT; // 768
const shopWidth = 220;
const bottomBarHeight = 80;

// Bottom bar width adjusts to remaining space
const bottomBarWidth = screenWidth - shopWidth; // 1060

// Shop positioned at right edge
towerShop.position.set(screenWidth - shopWidth, 0);

// Bottom bar positioned at bottom, left-aligned
bottomBar.position.set(0, screenHeight - bottomBarHeight);
```

## Panel Spacing

### Bottom Bar Panels

- **Panel Spacing:** 10px between panels
- **Panel Width:** Calculated dynamically
  ```typescript
  const availableWidth = width - 200; // Reserve for button
  const numPanels = 4;
  const totalSpacing = 10 * (numPanels + 1);
  const panelWidth = (availableWidth - totalSpacing) / numPanels;
  ```

### Tower Shop Buttons

- **Button Height:** 82px
- **Button Spacing:** 6px vertical gap
- **Total per button:** 88px
- **Starting Y:** 65px (below title)

## Alignment Benefits

### Before Optimization

- Hardcoded positions (1040, 688, etc.)
- Shop didn't extend to full height
- Bottom bar had fixed panel widths
- Wasted space and misalignment

### After Optimization

- ✅ Shop extends full screen height
- ✅ Bottom bar width adjusts to remaining space
- ✅ Panels resize responsively
- ✅ Clean edge-to-edge alignment
- ✅ No gaps or overlaps
- ✅ Better visual balance

## Visual Hierarchy

1. **Tower Shop** - Right side, always visible during gameplay
2. **Bottom Bar** - Status information, always visible
3. **Game Area** - Main focus, maximum space utilization
4. **HUD** - Minimal overlay (if needed)

## Theme Consistency

All UI panels use the apocalyptic metal theme:

- Corrugated metal backgrounds
- Rusty metal textures
- Riveted borders
- Caution stripe accents
- Military/industrial styling

## Future Enhancements

Potential improvements for different screen sizes:

1. **Responsive Breakpoints**
   - Detect screen size on init
   - Adjust shop width for smaller screens
   - Stack panels vertically on mobile

2. **Scaling Options**
   - Scale UI elements proportionally
   - Maintain aspect ratio
   - Support 4K and ultrawide displays

3. **Customization**
   - User-adjustable UI scale
   - Toggle panel visibility
   - Compact mode for more game area

## Testing Recommendations

Test the layout on:

- ✅ 1280x768 (16:10) - Primary target
- ✅ 1920x1080 (16:9) - Common widescreen
- ✅ 1366x768 (16:9) - Common laptop
- ⚠️ 1024x768 (4:3) - May need adjustments
- ⚠️ 2560x1440 (16:9) - May need scaling

---

_Last Updated: Current Build_  
_For configuration changes, see: `src/config/gameConfig.ts`_
