import type { Application } from 'pixi.js';
import { DebugConstants } from '../config/debugConstants';
import { GameConfig } from '../config/gameConfig';
import { customMapStore, syncCustomMapsToManagers } from '../customMaps';
import { CampUpgradeManager } from '../managers/CampUpgradeManager';
import { DebugTestUIManager } from '../managers/DebugTestUIManager';
import type { GameManager } from '../managers/GameManager';
import type { TimeControlManager } from '../managers/TimeControlManager';
import { BottomBar } from '../ui/BottomBar';
import { CampUpgradePanel } from '../ui/CampUpgradePanel';
import { DebugInfoPanel } from '../ui/DebugInfoPanel';
import { GameOverScreen } from '../ui/GameOverScreen';
import { HUD } from '../ui/HUD';
import { LevelSelectMenu } from '../ui/LevelSelectMenu';
import { MainMenu } from '../ui/MainMenu';
import { MapEditorScreen } from '../ui/MapEditorScreen';
import { MoneyAnimation } from '../ui/MoneyAnimation';
import { TimeControlUI } from '../ui/TimeControlUI';
import { TowerInfoPanel } from '../ui/TowerInfoPanel';
import { TowerShop } from '../ui/TowerShop';
import { UIManager } from '../ui/UIManager';
import { DebugUtils } from '../utils/DebugUtils';
import { VisualEffects } from '../utils/VisualEffects';

export interface UIContext {
  uiManager: UIManager;
  hud: HUD;
  bottomBar: BottomBar;
  towerShop: TowerShop;
  towerInfoPanel: TowerInfoPanel;
  campUpgradePanel: CampUpgradePanel;
  moneyAnimation: MoneyAnimation;
  debugTestUIManager: DebugTestUIManager;
  timeControlUI: TimeControlUI;
  gameOverScreen: GameOverScreen;
  mainMenu: MainMenu;
  levelSelectMenu: LevelSelectMenu;
  mapEditorScreen: MapEditorScreen;
  debugInfoPanel: DebugInfoPanel;
}

