---
inclusion: always
---

---

## inclusion: always

# Documentation & Summary Guidelines

## When to Create Documentation

- **Only after verification**: Create summaries ONLY when the issue/feature is confirmed working
- **On explicit request**: User asks for documentation or summary
- **Never automatically**: Do not create summary files after completing work unless requested

## Documentation Location

All task summaries and documentation go in `task_summary/` directory:

```
task_summary/
├── feature-name/
│   ├── summary.md
│   └── implementation-notes.md
└── bug-fix-name/
    └── summary.md
```

## Summary Format

Keep summaries concise and actionable:

```markdown
# [Feature/Fix Name]

## Changes Made

- Bullet list of key changes
- Focus on what, not how

## Files Modified

- path/to/file.ts - brief description
- path/to/other.ts - brief description

## Testing

- How to verify the changes work

## Notes

- Any important context or gotchas
```

## Critical Rules

1. **Do NOT create markdown files to document your work** unless explicitly requested
2. **Do NOT create summary files automatically** after completing tasks
3. **Wait for verification** before documenting
4. **Keep summaries minimal** - focus on what changed and why
5. **Avoid verbose recaps** - users can see the conversation history

## What NOT to Do

❌ Creating `CHANGES.md` after every edit
❌ Writing detailed implementation logs unprompted
❌ Documenting work-in-progress features
❌ Creating summaries before testing/verification
❌ Verbose bullet-point lists of everything you did

## What TO Do

✅ Wait for user to request documentation
✅ Create summaries only after verification
✅ Keep documentation concise and actionable
✅ Use `task_summary/` for all documentation
✅ Focus on outcomes, not process
