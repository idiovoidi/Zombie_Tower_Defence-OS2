# Tank Zombie - Simplified Visual Reference

## Color Palette

```typescript
PRIMARY_COLOR: 0x5a1a1a  // Dark blood red (main body)
DARK_RED:      0x3a0a0a  // Very dark red (shadows/details)
PALE_RED:      0x7a2a2a  // Slightly lighter red (highlights)
BLOOD_RED:     0x8b0000  // Blood/wounds
BONE_WHITE:    0xcccccc  // Teeth/bones
EYE_GLOW:      0xff0000  // Bright red glow
```

## Design Philosophy

**Massive & Threatening:**
- Largest zombie type (2x size of Basic)
- Bulky, muscular proportions
- Dark red color for danger/blood
- Slow, lumbering animation (0.7x speed)
- Ground shake dust particles

## Body Structure

```
      ●●●●●●      ← Head (6px radius, large)
     ●👁 👁●      ← Glowing red eyes (beady)
      ▬▬▬▬▬      ← Large gaping mouth
      
    ┌──────┐     ← Torso (14x16px, massive)
   ╱│ ●  ● │╲    ← Arms (9px, thick)
  ●─│ ════ │─●   ← Hands (2.5px, large)
    │ ════ │     ← Muscle lines
    │ ════ │
    └──────┘
    ║║    ║║     ← Legs (4x7px, thick)
```

## Differences from Basic Zombie

### Proportions
- **Torso**: 14x16px (vs 10x12px) - 40% larger
- **Legs**: 4px wide (vs 3px) - Thicker
- **Arms**: 9px long, 3px thick (vs 7px, 2px) - Massive
- **Head**: 6px radius (vs 4.5px) - Larger
- **Shadow**: 12px (vs 8px) - Bigger

### Visual Details
- **Bulging muscles** on shoulders
- **Thick muscle lines** (4 lines vs 3)
- **Scars** on head
- **Beady eyes** (smaller, more menacing)
- **Larger mouth** for intimidation

### Animation
- **0.7x slower** animation speed (lumbering)
- **Heavier movements** (less bob, more weight)
- **Ground shake** dust particles
- **Slower death** animation (1.8s vs 1.5s)

### Particles
- **Ground shake dust** when moving (8% chance)
- **Heavy bleeding** (larger blood drops)
- **Massive death burst** (15 particles vs 8)

## Component Breakdown

### Head (6px radius)
- Large dark red circle
- Two scars across face
- Beady glowing red eyes (smaller spacing)
- Black eye sockets (1.2px circles)
- Large gaping mouth (5x1.5px)

### Torso (14x16px)
- Massive rounded rectangle (2px corner radius)
- Bulging muscle masses on shoulders
- 4 thick horizontal muscle lines
- Dark red color
- Intimidating size

### Arms (9px length, 3px thick)
- Thick powerful arms
- 4px outline width
- Large hands (2.5px radius)
- Heavy appearance

### Legs (4x7px each)
- Thick sturdy rectangles
- Support massive weight
- Positioned lower (y: 12)

## Animation Details

### Walk Cycle (0.7x speed)
- Body bob: ±2px vertical (slower)
- Head sway: ±1.5px horizontal (lumbering)
- Arm swing: ±0.6 radians (heavy)
- Leg shuffle: ±2.5px horizontal (slow)
- Ground shake dust particles

### Idle (0.7x speed)
- Heavy breathing
- Minimal movement
- Imposing presence

### Damage
- Red flash (100ms)
- 5 blood particles (more than Basic)
- Larger particle size (2.5px)

### Death (1.8s total)
- **Phase 1** (0-400ms): Slower impact
- **Phase 2** (400-1000ms): Heavy collapse
- **Phase 3** (1000-1800ms): Slow fade
- 15 blood particles (massive burst)

## Visual Effects

### Eye Glow
- Bright red color (0xff0000)
- 3-layer glow effect
- 2px base radius (larger)
- Intense and menacing

### Shadow
- Larger elliptical shadow (12px width)
- Matches massive body size
- 30% alpha

### Ground Shake
- Dust particles when moving
- 8% spawn chance per frame
- Gray smoke particles
- 600ms lifetime
- Size: 3px

### Blood Particles
- Larger drops (2px size)
- More frequent when damaged (5% vs 3%)
- Heavier bleeding effect
- Longer lifetime (1200ms)

## Health-Based Changes

Tank has 300 HP (3x Basic), so more wounds:
- 100-75%: Normal (0-2 wounds)
- 75-50%: Damaged (2-4 wounds)
- 50-25%: Heavily damaged (4-6 wounds)
- 25-0%: Critical (6-8 wounds)

## Performance

- Larger size but same optimization
- Additional dust particles (minimal impact)
- Slower animation doesn't affect performance
- More particles on death (brief spike)

## Comparison to Other Zombies

| Feature | Basic | Fast | Tank |
|---------|-------|------|------|
| Color | Dark Green | Dark Orange | Dark Red |
| Torso | 10x12px | 8x11px | 14x16px |
| Speed | 50 px/s | 100 px/s | 25 px/s |
| Health | 100 HP | 80 HP | 300 HP |
| Animation | 1.0x | 1.5x | 0.7x |
| Arms | 7px, 2px | 8px, 1.8px | 9px, 3px |
| Legs | 3px wide | 2.5px wide | 4px wide |
| Eyes | Red glow | Orange glow | Red glow |
| Special | - | Dust trail | Ground shake |
| Threat | Low | Medium | High |

## Strategic Role

- **Health**: 300 HP (highest in game)
- **Speed**: 25 px/s (slowest in game)
- **Damage**: 5 damage to camp (massive)
- **Reward**: $50 (highest reward)
- **Threat**: High-priority target, soaks damage
- **Counter**: High-damage single-target towers (Sniper, Flame)
- **Weakness**: Slow speed allows time to kill

## Visual Hierarchy

1. **Size** - Immediately recognizable as threat
2. **Color** - Dark red signals danger
3. **Eyes** - Intense red glow
4. **Movement** - Slow, lumbering, intimidating
5. **Effects** - Ground shake, heavy bleeding

## Design Notes

- **Intimidation**: Size and color create fear
- **Clarity**: Easily distinguished from other types
- **Threat**: Visual design matches high danger level
- **Balance**: Slow speed balances high health
- **Satisfaction**: Massive death burst feels rewarding

---

**Result:** A massive, intimidating zombie that visually communicates its role as a high-health tank through size, color, and slow, powerful movements.
