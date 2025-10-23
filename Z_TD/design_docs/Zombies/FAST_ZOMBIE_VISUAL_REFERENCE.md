# Fast Zombie - Simplified Visual Reference

## Color Palette

```typescript
PRIMARY_COLOR: 0x8b4513  // Dark orange-brown (main body)
DARK_ORANGE:   0x5a2a0a  // Very dark orange (shadows/details)
PALE_ORANGE:   0xa0522d  // Slightly lighter orange (highlights)
BLOOD_RED:     0x8b0000  // Blood/wounds
BONE_WHITE:    0xcccccc  // Teeth/bones
EYE_GLOW:      0xff6600  // Glowing orange eyes
```

## Design Philosophy

**Fast & Aggressive:**
- Leaner body proportions
- More athletic appearance
- Orange color scheme for speed/aggression
- Faster animation (1.5x speed multiplier)
- Motion blur dust particles

## Body Structure

```
     ●●●        ← Head (4px radius, smaller)
    ●👁👁●       ← Glowing orange eyes
     ▬▬▬▬       ← Wider snarling mouth
      
    ┌──┐        ← Torso (8x11px, leaner)
   ╱│══│╲       ← Arms (8px, longer)
  ●─│══│─●      ← Hands (1.5px circles)
    │══│        ← Muscle lines
    └──┘
    ║  ║        ← Legs (2.5x6px, thinner)
```

## Differences from Basic Zombie

### Proportions
- **Torso**: 8x11px (vs 10x12px) - Leaner
- **Legs**: 2.5px wide (vs 3px) - Thinner
- **Arms**: 8px long (vs 7px) - Longer reach
- **Head**: 4px radius (vs 4.5px) - Smaller

### Visual Details
- **Muscle lines** instead of ribcage
- **Wider mouth** for aggressive look
- **Orange glow** eyes instead of red
- **Thinner limbs** for speed aesthetic

### Animation
- **1.5x faster** animation speed
- More **exaggerated arm swing**
- **Motion blur** dust particles when moving
- Faster leg shuffle

### Particles
- **Dust clouds** when running (smoke particles)
- Blood particles on damage
- Orange flash on damage (vs red)

## Component Breakdown

### Head (4px radius)
- Dark orange-brown circle
- Two glowing orange eyes (more intense)
- Black eye sockets (1px circles)
- Wider rectangular mouth (3.6x1px)

### Torso (8x11px)
- Leaner rounded rectangle
- 3 horizontal muscle definition lines
- Dark orange color
- Athletic appearance

### Arms (8px length)
- Longer for running motion
- 1.8px stroke width (thinner)
- Extended pose for speed
- Simple circle hands

### Legs (2.5x6px each)
- Thinner rectangles
- Faster shuffle animation
- Athletic proportions

## Animation Details

### Walk Cycle (1.5x speed)
- Body bob: ±2px vertical (faster)
- Head sway: ±1.5px horizontal (faster)
- Arm swing: ±0.6 radians (more pronounced)
- Leg shuffle: ±2.5px horizontal (rapid)

### Idle (1.5x speed)
- Quick breathing
- Twitchy movements
- Restless energy

### Damage
- Orange flash (100ms)
- 3 blood particles
- Higher velocity particles (50 px/s)

### Death
- Same 3-phase animation
- Faster collapse
- 8 blood particles (higher velocity)

## Visual Effects

### Eye Glow
- Orange color (0xff6600)
- 3-layer glow effect
- 1.8px base radius
- More intense than Basic

### Shadow
- Smaller elliptical shadow (7px width)
- Matches smaller body size

### Motion Blur
- Dust particles when moving
- 5% spawn chance per frame
- Gray smoke particles
- Short lifetime (400ms)

### Blood Particles
- Same as Basic but faster velocity
- Orange damage flash instead of red

## Health-Based Changes

Same as Basic Zombie:
- 100-70%: Normal
- 70-50%: 1-2 blood spots
- 50-25%: 3-4 blood spots
- 25-0%: 5+ blood spots

## Performance

- Same optimization as Basic
- Additional dust particles (minimal impact)
- Faster animation doesn't affect performance

## Comparison to Basic Zombie

| Feature | Basic | Fast |
|---------|-------|------|
| Color | Dark Green | Dark Orange |
| Size | 10x12px torso | 8x11px torso |
| Speed | 50 px/s | 100 px/s |
| Animation | 1.0x | 1.5x |
| Arms | 7px | 8px |
| Legs | 3px wide | 2.5px wide |
| Eyes | Red glow | Orange glow |
| Special | - | Dust particles |

## Strategic Role

- **Speed**: 2x faster than Basic (100 px/s vs 50 px/s)
- **Health**: 80 HP (lower than Basic's 100 HP)
- **Threat**: Reaches camp quickly, hard to target
- **Counter**: Area-effect towers, instant-hit towers

---

**Result:** A lean, aggressive zombie that visually communicates speed through proportions, color, and animation.
