import { Container } from 'pixi.js';
import { Component } from '../components/Component';

export class GameObject extends Container {
  protected components: Map<string, Component>;
  protected active: boolean;

  constructor() {
    super();
    this.components = new Map<string, Component>();
    this.active = true;
  }

  // Add a component to this game object
  public addComponent(component: Component): void {
    this.components.set(component.name, component);
    component.init();
  }

  // Remove a component from this game object
  public removeComponent(componentName: string): void {
    const component = this.components.get(componentName);
    if (component) {
      component.destroy();
      this.components.delete(componentName);
    }
  }

  // Get a component by name
  public getComponent<T extends Component>(name: string): T | undefined {
    return this.components.get(name) as T | undefined;
  }

  // Check if this game object has a specific component
  public hasComponent(name: string): boolean {
    return this.components.has(name);
  }

  // Update all components
  public update(deltaTime: number): void {
    if (!this.active) {
      return;
    }

    for (const component of this.components.values()) {
      component.update(deltaTime);
    }
  }

  // Activate/deactivate the game object
  public setActive(active: boolean): void {
    this.active = active;
  }

  public isActive(): boolean {
    return this.active;
  }

  // Destroy this game object and all its components
  // CRITICAL: Must destroy children to prevent GPU memory leak
  public destroy(): void {
    for (const component of this.components.values()) {
      component.destroy();
    }
    this.components.clear();
    // CRITICAL: Pass { children: true } to destroy all Graphics objects
    // Without this, Tower visual/barrel Graphics leak GPU memory
    super.destroy({ children: true });
  }
}
