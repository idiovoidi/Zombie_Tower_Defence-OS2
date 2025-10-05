# Tower Selection Fix

## Problem

Tower selection was inconsistent and would break after a few selections, preventing players from selecting towers again.

## Root Causes Identified

### 1. Selection Effect Cleanup Issues

- Selection highlight graphics weren't being properly destroyed
- Pulse animation intervals weren't being cleared before creating new ones
- Multiple selection effects could stack on the same tower

### 2. Event Handler Loss

- When tower visuals were updated (especially during upgrades), event handlers could be lost
- No mechanism to re-establish event handlers after visual updates
- Event listeners could duplicate, causing multiple callbacks

### 3. Range Visualization Not Cleared

- When deselecting a tower, the range circle wasn't always hidden
- Range visualizations could persist and interfere with new selections

## Solutions Implemented

### Tower.ts Changes

#### 1. Improved Selection Effect Management

```typescript
public showSelectionEffect(): void {
  // Clean up any existing selection effect first
  this.hideSelectionEffect();

  // Create new highlight with safety checks
  // Animation checks if highlight still exists before updating
}
```

#### 2. Safer Cleanup

```typescript
public hideSelectionEffect(): void {
  // Clear animation interval first
  // Check if highlight exists and isn't destroyed before removing
  // Proper cleanup of references
}
```

### TowerPlacementManager.ts Changes

#### 1. Centralized Tower Interaction Setup

```typescript
private setupTowerInteraction(tower: Tower): void {
  tower.eventMode = 'static';
  tower.cursor = 'pointer';

  // Remove existing listeners to prevent duplicates
  tower.removeAllListeners('pointerdown');

  // Add fresh event handler
  tower.on('pointerdown', (event) => {
    event.stopPropagation();
    this.selectTower(tower);
  });
}
```

#### 2. Re-establish Interaction After Upgrades

```typescript
public upgradeSelectedTower(): boolean {
  if (this.selectedTower.canUpgrade()) {
    this.selectedTower.upgrade();

    // Re-setup interaction after upgrade
    this.setupTowerInteraction(this.selectedTower);

    // Refresh selection visuals
    this.selectedTower.hideSelectionEffect();
    this.selectedTower.showSelectionEffect();
    this.selectedTower.hideRange();
    this.selectedTower.showRange(this.container);

    return true;
  }
  return false;
}
```

#### 3. Proper Deselection

```typescript
public selectTower(tower: Tower | null): void {
  // Deselect previous
  if (this.selectedTower) {
    this.selectedTower.hideSelectionEffect();
    this.selectedTower.hideRange(); // Now properly hides range
  }

  // Select new
  if (this.selectedTower) {
    this.selectedTower.showSelectionEffect();
    this.selectedTower.showRange(this.container);

    // Ensure interaction is set up
    this.setupTowerInteraction(this.selectedTower);
  }
}
```

## Benefits

1. **Consistent Selection**: Towers can now be selected and deselected reliably
2. **No Memory Leaks**: Proper cleanup of graphics and intervals
3. **Upgrade Safety**: Towers remain selectable after upgrades
4. **Event Handler Stability**: Event handlers are re-established when needed
5. **Visual Clarity**: Selection effects and range circles properly show/hide

## Testing

To verify the fix:

1. Place multiple towers
2. Select and deselect towers repeatedly
3. Upgrade a tower and try selecting it again
4. Select different towers in sequence
5. Click empty space to deselect

All operations should work consistently without breaking.

## Files Modified

- `src/objects/Tower.ts` - Improved selection effect management
- `src/managers/TowerPlacementManager.ts` - Centralized interaction setup and proper cleanup
