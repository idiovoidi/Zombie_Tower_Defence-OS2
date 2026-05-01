import type { StatTracker } from '../utils/StatTracker';
import type { IGameManager } from './IGameManager';

interface PlacementZone {
  x: number;
  y: number;
  priority: number; // Higher = better position
}

export class AIPlayerManager {
  private gameManager: IGameManager;
  private enabled: boolean = false;
  private updateTimer: number = 0;
  private updateInterval: number = 1.0; // Check every 1 second
  private placementZones: PlacementZone[] = [];
  private lastState: string = '';
  private currentWaveDecisions: number = 0;

  constructor(gameManager: IGameManager) {
    this.gameManager = gameManager;
    this.initializePlacementZones();
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
  // Enable or disable the AI
  public setEnabled(enabled: boolean): void {
    this.enabled = enabled;
    const statTracker = this.gameManager.getStatTracker() as StatTracker;
    if (enabled) {
      statTracker.startTracking(true);
      this.lastLogTime = Date.now();
      this.lastState = this.gameManager.getCurrentState();
      this.currentWaveDecisions = 0;
      console.log('🤖 ═══════════════════════════════════════════════════════');
      console.log('🤖 AI Player ENABLED - Alpha Testing Mode');
      console.log('🤖 Starting Stats:');
      console.log(`🤖   Money: ${this.gameManager.getMoney()}`);
      console.log(`🤖   Lives: ${this.gameManager.getLives()}`);
      console.log(`🤖   Wave: ${this.gameManager.getWave()}`);
      console.log(`🤖   State: ${this.lastState}`);
      console.log('🤖 ═══════════════════════════════════════════════════════');
    } else {
      console.log('🤖 ═══════════════════════════════════════════════════════');
      console.log('🤖 AI Player DISABLED');
      this.logFinalStats();
      statTracker.exportCurrentStats();
      console.log('🤖 ═══════════════════════════════════════════════════════');
    }
  }

  public isEnabled(): boolean {
    return this.enabled;
  }

  public update(deltaTime: number): void {
    if (!this.enabled) {
      return;
    }

    this.updateTimer += deltaTime;
    if (this.updateTimer >= this.updateInterval) {
      this.updateTimer = 0;
      this.currentWaveDecisions++;
    }
  }

  private logFinalStats(): void {
    console.log('🤖 Final AI stats:');
    console.log(`🤖   Decisions made: ${this.currentWaveDecisions}`);
    console.log(`🤖   Current wave: ${this.gameManager.getWave()}`);
    console.log(`🤖   Money: ${this.gameManager.getMoney()}`);
    console.log(`🤖   Lives: ${this.gameManager.getLives()}`);
  }
}
