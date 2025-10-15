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
  upgradeDistribution: Map<string, number[]>;
  moneyEarned: number;
  waveCompletionTimes: number[];
  livesLostPerWave: number[];
  towersBuiltPerWave: number[];
  decisionsPerWave: number[];
  peakMoney: number;
  lowestLives: number;
  // Combat tracking
  totalDamageDealt: number;
  damageByTowerType: Map<string, number>;
  killsByTowerType: Map<string, number>;
  damagePerWave: number[];
  killsPerWave: number[];
  shotsHit: number;
  shotsMissed: number;
  overkillDamage: number;
  peakDPS: number;
  lastDPSCheck: number;
  damageInLastSecond: number;
  // Economy tracking
  moneyTimeline: Array<{ time: number; money: number; wave: number }>;
  moneyPerWave: number[];
  moneySpentPerWave: number[];
  lastMoneySnapshot: number;
  lastMoneyAmount: number;
  bankruptcyEvents: number;
  // Timeline snapshots
  snapshots: Array<{
    time: number;
    wave: number;
    money: number;
    lives: number;
    towersActive: number;
    zombiesAlive: number;
    currentDPS: number;
  }>;
  lastSnapshotTime: number;
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
      // Combat tracking
      totalDamageDealt: 0,
      damageByTowerType: new Map<string, number>(),
      killsByTowerType: new Map<string, number>(),
      damagePerWave: [],
      killsPerWave: [],
      shotsHit: 0,
      shotsMissed: 0,
      overkillDamage: 0,
      peakDPS: 0,
      lastDPSCheck: 0,
      damageInLastSecond: 0,
      // Economy tracking
      moneyTimeline: [],
      moneyPerWave: [],
      moneySpentPerWave: [],
      lastMoneySnapshot: 0,
      lastMoneyAmount: 0,
      bankruptcyEvents: 0,
      // Timeline snapshots
      snapshots: [],
      lastSnapshotTime: 0,
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

    // Track metrics continuously
    this.trackMetrics(deltaTime);

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

  // Track metrics every frame
  private trackMetrics(_deltaTime: number): void {
    const now = Date.now();
    const currentMoney = this.gameManager.getMoney();
    const currentWave = this.gameManager.getWave();

    // Track money timeline (every 5 seconds)
    if (now - this.stats.lastMoneySnapshot >= 5000) {
      this.stats.moneyTimeline.push({
        time: now - this.stats.startTime,
        money: currentMoney,
        wave: currentWave,
      });

      // Check for bankruptcy (money dropped to 0)
      if (currentMoney === 0 && this.stats.lastMoneyAmount > 0) {
        this.stats.bankruptcyEvents++;
      }

      this.stats.lastMoneyAmount = currentMoney;
      this.stats.lastMoneySnapshot = now;
    }

    // Take timeline snapshots (every 10 seconds)
    if (now - this.stats.lastSnapshotTime >= 10000) {
      const zombieManager = this.gameManager.getZombieManager();
      const placementManager = this.gameManager.getTowerPlacementManager();

      this.stats.snapshots.push({
        time: now - this.stats.startTime,
        wave: currentWave,
        money: currentMoney,
        lives: this.gameManager.getLives(),
        towersActive: placementManager.getPlacedTowers().length,
        zombiesAlive: zombieManager.getZombies().length,
        currentDPS: this.calculateCurrentDPS(),
      });

      this.stats.lastSnapshotTime = now;
    }

    // Track DPS (every second)
    if (now - this.stats.lastDPSCheck >= 1000) {
      const currentDPS = this.stats.damageInLastSecond;
      if (currentDPS > this.stats.peakDPS) {
        this.stats.peakDPS = currentDPS;
      }
      this.stats.damageInLastSecond = 0;
      this.stats.lastDPSCheck = now;
    }
  }

  // Calculate current DPS from active towers
  private calculateCurrentDPS(): number {
    const placementManager = this.gameManager.getTowerPlacementManager();
    const towers = placementManager.getPlacedTowers();
    let totalDPS = 0;

    for (const tower of towers) {
      const damage = tower.getDamage();
      const fireRate = tower.getFireRate();
      totalDPS += damage * fireRate;
    }

    return parseFloat(totalDPS.toFixed(2));
  }

  // Track damage dealt (call this from combat manager)
  public trackDamage(damage: number, towerType: string, killed: boolean, overkill: number): void {
    if (!this.enabled) {
      return;
    }

    this.stats.totalDamageDealt += damage;
    this.stats.damageInLastSecond += damage;

    const currentDamage = this.stats.damageByTowerType.get(towerType) || 0;
    this.stats.damageByTowerType.set(towerType, currentDamage + damage);

    if (killed) {
      this.stats.zombiesKilled++;
      const currentKills = this.stats.killsByTowerType.get(towerType) || 0;
      this.stats.killsByTowerType.set(towerType, currentKills + 1);
      this.stats.overkillDamage += overkill;
    }
  }

  // Track shots (call this from towers)
  public trackShot(hit: boolean): void {
    if (!this.enabled) {
      return;
    }

    if (hit) {
      this.stats.shotsHit++;
    } else {
      this.stats.shotsMissed++;
    }
  }

  // Track wave completion with economy data
  private trackWaveCompletion(): void {
    const currentMoney = this.gameManager.getMoney();

    // Track money earned this wave
    const moneyEarned = currentMoney - (this.stats.lastMoneyAmount || this.stats.startMoney);
    this.stats.moneyPerWave.push(Math.max(0, moneyEarned));

    // Track money spent this wave (tracked separately in tryPlaceTower/tryUpgradeTower)
    const waveIndex = this.stats.moneySpentPerWave.length;
    if (waveIndex >= this.stats.moneySpentPerWave.length) {
      this.stats.moneySpentPerWave.push(0);
    }

    // Track damage and kills this wave
    const waveIndex2 = this.stats.damagePerWave.length;
    if (waveIndex2 >= this.stats.damagePerWave.length) {
      this.stats.damagePerWave.push(0);
      this.stats.killsPerWave.push(0);
    }
  }

  // Export stats to JSON file
  private exportStats(): void {
    const endTime = Date.now();
    const duration = endTime - this.stats.startTime;
    const currentMoney = this.gameManager.getMoney();
    const currentLives = this.gameManager.getLives();
    const livesLost = this.stats.startLives - currentLives;
    const survivalRate = (currentLives / this.stats.startLives) * 100;

    // Convert Maps to plain objects
    const towerComposition: Record<string, number> = {};
    this.stats.towerComposition.forEach((count, type) => {
      towerComposition[type] = count;
    });

    const upgradeDistribution: Record<string, number[]> = {};
    this.stats.upgradeDistribution.forEach((levels, type) => {
      upgradeDistribution[type] = levels;
    });

    const damageByTowerType: Record<string, number> = {};
    this.stats.damageByTowerType.forEach((damage, type) => {
      damageByTowerType[type] = damage;
    });

    const killsByTowerType: Record<string, number> = {};
    this.stats.killsByTowerType.forEach((kills, type) => {
      killsByTowerType[type] = kills;
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

    // Combat stats
    const totalShots = this.stats.shotsHit + this.stats.shotsMissed;
    const accuracyRate = totalShots > 0 ? (this.stats.shotsHit / totalShots) * 100 : 0;
    const avgDPS = duration > 0 ? this.stats.totalDamageDealt / (duration / 1000) : 0;

    // Economy stats
    const totalIncome = this.stats.moneyPerWave.reduce((a, b) => a + b, 0);
    const totalExpenses = this.stats.moneySpent;
    const netProfit = totalIncome - totalExpenses;
    const avgMoneyPerSecond = duration > 0 ? totalIncome / (duration / 1000) : 0;
    const economyEfficiency = totalExpenses > 0 ? (totalIncome / totalExpenses) * 100 : 0;

    // Calculate net income per wave
    const netIncomePerWave = this.stats.moneyPerWave.map((income, i) => {
      const spent = this.stats.moneySpentPerWave[i] || 0;
      return income - spent;
    });

    // Determine cash flow trend
    let cashFlowTrend = 'STABLE';
    if (netIncomePerWave.length >= 3) {
      const recent = netIncomePerWave.slice(-3);
      const increasing = recent.every((val, i) => i === 0 || val >= recent[i - 1]);
      const decreasing = recent.every((val, i) => i === 0 || val <= recent[i - 1]);
      if (increasing) {
        cashFlowTrend = 'GROWING';
      } else if (decreasing) {
        cashFlowTrend = 'DECLINING';
      }
    }

    // Efficiency stats
    const damagePerDollar = totalExpenses > 0 ? this.stats.totalDamageDealt / totalExpenses : 0;
    const killsPerDollar = totalExpenses > 0 ? this.stats.zombiesKilled / totalExpenses : 0;
    const damagePerTower =
      this.stats.towersBuilt > 0 ? this.stats.totalDamageDealt / this.stats.towersBuilt : 0;
    const killsPerTower =
      this.stats.towersBuilt > 0 ? this.stats.zombiesKilled / this.stats.towersBuilt : 0;

    // Calculate average upgrade level
    let totalUpgradeLevels = 0;
    let upgradeCount = 0;
    this.stats.upgradeDistribution.forEach(levels => {
      totalUpgradeLevels += levels.reduce((a, b) => a + b, 0);
      upgradeCount += levels.length;
    });
    const avgUpgradeLevel = upgradeCount > 0 ? totalUpgradeLevels / upgradeCount : 0;

    const upgradeEfficiency =
      this.stats.towersUpgraded > 0 ? this.stats.totalDamageDealt / this.stats.towersUpgraded : 0;
    const resourceUtilization = (currentMoney / (this.stats.startMoney + totalIncome)) * 100;

    // Cost efficiency rating
    let costEfficiencyRating = 'POOR';
    if (damagePerDollar > 100) {
      costEfficiencyRating = 'EXCELLENT';
    } else if (damagePerDollar > 50) {
      costEfficiencyRating = 'GOOD';
    } else if (damagePerDollar > 25) {
      costEfficiencyRating = 'FAIR';
    }

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
        moneyEarned: totalIncome,
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
      combatStats: {
        totalDamageDealt: parseFloat(this.stats.totalDamageDealt.toFixed(2)),
        totalZombiesKilled: this.stats.zombiesKilled,
        averageDPS: parseFloat(avgDPS.toFixed(2)),
        peakDPS: parseFloat(this.stats.peakDPS.toFixed(2)),
        damageByTowerType: damageByTowerType,
        killsByTowerType: killsByTowerType,
        damagePerWave: this.stats.damagePerWave,
        killsPerWave: this.stats.killsPerWave,
        overkillDamage: parseFloat(this.stats.overkillDamage.toFixed(2)),
        accuracyRate: parseFloat(accuracyRate.toFixed(2)),
        shotsHit: this.stats.shotsHit,
        shotsMissed: this.stats.shotsMissed,
      },
      economyStats: {
        moneyTimeline: this.stats.moneyTimeline,
        moneyPerWave: this.stats.moneyPerWave,
        moneySpentPerWave: this.stats.moneySpentPerWave,
        netIncomePerWave: netIncomePerWave,
        averageMoneyPerSecond: parseFloat(avgMoneyPerSecond.toFixed(2)),
        peakMoneyPerSecond: 0, // TODO: Track this separately
        totalIncome: totalIncome,
        totalExpenses: totalExpenses,
        netProfit: netProfit,
        economyEfficiency: parseFloat(economyEfficiency.toFixed(2)),
        bankruptcyEvents: this.stats.bankruptcyEvents,
        cashFlowTrend: cashFlowTrend,
      },
      efficiencyStats: {
        damagePerDollar: parseFloat(damagePerDollar.toFixed(2)),
        killsPerDollar: parseFloat(killsPerDollar.toFixed(4)),
        damagePerTower: parseFloat(damagePerTower.toFixed(2)),
        killsPerTower: parseFloat(killsPerTower.toFixed(2)),
        upgradeEfficiency: parseFloat(upgradeEfficiency.toFixed(2)),
        resourceUtilization: parseFloat(resourceUtilization.toFixed(2)),
        towerDensity: this.stats.towersBuilt,
        averageUpgradeLevel: parseFloat(avgUpgradeLevel.toFixed(2)),
        costEfficiencyRating: costEfficiencyRating,
      },
      timelineStats: {
        snapshots: this.stats.snapshots,
        snapshotInterval: 10000,
      },
    };

    LogExporter.exportLog(logEntry);
  }
}
