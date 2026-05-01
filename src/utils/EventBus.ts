/**
 * EventBus - Centralized pub/sub event system for decoupled manager communication
 * 
 * This replaces direct method calls between managers with event-driven communication,
 * reducing coupling and making the system more testable and maintainable.
 */

export type EventCallback<T = unknown> = (payload: T) => void;

export interface EventSubscription {
  unsubscribe: () => void;
}

export class EventBus {
  private static instance: EventBus;
  private listeners: Map<string, Set<EventCallback>>;

  private constructor() {
    this.listeners = new Map();
  }

  public static getInstance(): EventBus {
    if (!EventBus.instance) {
      EventBus.instance = new EventBus();
    }
    return EventBus.instance;
  }

  /**
   * Subscribe to an event
   * @param event - Event name
   * @param callback - Function to call when event is emitted
   * @returns Subscription object with unsubscribe method
   */
  public on<T>(event: string, callback: EventCallback<T>): EventSubscription {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback as EventCallback);

    return {
      unsubscribe: () => {
        this.off(event, callback);
      },
    };
  }

  /**
   * Subscribe to an event once (auto-unsubscribes after first emission)
   * @param event - Event name
   * @param callback - Function to call when event is emitted
   * @returns Subscription object with unsubscribe method
   */
  public once<T>(event: string, callback: EventCallback<T>): EventSubscription {
    const onceCallback = (payload: T) => {
      this.off(event, onceCallback);
      callback(payload);
    };
    return this.on(event, onceCallback);
  }

  /**
   * Unsubscribe from an event
   * @param event - Event name
   * @param callback - Function to remove
   */
  public off<T>(event: string, callback: EventCallback<T>): void {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      callbacks.delete(callback as EventCallback);
      if (callbacks.size === 0) {
        this.listeners.delete(event);
      }
    }
  }

  /**
   * Emit an event to all subscribers
   * @param event - Event name
   * @param payload - Data to pass to subscribers
   */
  public emit<T>(event: string, payload?: T): void {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      callbacks.forEach((callback) => {
        try {
          callback(payload);
        } catch (error) {
          console.error(`Error in event handler for ${event}:`, error);
        }
      });
    }
  }

  /**
   * Remove all listeners for a specific event
   * @param event - Event name to clear
   */
  public clearEvent(event: string): void {
    this.listeners.delete(event);
  }

  /**
   * Remove all listeners for all events
   */
  public clearAll(): void {
    this.listeners.clear();
  }

  /**
   * Get the number of listeners for an event (useful for debugging)
   * @param event - Event name
   * @returns Number of subscribers
   */
  public listenerCount(event: string): number {
    return this.listeners.get(event)?.size ?? 0;
  }
}

// Export singleton instance for convenience
export const eventBus = EventBus.getInstance();

// Predefined event names for type safety and consistency
export const GameEvents = {
  // Wave events
  WAVE_START: 'wave:start',
  WAVE_COMPLETE: 'wave:complete',
  WAVE_END: 'wave:end',

  // Game state events
  GAME_START: 'game:start',
  GAME_OVER: 'game:over',
  GAME_VICTORY: 'game:victory',
  GAME_PAUSE: 'game:pause',
  GAME_RESUME: 'game:resume',

  // Economy events
  MONEY_EARNED: 'economy:money:earned',
  MONEY_SPENT: 'economy:money:spent',
  LIFE_LOST: 'game:life:lost',

  // Combat events
  ZOMBIE_SPAWNED: 'combat:zombie:spawned',
  ZOMBIE_KILLED: 'combat:zombie:killed',  // { reward: number, type: string }
  ZOMBIE_REACHED_END: 'combat:zombie:reachedEnd',
  TOWER_PLACED: 'combat:tower:placed',
  TOWER_SOLD: 'combat:tower:sold',
  TOWER_UPGRADED: 'combat:tower:upgraded',
  TOWER_DAMAGED: 'combat:tower:damaged',  // { tower: Tower, damage: number }
  DAMAGE_DEALT: 'combat:damage:dealt',

  // Combat visualization events (headless simulation support)
  TARGET_HIT: 'combat:target:hit',
  LIGHTNING_ARC: 'combat:lightning:arc',
  SNIPER_HIT: 'combat:sniper:hit',
  SHOOTING_EFFECT: 'combat:shooting:effect',
  TOWER_ROTATION: 'combat:tower:rotation',

  // Cleanup events
  CLEANUP_GAME: 'cleanup:game',
  CLEANUP_WAVE: 'cleanup:wave',
} as const;

// Type for event names
export type GameEventType = typeof GameEvents[keyof typeof GameEvents];
