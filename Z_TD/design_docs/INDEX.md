# Documentation Index

Quick reference guide to find documentation by topic. All paths are relative to the repository root.

## Quick Links (Most Referenced)

- [Memory Management Guide](Core_Systems/Memory_Management/README.md) - Cleanup patterns, memory leak prevention
- [Tower Development](Features/Towers/README.md) - Tower architecture and implementation
- [Zombie Types](Features/Zombies/README.md) - Zombie mechanics and visual design
- [UI Layout Guide](Features/UI/UI_LAYOUT_GUIDE.md) - UI component structure and patterns
- [Performance Testing](Core_Systems/Performance/PERFORMANCE_TESTING_GUIDE.md) - Performance monitoring and optimization
- [Stat Tracking Guide](Core_Systems/Stat_Tracking/GUIDE.md) - Player statistics and reporting

## Steering Rules

AI assistant guidance files (concise, actionable patterns). Located in `.kiro/steering/`

### Core Patterns
- [tech.md](../.kiro/steering/tech.md) - Tech stack, commands, build tools
- [structure.md](../.kiro/steering/structure.md) - Project organization, file patterns, path aliases
- [cleanup.md](../.kiro/steering/cleanup.md) - Memory management, cleanup patterns, timer management
- [product.md](../.kiro/steering/product.md) - Product overview, gameplay mechanics
- [summary.md](../.kiro/steering/summary.md) - Documentation guidelines

### Feature-Specific
- [towers.md](../.kiro/steering/features/towers.md) - Tower development patterns
- [zombies.md](../.kiro/steering/features/zombies.md) - Zombie type patterns and combat modifiers
- [stats.md](../.kiro/steering/features/stats.md) - Stat tracking quick reference

### Process
- [README.md](../.kiro/steering/README.md) - Steering rules guide and usage

## Core Systems

Foundational game systems and architecture. Located in `design_docs/Core_Systems/`

### Memory Management
- [README.md](Core_Systems/Memory_Management/README.md) - Overview of memory management approach
- [CLEANUP_GUIDE.md](Core_Systems/Memory_Management/CLEANUP_GUIDE.md) - Cleanup patterns and best practices
- [MEMORY_LEAK_GUIDE.md](Core_Systems/Memory_Management/MEMORY_LEAK_GUIDE.md) - Identifying and fixing memory leaks
- [MEMORY_OPTIMIZATION_GUIDE.md](Core_Systems/Memory_Management/MEMORY_OPTIMIZATION_GUIDE.md) - Optimization strategies
- [DISPOSAL_ARCHITECTURE.md](Core_Systems/Memory_Management/DISPOSAL_ARCHITECTURE.md) - Resource disposal patterns
- [PERSISTENT_EFFECTS_FIX.md](Core_Systems/Memory_Management/PERSISTENT_EFFECTS_FIX.md) - Persistent effect cleanup
- [TESLA_LIGHTNING_PERSISTENCE_FIX.md](Core_Systems/Memory_Management/TESLA_LIGHTNING_PERSISTENCE_FIX.md) - Tesla tower effect cleanup
- [TESLA_PARTICLE_FIX.md](Core_Systems/Memory_Management/TESLA_PARTICLE_FIX.md) - Tesla particle system fixes

### Performance
- [PERFORMANCE_TESTING_GUIDE.md](Core_Systems/Performance/PERFORMANCE_TESTING_GUIDE.md) - Performance monitoring and testing
- [LAYOUT_OPTIMIZATION_SUMMARY.md](Core_Systems/Performance/LAYOUT_OPTIMIZATION_SUMMARY.md) - UI layout optimization
- [GRAPHICS_AUDIT_SUMMARY.md](Core_Systems/Performance/GRAPHICS_AUDIT_SUMMARY.md) - Graphics performance audit
- [CLEANUP_VERIFICATION_SUMMARY.md](Core_Systems/Performance/CLEANUP_VERIFICATION_SUMMARY.md) - Cleanup verification results
- [CORPSE_CLEANUP_VERIFICATION.md](Core_Systems/Performance/CORPSE_CLEANUP_VERIFICATION.md) - Corpse cleanup verification
- [PERSISTENT_EFFECTS_VERIFICATION.md](Core_Systems/Performance/PERSISTENT_EFFECTS_VERIFICATION.md) - Effect cleanup verification
- [TASK_7_COMPLETION_SUMMARY.md](Core_Systems/Performance/TASK_7_COMPLETION_SUMMARY.md) - Performance task completion

