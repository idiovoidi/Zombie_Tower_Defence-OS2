import { UIComponent } from './UIComponent';
import { ColorMatrixFilter, Container, Graphics, Text } from 'pixi.js';
import { CRTFilter } from './shaders/filters/CRTFilter';
import { PixelationFilter } from './shaders/filters/PixelationFilter';
import { TestFilter } from './shaders/filters/TestFilter';
import { SimpleTestFilter } from './shaders/filters/SimpleTestFilter';
import { DirectTestFilter } from './shaders/filters/DirectTestFilter';
import { WorkingPixelationFilter } from './shaders/filters/WorkingPixelationFilter';
import { SimplePixelationFilter } from './shaders/filters/SimplePixelationFilter';
import { VerboseDebugFilter } from './shaders/filters/VerboseDebugFilter';
import { ResolutionPixelationFilter } from './shaders/filters/ResolutionPixelationFilter';
import { WorkingResolutionPixelFilter } from './shaders/filters/WorkingResolutionPixelFilter';
import { AlternativePixelationFilter } from './shaders/filters/AlternativePixelationFilter';
import { EnhancedPixelationFilter } from './shaders/filters/EnhancedPixelationFilter';
import { BaseRetroFilter } from './shaders/filters/BaseRetroFilter';

export class ShaderTestPanel extends UIComponent {
  private background!: Graphics;
  private contentContainer!: Container;
  private isExpanded: boolean = false;
  private toggleButton!: Container;
  private currentFilter:
    | BaseRetroFilter
    | DirectTestFilter
    | WorkingPixelationFilter
    | SimplePixelationFilter
    | VerboseDebugFilter
    | ResolutionPixelationFilter
    | WorkingResolutionPixelFilter
    | AlternativePixelationFilter
    | EnhancedPixelationFilter
    | ColorMatrixFilter
    | null = null;
  private gameStage: Container | null = null;
  private gameManager: unknown = null;
  private sliders: Map<string, Container> = new Map();
  private settingTexts: Map<string, Text> = new Map();

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

    // Shader selection buttons
    const shaderButtons = [
      { name: 'None', color: 0x666666 },
      { name: 'Pixel', color: 0x00ff88 },
      { name: 'ResPixel', color: 0x00aa88 },
      { name: 'Enhanced', color: 0xffaa00 },
      { name: 'AltPixel', color: 0xaa0088 },
      { name: 'Built-in', color: 0x00ffff },
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

    // Apply new shader
    switch (shaderName) {
      case 'Built-in':
        console.log('🌈 Creating Built-in ColorMatrix filter');
        this.currentFilter = new ColorMatrixFilter();
        (this.currentFilter as ColorMatrixFilter).tint(0xff0000);
        break;
      case 'Pixel':
        console.log('🎯 Creating Working Resolution Pixel filter');
        this.currentFilter = new WorkingResolutionPixelFilter();
        break;
      case 'ResPixel':
        console.log('📐 Creating Resolution Pixelation filter');
        this.currentFilter = new ResolutionPixelationFilter();
        break;
      case 'Enhanced':
        console.log('✨ Creating Enhanced Pixelation filter');
        this.currentFilter = new EnhancedPixelationFilter();
        break;
      case 'AltPixel':
        console.log('🎨 Creating Alternative Pixelation filter');
        this.currentFilter = new AlternativePixelationFilter();
        break;
      case 'Verbose':
        console.log('🔍 Creating Verbose Debug filter');
        this.currentFilter = new VerboseDebugFilter();
        break;
      case 'Direct':
        console.log('🔥 Creating Direct test filter');
        this.currentFilter = new DirectTestFilter();
        break;
      case 'EasyPixel':
        console.log('🟦 Creating Simple Pixelation filter');
        this.currentFilter = new SimplePixelationFilter();
        break;
      case 'Simple':
        console.log('🟢 Creating Simple test filter');
        this.currentFilter = new SimpleTestFilter();
        break;
      case 'Test':
        console.log('🔴 Creating Test filter');
        this.currentFilter = new TestFilter();
        break;
      case 'CRT':
        console.log('🖥️ Creating CRT filter');
        this.currentFilter = new CRTFilter();
        break;
      case 'Pixelation':
        console.log('🔲 Creating Pixelation filter');
        this.currentFilter = new PixelationFilter();
        // Set resolution for pixelation filter
        if (this.gameStage && this.currentFilter instanceof PixelationFilter) {
          this.currentFilter.setResolution(1280, 768);
        }
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
    if (this.currentFilter && this.currentFilter instanceof BaseRetroFilter) {
      console.log('🎛️ Creating sliders for shader');
      this.createSlidersForShader(this.currentFilter);
    } else if (this.currentFilter instanceof WorkingPixelationFilter) {
      console.log('🎛️ Creating slider for pixelation filter');
      this.createPixelationSlider(this.currentFilter);
    } else if (
      this.currentFilter instanceof ResolutionPixelationFilter ||
      this.currentFilter instanceof WorkingResolutionPixelFilter ||
      this.currentFilter instanceof AlternativePixelationFilter ||
      this.currentFilter instanceof EnhancedPixelationFilter
    ) {
      console.log('🎛️ Creating slider for built-in pixelation filter');
      this.createBuiltInPixelationSlider(this.currentFilter);
    } else if (this.currentFilter) {
      console.log('🎛️ Direct filter applied (no sliders)');
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
}
