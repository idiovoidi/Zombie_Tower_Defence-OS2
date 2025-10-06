# Survivor Camp - Apocalyptic RTS Design

## Overview

The Survivor Camp has been redesigned with an apocalyptic, military-fortified aesthetic matching the Tower Shop and Bottom Bar. It represents the last bastion of humanity - a heavily fortified compound with corrugated metal walls, concrete bunkers, and defensive positions.

## Visual Design

### Outer Perimeter (130px × 110px)

- **Walls**: Corrugated metal panels (gray #5a5a5a)
- **Border**: Heavy dark metal frame (4px, #2a2a2a)
- **Corrugation Effect**: Vertical ridges every 8px for industrial look
- **Rust Streaks**: Random vertical rust marks (#8b4513) for weathering
- **Corner Reinforcements**: Metal plates with 4 rivets each corner

### Main Bunker/Shelter (70px × 40px)

- **Base**: Concrete structure (#5a5a5a) with dark border
- **Roof**: Angled metal panels (#4a4a4a) forming peaked roof
- **Roof Panels**: Vertical seam lines for segmented appearance
- **Door**: Reinforced metal door (24px × 10px) with rivet details
- **Weathering**: Concrete cracks for battle-worn appearance

### Defensive Structures

#### Sandbag Barriers
- **Material**: Tan/brown sandbags (#8b7355)
- **Placement**: Left and right sides of camp entrance
- **Style**: Rounded rectangles stacked in defensive positions
- **Border**: Dark brown outline (#654321)

#### Metal Supply Crates (18px × 18px each)
- **Base**: Dark metal (#4a4a4a) with heavy border
- **Caution Stripes**: Yellow/black warning pattern on top
- **Rivets**: 4 corner rivets for industrial look
- **Placement**: Left side of camp (3 crates stacked)

### Watchtower (24px × 48px)

- **Structure**: Metal scaffolding with cross-beams
- **Base**: Dark metal frame (#4a4a4a)
- **Cross-beams**: Horizontal supports every 15px
- **Vertical Supports**: 3px wide metal columns
- **Platform**: Metal grating (34px × 8px) with line details
- **Guard**: Armed figure on platform with rifle
- **Antenna**: Communication tower with red warning light

### Fire/Heating

- **Barrel**: Metal oil drum (16px × 12px) with horizontal bands
- **Fire**: Layered flames (orange → yellow gradient)
- **Placement**: Center front of camp
- **Details**: Riveted metal construction

### Survivors

#### Armed Guard (Watchtower)
- **Head**: Flesh tone (#ffdbac)
- **Body**: Armored/tactical gear (#4a4a4a)
- **Weapon**: Rifle silhouette

#### Ground Survivors (2 figures)
1. **Armed Survivor**
   - Weapon in hand
   - Brown/tan clothing (#654321)
   - Defensive posture

2. **Worker Survivor**
   - Tool in hand
   - Gray work clothes (#4a4a4a)
   - Active/working pose

### Warning Sign (80px × 18px)

- **Background**: Dark metal plate (#3a3a3a)
- **Border**: Heavy frame (3px, #2a2a2a)
- **Edge Stripes**: Yellow caution stripes on left/right edges
- **Inner Panel**: Green "SAFE ZONE" indicator (#00aa00)
- **Rivets**: 4 corner rivets
- **Position**: Above camp entrance

## Color Palette

### Structural Colors
- **Metal Gray**: #4a4a4a, #5a5a5a, #6a6a6a
- **Dark Metal**: #2a2a2a, #3a3a3a
- **Concrete**: #5a5a5a

### Material Colors
- **Rust**: #8b4513 (30% opacity)
- **Sandbags**: #8b7355
- **Wood**: #654321

### Accent Colors
- **Warning Yellow**: #ffcc00
- **Warning Black**: #1a1a1a
- **Safe Zone Green**: #00aa00, #008800
- **Fire**: #ff4500, #ffa500, #ffff00
- **Antenna Light**: #ff0000, #ff3333

### Character Colors
- **Skin**: #ffdbac
- **Clothing**: #654321, #4a4a4a

## Layout Structure

```
                    ┌─ SAFE ZONE ─┐
                    │  (Warning)   │
                    └──────────────┘
        ┌────────────────────────────────────┐
        │ ●                              ● A │  ← Antenna
        │                                  N │
        │  □□□    /\                    ┌──┐│
        │  □□□   /  \  Bunker           │░░││  ← Watchtower
        │  □□□  /____\                  │░░││     with guard
        │       │    │                  └──┘│
        │       │ ▓▓ │  Door                │
        │  ▓▓▓  └────┘                  ▓▓▓ │  ← Sandbags
        │  ▓▓▓    ☺☺   Barrel Fire      ▓▓▓ │
        │ ●                              ●   │
        └────────────────────────────────────┘
         Corrugated metal walls with rust
```

## Key Features

### Industrial Aesthetic
- Corrugated metal panels with vertical ridges
- Riveted corner reinforcements
- Metal scaffolding and grating
- Weathered and rusted surfaces

### Military Fortification
- Defensive sandbag positions
- Armed guards and watchtower
- Communication antenna
- Reinforced bunker entrance

### Survival Elements
- Supply crates with caution markings
- Barrel fire for warmth
- Working survivors
- Safe zone designation

### Battle-Worn Details
- Concrete cracks
- Rust streaks on metal
- Heavy reinforcements
- Tactical positioning

## Design Consistency

Matches Tower Shop and Bottom Bar through:

1. **Material Palette**
   - Same metal grays and dark tones
   - Consistent rust coloring
   - Matching concrete textures

2. **Industrial Elements**
   - Rivets on corners and panels
   - Corrugated metal patterns
   - Heavy metal borders

3. **Warning Indicators**
   - Yellow/black caution stripes
   - Green safe zone marking
   - Red warning lights

4. **Weathering Effects**
   - Rust streaks and spots
   - Cracks and wear marks
   - Battle damage aesthetic

## Positioning

- **Location**: End of zombie path (final waypoint)
- **Size**: 130px wide × 110px tall (outer perimeter)
- **Clearance**: 65px radius from center point
- **Visibility**: Always visible during gameplay

## Gameplay Integration

### Defensive Purpose
- Final destination for zombies
- Represents player's lives/survivors
- Visual indicator of what's being defended

### Thematic Elements
- Shows organized resistance
- Military-style fortification
- Last bastion of humanity

### Visual Feedback
- Static structure (no animations currently)
- Could pulse/flash when taking damage (future)
- Could show damage accumulation (future)

## Future Enhancements

Potential additions to enhance the camp:

1. **Dynamic Elements**
   - Flickering fire animation
   - Blinking antenna light
   - Moving guard on watchtower
   - Survivors walking around

2. **Damage States**
   - Cracks appear when hit
   - Smoke from damaged areas
   - Debris accumulation
   - Wall deterioration

3. **Upgrades Visual**
   - Additional fortifications
   - More guards
   - Better equipment
   - Expanded perimeter

4. **Activity Indicators**
   - Resource gathering animations
   - Construction effects
   - Smoke from chimney
   - Lights at night

5. **Interactive Elements**
   - Click to view camp status
   - Upgrade menu access
   - Survivor management
   - Defense statistics

## Technical Implementation

### Rendering Method
- Drawn using PixiJS Graphics API
- Part of VisualMapRenderer
- Rendered once during map initialization
- Static geometry (no per-frame updates)

### Performance
- Minimal draw calls
- No textures (procedural graphics)
- Efficient rendering
- No animation overhead

### Code Location
- **File**: `src/renderers/VisualMapRenderer.ts`
- **Method**: `renderSurvivorCamp(endpoint: Waypoint)`
- **Called from**: `render()` method during map setup

## Design Philosophy

The survivor camp embodies:

- **Resilience**: Heavily fortified against threats
- **Organization**: Military-style defensive layout
- **Survival**: Practical elements (fire, supplies, shelter)
- **Hope**: Safe zone marking, organized resistance
- **Realism**: Battle-worn, weathered appearance
- **Consistency**: Matches overall apocalyptic RTS theme

The camp serves as both a gameplay objective and a visual anchor that reinforces the game's post-apocalyptic setting and the stakes of defending the last survivors.

---

_Last Updated: Current Build_  
_For implementation details, see `src/renderers/VisualMapRenderer.ts`_
