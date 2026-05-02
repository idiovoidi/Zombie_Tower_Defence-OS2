# Necro Tank Boss - Design Document

**Type:** Mini-Boss Zombie  
**Status:** Design Phase  
**Priority:** High  
**Target Version:** v1.x  

---

## 1. EXECUTIVE SUMMARY

The Necro Tank is Z_TD's first mini-boss encounter, designed to test mid-to-late wave defenses with multi-phase mechanics that force strategic adaptation. It combines the durability of a Tank with necromantic resurrection abilities and dynamic armor mechanics that respond to fire damage.

**Core Design Philosophy:**
- **Binary Check:** Forces players to prepare area damage (for swarm spawns) AND sustained single-target (for boss health pool)
- **Adaptation Tax:** Players must reallocate defenses mid-fight when armor sheds
- **Analytics Integration:** Provides rich data on overkill inefficiency and tower type effectiveness

---

## 2. STATS & ATTRIBUTES

| Attribute | Value | Scaling per Wave |
|-----------|-------|------------------|
| **Health** | 2500 (base) | +350 per wave above 10 |
| **Speed** | 20 | No scaling |
| **Reward** | $200 | +$25 per wave above 10 |
| **Camp Damage** | 10 | No scaling |
| **Armor** | 50% damage reduction (Phase 1) | -5% per ignite event |
| **Mass** | 3.0× (for blood/corpse sizing) | N/A |

**Spawn Criteria:**
- First appearance: Wave 12
- Spawn limit: 1 per wave (mini-boss)
- Spawn chance: 15% on eligible waves (12+)

---

## 3. RESISTANCE MATRIX

| Tower | Modifier | Rationale |
|-------|----------|-----------|
| **Machine Gun** | 0.4× | Heavy necrotic hide absorbs bullets |
| **Sniper** | 1.6× | Headshots disrupt necromantic energy |
| **Shotgun** | 0.7× | Pellets scatter on bone plating |
| **Flame** | 2.0× (initial) → 0.8× (after shed) | Burns armor off, then less effective on exposed flesh |
| **Tesla** | 1.4× | Electricity disrupts reanimation circuits |
| **Grenade** | 1.2× | Explosives crack bone armor |

**Dynamic Resistance:**
- Pre-shed: Flame deals 200% damage (armor burns away)
- Post-shed: Flame deals 80% damage (exposed necrotic flesh is flame-resistant)
- Armor state visible via visual indicator (see Section 6)

---

## 4. CORE MECHANICS

### 4.1 Corpse Revival (Necromancy)

**Trigger:** Periodic ability (every 8-12 seconds, randomized)

**Effect:**
1. Scans for zombie corpses within 200px radius
2. Selects up to 3 corpses (prioritizes closest)
3. Plays 1.5s resurrection animation (necrotic energy surge)
4. Spawns Swarm zombies at corpse locations
5. Consumes the corpses (removed from CorpseManager)

**Spawn Rules:**
- 1 corpse revived → 2 Swarm zombies
- 2 corpses revived → 3 Swarm zombies
- 3 corpses revived → 4 Swarm zombies

**Strategic Impact:**
- Players must manage corpse placement (area denial becomes resource)
- Swarm zombies are vulnerable to Shotgun/Grenade (matrix synergy)
- Creates "corpse economy" decision: let corpses decay vs. risk revival

**Analytics Hook:**
```typescript
// Track in BalanceTrackingManager
necroRevivalEvents: {
  corpsesConsumed: number,
  swarmSpawned: number,
  playerResponseTime: number, // seconds to kill spawned swarms
  overkillOnSwarms: number    // inefficient damage wasted
}
```

### 4.2 Armor Shedding (Ignition Response)

**Trigger:** Cumulative fire damage threshold (300 damage from Flame towers)

**Phases:**
1. **Armored (100-66% health):** Full 50% damage reduction, dark bone armor visible
2. **Cracking (66-33% health):** 25% damage reduction, armor shows flame cracks, glows orange
3. **Exposed (33-0% health):** 0% damage reduction, armor completely shed, pulsing necrotic core visible

