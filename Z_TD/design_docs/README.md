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

### Design Documents (Core_Systems/, Features/)
Detailed architecture and implementation documentation:
- **Purpose**: Explain how systems work, design decisions, technical details
- **Content**: Architecture diagrams, data models, algorithms, code examples
- **Size**: No limit - as detailed as needed
- **When to create**: Planning new features, documenting complex systems

### Archive Entries (Archive/)
Historical records of completed implementations:
- **Purpose**: Document what was built, how it works, verification results
- **Content**: Implementation summary, files modified, testing results
- **Size**: No limit
- **When to create**: After completing and verifying a feature

## Contribution Guidelines

### Adding New Documentation

1. **Choose the right location**:
   - Core system? → `Core_Systems/[System_Name]/`
   - Game feature? → `Features/[Feature_Name]/`
   - Completed work? → `Archive/[Feature_Name]/`

2. **Follow naming conventions**:
   - Use SCREAMING_SNAKE_CASE for files: `TOWER_MECHANICS.md`
   - Use PascalCase for directories: `Memory_Management/`
   - Use descriptive names: `DAMAGE_CALCULATION.md` not `calc.md`

3. **Use standard structure**:
   - Start with Overview section
   - Include Architecture/Implementation sections
   - Add code examples where helpful
   - Link to related documentation

### Updating Existing Documentation

1. Keep documentation in sync with code changes
2. Update cross-references when moving files
3. Add "Last Updated" dates for major changes
4. Archive outdated versions rather than deleting

### Cross-Referencing

Use relative links to reference other documentation:
```markdown
See [Memory Management](Core_Systems/Memory_Management/README.md)
See [Tower Types](Features/Towers/TOWER_TYPES.md)
```

## Finding Information

### By Topic

- **Memory/Performance issues**: `Core_Systems/Memory_Management/`, `Core_Systems/Performance/`
- **Tower development**: `Features/Towers/`
- **Zombie behavior**: `Features/Zombies/`
- **UI components**: `Features/UI/`
- **Combat mechanics**: `Features/Combat/`
- **Wave system**: `Features/Waves/`
- **Completed features**: `Archive/`

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
