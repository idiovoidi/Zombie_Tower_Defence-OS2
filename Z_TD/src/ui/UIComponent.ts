import { Container } from 'pixi.js';

export abstract class UIComponent extends Container {
  // In Pixi.js v8, Container already has a visible property
  // We don't need to declare it explicitly
  
  constructor() {
    super();
    // The visible property is inherited from Container
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