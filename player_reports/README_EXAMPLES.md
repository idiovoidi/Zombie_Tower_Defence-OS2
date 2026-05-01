# Balance Analysis Example Reports

## Overview

This directory contains example reports demonstrating different balance scenarios in Z-TD. Each report includes comprehensive balance analysis data and serves as a reference for interpreting real game sessions.

---

## Example Reports

### 1. EXAMPLE_BALANCED_GAME.json

**Scenario:** Well-balanced game with excellent performance

**Key Characteristics:**

- Wave 18 reached
- 95% survival rate
- No balance issues detected
- Overall rating: GOOD
- Economy efficiency: 150%
- Damage per dollar: 21.41

**What Makes It Balanced:**

- ✅ Positive safety margins throughout
- ✅ Efficient tower composition (18.5% deviation from optimal)
- ✅ Growing cash flow trend
- ✅ No bankruptcy events
- ✅ Consistent DPS growth
- ✅ Low overkill (5%)

**Use This Report To:**

- Understand what a well-balanced game looks like
- See ideal metric ranges
- Reference for target performance benchmarks
- Example of good tower mix strategy

**Key Insights:**

- Player built 15 towers with average upgrade level 2.0
- Sniper towers showed highest efficiency score (95.0)
- Difficulty trend shows predictable scaling (slope 0.18)
- Wave 18 had marginal defense (-4.5% margin) suggesting difficulty spike

---

### 2. EXAMPLE_WEAK_DEFENSE.json

**Scenario:** Game lost due to insufficient defense

**Key Characteristics:**

- Wave 8 reached (game over)
- 0% survival rate (all lives lost)
- Overall rating: CRITICAL
- 3 balance issues detected
- Only 5 towers built, 2 upgraded

**Balance Issues:**

1. **WEAK_DEFENSE (CRITICAL)** - 0% survival rate
2. **INEFFICIENT_TOWERS (HIGH)** - 69.4 DPS vs 150+ needed
3. **EXCESSIVE_OVERKILL (MEDIUM)** - 15% wasted damage

**What Went Wrong:**

- ❌ Not enough towers built (5 vs optimal 7+)
- ❌ Insufficient upgrades (only 2 total)
- ❌ Negative safety margins from wave 5 onward
- ❌ DPS never exceeded required amount
- ❌ 2 bankruptcy events

**Use This Report To:**

- Identify symptoms of weak defense
- Understand critical balance issues
- See what happens when DPS falls behind
- Learn from poor tower placement strategy

**Key Insights:**

- Wave 5 had -33.6% safety margin (critical failure point)
- Only Machine Gun and Shotgun towers used (no diversity)
- 42.8% deviation from optimal tower mix
- Economy efficiency was actually good (176.5%) but spent too conservatively

**Lessons Learned:**

- Building towers is more important than saving money
- Upgrades are critical for keeping up with difficulty
- Tower diversity matters for efficiency
- Early investment prevents late-game collapse

---

### 3. EXAMPLE_INEFFICIENT_TOWERS.json

**Scenario:** Survived but with poor efficiency

**Key Characteristics:**

- Wave 12 reached
- 75% survival rate (5 lives lost)
- Overall rating: FAIR
- 2 balance issues detected
- 20 towers built (too many!)
- Only 3 upgrades (too few!)

**Balance Issues:**

1. **INEFFICIENT_TOWERS (HIGH)** - 13.75 damage per dollar (below 15 threshold)
2. **EXCESSIVE_OVERKILL (HIGH)** - 18% wasted damage

**What Went Wrong:**

- ❌ Built too many low-level towers (quantity over quality)
- ❌ Insufficient upgrades (average level 1.15)
- ❌ 55% deviation from optimal tower mix
- ❌ High overkill indicates poor tower placement
- ❌ 12 Machine Guns (too many of same type)

**Use This Report To:**

- Understand the "too many towers" problem
- See impact of not upgrading
- Learn about diminishing returns from tower stacking
- Identify overkill issues

