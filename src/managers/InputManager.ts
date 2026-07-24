import { type Application, Container, type FederatedPointerEvent, Graphics } from 'pixi.js';
import { CAMERA, UI_DIMENSIONS } from '../config/visualConstants';
import type { Camera } from '../utils/Camera';
import type { ScaleManager } from '../utils/ScaleManager';

interface InputCoordinates {
  screen: { x: number; y: number };
  /** World-space coordinates (after letterbox + camera). */
  game: { x: number; y: number };
  /** Design-canvas coordinates (after letterbox, before camera). */
  design: { x: number; y: number };
}

export class InputManager {
  private app: Application;
  private scaleManager: ScaleManager;
  private camera: Camera | null = null;
  private worldParent: Container | null = null;
  private callbacks: {
    onPointerDown: ((coords: InputCoordinates, event: FederatedPointerEvent) => void)[];
    onPointerMove: ((coords: InputCoordinates, event: FederatedPointerEvent) => void)[];
    onPointerUp: ((coords: InputCoordinates, event: FederatedPointerEvent) => void)[];
    onRightClick: ((coords: InputCoordinates, event: FederatedPointerEvent) => void)[];
    onKeyDown: ((key: string, event: KeyboardEvent) => void)[];
    onKeyUp: ((key: string, event: KeyboardEvent) => void)[];
  };
  private debugMode = false;
  private campClickArea: Container | null = null;
  private onCampClickCallback: (() => void) | null = null;
  private pressedKeys: Set<string> = new Set();

