import { LevelManager } from './LevelManager';
import { MapManager } from './MapManager';

// Mock the MapManager for testing
class MockMapManager extends MapManager {
  public loadMapCalls: string[] = [];
  
  public loadMap(mapName: string): boolean {
    this.loadMapCalls.push(mapName);
    return super.loadMap(mapName);
  }
}

// Test level initialization
test('LevelManager initializes with default levels', () => {
  const mapManager = new MockMapManager();
  const levelManager = new LevelManager(mapManager);
  
  expect(levelManager.getAvailableLevels().length).toBeGreaterThan(0);
});

// Test level loading
test('LevelManager can load valid unlocked levels', () => {
  const mapManager = new MockMapManager();
  const levelManager = new LevelManager(mapManager);
  
  const result = levelManager.loadLevel('level1');
  expect(result).toBe(true);
  expect(levelManager.getCurrentLevel()?.id).toBe('level1');
  expect(mapManager.loadMapCalls).toContain('default');
});

// Test level unlocking
test('LevelManager can unlock levels', () => {
  const mapManager = new MockMapManager();
  const levelManager = new LevelManager(mapManager);
  
  // Initially level2 should not be available
  const initialAvailable = levelManager.getAvailableLevels().map(l => l.id);
  expect(initialAvailable).not.toContain('level2');
  
  // Unlock level2
  levelManager.unlockLevel('level2');
  
  // Now level2 should be available
  const updatedAvailable = levelManager.getAvailableLevels().map(l => l.id);
  expect(updatedAvailable).toContain('level2');
});

// Test level locking
test('LevelManager prevents loading locked levels', () => {
  const mapManager = new MockMapManager();
  const levelManager = new LevelManager(mapManager);
  
  // Try to load level2 which should be locked
  const result = levelManager.loadLevel('level2');
  expect(result).toBe(false);
  expect(levelManager.getCurrentLevel()).toBeUndefined();
});