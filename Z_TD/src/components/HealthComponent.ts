import { Component } from './Component';

/**
 * HealthComponent provides health management functionality for game entities.
 * It handles damage calculation with armor mitigation, healing, and death events.
 */
export class HealthComponent extends Component {
  private currentHealth: number;
  private maxHealth: number;
  private armor: number; // Damage reduction percentage (0-100)
  
  /**
   * Creates a new HealthComponent with specified max health and armor.
   * @param maxHealth The maximum health value
   * @param armor The armor value as a percentage (0-100), defaults to 0
   */
  constructor(maxHealth: number, armor: number = 0) {
    super('Health');
    this.maxHealth = maxHealth;
    this.currentHealth = maxHealth;
    this.armor = armor;
  }
  
  /**
   * Applies damage to the entity after armor mitigation.
   * @param damage The raw damage amount
   * @returns The actual damage dealt after armor reduction
   */
  public takeDamage(damage: number): number {
    // Apply armor reduction: damage * (1 - armor / 100)
    const reducedDamage = damage * (1 - this.armor / 100);
    // Ensure minimum 1 damage to prevent entities from becoming invulnerable
    const actualDamage = Math.max(1, Math.floor(reducedDamage));
    
    this.currentHealth -= actualDamage;
    // Ensure health doesn't go below 0
    this.currentHealth = Math.max(0, this.currentHealth);
    
    return actualDamage;
  }
  
  /**
   * Heals the entity by the specified amount, without exceeding max health.
   * @param amount The amount to heal
   */
  public heal(amount: number): void {
    this.currentHealth = Math.min(this.maxHealth, this.currentHealth + amount);
  }
  
  /**
   * Checks if the entity is still alive (health > 0).
   * @returns True if the entity is alive, false otherwise
   */
  public isAlive(): boolean {
    return this.currentHealth > 0;
  }
  
  /**
   * Gets the current health value.
   * @returns The current health
   */
  public getHealth(): number {
    return this.currentHealth;
  }
  
  /**
   * Gets the maximum health value.
   * @returns The maximum health
   */
  public getMaxHealth(): number {
    return this.maxHealth;
  }
  
  /**
   * Gets the current health as a percentage of maximum health.
   * @returns Health percentage (0-100)
   */
  public getHealthPercentage(): number {
    return (this.currentHealth / this.maxHealth) * 100;
  }
  
  /**
   * Sets the armor value, clamped between 0 and 100.
   * @param armor The armor percentage (0-100)
   */
  public setArmor(armor: number): void {
    this.armor = Math.max(0, Math.min(100, armor)); // Clamp between 0-100
  }
  
  /**
   * Gets the current armor value.
   * @returns The armor percentage (0-100)
   */
  public getArmor(): number {
    return this.armor;
  }
}