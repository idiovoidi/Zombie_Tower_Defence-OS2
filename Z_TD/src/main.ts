import { Application } from "pixi.js";
import { GameManager } from "./managers/GameManager";
import { UIManager } from "./ui/UIManager";
import { HUD } from "./ui/HUD";
import { MainMenu } from "./ui/MainMenu";

(async () => {
  // Create a new application
  const app = new Application();

  // Initialize the application
  await app.init({ 
    background: "#101010", 
    resizeTo: window,
    width: 1024,
    height: 768
  });

  // Append the application canvas to the document body
  document.getElementById("pixi-container")!.appendChild(app.canvas);

  // Create game manager
  const gameManager = new GameManager(app);
  
  // Create UI manager
  const uiManager = new UIManager(app);
  
  // Create HUD
  const hud = new HUD();
  uiManager.registerComponent('hud', hud);
  
  // Create main menu
  const mainMenu = new MainMenu();
  uiManager.registerComponent('mainMenu', mainMenu);
  
  // Initialize the game
  gameManager.init();
  
  // Listen for animate update
  app.ticker.add((time) => {
    // Update game systems
    // In a real implementation, this would call gameManager.update(time.deltaTime)
    
    // Update UI
    uiManager.update(time.deltaTime);
  });
})();
