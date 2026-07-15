import type { GameManager } from '../managers/GameManager';
import type { InputManager } from '../managers/InputManager';
import type { TimeControlManager } from '../managers/TimeControlManager';
import type { BottomBar } from '../ui/BottomBar';
import type { TowerShop } from '../ui/TowerShop';
import { bindKeyboardInput } from './input/KeyboardBindings';
import { bindPointerInput } from './input/PointerBindings';

export function bindInput(
  inputManager: InputManager,
  gameManager: GameManager,
  timeControlManager: TimeControlManager,
  towerShop: TowerShop,
  bottomBar: BottomBar
): void {
  bindPointerInput(inputManager, gameManager, timeControlManager, towerShop);
  bindKeyboardInput(inputManager, gameManager, towerShop, bottomBar);
}
