# Sludge Tower Design

## Overview

The Sludge Tower is a crowd control tower that flings barrels of radioactive sludge, creating temporary pools that slow zombie movement. It deals no direct damage but excels at area denial and controlling zombie flow.

## Core Mechanics

### Base Stats

- **Damage**: 0 (pure crowd control)
- **Fire Rate**: 0.25 shots/sec (4 seconds between shots - very slow and deliberate)
- **Range**: 100 pixels (2 tiles @ 50px/tile) - short range requires strategic placement
- **Projectile Speed**: 300 px/s (slower than grenades for arc trajectory)
- **Cost**: $800 (mid-tier support tower)

### Sludge Pool Mechanics

- **Duration**: 4 seconds
- **Radius**: 35 pixels (~0.7 tiles - small, path-focused)
- **Slow Effect**: 10% movement speed reduction (base)
- **Stacking**: Pools do NOT stack - zombie takes strongest slow effect only
- **Visual**: Small green/toxic puddle with particle effects, renders behind zombies

## Upgrade Path

### Level 1 → 2: "Sticky Sludge"

- **Cost**: $960 (800 × 2 × 0.6)
- **Effect**: Slow increased to 17.5%
- **Pool Duration**: 5 seconds
- **Pool Radius**: 38px
- **Fire Rate**: 0.275 shots/sec
- **Range**: 110px

### Level 2 → 3: "Toxic Compound"

- **Cost**: $1,440 (800 × 3 × 0.6)
- **Effect**: Slow increased to 25%
- **Pool Radius**: 41px
- **Pool Duration**: 5 seconds
- **Fire Rate**: 0.3 shots/sec
- **Range**: 120px

### Level 3 → 4: "Hazardous Waste"

- **Cost**: $1,920 (800 × 4 × 0.6)
- **Effect**: Slow increased to 32.5%
- **Pool Radius**: 44px
- **Pool Duration**: 6 seconds
- **Fire Rate**: 0.325 shots/sec
- **Range**: 130px

### Level 4 → 5: "Radioactive Compound"

- **Cost**: $2,400 (800 × 5 × 0.6)
- **Effect**: Slow increased to 40% (max)
- **Pool Radius**: 47px
- **Pool Duration**: 7 seconds
- **Fire Rate**: 0.35 shots/sec
- **Range**: 140px

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
- Pool radius scales with upgrade level (35px → 47px) - small, path-focused
- Slow percentage scales with upgrade level (10% → 40%)
- Duration scales with upgrade level (4s → 7s)
- Pools check for zombies every 100ms and apply/remove slow effect
- Multiple pools do NOT stack (zombie takes strongest slow effect only)
- Pools render behind zombies (z-index: -100)

### Slow Effect Implementation

- Slow is applied based on zombie's base speed: `newSpeed = baseSpeed × speedVariation × (1 - slowPercent)`
- If zombie is already slowed, only applies new slow if it's stronger
- Effect is removed when zombie leaves all pools
- Zombies track their slow state to prevent stacking from multiple pools
- All affected zombies have slow removed when pool expires

### Visual Effects

- Multi-layered toxic pool with bubbling particles
- Toxic glow effect that pulses
- Pool fades out gradually over final 50% of duration
- Particle count increases with upgrade level
