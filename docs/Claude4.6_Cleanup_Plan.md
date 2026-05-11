Decompose main.ts into Focused, Testable Modules
The 803-line main.ts IIFE handles application bootstrapping, UI construction, input wiring, game-loop orchestration, debug hotkeys, and window namespace pollution — all in one function. This plan decomposes it into 6 single-responsibility modules that can be tested, swapped, and maintained independently.

Proposed Architecture
main.ts (~40 lines)
Application.ts — PixiJS app bootstrap
UISetup.ts — UI construction & registration
InputBindings.ts — pointer/keyboard → game actions
GameLoop.ts — ticker update orchestration
DebugConsole.ts — window.* debug APIs
DebugHotkeys.ts — Ctrl+D, M, L, N, K, U, H keys
UIManager
TowerShop
BottomBar
InputManager
TowerPlacementManager
GameManager
TimeControlManager
LogExporter
PerformanceMonitor
Proposed Changes
Core Bootstrapping
[NEW] 
Application.ts
Creates and initialises the PixiJS Application, enables the culler plugin, appends the canvas, and creates the PixelArtRenderer + ScaleManager. Exports a factory function:

ts
export interface AppContext {
  app: Application;
  pixelArtRenderer: PixelArtRenderer;
  scaleManager: ScaleManager;
}
export async function createApp(): Promise<AppContext> { … }
Covers lines 28-64 of the current main.ts.

UI Wiring
[NEW] 
UISetup.ts
Pure function that creates every UI component, registers them with UIManager, and wires up inter-UI callbacks (menu → level select, game over → restart, tower shop → placement, tower info → upgrade/sell, camp upgrades, money animation, debug info panel buttons, etc.).

ts
export interface UIContext {
  uiManager: UIManager;
  hud: HUD;
  bottomBar: BottomBar;
  towerShop: TowerShop;
  towerInfoPanel: TowerInfoPanel;
  campUpgradePanel: CampUpgradePanel;
  moneyAnimation: MoneyAnimation;
  debugTestUIManager: DebugTestUIManager;
  timeControlUI: TimeControlUI;
  gameOverScreen: GameOverScreen;
}
export function createUI(
  app: Application,
  gameManager: GameManager,
  timeControlManager: TimeControlManager,
  pixelArtRenderer: PixelArtRenderer,
): UIContext { … }
Covers lines 94-284 of the current main.ts. All the callback wiring between UI components stays self-contained here, but is now testable by injecting mock managers.

Input Bindings
[NEW] 
InputBindings.ts
Registers onPointerDown, onPointerMove, onRightClick, and onKeyDown handlers. The gameplay input logic (tower placement, affordability checks, wave start, escape) and the hotkey-config dynamic import all live here.

ts
export function bindInput(
  inputManager: InputManager,
  gameManager: GameManager,
  timeControlManager: TimeControlManager,
  towerShop: TowerShop,
  bottomBar: BottomBar,
): void { … }
Covers lines 286-575 of the current main.ts.

Game Loop
[NEW] 
GameLoop.ts
Contains the app.ticker.add(…) callback. Accepts all the objects it needs to update and keeps the frame update logic in one place.

ts
export function startGameLoop(
  app: Application,
  gameManager: GameManager,
  timeControlManager: TimeControlManager,
  ui: UIContext,
  pixelArtRenderer: PixelArtRenderer,
): void { … }
Covers lines 591-668 of the current main.ts.

Debug Console APIs
[NEW] 
DebugConsole.ts
All window.* property assignments (LogExporter, balanceTracking, waveBalance, performanceTest, debugPerformance, debugCleanup, debugToggleMonitoring, timeControl) and their console.log help text.

Also contains the Window interface augmentation that currently doesn't exist (the window assignments are currently untyped).

ts
/** Call once after bootstrap to register all debug console APIs */
export async function registerDebugConsoleAPIs(
  gameManager: GameManager,
  timeControlManager: TimeControlManager,
): Promise<void> { … }
Covers lines 672-801 of the current main.ts.

Debug Hotkeys
[NEW] 
DebugHotkeys.ts
The Ctrl+D toggle debug mode listener (currently lines 82-92) and the debug-mode M/L/N/K/U/H hotkeys (currently lines 508-574) — extracted from the onKeyDown handler, since these are conceptually distinct from gameplay input.

