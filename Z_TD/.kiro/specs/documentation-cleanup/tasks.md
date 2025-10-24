# Implementation Plan

- [x] 1. Create new documentation structure
  - Create new directory hierarchy for organized documentation
  - Create README files explaining each section's purpose
  - Create documentation templates for steering rules, design docs, and archive entries
  - _Requirements: 1.1, 1.3_

- [x] 1.1 Create core directory structure
  - Create .kiro/steering/core/, .kiro/steering/features/, .kiro/steering/process/ directories
  - Create design_docs/Core_Systems/, design_docs/Features/, design_docs/Archive/ directories
  - Create design_docs/Core_Systems subdirectories (Memory_Management, Performance, Testing)
  - Create design_docs/Features subdirectories (Towers, Zombies, UI, Combat, Waves)
  - _Requirements: 1.1_

- [x] 1.2 Create documentation README files
  - Write design_docs/README.md explaining documentation structure and contribution guidelines
  - Write .kiro/steering/README.md explaining steering rule purpose and usage
  - Write design_docs/Archive/README.md explaining archive purpose

  - _Requirements: 1.3, 6.1, 6.2_

- [ ] 1.3 Create documentation templates
  - Create .kiro/specs/documentation-cleanup/templates/steering-rule-template.md
  - Create .kiro/specs/documentation-cleanup/templates/design-doc-template.md
  - Create .kiro/specs/documentation-cleanup/templates/archive-entry-template.md
  - _Requirements: 6.4_

- [x] 2. Consolidate and reorganize steering rules
  - Split oversized steering rules into focused files
  - Organize steering rules into subdirectories by category
  - Update frontmatter for conditional inclusion
  - Extract detailed content to design docs
  - _Requirements: 3.1, 3.2, 3.3, 3.4_

- [x] 2.1 Refactor Stat_Tracking.md
  - Extract quick reference tables and keep in new .kiro/steering/features/stats.md (<200 lines)
  - Move detailed implementation guide to design_docs/Core_Systems/Stat_Tracking/GUIDE.md
  - Move code examples to design_docs/Core_Systems/Stat_Tracking/EXAMPLES.md
  - Update frontmatter with appropriate fileMatchPattern
  - _Requirements: 3.1, 3.2, 3.3_

- [x] 2.2 Refactor Zombie_Types.md
  - Keep combat modifiers matrix in new .kiro/steering/features/zombies.md
  - Move visual reference details to design_docs/Features/Zombies/VISUAL_REFERENCE.md
  - Move implementation details to design_docs/Features/Zombies/IMPLEMENTATION.md
  - Update frontmatter with appropriate fileMatchPattern
  - _Requirements: 3.1, 3.2, 3.3_

- [ ] 2.3 Enhance and reorganize Towers.md
  - Move to .kiro/steering/features/towers.md
  - Add tower type quick reference table
  - Add damage calculation pattern examples
  - Add links to detailed tower documentation
  - Update frontmatter with appropriate fileMatchPattern
  - _Requirements: 3.1, 3.4_

- [ ] 2.4 Reorganize core steering rules
  - Move tech.md to .kiro/steering/core/tech.md
  - Move structure.md to .kiro/steering/core/structure.md
  - Move cleanup.md to .kiro/steering/core/cleanup.md

  - Move product.md to .kiro/steering/process/product.md
  - Move summary.md to .kiro/steering/process/summary.md
  - Update any references to these files
  - _Requirements: 1.1, 1.4_

- [x] 3. Reorganize design documentation
  - Create feature-based directory structure
  - Move existing design docs to appropriate locations
  - Consolidate overlapping documentation
  - Update cross-references between documents
  - _Requirements: 4.1, 4.2, 4.3, 4.4_

- [x] 3.1 Reorganize memory management documentation
  - Move all files from design_docs/Augment_Code_Docs/ to design_docs/Core_Systems/Memory_Management/
  - Create design_docs/Core_Systems/Memory_Management/README.md as overview
  - Consolidate CLEANUP\_\*.md files into single CLEANUP_GUIDE.md
  - Consolidate MEMORY*LEAK*\*.md files into single MEMORY_LEAK_GUIDE.md
  - Delete Augment_Code_Docs directory after migration

  - _Requirements: 4.1, 4.2_

