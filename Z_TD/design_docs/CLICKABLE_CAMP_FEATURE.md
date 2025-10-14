# Clickable Survivor Camp Feature

## Overview

The survivor camp is now clickable, allowing players to interact with it to open the Camp Upgrade menu. The camp has a hover effect and responds to clicks.

## Implementation

### Visual Feedback

**Hover State:**

- Yellow border (3px, #ffcc00) appears around camp
- Cursor changes to pointer
- Indicates the camp is interactive

**Click Area:**

- Covers entire camp perimeter (130px × 110px)
- Invisible hitbox with minimal alpha (0.001)
- Positioned over the camp graphics

### Technical Details

**VisualMapRenderer Changes:**

- Added `campClickArea` Container property
- Added `onCampClickCallback` for click handling
- Added `setCampClickCallback()` method
- Added `createCampClickArea()` private method
- Cleanup in `clear()` method

**Click Detection:**

- Area: campX ± 65px, campY -60 to +50px
- Event mode: 'static' for interaction
- Stops propagation to prevent map clicks

### Integration Points

**Setup (in main.ts or GameManager):**

```typescript
// Get the visual map renderer
const mapRenderer = gameManager.getMapRenderer();

// Set callback to open camp upgrade panel
mapRenderer.setCampClickCallback(() => {
  campUpgradePanel.show();
});
```

**Camp Upgrade Panel:**

```typescript
// Create panel
const campUpgradePanel = new CampUpgradePanel();
campUpgradePanel.setCampUpgradeManager(campUpgradeManager);

// Add to stage
app.stage.addChild(campUpgradePanel.getContentContainer());

// Set upgrade callback
campUpgradePanel.setUpgradeCallback((upgradeId, cost) => {
  if (gameManager.getMoney() >= cost) {
    gameManager.spendMoney(cost);
    return true;
  }
  return false;
});

// Update money display
campUpgradePanel.setMoneyAvailable(gameManager.getMoney());
```

## User Experience

### Opening the Menu

1. Player hovers over survivor camp
2. Yellow border appears
3. Cursor changes to pointer
4. Player clicks on camp
5. Camp Upgrade panel opens

### Visual Cues

- **Hover**: Yellow highlight indicates interactivity
- **Cursor**: Pointer cursor shows clickability
- **Feedback**: Immediate panel opening on click

## Future Enhancements

### Additional Interactions

1. **Keyboard Shortcut**: Press 'C' to open camp menu
2. **UI Button**: Dedicated button in HUD
3. **Tooltip**: "Click to upgrade camp" on hover
4. **Animation**: Pulsing effect to draw attention
5. **Sound**: Click sound effect

### Visual Improvements

1. **Glow Effect**: Subtle glow when hoverable
2. **Icon Indicator**: Small upgrade icon above camp
3. **Badge**: Show available upgrades count
4. **Highlight**: Different color if upgrades available
5. **Particle Effect**: Sparkles when hoverable

### Accessibility

1. **Keyboard Navigation**: Tab to select, Enter to open
2. **Screen Reader**: Announce "Survivor Camp - Click to upgrade"
3. **High Contrast**: More visible hover state
4. **Larger Hit Area**: Easier to click

## Testing

### Manual Testing

1. Start game
2. Hover over survivor camp
3. Verify yellow border appears
4. Click on camp
5. Verify upgrade panel opens
6. Click outside panel to close
7. Verify hover still works

### Edge Cases

- Click during wave: Should still work
- Click while placing tower: Should cancel placement
- Multiple rapid clicks: Should not open multiple panels
- Click on edge of camp: Should still register

## Code Locations

- **Clickable Area**: `src/renderers/VisualMapRenderer.ts`
  - `createCampClickArea()` method
  - `setCampClickCallback()` method
- **Camp Upgrade Panel**: `src/ui/CampUpgradePanel.ts`
  - `show()` / `hide()` methods
  - Upgrade button handling

- **Integration**: To be added in `src/main.ts`
  - Connect callback
  - Initialize panel
  - Handle money transactions

## Benefits

✅ **Intuitive**: Natural interaction with camp  
✅ **Discoverable**: Hover effect guides players  
✅ **Responsive**: Immediate visual feedback  
✅ **Clean**: No extra UI clutter  
✅ **Thematic**: Fits the game's aesthetic

---

_Last Updated: Current Build_  
_For implementation details, see `src/renderers/VisualMapRenderer.ts`_
