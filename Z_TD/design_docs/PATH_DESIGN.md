# Zombie Path - Apocalyptic Design

## Overview

The zombie path features a worn dirt road texture that shows heavy use and traffic. It uses layered rendering to create depth and realism, matching the apocalyptic aesthetic of the game.

## Visual Layers

### 1. Dark Border (Outer Edge)
- **Width**: Path width + 8px
- **Color**: Dark brown (#4a3a2a)
- **Purpose**: Creates shadow/depth at path edges
- **Effect**: Makes path appear sunken into ground

### 2. Main Path (Base Layer)
- **Width**: 50px (base path width)
- **Color**: Worn dirt brown (#6a5a4a)
- **Purpose**: Primary path surface
- **Effect**: Establishes the road color

### 3. Center Worn Track
- **Width**: 60% of path width
- **Color**: Darker brown (#5a4a3a)
- **Opacity**: 70%
- **Purpose**: Shows heavy traffic down center
- **Effect**: Creates depth and wear pattern

### 4. Tire/Cart Tracks
- **Width**: 3px each
- **Offset**: 25% of path width from center
- **Color**: Dark brown (#4a3a2a)
- **Opacity**: 60%
- **Count**: 2 parallel tracks
- **Purpose**: Shows vehicle/cart traffic
- **Effect**: Adds realism and history

### 5. Dirt Texture (Random Patches)
- **Size**: 3-8px circles
- **Color**: Dark brown (#4a3a2a)
- **Opacity**: 30-60%
- **Frequency**: 30% chance per segment
- **Distribution**: Random across path width
- **Purpose**: Adds organic texture
- **Effect**: Breaks up uniform appearance

### 6. Small Rocks
- **Size**: 2-5px circles
- **Color**: Gray (#5a5a5a)
- **Opacity**: 50-80%
- **Frequency**: 15% chance per segment
- **Distribution**: Random across path
- **Purpose**: Natural debris
- **Effect**: Adds detail and realism

### 7. Footprints
- **Shape**: Small ellipses (3x5px)
- **Color**: Very dark brown (#3a2a1a)
- **Opacity**: 20-40%
- **Frequency**: 20% chance per segment
- **Rotation**: Random angles
- **Purpose**: Shows foot traffic
- **Effect**: Suggests constant zombie movement

### 8. Edge Wear (Highlight)
- **Width**: Path width + 4px
- **Color**: Light brown (#7a6a5a)
- **Opacity**: 30%
- **Purpose**: Lighter dirt at edges
- **Effect**: Creates subtle edge highlight

## Color Palette

### Path Colors
- **Dark Border**: #4a3a2a (darkest)
- **Main Path**: #6a5a4a (medium)
- **Center Track**: #5a4a3a (dark)
- **Tire Tracks**: #4a3a2a (dark)
- **Dirt Patches**: #4a3a2a (dark)
- **Rocks**: #5a5a5a (gray)
- **Footprints**: #3a2a1a (very dark)
- **Edge Wear**: #7a6a5a (lightest)

## Technical Implementation

### Rendering Order
1. Dark border (bottom layer)
2. Main path
3. Center worn track
4. Tire tracks (left and right)
5. Texture elements (dirt, rocks, footprints)
6. Edge wear (top layer)

### Path Generation
- Uses waypoint system with smooth curves
- Corner radius: 30px
- Rounded caps and joins for smooth appearance
- Perpendicular offset calculation for parallel tracks

### Texture Distribution
- Segments calculated every 15px along path
- Random placement within path bounds
- Controlled density for performance
- Organic randomization for natural look

## Design Features

### Worn Appearance
- Multiple layers create depth
- Center darker from heavy use
- Edges lighter from less traffic
- Tire tracks show vehicle passage

### Organic Texture
- Random dirt patches
- Scattered rocks
- Footprint impressions
- Varied opacity for depth

### Performance
- Static geometry (rendered once)
- Efficient draw calls
- Controlled element count
- No per-frame updates

## Gameplay Integration

### Visual Clarity
- Clear path for zombie movement
- Distinct from grass background
- Easy to identify at a glance
- Doesn't interfere with tower placement

### Thematic Consistency
- Matches apocalyptic setting
- Shows wear and use
- Suggests constant zombie traffic
- Complements camp and tower aesthetics

## Future Enhancements

Potential additions:

1. **Dynamic Elements**
   - Dust particles when zombies walk
   - Footprint animations
   - Tire track fade-in

2. **Damage States**
   - Cracks from heavy traffic
   - Blood stains from battles
   - Debris accumulation

3. **Weather Effects**
   - Mud puddles in rain
   - Dust in dry weather
   - Snow coverage

4. **Interactive Elements**
   - Path upgrades (paved sections)
   - Barricades across path
   - Traps visible on path

5. **Visual Feedback**
   - Path glows when zombies approach
   - Damage indicators
   - Wave progress markers

## Design Philosophy

The path embodies:

- **History**: Shows constant use and traffic
- **Realism**: Layered textures create depth
- **Functionality**: Clear visual guide for gameplay
- **Atmosphere**: Reinforces apocalyptic setting
- **Consistency**: Matches overall art style

The worn dirt road tells a story of countless zombies trudging toward the survivor camp, creating a visual narrative that enhances the game's atmosphere.

---

_Last Updated: Current Build_  
_For implementation details, see `src/renderers/VisualMapRenderer.ts`_