- [x] 3.2 Reorganize tower documentation
  - Move design_docs/Towers/\* to design_docs/Features/Towers/

  - Move TOWER\_\*.md files from root to design_docs/Features/Towers/
  - Consolidate TOWER_DESIGN_IMPROVEMENTS.md and CURRENT_TOWER_IMPROVEMENTS.md into IMPROVEMENTS.md
  - Move FUTURE_TOWER_IDEAS.md to design_docs/Features/Towers/IDEAS.md

  - Create design_docs/Features/Towers/README.md as overview
  - _Requirements: 4.1, 4.2, 4.4_

- [x] 3.3 Reorganize zombie documentation
  - Move design_docs/Zombies/\* to design_docs/Features/Zombies/
  - Move ZOMBIE\_\*.md files from root to design_docs/Features/Zombies/
  - Create design_docs/Features/Zombies/README.md as overview
  - _Requirements: 4.1, 4.4_

- [x] 3.4 Reorganize UI documentation
  - Move design_docs/User_Interface/\* to design_docs/Features/UI/
  - Create design_docs/Features/UI/README.md as overview
  - _Requirements: 4.1, 4.4_

- [x] 3.5 Consolidate graveyard and environment documentation
  - Create design_docs/Features/Environment/ directory
  - Consolidate graveyard\_\*.md files into design_docs/Features/Environment/GRAVEYARD.md
  - Move ZOMBIE_ENVIRONMENT_REDESIGN.md to design_docs/Features/Environment/
  - _Requirements: 4.2_

- [ ] 3.6 Reorganize wave and camp documentation
  - Create design_docs/Features/Waves/ directory
  - Move ENHANCED_WAVE_PROGRESSION.md to design_docs/Features/Waves/
  - Move design*docs/Game_Balance/WAVE*\*.md to design_docs/Features/Waves/
  - Create design_docs/Features/Camp/ directory
  - Move CAMP*UPGRADE_SYSTEM.md and SURVIVOR_CAMP*\*.md to design_docs/Features/Camp/
  - _Requirements: 4.1, 4.4_

- [ ] 3.7 Reorganize performance documentation
  - Create design_docs/Core_Systems/Performance/ directory
  - Move PERFORMANCE_TESTING_GUIDE.md to design_docs/Core_Systems/Performance/
  - Move LAYOUT_OPTIMIZATION_SUMMARY.md to design_docs/Core_Systems/Performance/
  - Move task_summary/performance-optimization/\* to design_docs/Core_Systems/Performance/
  - _Requirements: 4.1, 4.4_

- [x] 3.8 Handle personal and miscellaneous documentation
  - Add design_docs/My_Docs/ to .gitignore
  - Move PATH_DESIGN.md to design_docs/Features/Environment/
  - Move DEBUG\_\*.md files to design_docs/Core_Systems/Testing/
  - _Requirements: 4.2_

- [x] 4. Archive completed task summaries
  - Review each task summary for relevance
  - Move completed implementations to Archive
  - Flag outdated summaries for deprecation
  - Remove redundant summaries
  - _Requirements: 5.1, 5.2, 5.3, 5.4_

- [x] 4.1 Archive tower implementation summaries
  - Move task*summary/TOWER*\*.md to design_docs/Archive/Towers/
  - Add completion dates and verification status
  - Link from design_docs/Features/Towers/README.md
  - _Requirements: 5.1, 5.3_

- [x] 4.2 Archive zombie implementation summaries
  - Move task*summary/ZOMBIE*\*.md to design_docs/Archive/Zombies/
  - Add completion dates and verification status
  - Link from design_docs/Features/Zombies/README.md
  - _Requirements: 5.1, 5.3_

- [x] 4.3 Archive UI implementation summaries
  - Move task*summary/DEBUG_INFO*\*.md to design_docs/Archive/UI/
  - Move task*summary/PANEL*\*.md to design_docs/Archive/UI/
  - Move task_summary/SCREEN_LAYOUT_UPDATE.md to design_docs/Archive/UI/
  - Add completion dates and verification status
  - _Requirements: 5.1, 5.3_

- [x] 4.4 Archive system implementation summaries
  - Move task_summary/HOTKEY_SYSTEM.md to design_docs/Archive/Core_Systems/
  - Move task_summary/PROJECTILE_SYSTEM.md to design_docs/Archive/Core_Systems/
  - Move task_summary/HealthComponent.md to design_docs/Archive/Core_Systems/
  - Add completion dates and verification status
  - _Requirements: 5.1, 5.3_

