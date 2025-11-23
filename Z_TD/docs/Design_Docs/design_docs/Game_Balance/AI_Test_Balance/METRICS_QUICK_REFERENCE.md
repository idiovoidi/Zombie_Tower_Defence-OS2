# Player Metrics - Quick Reference Card

## 📊 Key Metrics at a Glance

### Combat Performance ⚔️

| Metric            | Good | Fair    | Poor |
| ----------------- | ---- | ------- | ---- |
| **Average DPS**   | >150 | 100-150 | <100 |
| **Accuracy Rate** | >80% | 60-80%  | <60% |
| **Overkill %**    | <5%  | 5-10%   | >10% |

### Economy Health 💰

| Metric                 | Good    | Fair     | Poor      |
| ---------------------- | ------- | -------- | --------- |
| **Economy Efficiency** | >150%   | 100-150% | <100%     |
| **Cash Flow Trend**    | GROWING | STABLE   | DECLINING |
| **Bankruptcy Events**  | 0       | 1        | >1        |

### Cost Efficiency 📈

| Metric            | Excellent | Good    | Fair     | Poor  |
| ----------------- | --------- | ------- | -------- | ----- |
| **Damage/Dollar** | >100      | 50-100  | 25-50    | <25   |
| **Kills/Dollar**  | >1.0      | 0.5-1.0 | 0.25-0.5 | <0.25 |

### Defense Quality 🛡️

| Survival Rate | Rating              |
| ------------- | ------------------- |
| 100%          | 🛡️ PERFECT DEFENSE  |
| 80-99%        | 🛡️ STRONG DEFENSE   |
| 50-79%        | ⚠️ MODERATE DEFENSE |
| <50%          | ❌ WEAK DEFENSE     |

### Wave Performance ⭐

| Highest Wave | Rating               |
| ------------ | -------------------- |
| 20+          | ⭐⭐⭐⭐⭐ EXCELLENT |
| 15-19        | ⭐⭐⭐⭐ GREAT       |
| 10-14        | ⭐⭐⭐ GOOD          |
| 5-9          | ⭐⭐ FAIR            |
| 1-4          | ⭐ NEEDS IMPROVEMENT |

---

## 🚨 Warning Signs

### Critical Issues

- ❌ **Bankruptcy Events > 0** → Running out of money
- ❌ **Economy Efficiency < 100%** → Spending more than earning
- ❌ **Survival Rate < 50%** → Weak defense

### Performance Issues

- ⚠️ **Damage/Dollar < 25** → Inefficient towers
- ⚠️ **Overkill > 10%** → Poor targeting
- ⚠️ **Cash Flow: DECLINING** → Unsustainable economy
- ⚠️ **Average DPS < 100** → Insufficient damage

---

## 💡 Quick Optimization Tips

### If Damage/Dollar is Low:

1. Build fewer towers, upgrade more
2. Focus on cost-effective tower types
3. Place towers in high-traffic areas

### If Overkill is High:

1. Spread towers out more
2. Use different tower types
3. Avoid stacking too much damage in one spot

### If Economy is Declining:

1. Build fewer towers per wave
2. Wait for more money before upgrading
3. Focus on income-generating strategies

### If Accuracy is Low:

1. Use more area-effect towers (Shotgun, Tesla, Flame)
2. Place towers closer to path
3. Upgrade tower range

---

## 📁 Report Location

Reports save to: `player_reports/`

Filename format: `YYYY-MM-DD_HH-MM-SS_AI/MANUAL_waveX.json`

Example: `2025-10-15_14-30-45_AI_wave15.json`

---

## 🎯 Target Benchmarks

### Beginner Goals

- Reach wave 10
- 80%+ survival rate
- 0 bankruptcy events
- Damage/dollar > 15

### Intermediate Goals

- Reach wave 15
- 90%+ survival rate
- Economy efficiency > 120%
- Damage/dollar > 25

### Advanced Goals

- Reach wave 20+
- 100% survival rate
- Economy efficiency > 150%
- Damage/dollar > 50
- Overkill < 5%

---

## 📊 Using Timeline Data

Timeline snapshots (every 10s) show:

- Money trends
- DPS growth
- Tower count progression
- Zombie pressure

**Use for:**

- Identifying critical moments
- Visualizing performance trends
- Comparing different strategies
- Finding bottlenecks

---

_For detailed metrics guide, see: `design_docs/ENHANCED_METRICS_GUIDE.md`_
