# Zombie Strengths & Weaknesses System

## Overview

Each zombie type has unique resistances and vulnerabilities to different tower types, adding strategic depth to tower placement and upgrade decisions.

---

## 🧟 Basic Zombie

**Type:** Standard undead  
**Characteristics:** Balanced, no special traits

### Resistances

- None

### Weaknesses

- None

### Damage Modifiers

- All towers: 100% (normal damage)

**Strategy:** Good for testing tower effectiveness, no special considerations needed.

---

## 🏃 Fast Zombie

**Type:** Athletic runner  
**Characteristics:** High speed, low health

### Resistances

- Flame Tower: 75% damage (runs through fire quickly)

### Weaknesses

- Shotgun Tower: 125% damage (spread catches fast targets)
- Tesla Tower: 125% damage (instant hit, no dodging)

### Damage Modifiers

- Machine Gun: 100%
- Sniper: 90% (harder to hit moving target)
- Shotgun: 125%
- Flame: 75%
- Tesla: 125%

**Strategy:** Use area-effect and instant-hit towers. Avoid single-target precision towers.

---

## 💪 Tank Zombie

**Type:** Heavily armored brute  
**Characteristics:** Very high health, very slow

### Resistances

- Machine Gun: 70% damage (bullets bounce off armor)
- Shotgun: 80% damage (pellets less effective)

### Weaknesses

- Sniper Tower: 150% damage (armor-piercing rounds)
- Flame Tower: 125% damage (sustained burn damage)

### Damage Modifiers

- Machine Gun: 70%
- Sniper: 150%
- Shotgun: 80%
- Flame: 125%
- Tesla: 100%

**Strategy:** Use high-damage single-target towers. Sustained damage over time is effective.

---

## 🛡️ Armored Zombie

**Type:** Military-grade armor  
**Characteristics:** Moderate health, moderate speed, armored

### Resistances

- Machine Gun: 75% damage (armor deflects bullets)
- Shotgun: 85% damage (armor absorbs pellets)
- Flame: 90% damage (heat-resistant armor)

### Weaknesses

- Sniper Tower: 140% damage (armor-piercing)
- Tesla Tower: 120% damage (electricity bypasses armor)

### Damage Modifiers

- Machine Gun: 75%
- Sniper: 140%
- Shotgun: 85%
- Flame: 90%
- Tesla: 120%

**Strategy:** Prioritize sniper and tesla towers. Avoid rapid-fire low-damage towers.

---

## 🐝 Swarm Zombie

**Type:** Small, numerous  
**Characteristics:** Very low health, fast, appears in groups

### Resistances

- Sniper Tower: 60% damage (overkill, wasted damage)

### Weaknesses

- Shotgun Tower: 150% damage (spread hits multiple)
- Flame Tower: 140% damage (area damage)
- Tesla Tower: 130% damage (chain lightning)

### Damage Modifiers

- Machine Gun: 100%
- Sniper: 60%
- Shotgun: 150%
- Flame: 140%
- Tesla: 130%

**Strategy:** Use area-effect towers. Single-target high-damage towers waste damage.

---

## 👻 Stealth Zombie

**Type:** Shadowy, evasive  
**Characteristics:** Low health, fast, semi-transparent

### Resistances

- Sniper Tower: 80% damage (hard to target precisely)

### Weaknesses

- Flame Tower: 130% damage (reveals and burns)
- Tesla Tower: 125% damage (auto-targeting)
- Shotgun Tower: 115% damage (spread coverage)

### Damage Modifiers

- Machine Gun: 95%
- Sniper: 80%
- Shotgun: 115%
- Flame: 130%
- Tesla: 125%

**Strategy:** Use auto-targeting and area towers. Avoid precision towers.

---

## 🤖 Mechanical Zombie

**Type:** Robot/cyborg  
**Characteristics:** Moderate health, consistent movement, mechanical

### Resistances

- Machine Gun: 80% damage (metal plating)
- Shotgun: 85% damage (armor plating)
- Flame: 50% damage (heat-resistant metal)