### Stat Tracking
- [GUIDE.md](Core_Systems/Stat_Tracking/GUIDE.md) - Comprehensive stat tracking implementation guide
- [EXAMPLES.md](Core_Systems/Stat_Tracking/EXAMPLES.md) - Code examples for stat tracking

### Testing & Debugging
- [DEBUG_HOTKEYS.md](Core_Systems/Testing/DEBUG_HOTKEYS.md) - Debug keyboard shortcuts
- [DEBUG_TEST_UI_MANAGER.md](Core_Systems/Testing/DEBUG_TEST_UI_MANAGER.md) - Debug UI manager implementation

## Features

Game features and mechanics. Located in `design_docs/Features/`

### Towers
- [README.md](Features/Towers/README.md) - Tower system overview
- [IMPROVEMENTS.md](Features/Towers/IMPROVEMENTS.md) - Tower improvements and enhancements
- [IDEAS.md](Features/Towers/IDEAS.md) - Future tower ideas and concepts
- [PROGRESSION_DESIGN.md](Features/Towers/PROGRESSION_DESIGN.md) - Tower progression and upgrade system

### Zombies
- [README.md](Features/Zombies/README.md) - Zombie system overview
- [IMPLEMENTATION.md](Features/Zombies/IMPLEMENTATION.md) - Zombie implementation details
- [IMPLEMENTATION_STATUS.md](Features/Zombies/IMPLEMENTATION_STATUS.md) - Current implementation status
- [VISUAL_REFERENCE.md](Features/Zombies/VISUAL_REFERENCE.md) - Visual design reference
- [ZOMBIE_REFERENCE.md](Features/Zombies/ZOMBIE_REFERENCE.md) - Zombie type reference
- [Zombie_Strength&Weakness.md](Features/Zombies/Zombie_Strength&Weakness.md) - Combat balance
- [ZOMBIE_RENDERER_CREATION_GUIDE.md](Features/Zombies/ZOMBIE_RENDERER_CREATION_GUIDE.md) - Creating zombie renderers
- [BASIC_ZOMBIE_DESIGN.md](Features/Zombies/BASIC_ZOMBIE_DESIGN.md) - Basic zombie design
- [BASIC_ZOMBIE_VISUAL_REFERENCE.md](Features/Zombies/BASIC_ZOMBIE_VISUAL_REFERENCE.md) - Basic zombie visuals
- [FAST_ZOMBIE_VISUAL_REFERENCE.md](Features/Zombies/FAST_ZOMBIE_VISUAL_REFERENCE.md) - Fast zombie visuals
- [ARMORED_ZOMBIE_VISUAL_REFERENCE.md](Features/Zombies/ARMORED_ZOMBIE_VISUAL_REFERENCE.md) - Armored zombie visuals
- [TANK_ZOMBIE_VISUAL_REFERENCE.md](Features/Zombies/TANK_ZOMBIE_VISUAL_REFERENCE.md) - Tank zombie visuals
- [SPACING_AND_VISIBILITY_IMPROVEMENTS.md](Features/Zombies/SPACING_AND_VISIBILITY_IMPROVEMENTS.md) - Visual improvements
- [corpse_redesign_complete.md](Features/Zombies/corpse_redesign_complete.md) - Corpse system redesign
- [ENVIRONMENT_REDESIGN.md](Features/Zombies/ENVIRONMENT_REDESIGN.md) - Zombie environment redesign

