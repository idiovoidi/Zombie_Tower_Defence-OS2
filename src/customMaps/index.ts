// biome-ignore lint/performance/noBarrelFile: intentional barrel for custom map module
export { CustomMapStore, customMapStore, type StorageLike } from './CustomMapStore';
export {
  appendSnappedWaypoint,
  removeLastWaypoint,
  snapToGrid,
  snapWaypoint,
} from './gridSnap';
export {
  type CustomMapManagers,
  clearCustomMapRegistration,
  type RegisterCustomMapOptions,
  registerCustomMap,
  syncCustomMapsToManagers,
} from './registerCustomMap';
export {
  CUSTOM_MAP_DEFAULT_CELL_SIZE,
  CUSTOM_MAP_DEFAULT_HEIGHT,
  CUSTOM_MAP_DEFAULT_WIDTH,
  CUSTOM_MAP_MIN_WAYPOINTS,
  CUSTOM_MAP_SCHEMA_VERSION,
  CUSTOM_MAP_SPAWN_MAX_X,
  type CustomLevelPayload,
  type CustomMapDifficulty,
  type CustomMapDocument,
  type CustomMapPayload,
  type CustomWaveOverride,
  createEmptyCustomMapDocument,
  customLevelId,
  customMapKey,
} from './types';
export {
  assertValidCustomMap,
  isValidZombieGroup,
  type ValidationResult,
  validateCustomMap,
} from './validateCustomMap';
