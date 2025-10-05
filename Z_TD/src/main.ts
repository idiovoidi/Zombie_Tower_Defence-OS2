import { Application } from 'pixi.js';
import { GameManager } from './managers/GameManager';
import { UIManager } from './ui/UIManager';
import { HUD } from './ui/HUD';
import { MainMenu } from './ui/MainMenu';
import { LevelSelectMenu } from './ui/LevelSelectMenu';
import { GameConfig } from './config/gameConfig';
import { DebugUtils } from './utils/DebugUtils';
import { DevConfig } from './config/devConfig';

(async () => {
  // Initialize debug utilities
  DebugUtils.setEnabled(DevConfig.DEBUG.ENABLED);
  DebugUtils.setLogLevel(DevConfig.DEBUG.LOG_LEVEL as any);
  DebugUtils.info('Initializing game...');

  // Create a new application
  const app = new Application();

  // Initialize the application
  await app.init({
    background: '#101010',
    resizeTo: window,
    width: 1024,
    height: 768,
  });

  // Append the application canvas to the document body
  document.getElementById('pixi-container')!.appendChild(app.canvas);

  // Create game manager
  const gameManager = new GameManager(app);

  // Create UI manager
  const uiManager = new UIManager(app);

  // Create HUD
  const hud = new HUD();
  uiManager.registerComponent('hud', hud);

  // Create main menu
  const mainMenu = new MainMenu();
  uiManager.registerComponent('mainMenu', mainMenu);

  // Create level select menu
  const levelSelectMenu = new LevelSelectMenu();
  uiManager.registerComponent('levelSelectMenu', levelSelectMenu);

  // Set up event handlers
  mainMenu.setStartCallback(() => {
    DebugUtils.debug('Starting game from main menu');
    // Show level select menu instead of starting game directly
    uiManager.setState('LevelSelect');
    // Update level select menu with available levels
    const levels = gameManager.getLevelManager().getAvailableLevels();
    levelSelectMenu.updateLevels(levels);
  });

  levelSelectMenu.setLevelSelectCallback((levelId: string) => {
    DebugUtils.debug(`Loading level: ${levelId}`);
    gameManager.startGameWithLevel(levelId);
    uiManager.setState(gameManager.getCurrentState());
  });

  levelSelectMenu.setBackCallback(() => {
    DebugUtils.debug('Returning to main menu');
    uiManager.setState(GameConfig.GAME_STATES.MAIN_MENU);
  });

  // Initialize the game
  gameManager.init();

  // Listen for animate update
  let lastTime = performance.now();
  app.ticker.add(time => {
    const currentTime = performance.now();
    const deltaTime = (currentTime - lastTime) / 1000; // Convert to seconds
    lastTime = currentTime;

    // Update game systems based on current state
    if (gameManager.getCurrentState() === GameConfig.GAME_STATES.PLAYING) {
      // Generate resources over time
      gameManager.getResourceManager().generateResources(deltaTime);
    }

    // Update UI
    uiManager.update(deltaTime);

    // Update HUD with current game state
    hud.updateMoney(gameManager.getMoney());
    hud.updateLives(gameManager.getLives());
    hud.updateWave(gameManager.getWave());

    // Update resource display in HUD
    const resources = gameManager.getResources();
    hud.updateResources(resources.wood, resources.metal, resources.energy);
  });

  DebugUtils.info('Game initialized successfully');
})();
