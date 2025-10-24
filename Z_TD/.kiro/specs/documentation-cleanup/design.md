# Design Document

## Overview

This design establishes a clear, maintainable documentation structure for the Z-TD project by consolidating scattered documentation, removing outdated content, and creating a logical hierarchy that serves both AI-assisted development and human developers.

## Architecture

### Documentation Hierarchy

```
.kiro/steering/          # AI guidance rules (concise, actionable)
├── core/                # Core development patterns
│   ├── tech.md         # Tech stack & commands
│   ├── structure.md    # Project structure & patterns
│   └── cleanup.md      # Memory management rules
├── features/           # Feature-specific guidance
│   ├── towers.md       # Tower development
│   ├── zombies.md      # Zombie types & mechanics
│   └── stats.md        # Stat tracking & reports
└── process/            # Development process
    ├── product.md      # Product overview
    └── summary.md      # Documentation guidelines

design_docs/            # Detailed architecture & design
├── README.md          # Documentation guide
├── Core_Systems/      # Core game systems
│   ├── Memory_Management/
│   ├── Performance/
│   └── Testing/
├── Features/          # Feature implementations
│   ├── Towers/
│   ├── Zombies/
│   ├── UI/
│   └── Combat/
└── Archive/           # Completed implementations
    └── [feature-name]/

task_summary/          # DEPRECATED - Move to Archive
└── [to be archived]

.kiro/specs/documentation-cleanup/
└── deprecated/        # Pending deletion
    └── [flagged-docs]/
```

### Documentation Types

1. **Steering Rules** (.kiro/steering/)
   - Purpose: Provide concise, actionable guidance to AI assistants
   - Format: Markdown with frontmatter for conditional inclusion
   - Size: <200 lines per file
   - Content: Patterns, conventions, quick references

2. **Design Docs** (design_docs/)
   - Purpose: Detailed architecture, implementation plans, and technical decisions
   - Format: Markdown with diagrams (Mermaid)
   - Size: No limit
   - Content: Architecture, data models, algorithms, examples

3. **Task Summaries** (Archive/)
   - Purpose: Historical record of completed implementations
   - Format: Markdown with implementation details
   - Size: No limit
   - Content: What was built, how it works, verification results

## Components and Interfaces

### Steering Rules Structure

Each steering rule file follows this pattern:

```markdown
---
inclusion: fileMatch | manual | always
fileMatchPattern: 'pattern/**/*.ts'  # if fileMatch
---

# [Topic Name]

## Quick Reference
[Tables, commands, key patterns]

## Rules
[Actionable guidelines]

## Common Patterns
[Code examples - minimal]

## See Also
[Links to detailed design docs]
```

### Design Doc Structure

```markdown
# [Feature Name]

## Overview
[What this feature does]

## Architecture
[System design, components]

## Implementation Details
[Technical specifics, algorithms]

## Data Models
[Interfaces, types, schemas]

## Examples
[Code examples, usage patterns]

## Testing
[How to test, validation]

## References
[Related docs, external resources]
```

### Archive Structure

```markdown
# [Feature Name] - Implementation Summary

## Completed: [Date]

## What Was Built
[Features implemented]

## How It Works
[Technical overview]

## Verification
[Testing results, metrics]

## Files Modified
[List of changed files]

## Known Issues
[Any remaining issues]
```

## Data Models

### Documentation Metadata

```typescript
interface DocumentationFile {
  path: string;
  type: 'steering' | 'design' | 'archive' | 'deprecated';
  topic: string;
  inclusion?: 'fileMatch' | 'manual' | 'always';
  fileMatchPattern?: string;
  lastModified: Date;
  relatedDocs: string[];
}

interface DocumentationIndex {
  topics: Map<string, DocumentationFile[]>;
  deprecatedDocs: DeprecatedDoc[];
}

interface DeprecatedDoc {
  originalPath: string;
  reason: string;
  verificationNeeded: string;
  flaggedDate: Date;
}
```

## Consolidation Strategy

### Phase 1: Steering Rules Cleanup

**Current Issues:**
- Stat_Tracking.md is 500+ lines (too verbose)
- Zombie_Types.md contains implementation details better suited for design docs
- Towers.md is minimal and could be expanded
- No clear organization (all files in root)

**Actions:**
1. Split Stat_Tracking.md:
   - Keep quick reference in steering/features/stats.md (<200 lines)
   - Move detailed guide to design_docs/Core_Systems/Stat_Tracking/
   - Move examples to design_docs/Core_Systems/Stat_Tracking/examples/

2. Refactor Zombie_Types.md:
   - Keep combat modifiers table in steering/features/zombies.md
   - Move visual references to design_docs/Features/Zombies/
   - Move implementation details to design_docs/Features/Zombies/

3. Expand Towers.md:
   - Add tower type quick reference
   - Add damage calculation patterns
   - Link to detailed tower docs

4. Organize into subdirectories:
   - core/ (tech, structure, cleanup)
   - features/ (towers, zombies, stats)
   - process/ (product, summary)

### Phase 2: Design Docs Reorganization

**Current Issues:**
- Flat structure with 20+ files in root
- Augment_Code_Docs/ contains memory management docs (unclear naming)
- task_summary/ subfolder duplicates root task_summary/
- My_Docs/ contains personal notes (should be in .gitignore)
- Multiple "complete" and "summary" docs that overlap

**Actions:**
1. Create feature-based structure:
   ```
   Core_Systems/
   ├── Memory_Management/  # From Augment_Code_Docs
   ├── Performance/
   └── Testing/
   
   Features/
   ├── Towers/
   ├── Zombies/
   ├── UI/
   ├── Combat/
   └── Waves/
   
   Archive/
   └── [completed features]
   ```

