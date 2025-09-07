import { Application } from 'pixi.js';
import { UIComponent } from './UIComponent';
import { GameConfig } from '../config/gameConfig';
import { HUD } from './HUD';
import { MainMenu } from './MainMenu';
import { LevelSelectMenu } from './LevelSelectMenu';
import { TowerInfoPanel } from './TowerInfoPanel';

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
  
  private updateComponentVisibility(): void {
    // Show/hide UI components based on the current game state
    switch (this.currentState) {
      case GameConfig.GAME_STATES.MAIN_MENU:
        // Show main menu components, hide game UI
        this.setComponentVisibility('mainMenu', true);
        this.setComponentVisibility('levelSelectMenu', false);
        this.setComponentVisibility('hud', false);
        this.setComponentVisibility('towerInfoPanel', false);
        break;
      case GameConfig.GAME_STATES.LEVEL_SELECT:
        // Show level select menu, hide other components
        this.setComponentVisibility('mainMenu', false);
        this.setComponentVisibility('levelSelectMenu', true);
        this.setComponentVisibility('hud', false);
        this.setComponentVisibility('towerInfoPanel', false);
        break;
      case GameConfig.GAME_STATES.PLAYING:
        // Show game UI components, hide menu
        this.setComponentVisibility('mainMenu', false);
        this.setComponentVisibility('levelSelectMenu', false);
        this.setComponentVisibility('hud', true);
        this.setComponentVisibility('towerInfoPanel', true);
        break;
      case GameConfig.GAME_STATES.PAUSED:
        // Show pause menu
        this.setComponentVisibility('mainMenu', false);
        this.setComponentVisibility('levelSelectMenu', false);
        this.setComponentVisibility('hud', true);
        this.setComponentVisibility('towerInfoPanel', false);
        break;
      case GameConfig.GAME_STATES.GAME_OVER:
        // Show game over screen
        this.setComponentVisibility('mainMenu', false);
        this.setComponentVisibility('levelSelectMenu', false);
        this.setComponentVisibility('hud', false);
        this.setComponentVisibility('towerInfoPanel', false);
        break;
      case GameConfig.GAME_STATES.VICTORY:
        // Show victory screen
        this.setComponentVisibility('mainMenu', false);
        this.setComponentVisibility('levelSelectMenu', false);
        this.setComponentVisibility('hud', false);
        this.setComponentVisibility('towerInfoPanel', false);
        break;
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