import { Application, FederatedPointerEvent } from 'pixi.js';
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
  };
  private debugMode: boolean = false; // Disable debug by default

  constructor(app: Application, scaleManager: ScaleManager) {
    this.app = app;
    this.scaleManager = scaleManager;
    this.callbacks = {
      onPointerDown: [],
      onPointerMove: [],
      onPointerUp: [],
      onRightClick: [],
    };

    this.setupEventListeners();
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
}
