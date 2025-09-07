import { MapManager } from './MapManager';

export interface LevelData {
  id: string;
  name: string;
  description: string;
  map: string; // Reference to map name in MapManager
  difficulty: 'Easy' | 'Normal' | 'Hard' | 'Nightmare';
  startingMoney: number;
  startingLives: number;
  resourceModifiers: {
    wood: number;
    metal: number;
    energy: number;
  };
  unlockConditions?: {
    previousLevel?: string;
    minimumScore?: number;
  };
}

export class LevelManager {
  private levels: Map<string, LevelData>;
  private currentLevel: string;
  private unlockedLevels: Set<string>;
  private mapManager: MapManager;
  
  constructor(mapManager: MapManager) {
    this.levels = new Map<string, LevelData>();
    this.currentLevel = '';
    this.unlockedLevels = new Set<string>();
    this.mapManager = mapManager;
    this.initializeLevels();
  }
  
  private initializeLevels(): void {
    // Initialize predefined levels
    this.levels.set('level1', {
      id: 'level1',
      name: 'Training Grounds',
      description: 'A basic level for learning the game mechanics',
      map: 'default',
      difficulty: 'Easy',
      startingMoney: 500,
      startingLives: 20,
      resourceModifiers: { wood: 1.0, metal: 1.0, energy: 1.0 }
    });
    
    this.levels.set('level2', {
      id: 'level2',
      name: 'Forest Path',
      description: 'Navigate through the dense forest with limited sight',
      map: 'forest',
      difficulty: 'Normal',
      startingMoney: 400,
      startingLives: 15,
      resourceModifiers: { wood: 1.5, metal: 0.8, energy: 1.0 },
      unlockConditions: { previousLevel: 'level1' }
    });
    
    this.levels.set('level3', {
      id: 'level3',
      name: 'Urban Maze',
      description: 'Defend against waves in the tight city streets',
      map: 'city',
      difficulty: 'Hard',
      startingMoney: 300,
      startingLives: 10,
      resourceModifiers: { wood: 0.8, metal: 1.5, energy: 1.2 },
      unlockConditions: { previousLevel: 'level2' }
    });
    
    // Unlock the first level by default
    this.unlockedLevels.add('level1');
  }
  
  public loadLevel(levelId: string): boolean {
    if (!this.levels.has(levelId) || !this.unlockedLevels.has(levelId)) {
      console.warn(`Level ${levelId} not found or not unlocked`);
      return false;
    }
    
    this.currentLevel = levelId;
    const level = this.levels.get(levelId)!;
    
    // Load the map for this level
    this.mapManager.loadMap(level.map);
    
    return true;
  }
  
  public getCurrentLevel(): LevelData | undefined {
    return this.levels.get(this.currentLevel);
  }
  
  public getAvailableLevels(): LevelData[] {
    return Array.from(this.levels.values())
      .filter(level => this.unlockedLevels.has(level.id));
  }
  
  public unlockLevel(levelId: string): void {
    if (this.levels.has(levelId)) {
      this.unlockedLevels.add(levelId);
    }
  }
  
  public isLevelUnlocked(levelId: string): boolean {
    return this.unlockedLevels.has(levelId);
  }
}