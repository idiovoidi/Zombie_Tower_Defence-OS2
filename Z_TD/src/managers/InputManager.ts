import { Application, Container, FederatedPointerEvent, Graphics } from 'pixi.js';
import { ScaleManager } from '../utils/ScaleManager';

export interface InputCoordinates {
  screen: { x: number; y: number };
  game: { x: number; y: number };
}

export class InputManager {
  private app: Application;
  private scaleManager: ScaleManager;
  private callbacks: {
    onPointerDown: ((coords: InputCoordinates, event: FederatedPointerEvent) => void)[];
    onPointerMove: ((coords: InputCoordinates, event: FederatedPointerEvent) => void)[];
    onPointerUp: ((coords: InputCoordinates, event: FederatedPointerEvent) => void)[];
    onRightClick: ((coords: InputCoordinates, event: FederatedPointerEvent) => void)[];
    onKeyDown: ((key: string, event: KeyboardEvent) => void)[];
    onKeyUp: ((key: string, event: KeyboardEvent) => void)[];
  };
  private debugMode: boolean = false; // Disable debug by default
  private campClickArea: Container | null = null;
  private onCampClickCallback: (() => void) | null = null;
  private pressedKeys: Set<string> = new Set();

  constructor(app: Application, scaleManager: ScaleManager) {
    this.app = app;
    this.scaleManager = scaleManager;
    this.callbacks = {
      onPointerDown: [],
      onPointerMove: [],
      onPointerUp: [],
      onRightClick: [],
      onKeyDown: [],
      onKeyUp: [],
    };

    this.setupEventListeners();
    this.setupKeyboardListeners();
  }

  private setupEventListeners(): void {
    // Set up the main stage for interaction
    this.app.stage.eventMode = 'static';

    // Use a simple approach - let PixiJS handle the hit area automatically
    this.app.stage.hitArea = this.app.screen;

    // Pointer down events
    this.app.stage.on('pointerdown', (event: FederatedPointerEvent) => {
      const coords = this.getCoordinates(event);
      this.callbacks.onPointerDown.forEach(callback => callback(coords, event));
    });

    // Pointer move events
    this.app.stage.on('pointermove', (event: FederatedPointerEvent) => {
      const coords = this.getCoordinates(event);
      this.callbacks.onPointerMove.forEach(callback => callback(coords, event));
    });

    // Pointer up events
    this.app.stage.on('pointerup', (event: FederatedPointerEvent) => {
      const coords = this.getCoordinates(event);
      this.callbacks.onPointerUp.forEach(callback => callback(coords, event));
    });

    // Right click events
    this.app.stage.on('rightdown', (event: FederatedPointerEvent) => {
      const coords = this.getCoordinates(event);
      this.callbacks.onRightClick.forEach(callback => callback(coords, event));
    });

    // Prevent context menu on right click
    this.app.canvas.addEventListener('contextmenu', e => {
      e.preventDefault();
    });
  }

  private setupKeyboardListeners(): void {
    // Keyboard down events
    window.addEventListener('keydown', (event: KeyboardEvent) => {
      // Prevent default for game keys to avoid browser shortcuts
      if (this.shouldPreventDefault(event.key)) {
        event.preventDefault();
      }

      // Track pressed keys to prevent repeat events
      if (this.pressedKeys.has(event.key)) {
        return; // Key is already pressed, ignore repeat
      }
      this.pressedKeys.add(event.key);

      // Debug logging
      if (this.debugMode) {
        console.log(`⌨️ Key Down: ${event.key}`);
      }

      // Call all registered callbacks
      this.callbacks.onKeyDown.forEach(callback => callback(event.key, event));
    });

    // Keyboard up events
    window.addEventListener('keyup', (event: KeyboardEvent) => {
      this.pressedKeys.delete(event.key);

      // Debug logging
      if (this.debugMode) {
        console.log(`⌨️ Key Up: ${event.key}`);
      }

      // Call all registered callbacks
      this.callbacks.onKeyUp.forEach(callback => callback(event.key, event));
    });
  }

  private shouldPreventDefault(key: string): boolean {
    // Prevent default for keys that might trigger browser shortcuts
    const preventKeys = [
      ' ', // Space (prevent page scroll)
      'Tab', // Tab (prevent focus change)
      'Escape', // Escape
    ];
    return preventKeys.includes(key);
  }

  private getCoordinates(event: FederatedPointerEvent): InputCoordinates {
    // Get screen coordinates (raw mouse position)
    const screenX = event.global.x;
    const screenY = event.global.y;

    // Convert to game coordinates using ScaleManager
    const gameCoords = this.scaleManager.screenToGame(screenX, screenY);

    // Debug logging
    if (this.debugMode) {
      console.log(
        `🎯 Input: Screen(${screenX.toFixed(1)}, ${screenY.toFixed(1)}) -> Game(${gameCoords.x.toFixed(1)}, ${gameCoords.y.toFixed(1)})`
      );
    }

    return {
      screen: { x: screenX, y: screenY },
      game: { x: gameCoords.x, y: gameCoords.y },
    };
  }

