import { Component } from './Component';

export class HealthComponent extends Component {
  private currentHealth: number;
  private maxHealth: number;
  private armor: number; // Damage reduction percentage (0-100)
  
  constructor(maxHealth: number, armor: number = 0) {
    super('Health');
    this.maxHealth = maxHealth;
    this.currentHealth = maxHealth;
    this.armor = armor;
  }
  
  public takeDamage(damage: number): number {
    // Apply armor reduction
    const reducedDamage = damage * (1 - this.armor / 100);
    const actualDamage = Math.max(1, Math.floor(reducedDamage)); // Minimum 1 damage
    
    this.currentHealth -= actualDamage;
    this.currentHealth = Math.max(0, this.currentHealth);
    
    return actualDamage;
  }
  
  public heal(amount: number): void {
    this.currentHealth = Math.min(this.maxHealth, this.currentHealth + amount);
  }
  
  public isAlive(): boolean {
    return this.currentHealth > 0;
  }
  
  public getHealth(): number {
    return this.currentHealth;
  }
  
  public getMaxHealth(): number {
    return this.maxHealth;
  }
  
  public getHealthPercentage(): number {
    return (this.currentHealth / this.maxHealth) * 100;
  }
  
  public setArmor(armor: number): void {
    this.armor = Math.max(0, Math.min(100, armor)); // Clamp between 0-100
  }
  
  public getArmor(): number {
    return this.armor;
  }
}