ts
export function bindDebugHotkeys(
  inputManager: InputManager,
  gameManager: GameManager,
  scaleManager: ScaleManager,
): void { … }
Window Type Declarations
[NEW] 
global.d.ts
Proper Window interface augmentation for all the properties assigned in DebugConsole.ts:

ts
interface Window {
  LogExporter: typeof import('./utils/LogExporter').LogExporter;
  balanceTracking: { enable(): void; disable(): void; … };
  waveBalance?: () => Promise<void>;
  performanceTest: () => Promise<void>;
  debugPerformance: () => void;
  debugCleanup: () => void;
  debugToggleMonitoring: () => void;
  timeControl: { pause(): void; resume(): void; … };
  // Lazy-loaded
  WaveBalancing?: unknown;
  printWaveBalance?: (from: number, to: number) => void;
  runBalancePerformanceTests?: () => void;
  runFrameRateTest?: () => void;
}
Entry Point
[MODIFY] 
main.ts
Reduced to ~40 lines — orchestrates the 6 modules in order:

ts
import { createApp } from './core/Application';
import { bindDebugHotkeys } from './core/DebugHotkeys';
import { registerDebugConsoleAPIs } from './core/DebugConsole';
import { createUI } from './core/UISetup';
import { bindInput } from './core/InputBindings';
import { startGameLoop } from './core/GameLoop';
// ...
(async () => {
  const { app, pixelArtRenderer, scaleManager } = await createApp();
  const gameManager = new GameManager(app);
  const timeControlManager = new TimeControlManager();
  const inputManager = new InputManager(app, scaleManager);
  gameManager.setInputManager(inputManager);
  
  const ui = createUI(app, gameManager, timeControlManager, pixelArtRenderer);
  bindInput(inputManager, gameManager, timeControlManager, ui.towerShop, ui.bottomBar);
  bindDebugHotkeys(inputManager, gameManager, scaleManager);
  gameManager.init();
  
  // Quick-start for testing
  if (DevConfig.TESTING.SKIP_MENU && DevConfig.TESTING.AUTO_START_GAME) { … }
  startGameLoop(app, gameManager, timeControlManager, ui, pixelArtRenderer);
  await registerDebugConsoleAPIs(gameManager, timeControlManager);
})();
File Summary
New file	Responsibility	Lines from main.ts
src/core/Application.ts	PixiJS app creation, canvas, culling, pixel-art, scale manager	28-64
src/core/UISetup.ts	UI construction, registration, callback wiring	94-284
src/core/InputBindings.ts	Pointer + keyboard → game actions	286-575
src/core/GameLoop.ts	Ticker update loop	591-668
src/core/DebugConsole.ts	window.* debug API registration	672-801
src/core/DebugHotkeys.ts	Debug-mode keyboard shortcuts	82-92, 508-574
src/global.d.ts	Window interface augmentation	N/A (new)
IMPORTANT

main.ts drops from 803 lines → ~50 lines. Each new module has a single exported function with explicit dependencies injected as parameters — no hidden globals, no IIFE side-effects.

Open Questions
NOTE

Quick-start logic location: The DevConfig.TESTING.SKIP_MENU && AUTO_START_GAME block (lines 580-588) could live in main.ts since it's bootstrap-specific, or be a method on GameManager. I've kept it in main.ts since it's only used during dev. Any preference?

NOTE

setupCampClickCallback: This helper (lines 233-245) is called after level load from 3 places. It could become a method on UISetup's returned context object, or move into GameManager.startGameWithLevel() itself. I've placed it in UISetup — let me know if you'd prefer it elsewhere.

Verification Plan
Automated Tests
npx tsc --noEmit — Ensure no type errors after refactor
npm run dev — Verify the game boots and renders correctly
Existing vitest suite still passes: npx vitest run
Manual Verification
Game boots to main menu → select level → gameplay works
Tower placement, upgrade, sell all functional
Debug hotkeys (M, L, N, K, U, H) still work when debug enabled
Console APIs (balanceTracking, timeControl, performanceTest, etc.) all available
Time control (pause/resume/speed) works