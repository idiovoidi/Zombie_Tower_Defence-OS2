/**
 * Development configuration
 */

export const DevConfig = {
  // Debug settings
  DEBUG: {
    ENABLED: true,
    LOG_LEVEL: 'debug',
    SHOW_FPS: true,
    SHOW_COLLISION_BOUNDS: false,
    SHOW_PATHFINDING: false,
  },

  // Performance settings
  PERFORMANCE: {
    TARGET_FPS: 60,
    MAX_DELTA_TIME: 0.1, // 100ms
    ENABLE_FRAME_SKIPPING: true,
  },

  // Development features
  FEATURES: {
    HOT_RELOAD: true,
    DEV_TOOLS: true,
    MOCK_DATA: false,
  },

  // Testing settings
  TESTING: {
    AUTO_START_GAME: true,
    SKIP_MENU: true,
    DEFAULT_LEVEL: 'level1',
    UNLOCK_ALL_LEVELS: true,
    INFINITE_RESOURCES: false,
    NO_COOLDOWN: false,
    SPAWN_TEST_TOWERS: false,
  },
};
