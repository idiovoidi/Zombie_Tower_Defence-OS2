import { DebugConstants } from '../config/debugConstants';
import { GameConfig } from '../config/gameConfig';
import type { GameManager } from '../managers/GameManager';
import type { InputManager } from '../managers/InputManager';
import type { Tower } from '../objects/Tower';
import { DebugUtils } from '../utils/DebugUtils';
import type { ScaleManager } from '../utils/ScaleManager';

export function bindDebugHotkeys(
  inputManager: InputManager,
  gameManager: GameManager,
  scaleManager: ScaleManager
): void {
  // Toggle debug mode (Ctrl+D)
  window.addEventListener('keydown', event => {
    if (event.key.toLowerCase() === 'd' && event.ctrlKey) {
      const currentDebug = !inputManager.isDebugMode();
      inputManager.setDebugMode(currentDebug);
      DebugUtils.debug(`🔧 Debug mode ${currentDebug ? 'enabled' : 'disabled'}:`, scaleManager.getDebugInfo());
    }
  });

  // Debug hotkeys (only work when debug mode is enabled)
  inputManager.onKeyDown((_key, event) => {
    if (!DebugConstants.ENABLED) return;

    const key = event.key.toLowerCase();

    // M - Add money
    if (key === 'm') {
      const amount = event.shiftKey ? 20000 : 5000;
      gameManager.addMoney(amount);
      DebugUtils.debug(`💰 Added $${amount} (Total: $${gameManager.getMoney()})`);
    }

    // L - Add lives
    if (key === 'l') {
      const amount = event.shiftKey ? 100 : 10;
      gameManager.addLives(amount);
      DebugUtils.debug(`❤️ Added ${amount} lives (Total: ${gameManager.getLives()})`);
    }

    // N - Skip to next wave
    if (key === 'n') {
      if (gameManager.getCurrentState() === GameConfig.GAME_STATES.WAVE_COMPLETE) {
        gameManager.startNextWave();
        DebugUtils.debug('🌊 Started next wave');
      } else {
        DebugUtils.debug('⚠️ Can only skip to next wave during wave complete state');
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
      DebugUtils.debug(`💀 Killed ${killed} zombies`);
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
      DebugUtils.debug(`⬆️ Upgraded ${upgraded} tower levels`);
    }

    // H - Show debug help
    if (key === 'h') {
      DebugUtils.debug('🔧 Debug Hotkeys:');
      DebugUtils.debug('  M - Add $1000 (Shift+M for $10000)');
      DebugUtils.debug('  L - Add 10 lives (Shift+L for 100)');
      DebugUtils.debug('  N - Skip to next wave');
      DebugUtils.debug('  K - Kill all zombies');
      DebugUtils.debug('  U - Upgrade all towers to max');
      DebugUtils.debug('  H - Show this help');
    }
  });
}