**Shed Event (transition between phases):**
- Plays 2s animation: armor plates explode outward as shrapnel
- Shrapnel deals 50 area damage to nearby zombies (friendly fire possible)
- Leaves burning bone fragments on ground (decorative, fade after 5s)
- Necro Tank gains +15 speed for 3 seconds (pain rage)

**Strategic Impact:**
- Flame towers are essential early but suboptimal late (matrix inversion)
- Forces hybrid builds: Flame to crack armor, then Sniper/Tesla to finish
- Speed burst punishes static defenses (range coverage check)

**Analytics Hook:**
```typescript
// Track phase transitions for balance analysis
armorShedEvents: {
  damageToShed: number,        // actual flame damage dealt
  timeToFirstShed: number,   // seconds from spawn
  playerTowerSwitchEfficiency: number  // did they adapt?
}
```

---

## 5. VISUAL DESIGN

### 5.1 Appearance (Phased)

**Phase 1: Armored Necro Tank**
- Base: Bloated necrotic body (Tank scale ×1.4)
- Armor: Jagged bone plates grafted onto flesh
- Glow: Faint purple necromantic aura (revival energy)
- Eyes: Dual green orbs (targeting weak points hint)

**Phase 2: Cracking**
- Armor: Orange cracks spread from impact points
- Aura: Flickers between purple and orange
- Steam: Smokes from cracks (heat venting)

**Phase 3: Exposed**
- Armor: Missing plates reveal pulsating necrotic mass
- Core: Glowing heart visible (2× damage vulnerability spot)
- Trail: Leaves slime/debris (movement evidence)

### 5.2 Animations

| State | Animation | Duration |
|-------|-----------|----------|
| **Idle** | Heavy breathing, bone plates shift | Loop |
| **Move** | Lumbering stomp, screen shake on step | Per step |
| **Revival Cast** | Raises arms, purple beam to corpses | 1.5s |
| **Armor Shed** | Convulsion, plates explode outward | 2.0s |
| **Death** | Core implodes, necrotic energy dissipates | 3.0s |

### 5.3 Effects

- **Revival Beam:** Purple energy tether from Necro Tank to corpses
- **Resurrection Burst:** Swarm zombies emerge from ground with particle burst
- **Armor Shrapnel:** Bone fragments as projectiles (cosmetic, no collision)
- **Death Implosion:** Sucks in light, then explodes outward (no damage)

---

## 6. AUDIO DESIGN

| Event | Sound Description |
|-------|-------------------|
| **Spawn** | Deep bone creaking, necromantic hum |
| **Revival Cast** | Chanting, energy charging, corpse reanimation |
| **Armor Crack** | Metal/bone stress sounds, steam hiss |
| **Armor Shed** | Explosive shattering, pain roar |
| **Death** | Core implosion, energy dissipating |
| **Ambient** | Low-frequency heartbeat (30bpm, ominous) |

---

## 7. ANALYTICS & BALANCE INTEGRATION

### 7.1 Key Metrics to Track

**Threat Assessment:**
- Time alive vs. expected (threshold: 30-60 seconds)
- Survivor damage dealt (should be 0-10, 10 = reached camp)
- Zombie spawns generated (corpse revival efficiency)

**Player Response:**
- Tower composition when Necro Tank spawns
- Damage per tower type (resistance matrix validation)
- Time to armor shed (is 300 flame damage threshold balanced?)
- Time to kill post-shed (is exposure vulnerability sufficient?)

**Balance Red Flags:**
```
IF time_to_kill > 90s → Boss too tanky, reduce health or increase vulnerabilities
IF flame_damage_percent < 20% → Armor shed not triggering, reduce threshold
IF swarm_spawns_survival > 5s → Revivals too effective, reduce spawn count
IF sniper_damage_percent > 50% → Over-reliance on one tower, adjust resistance
```

