import { Application, FederatedPointerEvent } from 'pixi.js';
import { GameManager } from './managers/GameManager';
import { CampUpgradeManager } from './managers/CampUpgradeManager';
import { UIManager } from './ui/UIManager';
import { HUD } from './ui/HUD';
import { BottomBar } from './ui/BottomBar';
import { MainMenu } from './ui/MainMenu';
import { LevelSelectMenu } from './ui/LevelSelectMenu';
import { TowerShop } from './ui/TowerShop';
import { TowerInfoPanel } from './ui/TowerInfoPanel';
import { DebugInfoPanel } from './ui/DebugInfoPanel';
import { ZombieBestiary } from './ui/ZombieBestiary';
import { WaveInfoPanel } from './ui/WaveInfoPanel';
import { CampUpgradePanel } from './ui/CampUpgradePanel';
import { AIControlPanel } from './ui/AIControlPanel';
import { StatsPanel } from './ui/StatsPanel';
import { MoneyAnimation } from './ui/MoneyAnimation';
import { LogExporter } from './utils/LogExporter';
import { GameConfig } from './config/gameConfig';
import { DebugUtils } from './utils/DebugUtils';
import { DevConfig } from './config/devConfig';
import { DebugConstants } from './config/debugConstants';

(async () => {
  // Initialize debug utilities
  DebugUtils.setEnabled(DevConfig.DEBUG.ENABLED);
  DebugUtils.setLogLevel(DevConfig.DEBUG.LOG_LEVEL as 'debug' | 'info' | 'warn' | 'error');
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
  document.getElementById('pixi-container')?.appendChild(app.canvas);

  // Create game manager
  const gameManager = new GameManager(app);

  // Create money animation system
  const moneyAnimation = new MoneyAnimation(app.stage);

  // Set up money gain callback
  gameManager.setMoneyGainCallback((amount: number) => {
    moneyAnimation.showMoneyGain(amount);
  });

  // Create UI manager
  const uiManager = new UIManager(app);

  // Create HUD
  const hud = new HUD();
  uiManager.registerComponent('hud', hud);

  // Calculate responsive positions based on screen dimensions
  const screenWidth = GameConfig.SCREEN_WIDTH;
  const screenHeight = GameConfig.SCREEN_HEIGHT;
  const shopWidth = GameConfig.UI_SHOP_WIDTH;
  const bottomBarHeight = GameConfig.UI_BOTTOM_BAR_HEIGHT;

  // Create bottom bar (positioned at bottom of screen, full width minus shop)
  const bottomBarWidth = screenWidth - shopWidth;
  const bottomBar = new BottomBar(bottomBarWidth);
  bottomBar.position.set(0, screenHeight - bottomBarHeight);
  uiManager.registerComponent('bottomBar', bottomBar);

  // Create main menu
  const mainMenu = new MainMenu();
  uiManager.registerComponent('mainMenu', mainMenu);

  // Create level select menu
  const levelSelectMenu = new LevelSelectMenu();
  uiManager.registerComponent('levelSelectMenu', levelSelectMenu);

  // Create tower shop (positioned on the right side, full height)
  const towerShop = new TowerShop();
  towerShop.position.set(screenWidth - shopWidth, 0);
  uiManager.registerComponent('towerShop', towerShop);

  // Create tower info panel (positioned below tower shop)
  const towerInfoPanel = new TowerInfoPanel();
  towerInfoPanel.position.set(screenWidth - shopWidth, 550);
  uiManager.registerComponent('towerInfoPanel', towerInfoPanel);

  // Create wave info panel (right side, top position)
  const waveInfoPanel = new WaveInfoPanel();
  waveInfoPanel.position.set(screenWidth - 20, screenHeight - 94);
  uiManager.registerComponent('waveInfoPanel', waveInfoPanel);
  // Add the content panel separately to the stage so it appears on top
  app.stage.addChild(waveInfoPanel.getContentContainer());
  // Set wave manager reference
  waveInfoPanel.setWaveManager(gameManager.getWaveManager());
  if (DebugConstants.ENABLED) {
    waveInfoPanel.show();
  } else {
    waveInfoPanel.hide();
  }

  // Create debug info panel (right side, below wave info panel)
  const debugInfoPanel = new DebugInfoPanel();
  debugInfoPanel.position.set(screenWidth - 20, screenHeight - 48);
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
  zombieBestiary.position.set(screenWidth - 20, screenHeight - 2);
  uiManager.registerComponent('zombieBestiary', zombieBestiary);
  // Add the content panel separately to the stage so it appears on top
  app.stage.addChild(zombieBestiary.getContentContainer());

  // Set up spawn callback for testing zombie types
  zombieBestiary.setSpawnCallback((type: string) => {
    console.log(`🧟 Spawning test zombie: ${type}`);
    gameManager.getZombieManager().spawnZombieType(type);
  });

  // Create AI control panel (left side, below wave info)
  const aiControlPanel = new AIControlPanel();
  aiControlPanel.position.set(20, screenHeight - 94);
  uiManager.registerComponent('aiControlPanel', aiControlPanel);
  app.stage.addChild(aiControlPanel);

  // Set up AI toggle callback
  aiControlPanel.setToggleCallback((enabled: boolean) => {
    DebugUtils.debug(`AI Player ${enabled ? 'enabled' : 'disabled'}`);
    gameManager.getAIPlayerManager().setEnabled(enabled);
    gameManager.getStatTracker().setAIModeEnabled(enabled);
  });

  // Create stats panel (left side, below AI control)
  const statsPanel = new StatsPanel(gameManager);
  statsPanel.position.set(10, 100);
  uiManager.registerComponent('statsPanel', statsPanel);
  app.stage.addChild(statsPanel);

  // Create camp upgrade system
  const campUpgradeManager = new CampUpgradeManager();

  // Create camp upgrade panel
  const campUpgradePanel = new CampUpgradePanel();
  campUpgradePanel.setCampUpgradeManager(campUpgradeManager);
  uiManager.registerComponent('campUpgradePanel', campUpgradePanel);
  // Add the content panel separately to the stage so it appears on top
  app.stage.addChild(campUpgradePanel.getContentContainer());
  campUpgradePanel.hide(); // Hidden by default

  // Set up camp upgrade callback
  campUpgradePanel.setUpgradeCallback((upgradeId: string, cost: number) => {
    if (gameManager.getMoney() >= cost) {
      gameManager.spendMoney(cost);
      DebugUtils.debug(`Purchased camp upgrade: ${upgradeId} for $${cost}`);
      return true;
    } else {
      DebugUtils.debug('Not enough money for camp upgrade');
      return false;
    }
  });

  // Set up camp click callback (will be set after map is loaded)
  const setupCampClickCallback = () => {
    const mapRenderer = gameManager.getMapRenderer();
    if (mapRenderer) {
      DebugUtils.debug('Setting up camp click callback');
      mapRenderer.setCampClickCallback(() => {
        DebugUtils.debug('🏕️ Camp clicked - opening upgrade panel');
        campUpgradePanel.show();
      });
      DebugUtils.debug('Camp click callback set successfully');
    } else {
      DebugUtils.debug('⚠️ Map renderer not available');
    }
  };

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
    // Setup camp click callback after map is loaded
    setupCampClickCallback();
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

  // Set up bottom bar next wave button callback
  bottomBar.setNextWaveCallback(() => {
    DebugUtils.debug('Starting next wave');
    gameManager.startNextWave();
    bottomBar.hideNextWaveButton();
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
        const newLevel = tower.getUpgradeLevel();

        gameManager.getStatTracker().trackTowerUpgraded(tower.getType(), upgradeCost, newLevel);

        // Track tower upgrade for balance analysis
        if (gameManager.isBalanceTrackingEnabled()) {
          gameManager
            .getBalanceTrackingManager()
            .trackTowerUpgraded(tower.getType(), upgradeCost, newLevel);
        }

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

      const towerType = tower.getType();
      placementManager.removeSelectedTower();
      gameManager.addMoney(sellValue);
      gameManager.getStatTracker().trackTowerSold(towerType, sellValue);

      // Track tower sold for balance analysis
      if (gameManager.isBalanceTrackingEnabled()) {
        gameManager.getBalanceTrackingManager().trackTowerSold(towerType, sellValue);
      }

      towerInfoPanel.hide();
      DebugUtils.debug(`Tower sold for $${sellValue}`);
    }
  });

  // Set up map click for tower placement
  app.stage.eventMode = 'static';
  app.stage.hitArea = app.screen;
  app.stage.on('pointerdown', (event: FederatedPointerEvent) => {
    // Check if event was already handled by a child (like camp click area)
    if (event.defaultPrevented) {
      return;
    }

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
              gameManager.getStatTracker().trackTowerBuilt(selectedType, cost);
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
    // Setup camp click callback after map is loaded
    setupCampClickCallback();
  }

  // Listen for animate update
  let lastTime = performance.now();
  let frameCount = 0;
  let fpsUpdateTime = performance.now();
  let currentFPS = 60;

  app.ticker.add(() => {
    const currentTime = performance.now();
    let deltaTime = currentTime - lastTime; // Keep in milliseconds
    lastTime = currentTime;

    // Cap delta time to prevent huge jumps when alt-tabbing or lag spikes
    // Use configured max delta time (converted from seconds to milliseconds)
    const maxDeltaTime = DevConfig.PERFORMANCE.MAX_DELTA_TIME * 1000;
    if (deltaTime > maxDeltaTime) {
      console.warn(`⚠️ Delta time capped from ${deltaTime.toFixed(1)}ms to ${maxDeltaTime}ms`);
      deltaTime = maxDeltaTime;
    }

    // Calculate FPS
    frameCount++;
    if (currentTime - fpsUpdateTime >= 1000) {
      currentFPS = frameCount;
      frameCount = 0;
      fpsUpdateTime = currentTime;
    }

    // Update game manager (handles zombies, waves, etc.)
    gameManager.update(deltaTime);

    // Update money animations
    moneyAnimation.update(deltaTime);

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

    // Update bottom bar with current game state
    bottomBar.updateMoney(gameManager.getMoney());
    bottomBar.updateLives(gameManager.getLives());
    bottomBar.updateWave(gameManager.getWave());
    bottomBar.updateResources(resources.wood, resources.metal, resources.energy);

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

    // Update wave info panel
    if (DebugConstants.ENABLED && waveInfoPanel.visible) {
      waveInfoPanel.updateCurrentWave(gameManager.getWave());
    }

    // Update camp upgrade panel money
    campUpgradePanel.setMoneyAvailable(gameManager.getMoney());

    // Show next wave button when wave is complete
    if (gameManager.getCurrentState() === GameConfig.GAME_STATES.WAVE_COMPLETE) {
      hud.showNextWaveButton();
      bottomBar.showNextWaveButton();
    } else {
      hud.hideNextWaveButton();
      bottomBar.hideNextWaveButton();
    }
  });

  DebugUtils.info('Game initialized successfully');

  // Expose LogExporter to console for easy access
  (window as any).LogExporter = LogExporter;
  console.log('📊 LogExporter available in console');
  console.log('💡 Commands:');
  console.log('  LogExporter.viewStoredLogs() - View all stored logs');
  console.log('  LogExporter.exportAllLogs() - Export all logs as files');
  console.log('  LogExporter.exportAllLogsAsBundle() - Export as single bundle');
  console.log('  LogExporter.getStoredLogCount() - Get number of stored logs');
  console.log('  LogExporter.clearAllLogs() - Clear all stored logs');

  // Expose balance tracking controls to console
  (window as unknown).balanceTracking = {
    enable: () => gameManager.enableBalanceTracking(),
    disable: () => gameManager.disableBalanceTracking(),
    isEnabled: () => gameManager.isBalanceTrackingEnabled(),
    getReport: () => gameManager.getBalanceTrackingManager().generateReportData(),
    reset: () => gameManager.getBalanceTrackingManager().reset(),
  };
  console.log('📊 Balance Tracking available in console');
  console.log('💡 Balance Tracking Commands:');
  console.log('  balanceTracking.enable() - Enable balance tracking');
  console.log('  balanceTracking.disable() - Disable balance tracking');
  console.log('  balanceTracking.isEnabled() - Check if tracking is enabled');
  console.log('  balanceTracking.getReport() - Get current balance report');
  console.log('  balanceTracking.reset() - Reset tracking data');

  // Expose wave balancing tools to console for testing
  if (DevConfig.DEBUG.ENABLED) {
    (window as unknown).waveBalance = async () => {
      const { WaveBalancing, printWaveBalance } = await import('./config/waveBalancing');
      (window as unknown).WaveBalancing = WaveBalancing;
      (window as unknown).printWaveBalance = printWaveBalance;
      console.log('Wave balancing tools loaded!');
      console.log('Usage:');
      console.log('  printWaveBalance(1, 10) - Print balance report for waves 1-10');
      console.log(
        '  WaveBalancing.updateConfig({ difficultyMultiplier: 1.5 }) - Adjust difficulty'
      );
      console.log('  WaveBalancing.calculateZombieHealth(5) - Get zombie health for wave 5');
    };
    console.log('💡 Type waveBalance() in console to load wave balancing tools');
  }
})();
