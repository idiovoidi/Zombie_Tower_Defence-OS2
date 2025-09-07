import { Container } from 'pixi.js';

export abstract class UIComponent extends Container {
  protected visible: boolean;
  
  constructor() {
    super();
    this.visible = true;
  }
  
  public show(): void {
    this.visible = true;
  }
  
  public hide(): void {
    this.visible = false;
  }
  
  public isVisible(): boolean {
    return this.visible;
  }
  
  // Abstract method that must be implemented by subclasses
  public abstract update(deltaTime: number): void;
}