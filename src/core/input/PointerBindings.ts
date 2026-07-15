import { GameConfig } from '../../config/gameConfig';
import type { GameManager } from '../../managers/GameManager';
import type { InputManager } from '../../managers/InputManager';
import type { TimeControlManager } from '../../managers/TimeControlManager';
import type { TowerShop } from '../../ui/TowerShop';
import { DebugUtils } from '../../utils/DebugUtils';
import { canAffordSelectedTower } from '../UISetup';

function isActivePlayState(state: string): boolean {
  return state === GameConfig.GAME_STATES.PLAYING || state === GameConfig.GAME_STATES.WAVE_COMPLETE;
}

export function bindPointerInput(
  inputManager: InputManager,
  gameManager: GameManager,
  timeControlManager: TimeControlManager,
  towerShop: TowerShop
): void {
  inputManager.onPointerDown((coords, event) => {
    if (event.defaultPrevented || !isActivePlayState(gameManager.getCurrentState())) {
      return;
    }

    const placementManager = gameManager.getTowerPlacementManager();

    if (!placementManager.isInPlacementMode()) {
      placementManager.selectTower(null);
      return;
    }

    const { affordable, cost, selectedType } = canAffordSelectedTower(towerShop, gameManager);
    if (!selectedType) {
      return;
    }

    const pos = coords.game;
    if (affordable) {
      const tower = placementManager.placeTower(pos.x, pos.y);
      if (tower) {
        gameManager.getStatTracker().trackTowerBuilt(selectedType, cost);
        towerShop.clearSelection();
        timeControlManager.endPlacement();
      }
      return;
    }

    DebugUtils.debug('Not enough money to place tower');
    placementManager.cancelPlacement();
    towerShop.clearSelection();
    timeControlManager.endPlacement();
  });

  inputManager.onPointerMove(coords => {
    if (!isActivePlayState(gameManager.getCurrentState())) {
      return;
    }

    const placementManager = gameManager.getTowerPlacementManager();
    if (placementManager.isInPlacementMode()) {
      placementManager.updateGhostPosition(coords.game.x, coords.game.y);
    }
  });

  inputManager.onRightClick(() => {
    const placementManager = gameManager.getTowerPlacementManager();
    if (!placementManager.isInPlacementMode()) {
      return;
    }

    placementManager.cancelPlacement();
    towerShop.clearSelection();
    timeControlManager.endPlacement();
  });
}
