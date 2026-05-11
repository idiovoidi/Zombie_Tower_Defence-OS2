import { GameConfig } from '../config/gameConfig';
import type { GameManager } from '../managers/GameManager';
import type { InputManager } from '../managers/InputManager';
import type { TimeControlManager } from '../managers/TimeControlManager';
import type { BottomBar } from '../ui/BottomBar';
import type { TowerShop } from '../ui/TowerShop';
import { DebugUtils } from '../utils/DebugUtils';

export function bindInput(
  inputManager: InputManager,
  gameManager: GameManager,
  timeControlManager: TimeControlManager,
  towerShop: TowerShop,
  bottomBar: BottomBar
): void {
  // Helper to check if player can afford selected tower
  const canAffordSelectedTower = (): {
    affordable: boolean;
    cost: number;
    selectedType: string | null;
  } => {
    const selectedType = towerShop.getSelectedTowerType();
    if (!selectedType) {
      return { affordable: false, cost: 0, selectedType: null };
    }
    const cost = gameManager.getTowerManager().getTowerCost(selectedType);
    return { affordable: gameManager.getMoney() >= cost, cost, selectedType };
  };

  inputManager.onPointerDown((coords, event) => {
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
        const pos = coords.game;
        const { affordable, selectedType } = canAffordSelectedTower();
        if (selectedType) {
          if (affordable) {
            const tower = placementManager.placeTower(pos.x, pos.y);
            if (tower) {
              gameManager
                .getStatTracker()
                .trackTowerBuilt(
                  selectedType,
                  gameManager.getTowerManager().getTowerCost(selectedType)
                );
              towerShop.clearSelection();
              timeControlManager.endPlacement();
            }
          } else {
            DebugUtils.debug('Not enough money to place tower');
            placementManager.cancelPlacement();
            towerShop.clearSelection();
            timeControlManager.endPlacement();
          }
        }
      } else {
        placementManager.selectTower(null);
      }
    }
  });

  inputManager.onPointerMove(coords => {
    const currentState = gameManager.getCurrentState();
    if (
      currentState === GameConfig.GAME_STATES.PLAYING ||
      currentState === GameConfig.GAME_STATES.WAVE_COMPLETE
    ) {
      const placementManager = gameManager.getTowerPlacementManager();
      if (placementManager.isInPlacementMode()) {
        placementManager.updateGhostPosition(coords.game.x, coords.game.y);
      }
    }
  });

  inputManager.onRightClick(() => {
    const placementManager = gameManager.getTowerPlacementManager();
    if (placementManager.isInPlacementMode()) {
      placementManager.cancelPlacement();
      towerShop.clearSelection();
      timeControlManager.endPlacement();
    }
  });

  inputManager.onKeyDown((key, _event) => {
    const currentState = gameManager.getCurrentState();
    const isPlaying =
      currentState === GameConfig.GAME_STATES.PLAYING ||
      currentState === GameConfig.GAME_STATES.WAVE_COMPLETE;

    import('../config/hotkeyConfig').then(({ getTowerTypeFromKey, GAME_HOTKEYS }) => {
      if (isPlaying) {
        const towerType = getTowerTypeFromKey(key);
        if (towerType) {
          const placementManager = gameManager.getTowerPlacementManager();
          const cost = gameManager.getTowerManager().getTowerCost(towerType);

          if (gameManager.getMoney() >= cost) {
            if (placementManager.isInPlacementMode()) {
              placementManager.cancelPlacement();
              towerShop.clearSelection();
            }
            placementManager.startPlacement(towerType);
            towerShop.selectTower(towerType);
            DebugUtils.debug(`Hotkey ${key}: Selected ${towerType} tower`);
          } else {
            DebugUtils.debug(`Hotkey ${key}: Cannot afford ${towerType} tower (cost: ${cost})`);
          }
          return;
        }
      }

      if (key === GAME_HOTKEYS['ESCAPE'].key || key === 'Escape') {
        const placementManager = gameManager.getTowerPlacementManager();
        if (placementManager.isInPlacementMode()) {
          placementManager.cancelPlacement();
          towerShop.clearSelection();
        }
      }

      if (key === GAME_HOTKEYS['SPACE'].key && isPlaying) {
        if (currentState === GameConfig.GAME_STATES.WAVE_COMPLETE) {
          gameManager.startNextWave();
          bottomBar.hideNextWaveButton();
        }
      }
    });
  });
}
