import { Application, FederatedPointerEvent } from 'pixi.js';
import { GameManager } from './managers/GameManager';
import { UIManager } from './ui/UIManager';
import { HUD } from './ui/HUD';
import { MainMenu } from './ui/MainMenu';
import { LevelSelectMenu } from './ui/LevelSelectMenu';
import { TowerShop } from './ui/TowerShop';
import { TowerInfoPanel } from './ui/TowerInfoPanel';
import { DebugInfoPanel } from './ui/DebugInfoPanel';
import { ZombieBestiary } from './ui/ZombieBestiary';
import { GameConfig } from './config/gameConfig';
import { DebugUtils } from './utils/DebugUtils';
import { DevConfig } from './config/devConfig';
import { DebugConstants } from './config/debugConstants';

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
    width: 1280,
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

  // Create tower shop (positioned on the right side)
  const towerShop = new TowerShop();
  towerShop.position.set(1040, 20);
  uiManager.registerComponent('towerShop', towerShop);

  // Create tower info panel (positioned below tower shop)
  const towerInfoPanel = new TowerInfoPanel();
  towerInfoPanel.position.set(1040, 550);
  uiManager.registerComponent('towerInfoPanel', towerInfoPanel);

  // Create debug info panel (right side, below tower info panel)
  const debugInfoPanel = new DebugInfoPanel();
  debugInfoPanel.position.set(1260, 720);
  uiManager.registerComponent('debugInfoPanel', debugInfoPanel);
  // Add the content panel separately to the stage so it appears on top
  app.stage.addChild(debugInfoPanel.getContentContainer());
  if (DebugConstants.ENABLED) {
    debugInfoPanel.show();
  } else {
    debugInfoPanel.hide();
  }

  // Create zombie bestiary (right side, below debug panel)
  const zombieBestiary = new ZombieBestiary();
  zombieBestiary.position.set(1260, 770);
  uiManager.registerComponent('zombieBestiary', zombieBestiary);
  // Add the content panel separately to the stage so it appears on top
  app.stage.addChild(zombieBestiary.getContentContainer());
  
  // Set up spawn callback for testing zombie types
  zombieBestiary.setSpawnCallback((type: string) => {
    console.log(`🧟 Spawning test zombie: ${type}`);
    gameManager.getZombieManager().spawnZombieType(type);
  });

  // Set up event handlers
  mainMenu.setStartCallback(() => {
    DebugUtils.debug('Starting game from main menu');
    // Show level select menu instead of starting game directly
    uiManager.setState(GameConfig.GAME_STATES.LEVEL_SELECT);
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

  // Set up next wave button callback
  hud.setNextWaveCallback(() => {
    DebugUtils.debug('Starting next wave');
    gameManager.startNextWave();
    hud.hideNextWaveButton();
  });

  // Set up tower shop callbacks
  towerShop.setTowerSelectCallback((type: string) => {
    DebugUtils.debug(`Tower selected: ${type}`);
    const placementManager = gameManager.getTowerPlacementManager();
    placementManager.startPlacement(type);
  });

  // Set up tower placement callbacks
  const placementManager = gameManager.getTowerPlacementManager();

  placementManager.setTowerSelectedCallback(tower => {
    if (tower) {
      towerInfoPanel.showTowerInfo(tower);
    } else {
      towerInfoPanel.hide();
    }
  });

  // Set up tower info panel callbacks
  towerInfoPanel.setUpgradeCallback(() => {
    const tower = placementManager.getSelectedTower();
    if (tower) {
      const upgradeCost = gameManager
        .getTowerManager()
        .calculateUpgradeCost(tower.getType(), tower.getUpgradeLevel());
      if (gameManager.spendMoney(upgradeCost)) {
        placementManager.upgradeSelectedTower();
        DebugUtils.debug(`Tower upgraded for $${upgradeCost}`);
      } else {
        DebugUtils.debug('Not enough money to upgrade');
      }
    }
  });

  towerInfoPanel.setSellCallback(() => {
    const tower = placementManager.getSelectedTower();
    if (tower) {
      // Calculate sell value (75% of total cost)
      const baseCost = gameManager.getTowerManager().getTowerCost(tower.getType());
      let totalCost = baseCost;
      for (let i = 1; i < tower.getUpgradeLevel(); i++) {
        totalCost += gameManager.getTowerManager().calculateUpgradeCost(tower.getType(), i);
      }
      const sellValue = Math.floor(totalCost * 0.75);

      placementManager.removeSelectedTower();
      gameManager.addMoney(sellValue);
      towerInfoPanel.hide();
      DebugUtils.debug(`Tower sold for $${sellValue}`);
    }
  });

  // Set up map click for tower placement
  app.stage.eventMode = 'static';
  app.stage.hitArea = app.screen;
  app.stage.on('pointerdown', (event: FederatedPointerEvent) => {
    if (gameManager.getCurrentState() === GameConfig.GAME_STATES.PLAYING) {
      const placementManager = gameManager.getTowerPlacementManager();

      if (placementManager.isInPlacementMode()) {
        const pos = event.global;

        // Check if player has enough money before placing
        const selectedType = towerShop.getSelectedTowerType();
        if (selectedType) {
          const cost = gameManager.getTowerManager().getTowerCost(selectedType);
          if (gameManager.getMoney() >= cost) {
            const tower = placementManager.placeTower(pos.x, pos.y);
            if (tower) {
              towerShop.clearSelection();
            }
          } else {
            DebugUtils.debug('Not enough money to place tower');
            placementManager.cancelPlacement();
            towerShop.clearSelection();
          }
        }
      } else {
        // Deselect tower if clicking on empty space
        placementManager.selectTower(null);
      }
    }
  });

  // Track mouse movement for ghost tower
  app.stage.on('pointermove', (event: FederatedPointerEvent) => {
    if (gameManager.getCurrentState() === GameConfig.GAME_STATES.PLAYING) {
      const placementManager = gameManager.getTowerPlacementManager();
      if (placementManager.isInPlacementMode()) {
        const pos = event.global;
        placementManager.updateGhostPosition(pos.x, pos.y);
      }
    }
  });

  // Cancel placement on right click or ESC
  app.stage.on('rightdown', () => {
    const placementManager = gameManager.getTowerPlacementManager();
    if (placementManager.isInPlacementMode()) {
      placementManager.cancelPlacement();
      towerShop.clearSelection();
    }
  });

  window.addEventListener('keydown', event => {
    if (event.key === 'Escape') {
      const placementManager = gameManager.getTowerPlacementManager();
      if (placementManager.isInPlacementMode()) {
        placementManager.cancelPlacement();
        towerShop.clearSelection();
      }
    }
  });

  // Initialize the game
  gameManager.init();

  // Quick start for testing
  if (DevConfig.TESTING.SKIP_MENU && DevConfig.TESTING.AUTO_START_GAME) {
    DebugUtils.info('Quick start enabled - skipping menus');
    const defaultLevel = DevConfig.TESTING.DEFAULT_LEVEL || 'level1';
    gameManager.startGameWithLevel(defaultLevel);
    uiManager.setState(GameConfig.GAME_STATES.PLAYING);
  }

  // Listen for animate update
  let lastTime = performance.now();
  let frameCount = 0;
  let fpsUpdateTime = performance.now();
  let currentFPS = 60;

  app.ticker.add(() => {
    const currentTime = performance.now();
    const deltaTime = currentTime - lastTime; // Keep in milliseconds
    lastTime = currentTime;

    // Calculate FPS
    frameCount++;
    if (currentTime - fpsUpdateTime >= 1000) {
      currentFPS = frameCount;
      frameCount = 0;
      fpsUpdateTime = currentTime;
    }

    // Update game manager (handles zombies, waves, etc.)
    gameManager.update(deltaTime);

    // Update game systems based on current state
    if (gameManager.getCurrentState() === GameConfig.GAME_STATES.PLAYING) {
      // Generate resources over time (convert to seconds)
      gameManager.getResourceManager().generateResources(deltaTime / 1000);
    }

    // Update UI (convert to seconds)
    uiManager.update(deltaTime / 1000);

    // Update HUD with current game state
    hud.updateMoney(gameManager.getMoney());
    hud.updateLives(gameManager.getLives());
    hud.updateWave(gameManager.getWave());

    // Update resource display in HUD
    const resources = gameManager.getResources();
    hud.updateResources(resources.wood, resources.metal, resources.energy);

    // Update debug info panel
    if (DebugConstants.ENABLED && debugInfoPanel.visible) {
      const zombies = gameManager.getZombieManager().getZombies();
      const towers = gameManager.getTowerPlacementManager().getPlacedTowers();

      debugInfoPanel.updateStats({
        activeZombies: zombies.length,
        activeTowers: towers.length,
        waveProgress: `${gameManager.getWave()}`,
        fps: currentFPS,
      });
    }

    // Show next wave button when wave is complete
    if (gameManager.getCurrentState() === GameConfig.GAME_STATES.WAVE_COMPLETE) {
      hud.showNextWaveButton();
    } else {
      hud.hideNextWaveButton();
    }
  });

  DebugUtils.info('Game initialized successfully');
})();