2. Consolidate overlapping docs:
   - Merge graveyard_*.md files into Features/Environment/Graveyard.md
   - Merge tower improvement docs into Features/Towers/Improvements.md
   - Move "complete" docs to Archive/

3. Remove/Archive:
   - My_Docs/ → Add to .gitignore or move outside repo
   - task_summary/ subfolder → Merge with root task_summary/
   - Duplicate "summary" files → Keep most recent, archive others

### Phase 3: Task Summary Archive

**Current Issues:**
- task_summary/ contains 20+ files with completed work
- Overlaps with design docs
- No clear organization
- Some files are just installation instructions

**Actions:**
1. Archive completed implementations:
   - Move to design_docs/Archive/[feature-name]/
   - Add completion date and verification status
   - Link from main design docs

2. Remove redundant summaries:
   - If fully documented in design docs, archive
   - If outdated, move to deprecated/

3. Special cases:
   - A_ReadMe.md → Move to root README or delete (info already in tech.md)
   - performance-optimization/ → Move to design_docs/Core_Systems/Performance/

### Phase 4: Deprecation Area

**Purpose:** Hold potentially outdated docs for verification before deletion

**Structure:**
```
.kiro/specs/documentation-cleanup/deprecated/
├── README.md  # Explains deprecation process
└── [flagged-docs]/
    ├── original-path.md
    └── DEPRECATION_INFO.md  # Why flagged, what to verify
```

**Process:**
1. Flag doc as deprecated (move to deprecated/)
2. Create DEPRECATION_INFO.md explaining:
   - Why it was flagged
   - What needs verification
   - Potential replacement docs
3. After verification:
   - If outdated: Delete
   - If still relevant: Move back and update
   - If partially relevant: Extract useful parts, then delete

## Error Handling

### Missing Documentation

When documentation is missing for a feature:
1. Check Archive/ for historical docs
2. Check deprecated/ for flagged docs
3. Create new doc using templates
4. Link from related docs

### Conflicting Information

When docs conflict:
1. Check last modified dates
2. Verify against current codebase
3. Keep most accurate version
4. Archive or deprecate others
5. Add note about conflict resolution

### Broken Links

When consolidating creates broken links:
1. Update all references during consolidation
2. Add redirects in README files
3. Use grep to find all references before moving files

## Testing Strategy

### Validation Checks

1. **Steering Rules Validation:**
   - Each file <200 lines
   - All have proper frontmatter
   - No implementation details (only patterns)
   - All code examples are minimal

2. **Design Docs Validation:**
   - All follow standard structure
   - All have Overview section
   - Cross-references are valid
   - No duplicate content

3. **Archive Validation:**
   - All have completion dates
   - All have verification status
   - All link to current docs

4. **Link Validation:**
   - All internal links work
   - All file references exist
   - All #[[file:...]] references valid

### Manual Testing

1. **AI Assistant Test:**
   - Ask AI to implement a tower feature
   - Verify it uses steering rules correctly
   - Verify it references design docs appropriately

2. **Developer Onboarding Test:**
   - New developer reads documentation
   - Can find information quickly
   - Understands where to add new docs

3. **Search Test:**
   - Search for specific topics
   - Verify results are relevant
   - Verify no duplicate results

## Implementation Notes

### File Operations

1. **Moving Files:**
   - Use git mv to preserve history
   - Update all references in same commit
   - Add redirect notes in old locations

2. **Consolidating Files:**
   - Create new consolidated file
   - Copy relevant sections
   - Add "Consolidated from:" note
   - Move originals to deprecated/

3. **Deleting Files:**
   - Only delete after verification
   - Keep in deprecated/ for at least one sprint
   - Document deletion in commit message

### Frontmatter Updates

When reorganizing steering rules:
```yaml
---
inclusion: fileMatch
fileMatchPattern: ['**/towers/**/*.ts', '**/Tower*.ts']
---
```

Update patterns to match new structure.

### Cross-Reference Updates

Use consistent linking format:
```markdown
See [Memory Management](../Core_Systems/Memory_Management/README.md)
See steering rule: [cleanup.md](../../.kiro/steering/core/cleanup.md)
```

## Migration Plan

### Step 1: Create New Structure
- Create new directories
- Create README files
- Create templates

### Step 2: Consolidate Steering Rules
- Split large files
- Organize into subdirectories
- Update frontmatter
- Test AI assistant usage

### Step 3: Reorganize Design Docs
- Create feature directories
- Move files to new locations
- Update cross-references
- Create Archive/

### Step 4: Archive Task Summaries
- Review each summary
- Move to Archive/ or deprecated/
- Update links
- Remove redundant files

### Step 5: Create Documentation Index
- Generate topic index
- Create search guide
- Document contribution process

### Step 6: Validation
- Run all validation checks
- Test with AI assistant
- Test with developer onboarding
- Fix any issues

## Success Criteria

1. **Organization:**
   - All docs in logical locations
   - Clear hierarchy (3 levels max)
   - No duplicate content

2. **Discoverability:**
   - Can find any topic in <30 seconds
   - Clear index/README files
   - Consistent naming

3. **Maintainability:**
   - Clear guidelines for adding docs
   - Templates for each doc type
   - Automated validation possible

4. **Usability:**
   - AI assistants use steering rules effectively
   - Developers can onboard quickly
   - No confusion about where to look

5. **Cleanliness:**
   - No outdated information
   - No orphaned files
   - All links work
