import { type ColorMatrixFilter, Container, Graphics, Text } from 'pixi.js';
import { VisualPresets } from '../utils/VisualPresets';
import type { SimpleRetroFilter } from './shaders/filters/SimpleRetroFilter';
import { UIPanel } from './UIPanel';

interface PixelArtRenderer {
  enable(scale: number): void;
  disable(): void;
}

export class ShaderTestPanel extends UIPanel {
  private currentFilter: ColorMatrixFilter | SimpleRetroFilter | null = null;
  private gameStage: Container | null = null;
  private sliders: Map<string, Container> = new Map();
  private settingTexts: Map<string, Text> = new Map();
  private pixelArtRenderer: PixelArtRenderer | null = null;
  private visualPresets: VisualPresets | null = null;

  constructor() {
    super();
    this.createToggleButton('🎨 Shader Test', 140, 0x9966ff);
    this.createPanelFrame(
      380,
      600,
      'Shader Test Panel',
      'Test and adjust retro shader effects',
      0x9966ff
    );
    this.buildPanelContent();
  }

  public setGameStage(stage: Container): void {
    this.gameStage = stage;
    this.visualPresets = new VisualPresets(stage);
  }

  public setPixelArtRenderer(renderer: PixelArtRenderer): void {
    this.pixelArtRenderer = renderer;
  }

  private buildPanelContent(): void {
    const panelWidth = 380;
    let yPos = 65;

    // Pixel Art Renderer Toggle
    const pixelArtTitle = new Text({
      text: 'True Pixel Art (Low-Res Rendering):',
      style: {
        fontFamily: 'Arial',
        fontSize: 12,
        fill: 0xffcc00,
        fontWeight: 'bold',
      },
    });
    pixelArtTitle.position.set(15, yPos);
    this.contentContainer.addChild(pixelArtTitle);
    yPos += 20;

    const pixelArtToggle = this.createPixelArtToggle();
    pixelArtToggle.position.set(15, yPos);
    this.contentContainer.addChild(pixelArtToggle);
    yPos += 45;

    // Visual Presets (layered effects)
    const presetTitle = new Text({
      text: 'Visual Presets (Layered):',
      style: {
        fontFamily: 'Arial',
        fontSize: 14,
        fill: 0xffcc00,
        fontWeight: 'bold',
      },
    });
    presetTitle.position.set(15, yPos);
    this.contentContainer.addChild(presetTitle);
    yPos += 25;

    const presetButtons = [
      { name: 'Cinematic', color: 0x8b7355, desc: 'Vignette + film grain' },
      { name: 'Retro-Arcade', color: 0xff6600, desc: 'Pixels + scanlines' },
      { name: 'Horror', color: 0x4a0e4e, desc: 'Dark + chromatic aberration' },
      { name: 'Dark-Mode', color: 0x2d2d44, desc: 'Mild dark theme, readable' },
      { name: 'Glitch', color: 0xff0088, desc: 'RGB split + noise' },
      { name: 'Oil-Painting', color: 0xd4a574, desc: 'Artistic painterly effect' },
      { name: 'Comic-Book', color: 0xff3333, desc: 'Edge detection' },
      { name: 'Psychedelic', color: 0xff00ff, desc: 'Color shift + bloom' },
      { name: 'Underwater', color: 0x0088ff, desc: 'Wave distortion + blue tint' },
      { name: 'Kaleidoscope', color: 0xaa00ff, desc: 'Mirror effect + bloom' },
      { name: 'Trippy', color: 0xff6600, desc: 'All effects combined!' },
      { name: 'GameBoy', color: 0x9bbc0f, desc: 'Classic Game Boy green' },
      { name: 'VHS', color: 0x8b4513, desc: 'Retro VHS tape effect' },
      { name: 'Pixel-Perfect', color: 0xff8800, desc: 'Clean pixelation' },
      { name: 'Dithered', color: 0x666666, desc: 'Classic dithering' },
      { name: 'CRT-Monitor', color: 0x00aaff, desc: 'Old CRT monitor' },
      { name: 'Inscryption', color: 0x2a4a4a, desc: 'Dark, eerie aesthetic' },
    ];

    presetButtons.forEach((preset, index) => {
      const button = this.createShaderButton(preset.name, preset.color);
      button.position.set(15 + (index % 3) * 110, yPos + Math.floor(index / 3) * 40);
      this.contentContainer.addChild(button);
    });
    yPos += 240;

    // Settings section (will be populated when shader is selected)
    const settingsTitle = new Text({
      text: 'Shader Settings:',
      style: {
        fontFamily: 'Arial',
        fontSize: 14,
        fill: 0xffcc00,
        fontWeight: 'bold',
      },
    });
    settingsTitle.position.set(15, yPos);
    this.contentContainer.addChild(settingsTitle);
    yPos += 30;

    // Instructions
    const instructions = new Text({
      text: 'Select a shader above to see its settings.\nAdjust sliders to modify shader parameters in real-time.',
      style: {
        fontFamily: 'Arial',
        fontSize: 10,
        fill: 0x888888,
        fontStyle: 'italic',
        wordWrap: true,
        wordWrapWidth: panelWidth - 30,
      },
    });
    instructions.position.set(15, yPos);
    this.contentContainer.addChild(instructions);

    this.addChild(this.contentContainer);
  }

