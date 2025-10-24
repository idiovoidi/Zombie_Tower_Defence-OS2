# Basic Zombie - Simplified Visual Reference

## Color Palette

```typescript
PRIMARY_COLOR: 0x2d5016; // Dark zombie green (main body)
DARK_GREEN: 0x1a3010; // Very dark green (shadows/details)
PALE_GREEN: 0x3d6020; // Slightly lighter green (highlights)
BLOOD_RED: 0x8b0000; // Blood/wounds
BONE_WHITE: 0xcccccc; // Teeth/bones
EYE_GLOW: 0xff0000; // Glowing red eyes
```

## Design Philosophy

**Simplified & Readable:**

- Clean silhouette at all zoom levels
- Minimal details for better performance
- Dark, muted colors for classic zombie aesthetic
- Focus on animation over static detail

## Body Structure

```
     ●●●        ← Head (4px radius circle)
    ●👁👁●       ← Glowing red eyes
     ▬▬▬        ← Simple mouth

    ┌───┐       ← Torso (10x12px rounded rect)
   ╱│ ═ │╲      ← Arms (7px lines)
  ●─│ ═ │─●     ← Hands (1.5px circles)
    │ ═ │       ← Ribcage lines
    └───┘
    ║   ║       ← Legs (3x6px rectangles)
```

## Component Breakdown

### Head (4px radius)

- Dark green circle
- Two glowing red eyes with glow effect
- Black eye sockets (1px circles)
- Simple rectangular mouth (3x1px)

### Torso (10x12px)

- Rounded rectangle (1px corner radius)
- 3 horizontal ribcage lines
- Dark green color

### Arms (7px length)

- Single line from shoulder to hand
- 2px stroke width
- Simple circle for hand (1.5px)
- Swing animation for shambling

### Legs (3x6px each)

- Simple rectangles
- Shuffle animation (±2.5px offset)
- Partially visible below torso

## Animation Details

### Walk Cycle

- Body bob: ±2px vertical
- Head sway: ±1.5px horizontal
- Arm swing: ±0.6 radians
- Leg shuffle: ±2.5px horizontal

### Idle

- Subtle breathing: ±0.8px vertical
- Head twitch: Random small movements
- Arm sway: ±0.15 radians

### Damage

- Red flash (100ms)
- 3 blood particles
- Recoil effect

### Death

- 3-phase animation (1.5s total)
- Rotation and collapse
- 8 blood particles burst
- Fade to alpha 0

## Visual Effects

### Eye Glow

- 3-layer glow effect
- Red color (0xff0000)
- Decreasing alpha per layer
- 1.5px base radius

### Shadow

- Elliptical ground shadow
- 8px width, 4px height
- Black with 30% alpha
- Positioned below zombie

### Blood Particles

- Spawn on damage (3 particles)
- Spawn when health < 70% (drips)
- Death burst (8 particles)
- Simple physics (gravity + velocity)

## Health-Based Changes

### 100-70% Health

- Normal appearance
- No wounds
- Occasional blood drips

### 70-50% Health

- 1-2 blood spots appear
- More frequent drips
- Slightly darker tint

### 50-25% Health

- 3-4 blood spots
- Visible damage
- Darker tint (0xaaaaaa)

### 25-0% Health

- 5+ blood spots
- Heavy damage visible
- Very dark tint (0x888888)

## Performance Targets

- 100+ zombies at 60 FPS
- Minimal draw calls
- Simple shapes only
- Particle limit: 100 total

## Size Specifications

```
Total Height: ~25px
├── Head: 8px (4px radius)
├── Torso: 12px
└── Legs: 6px (visible)

Total Width: ~14px
├── Body: 10px
└── Arms: ±7px extended
```

## Comparison to Old Design

**Old Design:**

- Bright green (0x00ff00)
- Complex details (teeth, wounds, decay)
- Multiple body parts
- Heavy visual noise

**New Design:**

- Dark green (0x2d5016)
- Minimal details
- Simple shapes
- Clean silhouette
- Better readability

## Implementation Notes

- All rendering in `BasicZombieRenderer.ts`
- Procedural animation (no sprites)
- Modular particle system
- Reusable components
- Easy to extend for variants

## Visual Hierarchy

1. **Silhouette** - Dark green body shape
2. **Eyes** - Bright red glow (focal point)
3. **Animation** - Shambling movement
4. **Details** - Ribcage, wounds (subtle)
5. **Effects** - Particles, shadow (minimal)

---

**Result:** A clean, readable zombie design that works at any zoom level and performs well with large numbers on screen.
