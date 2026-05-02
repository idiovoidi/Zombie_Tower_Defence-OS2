import { EventBus, GameEvents } from '../utils/EventBus';

export enum TimeSpeed {
  SLOW = 0.5,
  NORMAL = 1,
  FAST = 2,
  VERY_FAST = 4,
}

export interface TimeControlState {
  speed: TimeSpeed;
  isPaused: boolean;
  isPlacementPause: boolean;
}

/**
 * TimeControlManager - Manages tactical time control for the game
 *
 * Features:
 * - Pause/Resume with Space key
 * - 0.5x slow motion speed
 * - Auto-pause when placing towers (pause-with-placement)
 * - Time multiplier applied to deltaTime in game loop
 */
export class TimeControlManager {
  private currentSpeed: TimeSpeed = TimeSpeed.NORMAL;
  private isPaused: boolean = false;
  private isPlacementPause: boolean = false;
  private prePlacementSpeed: TimeSpeed = TimeSpeed.NORMAL;
  private onStateChangeCallback: ((state: TimeControlState) => void) | null = null;

  constructor() {
    this.setupKeyboardShortcuts();
  }

  private setupKeyboardShortcuts(): void {
    window.addEventListener('keydown', (event) => {
      // Space to toggle pause (only if not in text input)
      if (event.code === 'Space' && !this.isInputElementActive()) {
        event.preventDefault();
        this.togglePause();
      }

      // 1 key for normal speed
      if (event.key === '1' && !this.isInputElementActive()) {
        this.setSpeed(TimeSpeed.NORMAL);
      }

      // 2 key for slow speed (0.5x)
      if (event.key === '2' && !this.isInputElementActive()) {
        this.setSpeed(TimeSpeed.SLOW);
      }

      // 3 key for fast speed (2x)
      if (event.key === '3' && !this.isInputElementActive()) {
        this.setSpeed(TimeSpeed.FAST);
      }

      // 4 key for very fast speed (4x)
      if (event.key === '4' && !this.isInputElementActive()) {
        this.setSpeed(TimeSpeed.VERY_FAST);
      }
    });
  }

  private isInputElementActive(): boolean {
    const activeElement = document.activeElement;
    return activeElement instanceof HTMLInputElement ||
           activeElement instanceof HTMLTextAreaElement ||
           activeElement instanceof HTMLSelectElement;
  }

  /**
   * Get the current time multiplier (0, 0.5, or 1)
   * Apply this to deltaTime before passing to game systems
   */
  public getTimeMultiplier(): number {
    if (this.isPaused) return 0;
    return this.currentSpeed;
  }

  /**
   * Toggle between paused and the previous speed
   */
  public togglePause(): void {
    if (this.isPaused) {
      this.resume();
    } else {
      this.pause();
    }
  }

  /**
   * Pause the game (manual pause, not placement-related)
   */
  public pause(): void {
    if (!this.isPaused) {
      this.isPaused = true;
      this.isPlacementPause = false;
      this.notifyStateChange();
      EventBus.getInstance().emit(GameEvents.GAME_PAUSE);
    }
  }

  /**
   * Resume from pause
   */
  public resume(): void {
    if (this.isPaused && !this.isPlacementPause) {
      this.isPaused = false;
      this.notifyStateChange();
      EventBus.getInstance().emit(GameEvents.GAME_RESUME);
    }
  }

  /**
   * Start placement mode - auto-pause if setting enabled
   * Returns true if auto-pause was triggered
   */
  public startPlacement(autoPauseEnabled: boolean = true): boolean {
    if (autoPauseEnabled && !this.isPaused) {
      this.prePlacementSpeed = this.currentSpeed;
      this.isPaused = true;
      this.isPlacementPause = true;
      this.notifyStateChange();
      EventBus.getInstance().emit(GameEvents.GAME_PAUSE);
      return true;
    }
    return false;
  }

  /**
   * End placement mode - resume if we were in placement pause
   */
  public endPlacement(): void {
    if (this.isPlacementPause) {
      this.isPaused = false;
      this.isPlacementPause = false;
      this.currentSpeed = this.prePlacementSpeed;
      this.notifyStateChange();
      EventBus.getInstance().emit(GameEvents.GAME_RESUME);
    }
  }

  /**
   * Set the game speed (affects time multiplier when not paused)
   */
  public setSpeed(speed: TimeSpeed): void {
    this.currentSpeed = speed;
    // If we were paused (manually), resume when setting speed
    if (this.isPaused && !this.isPlacementPause) {
      this.isPaused = false;
    }
    this.notifyStateChange();
  }

  /**
   * Cycle through available speeds: Normal -> Slow -> Fast -> Very Fast -> Normal
   */
  public cycleSpeed(): void {
    switch (this.currentSpeed) {
      case TimeSpeed.NORMAL:
        this.setSpeed(TimeSpeed.SLOW);
        break;
      case TimeSpeed.SLOW:
        this.setSpeed(TimeSpeed.FAST);
        break;
      case TimeSpeed.FAST:
        this.setSpeed(TimeSpeed.VERY_FAST);
        break;
      case TimeSpeed.VERY_FAST:
      default:
        this.setSpeed(TimeSpeed.NORMAL);
        break;
    }
  }

  /**
   * Get current state for UI display
   */
  public getState(): TimeControlState {
    return {
      speed: this.currentSpeed,
      isPaused: this.isPaused,
      isPlacementPause: this.isPlacementPause,
    };
  }

  /**
   * Check if currently paused
   */
  public getIsPaused(): boolean {
    return this.isPaused;
  }

  /**
   * Check if in placement pause mode
   */
  public getIsPlacementPause(): boolean {
    return this.isPlacementPause;
  }

  /**
   * Get current speed setting (even if paused)
   */
  public getCurrentSpeed(): TimeSpeed {
    return this.currentSpeed;
  }

  /**
   * Set callback for state changes (for UI updates)
   */
  public setOnStateChangeCallback(callback: (state: TimeControlState) => void): void {
    this.onStateChangeCallback = callback;
  }

  private notifyStateChange(): void {
    if (this.onStateChangeCallback) {
      this.onStateChangeCallback(this.getState());
    }
  }
}
