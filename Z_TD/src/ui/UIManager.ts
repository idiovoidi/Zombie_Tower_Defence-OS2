import { Application } from 'pixi.js';
import { UIComponent } from './UIComponent';
import { GameConfig } from '../config/gameConfig';

/**
 * Configuration map defining which UI components should be visible for each game state.
 * This data-driven approach eliminates the need for a large switch statement.
 */
type ComponentVisibilityMap = Record<string, boolean>;
type StateVisibilityConfig = Record<string, ComponentVisibilityMap>;

const UI_STATE_CONFIG: StateVisibilityConfig = {
  [GameConfig.GAME_STATES.MAIN_MENU]: {
    mainMenu: true,
    levelSelectMenu: false,
    hud: false,
    bottomBar: false,
    towerShop: false,
    towerInfoPanel: false,
    statsPanel: false,
  },
  [GameConfig.GAME_STATES.LEVEL_SELECT]: {
    mainMenu: false,
    levelSelectMenu: true,
    hud: false,
    bottomBar: false,
    towerShop: false,
    towerInfoPanel: false,
    statsPanel: false,
  },
  [GameConfig.GAME_STATES.PLAYING]: {
    mainMenu: false,
    levelSelectMenu: false,
    hud: true,
    bottomBar: true,
    towerShop: true,
    towerInfoPanel: false,
    statsPanel: true,
  },
  [GameConfig.GAME_STATES.WAVE_COMPLETE]: {
    mainMenu: false,
    levelSelectMenu: false,
    hud: true,
    bottomBar: true,
    towerShop: true,
    towerInfoPanel: false,
    statsPanel: true,
  },
  [GameConfig.GAME_STATES.PAUSED]: {
    mainMenu: false,
    levelSelectMenu: false,
    hud: true,
    bottomBar: true,
    towerShop: false,
    towerInfoPanel: false,
    statsPanel: false,
  },
  [GameConfig.GAME_STATES.GAME_OVER]: {
    mainMenu: false,
    levelSelectMenu: false,
    hud: false,
    bottomBar: false,
    towerShop: false,
    towerInfoPanel: false,
    statsPanel: false,
  },
  [GameConfig.GAME_STATES.VICTORY]: {
    mainMenu: false,
    levelSelectMenu: false,
    hud: false,
    bottomBar: false,
    towerShop: false,
    towerInfoPanel: false,
    statsPanel: false,
  },
};

export class UIManager {
  private app: Application;
  private components: Map<string, UIComponent>;
  private currentState: string;

  constructor(app: Application) {
    this.app = app;
    this.components = new Map<string, UIComponent>();
    this.currentState = GameConfig.GAME_STATES.MAIN_MENU;
  }

  // Register a UI component
  public registerComponent(name: string, component: UIComponent): void {
    this.components.set(name, component);
    this.app.stage.addChild(component);
  }

  // Remove a UI component
  public removeComponent(name: string): void {
    const component = this.components.get(name);
    if (component) {
      component.destroy();
      this.components.delete(name);
    }
  }

  // Get a UI component by name
  public getComponent<T extends UIComponent>(name: string): T | undefined {
    return this.components.get(name) as T | undefined;
  }

  // Update all components
  public update(deltaTime: number): void {
    for (const component of this.components.values()) {
      if (component.isVisible()) {
        component.update(deltaTime);
      }
    }
  }

  // Show/hide components based on game state
  public setState(state: string): void {
    this.currentState = state;
    this.updateComponentVisibility();
  }

  /**
   * Updates component visibility based on the current game state.
   * Uses a data-driven approach with the UI_STATE_CONFIG map.
   *
   * Complexity: O(n) where n is the number of components
   * Cyclomatic Complexity: 1 (no branching logic)
   */
  private updateComponentVisibility(): void {
    const visibilityConfig = UI_STATE_CONFIG[this.currentState];

    if (!visibilityConfig) {
      console.warn(`No UI configuration found for state: ${this.currentState}`);
      return;
    }

    // Apply visibility settings from configuration
    for (const [componentName, shouldBeVisible] of Object.entries(visibilityConfig)) {
      this.setComponentVisibility(componentName, shouldBeVisible);
    }
  }

  private setComponentVisibility(name: string, visible: boolean): void {
    const component = this.components.get(name);
    if (component) {
      if (visible) {
        component.show();
      } else {
        component.hide();
      }
    }
  }

  public getCurrentState(): string {
    return this.currentState;
  }
}
