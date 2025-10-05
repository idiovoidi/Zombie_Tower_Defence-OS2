import { HealthComponent } from './HealthComponent';

describe('HealthComponent', () => {
  let healthComponent: HealthComponent;

  beforeEach(() => {
    healthComponent = new HealthComponent(100);
  });

  it('should initialize with correct max health', () => {
    expect(healthComponent.getMaxHealth()).toBe(100);
    expect(healthComponent.getHealth()).toBe(100);
  });

  it('should initialize with correct armor value', () => {
    const componentWithArmor = new HealthComponent(100, 50);
    expect(componentWithArmor.getArmor()).toBe(50);
  });

  it('should clamp armor value between 0 and 100', () => {
    const component = new HealthComponent(100);

    component.setArmor(-10);
    expect(component.getArmor()).toBe(0);

    component.setArmor(150);
    expect(component.getArmor()).toBe(100);

    component.setArmor(75);
    expect(component.getArmor()).toBe(75);
  });

  it('should calculate damage with armor reduction', () => {
    const component = new HealthComponent(100, 50); // 50% armor

    const damage = component.takeDamage(20);
    // 20 damage * (1 - 50/100) = 10 damage, floored to 10
    expect(damage).toBe(10);
    expect(component.getHealth()).toBe(90); // 100 - 10
  });

  it('should ensure minimum 1 damage even with high armor', () => {
    const component = new HealthComponent(100, 95); // 95% armor

    const damage = component.takeDamage(1);
    // Even with 95% armor, should still take at least 1 damage
    expect(damage).toBe(1);
    expect(component.getHealth()).toBe(99);
  });

  it('should handle healing correctly', () => {
    healthComponent.takeDamage(50);
    expect(healthComponent.getHealth()).toBe(50);

    healthComponent.heal(30);
    expect(healthComponent.getHealth()).toBe(80);

    // Should not exceed max health
    healthComponent.heal(50);
    expect(healthComponent.getHealth()).toBe(100);
  });

  it('should correctly report alive status', () => {
    expect(healthComponent.isAlive()).toBe(true);

    healthComponent.takeDamage(100);
    expect(healthComponent.isAlive()).toBe(false);

    // Should stay dead even if healed slightly above 0
    healthComponent.heal(10);
    expect(healthComponent.isAlive()).toBe(true);
  });

  it('should calculate health percentage correctly', () => {
    expect(healthComponent.getHealthPercentage()).toBe(100);

    healthComponent.takeDamage(25);
    expect(healthComponent.getHealthPercentage()).toBe(75);

    healthComponent.takeDamage(50);
    expect(healthComponent.getHealthPercentage()).toBe(25);
  });

  it('should not allow health to go below 0', () => {
    healthComponent.takeDamage(150);
    expect(healthComponent.getHealth()).toBe(0);
    expect(healthComponent.isAlive()).toBe(false);
  });

  it('should handle floating point damage correctly', () => {
    const component = new HealthComponent(100, 30); // 30% armor

    // 30 damage * (1 - 30/100) = 21 damage
    const damage = component.takeDamage(30);
    expect(damage).toBe(21);
    expect(component.getHealth()).toBe(79);
  });
});
