# Zombie Tower Defense (Z_TD) - Game Design Document

## 1. EXECUTIVE SUMMARY

**Game Title:** Zombie Tower Defense (Z_TD)
**Genre:** Tower Defense / Strategy
**Platform:** Web Browser (PC/Mobile responsive)
**Engine:** PixiJS v8 (WebGL-based 2D rendering)
**Target Audience:** Casual to mid-core strategy gamers

---

## 2. CORE CONCEPT

Z_TD is a classic tower defense game with a zombie apocalypse theme. Players defend a survivor camp from waves of undead by strategically placing defensive towers along predetermined paths. The game features a sophisticated balance analysis system, multiple tower types with unique mechanics, and a diverse cast of zombie enemies with specific resistances and weaknesses.

**Unique Selling Points:**
- Advanced balance tracking and analytics system for data-driven gameplay
- Rock-paper-scissors style damage matrix between towers and zombies
- Dynamic lighting and visual effects system
- AI player mode for automated testing and balance validation
- Comprehensive debug and development tools

---

## 3. GAMEPLAY LOOP

### Primary Loop
1. **Preparation Phase:** Player views the map, plans tower placement
2. **Build Phase:** Spend money to place and upgrade towers
3. **Combat Phase:** Zombies spawn in waves and advance toward the camp
4. **Resolution Phase:** Earn money from kills, repair/upgrade defenses
5. **Progression:** Complete waves, unlock next wave or level

### Victory/Failure Conditions
- **Victory:** Successfully defend all waves in a level
- **Failure:** Lose all survivor lives (zombies reach the camp)
- **Scoring:** Based on waves completed, survivors saved, money efficiency

---

## 4. GAME SYSTEMS

### 4.1 Economy System
- **Starting Money:** $500 (configurable per level)
- **Income Sources:**
  - Zombie kill rewards (varies by zombie type: $5-$50)
  - Wave completion bonus: $50 + (wave × $10)
- **Expenses:**
  - Tower purchase costs
  - Tower upgrades (base cost × upgrade level × 0.75 multiplier)
  - Camp upgrades (defensive buffs)

### 4.2 Life System (Survivors)
- Represented as "survivors in camp" rather than abstract lives
- Starting lives vary by difficulty/level (10-100)
- Different zombie types deal different damage when reaching camp (1-5 survivors lost)

### 4.3 Wave System
- Progressive difficulty with scaling zombie health: `baseHealth + wave × 1.8`
- Wave composition evolves over time:
  - Waves 1-3: Tutorial (Basic + Fast zombies)
  - Waves 4-5: Tank introduction
  - Waves 6-8: Armored zombies added
  - Waves 9-10: Swarm zombies introduced
  - Waves 11+: Full variety including Stealth and Mechanical

### 4.4 Upgrade System
- Towers can upgrade up to level 5
- Upgrade scaling:
  - Damage: +50% per level (+25% for Machine Gun, +20% for Grenade)
  - Fire Rate: +10% per level (+30% for Machine Gun)
  - Range: +20% per level
- Camp upgrades provide global defensive bonuses

---

## 5. TOWERS (Defensive Units)

| Tower | Cost | Damage | Range | Fire Rate | Special Ability |
|-------|------|--------|-------|-----------|-----------------|
| **Machine Gun** | $250 | 6 | 150 | 8.0/s | High fire rate, rapid upgrades |
| **Sniper** | $900 | 140 | 400 | 1.0/s | Armor-piercing, long range |
| **Shotgun** | $400 | 60 | 120 | 0.8/s | Double barrel burst, cone spread |
| **Flame** | $750 | 180 | 120 | 0.75/s | Area DoT, burning effect |
| **Tesla** | $1500 | 110 | 200 | 1.5/s | Chain lightning, multi-target |
| **Grenade** | $1250 | 90 | 180 | 0.3/s | Explosive area damage, arc trajectory |
| **Sludge** | $800 | 0 | 100 | 0.25/s | Creates slowing toxic pools |

### Tower Idle Animations
Each tower features unique idle behavior:
- **Machine Gun:** Barrel heat glow effect
- **Sniper:** Laser sight sweeping
- **Shotgun:** Breach loading animation
- **Flame:** Pilot light flicker
- **Tesla:** Arcing electricity
- **Grenade:** Ammo crate shuffling
- **Sludge:** Toxic bubble emission

---

## 6. ZOMBIES (Enemies)

| Zombie | Health | Speed | Reward | Damage | Special Traits |
|--------|--------|-------|--------|--------|----------------|
| **Basic** | 100 | 50 | $10 | 1 | Standard zombie |
| **Fast** | 70 | 100 | $15 | 1 | Quick but fragile |
| **Tank** | 500 | 25 | $50 | 5 | Massive health, slow |
| **Armored** | 300 | 40 | $30 | 3 | High physical resistance |
| **Swarm** | 50 | 60 | $5 | 1 | Small, numerous, weak individually |
| **Stealth** | 120 | 70 | $25 | 2 | Harder to target |
| **Mechanical** | 250 | 55 | $40 | 4 | Metal plating, circuits |

### Damage Resistance Matrix

| Zombie | Machine Gun | Sniper | Shotgun | Flame | Tesla | Grenade |
|--------|-------------|--------|---------|-------|-------|---------|
| **Basic** | 1.0× | 1.0× | 1.0× | 1.0× | 1.0× | 1.0× |
| **Fast** | 0.6× | 0.9× | 1.25× | 0.75× | 1.25× | 1.15× |
| **Tank** | 0.7× | 1.5× | 0.8× | 1.25× | 1.0× | 1.3× |
| **Armored** | 0.5× | 1.4× | 0.85× | 0.25× | 1.2× | 1.5× |
| **Swarm** | 0.5× | 0.6× | 1.5× | 1.4× | 1.3× | 1.6× |
| **Stealth** | 0.95× | 0.8× | 1.15× | 1.3× | 1.25× | 1.2× |
| **Mechanical** | 0.8× | 1.2× | 0.85× | 0.5× | 2.0× | 0.9× |

