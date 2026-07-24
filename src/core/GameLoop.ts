import type { Application } from 'pixi.js';
import { DebugConstants } from '../config/debugConstants';
import { DevConfig } from '../config/devConfig';
import { GameConfig } from '../config/gameConfig';
import type { GameManager } from '../managers/GameManager';
import type { TimeControlManager } from '../managers/TimeControlManager';
import { canAffordSelectedTower, type UIContext } from './UISetup';

type PixelArtRenderer = InstanceType<typeof import('../utils/PixelArtRenderer').PixelArtRenderer>;

export function startGameLoop(
  app: Application,
  gameManager: GameManager,
  timeControlManager: TimeControlManager,
  ui: UIContext,
  pixelArtRenderer: PixelArtRenderer
): void {
  let lastTime = performance.now();

  app.ticker.add(() => {
    const currentTime = performance.now();
    let deltaTime = currentTime - lastTime;
    lastTime = currentTime;

    const maxDeltaTime = DevConfig.PERFORMANCE.MAX_DELTA_TIME * 1000;
    if (deltaTime > maxDeltaTime) {
      console.warn(`⚠️ Delta time capped from ${deltaTime.toFixed(1)}ms to ${maxDeltaTime}ms`);
      deltaTime = maxDeltaTime;
    }

    const timeMultiplier = timeControlManager.getTimeMultiplier();
    const scaledDeltaTime = deltaTime * timeMultiplier;

    gameManager.getAIPlayerManager().update(deltaTime / 1000);

    // Freeze gameplay while the map editor is open (opened from debug / menu).
    const uiState = ui.uiManager.getCurrentState();
    if (scaledDeltaTime > 0 && uiState !== GameConfig.GAME_STATES.MAP_EDITOR) {
      gameManager.update(scaledDeltaTime);
    }

    ui.moneyAnimation.update(deltaTime);
    ui.uiManager.update(deltaTime / 1000);

    ui.hud.updateMoney(gameManager.getMoney());
    ui.hud.updateLives(gameManager.getLives());
    ui.hud.updateWave(gameManager.getWave());

    ui.bottomBar.updateMoney(gameManager.getMoney());
    ui.bottomBar.updateLives(gameManager.getLives());
    ui.bottomBar.updateWave(gameManager.getWave());

    if (DebugConstants.ENABLED) {
      ui.debugTestUIManager.update(deltaTime);
      ui.debugTestUIManager.updateWaveInfo(gameManager.getWave());
    }

    ui.towerShop.updateAffordability(gameManager.getMoney());

    const placementManager = gameManager.getTowerPlacementManager();
    if (placementManager.isInPlacementMode()) {
      const { affordable } = canAffordSelectedTower(ui.towerShop, gameManager);
      placementManager.setCanAfford(affordable);
    }

    ui.campUpgradePanel.setMoneyAvailable(gameManager.getMoney());

    if (gameManager.getCurrentState() === GameConfig.GAME_STATES.WAVE_COMPLETE) {
      ui.hud.showNextWaveButton();
      ui.bottomBar.showNextWaveButton();
    } else {
      ui.hud.hideNextWaveButton();
      ui.bottomBar.hideNextWaveButton();
    }

    if (pixelArtRenderer.isEnabled()) {
      pixelArtRenderer.render();
    }
  });
}