  // Public methods to register callbacks
  public onPointerDown(
    callback: (coords: InputCoordinates, event: FederatedPointerEvent) => void
  ): void {
    this.callbacks.onPointerDown.push(callback);
  }

  public onPointerMove(
    callback: (coords: InputCoordinates, event: FederatedPointerEvent) => void
  ): void {
    this.callbacks.onPointerMove.push(callback);
  }

  public onPointerUp(
    callback: (coords: InputCoordinates, event: FederatedPointerEvent) => void
  ): void {
    this.callbacks.onPointerUp.push(callback);
  }

  public onRightClick(
    callback: (coords: InputCoordinates, event: FederatedPointerEvent) => void
  ): void {
    this.callbacks.onRightClick.push(callback);
  }

  public onKeyDown(callback: (key: string, event: KeyboardEvent) => void): void {
    this.callbacks.onKeyDown.push(callback);
  }

  public onKeyUp(callback: (key: string, event: KeyboardEvent) => void): void {
    this.callbacks.onKeyUp.push(callback);
  }

  public isKeyPressed(key: string): boolean {
    return this.pressedKeys.has(key);
  }

  // Utility method to check if coordinates are within game area
  public isInGameArea(coords: InputCoordinates): boolean {
    const { x, y } = coords.game;
    return x >= 0 && x <= 1024 && y >= 0 && y <= 768; // GameConfig dimensions
  }

  // Utility method to get coordinates at any time (for external use)
  public getGameCoordinates(screenX: number, screenY: number): { x: number; y: number } {
    return this.scaleManager.screenToGame(screenX, screenY);
  }

  // Debug methods
  public setDebugMode(enabled: boolean): void {
    this.debugMode = enabled;
  }

  public getDebugInfo(): string {
    return this.scaleManager.getDebugInfo();
  }

  // Camp click area management
  public setCampClickCallback(callback: () => void): void {
    console.log('🏕️ setCampClickCallback called, callback is:', typeof callback);
    this.onCampClickCallback = callback;
    console.log('🏕️ Callback stored, onCampClickCallback is now:', typeof this.onCampClickCallback);
  }

  public createCampClickArea(campX: number, campY: number): void {
    // Remove old click area if it exists
    if (this.campClickArea) {
      this.app.stage.removeChild(this.campClickArea);
      this.campClickArea.destroy();
    }

    console.log('🏕️ Creating camp click area at', campX, campY);

    // Create new clickable container
    this.campClickArea = new Container();
    this.campClickArea.eventMode = 'static';
    this.campClickArea.cursor = 'pointer';

    // Create invisible hitbox covering the camp area
    const hitbox = new Graphics();
    hitbox.rect(campX - 65, campY - 60, 130, 110).fill({ color: 0x000000, alpha: 0.001 });
    hitbox.eventMode = 'static';
    this.campClickArea.addChild(hitbox);

    // Add hover effect - highlight border
    const hoverBorder = new Graphics();
    hoverBorder.visible = false;
    this.campClickArea.addChild(hoverBorder);

    // Hover events
    this.campClickArea.on('pointerover', () => {
      console.log('🏕️ Camp hover');
      hoverBorder.clear();
      hoverBorder.rect(campX - 65, campY - 60, 130, 110).stroke({ width: 3, color: 0xffcc00 });
      hoverBorder.visible = true;
    });

    this.campClickArea.on('pointerout', () => {
      console.log('🏕️ Camp hover out');
      hoverBorder.visible = false;
    });

    // Click event
    this.campClickArea.on('pointerdown', event => {
      console.log('🏕️ Camp pointerdown event fired!');
      event.stopPropagation();
      event.preventDefault();
      if (this.onCampClickCallback) {
        console.log('🏕️ Calling camp click callback');
        this.onCampClickCallback();
      } else {
        console.log('⚠️ No camp click callback set!');
      }
    });

    // Add to stage at a high z-index to ensure it's on top
    const stageChildCount = this.app.stage.children.length;
    console.log('🏕️ Stage has', stageChildCount, 'children, adding camp click area');
    this.app.stage.addChild(this.campClickArea);
    console.log(
      '🏕️ Camp click area added, now stage has',
      this.app.stage.children.length,
      'children'
    );
  }

  public clearCampClickArea(): void {
    if (this.campClickArea) {
      this.app.stage.removeChild(this.campClickArea);
      this.campClickArea.destroy();
      this.campClickArea = null;
    }
  }
}
