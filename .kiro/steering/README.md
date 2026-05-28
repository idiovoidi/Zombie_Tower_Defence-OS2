# Steering Rules

Steering files provide AI context automatically based on inclusion rules.

## Inclusion Types
- `always` — included in every interaction
- `fileMatch` + `fileMatchPattern` — included when matching files are in context
- `manual` — only when explicitly referenced

## Files
| File | Inclusion | Topic |
|------|-----------|-------|
| `product.md` | always | Game overview |
| `structure.md` | always | Directory layout, architecture |
| `typescript.md` | always | TS patterns and rules |
| `cleanup.md` | always | Memory management |
| `task_report.md` | always | Doc creation rules |
| `tests.md` | always | Test conventions |
| `tech.md` | manual | Tech stack, commands |
| `core/renderers.md` | fileMatch | Renderer pattern |
| `features/towers.md` | fileMatch | Tower stats and patterns |
| `features/zombies.md` | fileMatch | Zombie stats and patterns |
| `features/stats.md` | fileMatch | Stat tracking system |

## Rules
- Max 200 lines per file
- Patterns and rules only — no implementation details
- Link to `Docs/` for detailed design docs
