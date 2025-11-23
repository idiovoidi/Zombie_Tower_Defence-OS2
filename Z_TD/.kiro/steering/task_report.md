---
inclusion: always
---

# Documentation Guidelines

## Summary Creation

- Only create summaries when explicitly requested or after verifying a feature/fix is working
- Merge new summaries into existing ones when they cover the same topic/feature
- Include creation date at the top of each task report and prefixed to the filename
- Place all task reports in `Docs/task_reports/` folder

For all summary documentation only these 4 following folders exist
1. Art_Docs
2. Code_Tech_Docs
3. Design_Docs
4. My_Docs

- Place all gameplay design documents in `Docs/Design_Docs/` folder 
- Place all technical code related documents in `Docs/Code_Tech_Docs/` folder
- Place all visual design related art docs in `Docs/Art_Docs/` folder
- `Docs/Design_Docs/` Are user created docs, these docs can be read but only modified by the user directly.

Use live links connecting the design, technical and art documents to the respective entity, feature or user interface.

Use live links to referenced files
Markdown live link example:
#[[file:<relative_file_name>]]

## Naming Convention

**Required format:** `DD-MM-2025_[Filename].md`

## Format

Keep summaries concise and actionable. Focus on what changed, why, and any important context for future work.

## Consolidation Guidelines

When multiple documents cover overlapping topics:
1. Create a new consolidated document with current date
2. Merge content, removing duplicates
3. Move old documents to appropriate Archive folder
4. Update index files and READMEs to point to consolidated version

## Index Files

Maintain index files for easy navigation:
- `task_reports/00_INDEX.md` - Task reports index
- Each should reference consolidated guides as primary resources



