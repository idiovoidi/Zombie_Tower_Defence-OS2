# Wave System

## Overview

The wave system manages zombie spawning, wave progression, difficulty scaling, and wave completion logic.

## Contents

- [ENHANCED_WAVE_PROGRESSION.md](ENHANCED_WAVE_PROGRESSION.md) - Enhanced wave progression design

## Key Features

### Wave Progression

- Progressive difficulty increase
- Zombie type introduction schedule
- Health scaling per wave
- Spawn rate adjustments

### Zombie Composition

- **Waves 1-5**: Basic (80%), Fast (20%)
- **Waves 6-10**: Basic (60%), Fast (30%), Tank (10%)
- **Waves 11+**: All zombie types active

### Health Scaling

```typescript
zombieHealth = baseHealth * (1 + (wave - 1) * 0.15);
```

- Wave 1: 100% base health
- Wave 5: 160% base health
- Wave 10: 235% base health
- Wave 20: 385% base health

### Spawn Timing

- Spawn interval decreases with wave number
- More zombies per wave as difficulty increases
- Boss waves at specific intervals

## Related Documentation

- [Zombies](../Zombies/README.md) - Zombie types and stats
- [Game Balance](../../Game_Balance/WAVE_BALANCING_GUIDE.md) - Wave balancing guide
- [Wave Progression Guide](../../Game_Balance/WAVE_PROGRESSION_GUIDE.md) - Detailed progression design

## Wave Manager

The WaveManager handles:

- Wave state management
- Zombie spawning
- Wave completion detection
- Difficulty scaling
- Wave rewards

## See Also

- [Zombie Patterns](../../../.kiro/steering/features/zombies.md)
- [Product Overview](../../../.kiro/steering/product.md)
