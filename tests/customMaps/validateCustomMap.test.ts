import { GameConfig } from '../../src/config/gameConfig';
import {
  CUSTOM_MAP_SCHEMA_VERSION,
  createEmptyCustomMapDocument,
  validateCustomMap,
} from '../../src/customMaps';

function validDoc() {
  return createEmptyCustomMapDocument({
    id: 'test_map',
    name: 'Test Path',
    description: 'unit test',
    map: {
      width: 1024,
      height: 768,
      cellSize: 32,
      waypoints: [
        { x: 32, y: 384 },
        { x: 200, y: 384 },
        { x: 200, y: 500 },
        { x: 900, y: 500 },
      ],
    },
    level: {
      startingMoney: 400,
      startingLives: 15,
      difficulty: 'Normal',
    },
    waves: [
      {
        wave: 1,
        groups: [
          { type: GameConfig.ZOMBIE_TYPES.BASIC, count: 8, spawnInterval: 2 },
          { type: GameConfig.ZOMBIE_TYPES.FAST, count: 3, spawnInterval: 2.5 },
        ],
      },
    ],
  });
}

describe('validateCustomMap', () => {
  test('accepts a valid document', () => {
    const result = validateCustomMap(validDoc());
    expect(result.valid).toBe(true);
    expect(result.errors).toEqual([]);
  });

  test('rejects wrong schema version', () => {
    const doc = { ...validDoc(), version: 99 };
    const result = validateCustomMap(doc);
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.includes('schema version'))).toBe(true);
  });

  test('rejects too few waypoints', () => {
    const doc = validDoc();
    doc.map.waypoints = [
      { x: 32, y: 100 },
      { x: 64, y: 100 },
    ];
    const result = validateCustomMap(doc);
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.includes('at least'))).toBe(true);
  });

  test('rejects spawn too far from left edge', () => {
    const doc = validDoc();
    doc.map.waypoints[0] = { x: 200, y: 384 };
    const result = validateCustomMap(doc);
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.includes('left edge'))).toBe(true);
  });

  test('rejects out of bounds waypoints', () => {
    const doc = validDoc();
    doc.map.waypoints[2] = { x: 2000, y: 10 };
    const result = validateCustomMap(doc);
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.includes('out of bounds'))).toBe(true);
  });

  test('rejects unknown zombie types', () => {
    const doc = validDoc();
    doc.waves[0].groups[0].type = 'NotAZombie';
    const result = validateCustomMap(doc);
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.includes('unknown zombie type'))).toBe(true);
  });

  test('rejects duplicate wave numbers', () => {
    const doc = validDoc();
    doc.waves.push({
      wave: 1,
      groups: [{ type: GameConfig.ZOMBIE_TYPES.BASIC, count: 1, spawnInterval: 1 }],
    });
    const result = validateCustomMap(doc);
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.includes('Duplicate wave'))).toBe(true);
  });

  test('rejects non-object input', () => {
    expect(validateCustomMap(null).valid).toBe(false);
    expect(validateCustomMap('nope').valid).toBe(false);
  });

  test('empty waves array is valid (use built-in defaults)', () => {
    const doc = validDoc();
    doc.waves = [];
    const result = validateCustomMap(doc);
    expect(result.valid).toBe(true);
  });

  test('createEmptyCustomMapDocument sets schema version', () => {
    expect(createEmptyCustomMapDocument().version).toBe(CUSTOM_MAP_SCHEMA_VERSION);
  });
});
