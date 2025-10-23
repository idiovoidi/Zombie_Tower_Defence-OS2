import { Application } from 'pixi.js';
import { GameManager } from './managers/GameManager';
import { Tower } from './objects/Tower';
import { UIManager } from './ui/UIManager';
import { HUD } from './ui/HUD';
import { BottomBar } from './ui/BottomBar';
import { MainMenu } from './ui/MainMenu';
import { LevelSelectMenu } from './ui/LevelSelectMenu';
import { TowerShop } from './ui/TowerShop';
import { TowerInfoPanel } from './ui/TowerInfoPanel';
import { DebugInfoPanel } from './ui/DebugInfoPanel';
import { CampUpgradePanel } from './ui/CampUpgradePanel';
import { DebugTestUIManager } from './managers/DebugTestUIManager';
import { CampUpgradeManager } from './managers/CampUpgradeManager';
import { MoneyAnimation } from './ui/MoneyAnimation';
import { LogExporter } from './utils/LogExporter';
import { GameConfig } from './config/gameConfig';
import { InputManager } from './managers/InputManager';
import { DebugUtils } from './utils/DebugUtils';
import { DevConfig } from './config/devConfig';
import { DebugConstants } from './config/debugConstants';
import { ScaleManager } from './utils/ScaleManager';
import { VisualEffects } from './utils/VisualEffects';

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
    width: 1280,
    height: 768,
  });

  // Append the application canvas to the document body
  document.getElementById('pixi-container')?.appendChild(app.canvas);

  // Enable pixel-perfect rendering (nearest-neighbor filtering)
  // This makes textures render with sharp pixels instead of smooth/blurry
  // Note: In PixiJS v8, this is set per-texture or via TextureSource
  console.log('🎮 Pixel-perfect mode: Use PixelArtRenderer for true pixel art');

  // Create pixel art renderer (optional - for true low-res rendering)
  const { PixelArtRenderer } = await import('./utils/PixelArtRenderer');
  const pixelArtRenderer = new PixelArtRenderer(app, app.stage);

  // Uncomment to enable pixel art rendering (renders at lower resolution)
  // pixelArtRenderer.enable(3); // 3x scale = 1/3 resolution

  // Create scale manager for responsive scaling
  const scaleManager = new ScaleManager(app);

  // Create game manager
  const gameManager = new GameManager(app);

  // Create input manager for robust input handling
  const inputManager = new InputManager(app, scaleManager);

  // Set input manager in game manager (this will initialize VisualMapRenderer)
  gameManager.setInputManager(inputManager);

  // Add debug info to console
  console.log('🎮 Game initialized:', scaleManager.getDebugInfo());

  // Add keyboard shortcuts
  window.addEventListener('keydown', event => {
    // Toggle debug mode (Ctrl+D)
    if (event.key.toLowerCase() === 'd' && event.ctrlKey) {
      const currentDebug = !inputManager['debugMode'];
      inputManager.setDebugMode(currentDebug);
      console.log(
        `🔧 Debug mode ${currentDebug ? 'enabled' : 'disabled'}:`,
        scaleManager.getDebugInfo()
      );
    }
  });

  // Create money animation system
  const moneyAnimation = new MoneyAnimation(app.stage);

  // Set up money gain callback
  gameManager.setMoneyGainCallback((amount: number) => {
    moneyAnimation.showMoneyGain(amount);
  });

  // Set up damage flash callback
  gameManager.setDamageFlashCallback(() => {
    VisualEffects.createDamageFlash(app.stage, GameConfig.SCREEN_WIDTH, GameConfig.SCREEN_HEIGHT);
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

  // Create tower info panel (positioned below tower shop, aligned to bottom of screen)
  const towerInfoPanel = new TowerInfoPanel();
  const towerInfoPanelHeight = 300; // Panel height from TowerInfoPanel.ts
  towerInfoPanel.position.set(screenWidth - shopWidth, screenHeight - towerInfoPanelHeight);
  uiManager.registerComponent('towerInfoPanel', towerInfoPanel);

  // Create debug test UI manager (handles shader test, wave info, bestiary)
  const debugTestUIManager = new DebugTestUIManager(app);
  debugTestUIManager.initialize(gameManager, gameManager.getWaveManager(), pixelArtRenderer);

  // Set up spawn callback for testing zombie types from bestiary
  debugTestUIManager.setZombieSpawnCallback((type: string) => {
    console.log(`🧟 Spawning test zombie: ${type}`);
    gameManager.getZombieManager().spawnZombieType(type);
  });

  // Create debug info panel (right side, below wave info panel)
  const debugInfoPanel = new DebugInfoPanel();
  debugInfoPanel.position.set(screenWidth - 20, screenHeight - 48);
  uiManager.registerComponent('debugInfoPanel', debugInfoPanel);
  // Add the content panel separately to the stage so it appears on top
  app.stage.addChild(debugInfoPanel.getContentContainer());

  // Set up callbacks to open debug test panels
  debugInfoPanel.setStatsCallback(() => {
    debugTestUIManager.openStatsPanel();
  });
  debugInfoPanel.setShaderTestCallback(() => {
    debugTestUIManager.openShaderTestPanel();
  });
  debugInfoPanel.setWaveInfoCallback(() => {
    debugTestUIManager.openWaveInfoPanel();
  });
  debugInfoPanel.setBestiaryCallback(() => {
    debugTestUIManager.openBestiaryPanel();
  });
  debugInfoPanel.setAIControlCallback(() => {
    debugTestUIManager.openAIControlPanel();
  });

  // Set up AI toggle callback
  debugTestUIManager.setAIToggleCallback((enabled: boolean) => {
    DebugUtils.debug(`AI Player ${enabled ? 'enabled' : 'disabled'}`);
    gameManager.getAIPlayerManager().setEnabled(enabled);
    gameManager.getStatTracker().setAIModeEnabled(enabled);
  });

  if (DebugConstants.ENABLED) {
    debugInfoPanel.show();
  } else {
    debugInfoPanel.hide();
  }

  // Create camp upgrade system
  const campUpgradeManager = new CampUpgradeManager();

  // Create camp upgrade panel
  const campUpgradePanel = new CampUpgradePanel();
  campUpgradePanel.setCampUpgradeManager(campUpgradeManager);
  uiManager.registerComponent('campUpgradePanel', campUpgradePanel);
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

  // Set up input handling using InputManager
  inputManager.onPointerDown((coords, event) => {
    // Check if event was already handled by a child (like camp click area)
    if (event.defaultPrevented) {
      return;
    }

    const currentState = gameManager.getCurrentState();
    if (
      currentState === GameConfig.GAME_STATES.PLAYING ||
      currentState === GameConfig.GAME_STATES.WAVE_COMPLETE
    ) {
      const placementManager = gameManager.getTowerPlacementManager();

      if (placementManager.isInPlacementMode()) {
        // Use game coordinates from InputManager
        const pos = coords.game;

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
  inputManager.onPointerMove(coords => {
    const currentState = gameManager.getCurrentState();
    if (
      currentState === GameConfig.GAME_STATES.PLAYING ||
      currentState === GameConfig.GAME_STATES.WAVE_COMPLETE
    ) {
      const placementManager = gameManager.getTowerPlacementManager();
      if (placementManager.isInPlacementMode()) {
        // Use game coordinates from InputManager
        placementManager.updateGhostPosition(coords.game.x, coords.game.y);
      }
    }
  });

  // Cancel placement on right click
  inputManager.onRightClick(() => {
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

    // Debug hotkeys (only work when debug mode is enabled)
    if (DebugConstants.ENABLED) {
      const key = event.key.toLowerCase();

      // M - Add money
      if (key === 'm') {
        const amount = event.shiftKey ? 10000 : 1000;
        gameManager.addMoney(amount);
        console.log(`💰 Added $${amount} (Total: $${gameManager.getMoney()})`);
      }

      // L - Add lives
      if (key === 'l') {
        const amount = event.shiftKey ? 100 : 10;
        gameManager.addLives(amount);
        console.log(`❤️ Added ${amount} lives (Total: ${gameManager.getLives()})`);
      }

      // N - Skip to next wave
      if (key === 'n') {
        if (gameManager.getState() === GameConfig.GAME_STATES.WAVE_COMPLETE) {
          gameManager.startNextWave();
          console.log('🌊 Started next wave');
        } else {
          console.log('⚠️ Can only skip to next wave during wave complete state');
        }
      }

      // K - Kill all zombies
      if (key === 'k') {
        const zombieManager = gameManager.getZombieManager();
        const zombies = zombieManager.getZombies();
        let killed = 0;
        zombies.forEach(zombie => {
          if (zombie.parent) {
            zombie.takeDamage(999999);
            killed++;
          }
        });
        console.log(`💀 Killed ${killed} zombies`);
      }

      // U - Upgrade all towers to max
      if (key === 'u') {
        const combatManager = gameManager.getTowerCombatManager();
        const towers = combatManager.getTowers();
        let upgraded = 0;
        towers.forEach((tower: Tower) => {
          while (tower.canUpgrade()) {
            tower.upgrade();
            upgraded++;
          }
        });
        console.log(`⬆️ Upgraded ${upgraded} tower levels`);
      }

      // H - Show debug help
      if (key === 'h') {
        console.log('🔧 Debug Hotkeys:');
        console.log('  M - Add $1000 (Shift+M for $10000)');
        console.log('  L - Add 10 lives (Shift+L for 100)');
        console.log('  N - Skip to next wave');
        console.log('  K - Kill all zombies');
        console.log('  U - Upgrade all towers to max');
        console.log('  H - Show this help');
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

    // Update game manager (handles zombies, waves, etc.)
    gameManager.update(deltaTime);

    // Update money animations
    moneyAnimation.update(deltaTime);

    // Update UI (convert to seconds)
    uiManager.update(deltaTime / 1000);

    // Update HUD with current game state
    hud.updateMoney(gameManager.getMoney());
    hud.updateLives(gameManager.getLives());
    hud.updateWave(gameManager.getWave());

    // Update bottom bar with current game state
    bottomBar.updateMoney(gameManager.getMoney());
    bottomBar.updateLives(gameManager.getLives());
    bottomBar.updateWave(gameManager.getWave());

    // Update debug test UI manager (wave info, shader test, bestiary)
    if (DebugConstants.ENABLED) {
      debugTestUIManager.update(deltaTime);
      debugTestUIManager.updateWaveInfo(gameManager.getWave());
    }

    // Update tower shop affordability
    towerShop.updateAffordability(gameManager.getMoney());

    // Update tower placement affordability
    const placementManager = gameManager.getTowerPlacementManager();
    if (placementManager.isInPlacementMode()) {
      const selectedType = towerShop.getSelectedTowerType();
      if (selectedType) {
        const cost = gameManager.getTowerManager().getTowerCost(selectedType);
        placementManager.setCanAfford(gameManager.getMoney() >= cost);
      }
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

    // Render with pixel art renderer if enabled
    if (pixelArtRenderer.isEnabled()) {
      pixelArtRenderer.render();
    }
  });

  DebugUtils.info('Game initialized successfully');

  // Expose LogExporter to console for easy access
  window.LogExporter = LogExporter;

  // Check if we're in production (GitHub Pages) and warn about server features
  if (process.env.NODE_ENV === 'production') {
    console.warn('⚠️ Running in production mode - server features disabled');
    console.log('📊 LogExporter available in console (localStorage only)');
  } else {
    console.log('📊 LogExporter available in console');
  }

  console.log('💡 Commands:');
  console.log('  LogExporter.viewStoredLogs() - View all stored logs');
  console.log('  LogExporter.exportAllLogs() - Export all logs as files');
  console.log('  LogExporter.exportAllLogsAsBundle() - Export as single bundle');
  console.log('  LogExporter.getStoredLogCount() - Get number of stored logs');
  console.log('  LogExporter.clearAllLogs() - Clear all stored logs');

  // Expose balance tracking controls to console
  window.balanceTracking = {
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
    window.waveBalance = async () => {
      const { WaveBalancing, printWaveBalance } = await import('./config/waveBalancing');
      window.WaveBalancing = WaveBalancing;
      window.printWaveBalance = printWaveBalance;
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

  // Expose performance testing tools to console
  window.performanceTest = async () => {
    const { runBalancePerformanceTests, runFrameRateTest } = await import(
      './utils/BalanceAnalysisPerformanceTest'
    );
    window.runBalancePerformanceTests = runBalancePerformanceTests;
    window.runFrameRateTest = runFrameRateTest;
    console.log('🔬 Performance testing tools loaded!');
    console.log('Usage:');
    console.log('  runBalancePerformanceTests() - Run all performance tests');
    console.log('  runFrameRateTest() - Test frame rate impact');
  };
  console.log('💡 Type performanceTest() in console to load performance testing tools');
})();