### User Interface
- [README.md](Features/UI/README.md) - UI system overview
- [UI_LAYOUT_GUIDE.md](Features/UI/UI_LAYOUT_GUIDE.md) - UI layout patterns and structure
- [TOWER_SHOP_DESIGN.md](Features/UI/TOWER_SHOP_DESIGN.md) - Tower shop UI design
- [BOTTOM_BAR_DESIGN.md](Features/UI/BOTTOM_BAR_DESIGN.md) - Bottom bar UI design
- [WAVE_INFO_PANEL_DESIGN.md](Features/UI/WAVE_INFO_PANEL_DESIGN.md) - Wave info panel design

### Waves
- [ENHANCED_WAVE_PROGRESSION.md](Features/Waves/ENHANCED_WAVE_PROGRESSION.md) - Wave progression system

### Camp/Base
- [CAMP_UPGRADE_SYSTEM.md](Features/Camp/CAMP_UPGRADE_SYSTEM.md) - Camp upgrade mechanics
- [SURVIVOR_CAMP_DESIGN.md](Features/Camp/SURVIVOR_CAMP_DESIGN.md) - Survivor camp design
- [SURVIVOR_CAMP_VISUAL_OVERHAUL.md](Features/Camp/SURVIVOR_CAMP_VISUAL_OVERHAUL.md) - Camp visual design

### Environment
- [GRAVEYARD.md](Features/Environment/GRAVEYARD.md) - Graveyard environment design
- [PATH_DESIGN.md](Features/Environment/PATH_DESIGN.md) - Path system design

### Combat
- (No current documentation - see Towers and Zombies for combat-related content)

## Game Balance

Balance and progression tuning. Located in `design_docs/Game_Balance/`

- [WAVE_BALANCING_GUIDE.md](Game_Balance/WAVE_BALANCING_GUIDE.md) - Wave difficulty balancing
- [WAVE_PROGRESSION_GUIDE.md](Game_Balance/WAVE_PROGRESSION_GUIDE.md) - Wave progression design
- [AI_Test_Balance/](Game_Balance/AI_Test_Balance/) - AI testing balance data

## Archive

Completed implementations and historical documentation. Located in `design_docs/Archive/`

- [README.md](Archive/README.md) - Archive purpose and organization

### Core Systems (Archived)
- [HEALTH_COMPONENT.md](Archive/Core_Systems/HEALTH_COMPONENT.md) - Health component implementation
- [HOTKEY_SYSTEM.md](Archive/Core_Systems/HOTKEY_SYSTEM.md) - Hotkey system implementation
- [PROJECTILE_SYSTEM.md](Archive/Core_Systems/PROJECTILE_SYSTEM.md) - Projectile system implementation

### Towers (Archived)
- [TOWER_REDESIGN.md](Archive/Towers/TOWER_REDESIGN.md) - Tower system redesign
- [TOWER_SELECTION_FIX.md](Archive/Towers/TOWER_SELECTION_FIX.md) - Tower selection fixes
- [TOWER_UPGRADES_VISUAL.md](Archive/Towers/TOWER_UPGRADES_VISUAL.md) - Tower upgrade visuals

### UI (Archived)
- [AI_CONTROL_INTEGRATION.md](Archive/UI/AI_CONTROL_INTEGRATION.md) - AI control UI integration
- [DEBUG_INFO_AUTO_CLOSE.md](Archive/UI/DEBUG_INFO_AUTO_CLOSE.md) - Debug panel auto-close
- [DEBUG_INFO_PANEL_SHORTCUTS.md](Archive/UI/DEBUG_INFO_PANEL_SHORTCUTS.md) - Debug panel shortcuts
- [DEBUG_TEST_UI_MANAGER_IMPLEMENTATION.md](Archive/UI/DEBUG_TEST_UI_MANAGER_IMPLEMENTATION.md) - Debug UI manager
- [PANEL_CLOSE_BUTTONS.md](Archive/UI/PANEL_CLOSE_BUTTONS.md) - Panel close button implementation
- [SCREEN_LAYOUT_UPDATE.md](Archive/UI/SCREEN_LAYOUT_UPDATE.md) - Screen layout updates
- [STATS_PANEL_INTEGRATION.md](Archive/UI/STATS_PANEL_INTEGRATION.md) - Stats panel integration

