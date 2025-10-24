# Deprecation Area

This directory holds documentation that has been flagged as potentially outdated and is pending verification before deletion.

## Purpose

The deprecation area serves as a holding zone for documentation that:
- May conflict with the current codebase
- Contains outdated implementation details
- Has been superseded by newer documentation
- Is redundant with other documentation

Documents remain here until they can be verified and either:
- **Deleted** if confirmed outdated
- **Restored** if still relevant (moved back to original location)
- **Partially extracted** if some content is still useful

## Process

### 1. Flagging Documentation

When documentation is identified as potentially outdated:

1. Move the file to this `deprecated/` directory
2. Create a `DEPRECATION_INFO.md` file alongside it
3. Update any references to the flagged document

### 2. Verification

For each flagged document, verify:

- Does it conflict with current code?
- Is the information still accurate?
- Is it duplicated elsewhere?
- Does it provide unique value?

### 3. Resolution

After verification:

**If Outdated:**
- Delete the document
- Document deletion in commit message
- Remove from deprecation area

**If Still Relevant:**
- Move back to appropriate location
- Update content if needed
- Remove DEPRECATION_INFO.md

**If Partially Relevant:**
- Extract useful content to appropriate docs
- Delete the original
- Document what was extracted

## DEPRECATION_INFO Format

Each flagged document should have a corresponding `DEPRECATION_INFO.md` file:

```markdown
# Deprecation Info: [Document Name]

## Original Path
`path/to/original/document.md`

## Flagged Date
YYYY-MM-DD

## Reason for Flagging
[Why this document was flagged as potentially outdated]

## Verification Needed
[What needs to be checked to determine if this should be deleted]

## Potential Replacement
[Links to newer documentation that may replace this, if any]

## Notes
[Any additional context or considerations]
```

## Timeline

Documents should not remain in the deprecation area indefinitely:

- **Review within 1 sprint**: Verify and make decision
- **Maximum 2 sprints**: If not verified, assume outdated and delete
- **Exception**: Complex documents may need longer verification

## Current Flagged Documents

### High Priority - Completion Summaries (6 files)

1. **corpse_reuse_renderer_complete.md**
   - Original: `design_docs/corpse_reuse_renderer_complete.md`
   - Reason: Completion summary with "complete" in title
   - Action: Verify implementation, move to Archive/Zombies/

2. **animated_fog_implementation.md**
   - Original: `design_docs/animated_fog_implementation.md`
   - Reason: Implementation summary
   - Action: Verify implementation, move to Archive/Features/Environment/

3. **RESISTANCE_SYSTEM_IMPLEMENTATION.md**
   - Original: `design_docs/RESISTANCE_SYSTEM_IMPLEMENTATION.md`
   - Reason: Implementation summary
   - Action: Verify implementation, move to Archive/Core_Systems/

4. **GRENADE_TOWER_ADDED.md**
   - Original: `design_docs/task_summary/GRENADE_TOWER_ADDED.md`
   - Reason: Completion summary from deprecated subfolder
   - Action: Verify implementation, move to Archive/Towers/

5. **MACHINE_GUN_BALANCE_UPDATE.md**
   - Original: `design_docs/task_summary/MACHINE_GUN_BALANCE_UPDATE.md`
   - Reason: Balance update from deprecated subfolder
   - Action: Verify if current, consolidate or archive

6. **MACHINE_GUN_EFFECTS_IMPLEMENTATION.md**
   - Original: `design_docs/task_summary/MACHINE_GUN_EFFECTS_IMPLEMENTATION.md`
   - Reason: Implementation summary from deprecated subfolder
   - Action: Verify implementation, move to Archive/Towers/

7. **SNIPER_EFFECTS_IMPLEMENTATION.md**
   - Original: `design_docs/task_summary/SNIPER_EFFECTS_IMPLEMENTATION.md`
   - Reason: Implementation summary from deprecated subfolder
   - Action: Verify implementation, move to Archive/Towers/

### Medium Priority - Performance Documentation (3 files)

8. **MONEY_ANIMATION_OPTIMIZATION.md**
   - Original: `task_summary/MONEY_ANIMATION_OPTIMIZATION.md`
   - Reason: Optimization summary, may be outdated
   - Action: Verify if current, move to Archive/Core_Systems/ or Performance/

