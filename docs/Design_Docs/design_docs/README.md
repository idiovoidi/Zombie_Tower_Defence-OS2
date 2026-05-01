# Z-TD Documentation

This directory contains detailed architecture, design decisions, and implementation documentation for the Z-TD project.

## Documentation Structure

```
design_docs/
├── Core_Systems/      # Core game systems and infrastructure
│   ├── Memory_Management/  # Memory cleanup, leak prevention
│   ├── Performance/        # Optimization guides, profiling
│   └── Testing/           # Testing strategies, debug tools
├── Features/          # Feature-specific implementations
│   ├── Towers/       # Tower types, mechanics, upgrades
│   ├── Zombies/      # Zombie types, AI, spawning
│   ├── UI/           # User interface components
│   ├── Combat/       # Combat systems, damage calculations
│   └── Waves/        # Wave progression, difficulty
└── Archive/          # Completed implementation records
    └── [feature]/    # Historical implementation summaries
```

## Documentation Types

### Steering Rules (`.kiro/steering/`)

**Purpose**: Provide concise, actionable guidance to AI assistants during development

**Characteristics**:

- **Size**: Maximum 200 lines per file
- **Content**: Patterns, conventions, quick reference tables, minimal code examples
- **Focus**: "How to do X" not "Why X works this way"
- **Inclusion**: Automatically included in AI context based on file patterns or always included

**When to Use**:

- ✅ Defining coding patterns and conventions
- ✅ Quick reference for common tasks
- ✅ AI assistant guidance for specific file types
- ✅ Command cheat sheets
- ❌ Detailed architecture explanations
- ❌ Long code examples or tutorials
- ❌ Historical context or design decisions

**Example Use Cases**:

- Tower damage calculation pattern
- Memory cleanup checklist
- Zombie type quick reference table
- Project structure overview
- Common commands and tech stack

**Example Structure**:

```markdown
---
inclusion: fileMatch
fileMatchPattern: '**/towers/**/*.ts'
---

# Tower Development Patterns

## Quick Reference

| Tower Type | Base Damage | Range |
| ---------- | ----------- | ----- |
| Basic      | 10          | 150   |

## Rules

- Extend Tower base class
- Implement ITower interface
- Register with TowerFactory

## Common Patterns

\`\`\`typescript
// Minimal example
class NewTower extends Tower implements ITower {
// ...
}
\`\`\`

## See Also

- [Tower Architecture](../../design_docs/Features/Towers/README.md)
```

### Design Documents (`design_docs/Core_Systems/`, `design_docs/Features/`)

**Purpose**: Detailed architecture, implementation guides, and technical documentation

**Characteristics**:

- **Size**: No limit - as detailed as needed
- **Content**: Full architecture, data models, algorithms, extensive examples, design rationale
- **Focus**: "How X works" and "Why we designed X this way"
- **Audience**: Developers implementing or maintaining features

**When to Use**:

- ✅ Explaining system architecture
- ✅ Documenting complex algorithms
- ✅ Providing detailed code examples
- ✅ Recording design decisions and trade-offs
- ✅ Creating implementation guides
- ✅ Documenting data models and interfaces
- ❌ Quick reference patterns (use steering rules)
- ❌ Historical implementation records (use archive)

**Example Use Cases**:

- Complete tower system architecture
- Memory management implementation guide
- Zombie AI behavior algorithms
- UI component specifications
- Combat damage calculation system
- Wave progression design

**Example Structure**:

```markdown
# Tower System Architecture

## Overview

The tower system manages tower placement, upgrades, and combat behavior...

## Architecture

[Detailed system design with diagrams]

### Components

- TowerManager: Coordinates tower lifecycle
- TowerFactory: Creates tower instances
- Tower: Base class for all towers

## Data Models

\`\`\`typescript
interface ITower {
id: string;
type: TowerType;
damage: number;
// ... detailed interface
}
\`\`\`

## Implementation Details

[Detailed algorithms, patterns, edge cases]

## Examples

[Extensive code examples showing usage]

## Testing

[How to test the system]

## References

- [Tower Patterns](../../.kiro/steering/features/towers.md)
- [Combat System](../Combat/COMBAT_SYSTEM.md)
```