### Weaknesses

- Tesla Tower: 200% damage (electricity fries circuits)
- Sniper Tower: 120% damage (precision targeting weak points)

### Damage Modifiers

- Machine Gun: 80%
- Sniper: 120%
- Shotgun: 85%
- Flame: 50%
- Tesla: 200%

**Strategy:** Tesla towers are HIGHLY effective. Flame towers are nearly useless.

---

## 📊 Tower Effectiveness Matrix

| Zombie Type    | Machine Gun | Sniper | Shotgun | Flame | Tesla |
| -------------- | ----------- | ------ | ------- | ----- | ----- |
| **Basic**      | 100%        | 100%   | 100%    | 100%  | 100%  |
| **Fast**       | 100%        | 90%    | 125%    | 75%   | 125%  |
| **Tank**       | 70%         | 150%   | 80%     | 125%  | 100%  |
| **Armored**    | 75%         | 140%   | 85%     | 90%   | 120%  |
| **Swarm**      | 100%        | 60%    | 150%    | 140%  | 130%  |
| **Stealth**    | 95%         | 80%    | 115%    | 130%  | 125%  |
| **Mechanical** | 80%         | 120%   | 85%     | 50%   | 200%  |

---

## 🎯 Strategic Implications

### Best All-Around Towers

1. **Tesla Tower** - Effective against most types, excellent vs Mechanical
2. **Shotgun Tower** - Great vs Fast and Swarm, decent vs others
3. **Flame Tower** - Good vs Tank and Stealth, poor vs Mechanical

### Specialized Towers

- **Sniper** - Essential for Tank and Armored, poor vs Swarm
- **Machine Gun** - Balanced but weak vs armored types

### Tower Synergies

- **Sniper + Machine Gun** - Sniper for tanks, MG for basics
- **Tesla + Flame** - Tesla for mechanical, Flame for organic
- **Shotgun + Sniper** - Shotgun for swarms, Sniper for tanks

---

## 💡 Gameplay Considerations

### Wave Composition

- **Early waves** (1-5): Mostly Basic and Fast → Machine Gun, Shotgun
- **Mid waves** (6-10): Add Tank → Need Sniper towers
- **Late waves** (11+): All types → Diverse tower composition required

### Resource Management

- Don't over-invest in single tower type
- Adapt to zombie composition each wave
- Upgrade strategically based on incoming threats

### Tower Placement

- **Choke points**: Flame and Shotgun (area damage)
- **Long paths**: Sniper (sustained single-target)
- **Mixed areas**: Tesla (versatile)

---

## 🔧 Implementation Notes

### Damage Calculation

```typescript
finalDamage = baseDamage * damageModifier * (1 + upgrades);
```

### Resistance System

- Modifiers are multiplicative
- Applied before other damage calculations
- Visual feedback for effective/ineffective hits

### Future Enhancements

- Critical hits ignore resistances
- Tower upgrades can reduce enemy resistances
- Special abilities that bypass resistances
- Combo bonuses for using correct tower types

---

## 🎮 Player Communication

### Visual Feedback

- **Green numbers**: Effective damage (>100%)
- **White numbers**: Normal damage (100%)
- **Red numbers**: Resisted damage (<100%)
- **Hit effects**: Different colors based on effectiveness

### UI Indicators

- Zombie info panel shows resistances/weaknesses
- Tower targeting shows effectiveness preview
- Wave preview shows zombie type composition

---

## ⚖️ Balance Goals

### Design Principles

1. No zombie should be immune (minimum 50% damage)
2. No tower should be useless against any type
3. Weaknesses should be significant (125%+ damage)
4. Resistances should matter but not negate (70-90% damage)
5. Strategic diversity encouraged over single-tower spam

### Testing Metrics

- Each tower type should be viable in different scenarios
- Players should need 3+ tower types for late game
- No single tower should dominate all situations
- Zombie variety should force strategic adaptation

---

**Status:** 📝 Design Complete - Ready for Review  
**Next Step:** Confirm design, then implement damage modifier system
