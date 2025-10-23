import { Application } from 'pixi.js';
import { ShaderTestPanel } from '../ui/ShaderTestPanel';
import { WaveInfoPanel } from '../ui/WaveInfoPanel';
import { ZombieBestiary } from '../ui/ZombieBestiary';
import { StatsPanel } from '../ui/StatsPanel';
import { WaveManager } from './WaveManager';
import { DebugConstants } from '../config/debugConstants';
import type { GameManager } from './GameManager';

/**
 * Centralized manager for all debug/test UI panels
 * Handles shader test, wave info, bestiary, and stats panels
 */
export class DebugTestUIManager {
  private app: Application;
  private shaderTestPanel: ShaderTestPanel | null = null;
  private waveInfoPanel: WaveInfoPanel | null = null;
  private bestiaryPanel: ZombieBestiary | null = null;
  private statsPanel: StatsPanel | null = null;
  private gameManager: GameManager | null = null;
  private waveManager: WaveManager | null = null;
  private pixelArtRenderer: unknown = null;

  // Panel positioning (will be calculated based on screen size)
  private readonly LEFT_SIDE_X = 20; // Left side panels
  private readonly RIGHT_SIDE_OFFSET = 20; // Right side panels offset from right edge

  constructor(app: Application) {
    this.app = app;
  }

  /**
   * Initialize all debug panels
   */
  public initialize(
    gameManager: GameManager,
    waveManager: WaveManager,
    pixelArtRenderer: unknown
  ): void {
    console.log('🔧 DebugTestUIManager: Initializing...');
    this.gameManager = gameManager;
    this.waveManager = waveManager;
    this.pixelArtRenderer = pixelArtRenderer;

    this.createShaderTestPanel();
    this.createWaveInfoPanel();
    this.createBestiaryPanel();
    this.createStatsPanel();

    this.layoutPanels();
    console.log('✅ DebugTestUIManager: Initialization complete');
  }

  /**
   * Create and setup shader test panel
   */
  private createShaderTestPanel(): void {
    console.log('🎨 Creating Shader Test Panel...');
    this.shaderTestPanel = new ShaderTestPanel();
    this.shaderTestPanel.setGameManager(this.gameManager);
    this.shaderTestPanel.setGameStage(this.app.stage);
    this.shaderTestPanel.setPixelArtRenderer(this.pixelArtRenderer);

    // Add toggle button to stage
    this.app.stage.addChild(this.shaderTestPanel);

    // Add content container separately so it appears on top
    this.app.stage.addChild(this.shaderTestPanel.getContentContainer());

    // Show/hide based on debug settings
    if (DebugConstants.ENABLED) {
      this.shaderTestPanel.show();
      console.log('✅ Shader Test Panel created and shown');
    } else {
      this.shaderTestPanel.hide();
      console.log('✅ Shader Test Panel created but hidden');
    }
  }

  /**
   * Create and setup wave info panel
   */
  private createWaveInfoPanel(): void {
    if (!this.waveManager) {
      console.warn('⚠️ Wave manager not available, skipping wave info panel');
      return;
    }

    console.log('📊 Creating Wave Info Panel...');
    this.waveInfoPanel = new WaveInfoPanel();
    this.waveInfoPanel.setWaveManager(this.waveManager);

    // Add toggle button to stage
    this.app.stage.addChild(this.waveInfoPanel);

    // Add content container separately so it appears on top
    this.app.stage.addChild(this.waveInfoPanel.getContentContainer());

    // Show/hide based on debug settings
    if (DebugConstants.ENABLED) {
      this.waveInfoPanel.show();
      console.log('✅ Wave Info Panel created and shown');
    } else {
      this.waveInfoPanel.hide();
      console.log('✅ Wave Info Panel created but hidden');
    }
  }

  /**
   * Create and setup bestiary panel
   */
  private createBestiaryPanel(): void {
    console.log('📖 Creating Bestiary Panel...');
    this.bestiaryPanel = new ZombieBestiary();

    // Add toggle button to stage
    this.app.stage.addChild(this.bestiaryPanel);

    // Add content container separately so it appears on top
    this.app.stage.addChild(this.bestiaryPanel.getContentContainer());

    // Show/hide based on debug settings
    if (DebugConstants.ENABLED) {
      this.bestiaryPanel.show();
      console.log('✅ Bestiary Panel created and shown');
    } else {
      this.bestiaryPanel.hide();
      console.log('✅ Bestiary Panel created but hidden');
    }
  }

  /**
   * Create and setup stats panel
   */
  private createStatsPanel(): void {
    if (!this.gameManager) {
      console.warn('⚠️ Game manager not available, skipping stats panel');
      return;
    }

    console.log('📊 Creating Stats Panel...');
    this.statsPanel = new StatsPanel(this.gameManager);

    // Add to stage
    this.app.stage.addChild(this.statsPanel);

    // Show/hide based on debug settings
    if (DebugConstants.ENABLED) {
      this.statsPanel.show();
      console.log('✅ Stats Panel created and shown');
    } else {
      this.statsPanel.hide();
      console.log('✅ Stats Panel created but hidden');
    }
  }