### Archive Entries (`design_docs/Archive/`)

**Purpose**: Historical records of completed implementations with verification status

**Characteristics**:

- **Size**: No limit
- **Content**: What was built, how it works, verification results, files modified
- **Focus**: "What we completed" and "How to verify it works"
- **Audience**: Developers reviewing past work or understanding implementation history

**When to Use**:

- ✅ After completing and verifying a feature
- ✅ Recording implementation summaries
- ✅ Documenting what files were changed
- ✅ Capturing testing and verification results
- ✅ Noting known issues or limitations
- ❌ Active development documentation (use design docs)
- ❌ Ongoing feature work (use design docs)

**Example Use Cases**:

- Tower upgrade system implementation summary
- Zombie spawning refactor completion record
- UI layout optimization summary
- Memory leak fix verification
- Performance optimization results

**Example Structure**:

```markdown
# Tower Upgrade System - Implementation Summary

## Completed: October 15, 2024

## What Was Built

- Tower upgrade system with 3 tiers per tower type
- Upgrade cost calculation based on tower type and tier
- Visual indicators for upgrade availability
- Upgrade button in tower info panel

## How It Works

The upgrade system extends the Tower base class with upgrade methods...
[Technical overview]

## Verification

- ✅ All tower types can upgrade to tier 3
- ✅ Costs scale correctly (1.5x per tier)
- ✅ Visual indicators update properly
- ✅ Memory usage stable after 20 upgrades
- ✅ No memory leaks detected

## Files Modified

- src/objects/towers/Tower.ts
- src/managers/TowerManager.ts
- src/ui/TowerInfoPanel.ts
- src/config/TowerConfig.ts

## Known Issues

- Upgrade animation could be smoother (low priority)

## References

- Current documentation: [Tower System](../Features/Towers/README.md)
- Design doc: [Tower Upgrades](../Features/Towers/PROGRESSION_DESIGN.md)
```

### Comparison Table

| Aspect         | Steering Rules      | Design Docs        | Archive Entries        |
| -------------- | ------------------- | ------------------ | ---------------------- |
| **Location**   | `.kiro/steering/`   | `design_docs/`     | `design_docs/Archive/` |
| **Size Limit** | <200 lines          | No limit           | No limit               |
| **Purpose**    | AI guidance         | Architecture docs  | Historical records     |
| **Content**    | Patterns, quick ref | Detailed design    | Implementation summary |
| **Audience**   | AI assistants       | Developers         | Reviewers, historians  |
| **When**       | Ongoing             | Active development | After completion       |
| **Examples**   | Minimal             | Extensive          | Real implementation    |
| **Focus**      | How to do X         | How X works        | What we built          |

### Decision Tree: Which Documentation Type?

**Start here**: What do you need to document?

1. **Quick pattern or convention for AI?**
   - Yes → **Steering Rule** (`.kiro/steering/`)
   - Can you keep it under 200 lines?
     - Yes → Create steering rule
     - No → Create design doc, link from steering rule

2. **Detailed architecture or implementation guide?**
   - Yes → **Design Document** (`design_docs/`)
   - Is it a core system or game feature?
     - Core system → `Core_Systems/[System]/`
     - Game feature → `Features/[Feature]/`

3. **Completed implementation record?**
   - Yes → **Archive Entry** (`design_docs/Archive/`)
   - Has the feature been verified and tested?
     - Yes → Create archive entry
     - No → Keep in design docs until verified

4. **Not sure?**
   - Start with design doc (most flexible)
   - Extract patterns to steering rule later if needed
   - Move to archive after completion

### Examples by Scenario

**Scenario 1: Adding a new tower type**

