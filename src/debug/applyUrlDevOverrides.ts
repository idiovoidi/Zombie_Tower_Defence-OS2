import { DebugConstants } from '../config/debugConstants';
import { DevConfig } from '../config/devConfig';
import { DebugUtils } from '../utils/DebugUtils';

/**
 * Apply URL query overrides onto DebugConstants / DevConfig at boot.
 * Lets you change common presets without editing source or waiting on HMR edge cases.
 *
 * Examples:
 *   ?wave=10&money=99999
 *   ?waypoints=1&ranges=1
 *   ?god=1&ohk=1
 *   ?skipMenu=0&level=level3
 *   ?speed=2&debug=0
 */
export function applyUrlDevOverrides(
  search = typeof window !== 'undefined' ? window.location.search : ''
): void {
  const normalized = search.startsWith('?') || search === '' ? search : `?${search}`;
  const params = new URLSearchParams(normalized);
  if ([...params.keys()].length === 0) {
    return;
  }

  const applied: string[] = [];

  const boolParam = (key: string): boolean | undefined => {
    if (!params.has(key)) {
      return undefined;
    }
    const raw = (params.get(key) ?? '1').toLowerCase();
    return !(raw === '0' || raw === 'false' || raw === 'off' || raw === 'no');
  };

  const numParam = (key: string): number | undefined => {
    if (!params.has(key)) {
      return undefined;
    }
    const n = Number(params.get(key));
    return Number.isFinite(n) ? n : undefined;
  };

  const strParam = (key: string): string | undefined => {
    const v = params.get(key);
    return v === null || v === '' ? undefined : v;
  };

  const debug = boolParam('debug');
  if (debug !== undefined) {
    DebugConstants.ENABLED = debug;
    DevConfig.DEBUG.ENABLED = debug;
    applied.push(`debug=${debug}`);
  }

  const wave = numParam('wave');
  if (wave !== undefined && wave >= 1) {
    DebugConstants.START_AT_WAVE = Math.floor(wave);
    applied.push(`wave=${DebugConstants.START_AT_WAVE}`);
  }

  const money = numParam('money');
  if (money !== undefined && money >= 0) {
    DebugConstants.STARTING_MONEY = Math.floor(money);
    applied.push(`money=${DebugConstants.STARTING_MONEY}`);
  }

  const lives = numParam('lives');
  if (lives !== undefined && lives >= 0) {
    DebugConstants.STARTING_LIVES = Math.floor(lives);
    applied.push(`lives=${DebugConstants.STARTING_LIVES}`);
  }

  const speed = numParam('speed');
  if (speed !== undefined && speed > 0) {
    DebugConstants.GAME_SPEED_MULTIPLIER = speed;
    applied.push(`speed=${speed}`);
  }

  const waypoints = boolParam('waypoints');
  if (waypoints !== undefined) {
    DebugConstants.SHOW_WAYPOINTS = waypoints;
    applied.push(`waypoints=${waypoints}`);
  }

  const ranges = boolParam('ranges');
  if (ranges !== undefined) {
    DebugConstants.SHOW_TOWER_RANGES = ranges;
    applied.push(`ranges=${ranges}`);
  }

  const healthBars = boolParam('healthBars');
  if (healthBars !== undefined) {
    DebugConstants.SHOW_ZOMBIE_HEALTH_BARS = healthBars;
    applied.push(`healthBars=${healthBars}`);
  }

  const god = boolParam('god');
  if (god !== undefined) {
    DebugConstants.DISABLE_GAME_OVER = god;
    applied.push(`god=${god}`);
  }

  const ohk = boolParam('ohk');
  if (ohk !== undefined) {
    DebugConstants.ONE_HIT_KILL = ohk;
    applied.push(`ohk=${ohk}`);
  }

  const skipMenu = boolParam('skipMenu');
  if (skipMenu !== undefined) {
    DevConfig.TESTING.SKIP_MENU = skipMenu;
    DevConfig.TESTING.AUTO_START_GAME = skipMenu;
    applied.push(`skipMenu=${skipMenu}`);
  }

  const level = strParam('level');
  if (level !== undefined) {
    DevConfig.TESTING.DEFAULT_LEVEL = level;
    applied.push(`level=${level}`);
  }

  if (applied.length > 0) {
    DebugUtils.info(`🛠️ URL dev overrides: ${applied.join(', ')}`);
  }
}
