import { GameConfig } from '../../src/config/gameConfig';
import { createEmptyCustomMapDocument, registerCustomMap } from '../../src/customMaps';
import { LevelManager } from '../../src/managers/LevelManager';
import { MapManager } from '../../src/managers/MapManager';
import { WaveManager } from '../../src/managers/WaveManager';

// Mock ZombieFactory to avoid Pixi.js / SDF mesh dependencies
vi.mock('../../src/objects/ZombieFactory', () => {
  return {
    ZombieFactory: {
      createZombie: vi.fn().mockImplementation((type, x, y, wave) => {
        return {
          type,
          x,
          y,
          wave,
          update: vi.fn(),
          takeDamage: vi.fn().mockReturnValue(10),
          hasReachedEnd: vi.fn().mockReturnValue(false),
          getType: vi.fn().mockReturnValue(type),
          getReward: vi.fn().mockReturnValue(10),
          getSpeed: vi.fn().mockReturnValue(50),
        };
      }),
    },
  };
});

describe('registerCustomMap + WaveManager overrides', () => {
  test('registers map/level and applies sparse wave overrides', () => {
    const mapManager = new MapManager();
    const levelManager = new LevelManager(mapManager);
    const waveManager = new WaveManager();

    const doc = createEmptyCustomMapDocument({
      id: 'playable',
      name: 'Playable',
      map: {
        width: 1024,
        height: 768,
        cellSize: 32,
        waypoints: [
          { x: 32, y: 300 },
          { x: 200, y: 300 },
          { x: 200, y: 500 },
          { x: 900, y: 500 },
        ],
      },
      waves: [
        {
          wave: 1,
          groups: [{ type: GameConfig.ZOMBIE_TYPES.SWARM, count: 20, spawnInterval: 0.5 }],
        },
      ],
    });

    const { levelId, mapName } = registerCustomMap(doc, {
      mapManager,
      levelManager,
      waveManager,
    });

    expect(mapManager.loadMap(mapName)).toBe(true);
    expect(levelManager.loadLevel(levelId)).toBe(true);
    expect(waveManager.getCurrentWaveZombies()[0].type).toBe(GameConfig.ZOMBIE_TYPES.SWARM);

    // Wave without override falls back to built-in
    waveManager.nextWave();
    const wave2 = waveManager.getCurrentWaveZombies();
    expect(wave2.length).toBeGreaterThan(0);
    expect(wave2[0].type).toBe(GameConfig.ZOMBIE_TYPES.BASIC);

    waveManager.clearWaveOverrides();
    // biome-ignore lint/suspicious/noExplicitAny: reset wave for assertion
    (waveManager as any).currentWave = 1;
    expect(waveManager.getCurrentWaveZombies()[0].type).toBe(GameConfig.ZOMBIE_TYPES.BASIC);
  });
});