### Zombies (Archived)
- [ZOMBIE_ENHANCEMENTS_SUMMARY.md](Archive/Zombies/ZOMBIE_ENHANCEMENTS_SUMMARY.md) - Zombie enhancements
- [ZOMBIE_SPAWNING.md](Archive/Zombies/ZOMBIE_SPAWNING.md) - Zombie spawning implementation
- [ZOMBIE_VISUALS.md](Archive/Zombies/ZOMBIE_VISUALS.md) - Zombie visual implementation

## Topic-Based Search

### Finding Information By Topic

**Memory & Performance**
- Start: [Memory Management README](Core_Systems/Memory_Management/README.md)
- Cleanup: [cleanup.md](../.kiro/steering/cleanup.md) (patterns), [CLEANUP_GUIDE.md](Core_Systems/Memory_Management/CLEANUP_GUIDE.md) (details)
- Performance: [PERFORMANCE_TESTING_GUIDE.md](Core_Systems/Performance/PERFORMANCE_TESTING_GUIDE.md)

**Tower Development**
- Start: [Towers README](Features/Towers/README.md)
- Patterns: [towers.md](../.kiro/steering/features/towers.md)
- Design: [PROGRESSION_DESIGN.md](Features/Towers/PROGRESSION_DESIGN.md)
- Ideas: [IDEAS.md](Features/Towers/IDEAS.md)

**Zombie Development**
- Start: [Zombies README](Features/Zombies/README.md)
- Patterns: [zombies.md](../.kiro/steering/features/zombies.md)
- Implementation: [IMPLEMENTATION.md](Features/Zombies/IMPLEMENTATION.md)
- Visuals: [VISUAL_REFERENCE.md](Features/Zombies/VISUAL_REFERENCE.md)

**UI Development**
- Start: [UI README](Features/UI/README.md)
- Layout: [UI_LAYOUT_GUIDE.md](Features/UI/UI_LAYOUT_GUIDE.md)
- Components: Individual design files in Features/UI/

**Project Setup & Structure**
- Tech Stack: [tech.md](../.kiro/steering/tech.md)
- Structure: [structure.md](../.kiro/steering/structure.md)
- Product: [product.md](../.kiro/steering/product.md)

**Statistics & Reporting**
- Quick Reference: [stats.md](../.kiro/steering/features/stats.md)
- Detailed Guide: [GUIDE.md](Core_Systems/Stat_Tracking/GUIDE.md)
- Examples: [EXAMPLES.md](Core_Systems/Stat_Tracking/EXAMPLES.md)

**Game Balance**
- Waves: [WAVE_BALANCING_GUIDE.md](Game_Balance/WAVE_BALANCING_GUIDE.md)
- Progression: [WAVE_PROGRESSION_GUIDE.md](Game_Balance/WAVE_PROGRESSION_GUIDE.md)

## Documentation Types

### When to Use Each Type

**Steering Rules** (`.kiro/steering/`)
- Concise AI guidance (<200 lines)
- Quick reference patterns
- Actionable rules and conventions
- Minimal code examples
- See: [Steering README](../.kiro/steering/README.md)

**Design Docs** (`design_docs/`)
- Detailed architecture
- Implementation guides
- Complex examples
- No size limit
- See: [Design Docs README](README.md)

**Archive** (`design_docs/Archive/`)
- Completed implementations
- Historical records
- Verification results
- See: [Archive README](Archive/README.md)

## Contributing Documentation

See [README.md](README.md) for:
- Documentation structure guidelines
- Naming conventions
- Cross-referencing patterns
- When to create new documentation
- Documentation templates

## Search Tips

1. **By Feature**: Check `Features/[feature-name]/README.md` first
2. **By System**: Check `Core_Systems/[system-name]/README.md` first
3. **Quick Patterns**: Check `.kiro/steering/` for concise guidance
4. **Historical**: Check `Archive/` for completed work
5. **Use Ctrl+F**: Search this index for keywords

## Maintenance

This index is maintained as part of the documentation cleanup spec. Update when:
- Adding new documentation files
- Reorganizing documentation structure
- Archiving completed work
- Deprecating outdated content