  private isPanning = false;
  private panLastDesignX = 0;
  private panLastDesignY = 0;

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
    this.setupWheelListener();
  }

  public setCamera(camera: Camera): void {
    this.camera = camera;
  }

  public setWorldParent(container: Container): void {
    this.worldParent = container;
  }

  public isCameraPanning(): boolean {
    return this.isPanning;
  }

  /** Continuous arrow-key pan; call each frame with unscaled delta ms. */
  public updateCamera(deltaMs: number): void {
    if (!this.camera) {
      return;
    }

    let dx = 0;
    let dy = 0;
    if (this.pressedKeys.has('ArrowLeft')) dx += 1;
    if (this.pressedKeys.has('ArrowRight')) dx -= 1;
    if (this.pressedKeys.has('ArrowUp')) dy += 1;
    if (this.pressedKeys.has('ArrowDown')) dy -= 1;

    if (dx === 0 && dy === 0) {
      return;
    }

    const speed = CAMERA.PAN_SPEED * (deltaMs / 1000);
    const len = Math.hypot(dx, dy) || 1;
    this.camera.pan((dx / len) * speed, (dy / len) * speed);
  }

  private setupEventListeners(): void {
    this.app.stage.eventMode = 'static';
    this.app.stage.hitArea = this.app.screen;

    this.app.stage.on('pointerdown', (event: FederatedPointerEvent) => {
      if (event.button === 1) {
        this.beginPan(event);
        return;
      }

      const coords = this.getCoordinates(event);
      this.callbacks.onPointerDown.forEach(callback => {
        callback(coords, event);
      });
    });

    this.app.stage.on('pointermove', (event: FederatedPointerEvent) => {
      if (this.isPanning) {
        this.updatePan(event);
        return;
      }

      const coords = this.getCoordinates(event);
      this.callbacks.onPointerMove.forEach(callback => {
        callback(coords, event);
      });
    });

    this.app.stage.on('pointerup', (event: FederatedPointerEvent) => {
      if (this.isPanning && event.button === 1) {
        this.endPan();
        return;
      }

      const coords = this.getCoordinates(event);
      this.callbacks.onPointerUp.forEach(callback => {
        callback(coords, event);
      });
    });

    this.app.stage.on('pointerupoutside', (_event: FederatedPointerEvent) => {
      if (this.isPanning) {
        this.endPan();
      }
    });

    this.app.stage.on('rightdown', (event: FederatedPointerEvent) => {
      const coords = this.getCoordinates(event);
      this.callbacks.onRightClick.forEach(callback => {
        callback(coords, event);
      });
    });

    this.app.canvas.addEventListener('contextmenu', e => {
      e.preventDefault();
    });
  }

  private setupWheelListener(): void {
    this.app.canvas.addEventListener(
      'wheel',
      (event: WheelEvent) => {
        if (!this.camera) {
          return;
        }

        const rect = this.app.canvas.getBoundingClientRect();
        const design = this.scaleManager.screenToGame(
          event.clientX - rect.left,
          event.clientY - rect.top
        );
        if (!this.isInPlayAreaDesign(design.x, design.y)) {
          return;
        }

        event.preventDefault();
        this.camera.zoomAt(event.deltaY, design.x, design.y);
      },
      { passive: false }
    );
  }

  private beginPan(event: FederatedPointerEvent): void {
    if (!this.camera) {
      return;
    }

    const design = this.scaleManager.screenToGame(event.global.x, event.global.y);
    if (!this.isInPlayAreaDesign(design.x, design.y)) {
      return;
    }

    this.isPanning = true;
    this.panLastDesignX = design.x;
    this.panLastDesignY = design.y;
    event.stopPropagation();
  }

  private updatePan(event: FederatedPointerEvent): void {
    if (!this.camera) {
      return;
    }

    const design = this.scaleManager.screenToGame(event.global.x, event.global.y);
    const dx = design.x - this.panLastDesignX;
    const dy = design.y - this.panLastDesignY;
    if (dx !== 0 || dy !== 0) {
      this.camera.pan(dx, dy);
      this.panLastDesignX = design.x;
      this.panLastDesignY = design.y;
    }
  }

  private endPan(): void {
    this.isPanning = false;
  }

  private setupKeyboardListeners(): void {
    window.addEventListener('keydown', (event: KeyboardEvent) => {
      if (this.shouldPreventDefault(event.key)) {
        event.preventDefault();
      }

      if (this.pressedKeys.has(event.key)) {
        return;
      }
      this.pressedKeys.add(event.key);

      if (event.key === 'Home' && this.camera) {
        this.camera.reset();
      }

      this.callbacks.onKeyDown.forEach(callback => {
        callback(event.key, event);
      });
    });

    window.addEventListener('keyup', (event: KeyboardEvent) => {
      this.pressedKeys.delete(event.key);

      this.callbacks.onKeyUp.forEach(callback => {
        callback(event.key, event);
      });
    });
  }

  private shouldPreventDefault(key: string): boolean {
    const preventKeys = [
      ' ',
      'Tab',
      'Escape',
      'ArrowLeft',
      'ArrowRight',
      'ArrowUp',
      'ArrowDown',
      'Home',
    ];
    return preventKeys.includes(key);
  }

  private getCoordinates(event: FederatedPointerEvent): InputCoordinates {
    const screenX = event.global.x;
    const screenY = event.global.y;
    const design = this.scaleManager.screenToGame(screenX, screenY);
    const game = this.camera
      ? this.camera.designToWorld(design.x, design.y)
      : { x: design.x, y: design.y };

    return {
      screen: { x: screenX, y: screenY },
      design,
      game,
    };
  }

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

  public isInGameArea(coords: InputCoordinates): boolean {
    return this.isInPlayAreaDesign(coords.design.x, coords.design.y);
  }

  private isInPlayAreaDesign(x: number, y: number): boolean {
    return x >= 0 && x <= UI_DIMENSIONS.PLAY_AREA_WIDTH && y >= 0 && y <= UI_DIMENSIONS.HEIGHT;
  }

  public getGameCoordinates(screenX: number, screenY: number): { x: number; y: number } {
    const design = this.scaleManager.screenToGame(screenX, screenY);
    return this.camera ? this.camera.designToWorld(design.x, design.y) : design;
  }

  public setDebugMode(enabled: boolean): void {
    this.debugMode = enabled;
  }

  public isDebugMode(): boolean {
    return this.debugMode;
  }

  public getDebugInfo(): string {
    return this.scaleManager.getDebugInfo();
  }

  public setCampClickCallback(callback: () => void): void {
    this.onCampClickCallback = callback;
  }

  public createCampClickArea(campX: number, campY: number): void {
    if (this.campClickArea) {
      this.campClickArea.parent?.removeChild(this.campClickArea);
      this.campClickArea.destroy();
    }

    this.campClickArea = new Container();
    this.campClickArea.eventMode = 'static';
    this.campClickArea.cursor = 'pointer';
    this.campClickArea.zIndex = CAMERA.CAMP_HIT_Z_INDEX;

    const hitbox = new Graphics();
    hitbox.rect(campX - 65, campY - 60, 130, 110).fill({ color: 0x000000, alpha: 0.001 });
    hitbox.eventMode = 'static';
    this.campClickArea.addChild(hitbox);

    const hoverBorder = new Graphics();
    hoverBorder.visible = false;
    this.campClickArea.addChild(hoverBorder);

    this.campClickArea.on('pointerover', () => {
      hoverBorder.clear();
      hoverBorder.rect(campX - 65, campY - 60, 130, 110).stroke({ width: 3, color: 0xffcc00 });
      hoverBorder.visible = true;
    });

    this.campClickArea.on('pointerout', () => {
      hoverBorder.visible = false;
    });

    this.campClickArea.on('pointerdown', event => {
      event.stopPropagation();
      event.preventDefault();
      if (this.onCampClickCallback) {
        this.onCampClickCallback();
      }
    });

    const parent = this.worldParent ?? this.app.stage;
    parent.addChild(this.campClickArea);
  }

  public clearCampClickArea(): void {
    if (this.campClickArea) {
      this.campClickArea.parent?.removeChild(this.campClickArea);
      this.campClickArea.destroy();
      this.campClickArea = null;
    }
  }
}
