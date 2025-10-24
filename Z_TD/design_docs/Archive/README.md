# Archive

This directory contains historical records of completed feature implementations. Archive entries document what was built, how it works, and verification results.

## Purpose

Archive entries serve as:
- **Historical record**: What was implemented and when
- **Implementation reference**: How features were built
- **Verification log**: Testing and validation results
- **Context for future work**: Understanding past decisions

## Structure

```
Archive/
├── Core_Systems/      # Completed core system implementations
├── Towers/           # Completed tower features
├── Zombies/          # Completed zombie features
├── UI/               # Completed UI features
└── [Feature_Name]/   # Other completed features
```

## Archive Entry Format

Each archive entry should include:

```markdown
# [Feature Name] - Implementation Summary

## Completed: [Date]

## What Was Built
[List of features/functionality implemented]

## How It Works
[Technical overview of the implementation]

## Verification
[Testing results, metrics, validation]

## Files Modified
[List of files created/modified]

## Known Issues
[Any remaining issues or limitations]

## Related Documentation
[Links to current design docs]
```

## When to Create Archive Entries

Create an archive entry when:
1. A feature is fully implemented
2. Testing/verification is complete
3. The feature is merged and deployed
4. You want to preserve implementation details

## Archive vs Active Documentation

### Archive Entries
- **Past tense**: "What was built"
- **Historical**: Snapshot at completion
- **Verification focused**: Testing results
- **Static**: Not updated after creation

### Active Design Docs
- **Present tense**: "How it works"
- **Current**: Reflects current state
- **Architecture focused**: Design decisions
- **Living**: Updated as code evolves

## Linking Archive Entries

Active documentation should link to relevant archive entries:

```markdown
## Implementation History
See [Tower Redesign Implementation](../../Archive/Towers/TOWER_REDESIGN.md) 
for details on the 2025 tower system overhaul.
```

## Archive Entry Guidelines

### Be Specific
- Include exact dates
- List specific files modified
- Provide concrete metrics
- Reference specific commits/PRs if available

### Document Verification
- What tests were run
- What metrics were measured
- What issues were found
- What was validated

### Preserve Context
- Why decisions were made
- What alternatives were considered
- What challenges were encountered
- What was learned

### Link to Current Docs
- Reference current design documentation
- Note if implementation has changed since
- Point to related features

## Example Archive Entry

```markdown
# Tower Targeting System - Implementation Summary

## Completed: October 15, 2025

## What Was Built
- Implemented multiple targeting strategies (nearest, strongest, weakest)
- Added target priority system
- Created visual targeting indicators
- Integrated with tower upgrade system

## How It Works
Towers use a strategy pattern for target selection. Each tower type 
can have different default strategies, and players can change strategies 
through the upgrade UI.

## Verification
- Unit tests: 95% coverage on targeting logic
- Manual testing: All strategies work correctly
- Performance: No measurable impact (<1ms per tower per frame)
- Player testing: Positive feedback on targeting options

## Files Modified
- src/objects/Tower.ts
- src/objects/towers/targeting/
- src/ui/TowerUpgradePanel.ts
- src/managers/TowerManager.ts

## Known Issues
- None at time of completion

## Related Documentation
- [Tower Architecture](../Features/Towers/ARCHITECTURE.md)
- [Targeting System Design](../Features/Towers/TARGETING.md)
```

## Maintenance

- Archive entries are generally not updated after creation
- If implementation changes significantly, create a new archive entry
- Link new entries to previous ones for continuity
- Periodically review for relevance (every 6-12 months)

## Search Tips

When looking for implementation history:
1. Check Archive/ for completed features
2. Look for dates matching your timeframe
3. Search for specific file names
4. Check related feature directories

## Templates

Use the archive entry template when creating new entries:
`.kiro/specs/documentation-cleanup/templates/archive-entry-template.md`
