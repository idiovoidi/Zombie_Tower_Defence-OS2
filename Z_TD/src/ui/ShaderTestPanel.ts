import { UIComponent } from './UIComponent';
import { ColorMatrixFilter, Container, Graphics, Text } from 'pixi.js';
import { SimpleRetroFilter } from './shaders/filters/SimpleRetroFilter';
import { VisualPresets } from '../utils/VisualPresets';
import { ResolutionPixelationFilter } from './shaders/filters/ResolutionPixelationFilter';

export class ShaderTestPanel extends UIComponent {
  private background!: Graphics;
  private contentContainer!: Container;
  private isExpanded: boolean = false;
  private toggleButton!: Container;
  private currentFilter: ColorMatrixFilter | SimpleRetroFilter | null = null;
  private gameStage: Container | null = null;
  private gameManager: unknown = null;
  private sliders: Map<string, Container> = new Map();
  private settingTexts: Map<string, Text> = new Map();
  private pixelArtRenderer: unknown = null;
  private visualPresets: VisualPresets | null = null;

  constructor() {
    super();
    this.createPanel();
  }

  public setGameStage(stage: Container): void {
    this.gameStage = stage;
    this.visualPresets = new VisualPresets(stage);
  }

  public setGameManager(gameManager: unknown): void {
    this.gameManager = gameManager;
  }

  public setPixelArtRenderer(renderer: unknown): void {
    this.pixelArtRenderer = renderer;
  }

  private createPanel(): void {
    // Toggle button (always visible)
    this.toggleButton = new Container();
    this.toggleButton.eventMode = 'static';
    this.toggleButton.cursor = 'pointer';

    const buttonBg = new Graphics();
    buttonBg.roundRect(0, 0, 140, 30, 5).fill({ color: 0x1a1a1a, alpha: 0.9 });
    buttonBg.stroke({ width: 2, color: 0x9966ff });
    this.toggleButton.addChild(buttonBg);

    const buttonText = new Text({
      text: '🎨 Shader Test',
      style: {
        fontFamily: 'Arial',
        fontSize: 14,
        fill: 0x9966ff,
        fontWeight: 'bold',
      },
    });
    buttonText.anchor.set(0.5);
    buttonText.position.set(70, 15);
    this.toggleButton.addChild(buttonText);

    this.toggleButton.on('pointerdown', () => {
      this.togglePanel();
    });

    this.addChild(this.toggleButton);

    // Main panel (hidden by default)
    this.background = new Graphics();
    this.contentContainer = new Container();
    this.contentContainer.visible = false;

    this.createPanelContent();
  }

  public getContentContainer(): Container {
    return this.contentContainer;
  }

