import { DevConfig } from './config/devConfig';
import { GameConfig } from './config/gameConfig';
import { createApp } from './core/Application';
import { registerDebugConsoleAPIs } from './core/DebugConsole';
import { bindDebugHotkeys } from './core/DebugHotkeys';
import { startGameLoop } from './core/GameLoop';
import { bindInput } from './core/InputBindings';
import { createUI, setupCampClickCallback } from './core/UISetup';
import { GameManager } from './managers/GameManager';
import { InputManager } from './managers/InputManager';
import { TimeControlManager } from './managers/TimeControlManager';
import { DebugUtils } from './utils/DebugUtils';

(async () => {
  DebugUtils.setEnabled(DevConfig.DEBUG.ENABLED);
  DebugUtils.setLogLevel(DevConfig.DEBUG.LOG_LEVEL as 'debug' | 'info' | 'warn' | 'error');
  DebugUtils.info('Initializing game...');

  const { app, pixelArtRenderer, scaleManager } = await createApp();

  const gameManager = new GameManager(app);
  const timeControlManager = new TimeControlManager();
  const inputManager = new InputManager(app, scaleManager);
  gameManager.setInputManager(inputManager);

  const ui = createUI(app, gameManager, timeControlManager);
  bindInput(inputManager, gameManager, timeControlManager, ui.towerShop, ui.bottomBar);
  bindDebugHotkeys(inputManager, gameManager, scaleManager);

  gameManager.init();

  if (DevConfig.TESTING.SKIP_MENU && DevConfig.TESTING.AUTO_START_GAME) {
    DebugUtils.info('Quick start enabled - skipping menus');
    const defaultLevel = DevConfig.TESTING.DEFAULT_LEVEL || 'level1';
    gameManager.startGameWithLevel(defaultLevel);
    ui.uiManager.setState(GameConfig.GAME_STATES.PLAYING);
    setupCampClickCallback(gameManager, ui.campUpgradePanel);
  }

  startGameLoop(app, gameManager, timeControlManager, ui, pixelArtRenderer);
  await registerDebugConsoleAPIs(gameManager, timeControlManager);
})();
