/**
 * Shared shader utilities for PixiJS filters
 * Extracted to eliminate duplication between CreativeFilters and InscryptionFilters
 */

/**
 * Standard vertex shader for 2D filters
 * This is the common vertex shader used across all filters
 */
export const STANDARD_VERTEX_SHADER = `
  in vec2 aPosition;
  out vec2 vTextureCoord;

  uniform vec4 uInputSize;
  uniform vec4 uOutputFrame;
  uniform vec4 uOutputTexture;

  vec4 filterVertexPosition(void) {
    vec2 position = aPosition * uOutputFrame.zw + uOutputFrame.xy;
    position.x = position.x * (2.0 / uOutputTexture.x) - 1.0;
    position.y = position.y * (2.0 * uOutputTexture.z / uOutputTexture.y) - uOutputTexture.z;
    return vec4(position, 0.0, 1.0);
  }

  vec2 filterTextureCoord(void) {
    return aPosition * (uOutputFrame.zw * uInputSize.zw);
  }

  void main(void) {
    gl_Position = filterVertexPosition();
    vTextureCoord = filterTextureCoord();
  }
`;

/**
 * Standard vertex shader with screen coordinate output
 * Used for filters that need pixel-perfect screen coordinates (e.g., scanlines)
 */
export const VERTEX_SHADER_WITH_SCREEN_COORD = `
  in vec2 aPosition;
  out vec2 vTextureCoord;
  out vec2 vScreenCoord;

  uniform vec4 uInputSize;
  uniform vec4 uOutputFrame;
  uniform vec4 uOutputTexture;

  vec4 filterVertexPosition(void) {
    vec2 position = aPosition * uOutputFrame.zw + uOutputFrame.xy;
    position.x = position.x * (2.0 / uOutputTexture.x) - 1.0;
    position.y = position.y * (2.0 * uOutputTexture.z / uOutputTexture.y) - uOutputTexture.z;
    return vec4(position, 0.0, 1.0);
  }

  vec2 filterTextureCoord(void) {
    return aPosition * (uOutputFrame.zw * uInputSize.zw);
  }

  void main(void) {
    gl_Position = filterVertexPosition();
    vTextureCoord = filterTextureCoord();
    vScreenCoord = vTextureCoord * uInputSize.xy;
  }
`;

/**
 * Random function for noise/grain effects
 */
export const RANDOM_FUNCTION = `
  float random(vec2 co) {
    return fract(sin(dot(co.xy, vec2(12.9898, 78.233))) * 43758.5453);
  }
`;

/**
 * Luminance calculation helper
 */
export const LUMINANCE_FUNCTION = `
  float luminance(vec3 color) {
    return dot(color.rgb, vec3(0.299, 0.587, 0.114));
  }
`;