  /**
   * Layout all panel toggle buttons to avoid overlap
   */
  private layoutPanels(): void {
    const screenWidth = this.app.screen.width;
    const screenHeight = this.app.screen.height;

    // Left side panels (shader test, stats)
    const leftX = this.LEFT_SIDE_X;
    let leftYOffset = screenHeight - 140; // Start from bottom

    // Right side panels (wave info, bestiary)
    const rightX = screenWidth - this.RIGHT_SIDE_OFFSET;
    let rightYOffset = screenHeight - 94; // Start higher than left side

    // Position shader test panel (bottom-left)
    if (this.shaderTestPanel) {
      this.shaderTestPanel.position.set(leftX, leftYOffset);
      console.log(`🎨 Shader Test Panel positioned at (${leftX}, ${leftYOffset})`);
    }

    // Position stats panel (left side, above shader test or at top)
    if (this.statsPanel) {
      this.statsPanel.position.set(leftX, 100);
      console.log(`📊 Stats Panel positioned at (${leftX}, 100)`);
    }

    // Position wave info panel (right side, near bottom)
    if (this.waveInfoPanel) {
      this.waveInfoPanel.position.set(rightX, rightYOffset);
      console.log(`📊 Wave Info Panel positioned at (${rightX}, ${rightYOffset})`);
      rightYOffset += 46; // Move down for next panel
    }

    // Position bestiary panel (right side, below wave info)
    if (this.bestiaryPanel) {
      this.bestiaryPanel.position.set(rightX, rightYOffset);
      console.log(`📖 Bestiary Panel positioned at (${rightX}, ${rightYOffset})`);
    }
  }

  /**
   * Update all panels
   */
  public update(deltaTime: number): void {
    if (this.shaderTestPanel && this.shaderTestPanel.visible) {
      this.shaderTestPanel.update(deltaTime);
    }

    if (this.waveInfoPanel && this.waveInfoPanel.visible) {
      this.waveInfoPanel.update(deltaTime);
    }

    if (this.bestiaryPanel && this.bestiaryPanel.visible) {
      this.bestiaryPanel.update(deltaTime);
    }

    if (this.statsPanel && this.statsPanel.visible) {
      this.statsPanel.update();
    }
  }

  /**
   * Update wave info when wave changes
   */
  public updateWaveInfo(wave: number): void {
    if (this.waveInfoPanel) {
      this.waveInfoPanel.updateCurrentWave(wave);
    }
  }

  /**
   * Set callback for spawning zombies from bestiary
   */
  public setZombieSpawnCallback(callback: (type: string) => void): void {
    if (this.bestiaryPanel) {
      this.bestiaryPanel.setSpawnCallback(callback);
    }
  }

  /**
   * Show all debug panels
   */
  public showAll(): void {
    if (this.shaderTestPanel) {
      this.shaderTestPanel.show();
    }
    if (this.waveInfoPanel) {
      this.waveInfoPanel.show();
    }
    if (this.bestiaryPanel) {
      this.bestiaryPanel.show();
    }
    if (this.statsPanel) {
      this.statsPanel.show();
    }
  }

  /**
   * Hide all debug panels
   */
  public hideAll(): void {
    if (this.shaderTestPanel) {
      this.shaderTestPanel.hide();
    }
    if (this.waveInfoPanel) {
      this.waveInfoPanel.hide();
    }
    if (this.bestiaryPanel) {
      this.bestiaryPanel.hide();
    }
    if (this.statsPanel) {
      this.statsPanel.hide();
    }
  }

  /**
   * Toggle visibility of all debug panels
   */
  public toggleAll(): void {
    const isVisible = this.shaderTestPanel?.visible ?? false;
    if (isVisible) {
      this.hideAll();
    } else {
      this.showAll();
    }
  }

  /**
   * Get individual panels for direct access
   */
  public getShaderTestPanel(): ShaderTestPanel | null {
    return this.shaderTestPanel;
  }

  public getWaveInfoPanel(): WaveInfoPanel | null {
    return this.waveInfoPanel;
  }

  public getBestiaryPanel(): ZombieBestiary | null {
    return this.bestiaryPanel;
  }

  public getStatsPanel(): StatsPanel | null {
    return this.statsPanel;
  }

  /**
   * Open individual panels programmatically
   */
  public openShaderTestPanel(): void {
    if (this.shaderTestPanel) {
      // Toggle the panel to open it
      const contentContainer = this.shaderTestPanel.getContentContainer();
      if (!contentContainer.visible) {
        contentContainer.visible = true;
      }
    }
  }

  public openWaveInfoPanel(): void {
    if (this.waveInfoPanel) {
      this.waveInfoPanel.open();
    }
  }

  public openBestiaryPanel(): void {
    if (this.bestiaryPanel) {
      this.bestiaryPanel.open();
    }
  }

  public openStatsPanel(): void {
    if (this.statsPanel) {
      this.statsPanel.show();
    }
  }

  /**
   * Cleanup all panels
   */
  public dispose(): void {
    if (this.shaderTestPanel) {
      this.shaderTestPanel.dispose();
      this.shaderTestPanel = null;
    }

    if (this.waveInfoPanel) {
      this.waveInfoPanel.destroy();
      this.waveInfoPanel = null;
    }

    if (this.bestiaryPanel) {
      this.bestiaryPanel.destroy();
      this.bestiaryPanel = null;
    }

    if (this.statsPanel) {
      this.statsPanel.destroy();
      this.statsPanel = null;
    }
  }

  /**
   * Handle window resize to reposition panels
   */
  public onResize(): void {
    this.layoutPanels();
  }
}
