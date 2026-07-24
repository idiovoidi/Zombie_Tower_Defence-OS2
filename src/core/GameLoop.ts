import type { Application } from 'pixi.js';
import { DebugConstants } from '../config/debugConstants';
import { DevConfig } from '../config/devConfig';
import { GameConfig } from '../config/gameConfig';
import type { GameManager } from '../managers/GameManager';
import type { TimeControlManager } from '../managers/TimeControlManager';
import type { UIContext } from './UISetup';

type PixelArtRenderer = InstanceType<typeof import('../utils/PixelArtRenderer').PixelArtRenderer>;

export interface GameLoopDebugHooks {
  updateRangeOverlay?: () => void;
  updateCamera?: (deltaMs: number) => void;
}

export function startGameLoop(
  app: Application,
  gameManager: GameManager,
  timeControlManager: TimeControlManager,
  ui: UIContext,
  pixelArtRenderer: PixelArtRenderer,
  debugHooks?: GameLoopDebugHooks
): void {
  let lastTime = performance.now();
  let lastDebugWave = -1;

  app.ticker.add(() => {
    const currentTime = performance.now();
    let deltaTime = currentTime - lastTime;
    lastTime = currentTime;

    const maxDeltaTime = DevConfig.PERFORMANCE.MAX_DELTA_TIME * 1000;
    if (deltaTime > maxDeltaTime) {
      console.warn(`⚠️ Delta time capped from ${deltaTime.toFixed(1)}ms to ${maxDeltaTime}ms`);
      deltaTime = maxDeltaTime;
    }

    debugHooks?.updateCamera?.(deltaTime);

    const debugSpeed =
      DebugConstants.ENABLED && DebugConstants.GAME_SPEED_MULTIPLIER > 0
        ? DebugConstants.GAME_SPEED_MULTIPLIER
        : 1;
    const timeMultiplier = timeControlManager.getTimeMultiplier() * debugSpeed;
    const scaledDeltaTime = deltaTime * timeMultiplier;

    gameManager.getAIPlayerManager().update(deltaTime / 1000);

    // Freeze gameplay while the map editor is open (opened from debug / menu).
    const uiState = ui.uiManager.getCurrentState();
    if (scaledDeltaTime > 0 && uiState !== GameConfig.GAME_STATES.MAP_EDITOR) {
      gameManager.update(scaledDeltaTime);
    }

    ui.moneyAnimation.update(deltaTime);
    ui.uiManager.update(deltaTime / 1000);

    // HUD / BottomBar / shop affordability refresh on EventBus (see bindGameHudEvents)

    if (DebugConstants.ENABLED) {
      ui.debugTestUIManager.update(deltaTime);
      const wave = gameManager.getWave();
      if (wave !== lastDebugWave) {
        lastDebugWave = wave;
        ui.debugTestUIManager.updateWaveInfo(wave);
      }
      debugHooks?.updateRangeOverlay?.();
    }

    if (pixelArtRenderer.isEnabled()) {
      pixelArtRenderer.render();
    }
  });
}
