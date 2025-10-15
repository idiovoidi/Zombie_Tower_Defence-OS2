import { Application } from 'pixi.js';
import { ShaderPerformanceMetrics, ShaderSettings, ShaderType } from '../types/ShaderTypes';

/**
 * Interface for shader management system
 */
export interface IShaderManager {
  /**
   * Initialize the shader manager with PixiJS application
   * @param app - PixiJS Application instance
   */
  initialize(app: Application): Promise<void>;

  /**
   * Apply a shader to the application
   * @param shaderType - Type of shader to apply
   */
  applyShader(shaderType: ShaderType): Promise<void>;

  /**
   * Remove currently active shader
   */
  removeShader(): void;

  /**
   * Update shader settings
   * @param settings - New shader settings
   */
  updateShaderSettings(settings: Partial<ShaderSettings>): void;

  /**
   * Get list of available shader types
   * @returns Array of available shader types
   */
  getAvailableShaders(): ShaderType[];

  /**
   * Get currently active shader type
   * @returns Current shader type or null if none active
   */
  getCurrentShader(): ShaderType | null;

  /**
   * Check if any shader is currently active
   * @returns True if shader is active
   */
  isShaderActive(): boolean;

  /**
   * Get current shader settings
   * @returns Current shader settings
   */
  getCurrentSettings(): ShaderSettings;

  /**
   * Get shader performance metrics
   * @returns Performance metrics object
   */
  getPerformanceMetrics(): ShaderPerformanceMetrics;

  /**
   * Save shader settings to persistent storage
   */
  saveSettings(): void;

  /**
   * Load shader settings from persistent storage
   */
  loadSettings(): void;

  /**
   * Reset all settings to defaults
   */
  resetToDefaults(): void;

  /**
   * Dispose of shader manager resources
   */
  dispose(): void;
}