**Key Insights:**

- Damage per tower only 1925 (vs 4566 in balanced game)
- Effective DPS much lower than nominal due to overkill
- Wave 12 had only 2.2% safety margin (barely survived)
- Economy was stable but inefficient spending

**Lessons Learned:**

- Quality > Quantity for towers
- Upgrades provide better value than new towers
- Stacking same tower type causes diminishing returns
- Spread towers out to reduce overkill

**Comparison to Balanced Game:**
| Metric | Inefficient | Balanced | Difference |
|--------|-------------|----------|------------|
| Towers Built | 20 | 15 | +33% |
| Avg Upgrade Level | 1.15 | 2.0 | -42% |
| Damage/Dollar | 13.75 | 21.41 | -36% |
| Overkill % | 18% | 5% | +260% |
| Mix Deviation | 55% | 18.5% | +197% |

---

## Comparing the Three Scenarios

### Performance Summary

| Metric                 | Balanced | Weak Defense | Inefficient |
| ---------------------- | -------- | ------------ | ----------- |
| **Wave Reached**       | 18       | 8            | 12          |
| **Survival Rate**      | 95%      | 0%           | 75%         |
| **Balance Rating**     | GOOD     | CRITICAL     | FAIR        |
| **Issues Count**       | 0        | 3            | 2           |
| **Towers Built**       | 15       | 5            | 20          |
| **Avg Upgrade Level**  | 2.0      | 1.4          | 1.15        |
| **Damage/Dollar**      | 21.41    | 18.38        | 13.75       |
| **Economy Efficiency** | 150%     | 176%         | 114%        |
| **Overkill %**         | 5%       | 15%          | 18%         |
| **Mix Deviation**      | 18.5%    | 42.8%        | 55%         |

### Key Takeaways

**Balanced Game:**

- Moderate tower count with good upgrades
- Efficient spending and tower placement
- Predictable, manageable difficulty curve
- No critical issues

**Weak Defense:**

- Too few towers and upgrades
- Good economy but poor spending decisions
- Failed to keep up with difficulty scaling
- Critical defense failure

**Inefficient Towers:**

- Too many towers, not enough upgrades
- Poor tower diversity and placement
- Survived but with significant waste
- Suboptimal strategy execution

---

## Using These Examples

### For Developers

**Testing Balance Changes:**

1. Make balance adjustments to game config
2. Run AI playtests
3. Compare new reports to these examples
4. Look for similar patterns or new issues

**Validating Formulas:**

1. Check calculations in example reports
2. Verify threat scores are reasonable
3. Confirm efficiency scores make sense
4. Validate predictions against actual outcomes

**Debugging Issues:**

1. Compare problematic reports to examples
2. Identify which scenario they resemble
3. Apply similar fixes and recommendations
4. Re-test to verify improvements

### For Players

**Learning Strategy:**

1. Study the balanced game report
2. Note tower composition and upgrade patterns
3. Observe DPS growth over time
4. Emulate successful strategies

**Avoiding Mistakes:**

1. Review weak defense and inefficient examples
2. Recognize warning signs in your own games
3. Adjust strategy before critical failures
4. Balance tower building with upgrades

### For AI Development

**Training Data:**

- Use balanced game as target behavior
- Use weak defense as failure case to avoid
- Use inefficient game as suboptimal strategy

**Performance Benchmarks:**

- Target: Match or exceed balanced game metrics
- Minimum: Avoid weak defense patterns
- Optimization: Reduce inefficiency patterns

---

## Report Analysis Workflow

### Step 1: Quick Assessment

```
1. Check overallBalanceRating
2. Count issues array length
3. Review survivalRate
4. Check highestWave
```

### Step 2: Identify Pattern

```
- 0 issues + high survival = Balanced
- Multiple CRITICAL issues = Weak Defense
- HIGH efficiency issues = Inefficient
```

### Step 3: Deep Dive

