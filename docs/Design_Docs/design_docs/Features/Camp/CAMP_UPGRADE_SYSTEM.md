# Camp Upgrade System - Passive Buffs

## Overview

The Camp Upgrade System allows players to permanently improve their survivor camp with passive bonuses that affect gameplay. Upgrades are purchased with money and provide lasting benefits across the entire game.

## Available Upgrades

### **Resource Generation** 💰

#### Lumber Mill

- **Effect**: +20% wood generation per level
- **Max Level**: 5
- **Base Cost**: $150
- **Total Bonus**: Up to +100% wood generation

#### Scrap Yard

- **Effect**: +20% metal generation per level
- **Max Level**: 5
- **Base Cost**: $150
- **Total Bonus**: Up to +100% metal generation

#### Generator

- **Effect**: +20% energy generation per level
- **Max Level**: 5
- **Base Cost**: $150
- **Total Bonus**: Up to +100% energy generation

---

### **Tower Improvements** 🗼

#### Armory

- **Effect**: +10% tower damage per level
- **Max Level**: 5
- **Base Cost**: $200
- **Total Bonus**: Up to +50% tower damage

#### Watchtower Network

- **Effect**: +8% tower range per level
- **Max Level**: 5
- **Base Cost**: $200
- **Total Bonus**: Up to +40% tower range

---

### **Economy** 💵

#### Supply Cache

- **Effect**: +$100 starting money per level
- **Max Level**: 3
- **Base Cost**: $300
- **Total Bonus**: Up to +$300 starting money

---

### **Survival** ❤️

#### Reinforcements

- **Effect**: +10 max survivors per level
- **Max Level**: 3
- **Base Cost**: $400
- **Total Bonus**: Up to +30 max survivors

---

## Cost Scaling

Upgrade costs increase by **50% per level**:

```
Level 1: Base Cost
Level 2: Base Cost × 1.5
Level 3: Base Cost × 2.25
Level 4: Base Cost × 3.375
Level 5: Base Cost × 5.0625
```

### Example: Lumber Mill

- Level 1: $150
- Level 2: $225
- Level 3: $338
- Level 4: $506
- Level 5: $759
- **Total**: $1,978

## UI Design

### Panel Style

- **Background**: Corrugated metal with rust texture
- **Border**: Dark metal frame with corner rivets
- **Title Bar**: Yellow caution stripes
- **Buttons**: Concrete texture with metal frames

### Upgrade Button States

- **Available & Affordable**: Green border, "UPGRADE" button
- **Available & Unaffordable**: Red border, red cost text
- **Max Level**: Gray border, "✓ MAX LEVEL" text

### Information Displayed

- Upgrade name (yellow stencil font)
- Current level / Max level
- Description of effect
- Cost (green if affordable, red if not)
- Upgrade button (if available and affordable)

## Integration Points

### GameManager

- Instantiate CampUpgradeManager
- Apply bonuses to relevant systems
- Handle upgrade purchases

### Resource Generation

```typescript
const woodMultiplier = campUpgradeManager.getMultiplier('resource_generation');
generatedWood *= woodMultiplier;
```

### Tower Damage

```typescript
const damageMultiplier = campUpgradeManager.getMultiplier('tower_damage');
finalDamage *= damageMultiplier;
```

### Tower Range

```typescript
const rangeMultiplier = campUpgradeManager.getMultiplier('tower_range');
effectiveRange *= rangeMultiplier;
```

### Starting Money

```typescript
const bonusMoney = campUpgradeManager.getFlatBonus('starting_money');
startingMoney += bonusMoney;
```

### Max Lives

```typescript
const bonusLives = campUpgradeManager.getFlatBonus('lives');
maxLives += bonusLives;
```

## Strategic Considerations

### Early Game Priority

1. **Resource Generation**: Compound benefits over time
2. **Supply Cache**: More starting money for faster start
3. **Armory**: Immediate combat effectiveness

### Mid Game Priority

1. **Armory**: Increased damage for tougher waves
2. **Watchtower Network**: Better coverage
3. **Reinforcements**: More room for error

### Late Game Priority

1. **Max all upgrades**: Full power
2. **Focus on survival**: Reinforcements critical
3. **Optimize economy**: Resource generation pays off

## Total Investment

### Maximum Investment

- Resource Generation (3 upgrades × 5 levels): ~$5,934
- Tower Improvements (2 upgrades × 5 levels): ~$5,268
- Supply Cache (3 levels): ~$1,013
- Reinforcements (3 levels): ~$1,350
- **Grand Total**: ~$13,565

### Return on Investment

#### Resource Generation

- Level 5 Lumber Mill: 2× wood generation
- Pays for itself if you generate >$1,978 worth of wood
- Typically pays off by wave 15-20

#### Tower Damage

- Level 5 Armory: 1.5× damage
- Equivalent to upgrading every tower
- Massive value in late game

#### Tower Range

- Level 5 Watchtower: 1.4× range
- Better coverage = fewer towers needed
- Saves money on tower placement

## Persistence

### Save/Load

- Upgrade states saved with game progress
- Can be reset for new games
- Persistent across sessions

### State Management

```typescript
// Save state
const state = campUpgradeManager.getState();
localStorage.setItem('campUpgrades', JSON.stringify(state));

// Load state
const savedState = JSON.parse(localStorage.getItem('campUpgrades'));
campUpgradeManager.loadState(savedState);
```

## UI Access

### Opening the Panel

- Click on survivor camp (future feature)
- Keyboard shortcut: 'C' key (future feature)
- Button in UI (to be added)

### Panel Features

- Scrollable upgrade list
- Real-time cost updates
- Instant feedback on purchases
- Visual level indicators
- Affordable/unaffordable states

## Visual Design

### Color Scheme

- **Available**: Green (#00aa00)
- **Unaffordable**: Red (#8b0000)
- **Max Level**: Gray (#4a4a4a)
- **Title**: Yellow (#ffcc00)
- **Cost**: Green/Red based on affordability

### Typography

- **Title**: Impact, 20px, yellow with black stroke
- **Upgrade Names**: Impact, 14px, yellow with black stroke
- **Descriptions**: Arial, 10px, gray
- **Costs**: Courier New, 11px, green/red
- **Levels**: Courier New, 12px, white/green

## Future Enhancements

### Additional Upgrades

1. **Workshop**: Reduced tower upgrade costs
2. **Training Grounds**: Faster tower fire rate
3. **Medical Bay**: Slower life loss
4. **Radio Tower**: Increased zombie kill rewards
5. **Barricades**: Zombies move slower on path

### Advanced Features

1. **Upgrade Trees**: Unlock advanced upgrades
2. **Prestige System**: Reset for permanent bonuses
3. **Achievements**: Unlock special upgrades
4. **Visual Changes**: Camp appearance improves
5. **NPC Workers**: Visible survivors working

### UI Improvements

1. **Tooltips**: Detailed effect explanations
2. **Preview**: See effect before purchasing
3. **Undo**: Refund recent purchases
4. **Presets**: Save upgrade builds
5. **Recommendations**: Suggested upgrade paths

## Implementation Status

✅ **Completed:**

- CampUpgradeManager class
- 7 upgrade types
- Cost scaling system
- Bonus calculation methods
- CampUpgradePanel UI
- Save/load state support

⏳ **To Integrate:**

- Add to GameManager
- Connect to resource generation
- Apply tower bonuses
- Add UI button to open panel
- Implement keyboard shortcut
- Apply bonuses to game systems

---

_Last Updated: Current Build_  
_For implementation details, see `src/managers/CampUpgradeManager.ts` and `src/ui/CampUpgradePanel.ts`_
