# Tech Stack

## Core Technologies

- **TypeScript** (v5.7.3) - Strict mode enabled
- **PixiJS** (v8.8.1) - WebGL rendering engine for 2D graphics
- **Vite** (v6.2.0) - Build tool and dev server
- **Node.js** - Runtime environment

## Testing

- **Jest** (v30.1.3) - Primary test runner with ts-jest
- **Vitest** (v3.2.4) - Alternative test runner (configured but Jest is primary)
- Coverage threshold: 80% for branches, functions, lines, and statements
- Mocks for PixiJS in `__mocks__/pixi.js`

## Code Quality

- **ESLint** (v9.21.0) - Linting with TypeScript ESLint
- **Prettier** (v3.5.3) - Code formatting
- Print width: 100 characters
- Single quotes, 2-space indentation, semicolons required
- Arrow function parens: avoid

## Common Commands

```bash
# Development
npm run dev              # Start dev server on port 8080
npm run dev:debug        # Start dev server with debug output

# Building
npm run build            # Lint, type-check, and build for production
npm run preview          # Preview production build
npm run type-check       # Run TypeScript compiler without emitting

# Code Quality
npm run lint             # Run ESLint
npm run lint:fix         # Fix ESLint issues automatically
npm run format           # Format code with Prettier
npm run format:check     # Check code formatting

# Testing
npm test                 # Run Jest tests
npm run test:watch       # Run tests in watch mode
npm run test:coverage    # Generate coverage report

# Maintenance
npm run clean            # Remove dist and Vite cache
```

## TypeScript Configuration

- Target: ES2020
- Module: ESNext with bundler resolution
- Strict mode enabled
- Source maps and declaration maps enabled
- Path aliases configured for all major directories (@/, @components/, @managers/, etc.)

## Build Configuration

- Dev server: localhost:8080 (auto-opens browser)
- Output: `dist/` directory
- Source maps enabled in both dev and production
- Path aliases match TypeScript configuration
