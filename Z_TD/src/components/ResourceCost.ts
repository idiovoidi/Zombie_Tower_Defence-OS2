// ResourceCost interface for defining resource costs across the game
export interface ResourceCost {
  money: number;
  wood?: number;
  metal?: number;
  energy?: number;
}