export function createUI(
  app: Application,
  gameManager: GameManager,
  timeControlManager: TimeControlManager
): UIContext {
  const uiManager = new UIManager(app);

  const hud = new HUD();
  uiManager.registerComponent('hud', hud);

  const screenWidth = GameConfig.SCREEN_WIDTH;
  const screenHeight = GameConfig.SCREEN_HEIGHT;
  const shopWidth = GameConfig.UI_SHOP_WIDTH;
  const bottomBarHeight = GameConfig.UI_BOTTOM_BAR_HEIGHT;

  const bottomBarWidth = screenWidth - shopWidth;
  const bottomBar = new BottomBar(bottomBarWidth);
  bottomBar.position.set(0, screenHeight - bottomBarHeight);
  uiManager.registerComponent('bottomBar', bottomBar);

  const mainMenu = new MainMenu();
  uiManager.registerComponent('mainMenu', mainMenu);

  const levelSelectMenu = new LevelSelectMenu();
  uiManager.registerComponent('levelSelectMenu', levelSelectMenu);

  const mapEditorScreen = new MapEditorScreen();
  uiManager.registerComponent('mapEditorScreen', mapEditorScreen);
  mapEditorScreen.hide();

  const gameOverScreen = new GameOverScreen();
  uiManager.registerComponent('gameOverScreen', gameOverScreen);

  const towerShop = new TowerShop();
  towerShop.position.set(screenWidth - shopWidth, 0);
  uiManager.registerComponent('towerShop', towerShop);

  const towerInfoPanel = new TowerInfoPanel();
  const towerInfoPanelHeight = 300;
  towerInfoPanel.position.set(screenWidth - shopWidth, screenHeight - towerInfoPanelHeight);
  uiManager.registerComponent('towerInfoPanel', towerInfoPanel);

  const timeControlUI = new TimeControlUI(timeControlManager);
  const timeControlWidth = timeControlUI.getControlWidth();
  timeControlUI.position.set(screenWidth - shopWidth - timeControlWidth - 10, 10);
  uiManager.registerComponent('timeControlUI', timeControlUI);

  const debugTestUIManager = new DebugTestUIManager(app);
  debugTestUIManager.initialize(gameManager, gameManager.getWaveManager());

  debugTestUIManager.setZombieSpawnCallback((type: string) => {
    DebugUtils.debug(`🧟 Spawning test zombie: ${type}`);
    gameManager.getZombieManager().spawnZombieType(type);
  });

  const debugInfoPanel = new DebugInfoPanel();
  debugInfoPanel.position.set(screenWidth - 20, screenHeight - 48);
  uiManager.registerComponent('debugInfoPanel', debugInfoPanel);
  app.stage.addChild(debugInfoPanel.getContentContainer());

  debugInfoPanel.setStatsCallback(() => debugTestUIManager.openStatsPanel());
  debugInfoPanel.setWaveInfoCallback(() => debugTestUIManager.openWaveInfoPanel());
  debugInfoPanel.setBestiaryCallback(() => debugTestUIManager.openBestiaryPanel());
  debugInfoPanel.setAIControlCallback(() => debugTestUIManager.openAIControlPanel());
  debugInfoPanel.setProgressToNextLevelCallback(() => debugTestUIManager.progressToNextLevel());

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

  const campUpgradeManager = new CampUpgradeManager();
  const campUpgradePanel = new CampUpgradePanel();
  campUpgradePanel.setCampUpgradeManager(campUpgradeManager);
  uiManager.registerComponent('campUpgradePanel', campUpgradePanel);
  campUpgradePanel.hide();

  campUpgradePanel.setUpgradeCallback((upgradeId: string, cost: number) => {
    if (gameManager.getMoney() >= cost) {
      gameManager.spendMoney(cost);
      DebugUtils.debug(`Purchased camp upgrade: ${upgradeId} for $${cost}`);
      return true;
    }
    DebugUtils.debug('Not enough money for camp upgrade');
    return false;
  });

  const moneyAnimation = new MoneyAnimation(app.stage);

  gameManager.setMoneyGainCallback((amount: number) => {
    moneyAnimation.showMoneyGain(amount);
  });

  gameManager.setDamageFlashCallback(() => {
    VisualEffects.createDamageFlash(app.stage, GameConfig.SCREEN_WIDTH, GameConfig.SCREEN_HEIGHT);
  });

  gameManager.setGameOverCallback((score: number) => {
    gameOverScreen.showGameOver(score);
    uiManager.setState(GameConfig.GAME_STATES.GAME_OVER);
  });

  // Event handlers
  const refreshLevelSelect = (): void => {
    syncCustomMapsToManagers(customMapStore.list(), {
      mapManager: gameManager.getMapManager(),
      levelManager: gameManager.getLevelManager(),
    });
    levelSelectMenu.updateLevels(gameManager.getAvailableLevels());
  };

  mainMenu.setStartCallback(() => {
    DebugUtils.debug('Starting game from main menu');
    uiManager.setState(GameConfig.GAME_STATES.LEVEL_SELECT);
    refreshLevelSelect();
  });

  mainMenu.setMapCreatorCallback(() => {
    DebugUtils.debug('Opening map creator');
    mapEditorScreen.newDocument();
    uiManager.setState(GameConfig.GAME_STATES.MAP_EDITOR);
  });

  mapEditorScreen.setBackCallback(() => {
    uiManager.setState(GameConfig.GAME_STATES.MAIN_MENU);
  });

  mapEditorScreen.setDefaultWaveProvider(wave =>
    gameManager.getWaveManager().getDefaultWaveZombies(wave)
  );

  mapEditorScreen.setPlayCallback(doc => {
    DebugUtils.debug(`Playing custom map: ${doc.name}`);
    gameManager.startCustomMap(doc);
    uiManager.setState(gameManager.getCurrentState());
    setupCampClickCallback(gameManager, campUpgradePanel);
  });

  levelSelectMenu.setLevelSelectCallback((levelId: string) => {
    DebugUtils.debug(`Loading level: ${levelId}`);
    if (levelId.startsWith('custom_')) {
      const docId = levelId.slice('custom_'.length);
      const doc = customMapStore.get(docId);
      if (!doc) {
        DebugUtils.debug(`Custom map not found: ${docId}`);
        return;
      }
      gameManager.startCustomMap(doc);
    } else {
      gameManager.startGameWithLevel(levelId);
    }
    uiManager.setState(gameManager.getCurrentState());
    setupCampClickCallback(gameManager, campUpgradePanel);
  });

  levelSelectMenu.setBackCallback(() => {
    DebugUtils.debug('Returning to main menu');
    uiManager.setState(GameConfig.GAME_STATES.MAIN_MENU);
  });

  gameOverScreen.setRestartCallback(() => {
    DebugUtils.debug('Restarting game');
    const currentLevel = gameManager.getCurrentLevel();
    if (currentLevel) {
      if (currentLevel.id.startsWith('custom_')) {
        const docId = currentLevel.id.slice('custom_'.length);
        const doc = customMapStore.get(docId);
        if (doc) {
          gameManager.startCustomMap(doc);
        } else {
          gameManager.startGameWithLevel(currentLevel.id);
        }
      } else {
        gameManager.startGameWithLevel(currentLevel.id);
      }
      uiManager.setState(gameManager.getCurrentState());
      setupCampClickCallback(gameManager, campUpgradePanel);
    }
  });

  gameOverScreen.setMainMenuCallback(() => {
    DebugUtils.debug('Returning to main menu from game over');
    uiManager.setState(GameConfig.GAME_STATES.MAIN_MENU);
  });

  // Next wave callbacks
  hud.setNextWaveCallback(createNextWaveCallback(hud, gameManager));
  bottomBar.setNextWaveCallback(createNextWaveCallback(bottomBar, gameManager));

  // Tower shop callbacks
  towerShop.setTowerSelectCallback((type: string) => {
    DebugUtils.debug(`Tower selected: ${type}`);
    const placementManager = gameManager.getTowerPlacementManager();
    placementManager.startPlacement(type);
    timeControlManager.startPlacement(true);
  });

  // Tower placement callbacks
  const placementManager = gameManager.getTowerPlacementManager();

  placementManager.setTowerSelectedCallback(tower => {
    if (tower) {
      towerInfoPanel.showTowerInfo(tower);
    } else {
      towerInfoPanel.hide();
    }
  });

  // Tower info panel callbacks
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
      if (gameManager.isBalanceTrackingEnabled()) {
        gameManager.getBalanceTrackingManager().trackTowerSold(towerType, sellValue);
      }
      towerInfoPanel.hide();
      DebugUtils.debug(`Tower sold for $${sellValue}`);
    }
  });

  return {
    uiManager,
    hud,
    bottomBar,
    towerShop,
    towerInfoPanel,
    campUpgradePanel,
    moneyAnimation,
    debugTestUIManager,
    timeControlUI,
    gameOverScreen,
    mainMenu,
    levelSelectMenu,
    mapEditorScreen,
    debugInfoPanel,
  };
}

function createNextWaveCallback(
  uiComponent: { hideNextWaveButton: () => void },
  gameManager: GameManager
): () => void {
  return () => {
    DebugUtils.debug('Starting next wave');
    gameManager.startNextWave();
    uiComponent.hideNextWaveButton();
  };
}

export function setupCampClickCallback(
  gameManager: GameManager,
  campUpgradePanel: CampUpgradePanel
): void {
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
}

export function canAffordSelectedTower(
  towerShop: TowerShop,
  gameManager: GameManager
): { affordable: boolean; cost: number; selectedType: string | null } {
  const selectedType = towerShop.getSelectedTowerType();
  if (!selectedType) {
    return { affordable: false, cost: 0, selectedType: null };
  }
  const cost = gameManager.getTowerManager().getTowerCost(selectedType);
  return { affordable: gameManager.getMoney() >= cost, cost, selectedType };
}
