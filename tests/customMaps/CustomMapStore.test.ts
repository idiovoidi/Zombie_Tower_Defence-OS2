import { GameConfig } from '../../src/config/gameConfig';
import {
  CustomMapStore,
  createEmptyCustomMapDocument,
  type StorageLike,
} from '../../src/customMaps';

class MemoryStorage implements StorageLike {
  private data = new Map<string, string>();

  getItem(key: string): string | null {
    return this.data.has(key) ? (this.data.get(key) as string) : null;
  }

  setItem(key: string, value: string): void {
    this.data.set(key, value);
  }

  removeItem(key: string): void {
    this.data.delete(key);
  }
}

function sampleDoc(id = 'roundtrip_1') {
  return createEmptyCustomMapDocument({
    id,
    name: 'Round Trip',
    description: 'store test',
    map: {
      width: 1024,
      height: 768,
      cellSize: 32,
      waypoints: [
        { x: 32, y: 384 },
        { x: 256, y: 384 },
        { x: 256, y: 512 },
        { x: 896, y: 512 },
      ],
    },
    level: { startingMoney: 350, startingLives: 12, difficulty: 'Hard' },
    waves: [
      {
        wave: 2,
        groups: [{ type: GameConfig.ZOMBIE_TYPES.TANK, count: 2, spawnInterval: 3 }],
      },
    ],
  });
}

describe('CustomMapStore', () => {
  test('save, list, get, delete round-trip', () => {
    const store = new CustomMapStore(new MemoryStorage());
    const saved = store.save(sampleDoc());
    expect(store.get(saved.id)?.name).toBe('Round Trip');
    expect(store.list()).toHaveLength(1);

    store.save(sampleDoc('roundtrip_2'));
    expect(store.list()).toHaveLength(2);

    expect(store.delete('roundtrip_1')).toBe(true);
    expect(store.get('roundtrip_1')).toBeUndefined();
    expect(store.list()).toHaveLength(1);
  });

  test('serialize and parse preserve document', () => {
    const store = new CustomMapStore(new MemoryStorage());
    const doc = sampleDoc();
    const json = store.serialize(doc);
    const parsed = store.parse(json);
    expect(parsed.id).toBe(doc.id);
    expect(parsed.map.waypoints).toEqual(doc.map.waypoints);
    expect(parsed.waves[0].groups[0].type).toBe(GameConfig.ZOMBIE_TYPES.TANK);
  });

  test('importFromJson can assign a new id', () => {
    const store = new CustomMapStore(new MemoryStorage());
    const json = store.serialize(sampleDoc('original'));
    const imported = store.importFromJson(json, { newId: true });
    expect(imported.id).not.toBe('original');
    expect(store.get(imported.id)?.name).toBe('Round Trip');
  });

  test('parse rejects invalid JSON content', () => {
    const store = new CustomMapStore(new MemoryStorage());
    expect(() => store.parse('{')).toThrow('Invalid JSON');
    expect(() => store.parse('{"version":1}')).toThrow(/Invalid custom map/);
  });
});
