import { GameConfig } from '../config/gameConfig';

export interface ResourceCost {
  money: number;
}

export class ResourceManager {
  private money: number;

  constructor() {
    this.money = GameConfig.STARTING_MONEY;
  }

  // Check if player can afford a cost
  public canAfford(cost: ResourceCost): boolean {
    return this.money >= cost.money;
  }

  // Spend money
  public spend(cost: ResourceCost): boolean {
    if (!this.canAfford(cost)) {
      return false;
    }

    this.money -= cost.money;
    return true;
  }

  // Add money
  public add(money: number): void {
    this.money += money;
  }

  // Get money amount
  public getMoney(): number {
    return this.money;
  }
}
