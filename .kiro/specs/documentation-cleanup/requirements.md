# Requirements Document

## Introduction

This specification addresses the need to clean up, consolidate, and restructure the Z-TD project documentation. The current documentation is scattered across multiple directories (design_docs, task_summary, .kiro/steering) with overlapping content, outdated information, and unclear organization. The goal is to create a clear, maintainable documentation structure that serves both development and onboarding needs.

## Glossary

- **Documentation System**: The collection of markdown files providing guidance, architecture information, and implementation details for the Z-TD project
- **Steering Rules**: Context files in .kiro/steering that provide guidance to AI assistants during development
- **Design Docs**: Architecture and implementation documentation in the design_docs directory
- **Task Summaries**: Implementation completion records in the task_summary directory
- **Consolidation**: The process of merging duplicate or overlapping documentation into single authoritative sources
- **Deprecation Area**: A designated location for documentation marked for potential deletion pending verification

## Requirements

### Requirement 1

**User Story:** As a developer, I want a clear documentation structure, so that I can quickly find relevant information without searching through multiple directories

#### Acceptance Criteria

1. THE Documentation System SHALL organize all documentation into a clear three-tier hierarchy: steering rules for AI guidance, design docs for architecture, and task summaries for implementation records
2. THE Documentation System SHALL eliminate duplicate documentation by consolidating overlapping content into single authoritative sources
3. THE Documentation System SHALL provide a documentation index that maps topics to their authoritative file locations
4. THE Documentation System SHALL maintain consistent naming conventions across all documentation files using SCREAMING_SNAKE_CASE for design docs and kebab-case for steering rules

### Requirement 2

**User Story:** As a developer, I want outdated documentation identified and removed, so that I don't waste time following obsolete guidance

#### Acceptance Criteria

1. WHEN documentation contains implementation details that conflict with current codebase, THE Documentation System SHALL flag the documentation as potentially outdated
2. THE Documentation System SHALL create a deprecation area for documentation that may be outdated but requires verification before deletion
3. THE Documentation System SHALL include metadata in deprecated documentation indicating why it was flagged and what verification is needed
4. THE Documentation System SHALL remove confirmed outdated documentation after verification

### Requirement 3

**User Story:** As a developer, I want steering rules to be concise and focused, so that AI assistants receive clear guidance without information overload

#### Acceptance Criteria

1. THE Documentation System SHALL limit each steering rule file to a single focused topic area
2. THE Documentation System SHALL keep steering rule files under 200 lines of content
3. THE Documentation System SHALL extract detailed implementation examples from steering rules into separate design documentation
4. THE Documentation System SHALL ensure steering rules contain only actionable guidance and patterns, not historical implementation details

### Requirement 4

**User Story:** As a developer, I want design documentation organized by feature area, so that I can understand the architecture of specific game systems

#### Acceptance Criteria

1. THE Documentation System SHALL organize design documentation into feature-based subdirectories (Towers, Zombies, UI, Core Systems, Performance)
2. THE Documentation System SHALL consolidate related design documents that cover the same feature area
3. THE Documentation System SHALL separate active design documentation from completed implementation summaries
4. THE Documentation System SHALL maintain cross-references between related design documents

### Requirement 5

**User Story:** As a developer, I want task summaries to reflect completed work, so that I can understand what has been implemented and verified

#### Acceptance Criteria

1. THE Documentation System SHALL move task summaries for completed features into an archive structure organized by feature area
2. THE Documentation System SHALL remove task summaries that duplicate information already captured in design documentation
3. THE Documentation System SHALL ensure remaining task summaries include verification status and implementation date
4. THE Documentation System SHALL consolidate multiple task summaries for the same feature into single comprehensive records

### Requirement 6

**User Story:** As a new developer, I want a documentation guide, so that I understand where to find information and how to contribute documentation

#### Acceptance Criteria

1. THE Documentation System SHALL provide a README that explains the documentation structure and purpose of each directory
2. THE Documentation System SHALL include guidelines for when to create steering rules versus design docs versus task summaries
3. THE Documentation System SHALL document the process for updating documentation when implementing new features
4. THE Documentation System SHALL provide examples of well-structured documentation for each documentation type
