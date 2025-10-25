# Steering Rules

Steering rules provide concise, actionable guidance to AI assistants during development. These files are automatically included in AI context based on the files being worked on.

## Purpose

Steering rules help AI assistants:

- Follow project conventions and patterns
- Use the correct tech stack and commands
- Apply consistent coding standards
- Understand project structure
- Make appropriate architectural decisions

## Structure

```
.kiro/steering/
├── core/          # Core development patterns
│   ├── tech.md       # Tech stack, commands, tools
│   ├── structure.md  # Project organization, file patterns
│   └── cleanup.md    # Memory management, cleanup patterns
├── features/      # Feature-specific guidance
│   ├── towers.md     # Tower development patterns
│   ├── zombies.md    # Zombie type patterns
│   └── stats.md      # Stat tracking patterns
└── process/       # Development process
    ├── product.md    # Product overview, gameplay
    └── summary.md    # Documentation guidelines
```

## Steering Rule Format

Each steering rule file follows this structure:

```markdown
---
inclusion: fileMatch | manual | always
fileMatchPattern: 'pattern/**/*.ts' # if fileMatch
---

# [Topic Name]

## Quick Reference

[Tables, commands, key patterns]

## Rules

[Actionable guidelines]

## Common Patterns

[Minimal code examples]

## See Also

[Links to detailed design docs]
```

## Inclusion Types

### Always Included

Files without frontmatter or with `inclusion: always` are included in all AI interactions.

**Use for**: Core patterns, tech stack, project structure

### File Match (Conditional)

Files with `inclusion: fileMatch` are included only when working on matching files.

```yaml
---
inclusion: fileMatch
fileMatchPattern: ['**/towers/**/*.ts', '**/Tower*.ts']
---
```

**Use for**: Feature-specific guidance that's only relevant for certain files

### Manual

Files with `inclusion: manual` are only included when explicitly referenced.

```yaml
---
inclusion: manual
---
```

**Use for**: Specialized guidance needed only in specific contexts

## Guidelines

### Keep It Concise

- **Maximum 200 lines per file**
- Focus on patterns, not implementation details
- Use tables for quick reference
- Link to design docs for details

### Be Actionable

- Provide clear rules and patterns
- Include minimal code examples
- Show correct usage, not theory
- Focus on "how" not "why"

### Stay Current

- Update when patterns change
- Remove outdated guidance
- Keep examples working
- Sync with codebase

### Avoid Implementation Details

Steering rules are for patterns, not detailed implementations:

**Good** (steering rule):

```markdown
## Tower Creation Pattern

Use TowerFactory.createTower(type, position)
```

**Bad** (belongs in design doc):

```markdown
## Tower Creation Implementation

The TowerFactory class uses a factory pattern with...
[50 lines of implementation details]
```

## Creating New Steering Rules

1. **Choose the right category**:
   - Core pattern? → `core/`
   - Feature-specific? → `features/`
   - Process guideline? → `process/`

2. **Use appropriate inclusion**:
   - Always needed? → `inclusion: always` or no frontmatter
   - File-specific? → `inclusion: fileMatch` with pattern
   - Specialized? → `inclusion: manual`

3. **Keep it focused**:
   - One topic per file
   - Under 200 lines
   - Patterns only, not details

4. **Link to design docs**:
   - Add "See Also" section
   - Reference detailed documentation
   - Don't duplicate content

## Steering Rules vs Design Docs

**Use Steering Rules for**:

- Quick reference patterns
- Commands and conventions
- AI assistant guidance
- Must be <200 lines

**Use Design Docs for**:

- Detailed architecture
- Implementation guides
- Complex examples
- No size limit

See `design_docs/README.md` for design documentation guidelines.

## Examples

### Good Steering Rule

```markdown
---
inclusion: fileMatch
fileMatchPattern: '**/towers/**/*.ts'
---

# Tower Development

## Quick Reference

| Tower Type | Base Damage | Range | Special |
| ---------- | ----------- | ----- | ------- |
| Basic      | 10          | 150   | None    |
| Sniper     | 50          | 300   | Pierce  |

## Rules

- Extend Tower base class
- Implement ITower interface
- Register with TowerFactory

## See Also

- [Tower Architecture](../../design_docs/Features/Towers/ARCHITECTURE.md)
```

### Bad Steering Rule (Too Detailed)

```markdown
# Tower System

[200+ lines of implementation details, class diagrams,
full code examples, historical context...]
```

## Maintenance

- Review steering rules quarterly
- Update when major patterns change
- Split files that exceed 200 lines
- Archive outdated guidance
