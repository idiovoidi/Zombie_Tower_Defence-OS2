import { GameConfig } from '../../config/gameConfig';
import type { GameManager } from '../../managers/GameManager';
import type { InputManager } from '../../managers/InputManager';
import type { BottomBar } from '../../ui/BottomBar';
import type { TowerShop } from '../../ui/TowerShop';
import { DebugUtils } from '../../utils/DebugUtils';

function isActivePlayState(state: string): boolean {
  return state === GameConfig.GAME_STATES.PLAYING || state === GameConfig.GAME_STATES.WAVE_COMPLETE;
}

function trySelectTowerFromHotkey(
  key: string,
  gameManager: GameManager,
  towerShop: TowerShop,
  getTowerTypeFromKey: (hotkey: string) => string | null
): boolean {
  const towerType = getTowerTypeFromKey(key);
  if (!towerType) {
    return false;
  }

  const placementManager = gameManager.getTowerPlacementManager();
  const cost = gameManager.getTowerManager().getTowerCost(towerType);

  if (gameManager.getMoney() < cost) {
    DebugUtils.debug(`Hotkey ${key}: Cannot afford ${towerType} tower (cost: ${cost})`);
    return true;
  }

  if (placementManager.isInPlacementMode()) {
    placementManager.cancelPlacement();
    towerShop.clearSelection();
  }

  placementManager.startPlacement(towerType);
  towerShop.selectTower(towerType);
  DebugUtils.debug(`Hotkey ${key}: Selected ${towerType} tower`);
  return true;
}

function cancelTowerPlacement(gameManager: GameManager, towerShop: TowerShop): void {
  const placementManager = gameManager.getTowerPlacementManager();
  if (placementManager.isInPlacementMode()) {
    placementManager.cancelPlacement();
    towerShop.clearSelection();
  }
}

function startNextWaveIfReady(
  currentState: string,
  gameManager: GameManager,
  bottomBar: BottomBar
): void {
  if (currentState !== GameConfig.GAME_STATES.WAVE_COMPLETE) {
    return;
  }

  gameManager.startNextWave();
  bottomBar.hideNextWaveButton();
}

export function bindKeyboardInput(
  inputManager: InputManager,
  gameManager: GameManager,
  towerShop: TowerShop,
  bottomBar: BottomBar
): void {
  inputManager.onKeyDown((key, _event) => {
    const currentState = gameManager.getCurrentState();
    const isPlaying = isActivePlayState(currentState);

    import('../../config/hotkeyConfig').then(({ getTowerTypeFromKey, GAME_HOTKEYS }) => {
      if (isPlaying && trySelectTowerFromHotkey(key, gameManager, towerShop, getTowerTypeFromKey)) {
        return;
      }

      if (key === GAME_HOTKEYS['ESCAPE'].key || key === 'Escape') {
        cancelTowerPlacement(gameManager, towerShop);
        return;
      }

      if (key === GAME_HOTKEYS['SPACE'].key && isPlaying) {
        startNextWaveIfReady(currentState, gameManager, bottomBar);
      }
    });
  });
}
