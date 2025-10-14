import { GameManager } from './GameManager';
import { GameConfig } from '../config/gameConfig';
import { Tower } from '../objects/Tower';
import { type GameLogEntry, LogExporter } from '../utils/LogExporter';

interface PlacementZone {
  x: number;
  y: number;
  priority: number; // Higher = better position
}

interface AIPerformanceStats {
  startTime: number;
  startMoney: number;
  startLives: number;
  towersBuilt: number;
  towersUpgraded: number;
  moneySpent: number;
  highestWave: number;
  zombiesKilled: number;
  towerComposition: Map<string, number>;
  upgradeDistribution: Map<string, number[]>; // Track upgrade levels per tower type
  moneyEarned: number;
  waveCompletionTimes: number[]; // Time taken to complete each wave
  livesLostPerWave: number[]; // Lives lost in each wave
  towersBuiltPerWave: number[]; // Towers built in each wave
  decisionsPerWave: number[]; // AI decisions made per wave
  peakMoney: number; // Highest money reached
  lowestLives: number; // Lowest lives reached (before game over)
}

export class AIPlayerManager {
  private gameManager: GameManager;
  private enabled: boolean = false;
  private updateTimer: number = 0;
  private updateInterval: number = 1.0; // Check every 1 second
  private placementZones: PlacementZone[] = [];
  private stats: AIPerformanceStats;
  private lastLogTime: number = 0;
  private logInterval: number = 10000; // Log every 10 seconds
  private lastState: string = '';
  private hasHandledWaveComplete: boolean = false;
  private currentWaveStartTime: number = 0;
  private currentWaveLivesStart: number = 0;
  private currentWaveTowersBuilt: number = 0;
  private currentWaveDecisions: number = 0;
  private lastTrackedWave: number = 0;

  constructor(gameManager: GameManager) {
    this.gameManager = gameManager;
    this.initializePlacementZones();
    this.stats = this.createEmptyStats();
  }

  // Initialize strategic placement zones based on the path
  private initializePlacementZones(): void {
    // These zones are strategically placed to cover the default map path
    // Priority: corners and choke points are better
    this.placementZones = [
      // Early path coverage
      { x: 150, y: 300, priority: 10 },
      { x: 280, y: 440, priority: 9 },
      // First corner (high priority)
      { x: 280, y: 550, priority: 15 },
      { x: 350, y: 500, priority: 12 },
      // Mid path
      { x: 500, y: 500, priority: 8 },
      { x: 450, y: 350, priority: 10 },
      // Second corner (high priority)
      { x: 450, y: 250, priority: 14 },
      { x: 550, y: 250, priority: 13 },
      // Third corner (high priority)
      { x: 650, y: 300, priority: 14 },
      { x: 650, y: 450, priority: 12 },
      // Late path coverage
      { x: 750, y: 550, priority: 11 },
      { x: 850, y: 600, priority: 10 },
      // Additional coverage
      { x: 350, y: 350, priority: 7 },
      { x: 550, y: 400, priority: 7 },
      { x: 750, y: 450, priority: 8 },
    ];

    // Sort by priority (highest first)
    this.placementZones.sort((a, b) => b.priority - a.priority);
  }

  // Create empty stats object
  private createEmptyStats(): AIPerformanceStats {
    return {
      startTime: 0,
      startMoney: 0,
      startLives: 0,
      towersBuilt: 0,
      towersUpgraded: 0,
      moneySpent: 0,
      highestWave: 0,
      zombiesKilled: 0,
      towerComposition: new Map<string, number>(),
      upgradeDistribution: new Map<string, number[]>(),
      moneyEarned: 0,
      waveCompletionTimes: [],
      livesLostPerWave: [],
      towersBuiltPerWave: [],
      decisionsPerWave: [],
      peakMoney: 0,
      lowestLives: 100,
    };
  }

