---
inclusion: fileMatch
fileMatchPattern: ['**/zombies/**/*.ts', '**/Zombie*.ts', '**/WaveManager.ts', '**/Tower*.ts']
---

# Zombie Types Reference

Quick reference for zombie types, combat modifiers, and tower effectiveness.

## Quick Stats

| Type       | HP  | Speed | Reward | Size | Color    |
|------------|-----|-------|--------|------|----------|
| Basic      | 100 | 50    | $10    | 10px | Green    |
| Fast       | 80  | 100   | $15    | 10px | Orange   |
| Tank       | 300 | 25    | $50    | 15px | Red      |
| Armored    | 150 | 40    | $30    | 11px | Gray     |
| Swarm      | 30  | 60    | $5     | 6px  | Yellow   |
| Stealth    | 70  | 70    | $25    | 10px | Purple   |
| Mechanical | 120 | 55    | $40    | 12px | Cyan     |

## Tower Effectiveness Matrix

| Zombie     | Machine Gun | Sniper | Shotgun | Flame | Tesla |
|------------|-------------|--------|---------|-------|-------|
| Basic      | 100%        | 100%   | 100%    | 100%  | 100%  |
| Fast       | 100%        | 90%    | 125%    | 75%   | 125%  |
| Tank       | 70%         | 150%   | 80%     | 125%  | 100%  |
| Armored    | 75%         | 140%   | 85%     | 90%   | 120%  |
| Swarm      | 100%        | 60%    | 150%    | 140%  | 130%  |
| Stealth    | 95%         | 80%    | 115%    | 130%  | 125%  |
| Mechanical | 80%         | 120%   | 85%     | 50%   | 200%  |

## Tower Strategy Guide

- **Tesla:** Most versatile. Excellent vs Mechanical (200%), good vs Fast/Stealth/Armored
- **Shotgun:** Great vs Fast/Swarm (125-150%), decent vs Stealth
- **Sniper:** Essential vs Tank/Armored (140-150%), poor vs Swarm (60%)
- **Flame:** Good vs Tank/Stealth/Swarm, nearly useless vs Mechanical (50%)
- **Machine Gun:** Balanced but weak vs armored types (70-80%)

## Damage Calculation Pattern

```typescript
finalDamage = baseDamage * damageModifier * (1 + upgrades);
```

## Health Scaling Pattern

```typescript
baseHealth * (1 + (wave - 1) * 0.15);
```

Wave 1: 100% | Wave 5: 160% | Wave 10: 235% | Wave 20: 385%

## Wave Composition

- **Waves 1-5:** Basic (80%), Fast (20%)
- **Waves 6-10:** Basic (60%), Fast (30%), Tank (10%)
- **Waves 11+:** All types active

## File Locations

- Base: `src/objects/Zombie.ts`
- Factory: `src/objects/ZombieFactory.ts`
- Types: `src/objects/zombies/*.ts`

## See Also

- [Zombie Visual Reference](../../design_docs/Features/Zombies/VISUAL_REFERENCE.md)
- [Zombie Implementation Details](../../design_docs/Features/Zombies/IMPLEMENTATION.md)
