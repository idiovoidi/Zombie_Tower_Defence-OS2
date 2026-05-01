// Base component class
export abstract class Component {
  public name: string;

  constructor(name: string) {
    this.name = name;
  }

  // Lifecycle methods that can be overridden by subclasses
  public init(): void {
    // Initialize component
  }

  public update(_deltaTime: number): void {
    // Update component logic
  }

  public destroy(): void {
    // Clean up component resources
  }
}