- **Steering Rule**: Quick reference table of tower types, damage patterns
- **Design Doc**: Detailed tower architecture, upgrade system, combat mechanics
- **Archive**: After implementation, record what was built and verification results

**Scenario 2: Fixing a memory leak**

- **Steering Rule**: Cleanup pattern checklist, common leak causes
- **Design Doc**: Memory management architecture, cleanup system design
- **Archive**: After fix, document what was changed and verification results

**Scenario 3: Implementing UI component**

- **Steering Rule**: UI layout patterns, positioning conventions
- **Design Doc**: UI component architecture, event handling, styling
- **Archive**: After implementation, record component details and testing results

## Contribution Guidelines

### When to Create Each Documentation Type

#### Steering Rules (`.kiro/steering/`)

**Create when**: You need to provide concise, actionable guidance to AI assistants

**Characteristics**:

- Maximum 200 lines per file
- Patterns and conventions only (no detailed implementation)
- Quick reference tables and minimal code examples
- Automatically included in AI context based on file patterns

**Examples**:

- Tower damage calculation patterns
- Zombie type quick reference
- Memory cleanup patterns
- Common coding conventions

**Frontmatter Requirements**:

```yaml
---
inclusion: fileMatch | manual | always
fileMatchPattern: ['**/towers/**/*.ts', '**/Tower*.ts'] # if fileMatch
---
```

- `always`: Included in all AI interactions (use for core patterns)
- `fileMatch`: Included only when working on matching files (use for feature-specific guidance)
- `manual`: Only included when explicitly referenced (use for specialized guidance)

#### Design Documents (`design_docs/`)

**Create when**: You need detailed architecture, implementation guides, or technical documentation

**Characteristics**:

- No size limit - as detailed as needed
- Full architecture explanations with diagrams
- Detailed code examples and algorithms
- Design decisions and rationale
- Data models and interfaces

**Examples**:

- Complete tower system architecture
- Memory management implementation guide
- Zombie AI behavior algorithms
- UI component specifications

#### Archive Entries (`design_docs/Archive/`)

**Create when**: A feature implementation is completed and verified

**Characteristics**:

- Historical record of what was built
- Implementation date and verification status
- Files modified and testing results
- Links to current documentation
- Known issues or limitations

**Examples**:

- Tower upgrade system implementation summary
- Zombie spawning system completion record
- UI layout refactor summary

### Adding New Documentation

1. **Choose the right location**:
   - Core system? → `Core_Systems/[System_Name]/`
   - Game feature? → `Features/[Feature_Name]/`
   - Completed work? → `Archive/[Feature_Name]/`
   - AI guidance? → `.kiro/steering/core/` or `.kiro/steering/features/`

2. **Follow naming conventions**:

   **Design Documents**:
   - Use SCREAMING_SNAKE_CASE for files: `TOWER_MECHANICS.md`
   - Use PascalCase for directories: `Memory_Management/`
   - Use descriptive names: `DAMAGE_CALCULATION.md` not `calc.md`

   **Steering Rules**:
   - Use kebab-case for files: `tower-patterns.md`
   - Use lowercase for directories: `core/`, `features/`
   - Keep names short and focused: `towers.md` not `tower-development-guide.md`

   **Archive Entries**:
   - Include feature name: `TOWER_UPGRADE_IMPLEMENTATION.md`
   - Add date if multiple versions: `UI_REFACTOR_2024-10.md`

3. **Use standard structure**:

   **Design Documents**:

   ```markdown
   # [Feature Name]

   ## Overview

   [What this feature does]

   ## Architecture

   [System design, components]

   ## Implementation Details

   [Technical specifics]

   ## Examples

   [Code examples]

   ## References

   [Related docs]
   ```

   **Steering Rules**:

   ```markdown
   ---
   inclusion: fileMatch
   fileMatchPattern: '**/feature/**/*.ts'
   ---

   # [Topic Name]

   ## Quick Reference

   [Tables, key patterns]

   ## Rules

   [Actionable guidelines]

   ## Common Patterns

   [Minimal code examples]

   ## See Also

   [Links to design docs]
   ```

   **Archive Entries**:

   ```markdown
   # [Feature Name] - Implementation Summary

   ## Completed: [Date]

   ## What Was Built

   [Features implemented]

   ## How It Works

   [Technical overview]

   ## Verification

   [Testing results]

   ## Files Modified

   [List of files]

   ## Known Issues

   [Any remaining issues]
   ```

