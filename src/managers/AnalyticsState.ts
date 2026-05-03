/**
 * AnalyticsState - Contextual object that encapsulates analytics and AI managers
 *
 * This groups StatTracker, BalanceTrackingManager, and AIPlayerManager to handle
 * all analytics-related functionality in a cohesive unit.
 */

import { EventBus, type EventSubscription, GameEvents } from '../utils/EventBus';
import { StatTracker } from '../utils/StatTracker';
import { AIPlayerManager } from './AIPlayerManager';
import { BalanceTrackingManager } from './BalanceTrackingManager';
import type {
  IBalanceTrackingProvider,
  IGameStateProvider,
  IStatTrackerProvider,
  ITowerStateProvider,
  IWaveStateProvider,
  IZombieStateProvider,
} from './IGameManager';

interface AnalyticsConfig {
  gameManager: IGameStateProvider &
    IWaveStateProvider &
    ITowerStateProvider &
    IZombieStateProvider &
    IBalanceTrackingProvider &
    IStatTrackerProvider;
  enabled?: boolean;
}

export class AnalyticsState {
  private statTracker: StatTracker;
  private balanceTrackingManager: BalanceTrackingManager;
  private aiPlayerManager: AIPlayerManager;

  // Event subscriptions for cleanup
  private eventSubscriptions: EventSubscription[] = [];

  constructor(config: AnalyticsConfig) {
    const { gameManager } = config;

    // Initialize managers
    this.statTracker = new StatTracker(gameManager);
    this.balanceTrackingManager = new BalanceTrackingManager(gameManager);
    this.aiPlayerManager = new AIPlayerManager(gameManager);

    // Set up event listeners
    this.setupEventListeners();
  }

  private setupEventListeners(): void {
    const eventBus = EventBus.getInstance();

    // Listen for wave start
    this.eventSubscriptions.push(
      eventBus.on(GameEvents.WAVE_START, () => {
        this.statTracker.trackWaveStart();
        if (this.balanceTrackingManager.isEnabled()) {
          this.balanceTrackingManager.trackWaveStart();
        }
      })
    );

    // Listen for wave complete
    this.eventSubscriptions.push(
      eventBus.on<{ zombiesSpawned: number; livesLost: number }>(GameEvents.WAVE_COMPLETE, data => {
        this.statTracker.trackWaveComplete();
        if (this.balanceTrackingManager.isEnabled() && data) {
          this.balanceTrackingManager.trackWaveComplete(data.zombiesSpawned, data.livesLost);
        }
      })
    );

    // Listen for damage dealt
    this.eventSubscriptions.push(
      eventBus.on<{ damage: number; towerType: string; killed: boolean; overkill: number }>(
        GameEvents.DAMAGE_DEALT,
        data => {
          if (data) {
            this.statTracker.trackDamage(data.damage, data.towerType, data.killed, data.overkill);
            if (this.balanceTrackingManager.isEnabled()) {
              this.balanceTrackingManager.trackDamage(
                data.towerType,
                data.damage,
                data.killed,
                data.overkill
              );
            }
          }
        }
      )
    );

    // Listen for money earned
    this.eventSubscriptions.push(
      eventBus.on<number>(GameEvents.MONEY_EARNED, amount => {
        if (amount !== undefined) {
          this.statTracker.trackMoneyEarned(amount);
        }
      })
    );

    // Listen for zombie killed (for detailed economy tracking)
    this.eventSubscriptions.push(
      eventBus.on<{ reward: number; type: string }>(GameEvents.ZOMBIE_KILLED, data => {
        if (data && this.balanceTrackingManager.isEnabled()) {
          this.balanceTrackingManager.trackEconomy('EARN', data.reward);
        }
      })
    );

    // Listen for tower placed
    this.eventSubscriptions.push(
      eventBus.on<{ type: string; cost: number }>(GameEvents.TOWER_PLACED, data => {
        if (data) {
          this.statTracker.trackTowerBuilt(data.type, data.cost);
          if (this.balanceTrackingManager.isEnabled()) {
            this.balanceTrackingManager.trackTowerPlaced(data.type, data.cost);
          }
        }
      })
    );

    // Listen for tower upgraded
    this.eventSubscriptions.push(
      eventBus.on<{ type: string; cost: number; level: number }>(
        GameEvents.TOWER_UPGRADED,
        data => {
          if (data) {
            this.statTracker.trackTowerUpgraded(data.type, data.cost, data.level);
          }
        }
      )
    );

    // Listen for game over
    this.eventSubscriptions.push(
      eventBus.on(GameEvents.GAME_OVER, () => {
        if (this.balanceTrackingManager.isEnabled()) {
          this.balanceTrackingManager.performEndGameAnalysis();
        }
        if (!this.aiPlayerManager.isEnabled()) {
          this.statTracker.exportCurrentStats();
        }
      })
    );

    // Listen for victory
    this.eventSubscriptions.push(
      eventBus.on(GameEvents.GAME_VICTORY, () => {
        if (this.balanceTrackingManager.isEnabled()) {
          this.balanceTrackingManager.performEndGameAnalysis();
        }
      })
    );
  }

  // Manager getters
  public getStatTracker(): StatTracker {
    return this.statTracker;
  }

  public getBalanceTrackingManager(): BalanceTrackingManager {
    return this.balanceTrackingManager;
  }

  public getAIPlayerManager(): AIPlayerManager {
    return this.aiPlayerManager;
  }

  // Enable/disable tracking
  public enableBalanceTracking(): void {
    this.balanceTrackingManager.enable();
  }

  public disableBalanceTracking(): void {
    this.balanceTrackingManager.disable();
  }

  public isBalanceTrackingEnabled(): boolean {
    return this.balanceTrackingManager.isEnabled();
  }

  // AI management
  public setAIEnabled(enabled: boolean): void {
    this.aiPlayerManager.setEnabled(enabled);
    if (enabled) {
      this.statTracker.startTracking(true);
    }
  }

  public isAIEnabled(): boolean {
    return this.aiPlayerManager.isEnabled();
  }

  // Reset for new game
  public reset(aiMode = false): void {
    this.balanceTrackingManager.reset();
    this.statTracker.startTracking(aiMode);
  }

  // Update method
  public update(deltaTime: number): void {
    this.statTracker.update(deltaTime);
    this.balanceTrackingManager.update(deltaTime);
    // Note: AIPlayerManager is updated directly in main.ts with unscaled time
    // so it can make decisions even when the game is paused
  }

  /**
   * Dispose of resources and event listeners
   */
  public dispose(): void {
    // Unsubscribe from all events
    for (const sub of this.eventSubscriptions) {
      sub.unsubscribe();
    }
    this.eventSubscriptions = [];
  }
}
