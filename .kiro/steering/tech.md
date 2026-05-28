---
inclusion: manual
---

# Tech Stack

- **TypeScript** 5.7.3 — strict mode, ES2020 target
- **PixiJS** 8.8.1 — WebGL 2D renderer
- **Vite** 6.2.0 — dev server (port 8080), builds to `dist/`
- **Jest** 30.1.3 — primary test runner (ts-jest), 80% coverage threshold
- **ESLint / Prettier** — 100 char width, single quotes, 2-space indent, semicolons

## Commands
```bash
npm run dev          # Dev server :8080
npm run build        # Lint + type-check + build
npm run type-check   # tsc --noEmit
npm run lint:fix     # Auto-fix lint
npm test             # Jest
npm run test:coverage
npm run clean        # Remove dist + cache
```