### Updating Existing Documentation

1. Keep documentation in sync with code changes
2. Update cross-references when moving files
3. Add "Last Updated" dates for major changes
4. Archive outdated versions rather than deleting
5. Update steering rule frontmatter if file patterns change

### Cross-Referencing Conventions

Use relative links to reference other documentation:

**Within design_docs**:

```markdown
See [Memory Management](../Core_Systems/Memory_Management/README.md)
See [Tower Types](../Features/Towers/TOWER_TYPES.md)
```

**From design_docs to steering rules**:

```markdown
See steering rule: [cleanup.md](../.kiro/steering/core/cleanup.md)
See [Tower Patterns](../.kiro/steering/features/towers.md)
```

**From steering rules to design_docs**:

```markdown
See [Detailed Guide](../../design_docs/Core_Systems/Memory_Management/GUIDE.md)
See [Tower Architecture](../../design_docs/Features/Towers/README.md)
```

**Using file references in steering rules** (for conditional inclusion):

```markdown
See detailed implementation: #[[file:Core_Systems/Memory_Management/GUIDE.md]]
```

## Finding Information

### Documentation Search Guide

#### Search by Topic

Use the [INDEX.md](INDEX.md) file for a complete topic-to-file mapping. Quick topic guide:

**Core Systems**:

- **Memory/Performance issues**: `Core_Systems/Memory_Management/`, `Core_Systems/Performance/`
- **Stat tracking**: `Core_Systems/Stat_Tracking/`
- **Testing/Debug tools**: `Core_Systems/Testing/`

**Game Features**:

- **Tower development**: `Features/Towers/`
- **Zombie behavior**: `Features/Zombies/`
- **UI components**: `Features/UI/`
- **Combat mechanics**: `Features/Combat/`
- **Wave system**: `Features/Waves/`
- **Camp/Survivors**: `Features/Camp/`
- **Environment**: `Features/Environment/`

**Other**:

- **Game balance**: `Game_Balance/`
- **Completed features**: `Archive/`
- **Quick patterns**: `.kiro/steering/`

#### Search Methods

**1. File Name Search** (fastest for known topics)

- Use your IDE's file search (Ctrl+P / Cmd+P)
- Search for keywords: "tower", "zombie", "memory", "cleanup"
- Example: Search "tower" → finds all tower-related files

**2. Content Search** (for specific terms or code)

- Use grep/ripgrep or IDE search (Ctrl+Shift+F / Cmd+Shift+F)
- Search within specific directories for better results
- Example: Search "EffectCleanupManager" in `Core_Systems/`

**3. Index Search** (for topic mapping)

- Open [INDEX.md](INDEX.md)
- Use Ctrl+F / Cmd+F to find topics
- Follow links to relevant documentation

**4. README Navigation** (for directory overview)

- Each major directory has a README.md
- Start with the README to understand directory contents
- Follow cross-references to related docs

**5. Steering Rule Search** (for AI patterns)

- Check `.kiro/steering/` for quick patterns
- Steering rules are <200 lines and pattern-focused
- Link to detailed design docs for more info

#### Search Workflow by Scenario

**"I need to implement a new tower type"**:

1. Check [INDEX.md](INDEX.md) → "Adding a tower?"
2. Read [Features/Towers/README.md](Features/Towers/README.md)
3. Check [.kiro/steering/features/towers.md](../.kiro/steering/features/towers.md) for patterns
4. Review examples in `Features/Towers/`

**"I have a memory leak"**:

