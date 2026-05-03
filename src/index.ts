// biome-ignore-all lint/performance/noBarrelFile: intentional barrel file for main exports
// Main entry point exports

// Re-export from subdirectories
export * from './components';
export * from './config';
export * from './managers';
export { GameManager } from './managers/GameManager';
export * from './objects';
export * from './renderers';
export * from './ui';
export * from './utils';