  private createPanelContent(): void {
    // Position at absolute screen coordinates
    const panelWidth = 380;
    const panelHeight = 600;
    this.contentContainer.position.set(640 - panelWidth / 2, 384 - panelHeight / 2);

    const panelLeft = 0;
    const panelTop = 0;

    // Background
    this.background
      .roundRect(panelLeft, panelTop, panelWidth, panelHeight, 10)
      .fill({ color: 0x1a1a1a, alpha: 0.95 });
    this.background.stroke({ width: 3, color: 0x9966ff });
    this.contentContainer.addChild(this.background);

    // Title
    const titleText = new Text({
      text: 'Shader Test Panel',
      style: {
        fontFamily: 'Impact, Arial Black, sans-serif',
        fontSize: 18,
        fill: 0x9966ff,
        fontWeight: 'bold',
        letterSpacing: 1,
      },
    });
    titleText.position.set(panelLeft + 10, panelTop + 10);
    this.contentContainer.addChild(titleText);

    // Subtitle
    const subtitle = new Text({
      text: 'Test and adjust retro shader effects',
      style: {
        fontFamily: 'Arial',
        fontSize: 11,
        fill: 0xcccccc,
        fontStyle: 'italic',
      },
    });
    subtitle.position.set(panelLeft + 10, panelTop + 35);
    this.contentContainer.addChild(subtitle);

    // Close button
    const closeButton = new Container();
    closeButton.eventMode = 'static';
    closeButton.cursor = 'pointer';

    const closeBg = new Graphics();
    closeBg.circle(0, 0, 20).fill({ color: 0x9966ff, alpha: 0.9 });
    closeBg.stroke({ width: 2, color: 0xffffff });
    closeButton.addChild(closeBg);

    const closeText = new Text({
      text: '✕',
      style: {
        fontFamily: 'Arial',
        fontSize: 20,
        fill: 0xffffff,
        fontWeight: 'bold',
      },
    });
    closeText.anchor.set(0.5);
    closeButton.addChild(closeText);

    closeButton.position.set(panelLeft + panelWidth - 30, panelTop + 20);
    closeButton.on('pointerdown', () => {
      this.closePanel();
    });
    this.contentContainer.addChild(closeButton);

    let yPos = panelTop + 65;

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
    pixelArtTitle.position.set(panelLeft + 15, yPos);
    this.contentContainer.addChild(pixelArtTitle);
    yPos += 20;

    const pixelArtToggle = this.createPixelArtToggle();
    pixelArtToggle.position.set(panelLeft + 15, yPos);
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
    presetTitle.position.set(panelLeft + 15, yPos);
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
      button.position.set(panelLeft + 15 + (index % 3) * 110, yPos + Math.floor(index / 3) * 40);
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
    settingsTitle.position.set(panelLeft + 15, yPos);
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
    instructions.position.set(panelLeft + 15, yPos);
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
      slider.destroy();
    });
    this.settingTexts.forEach(text => {
      this.contentContainer.removeChild(text);
      text.destroy();
    });
    this.sliders.clear();
    this.settingTexts.clear();
  }

  private createSimpleRetroSliders(filter: SimpleRetroFilter): void {
    let yPos = 180; // Start position for sliders

    // Clear existing sliders first
    this.clearSliders();

    // Pixel Size slider
    this.createRetroSlider(
      'Pixel Size',
      'pixelSize',
      filter.pixelSize,
      1,
      8,
      'Size of pixels for retro pixelation effect',
      yPos,
      (value: number) => {
        filter.pixelSize = value;
      },
      () => {
        filter.pixelSize = 3;
      }
    );

    yPos += 90;

    // Scanline Intensity slider
    this.createRetroSlider(
      'Scanline Intensity',
      'scanlineIntensity',
      filter.scanlineIntensity,
      0,
      1,
      'Intensity of CRT-style horizontal scanlines',
      yPos,
      (value: number) => {
        filter.scanlineIntensity = value;
      },
      () => {
        filter.scanlineIntensity = 0.3;
      }
    );
  }

  private createRetroSlider(
    labelText: string,
    key: string,
    initialValue: number,
    min: number,
    max: number,
    description: string,
    yPos: number,
    onChange: (value: number) => void,
    onReset: () => void
  ): void {
    // Label
    const label = new Text({
      text: `${labelText}:`,
      style: {
        fontFamily: 'Arial',
        fontSize: 12,
        fill: 0xcccccc,
        fontWeight: 'bold',
      },
    });
    label.position.set(15, yPos);
    this.contentContainer.addChild(label);
    this.settingTexts.set(`${key}_label`, label);

    // Value display
    const valueText = new Text({
      text: initialValue.toFixed(2),
      style: {
        fontFamily: 'Courier New, monospace',
        fontSize: 11,
        fill: 0x00ff00,
      },
    });
    valueText.position.set(320, yPos);
    this.contentContainer.addChild(valueText);
    this.settingTexts.set(`${key}_value`, valueText);

    yPos += 20;

    // Description
    const desc = new Text({
      text: description,
      style: {
        fontFamily: 'Arial',
        fontSize: 9,
        fill: 0x888888,
        fontStyle: 'italic',
        wordWrap: true,
        wordWrapWidth: 340,
      },
    });
    desc.position.set(25, yPos);
    this.contentContainer.addChild(desc);
    this.settingTexts.set(`${key}_desc`, desc);

    yPos += 15;

    // Create slider
    const slider = this.createSlider(key, initialValue, min, max, (value: number) => {
      onChange(value);
      const valueDisplay = this.settingTexts.get(`${key}_value`);
      if (valueDisplay) {
        valueDisplay.text = value.toFixed(2);
      }
    });

    slider.position.set(25, yPos);
    this.contentContainer.addChild(slider);
    this.sliders.set(key, slider);

    yPos += 35;

    // Reset button
    const resetButton = this.createResetButton(() => {
      onReset();
      const defaultValue = key === 'pixelSize' ? 3 : 0.3;
      const valueDisplay = this.settingTexts.get(`${key}_value`);
      if (valueDisplay) {
        valueDisplay.text = defaultValue.toFixed(2);
      }
      const sliderElement = this.sliders.get(key);
      if (sliderElement) {
        const handle = sliderElement.children[1];
        const normalizedValue = (defaultValue - min) / (max - min);
        handle.position.x = normalizedValue * 280;
      }
    });
    resetButton.position.set(15, yPos + 10);
    this.contentContainer.addChild(resetButton);
  }

  private createSlider(
    name: string,
    initialValue: number,
    min: number,
    max: number,
    onChange: (value: number) => void
  ): Container {
    const slider = new Container();
    slider.eventMode = 'static';

    // Slider track
    const track = new Graphics();
    track.roundRect(0, 0, 280, 8, 4).fill({ color: 0x333333 });
    slider.addChild(track);

    // Slider handle
    const handle = new Graphics();
    handle.circle(0, 0, 8).fill({ color: 0x9966ff });
    handle.eventMode = 'static';
    handle.cursor = 'pointer';

    // Calculate initial position
    const normalizedValue = (initialValue - min) / (max - min);
    handle.position.set(normalizedValue * 280, 4);
    slider.addChild(handle);

    // Drag functionality
    let isDragging = false;

    handle.on('pointerdown', () => {
      isDragging = true;
    });

    // Global pointer events for dragging
    const onPointerMove = (event: unknown) => {
      if (isDragging && event && typeof event === 'object' && 'global' in event) {
        const globalPos = (event as { global: { x: number; y: number } }).global;
        const localPos = slider.toLocal(globalPos);
        const clampedX = Math.max(0, Math.min(280, localPos.x));
        handle.position.x = clampedX;

        // Calculate value
        const normalizedPos = clampedX / 280;
        const value = min + normalizedPos * (max - min);
        onChange(value);
      }
    };

    const onPointerUp = () => {
      isDragging = false;
    };

    // Add global listeners
    slider.on('globalpointermove', onPointerMove);
    slider.on('globalpointerup', onPointerUp);

    return slider;
  }

  private createResetButton(onReset: () => void): Container {
    const button = new Container();
    button.eventMode = 'static';
    button.cursor = 'pointer';

    const bg = new Graphics();
    bg.roundRect(0, 0, 120, 25, 5).fill({ color: 0x444444, alpha: 0.8 });
    bg.stroke({ width: 1, color: 0xffcc00 });
    button.addChild(bg);

    const text = new Text({
      text: '🔄 Reset to Defaults',
      style: {
        fontFamily: 'Arial',
        fontSize: 10,
        fill: 0xffcc00,
      },
    });
    text.anchor.set(0.5);
    text.position.set(60, 12.5);
    button.addChild(text);

    button.on('pointerdown', onReset);

    return button;
  }

  private togglePanel(): void {
    this.isExpanded = !this.isExpanded;
    this.contentContainer.visible = this.isExpanded;
  }

  private closePanel(): void {
    this.isExpanded = false;
    this.contentContainer.visible = false;
  }

  public show(): void {
    this.visible = true;
  }

  public hide(): void {
    this.visible = false;
  }

  public update(deltaTime: number): void {
    // Update animated filters
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
        (this.pixelArtRenderer as any).enable(3);
        buttonText.text = 'Disable';
        buttonText.style.fill = 0x00ff00;
        bg.clear();
        bg.roundRect(0, 0, 120, 30, 5).fill({ color: 0x2a4a2a, alpha: 0.9 });
        bg.stroke({ width: 2, color: 0x00ff00 });
      } else {
        (this.pixelArtRenderer as any).disable();
        buttonText.text = 'Enable (3x)';
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
