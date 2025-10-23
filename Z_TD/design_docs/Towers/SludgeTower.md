# Sludge Tower Design

## Overview
The Sludge Tower is a crowd control tower that flings barrels of radioactive sludge, creating temporary pools that slow zombie movement. It deals no direct damage but excels at area denial and controlling zombie flow.

## Core Mechanics

### Base Stats
- **Damage**: 0 (pure crowd control)
- **Fire Rate**: 0.83 shots/sec (~1.2 seconds between shots)
- **Range**: 150 pixels (3 tiles @ 50px/tile)
- **Projectile Speed**: Medium (slower than bullets, faster than grenades)
- **Cost**: $800 (mid-tier support tower)

### Sludge Pool Mechanics
- **Duration**: 4 seconds
- **Radius**: 1.5 tiles
- **Slow Effect**: 30% movement speed reduction
- **Stacking**: Pools do not stack (multiple pools = same slow)
- **Visual**: Green/toxic puddle with particle effects

## Upgrade Path

### Level 1 → 2: "Sticky Sludge"
- **Cost**: $1,200 (800 × 2 × 0.75)
- **Effect**: Slow increased to 40%
- **Pool Duration**: 5 seconds
- **Fire Rate**: 0.91 shots/sec

### Level 2 → 3: "Toxic Compound"
- **Cost**: $1,800 (800 × 3 × 0.75)
- **Effect**: Slow increased to 50%
- **Pool Radius**: 2 tiles (100px)
- **Fire Rate**: 1.0 shots/sec
- **Range**: 180px

### Level 3 → 4: "Hazardous Waste"
- **Cost**: $2,400 (800 × 4 × 0.75)
- **Effect**: Slow increased to 60%
- **Pool Duration**: 6 seconds
- **Fire Rate**: 1.08 shots/sec
- **Range**: 216px

### Level 4 → 5: "Radioactive Compound"
- **Cost**: $3,000 (800 × 5 × 0.75)
- **Effect**: Slow increased to 70%
- **Pool Duration**: 7 seconds
- **Fire Rate**: 1.16 shots/sec
- **Range**: 259px

## Balance Considerations

### Strengths
- Excellent area denial and crowd control
- Affects all zombies in pool simultaneously
- No damage falloff or resistance concerns
- Synergizes well with high-damage towers

### Weaknesses
- Zero damage output (requires other towers to kill)
- Limited by fire rate (can't cover entire path)
- Temporary effect requires continuous firing
- High resource cost (metal + energy)

### Strategic Use
- Place near chokepoints or path curves
- Combine with high-damage towers (Sniper, Grenade)
- Use to buy time for other towers to reload
- Effective against fast zombie types

## Visual Design

### Tower Appearance
- Industrial barrel/tank design
- Toxic green color scheme
- Bubbling/dripping effects
- Hazard symbols and warning stripes

### Projectile
- Spinning barrel with toxic glow
- Arc trajectory (similar to grenade)
- Splash effect on impact

### Sludge Pool
- Animated toxic puddle
- Bubbling particle effects
- Green glow/emission
- Fades out as duration expires

## Technical Implementation Notes

- Sludge pools are temporary area effects (similar to grenade explosions)
- Each pool tracks affected zombies and applies slow modifier
- Pools clean up automatically after duration expires
- Slow effect is multiplicative with zombie base speed
- Visual effects use PixiJS particles and filters