  // Enable or disable the AI
  public setEnabled(enabled: boolean): void {
    this.enabled = enabled;
    if (enabled) {
      this.stats = this.createEmptyStats();
      this.stats.startTime = Date.now();
      this.stats.startMoney = this.gameManager.getMoney();
      this.stats.startLives = this.gameManager.getLives();
      this.stats.peakMoney = this.stats.startMoney;
      this.stats.lowestLives = this.stats.startLives;
      this.lastLogTime = Date.now();
      this.lastState = this.gameManager.getCurrentState();
      this.currentWaveStartTime = Date.now();
      this.currentWaveLivesStart = this.stats.startLives;
      this.currentWaveTowersBuilt = 0;
      this.currentWaveDecisions = 0;
      this.lastTrackedWave = this.gameManager.getWave();
      console.log('🤖 ═══════════════════════════════════════════════════════');
      console.log('🤖 AI Player ENABLED - Alpha Testing Mode');
      console.log('🤖 Starting Stats:');
      console.log(`🤖   Money: $${this.stats.startMoney}`);
      console.log(`🤖   Lives: ${this.stats.startLives}`);
      console.log(`🤖   Wave: ${this.gameManager.getWave()}`);
      console.log(`🤖   State: ${this.lastState}`);
      console.log('🤖 ═══════════════════════════════════════════════════════');
    } else {
      console.log('🤖 ═══════════════════════════════════════════════════════');
      console.log('🤖 AI Player DISABLED');
      this.logFinalStats();
      this.exportStats();
      console.log('🤖 ═══════════════════════════════════════════════════════');
    }
  }

  public isEnabled(): boolean {
    return this.enabled;
  }

  // Update AI logic
  public update(deltaTime: number): void {
    if (!this.enabled) {
      return;
    }

    const currentState = this.gameManager.getCurrentState();

    // Debug: Log state changes
    if (this.lastState !== currentState) {
      console.log(`🤖 State changed: ${this.lastState} -> ${currentState}`);
      this.lastState = currentState;
    }

    // Handle wave complete state - immediately start next wave
    if (currentState === GameConfig.GAME_STATES.WAVE_COMPLETE) {
      // Only start once per wave complete (prevent multiple calls in same frame)
      if (!this.hasHandledWaveComplete) {
        const currentWave = this.gameManager.getWave();
        const nextWave = currentWave + 1;

        // Track wave completion stats
        if (this.currentWaveStartTime > 0) {
          const waveTime = Date.now() - this.currentWaveStartTime;
          this.stats.waveCompletionTimes.push(waveTime);

          const livesLost = this.currentWaveLivesStart - this.gameManager.getLives();
          this.stats.livesLostPerWave.push(livesLost);

          this.stats.towersBuiltPerWave.push(this.currentWaveTowersBuilt);
          this.stats.decisionsPerWave.push(this.currentWaveDecisions);

          console.log(`🤖 ═══════════════════════════════════════════════════════`);
          console.log(`🤖 Wave ${currentWave} complete! Auto-starting wave ${nextWave}...`);
          console.log(`🤖   Time: ${(waveTime / 1000).toFixed(1)}s`);
          console.log(`🤖   Lives Lost: ${livesLost}`);
          console.log(`🤖   Towers Built: ${this.currentWaveTowersBuilt}`);
          console.log(`🤖   Decisions Made: ${this.currentWaveDecisions}`);
          console.log(`🤖 ═══════════════════════════════════════════════════════`);
        }

        this.hasHandledWaveComplete = true;

        // Use setTimeout to ensure state has fully transitioned
        setTimeout(() => {
          this.gameManager.startNextWave();
        }, 100); // Small delay to ensure clean state transition
      }
      return;
    }

    // Reset flag when back in playing state
    if (currentState === GameConfig.GAME_STATES.PLAYING && this.hasHandledWaveComplete) {
      this.hasHandledWaveComplete = false;

      // Start tracking new wave
      const currentWave = this.gameManager.getWave();
      if (currentWave !== this.lastTrackedWave) {
        this.currentWaveStartTime = Date.now();
        this.currentWaveLivesStart = this.gameManager.getLives();
        this.currentWaveTowersBuilt = 0;
        this.currentWaveDecisions = 0;
        this.lastTrackedWave = currentWave;
      }
    }

    // Only make decisions during active gameplay
    if (currentState !== GameConfig.GAME_STATES.PLAYING) {
      return;
    }

    this.updateTimer += deltaTime;

    if (this.updateTimer >= this.updateInterval) {
      this.updateTimer = 0;
      this.makeDecision();
    }

    // Update stats
    const currentWave = this.gameManager.getWave();
    if (currentWave > this.stats.highestWave) {
      this.stats.highestWave = currentWave;
    }

    // Periodic logging
    const now = Date.now();
    if (now - this.lastLogTime >= this.logInterval) {
      this.lastLogTime = now;
      this.logPerformanceStats();
    }
  }

