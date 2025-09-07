import { Graphics, Container } from 'pixi.js';

export class VisualEffects {
  // Create a damage indicator that floats upward
  public static createDamageIndicator(container: Container, x: number, y: number, damage: number): void {
    const damageText = new Graphics();
    // In a real implementation, this would create a text object showing the damage value
    // and animate it moving upward before fading out
    
    damageText.beginFill(0xff0000, 0.7);
    damageText.drawCircle(0, 0, 10);
    damageText.endFill();
    
    damageText.position.set(x, y);
    container.addChild(damageText);
    
    // This would be animated in a real implementation
    setTimeout(() => {
      container.removeChild(damageText);
      damageText.destroy();
    }, 1000);
  }
  
  // Create a health bar for a game object
  public static createHealthBar(container: Container, x: number, y: number, width: number, height: number): Container {
    const healthBar = new Container();
    
    // Background (red)
    const bg = new Graphics();
    bg.beginFill(0xff0000);
    bg.drawRect(0, 0, width, height);
    bg.endFill();
    healthBar.addChild(bg);
    
    // Foreground (green)
    const fg = new Graphics();
    fg.beginFill(0x00ff00);
    fg.drawRect(0, 0, width, height);
    fg.endFill();
    healthBar.addChild(fg);
    
    healthBar.position.set(x, y);
    container.addChild(healthBar);
    
    return healthBar;
  }
  
  // Update health bar fill percentage
  public static updateHealthBar(healthBar: Container, percentage: number): void {
    if (healthBar.children.length >= 2) {
      const fg = healthBar.children[1] as Graphics;
      fg.width = (fg.parent as Graphics).width * (percentage / 100);
    }
  }
}