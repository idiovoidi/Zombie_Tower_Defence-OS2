# Sludge Tower Design

## Overview
The Sludge Tower is a crowd control tower that flings barrels of radioactive sludge, creating temporary pools that slow zombie movement. It deals no direct damage but excels at area denial and controlling zombie flow.

## Core Mechanics

### Base Stats
- **Damage**: 0 (pure crowd control)
- **Fire Rate**: 0.5 shots/sec (2 seconds between shots - slow and deliberate)
- **Range**: 150 pixels (3 tiles @ 50px/tile)
- **Projectile Speed**: 300 px/s (slower than grenades for arc trajectory)
- **Cost**: $800 (mid-tier support tower)

### Sludge Pool Mechanics
- **Duration**: 4 seconds
- **Radius**: 35 pixels (~0.7 tiles - small, path-focused)
- **Slow Effect**: 30% movement speed reduction
- **Stacking**: Pools do not stack (multiple pools = same slow)
- **Visual**: Small green/toxic puddle with particle effects, renders behind zombies

## Upgrade Path

### Level 1 → 2: "Sticky Sludge"
- **Cost**: $1,200 (800 × 2 × 0.75)
- **Effect**: Slow increased to 40%
- **Pool Duration**: 5 seconds
- **Pool Radius**: 40px
- **Fire Rate**: 0.55 shots/sec

### Level 2 → 3: "Toxic Compound"
- **Cost**: $1,800 (800 × 3 × 0.75)
- **Effect**: Slow increased to 50%
- **Pool Radius**: 45px (~0.9 tiles)
- **Pool Duration**: 5 seconds
- **Fire Rate**: 0.6 shots/sec
- **Range**: 180px

### Level 3 → 4: "Hazardous Waste"
- **Cost**: $2,400 (800 × 4 × 0.75)
- **Effect**: Slow increased to 60%
- **Pool Radius**: 50px (1 tile)
- **Pool Duration**: 6 seconds
- **Fire Rate**: 0.65 shots/sec
- **Range**: 216px

### Level 4 → 5: "Radioactive Compound"
- **Cost**: $3,000 (800 × 5 × 0.75)
- **Effect**: Slow increased to 70%
- **Pool Radius**: 55px (~1.1 tiles)
- **Pool Duration**: 7 seconds
- **Fire Rate**: 0.7 shots/sec
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

### Projectile Mechanics
- Barrel projectile uses arc trajectory (similar to grenades)
- Projectile speed: 300 px/s (slightly slower than grenades)
- Visual: Toxic green barrel with biohazard symbol and glow effect

### Sludge Pool Mechanics
- Pools are temporary area effects created on impact
- Pool radius scales with upgrade level (35px → 55px) - small, path-focused
- Slow percentage scales with upgrade level (30% → 70%)
- Duration scales with upgrade level (4s → 7s)
- Pools check for zombies every 100ms and apply/remove slow effect
- Multiple pools do NOT stack (zombie takes highest slow effect)
- Pools render behind zombies (z-index: -100)

### Slow Effect Implementation
- Slow is applied by reducing zombie speed: `newSpeed = currentSpeed × (1 - slowPercent)`
- Effect is removed when zombie leaves pool: `newSpeed = currentSpeed / (1 - slowPercent)`
- Zombies are tracked per pool to prevent duplicate slow applications
- All affected zombies have slow removed when pool expires

### Visual Effects
- Multi-layered toxic pool with bubbling particles
- Toxic glow effect that pulses
- Pool fades out gradually over final 50% of duration
- Particle count increases with upgrade level
