/**
 * Hotkey Configuration
 *
 * Centralized hotkey bindings for easy customization and rebinding.
 * All keyboard shortcuts are defined here for consistency.
 */

import { GameConfig } from './gameConfig';

export interface HotkeyBinding {
  key: string;
  description: string;
  category: 'tower' | 'game' | 'ui' | 'debug';
}

export interface TowerHotkey extends HotkeyBinding {
  towerType: string;
  category: 'tower';
}

/**
 * Tower placement hotkeys
 * Maps keyboard keys to tower types for quick placement
 */
export const TOWER_HOTKEYS: Record<string, TowerHotkey> = {
  '1': {
    key: '1',
    towerType: GameConfig.TOWER_TYPES.MACHINE_GUN,
    description: 'Machine Gun Tower',
    category: 'tower',
  },
  '2': {
    key: '2',
    towerType: GameConfig.TOWER_TYPES.SNIPER,
    description: 'Sniper Tower',
    category: 'tower',
  },
  '3': {
    key: '3',
    towerType: GameConfig.TOWER_TYPES.SHOTGUN,
    description: 'Shotgun Tower',
    category: 'tower',
  },
  '4': {
    key: '4',
    towerType: GameConfig.TOWER_TYPES.FLAME,
    description: 'Flame Tower',
    category: 'tower',
  },
  '5': {
    key: '5',
    towerType: GameConfig.TOWER_TYPES.GRENADE,
    description: 'Grenade Tower',
    category: 'tower',
  },
  '6': {
    key: '6',
    towerType: GameConfig.TOWER_TYPES.TESLA,
    description: 'Tesla Tower',
    category: 'tower',
  },
  '7': {
    key: '7',
    towerType: GameConfig.TOWER_TYPES.SLUDGE,
    description: 'Sludge Tower',
    category: 'tower',
  },
};

/**
 * Game control hotkeys
 */
export const GAME_HOTKEYS: Record<string, HotkeyBinding> = {
  SPACE: {
    key: ' ',
    description: 'Start Next Wave',
    category: 'game',
  },
  ESCAPE: {
    key: 'Escape',
    description: 'Cancel Tower Placement / Pause',
    category: 'game',
  },
  P: {
    key: 'P',
    description: 'Pause Game',
    category: 'game',
  },
};

/**
 * UI control hotkeys
 */
export const UI_HOTKEYS: Record<string, HotkeyBinding> = {
  TAB: {
    key: 'Tab',
    description: 'Toggle Tower Shop',
    category: 'ui',
  },
  I: {
    key: 'I',
    description: 'Toggle Tower Info',
    category: 'ui',
  },
  U: {
    key: 'U',
    description: 'Toggle Upgrade Panel',
    category: 'ui',
  },
};

/**
 * Debug hotkeys (only active in debug mode)
 */
export const DEBUG_HOTKEYS: Record<string, HotkeyBinding> = {
  D: {
    key: 'D',
    description: 'Toggle Debug Info',
    category: 'debug',
  },
  R: {
    key: 'R',
    description: 'Toggle Range Visualization',
    category: 'debug',
  },
};

/**
 * Get tower type from key press
 * @param key The key that was pressed
 * @returns Tower type or null if no binding exists
 */
export function getTowerTypeFromKey(key: string): string | null {
  const hotkey = TOWER_HOTKEYS[key];
  return hotkey ? hotkey.towerType : null;
}

/**
 * Get all tower hotkeys as an array for display
 */
export function getTowerHotkeyList(): TowerHotkey[] {
  return Object.values(TOWER_HOTKEYS);
}

/**
 * Get hotkey for a specific tower type
 * @param towerType The tower type to find hotkey for
 * @returns Hotkey binding or null if no binding exists
 */
export function getHotkeyForTowerType(towerType: string): TowerHotkey | null {
  for (const hotkey of Object.values(TOWER_HOTKEYS)) {
    if (hotkey.towerType === towerType) {
      return hotkey;
    }
  }
  return null;
}

/**
 * Check if a key is bound to a tower
 * @param key The key to check
 * @returns True if key is bound to a tower
 */
export function isTowerHotkey(key: string): boolean {
  return getTowerTypeFromKey(key) !== null;
}

/**
 * Get all hotkeys grouped by category
 */
export function getAllHotkeys(): {
  tower: TowerHotkey[];
  game: HotkeyBinding[];
  ui: HotkeyBinding[];
  debug: HotkeyBinding[];
} {
  return {
    tower: Object.values(TOWER_HOTKEYS),
    game: Object.values(GAME_HOTKEYS),
    ui: Object.values(UI_HOTKEYS),
    debug: Object.values(DEBUG_HOTKEYS),
  };
}

/**
 * Format hotkey for display
 * @param key The key to format
 * @returns Formatted key string
 */
export function formatHotkey(key: string): string {
  // Special key formatting
  const specialKeys: Record<string, string> = {
    ' ': 'Space',
    Escape: 'Esc',
    Control: 'Ctrl',
    Shift: 'Shift',
    Alt: 'Alt',
    Tab: 'Tab',
  };

  return specialKeys[key] || key.toUpperCase();
}