  private createShaderButton(name: string, color: number): Container {
    const button = new Container();
    button.eventMode = 'static';
    button.cursor = 'pointer';

    const bg = new Graphics();
    bg.roundRect(0, 0, 100, 30, 5).fill({ color: 0x2a2a2a, alpha: 0.8 });
    bg.stroke({ width: 2, color: color });
    button.addChild(bg);

    const text = new Text({
      text: name,
      style: {
        fontFamily: 'Arial',
        fontSize: 12,
        fill: color,
        fontWeight: 'bold',
      },
    });
    text.anchor.set(0.5);
    text.position.set(50, 15);
    button.addChild(text);

    button.on('pointerdown', () => {
      this.selectShader(name);
      this.updateButtonStates(name);
    });

    return button;
  }

  private updateButtonStates(selectedShader: string): void {
    // Update button appearances to show selection
    // This is a simplified version - in a full implementation you'd track button references
    console.log(`Selected shader: ${selectedShader}`);
  }

  private selectShader(shaderName: string): void {
    console.log(`🎨 Selecting shader: ${shaderName}`);

    // Remove current filter
    if (this.currentFilter && this.gameStage) {
      console.log('🗑️ Removing current filter:', this.currentFilter.constructor.name);

      // Clear filters first
      this.gameStage.filters = null;

      // Dispose of the old filter
      if ('dispose' in this.currentFilter && typeof this.currentFilter.dispose === 'function') {
        try {
          this.currentFilter.dispose();
          console.log('🗑️ Filter disposed successfully');
        } catch (e) {
          console.warn('🗑️ Error disposing filter:', e);
        }
      } else if (
        'destroy' in this.currentFilter &&
        typeof this.currentFilter.destroy === 'function'
      ) {
        try {
          this.currentFilter.destroy();
          console.log('🗑️ Filter destroyed successfully');
        } catch (e) {
          console.warn('🗑️ Error destroying filter:', e);
        }
      }
      this.currentFilter = null;
    }

    // Clear existing sliders
    this.clearSliders();

    // Check if it's a preset first
    const presets = [
      'Cinematic',
      'Retro-Arcade',
      'Horror',
      'Dark-Mode',
      'Glitch',
      'Oil-Painting',
      'Comic-Book',
      'Psychedelic',
      'Underwater',
      'Kaleidoscope',
      'Trippy',
      'GameBoy',
      'VHS',
      'Pixel-Perfect',
      'Dithered',
      'CRT-Monitor',
      'Inscryption',
    ];
    if (presets.includes(shaderName)) {
      console.log(`🎨 Applying preset: ${shaderName}`);
      if (this.visualPresets) {
        this.visualPresets.applyPreset(shaderName.toLowerCase());
        console.log(`✅ Preset applied: ${shaderName}`);
      } else {
        console.error('❌ VisualPresets not initialized!');
      }
      this.clearSliders();
      return;
    }

    // If we get here, it's not a preset - just clear filters
    console.log('❌ Unknown shader:', shaderName);
    if (this.visualPresets) {
      this.visualPresets.clear();
    }
    this.clearSliders();
  }

