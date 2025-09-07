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
  
  // Set up event handlers
  mainMenu.setStartCallback(() => {
    gameManager.startGame();
    uiManager.setState(gameManager.getCurrentState());
  });
  
  // Initialize the game
  gameManager.init();
  
  // Listen for animate update
  let lastTime = performance.now();
  app.ticker.add((time) => {
    const currentTime = performance.now();
    const deltaTime = (currentTime - lastTime) / 1000; // Convert to seconds
    lastTime = currentTime;
    
    // Update game systems based on current state
    if (gameManager.getCurrentState() === 'Playing') {
      // Update game objects, towers, zombies, etc.
      // This would be implemented in a full game
    }
    
    // Update UI
    uiManager.update(deltaTime);
    
    // Update HUD with current game state
    hud.updateMoney(gameManager.getMoney());
    hud.updateLives(gameManager.getLives());
    hud.updateWave(gameManager.getWave());
  });
})();