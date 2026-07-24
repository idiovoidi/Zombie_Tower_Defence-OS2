import { afterEach, describe, expect, it } from 'vitest';
import { DebugConstants } from '../../src/config/debugConstants';
import { DevConfig } from '../../src/config/devConfig';
import { applyUrlDevOverrides } from '../../src/debug/applyUrlDevOverrides';
import { debugMul, debugMulFloor } from '../../src/debug/debugScale';

describe('debugScale', () => {
  const originalEnabled = DebugConstants.ENABLED;

  afterEach(() => {
    DebugConstants.ENABLED = originalEnabled;
  });

  it('passes through when debug disabled', () => {
    DebugConstants.ENABLED = false;
    expect(debugMul(100, 0.5)).toBe(100);
    expect(debugMulFloor(100, 0.5)).toBe(100);
  });

  it('applies multiplier when debug enabled', () => {
    DebugConstants.ENABLED = true;
    expect(debugMul(100, 0.5)).toBe(50);
    expect(debugMulFloor(10, 0.3)).toBe(3);
  });
});

describe('applyUrlDevOverrides', () => {
  const snapshot = {
    ENABLED: DebugConstants.ENABLED,
    START_AT_WAVE: DebugConstants.START_AT_WAVE,
    STARTING_MONEY: DebugConstants.STARTING_MONEY,
    SHOW_WAYPOINTS: DebugConstants.SHOW_WAYPOINTS,
    DISABLE_GAME_OVER: DebugConstants.DISABLE_GAME_OVER,
    SKIP_MENU: DevConfig.TESTING.SKIP_MENU,
    AUTO_START: DevConfig.TESTING.AUTO_START_GAME,
    DEFAULT_LEVEL: DevConfig.TESTING.DEFAULT_LEVEL,
  };

  afterEach(() => {
    DebugConstants.ENABLED = snapshot.ENABLED;
    DebugConstants.START_AT_WAVE = snapshot.START_AT_WAVE;
    DebugConstants.STARTING_MONEY = snapshot.STARTING_MONEY;
    DebugConstants.SHOW_WAYPOINTS = snapshot.SHOW_WAYPOINTS;
    DebugConstants.DISABLE_GAME_OVER = snapshot.DISABLE_GAME_OVER;
    DevConfig.TESTING.SKIP_MENU = snapshot.SKIP_MENU;
    DevConfig.TESTING.AUTO_START_GAME = snapshot.AUTO_START;
    DevConfig.TESTING.DEFAULT_LEVEL = snapshot.DEFAULT_LEVEL;
  });

  it('applies common query overrides', () => {
    applyUrlDevOverrides('?wave=12&money=7777&waypoints=1&god=1&level=level3');

    expect(DebugConstants.START_AT_WAVE).toBe(12);
    expect(DebugConstants.STARTING_MONEY).toBe(7777);
    expect(DebugConstants.SHOW_WAYPOINTS).toBe(true);
    expect(DebugConstants.DISABLE_GAME_OVER).toBe(true);
    expect(DevConfig.TESTING.DEFAULT_LEVEL).toBe('level3');
  });

  it('treats 0 as false for boolean flags', () => {
    applyUrlDevOverrides('?skipMenu=0&waypoints=0');

    expect(DevConfig.TESTING.SKIP_MENU).toBe(false);
    expect(DevConfig.TESTING.AUTO_START_GAME).toBe(false);
    expect(DebugConstants.SHOW_WAYPOINTS).toBe(false);
  });
});
