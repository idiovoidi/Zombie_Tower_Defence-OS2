import { UIComponent } from './UIComponent';
import { ColorMatrixFilter, Container, Graphics, Text } from 'pixi.js';
import { SimpleRetroFilter } from './shaders/filters/SimpleRetroFilter';
import { VisualPresets } from '../utils/VisualPresets';

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

  constructor() {
    super();
    this.createPanel();
  }

  public setGameStage(stage: Container): void {
    this.gameStage = stage;
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
    const panelHeight = 650;
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
      { name: 'Neon', color: 0x00ffff, desc: 'Bright bloom + contrast' },
      { name: 'Cinematic', color: 0x8b7355, desc: 'Vignette + film grain' },
      { name: 'Retro-Arcade', color: 0xff6600, desc: 'Pixels + scanlines + bloom' },
      { name: 'Horror', color: 0x4a0e4e, desc: 'Dark + chromatic aberration' },
      { name: 'Dreamy', color: 0xffb6c1, desc: 'Soft bloom + saturation' },
      { name: 'Glitch', color: 0xff0088, desc: 'RGB split + noise' },
    ];

    presetButtons.forEach((preset, index) => {
      const button = this.createShaderButton(preset.name, preset.color);
      button.position.set(panelLeft + 15 + (index % 3) * 110, yPos + Math.floor(index / 3) * 40);
      this.contentContainer.addChild(button);
    });
    yPos += 100;

    // Single Effect Buttons
    const singleTitle = new Text({
      text: 'Single Effects:',
      style: {
        fontFamily: 'Arial',
        fontSize: 14,
        fill: 0xffcc00,
        fontWeight: 'bold',
      },
    });
    singleTitle.position.set(panelLeft + 15, yPos);
    this.contentContainer.addChild(singleTitle);
    yPos += 25;

    const shaderButtons = [
      { name: 'None', color: 0x666666 },
      { name: 'Retro', color: 0xff6600 },
      { name: 'Sepia', color: 0xaa8844 },
      { name: 'Grayscale', color: 0x888888 },
      { name: 'Invert', color: 0xff00ff },
      { name: 'Contrast', color: 0xffaa00 },
    ];

    const buttonSectionTitle = new Text({
      text: 'Shader Type:',
      style: {
        fontFamily: 'Arial',
        fontSize: 14,
        fill: 0xffcc00,
        fontWeight: 'bold',
      },
    });
    buttonSectionTitle.position.set(panelLeft + 15, yPos);
    this.contentContainer.addChild(buttonSectionTitle);
    yPos += 25;

    shaderButtons.forEach((shader, index) => {
      const button = this.createShaderButton(shader.name, shader.color);
      button.position.set(panelLeft + 15 + (index % 3) * 110, yPos + Math.floor(index / 3) * 40);
      this.contentContainer.addChild(button);
    });
    yPos += 120;

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
    const presets = ['Neon', 'Cinematic', 'Retro-Arcade', 'Horror', 'Dreamy', 'Glitch'];
    if (presets.includes(shaderName)) {
      console.log(`🎨 Applying preset: ${shaderName}`);
      if (this.gameStage) {
        const visualPresets = new VisualPresets(this.gameStage);
        visualPresets.applyPreset(shaderName.toLowerCase().replace('-', '-'));
      }
      this.clearSliders();
      return;
    }

    // Apply new shader
    switch (shaderName) {
      case 'Retro':
        console.log('🎮 Creating Simple Retro filter (Recommended)');
        this.currentFilter = new SimpleRetroFilter({
          pixelSize: 3,
          scanlineIntensity: 0.3,
          enabled: true,
        });
        break;
      case 'Sepia':
        console.log('📜 Creating Sepia filter');
        this.currentFilter = new ColorMatrixFilter();
        (this.currentFilter as ColorMatrixFilter).sepia(true);
        break;
      case 'Grayscale':
        console.log('⚫ Creating Grayscale filter');
        this.currentFilter = new ColorMatrixFilter();
        (this.currentFilter as ColorMatrixFilter).desaturate();
        break;
      case 'Invert':
        console.log('🔄 Creating Invert filter');
        this.currentFilter = new ColorMatrixFilter();
        (this.currentFilter as ColorMatrixFilter).negative(true);
        break;
      case 'Contrast':
        console.log('🔆 Creating Contrast filter');
        this.currentFilter = new ColorMatrixFilter();
        (this.currentFilter as ColorMatrixFilter).contrast(1.5, true);
        break;
      case 'None':
      default:
        console.log('❌ No filter selected');
        this.currentFilter = null;
        break;
    }

    // Apply filter to game stage
    if (this.currentFilter && this.gameStage) {
      console.log('✅ Applying filter to game stage');
      console.log('✅ Filter type:', this.currentFilter.constructor.name);
      console.log('✅ Filter object:', this.currentFilter);

      // Set filters array directly (don't append, replace)
      this.gameStage.filters = [this.currentFilter];
      console.log(`📊 Filters applied: ${this.gameStage.filters.length}`);
      console.log(`📊 Filter in array:`, this.gameStage.filters[0]);
    } else if (!this.currentFilter && this.gameStage) {
      console.log('✅ Clearing all filters');
      this.gameStage.filters = null;
    }

    // Create sliders for the selected shader
    if (this.currentFilter instanceof SimpleRetroFilter) {
      console.log('🎛️ Creating sliders for Simple Retro filter');
      this.createSimpleRetroSliders(this.currentFilter);
    } else if (this.currentFilter instanceof ColorMatrixFilter) {
      console.log('🎛️ Color filter applied (no sliders needed)');
      this.clearSliders();
    } else if (this.currentFilter) {
      console.log('🎛️ Filter applied (no sliders)');
      this.clearSliders();
    }
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

  private createBuiltInPixelationSlider(
    filter:
      | ResolutionPixelationFilter
      | WorkingResolutionPixelFilter
      | AlternativePixelationFilter
      | EnhancedPixelationFilter
  ): void {
    let yPos = 180; // Start position for slider

    // Clear existing sliders first
    this.clearSliders();

    // Pixel Size label
    const label = new Text({
      text: 'pixelSize:',
      style: {
        fontFamily: 'Arial',
        fontSize: 12,
        fill: 0xcccccc,
        fontWeight: 'bold',
      },
    });
    label.position.set(15, yPos);
    this.contentContainer.addChild(label);
    this.settingTexts.set('pixelSize_label', label);

    // Value display
    const valueText = new Text({
      text: filter.getPixelSize().toFixed(1),
      style: {
        fontFamily: 'Courier New, monospace',
        fontSize: 11,
        fill: 0x00ff00,
      },
    });
    valueText.position.set(320, yPos);
    this.contentContainer.addChild(valueText);
    this.settingTexts.set('pixelSize_value', valueText);

    yPos += 20;

    // Description
    const description = new Text({
      text: 'Size of pixels for retro pixelation effect (built-in filter)',
      style: {
        fontFamily: 'Arial',
        fontSize: 9,
        fill: 0x888888,
        fontStyle: 'italic',
        wordWrap: true,
        wordWrapWidth: 340,
      },
    });
    description.position.set(25, yPos);
    this.contentContainer.addChild(description);
    this.settingTexts.set('pixelSize_desc', description);

    yPos += 15;

    // Create slider
    const slider = this.createSlider('pixelSize', filter.getPixelSize(), 1, 20, (value: number) => {
      // Update filter setting
      filter.setPixelSize(value);

      // Update value display
      const valueDisplay = this.settingTexts.get('pixelSize_value');
      if (valueDisplay) {
        valueDisplay.text = value.toFixed(1);
      }
    });

    slider.position.set(25, yPos);
    this.contentContainer.addChild(slider);
    this.sliders.set('pixelSize', slider);

    yPos += 35;

    // Reset button
    const resetButton = this.createResetButton(() => {
      filter.setPixelSize(4.0);
      // Update value display
      const valueDisplay = this.settingTexts.get('pixelSize_value');
      if (valueDisplay) {
        valueDisplay.text = '4.0';
      }
      // Update slider position
      const sliderElement = this.sliders.get('pixelSize');
      if (sliderElement) {
        const handle = sliderElement.children[1]; // Handle is second child
        const normalizedValue = (4.0 - 1) / (20 - 1);
        handle.position.x = normalizedValue * 280;
      }
    });
    resetButton.position.set(15, yPos + 10);
    this.contentContainer.addChild(resetButton);
  }

  private createPixelationSlider(filter: WorkingPixelationFilter): void {
    let yPos = 180; // Start position for slider

    // Clear existing sliders first
    this.clearSliders();

    // Pixel Size label
    const label = new Text({
      text: 'pixelSize:',
      style: {
        fontFamily: 'Arial',
        fontSize: 12,
        fill: 0xcccccc,
        fontWeight: 'bold',
      },
    });
    label.position.set(15, yPos);
    this.contentContainer.addChild(label);
    this.settingTexts.set('pixelSize_label', label);

    // Value display
    const valueText = new Text({
      text: filter.getPixelSize().toFixed(1),
      style: {
        fontFamily: 'Courier New, monospace',
        fontSize: 11,
        fill: 0x00ff00,
      },
    });
    valueText.position.set(320, yPos);
    this.contentContainer.addChild(valueText);
    this.settingTexts.set('pixelSize_value', valueText);

    yPos += 20;

    // Description
    const description = new Text({
      text: 'Size of pixels for retro pixelation effect',
      style: {
        fontFamily: 'Arial',
        fontSize: 9,
        fill: 0x888888,
        fontStyle: 'italic',
        wordWrap: true,
        wordWrapWidth: 340,
      },
    });
    description.position.set(25, yPos);
    this.contentContainer.addChild(description);
    this.settingTexts.set('pixelSize_desc', description);

    yPos += 15;

    // Create slider
    const slider = this.createSlider('pixelSize', filter.getPixelSize(), 1, 20, (value: number) => {
      // Update filter setting
      filter.setPixelSize(value);

      // Update value display
      const valueDisplay = this.settingTexts.get('pixelSize_value');
      if (valueDisplay) {
        valueDisplay.text = value.toFixed(1);
      }
    });

    slider.position.set(25, yPos);
    this.contentContainer.addChild(slider);
    this.sliders.set('pixelSize', slider);

    yPos += 35;

    // Reset button
    const resetButton = this.createResetButton(() => {
      filter.setPixelSize(4.0);
      // Update value display
      const valueDisplay = this.settingTexts.get('pixelSize_value');
      if (valueDisplay) {
        valueDisplay.text = '4.0';
      }
      // Update slider position
      const sliderElement = this.sliders.get('pixelSize');
      if (sliderElement) {
        const handle = sliderElement.children[1]; // Handle is second child
        const normalizedValue = (4.0 - 1) / (20 - 1);
        handle.position.x = normalizedValue * 280;
      }
    });
    resetButton.position.set(15, yPos + 10);
    this.contentContainer.addChild(resetButton);
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

  private createSlidersForShader(filter: BaseRetroFilter): void {
    const settingsInfo = filter.getSettingsInfo();
    let yPos = 180; // Start position for sliders

    Object.entries(settingsInfo).forEach(
      ([key, info]: [string, { value: number; min: number; max: number; description: string }]) => {
        // Setting label
        const label = new Text({
          text: `${key}:`,
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
          text: info.value.toFixed(2),
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
        const description = new Text({
          text: info.description,
          style: {
            fontFamily: 'Arial',
            fontSize: 9,
            fill: 0x888888,
            fontStyle: 'italic',
            wordWrap: true,
            wordWrapWidth: 340,
          },
        });
        description.position.set(25, yPos);
        this.contentContainer.addChild(description);
        this.settingTexts.set(`${key}_desc`, description);

        yPos += 15;

        // Create slider (simplified - using a basic implementation)
        const slider = this.createSlider(key, info.value, info.min, info.max, (value: number) => {
          // Update filter setting
          const settings: Record<string, number> = {};
          settings[key] = value;
          filter.updateSettings(settings);

          // Update value display
          const valueDisplay = this.settingTexts.get(`${key}_value`);
          if (valueDisplay) {
            valueDisplay.text = value.toFixed(2);
          }
        });

        slider.position.set(25, yPos);
        this.contentContainer.addChild(slider);
        this.sliders.set(key, slider);

        yPos += 35;
      }
    );

    // Reset button
    const resetButton = this.createResetButton(() => {
      filter.resetToDefaults();
      this.updateSliderValues(filter);
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

  private updateSliderValues(filter: BaseRetroFilter): void {
    const settingsInfo = filter.getSettingsInfo();

    Object.entries(settingsInfo).forEach(
      ([key, info]: [string, { value: number; min: number; max: number; description: string }]) => {
        // Update value display
        const valueDisplay = this.settingTexts.get(`${key}_value`);
        if (valueDisplay) {
          valueDisplay.text = info.value.toFixed(2);
        }

        // Update slider position
        const slider = this.sliders.get(key);
        if (slider) {
          const handle = slider.children[1]; // Handle is second child
          const normalizedValue = (info.value - info.min) / (info.max - info.min);
          handle.position.x = normalizedValue * 280;
        }
      }
    );
  }

  private togglePanel(): void {
    this.isExpanded = !this.isExpanded;
    this.contentContainer.visible = this.isExpanded;
  }

  public show(): void {
    this.visible = true;
  }

  public hide(): void {
    this.visible = false;
  }

  public update(_deltaTime: number): void {
    // Update logic if needed
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