1. Check [INDEX.md](INDEX.md) → "Memory leaks?"
2. Read [Core_Systems/Memory_Management/MEMORY_LEAK_GUIDE.md](Core_Systems/Memory_Management/MEMORY_LEAK_GUIDE.md)
3. Check [.kiro/steering/cleanup.md](../.kiro/steering/cleanup.md) for cleanup patterns
4. Review [Core_Systems/Performance/PERFORMANCE_TESTING_GUIDE.md](Core_Systems/Performance/PERFORMANCE_TESTING_GUIDE.md)

**"I need to understand the UI layout"**:

1. Check [INDEX.md](INDEX.md) → "UI layout?"
2. Read [Features/UI/UI_LAYOUT_GUIDE.md](Features/UI/UI_LAYOUT_GUIDE.md)
3. Check [Features/UI/README.md](Features/UI/README.md) for component overview

**"I want to see what was implemented for X feature"**:

1. Check `Archive/[Feature_Name]/`
2. Look for implementation summaries with dates
3. Follow links to current documentation

**"I need to know the project structure"**:

1. Check [.kiro/steering/structure.md](../.kiro/steering/structure.md)
2. Review [.kiro/steering/tech.md](../.kiro/steering/tech.md) for tech stack

#### Common Documentation Patterns

**Pattern 1: Feature Documentation**

```
Features/[Feature_Name]/
├── README.md              # Overview and quick start
├── ARCHITECTURE.md        # Detailed system design
├── IMPLEMENTATION.md      # Technical implementation
├── EXAMPLES.md            # Code examples
└── [Type]_REFERENCE.md    # Type-specific details
```

**Pattern 2: Core System Documentation**

```
Core_Systems/[System_Name]/
├── README.md              # Overview and best practices
├── GUIDE.md               # Detailed implementation guide
├── EXAMPLES.md            # Code examples
└── [Specific]_FIX.md      # Specific issue resolutions
```

**Pattern 3: Steering Rule + Design Doc**

- Steering rule (`.kiro/steering/features/[topic].md`) - Quick patterns
- Design doc (`design_docs/Features/[Topic]/`) - Detailed implementation
- Always linked via "See Also" sections

**Pattern 4: Archive Entry**

```
Archive/[Feature_Name]/
└── [FEATURE]_IMPLEMENTATION.md  # Completion summary
```

#### Search Tips

1. **Start broad, then narrow**: Begin with INDEX.md or README files, then drill down
2. **Use multiple search methods**: Combine file search, content search, and index navigation
3. **Follow cross-references**: Documents link to related content
4. **Check both steering rules and design docs**: Steering rules for patterns, design docs for details
5. **Look in Archive for history**: Completed features are documented with verification status
6. **Use consistent terminology**: Search for "tower", "zombie", "memory", "cleanup", "UI"
7. **Check file modification dates**: Recent files may have more current information

### Quick Reference

For quick patterns and rules, see steering rules in `.kiro/steering/`:

- Core patterns: `.kiro/steering/core/`
- Feature guidance: `.kiro/steering/features/`
- Process guidelines: `.kiro/steering/process/`

## Documentation vs Steering Rules

**Use Design Docs when**:

- Explaining detailed architecture
- Documenting complex algorithms
- Providing extensive code examples
- Recording design decisions
- No size constraints needed

**Use Steering Rules when**:

- Providing AI assistant guidance
- Sharing quick reference patterns
- Documenting conventions
- Must be concise (<200 lines)

See `.kiro/steering/README.md` for more on steering rules.

## Search Tips

1. Use your IDE's file search for specific terms
2. Check the INDEX.md file for topic mapping
3. Look in Archive/ for historical context
4. Check related feature directories for cross-cutting concerns

## Templates

Templates for creating new documentation are available in:
`.kiro/specs/documentation-cleanup/templates/`

- `design-doc-template.md` - For new design documents
- `archive-entry-template.md` - For completed implementations
