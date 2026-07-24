import type { Container } from 'pixi.js';

export interface CameraBounds {
  worldWidth: number;
  worldHeight: number;
  viewportWidth: number;
  viewportHeight: number;
}

export interface CameraOptions {
  minZoom?: number;
  maxZoom?: number;
  /** Zoom step multiplier per wheel notch (e.g. 1.1 = 10% per step). */
  zoomStep?: number;
}

/**
 * Gameplay camera: pans/zooms a world container while UI stays on the stage.
 * Position/scale are applied so world point (wx, wy) draws at (wx * zoom + x, wy * zoom + y).
 */
export class Camera {
  private readonly worldContainer: Container;
  private worldWidth: number;
  private worldHeight: number;
  private viewportWidth: number;
  private viewportHeight: number;
  private minZoom: number;
  private maxZoom: number;
  private readonly zoomStep: number;

  private x = 0;
  private y = 0;
  private zoom = 1;

  constructor(worldContainer: Container, bounds: CameraBounds, options: CameraOptions = {}) {
    this.worldContainer = worldContainer;
    this.worldWidth = bounds.worldWidth;
    this.worldHeight = bounds.worldHeight;
    this.viewportWidth = bounds.viewportWidth;
    this.viewportHeight = bounds.viewportHeight;
    this.maxZoom = options.maxZoom ?? 3;
    this.zoomStep = options.zoomStep ?? 1.1;
    this.minZoom = options.minZoom ?? this.computeFitZoom();
    this.apply();
  }

  public setWorldSize(width: number, height: number): void {
    this.worldWidth = width;
    this.worldHeight = height;
    this.minZoom = Math.min(1, this.computeFitZoom());
    this.zoom = this.clampZoom(this.zoom);
    this.clampPosition();
    this.apply();
  }

  public setViewportSize(width: number, height: number): void {
    this.viewportWidth = width;
    this.viewportHeight = height;
    this.minZoom = Math.min(1, this.computeFitZoom());
    this.zoom = this.clampZoom(this.zoom);
    this.clampPosition();
    this.apply();
  }

  public reset(): void {
    this.zoom = 1;
    this.x = 0;
    this.y = 0;
    this.clampPosition();
    this.apply();
  }

  public getZoom(): number {
    return this.zoom;
  }

  public getPosition(): { x: number; y: number } {
    return { x: this.x, y: this.y };
  }

  /** Pan in viewport/design pixels (camera offset). */
  public pan(dx: number, dy: number): void {
    this.x += dx;
    this.y += dy;
    this.clampPosition();
    this.apply();
  }

  /**
   * Zoom by wheel delta. Positive deltaY zooms out.
   * Anchor is in viewport/design space (play-area coords).
   */
  public zoomAt(deltaY: number, anchorX: number, anchorY: number): void {
    const direction = deltaY > 0 ? -1 : 1;
    const factor = direction > 0 ? this.zoomStep : 1 / this.zoomStep;
    this.setZoom(this.zoom * factor, anchorX, anchorY);
  }

  public setZoom(zoom: number, anchorX?: number, anchorY?: number): void {
    const newZoom = this.clampZoom(zoom);
    const ax = anchorX ?? this.viewportWidth / 2;
    const ay = anchorY ?? this.viewportHeight / 2;

    const worldX = (ax - this.x) / this.zoom;
    const worldY = (ay - this.y) / this.zoom;

    this.zoom = newZoom;
    this.x = ax - worldX * this.zoom;
    this.y = ay - worldY * this.zoom;
    this.clampPosition();
    this.apply();
  }

  public designToWorld(designX: number, designY: number): { x: number; y: number } {
    return {
      x: (designX - this.x) / this.zoom,
      y: (designY - this.y) / this.zoom,
    };
  }

  public worldToDesign(worldX: number, worldY: number): { x: number; y: number } {
    return {
      x: worldX * this.zoom + this.x,
      y: worldY * this.zoom + this.y,
    };
  }

  private computeFitZoom(): number {
    if (this.worldWidth <= 0 || this.worldHeight <= 0) {
      return 1;
    }
    return Math.min(this.viewportWidth / this.worldWidth, this.viewportHeight / this.worldHeight);
  }

  private clampZoom(zoom: number): number {
    return Math.min(this.maxZoom, Math.max(this.minZoom, zoom));
  }

  private clampPosition(): void {
    const scaledW = this.worldWidth * this.zoom;
    const scaledH = this.worldHeight * this.zoom;

    if (scaledW <= this.viewportWidth) {
      this.x = (this.viewportWidth - scaledW) / 2;
    } else {
      const minX = this.viewportWidth - scaledW;
      this.x = Math.min(0, Math.max(minX, this.x));
    }

    if (scaledH <= this.viewportHeight) {
      this.y = (this.viewportHeight - scaledH) / 2;
    } else {
      const minY = this.viewportHeight - scaledH;
      this.y = Math.min(0, Math.max(minY, this.y));
    }
  }

  private apply(): void {
    this.worldContainer.position.set(this.x, this.y);
    this.worldContainer.scale.set(this.zoom);
  }
}