- [x] 4.5 Handle redundant and outdated summaries
  - Review task_summary/A_ReadMe.md - move installation info to root README or delete
  - Review task_summary/USAGE_EXAMPLE.md - archive or delete if redundant
  - Review task_summary/VISUAL_CHANGES.md - consolidate with relevant feature docs
  - Move remaining summaries to appropriate Archive locations
  - _Requirements: 5.2, 5.4_

- [-] 5. Create deprecation area and flag outdated documentation


  - Create deprecation directory structure
  - Identify potentially outdated documentation
  - Move flagged docs to deprecation area
  - Create deprecation info files
  - _Requirements: 2.1, 2.2, 2.3_

- [ ] 5.1 Create deprecation infrastructure
  - Create .kiro/specs/documentation-cleanup/deprecated/ directory
  - Write .kiro/specs/documentation-cleanup/deprecated/README.md explaining deprecation process
  - Create DEPRECATION_INFO template
  - _Requirements: 2.2, 2.3_

- [ ] 5.2 Identify and flag potentially outdated documentation
  - Review design_docs for files with "complete" or "summary" in name

  - Check for docs that conflict with current codebase
  - Check for docs with very old last-modified dates
  - Create list of candidates for deprecation
  - _Requirements: 2.1_

- [ ] 5.3 Move flagged documentation to deprecation area
  - Move identified outdated docs to deprecated/ directory
  - Create DEPRECATION_INFO.md for each flagged doc explaining why and what to verify
  - Update any references to flagged docs
  - _Requirements: 2.2, 2.3_

- [ ] 6. Create documentation index and contribution guide
  - Generate topic-based documentation index
  - Write contribution guidelines
  - Create search guide
  - Document when to use each documentation type
  - _Requirements: 1.3, 6.1, 6.2, 6.3, 6.4_

- [ ] 6.1 Create documentation index
  - Write design_docs/INDEX.md mapping topics to documentation locations
  - Include sections for: Core Systems, Features, Archive, Steering Rules
  - Add quick links to most commonly referenced docs
  - _Requirements: 1.3_

- [ ] 6.2 Write contribution guidelines
  - Document when to create steering rules vs design docs vs archive entries
  - Document naming conventions for each documentation type
  - Document frontmatter requirements for steering rules
  - Document cross-referencing conventions
  - Add to design_docs/README.md
  - _Requirements: 6.2, 6.3_

- [ ] 6.3 Create documentation search guide
  - Document how to find information by topic
  - Document how to search within documentation
  - Document common documentation patterns
  - Add to design_docs/README.md
  - _Requirements: 6.1_

- [ ] 6.4 Document documentation types and usage
  - Explain when to use steering rules (AI guidance, <200 lines, patterns only)
  - Explain when to use design docs (detailed architecture, no size limit)
  - Explain when to create archive entries (completed implementations)
  - Provide examples of each type
  - Add to design_docs/README.md
  - _Requirements: 6.2, 6.4_

- [ ] 7. Validate and test documentation structure
  - Run validation checks on all documentation
  - Test with AI assistant
  - Test with developer onboarding scenario
  - Fix any issues found
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 4.4_

- [ ] 7.1 Validate steering rules
  - Check all steering rules are <200 lines
  - Verify all have proper frontmatter
  - Verify no implementation details (only patterns)
  - Verify all code examples are minimal
  - _Requirements: 3.1, 3.2_

- [ ] 7.2 Validate design documentation
  - Check all design docs follow standard structure
  - Verify all have Overview section
  - Verify all cross-references are valid
  - Check for duplicate content
  - _Requirements: 4.2, 4.4_

- [ ] 7.3 Validate archive entries
  - Check all have completion dates
  - Check all have verification status
  - Verify all link to current docs
  - _Requirements: 5.3_

- [ ] 7.4 Validate links and references
  - Check all internal links work
  - Check all file references exist
  - Check all #[[file:...]] references are valid
  - Fix any broken links
  - _Requirements: 4.4_

- [ ]\* 7.5 Test with AI assistant
  - Ask AI to implement a sample tower feature
  - Verify AI uses steering rules correctly
  - Verify AI references design docs appropriately
  - Document any issues found
  - _Requirements: 1.1, 3.4_

- [ ]\* 7.6 Test developer onboarding
  - Have a developer (or simulate) read documentation
  - Verify they can find information quickly
  - Verify they understand where to add new docs
  - Document any confusion points
  - _Requirements: 6.1, 6.2_

- [ ]\* 7.7 Test documentation search
  - Search for specific topics across documentation
  - Verify results are relevant
  - Verify no duplicate results
  - Document search patterns that work well
  - _Requirements: 1.1, 1.3_
