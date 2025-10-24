# Deprecation Info: task_summary/ root files

## Original Path
`task_summary/` (root directory files)

## Flagged Date
2025-10-25

## Reason for Flagging
These files are implementation summaries and optimization guides that may be outdated or should be moved to Archive or Core_Systems documentation. The task_summary directory is being deprecated in favor of the Archive structure.

## Files Flagged
1. `MONEY_ANIMATION_OPTIMIZATION.md` - Money animation batching optimization
2. `OPTIMIZATION_VALIDATION.md` - OptimizationValidator implementation
3. `PERFORMANCE_PROFILING_GUIDE.md` - Performance profiling guide for waves 20-30

## Verification Needed

### MONEY_ANIMATION_OPTIMIZATION.md
- Check if `src/ui/MoneyAnimation.ts` still uses batching system as described
- Verify if batching parameters (500ms interval, 5 max animations) are still current
- Confirm if optimization is still effective at wave 20+
- Check if this duplicates information in Performance documentation

### OPTIMIZATION_VALIDATION.md
- Check if `src/utils/OptimizationValidator.ts` still exists
- Verify if validation system still works as described
- Confirm if debug commands (debugOptimizations, etc.) still work
- Check if this duplicates Performance documentation

### PERFORMANCE_PROFILING_GUIDE.md
- Check if profiling commands still work (debugPerformance, debugOptimizations, debugCleanup)
- Verify if performance targets are still accurate (frame times, entity counts, memory)
- Confirm if bottlenecks listed are still relevant
- Check if optimization checklist is current

## Potential Replacement

### MONEY_ANIMATION_OPTIMIZATION.md
- **If still accurate:** Move to `design_docs/Archive/Core_Systems/MONEY_ANIMATION_OPTIMIZATION.md`
- **If outdated:** Delete after extracting any unique information
- **If duplicated:** Consolidate with Performance documentation

### OPTIMIZATION_VALIDATION.md
- **If still accurate:** Move to `design_docs/Archive/Core_Systems/OPTIMIZATION_VALIDATION.md`
- **If outdated:** Delete after extracting any unique information
- **If duplicated:** Consolidate with Performance documentation

### PERFORMANCE_PROFILING_GUIDE.md
- **If still accurate:** Move to `design_docs/Core_Systems/Performance/PROFILING_GUIDE.md` (active guide)
- **If outdated:** Update and move to Performance documentation
- **If partially accurate:** Extract current information and update

## Notes
- These are well-documented files with useful information
- PERFORMANCE_PROFILING_GUIDE.md might still be actively useful (not just historical)
- The optimization files describe completed implementations
- All three relate to performance and could be consolidated
- Consider creating a single comprehensive Performance documentation that includes these topics

---

**Flagged By:** Kiro AI Assistant
**Review By:** 2025-11-08 (2 weeks from flagged date)