*Values > 1.0 = Weakness (takes more damage), Values < 1.0 = Resistance (takes less damage)*

---

## 7. LEVELS & MAPS

### Available Levels

| Level | Name | Difficulty | Starting Money | Starting Lives | Map Theme |
|-------|------|------------|----------------|----------------|-----------|
| 1 | Training Grounds | Easy | $500 | 20 | Default/Grass |
| 2 | Forest Path | Normal | $400 | 15 | Forest |
| 3 | Urban Maze | Hard | $300 | 10 | City |

### Map Features
- Predefined spawn points and waypoints
- Camp location (defend target)
- Buildable areas for tower placement
- Visual themes affecting atmosphere

---

## 8. USER INTERFACE

### HUD Elements
- **Top Left:** Money, Lives (Survivors), Wave, Score
- **Right Side:** Tower Shop (220px width, full height)
- **Bottom:** Action bar with Next Wave button
- **Bottom Right (below shop):** Tower Info Panel (300px height)

### Screens
- **Main Menu:** Title, Start Game button
- **Level Select:** Unlocked levels with descriptions
- **Game Over:** Final score, restart/main menu options
- **Victory:** Level completion, stats summary

### Debug UI (Development)
- Stats panel with balance analysis
- Shader test panel
- Wave info panel
- Bestiary (zombie spawn testing)
- AI control panel
- Debug info overlay

---

## 9. VISUAL & AUDIO DESIGN

### Visual Style
- Top-down 2D perspective
- Dark, post-apocalyptic color palette
- Blood particle system for combat feedback
- Corpse persistence for battlefield atmosphere
- Dynamic lighting effects (tower range indicators, muzzle flashes)
- Fog of war option (configurable per level)

### Effects Systems
- Blood splatter particles (intensity based on zombie size)
- Projectile trails (bullet, sniper, shotgun, flame, tesla, grenade)
- Impact effects
- Shell casing ejection
- Tower barrel heat glow
- Damage flash on camp hit
- Money gain floating animations

---

## 10. TECHNICAL ARCHITECTURE

### Core Technologies
- **PixiJS v8:** 2D WebGL rendering
- **TypeScript:** Type-safe development
- **Vite:** Build tooling and dev server
- **Vitest:** Unit testing framework

### Manager Architecture
```
GameManager (Main Orchestrator)
├── LevelState (Combat managers container)
├── EconomyState (Money/lives tracking)
├── AnalyticsState (AI, stats, balance)
├── TowerManager (Tower definitions)
├── TowerPlacementManager (Placement logic)
├── TowerCombatManager (Combat resolution)
├── ZombieManager (Spawning, updates)
├── WaveManager (Wave composition)
├── ProjectileManager (Projectile lifecycle)
├── EffectManager (Visual effects)
├── MapManager (Map data)
└── InputManager (Input handling)
```

### Key Systems
- **EventBus:** Decoupled inter-system communication
- **Component Pattern:** Game objects use component architecture
- **Renderer Pattern:** Separated visual rendering from game logic
- **Spatial Grid:** Optimized collision detection
- **Dirty Flag System:** Performance-optimized array updates

---

## 11. BALANCE & ANALYTICS

### Balance Analysis Tools
The game includes sophisticated built-in balance analysis:

#### Metrics Tracked
- Damage per dollar spent
- Kills per dollar spent
- Economy efficiency (income/expenses ratio)
- Survival rate percentage
- Overkill damage percentage
- Accuracy rate
- Break-even time per tower
- Threat score per zombie type

#### Thresholds
- Minimum damage per dollar: 15
- Minimum survival rate: 50%
- Maximum overkill: 15%
- Break-even time window: 15-30 seconds

#### AI Player System
- Automated tower placement based on cost-efficiency algorithms
- Strategic positioning using defensive value scoring
- Performance testing across multiple waves
- Data export for external analysis

---

## 12. DIFFICULTY MODES

| Mode | Modifier | Description |
|------|----------|-------------|
| **Easy** | 0.8× zombie health | Relaxed experience for beginners |
| **Normal** | 1.0× zombie health | Standard challenge |
| **Hard** | 1.3× zombie health | Reduced resources, faster waves |
| **Nightmare** | 1.8× zombie health | Maximum challenge, permadeath elements |

---

## 13. DEVELOPMENT FEATURES

### Debug Configuration
- Debug constants for starting money/lives/wave override
- Performance monitoring (FPS, entity counts, memory)
- Optimization validation (dirty flags, array rebuilds)
- Resource cleanup tracking

### Testing Tools
- Headless combat simulation
- Balance simulation with statistical analysis
- Wave balancing console commands
- Tower-specific unit tests

---

## 14. FUTURE ROADMAP (Implied)

Based on codebase structure, planned features include:
- Additional tower types (Mortar, Laser, Cryo)
- Boss zombie encounters
- Skill tree/perk system
- Multiplayer cooperative mode
- Map editor
- Steam Workshop integration

---

## 15. FILE STRUCTURE

```
src/
├── components/      # ECS components (Health, Transform)
├── config/          # Game balance constants
├── managers/        # Game systems (24 managers)
├── objects/         # Game entities (towers, zombies, projectiles)
├── renderers/       # Visual rendering (52 renderers)
├── ui/              # User interface (37 components)
├── utils/           # Utilities (27 modules)
└── types/           # TypeScript definitions
```

---

**Document Version:** 1.0
**Last Updated:** May 2026
**Author:** Game Development Team
