import { Component } from './Component';

export interface Position {
  x: number;
  y: number;
}

export interface Velocity {
  x: number;
  y: number;
}

export class TransformComponent extends Component {
  public position: Position;
  public velocity: Velocity;
  public rotation: number;
  public scale: number;

  constructor(x: number = 0, y: number = 0) {
    super('Transform');
    this.position = { x, y };
    this.velocity = { x: 0, y: 0 };
    this.rotation = 0;
    this.scale = 1;
  }

  public update(deltaTime: number): void {
    // Update position based on velocity
    this.position.x += this.velocity.x * deltaTime;
    this.position.y += this.velocity.y * deltaTime;
  }

  public setPosition(x: number, y: number): void {
    this.position.x = x;
    this.position.y = y;
  }

  public setVelocity(x: number, y: number): void {
    this.velocity.x = x;
    this.velocity.y = y;
  }

  public setRotation(rotation: number): void {
    this.rotation = rotation;
  }

  public setScale(scale: number): void {
    this.scale = scale;
  }
}
