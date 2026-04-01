// Alias jest globals to vi so existing tests work without modification
import { vi } from 'vitest';

// @ts-expect-error - aliasing jest to vi for migration compatibility
globalThis.jest = vi;

// Expose vi globally for tests that use it directly
Object.assign(globalThis, { vi });
