import { GameConfig } from '@config/gameConfig';

export interface LayoutConfig {
  screenWidth: number;
  screenHeight: number;
  shopWidth: number;
  bottomBarHeight: number;
  gameAreaWidth: number;
  gameAreaHeight: number;
  scale: number;
}

export class ResponsiveLayout {
  private static instance: ResponsiveLayout;
  private currentLayout: LayoutConfig;

  private constructor() {
    this.currentLayout = this.calculateLayout();
    this.setupResizeHandler();
  }

  public static getInstance(): ResponsiveLayout {
    if (!ResponsiveLayout.instance) {
      ResponsiveLayout.instance = new ResponsiveLayout();
    }
    return ResponsiveLayout.instance;
  }

  private setupResizeHandler(): void {
    window.addEventListener('resize', () => {
      this.updateLayout();
    });
  }

  private calculateLayout(): LayoutConfig {
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;

    // Minimum dimensions to prevent UI from becoming unusable
    const minWidth = 800;
    const minHeight = 600;

    const effectiveWidth = Math.max(windowWidth, minWidth);
    const effectiveHeight = Math.max(windowHeight, minHeight);

    // Calculate scale based on base resolution
    const baseWidth = GameConfig.SCREEN_WIDTH;
    const baseHeight = GameConfig.SCREEN_HEIGHT;

    const scaleX = effectiveWidth / baseWidth;
    const scaleY = effectiveHeight / baseHeight;
    const scale = Math.min(scaleX, scaleY, 1.5); // Cap at 1.5x for readability

    // Calculate responsive dimensions
    const shopWidth = Math.max(200, GameConfig.UI_SHOP_WIDTH * scale);
    const bottomBarHeight = Math.max(60, GameConfig.UI_BOTTOM_BAR_HEIGHT * scale);

    return {
      screenWidth: effectiveWidth,
      screenHeight: effectiveHeight,
      shopWidth,
      bottomBarHeight,
      gameAreaWidth: effectiveWidth - shopWidth,
      gameAreaHeight: effectiveHeight - bottomBarHeight,
      scale,
    };
  }

  private updateLayout(): void {
    this.currentLayout = this.calculateLayout();
    // Emit event for components to update their positions
    window.dispatchEvent(
      new CustomEvent('layoutChanged', {
        detail: this.currentLayout,
      })
    );
  }

  public getLayout(): LayoutConfig {
    return { ...this.currentLayout };
  }

  // Helper methods for common positioning
  public getShopPosition(): { x: number; y: number } {
    return {
      x: this.currentLayout.screenWidth - this.currentLayout.shopWidth,
      y: 0,
    };
  }

  public getBottomBarPosition(): { x: number; y: number } {
    return {
      x: 0,
      y: this.currentLayout.screenHeight - this.currentLayout.bottomBarHeight,
    };
  }

  public getTowerInfoPosition(): { x: number; y: number } {
    const shopPos = this.getShopPosition();
    return {
      x: shopPos.x,
      y: 550 * this.currentLayout.scale,
    };
  }

  // Check if screen is mobile-sized
  public isMobile(): boolean {
    return this.currentLayout.screenWidth < 768;
  }

  // Check if screen is tablet-sized
  public isTablet(): boolean {
    return this.currentLayout.screenWidth >= 768 && this.currentLayout.screenWidth < 1024;
  }
}
