---
inclusion: always | fileMatch | manual
fileMatchPattern: 'pattern/**/*.ts'  # Only if inclusion: fileMatch
---

# [Topic Name]

Brief description of what this steering rule covers and when it should be used.

## Quick Reference

[Tables, commands, or key information that developers need at a glance]

| Item | Value | Notes |
|------|-------|-------|
| Example | Value | Description |

## Rules

[Actionable guidelines that should be followed]

1. Rule one with clear action
2. Rule two with specific guidance
3. Rule three with concrete examples

## Common Patterns

[Minimal code examples showing correct usage]

```typescript
// Example pattern
class Example {
  // Show the pattern, not full implementation
}
```

## Anti-Patterns

[What NOT to do - common mistakes]

```typescript
// ❌ Bad - explain why
const bad = () => {};

// ✅ Good - show correct approach
const good = () => {};
```

## See Also

- [Related Design Doc](../../design_docs/Features/[Feature]/[DOC].md)
- [Related Steering Rule](../[category]/[rule].md)

---

**Guidelines for this template:**
- Keep under 200 lines total
- Focus on patterns, not implementation details
- Use tables for quick reference
- Minimal code examples only
- Link to design docs for details
- One focused topic per file