  // Main AI decision-making logic
  private makeDecision(): void {
    const money = this.gameManager.getMoney();
    const placementManager = this.gameManager.getTowerPlacementManager();
    const placedTowers = placementManager.getPlacedTowers();

    this.currentWaveDecisions++;

    // Track peak money
    if (money > this.stats.peakMoney) {
      this.stats.peakMoney = money;
    }

    // Track lowest lives
    const currentLives = this.gameManager.getLives();
    if (currentLives < this.stats.lowestLives) {
      this.stats.lowestLives = currentLives;
    }

    // Strategy 1: Try to upgrade existing towers if we have enough money
    if (money > 200 && placedTowers.length > 0) {
      if (this.tryUpgradeTower()) {
        return;
      }
    }

    // Strategy 2: Place new towers if we have space and money
    if (money >= 100 && placedTowers.length < this.placementZones.length) {
      this.tryPlaceTower();
    }
  }

  // Try to place a new tower
  private tryPlaceTower(): void {
    const money = this.gameManager.getMoney();
    const towerManager = this.gameManager.getTowerManager();
    const placementManager = this.gameManager.getTowerPlacementManager();
    const wave = this.gameManager.getWave();

    // Determine which tower type to build based on money and wave
    const towerType = this.selectTowerType(money, wave);
    if (!towerType) {
      return;
    }

    const cost = towerManager.getTowerCost(towerType);
    if (money < cost) {
      return;
    }

    // Find next available placement zone
    const zone = this.findNextPlacementZone();
    if (!zone) {
      return;
    }

    // Try to place the tower
    placementManager.startPlacement(towerType);
    const tower = placementManager.placeTower(zone.x, zone.y);

    if (tower) {
      this.stats.towersBuilt++;
      this.currentWaveTowersBuilt++;
      this.stats.moneySpent += cost;
      const count = this.stats.towerComposition.get(towerType) || 0;
      this.stats.towerComposition.set(towerType, count + 1);
      console.log(`🤖 AI placed ${towerType} at (${zone.x}, ${zone.y}) for $${cost}`);
    } else {
      console.log(`🤖 AI failed to place tower at (${zone.x}, ${zone.y})`);
    }
  }

  // Select appropriate tower type based on resources and wave
  private selectTowerType(money: number, wave: number): string | null {
    const towerManager = this.gameManager.getTowerManager();
    const placedTowers = this.gameManager.getTowerPlacementManager().getPlacedTowers();
    const towerCounts = new Map<string, number>();

    // Count existing towers
    placedTowers.forEach(tower => {
      const type = tower.getType();
      towerCounts.set(type, (towerCounts.get(type) || 0) + 1);
    });

    // Build diverse tower composition from the start
    // Target ratios: 40% MG, 25% Sniper, 15% Shotgun, 10% Tesla, 10% Flame
    const totalTowers = placedTowers.length;

    // Define build order with target percentages
    const buildPriorities = [
      {
        type: GameConfig.TOWER_TYPES.MACHINE_GUN,
        targetRatio: 0.4,
        minWave: 1,
        minCount: 2,
      },
      { type: GameConfig.TOWER_TYPES.SNIPER, targetRatio: 0.25, minWave: 3, minCount: 0 },
      { type: GameConfig.TOWER_TYPES.SHOTGUN, targetRatio: 0.15, minWave: 5, minCount: 0 },
      { type: GameConfig.TOWER_TYPES.TESLA, targetRatio: 0.1, minWave: 7, minCount: 0 },
      { type: GameConfig.TOWER_TYPES.FLAME, targetRatio: 0.1, minWave: 9, minCount: 0 },
    ];

    // First, ensure minimum Machine Guns for early game
    const mgCount = towerCounts.get(GameConfig.TOWER_TYPES.MACHINE_GUN) || 0;
    if (mgCount < 2 && money >= towerManager.getTowerCost(GameConfig.TOWER_TYPES.MACHINE_GUN)) {
      return GameConfig.TOWER_TYPES.MACHINE_GUN;
    }

    // Then build diverse mix based on ratios
    for (const priority of buildPriorities) {
      // Skip if wave requirement not met
      if (wave < priority.minWave) {
        continue;
      }

      const count = towerCounts.get(priority.type) || 0;
      const cost = towerManager.getTowerCost(priority.type);

      // Can't afford this tower
      if (money < cost) {
        continue;
      }

      // Check if we need more of this type
      const currentRatio = totalTowers > 0 ? count / totalTowers : 0;

      // Build if below target ratio or haven't built minimum count
      if (currentRatio < priority.targetRatio || count < priority.minCount) {
        return priority.type;
      }
    }

    // Fallback: build cheapest affordable tower
    const affordableTowers = [
      GameConfig.TOWER_TYPES.MACHINE_GUN,
      GameConfig.TOWER_TYPES.SNIPER,
      GameConfig.TOWER_TYPES.SHOTGUN,
      GameConfig.TOWER_TYPES.TESLA,
      GameConfig.TOWER_TYPES.FLAME,
    ].filter(type => money >= towerManager.getTowerCost(type));

    if (affordableTowers.length > 0) {
      // Return the cheapest
      return affordableTowers.reduce((cheapest, current) => {
        const cheapestCost = towerManager.getTowerCost(cheapest);
        const currentCost = towerManager.getTowerCost(current);
        return currentCost < cheapestCost ? current : cheapest;
      });
    }

    return null;
  }

