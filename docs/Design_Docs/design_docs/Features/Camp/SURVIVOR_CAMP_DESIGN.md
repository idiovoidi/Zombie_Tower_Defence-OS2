# Survivor Camp - Apocalyptic RTS Design

## Overview

The Survivor Camp represents a makeshift settlement where the last survivors have gathered. It features military-style tents, improvised defenses, and scavenged materials - a lived-in camp that shows both resourcefulness and desperation. The design matches the apocalyptic RTS aesthetic of the Tower Shop and Bottom Bar while maintaining a more organic, camp-like feel.

## Visual Design

### Makeshift Perimeter

- **Fence Sections**: Scrap metal panels with gaps (not solid walls)
- **Left/Right Sides**: 5 vertical metal panels each with rust spots and rivets
- **Back Fence**: Chain-link style metal sections
- **Material**: Salvaged corrugated metal (#5a5a5a)
- **Weathering**: Rust spots and worn edges

### Main Tent (64px × 35px base)

- **Material**: Military-style olive green tarp (#6b7c3a, #5a6a2a)
- **Style**: Peaked roof with center seam
- **Panels**: Visible tent sections and seams
- **Patches**: Repair patches showing wear (#4a4a4a, #3a3a3a)
- **Entrance**: Rolled-up flap at front
- **Support**: Rope lines to stakes on sides
- **Details**: Weathered, patched, lived-in appearance

### Small Tent (Left Side)

- **Material**: Brown/tan tarp (#8b7355, #a0826d)
- **Style**: Simple A-frame design
- **Size**: Smaller personal shelter
- **Purpose**: Additional sleeping quarters

### Defensive Structures

#### Sandbag Barriers

- **Material**: Tan/brown sandbags (#8b7355)
- **Placement**: Organic clusters at left and right entrances (4 bags each side)
- **Style**: Rounded rectangles with texture lines
- **Border**: Dark brown outline (#654321)
- **Purpose**: Improvised defensive positions

#### Wooden Supply Crates (16px × 16px each)

- **Base**: Weathered wood (#8b7355)
- **Planks**: Visible wood grain lines
- **Metal Bands**: Dark metal strapping (#4a4a4a)
- **Placement**: Left side of camp (3 crates)
- **Style**: Scavenged supply containers

### Makeshift Watchtower

- **Structure**: Wood construction with cross-braces
- **Legs**: Two wooden posts (#654321)
- **Bracing**: X-pattern cross supports
- **Platform**: Wood planks with visible seams (#8b7355)
- **Railing**: Simple wooden rail
- **Guard**: Armed survivor on platform
- **Radio Antenna**: Metal pole with red warning light

### Central Campfire

- **Fire Pit**: Stone ring (8 stones arranged in circle)
- **Stones**: Gray rocks (#5a5a5a) with dark borders
- **Fire**: Layered flames (orange → yellow gradient)
- **Logs**: Seating logs on two sides (#654321)
- **Placement**: Center of camp gathering area

### Survivors (4 figures)

1. **Watchtower Guard**
   - On elevated platform
   - Armed with rifle
   - Brown clothing (#654321)
   - Defensive position

2. **Sitting Survivor**
   - By campfire on log
   - Blue clothing (#4169e1)
   - Resting/warming

3. **Standing Guard**
   - Armed patrol
   - Brown clothing (#654321)
   - Weapon ready

4. **Worker**
   - Near supply crates
   - Gray work clothes (#4a4a4a)
   - Organizing supplies

### Camp Details

#### Laundry Line

- **Line**: Rope strung between tent areas
- **Clothes**: Blue and green garments hanging
- **Purpose**: Shows lived-in, everyday camp life

#### Tent Stakes and Ropes

- **Stakes**: Wooden posts driven into ground
- **Ropes**: Support lines from tent corners
- **Purpose**: Realistic tent setup

### Warning Sign (80px × 18px)

- **Background**: Wooden board (#8b7355)
- **Border**: Wood frame (#654321)
- **Edge Stripes**: Hand-painted yellow warning stripes
- **Inner Panel**: Green "SAFE ZONE" painted area (#00aa00)
- **Fasteners**: Nails/screws in corners (#4a4a4a)
- **Style**: Makeshift painted sign
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
                    │ (Wood Sign)  │
                    └──────────────┘
        ║  ║  ║  ║  ║  ║  ║  ║  ║  ║  ← Scrap fence
        ║                              ║
        ║  □□□   /\      ~clothes~  A ║  ← Antenna
        ║  □□□  /  \  Main Tent    ┌┴┐║
        ║  □□□ /____\              │☺│║  ← Watchtower
        ║  Crates  │  │   /\       └─┘║     (wood)
        ║          │▓▓│  /  \          ║
        ║  ▓▓▓▓    └──┘ Small Tent    ║
        ║  ▓▓▓▓     ☺    ☺        ▓▓▓▓║  ← Sandbags
        ║          (🔥)  Campfire  ▓▓▓▓║
        ║  ☺      ═══               ☺  ║
        ║        Logs                  ║
        ║  ║  ║  ║  ║  ║  ║  ║  ║  ║  ║
         Makeshift perimeter with gaps
```

## Key Features

### Makeshift Aesthetic

- Scrap metal fence sections with gaps
- Weathered military tents with patches
- Wooden crates and structures
- Improvised defenses

### Camp Life Elements

- Central campfire with stone ring
- Laundry hanging between tents
- Multiple survivors doing different activities
- Seating logs around fire
- Supply organization area

### Defensive Measures

- Sandbag barrier clusters
- Makeshift wooden watchtower
- Armed guards on patrol
- Radio communication antenna
- Perimeter fence (incomplete but functional)

### Lived-In Details

- Tent patches and repairs
- Rope lines and stakes
- Scattered supplies
- Multiple activity areas
- Organic, non-military layout

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

- **Resourcefulness**: Built from scavenged materials
- **Community**: Multiple survivors living and working together
- **Improvisation**: Makeshift defenses and structures
- **Survival**: Practical elements (fire, shelter, supplies, laundry)
- **Hope**: Safe zone marking, organized community
- **Realism**: Lived-in, weathered, organic appearance
- **Consistency**: Matches apocalyptic RTS theme while feeling like an actual camp

The camp serves as both a gameplay objective and a visual anchor that shows what the player is defending - not just a military installation, but a community of survivors trying to rebuild and survive together.

---

_Last Updated: Current Build_  
_For implementation details, see `src/renderers/VisualMapRenderer.ts`_