  private clearSliders(): void {
    // Remove all existing sliders and texts
    this.sliders.forEach(slider => {
      this.contentContainer.removeChild(slider);
      slider.destroy({ children: true });
    });
    this.settingTexts.forEach(text => {
      this.contentContainer.removeChild(text);
      text.destroy({ children: true });
    });
    this.sliders.clear();
    this.settingTexts.clear();
  }

  public update(deltaTime: number): void {
    if (this.visualPresets) {
      this.visualPresets.update(deltaTime);
    }
  }

  public dispose(): void {
    // Clean up filters when panel is destroyed
    if (this.currentFilter && this.gameStage) {
      this.gameStage.filters =
        this.gameStage.filters?.filter(f => f !== this.currentFilter) || null;
      if ('dispose' in this.currentFilter && typeof this.currentFilter.dispose === 'function') {
        this.currentFilter.dispose();
      } else if (
        'destroy' in this.currentFilter &&
        typeof this.currentFilter.destroy === 'function'
      ) {
        this.currentFilter.destroy();
      }
    }
    super.destroy();
  }

  private createPixelArtToggle(): Container {
    const container = new Container();

    // Toggle button
    const button = new Container();
    button.eventMode = 'static';
    button.cursor = 'pointer';

    const bg = new Graphics();
    bg.roundRect(0, 0, 120, 30, 5).fill({ color: 0x2a2a2a, alpha: 0.9 });
    bg.stroke({ width: 2, color: 0x666666 });
    button.addChild(bg);

    const buttonText = new Text({
      text: 'Enable (3x)',
      style: {
        fontFamily: 'Arial',
        fontSize: 12,
        fill: 0xcccccc,
        fontWeight: 'bold',
      },
    });
    buttonText.anchor.set(0.5);
    buttonText.position.set(60, 15);
    button.addChild(buttonText);

    let isEnabled = false;

    button.on('pointerdown', () => {
      if (!this.pixelArtRenderer) {
        console.warn('⚠️ Pixel Art Renderer not available');
        return;
      }

      isEnabled = !isEnabled;

      if (isEnabled) {
        this.pixelArtRenderer.enable(3);
        if (buttonText.text !== 'Disable') {
          buttonText.text = 'Disable';
        }
        buttonText.style.fill = 0x00ff00;
        bg.clear();
        bg.roundRect(0, 0, 120, 30, 5).fill({ color: 0x2a4a2a, alpha: 0.9 });
        bg.stroke({ width: 2, color: 0x00ff00 });
      } else {
        this.pixelArtRenderer.disable();
        if (buttonText.text !== 'Enable (3x)') {
          buttonText.text = 'Enable (3x)';
        }
        buttonText.style.fill = 0xcccccc;
        bg.clear();
        bg.roundRect(0, 0, 120, 30, 5).fill({ color: 0x2a2a2a, alpha: 0.9 });
        bg.stroke({ width: 2, color: 0x666666 });
      }
    });

    container.addChild(button);

    // Info text
    const infoText = new Text({
      text: 'Renders at 1/3 resolution for true pixel art',
      style: {
        fontFamily: 'Arial',
        fontSize: 9,
        fill: 0x888888,
        fontStyle: 'italic',
        wordWrap: true,
        wordWrapWidth: 340,
      },
    });
    infoText.position.set(130, 8);
    container.addChild(infoText);

    return container;
  }
}
