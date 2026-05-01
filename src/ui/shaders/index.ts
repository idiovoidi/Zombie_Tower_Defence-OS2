// Export base filter class
export { BaseRetroFilter } from './filters/BaseRetroFilter';

// Export filter implementations
export { PixelationFilter } from './filters/PixelationFilter';
// Export shader manager interface
export type { IShaderManager } from './interfaces/IShaderManager';
// Export shader types and interfaces
export {
  type CRTSettings,
  DEFAULT_SHADER_SETTINGS,
  type PixelationSettings,
  SHADER_CONFIG_VERSION,
  SHADER_PARAMETER_RANGES,
  type ShaderPerformanceMetrics,
  type ShaderSettings,
  ShaderType,
  type StoredShaderConfig,
} from './types/ShaderTypes';

// Shader source loader utility
export class ShaderLoader {
  private static cache = new Map<string, string>();

  /**
   * Load shader source code from file
   * @param shaderPath - Path to shader file
   * @returns Promise resolving to shader source code
   */
  static async loadShader(shaderPath: string): Promise<string> {
    if (ShaderLoader.cache.has(shaderPath)) {
      return ShaderLoader.cache.get(shaderPath)!;
    }

    try {
      const response = await fetch(shaderPath);
      if (!response.ok) {
        throw new Error(`Failed to load shader: ${shaderPath}`);
      }
      const source = await response.text();
      ShaderLoader.cache.set(shaderPath, source);
      return source;
    } catch (error) {
      console.error(`Error loading shader ${shaderPath}:`, error);
      throw error;
    }
  }

  /**
   * Load pixelation shader sources
   * @returns Promise resolving to vertex and fragment shader sources
   */
  static async loadPixelationShaders(): Promise<{ vertex: string; fragment: string }> {
    const [vertex, fragment] = await Promise.all([
      ShaderLoader.loadShader('/src/ui/shaders/shaders/pixelation.vert'),
      ShaderLoader.loadShader('/src/ui/shaders/shaders/pixelation.frag'),
    ]);
    return { vertex, fragment };
  }

  /**
   * Load CRT shader sources
   * @returns Promise resolving to vertex and fragment shader sources
   */
  static async loadCRTShaders(): Promise<{ vertex: string; fragment: string }> {
    const [vertex, fragment] = await Promise.all([
      ShaderLoader.loadShader('/src/ui/shaders/shaders/crt.vert'),
      ShaderLoader.loadShader('/src/ui/shaders/shaders/crt.frag'),
    ]);
    return { vertex, fragment };
  }

  /**
   * Clear shader cache
   */
  static clearCache(): void {
    ShaderLoader.cache.clear();
  }
}
