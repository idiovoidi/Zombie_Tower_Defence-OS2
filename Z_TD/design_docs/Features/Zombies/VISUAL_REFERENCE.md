# Zombie Visual Reference

Complete visual specifications for all zombie types in Z-TD.

## Overview

This document provides detailed visual descriptions and rendering specifications for each zombie type. Use this as a reference when implementing zombie graphics, animations, or visual effects.

## Color Constants

```typescript
BASIC:      0x00ff00  // Green
FAST:       0xff6600  // Orange
TANK:       0xff0000  // Red
ARMORED:    0x888888  // Gray
SWARM:      0xffff00  // Yellow
STEALTH:    0x6600ff  // Purple
MECHANICAL: 0x00ffff  // Cyan
```

## Zombie Visual Specifications

### 1. Basic Zombie 🧟

**Color:** `0x00ff00` (green)

**Size:** 10px

**Visual Description:**
- Green humanoid shape
- Round head
- Extended arms forward
- Shambling gait animation
- Standard zombie appearance

**Animation Style:**
- Slow, unsteady movement
- Arms sway slightly
- Head bobs gently

**Purpose:** Baseline visual design, easily recognizable as standard zombie

---

### 2. Fast Zombie 🏃

**Color:** `0xff6600` (orange)

**Size:** 10px

**Visual Description:**
- Orange streamlined body
- Leaning forward posture (aggressive stance)
- Rapid leg animation
- Thinner profile than Basic
- Dynamic, energetic appearance

**Animation Style:**
- Fast, smooth movement
- Legs blur with speed
- Body tilted forward 15-20 degrees
- Minimal arm movement (focused on running)

**Purpose:** Convey speed and agility through posture and color

---

### 3. Tank Zombie 💪

**Color:** `0xff0000` (red)

**Size:** 15px (largest standard zombie)

**Visual Description:**
- Large, bulky red body
- Wide shoulders (1.5x normal width)
- Thick limbs
- Lumbering, heavy gait
- Imposing presence

**Animation Style:**
- Slow, heavy footsteps
- Ground shake effect (optional)
- Minimal upper body movement
- Steady, unstoppable advance

**Purpose:** Communicate high health and durability through size and color

---

### 4. Armored Zombie 🛡️

**Color:** `0x888888` (gray metallic)

**Size:** 11px

**Visual Description:**
- Gray metallic body
- Helmet or head protection
- Plated armor segments
- Rigid, mechanical stance
- Angular, protected appearance

**Animation Style:**
- Stiff, rigid movement
- Minimal joint flexibility
- Metallic sheen effect
- Clanking sound (if audio implemented)

**Purpose:** Visual indication of armor and resistance to damage

---

### 5. Swarm Zombie 🐝

**Color:** `0xffff00` (yellow)

**Size:** 6px (smallest zombie)

**Visual Description:**
- Small yellow body
- Hunched, scurrying posture
- Compact form
- Appears in groups of 10-20
- Insect-like movement

**Animation Style:**
- Rapid, erratic movement
- Scuttling motion
- Swarm behavior (cluster together)
- Quick directional changes

**Purpose:** Small size and bright color make swarms visually distinct

---

### 6. Stealth Zombie 👻

**Color:** `0x6600ff` (purple)

**Size:** 10px

**Visual Description:**
- Purple semi-transparent body (50-70% opacity)
- Crouched, sneaking posture
- Faded edges
- Ghostly appearance
- Shimmer effect

**Animation Style:**
- Smooth, gliding movement
- Opacity flickers (40-80%)
- Low profile (crouched)
- Minimal visual noise

**Rendering Notes:**
- Use alpha blending for transparency
- Consider phase-in/phase-out effect
- Harder to spot visually (intentional)

**Purpose:** Transparency conveys stealth mechanic

---

### 7. Mechanical Zombie 🤖

**Color:** `0x00ffff` (cyan)

**Size:** 12px

**Visual Description:**
- Cyan metallic body
- Angular, geometric design
- Glowing parts (eyes, joints, core)
- Robotic appearance
- Sharp edges and clean lines

**Animation Style:**
- Precise, mechanical movement
- No organic sway
- Servo-motor style motion
- Glowing parts pulse
- Sparks when damaged (optional)

**Rendering Notes:**
- Add glow effect to cyan color
- Consider emissive lighting
- Metallic shader if available

**Purpose:** Robotic appearance signals vulnerability to Tesla (electrical)

---

## Visual Hierarchy

### Size Comparison
```
Tank (15px) > Mechanical (12px) > Armored (11px) > Basic/Fast/Stealth (10px) > Swarm (6px)
```

### Opacity
- Standard: 100% (Basic, Fast, Tank, Armored, Swarm, Mechanical)
- Stealth: 50-70% (semi-transparent)

### Visual Complexity
- Simple: Basic, Fast, Swarm
- Moderate: Tank, Armored, Stealth
- Complex: Mechanical (glowing parts, angular design)

## Color Psychology

- **Green (Basic):** Standard, neutral, recognizable zombie
- **Orange (Fast):** Energy, speed, urgency
- **Red (Tank):** Danger, high threat, stop
- **Gray (Armored):** Metal, protection, durability
- **Yellow (Swarm):** Caution, numerous, insects
- **Purple (Stealth):** Mystery, stealth, supernatural
- **Cyan (Mechanical):** Technology, artificial, electrical

## Rendering Considerations

### Performance
- Swarm zombies appear in groups of 10-20, optimize rendering
- Stealth transparency requires alpha blending
- Mechanical glow effects may impact performance

### Visibility
- All zombies must be clearly visible against game background
- Stealth zombies intentionally harder to spot (50-70% opacity)
- Color contrast ensures each type is distinguishable

### Animation
- Movement speed should match zombie speed stat
- Tank zombies should feel heavy (slow, steady)
- Fast zombies should feel urgent (rapid, forward-leaning)
- Swarm zombies should cluster and scatter

## Debug Visualization

When debugging, consider adding:
- Health bars above zombies
- Speed indicators
- Damage modifier overlays
- Pathfinding visualization

## Implementation Notes

All visual specifications are implemented in:
- `src/objects/Zombie.ts` - Base rendering
- `src/objects/zombies/*.ts` - Type-specific visuals
- `src/renderers/ZombieRenderer.ts` - Rendering logic (if exists)

## Future Enhancements

Potential visual improvements:
- Death animations per type
- Damage state visuals (wounded appearance)
- Status effect indicators (burning, electrocuted)
- Particle effects (sparks for Mechanical, smoke for Tank)
- Shadows or ground effects
