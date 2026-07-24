/**
 * Shared UI theme for the apocalyptic military RTS aesthetic.
 * Matches Tower Shop / Bottom Bar materials: metal, rust, caution, stencil type.
 */

export const UI_FONTS = {
  HEADER: 'Impact, Arial Black, sans-serif',
  MONO: 'Courier New, monospace',
  BODY: 'Arial, sans-serif',
} as const;

export const UI_COLORS = {
  // Metal surfaces
  METAL_DARK: 0x1a1a1a,
  METAL_PANEL: 0x2a2a2a,
  METAL_MID: 0x3a3a3a,
  METAL_FRAME: 0x4a4a4a,
  METAL_LIGHT: 0x5a5a5a,
  METAL_HIGHLIGHT: 0x6a6a6a,
  RIVET: 0x5a5a5a,
  RIVET_MID: 0x6a6a6a,
  RIVET_HIGHLIGHT: 0x8a8a8a,

  // Accents
  WARNING: 0xffcc00,
  ALERT: 0xff3333,
  DANGER: 0xaa0000,
  READY: 0x00ff00,
  READY_DIM: 0x00aa00,
  MONEY: 0x00ff00,
  LIVES: 0xff6666,
  RANGE: 0x66ccff,
  TEXT: 0xffffff,
  TEXT_DIM: 0xcccccc,
  TEXT_MUTED: 0x888888,
  OVERLAY: 0x000000,

  // Interactive
  HOVER: 0xffff00,
  SELECTED: 0x00ff00,
  PAUSED: 0xaa5500,
  PAUSED_BORDER: 0xffaa00,
  BUTTON_IDLE: 0x3a3a3a,
  BUTTON_HOVER: 0x5a5a5a,
  BUTTON_ACTIVE: 0x00aa00,
} as const;

export const UI_LAYOUT = {
  SCREEN_WIDTH: 1280,
  SCREEN_HEIGHT: 768,
  MENU_PANEL_WIDTH: 520,
  MENU_PANEL_HEIGHT: 420,
  BUTTON_WIDTH: 260,
  BUTTON_HEIGHT: 52,
  LEVEL_CARD_WIDTH: 200,
  LEVEL_CARD_HEIGHT: 88,
  TOWER_INFO_WIDTH: 220,
  TOWER_INFO_HEIGHT: 300,
  RIVET_RADIUS: 4,
} as const;