9. **OPTIMIZATION_VALIDATION.md**
   - Original: `task_summary/OPTIMIZATION_VALIDATION.md`
   - Reason: Implementation summary
   - Action: Verify if current, move to Archive/Core_Systems/ or Performance/

10. **PERFORMANCE_PROFILING_GUIDE.md**
    - Original: `task_summary/PERFORMANCE_PROFILING_GUIDE.md`
    - Reason: May be outdated, or should be in Performance docs
    - Action: Verify if current, move to Core_Systems/Performance/ if still useful

### Low Priority - Recent Additions (Task 5.3 - 2025-10-25)

11. **GRAPHICS_AUDIT_SUMMARY_original.md**
    - Original: `design_docs/Core_Systems/Performance/GRAPHICS_AUDIT_SUMMARY.md`
    - Reason: Completed audit summary
    - Action: Move to Archive/Core_Systems/Performance/

12. **GRAPHICS_AUDIT_SUMMARY_duplicate.md**
    - Original: `task_summary/performance-optimization/GRAPHICS_AUDIT_SUMMARY.md`
    - Reason: Exact duplicate of design_docs version
    - Action: DELETE (duplicate confirmed)

13. **CLEANUP_VERIFICATION_SUMMARY_duplicate.md**
    - Original: `task_summary/performance-optimization/CLEANUP_VERIFICATION_SUMMARY.md`
    - Reason: Exact duplicate of design_docs version
    - Action: DELETE (duplicate confirmed)

14. **TASK_7_COMPLETION_SUMMARY_original.md**
    - Original: `design_docs/Core_Systems/Performance/TASK_7_COMPLETION_SUMMARY.md`
    - Reason: Completed task summary
    - Action: Move to Archive/Core_Systems/Performance/

15. **TASK_7_COMPLETION_SUMMARY_duplicate.md**
    - Original: `task_summary/performance-optimization/TASK_7_COMPLETION_SUMMARY.md`
    - Reason: Exact duplicate of design_docs version
    - Action: DELETE (duplicate confirmed)

16. **LAYOUT_OPTIMIZATION_SUMMARY.md**
    - Original: `design_docs/Core_Systems/Performance/LAYOUT_OPTIMIZATION_SUMMARY.md`
    - Reason: Completed optimization summary
    - Action: Move to Archive/Core_Systems/Performance/

17. **CORPSE_CLEANUP_VERIFICATION.md**
    - Original: `task_summary/performance-optimization/CORPSE_CLEANUP_VERIFICATION.md`
    - Reason: Completed verification document
    - Action: Move to Archive/Core_Systems/Performance/

18. **PERSISTENT_EFFECTS_VERIFICATION.md**
    - Original: `task_summary/performance-optimization/PERSISTENT_EFFECTS_VERIFICATION.md`
    - Reason: Completed verification document
    - Action: Move to Archive/Core_Systems/Performance/

19. **corpse_redesign_complete.md**
    - Original: `design_docs/Features/Zombies/corpse_redesign_complete.md`
    - Reason: Marked as complete, verified implementation exists
    - Action: Move to Archive/Zombies/

20. **ARMORED_ZOMBIE_VISUAL_REFERENCE_empty.md**
    - Original: `design_docs/Features/Zombies/ARMORED_ZOMBIE_VISUAL_REFERENCE.md`
    - Reason: Empty file (0 bytes)
    - Action: DELETE (no content)

21. **SPACING_AND_VISIBILITY_IMPROVEMENTS_empty.md**
    - Original: `design_docs/Features/Zombies/SPACING_AND_VISIBILITY_IMPROVEMENTS.md`
    - Reason: Empty file (0 bytes)
    - Action: DELETE (no content)

### Summary

**Total Flagged:** 21 files
**High Priority - Completion Summaries:** 7 files
**Medium Priority - Performance Documentation:** 3 files
**Low Priority - Recent Additions:** 11 files
  - Duplicates to DELETE: 5 files
  - Empty files to DELETE: 2 files
  - Summaries to ARCHIVE: 4 files

**Next Actions:**
1. Verify each file against current codebase
2. Move confirmed accurate files to appropriate Archive locations
3. Update or consolidate files that are partially accurate
4. Delete files that are fully outdated or duplicated
5. Delete confirmed duplicates (3 files verified identical)
6. Delete empty files (2 files with 0 bytes)

---

**Last Updated**: 2025-10-25 (Task 5.3 completed)
