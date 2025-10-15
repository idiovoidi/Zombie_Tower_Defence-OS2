/**
 * Enum for available shader types
 */
export enum ShaderType {
  NONE = 'none',
  PIXELATION = 'pixelation',
  CRT = 'crt',
}

/**
 * Interface for shader configuration settings
 */
export interface ShaderSettings {
  pixelation: PixelationSettings;
  crt: CRTSettings;
}

/**
 * Pixelation shader settings
 */
export interface PixelationSettings {
  pixelSize: number; // 1-8 pixels
  enabled: boolean;
}

/**
 * CRT shader settings
 */
export interface CRTSettings {
  curvature: number; // 0.0-1.0
  scanlineIntensity: number; // 0.0-1.0
  phosphorGlow: number; // 0.0-1.0
  screenFlicker: number; // 0.0-1.0
  noiseAmount: number; // 0.0-1.0
  enabled: boolean;
}

/**
 * Shader performance metrics
 */
export interface ShaderPerformanceMetrics {
  frameRate: number;
  renderTime: number;
  memoryUsage: number;
  shaderCompileTime: number;
}

/**
 * Stored shader configuration for persistence
 */
export interface StoredShaderConfig {
  version: string;
  activeShader: ShaderType;
  settings: ShaderSettings;
  lastModified: string;
}

/**
 * Default shader settings
 */
export const DEFAULT_SHADER_SETTINGS: ShaderSettings = {
  pixelation: {
    pixelSize: 2,
    enabled: false,
  },
  crt: {
    curvature: 0.3,
    scanlineIntensity: 0.5,
    phosphorGlow: 0.4,
    screenFlicker: 0.1,
    noiseAmount: 0.2,
    enabled: false,
  },
};

/**
 * Shader parameter validation ranges
 */
export const SHADER_PARAMETER_RANGES = {
  pixelation: {
    pixelSize: { min: 1, max: 8 },
  },
  crt: {
    curvature: { min: 0.0, max: 1.0 },
    scanlineIntensity: { min: 0.0, max: 1.0 },
    phosphorGlow: { min: 0.0, max: 1.0 },
    screenFlicker: { min: 0.0, max: 1.0 },
    noiseAmount: { min: 0.0, max: 1.0 },
  },
} as const;

/**
 * Shader configuration version for migration support
 */
export const SHADER_CONFIG_VERSION = '1.0.0';