```
- Review waveDefenseAnalysis for failure points
- Check towerEfficiencies for best/worst towers
- Examine threatScores for zombie balance
- Compare optimal vs actual tower mix
```

### Step 4: Apply Insights

```
- Adjust game config based on findings
- Modify AI strategy if needed
- Re-test and compare new reports
- Iterate until balanced
```

---

## Metric Interpretation Quick Reference

### Survival Rate

- **100%** = Perfect defense (no lives lost)
- **90-99%** = Strong defense (1-2 lives lost)
- **70-89%** = Moderate defense (3-6 lives lost)
- **50-69%** = Weak defense (7-10 lives lost)
- **<50%** = Critical defense failure

### Damage Per Dollar

- **>25** = Excellent efficiency
- **15-25** = Good efficiency
- **10-15** = Fair efficiency
- **<10** = Poor efficiency

### Safety Margin

- **>20%** = Comfortable defense
- **10-20%** = Adequate defense
- **5-10%** = Marginal defense
- **0-5%** = Barely surviving
- **<0%** = Will fail wave

### Tower Mix Deviation

- **<15%** = Optimal strategy
- **15-30%** = Suboptimal but acceptable
- **30-50%** = Poor tower choices
- **>50%** = Very inefficient composition

### Economy Efficiency

- **>150%** = Excellent economy
- **120-150%** = Good economy
- **100-120%** = Adequate economy
- **<100%** = Losing money

### Overkill Percentage

- **<5%** = Excellent targeting
- **5-10%** = Good targeting
- **10-15%** = Acceptable waste
- **>15%** = Excessive waste

---

## Common Questions

### Q: Why does the weak defense example have better economy efficiency than the balanced game?

**A:** Economy efficiency measures income vs expenses, not effectiveness. The weak defense game spent conservatively (only $680) but also earned less ($1200). The balanced game spent more ($3200) but earned much more ($4800) and progressed further. High economy efficiency with low survival rate indicates under-investment in defense.

### Q: Why did the inefficient game survive longer than the weak defense game despite worse metrics?

**A:** The inefficient game built 20 towers (vs 5 in weak defense), providing enough raw DPS to survive despite poor efficiency. It's like using a sledgehammer when a scalpel would work better - wasteful but effective enough. The weak defense game simply didn't have enough towers.

### Q: What's the ideal number of towers to build?

**A:** It depends on wave number and tower types, but the balanced game example (15 towers by wave 18) is a good target. Focus on quality (upgrades) over quantity. The optimal tower mix in each report shows the calculated best composition for that budget.

### Q: Should I always follow the optimal tower mix?

**A:** The optimal mix is calculated based on efficiency scores and marginal utility. It's a guide, not a rule. Situational factors (zombie types, path layout, available money) may require adjustments. Aim for <30% deviation as a general target.

### Q: How do I know if my game balance is good?

**A:** Compare your reports to the balanced game example:

- Similar survival rates (90%+)
- Similar damage per dollar (20+)
- Low overkill (<10%)
- Few or no balance issues
- Predictable difficulty trend

---

## Related Documentation

- **REPORT_INTERPRETATION_GUIDE.md** - Detailed guide to reading reports
- **REPORT_STRUCTURE_REFERENCE.md** - Technical schema documentation
- **BALANCE_ANALYSIS_GUIDE.md** - Overview of balance analysis system
- **BALANCE_CONFIG_REFERENCE.md** - Configuration and formulas

---

## Generating Your Own Examples

To create new example reports:

1. **Run the game** with balance tracking enabled
2. **Play through** or use AI player
3. **Let game end** naturally (victory or defeat)
4. **Find report** in `player_reports/` directory
5. **Rename** to descriptive name (e.g., `EXAMPLE_SCENARIO_NAME.json`)
6. **Document** the scenario in this README

**Tips for Good Examples:**

- Create diverse scenarios (different strategies, outcomes)
- Include both successes and failures
- Document what makes each example unique
- Explain key insights and lessons learned

---

_Last Updated: 2025-10-15_
_Version: 1.0_