  // Find the next available placement zone
  private findNextPlacementZone(): PlacementZone | null {
    const placementManager = this.gameManager.getTowerPlacementManager();
    const placedTowers = placementManager.getPlacedTowers();

    // Check each zone starting from the highest priority
    for (const zone of this.placementZones) {
      // Check if zone is already occupied
      const isOccupied = placedTowers.some(tower => {
        const transform = tower.getComponent('Transform');
        if (transform) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const pos = (transform as any).position;
          const distance = Math.sqrt(Math.pow(zone.x - pos.x, 2) + Math.pow(zone.y - pos.y, 2));
          return distance < 60; // Same minimum distance as placement manager
        }
        return false;
      });

      if (!isOccupied) {
        return zone;
      }
    }

    return null;
  }

  // Try to upgrade an existing tower
  private tryUpgradeTower(): boolean {
    const placementManager = this.gameManager.getTowerPlacementManager();
    const towerManager = this.gameManager.getTowerManager();
    const placedTowers = placementManager.getPlacedTowers();

    if (placedTowers.length === 0) {
      return false;
    }

    // Find the best tower to upgrade (prioritize high-value towers with low upgrade levels)
    let bestTower: Tower | null = null;
    let bestScore = -1;

    for (const tower of placedTowers) {
      const upgradeLevel = tower.getUpgradeLevel();
      const maxLevel = tower.getMaxUpgradeLevel();

      if (upgradeLevel >= maxLevel) {
        continue; // Already maxed
      }

      const upgradeCost = towerManager.calculateUpgradeCost(tower.getType(), upgradeLevel);
      const money = this.gameManager.getMoney();

      if (money < upgradeCost) {
        continue; // Can't afford
      }

      // Score based on tower type and current level (prefer upgrading snipers and low-level towers)
      let score = 10 - upgradeLevel; // Prefer lower level towers

      if (tower.getType() === GameConfig.TOWER_TYPES.SNIPER) {
        score += 5;
      }
      if (tower.getType() === GameConfig.TOWER_TYPES.TESLA) {
        score += 3;
      }
      if (tower.getType() === GameConfig.TOWER_TYPES.SHOTGUN) {
        score += 2;
      }

      if (score > bestScore) {
        bestScore = score;
        bestTower = tower;
      }
    }

    if (bestTower) {
      const upgradeCost = towerManager.calculateUpgradeCost(
        bestTower.getType(),
        bestTower.getUpgradeLevel()
      );

      // Select and upgrade the tower
      placementManager.selectTower(bestTower);

      if (placementManager.upgradeSelectedTower()) {
        // Manually deduct the cost since we're not using the UI
        this.gameManager.spendMoney(upgradeCost);
        this.stats.towersUpgraded++;
        this.stats.moneySpent += upgradeCost;

        // Track upgrade distribution
        const towerType = bestTower.getType();
        const upgradeLevel = bestTower.getUpgradeLevel();
        const upgrades = this.stats.upgradeDistribution.get(towerType) || [];
        upgrades.push(upgradeLevel);
        this.stats.upgradeDistribution.set(towerType, upgrades);

        console.log(`🤖 AI upgraded ${towerType} to level ${upgradeLevel} for $${upgradeCost}`);

        // Deselect after upgrade
        placementManager.selectTower(null);
        return true;
      }
    }

    return false;
  }

  // Log performance stats
  private logPerformanceStats(): void {
    const elapsed = (Date.now() - this.stats.startTime) / 1000;
    const currentMoney = this.gameManager.getMoney();
    const currentLives = this.gameManager.getLives();
    const currentWave = this.gameManager.getWave();

    console.log('🤖 ─────────────────────────────────────────────────────');
    console.log(`🤖 AI Performance Report (${Math.floor(elapsed)}s elapsed)`);
    console.log('🤖 ─────────────────────────────────────────────────────');
    console.log(`🤖 Wave: ${currentWave} (highest: ${this.stats.highestWave})`);
    console.log(`🤖 Lives: ${currentLives} (lost: ${this.stats.startLives - currentLives})`);
    console.log(`🤖 Money: $${currentMoney} (spent: $${this.stats.moneySpent})`);
    console.log(`🤖 Towers Built: ${this.stats.towersBuilt}`);
    console.log(`🤖 Towers Upgraded: ${this.stats.towersUpgraded}`);

    // Tower composition
    if (this.stats.towerComposition.size > 0) {
      console.log('🤖 Tower Composition:');
      const sortedComposition = Array.from(this.stats.towerComposition.entries()).sort(
        (a, b) => b[1] - a[1]
      );
      for (const [type, count] of sortedComposition) {
        const percentage = ((count / this.stats.towersBuilt) * 100).toFixed(1);
        console.log(`🤖   ${type}: ${count} (${percentage}%)`);
      }
    }
    console.log('🤖 ─────────────────────────────────────────────────────');
  }

  // Log final stats when AI is disabled
  private logFinalStats(): void {
    const elapsed = (Date.now() - this.stats.startTime) / 1000;
    const currentMoney = this.gameManager.getMoney();
    const currentLives = this.gameManager.getLives();
    const livesLost = this.stats.startLives - currentLives;
    const survivalRate = ((currentLives / this.stats.startLives) * 100).toFixed(1);

    console.log('🤖 ═══════════════════════════════════════════════════════');
    console.log('🤖 FINAL AI PERFORMANCE REPORT');
    console.log('🤖 ═══════════════════════════════════════════════════════');
    console.log(`🤖 Session Duration: ${Math.floor(elapsed)}s (${(elapsed / 60).toFixed(1)}m)`);
    console.log(`🤖 Highest Wave Reached: ${this.stats.highestWave}`);
    console.log(
      `🤖 Final Lives: ${currentLives}/${this.stats.startLives} (${survivalRate}% survival)`
    );
    console.log(`🤖 Lives Lost: ${livesLost}`);
    console.log(`🤖 Final Money: $${currentMoney}`);
    console.log(`🤖 Total Money Spent: $${this.stats.moneySpent}`);
    console.log(`🤖 Towers Built: ${this.stats.towersBuilt}`);
    console.log(`🤖 Towers Upgraded: ${this.stats.towersUpgraded}`);
    console.log(
      `🤖 Avg Build Rate: ${(this.stats.towersBuilt / (elapsed / 60)).toFixed(2)} towers/min`
    );

    // Tower composition breakdown
    if (this.stats.towerComposition.size > 0) {
      console.log('🤖 ───────────────────────────────────────────────────');
      console.log('🤖 Final Tower Composition:');
      const sortedComposition = Array.from(this.stats.towerComposition.entries()).sort(
        (a, b) => b[1] - a[1]
      );
      for (const [type, count] of sortedComposition) {
        const percentage = ((count / this.stats.towersBuilt) * 100).toFixed(1);
        console.log(`🤖   ${type}: ${count} towers (${percentage}%)`);
      }
    }

    // Performance rating
    console.log('🤖 ───────────────────────────────────────────────────');
    console.log('🤖 Performance Rating:');
    if (this.stats.highestWave >= 20) {
      console.log('🤖   ⭐⭐⭐⭐⭐ EXCELLENT - Reached wave 20+');
    } else if (this.stats.highestWave >= 15) {
      console.log('🤖   ⭐⭐⭐⭐ GREAT - Reached wave 15+');
    } else if (this.stats.highestWave >= 10) {
      console.log('🤖   ⭐⭐⭐ GOOD - Reached wave 10+');
    } else if (this.stats.highestWave >= 5) {
      console.log('🤖   ⭐⭐ FAIR - Reached wave 5+');
    } else {
      console.log('🤖   ⭐ NEEDS IMPROVEMENT - Below wave 5');
    }

    if (survivalRate === '100.0') {
      console.log('🤖   🛡️ PERFECT DEFENSE - No lives lost!');
    } else if (parseFloat(survivalRate) >= 80) {
      console.log('🤖   🛡️ STRONG DEFENSE - 80%+ survival');
    } else if (parseFloat(survivalRate) >= 50) {
      console.log('🤖   ⚠️ MODERATE DEFENSE - 50%+ survival');
    } else {
      console.log('🤖   ❌ WEAK DEFENSE - Below 50% survival');
    }

    console.log('🤖 ═══════════════════════════════════════════════════════');
  }

  // Reset AI state
  public reset(): void {
    this.updateTimer = 0;
    this.hasHandledWaveComplete = false;
    this.stats = this.createEmptyStats();
    this.lastLogTime = 0;
  }

  // Get current stats (for external access)
  public getStats(): AIPerformanceStats {
    return { ...this.stats };
  }

  // Export stats to JSON file
  private exportStats(): void {
    const endTime = Date.now();
    const duration = endTime - this.stats.startTime;
    const currentMoney = this.gameManager.getMoney();
    const currentLives = this.gameManager.getLives();
    const livesLost = this.stats.startLives - currentLives;
    const survivalRate = (currentLives / this.stats.startLives) * 100;

    // Convert tower composition Map to plain object
    const towerComposition: Record<string, number> = {};
    this.stats.towerComposition.forEach((count, type) => {
      towerComposition[type] = count;
    });

    // Convert upgrade distribution Map to plain object
    const upgradeDistribution: Record<string, number[]> = {};
    this.stats.upgradeDistribution.forEach((levels, type) => {
      upgradeDistribution[type] = levels;
    });

    // Calculate averages
    const avgWaveTime =
      this.stats.waveCompletionTimes.length > 0
        ? this.stats.waveCompletionTimes.reduce((a, b) => a + b, 0) /
          this.stats.waveCompletionTimes.length
        : 0;

    const avgLivesLostPerWave =
      this.stats.livesLostPerWave.length > 0
        ? this.stats.livesLostPerWave.reduce((a, b) => a + b, 0) /
          this.stats.livesLostPerWave.length
        : 0;

    const logEntry: GameLogEntry = {
      timestamp: new Date(this.stats.startTime).toISOString(),
      sessionId: LogExporter.getSessionId(),
      isAIRun: true,
      duration: duration,
      startTime: new Date(this.stats.startTime).toISOString(),
      endTime: new Date(endTime).toISOString(),
      gameData: {
        highestWave: this.stats.highestWave,
        finalMoney: currentMoney,
        finalLives: currentLives,
        startLives: this.stats.startLives,
        survivalRate: parseFloat(survivalRate.toFixed(1)),
        livesLost: livesLost,
      },
      aiData: {
        towersBuilt: this.stats.towersBuilt,
        towersUpgraded: this.stats.towersUpgraded,
        moneySpent: this.stats.moneySpent,
        moneyEarned: this.stats.moneyEarned,
        peakMoney: this.stats.peakMoney,
        lowestLives: this.stats.lowestLives,
        averageBuildRate: parseFloat((this.stats.towersBuilt / (duration / 60000)).toFixed(2)),
        towerComposition: towerComposition,
        upgradeDistribution: upgradeDistribution,
        waveStats: {
          completionTimes: this.stats.waveCompletionTimes,
          averageCompletionTime: parseFloat((avgWaveTime / 1000).toFixed(1)),
          livesLostPerWave: this.stats.livesLostPerWave,
          averageLivesLostPerWave: parseFloat(avgLivesLostPerWave.toFixed(2)),
          towersBuiltPerWave: this.stats.towersBuiltPerWave,
          decisionsPerWave: this.stats.decisionsPerWave,
        },
        performanceRating: LogExporter.getPerformanceRating(this.stats.highestWave),
        defenseRating: LogExporter.getDefenseRating(survivalRate),
      },
    };

    LogExporter.exportLog(logEntry);
  }
}