### 7.2 Resistance Matrix Validation

Expected damage distribution (balanced state):
- Sniper: 25-30% (headshot vulnerability)
- Flame: 20-25% (early armor cracking)
- Tesla: 20-25% (consistent throughout)
- Grenade: 15-20% (area for swarms + boss)
- Shotgun: 10-15% (swarm cleanup)
- Machine Gun: 5-10% (suppression only)

---

## 8. IMPLEMENTATION PLAN

### Phase 1: Core Structure
1. Create `NecroTankZombie.ts` class extending Zombie
2. Add `NECRO_TANK` to `ZOMBIE_TYPES` in gameConfig.ts
3. Add `NECRO_TANK` resistance matrix entry
4. Create `NecroTankRenderer.ts` with Phase 1 visuals

### Phase 2: Mechanics
5. Implement corpse detection and revival system
6. Implement armor phase tracking and shedding
7. Add phase visual transitions
8. Implement shrapnel effects

### Phase 3: Integration
9. Add spawn logic to WaveManager (wave 12+, 15% chance)
10. Add analytics hooks to BalanceTrackingManager
11. Add death animation and effects
12. Test with AI Player for balance validation

### Phase 4: Polish
13. Audio implementation
14. Particle effect refinement
15. Balance tuning based on analytics
16. Documentation update

---

## 9. FILES TO CREATE/MODIFY

### New Files
```
src/
├── objects/zombies/NecroTankZombie.ts
├── renderers/zombies/NecroTankRenderer.ts
└── effects/NecroRevivalEffect.ts (optional particle system)

docs/
└── Design_Docs/design_docs/
    └── NECRO_TANK_BOSS.md (this document)
```

### Modified Files
```
src/
├── config/gameConfig.ts (add NECRO_TANK type)
├── config/zombieResistances.ts (add resistance matrix entry)
├── objects/zombies/index.ts (export NecroTankZombie)
├── renderers/zombies/index.ts (export NecroTankRenderer)
├── managers/ZombieManager.ts (spawn logic)
├── managers/WaveManager.ts (wave eligibility)
└── managers/BalanceTrackingManager.ts (analytics hooks)
```

---

## 10. TESTING CHECKLIST

- [ ] Spawns correctly on wave 12+ with 15% probability
- [ ] Revival ability triggers every 8-12s when corpses present
- [ ] Swarm zombie count scales with corpses consumed (2/3/4)
- [ ] Armor shed triggers after 300 cumulative flame damage
- [ ] Resistance matrix updates post-shed (flame 2.0× → 0.8×)
- [ ] Speed boost (+15) applies for 3s after shed
- [ ] Shrapnel deals 50 area damage to nearby zombies
- [ ] Visual phases transition correctly
- [ ] Death animation plays without memory leaks
- [ ] Analytics data captures all key metrics
- [ ] AI Player can defeat with reasonable tower composition
- [ ] No console errors during lifecycle

---

## 11. DESIGN RATIONALE

**Why These Mechanics?**

1. **Corpse Revival** leverages the existing corpse system as a gameplay resource. It turns the "atmosphere" feature (corpses on battlefield) into a strategic element, fitting Z_TD's analytics-driven design philosophy.

2. **Armor Shedding** creates a "gear check" moment. Players must have Flame towers to unlock the boss's vulnerable state, but the matrix inversion punishes over-investment in Flame. This encourages diverse tower builds.

3. **Mini-Boss Not Boss** - Spawns as a rare elite within normal waves rather than a separate encounter. This lets us test boss mechanics without disrupting the core tower defense loop.

**Analytics Value:**
The Necro Tank generates rich data on:
- Multi-phase encounter balance
- Damage matrix effectiveness
- Player adaptation speed (metric: time between shed and tower sell/buy)
- Corpse system interaction (previously unmeasured)

---

**Document Version:** 1.0  
**Last Updated:** May 2026  
**Author:** Design Team
