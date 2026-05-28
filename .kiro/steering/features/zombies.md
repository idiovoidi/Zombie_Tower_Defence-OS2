---
inclusion: fileMatch
fileMatchPattern: ['**/zombies/**/*.ts', '**/Zombie*.ts', '**/WaveManager.ts', '**/Tower*.ts']
---

# Zombie Reference

## Stats

| Type | HP | Speed | Reward | Size |
|------|----|-------|--------|------|
| Basic | 100 | 50 | $10 | 10px |
| Fast | 80 | 100 | $15 | 10px |
| Tank | 300 | 25 | $50 | 15px |
| Armored | 150 | 40 | $30 | 11px |
| Swarm | 30 | 60 | $5 | 6px |
| Stealth | 70 | 70 | $25 | 10px |
| Mechanical | 120 | 55 | $40 | 12px |

## Tower Effectiveness

| Zombie | MachineGun | Sniper | Shotgun | Flame | Tesla |
|--------|-----------|--------|---------|-------|-------|
| Basic | 100% | 100% | 100% | 100% | 100% |
| Fast | 100% | 90% | 125% | 75% | 125% |
| Tank | 70% | 150% | 80% | 125% | 100% |
| Armored | 75% | 140% | 85% | 90% | 120% |
| Swarm | 100% | 60% | 150% | 140% | 130% |
| Stealth | 95% | 80% | 115% | 130% | 125% |
| Mechanical | 80% | 120% | 85% | 50% | 200% |

**Best picks:** Tesla (versatile), Sniper (Tank/Armored), Shotgun (Fast/Swarm), Flame (Tank/Swarm), avoid Flame vs Mechanical.

## Formulas
```typescript
finalDamage = baseDamage * damageModifier * (1 + upgrades);
scaledHealth = baseHealth * (1 + (wave - 1) * 0.15);
// Wave 1: 100% | Wave 5: 160% | Wave 10: 235% | Wave 20: 385%
```

## Wave Composition
- Waves 1-5: Basic 80%, Fast 20%
- Waves 6-10: Basic 60%, Fast 30%, Tank 10%
- Waves 11+: all types

## Key Files
- `src/objects/Zombie.ts`, `src/objects/ZombieFactory.ts`
- `src/objects/zombies/` — type implementations
- `src/config/zombieResistances.ts` — damage modifiers
