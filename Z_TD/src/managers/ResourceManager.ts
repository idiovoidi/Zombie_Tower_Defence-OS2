import { GameConfig } from '../config/gameConfig';

export interface ResourceCost {
  money: number;
  wood?: number;
  metal?: number;
  energy?: number;
}

export class ResourceManager {
  private money: number;
  private resources: {
    wood: number;
    metal: number;
    energy: number;
  };
  
  constructor() {
    this.money = GameConfig.STARTING_MONEY;
    this.resources = {
      wood: 0,
      metal: 0,
      energy: 100
    };
  }
  
  // Check if player can afford a cost
  public canAfford(cost: ResourceCost): boolean {
    if (this.money < cost.money) return false;
    if (cost.wood && this.resources.wood < cost.wood) return false;
    if (cost.metal && this.resources.metal < cost.metal) return false;
    if (cost.energy && this.resources.energy < cost.energy) return false;
    return true;
  }
  
  // Spend resources
  public spend(cost: ResourceCost): boolean {
    if (!this.canAfford(cost)) return false;
    
    this.money -= cost.money;
    if (cost.wood) this.resources.wood -= cost.wood;
    if (cost.metal) this.resources.metal -= cost.metal;
    if (cost.energy) this.resources.energy -= cost.energy;
    
    return true;
  }
  
  // Add resources
  public add(money: number, wood: number = 0, metal: number = 0, energy: number = 0): void {
    this.money += money;
    this.resources.wood += wood;
    this.resources.metal += metal;
    this.resources.energy += energy;
    
    // Clamp energy between 0 and 100
    this.resources.energy = Math.max(0, Math.min(100, this.resources.energy));
  }
  
  // Get resource amounts
  public getMoney(): number {
    return this.money;
  }
  
  public getResources(): { wood: number; metal: number; energy: number } {
    return { ...this.resources };
  }
  
  // Resource generation over time
  public generateResources(deltaTime: number): void {
    // Generate small amounts of resources over time
    // This would be called periodically in the game loop
    this.resources.wood += 0.1 * deltaTime;
    this.resources.metal += 0.05 * deltaTime;
    this.resources.energy = Math.min(100, this.resources.energy + 0.2 * deltaTime);
  }
}