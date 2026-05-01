import { Filter, GlProgram } from 'pixi.js';

/**
 * Pass Through - Does absolutely nothing, just passes the image through
 * If this doesn't work, the problem is with filter application, not shader code
 */
export class PassThroughFilter extends Filter {
  constructor() {
    const vertex = `
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

    const fragment = `
      in vec2 vTextureCoord;
      uniform sampler2D uTexture;
      out vec4 finalColor;

      void main(void) {
        finalColor = texture(uTexture, vTextureCoord);
      }
    `;

    const gpuProgram = GlProgram.from({ vertex, fragment, name: 'pass-through' });

    super({
      glProgram: gpuProgram,
      resources: {},
    });
  }
}

/**
 * Red Tint - Adds a red tint
 * Simple test to verify basic color manipulation works
 */
export class RedTintFilter extends Filter {
  constructor() {
    const vertex = `
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

    const fragment = `
      in vec2 vTextureCoord;
      uniform sampler2D uTexture;
      out vec4 finalColor;

      void main(void) {
        vec4 color = texture(uTexture, vTextureCoord);
        color.r = min(color.r + 0.3, 1.0);
        finalColor = color;
      }
    `;

    const gpuProgram = GlProgram.from({ vertex, fragment, name: 'red-tint' });

    super({
      glProgram: gpuProgram,
      resources: {},
    });
  }
}

/**
 * Simple Grayscale - Converts to grayscale
 * Tests if color calculations work
 */
export class SimpleGrayscaleFilter extends Filter {
  constructor() {
    const vertex = `
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

    const fragment = `
      in vec2 vTextureCoord;
      uniform sampler2D uTexture;
      out vec4 finalColor;

      void main(void) {
        vec4 color = texture(uTexture, vTextureCoord);
        float gray = color.r * 0.299 + color.g * 0.587 + color.b * 0.114;
        finalColor = vec4(gray, gray, gray, color.a);
      }
    `;

    const gpuProgram = GlProgram.from({ vertex, fragment, name: 'simple-grayscale' });

    super({
      glProgram: gpuProgram,
      resources: {},
    });
  }
}

/**
 * Super Simple Pixelation - Most basic pixelation possible
 * Tests if coordinate manipulation works
 */
export class SuperSimplePixelationFilter extends Filter {
  constructor() {
    const vertex = `
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

    const fragment = `
      in vec2 vTextureCoord;
      uniform sampler2D uTexture;
      uniform vec4 uInputSize;
      out vec4 finalColor;

      void main(void) {
        float pixelSize = 4.0;
        vec2 pixelatedCoord = floor(vTextureCoord * uInputSize.xy / pixelSize) * pixelSize / uInputSize.xy;
        finalColor = texture(uTexture, pixelatedCoord);
      }
    `;

    const gpuProgram = GlProgram.from({ vertex, fragment, name: 'super-simple-pixelation' });

    super({
      glProgram: gpuProgram,
      resources: {},
    });
  }
}

/**
 * Simple Edge Detection - Simplified Sobel operator
 */
export class SimpleEdgeDetectionFilter extends Filter {
  constructor(options: { thickness?: number } = {}) {
    const thickness = options.thickness ?? 1.0;

    const vertex = `
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

    const fragment = `
      in vec2 vTextureCoord;
      uniform sampler2D uTexture;
      uniform vec4 uInputSize;
      uniform float uThickness;

      out vec4 finalColor;

      void main(void) {
        vec2 texel = uThickness / uInputSize.xy;
        
        // Simplified edge detection - just check horizontal and vertical neighbors
        vec4 center = texture(uTexture, vTextureCoord);
        vec4 left = texture(uTexture, vTextureCoord + vec2(-texel.x, 0.0));
        vec4 right = texture(uTexture, vTextureCoord + vec2(texel.x, 0.0));
        vec4 up = texture(uTexture, vTextureCoord + vec2(0.0, texel.y));
        vec4 down = texture(uTexture, vTextureCoord + vec2(0.0, -texel.y));
        
        // Calculate differences
        float diffH = length(right.rgb - left.rgb);
        float diffV = length(down.rgb - up.rgb);
        float edge = diffH + diffV;
        
        // If edge detected, draw black line
        if (edge > 0.3) {
          finalColor = vec4(0.0, 0.0, 0.0, center.a);
        } else {
          finalColor = center;
        }
      }
    `;

    const gpuProgram = GlProgram.from({ vertex, fragment, name: 'simple-edge-detection' });

    super({
      glProgram: gpuProgram,
      resources: {
        edgeUniforms: {
          uThickness: { value: thickness, type: 'f32' },
        },
      },
    });
  }

  set thickness(value: number) {
    this.resources.edgeUniforms.uniforms.uThickness = value;
  }

  get thickness(): number {
    return this.resources.edgeUniforms.uniforms.uThickness;
  }
}

/**
 * Fixed Game Boy - Simplified with no arrays
 */
export class FixedGameBoyFilter extends Filter {
  constructor() {
    const vertex = `
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

    const fragment = `
      in vec2 vTextureCoord;
      uniform sampler2D uTexture;
      out vec4 finalColor;

      void main(void) {
        vec4 color = texture(uTexture, vTextureCoord);
        
        // Convert to grayscale
        float gray = color.r * 0.299 + color.g * 0.587 + color.b * 0.114;
        
        // Map to 4 shades of green (Game Boy palette)
        vec3 gbColor;
        
        if (gray < 0.25) {
          gbColor = vec3(0.06, 0.22, 0.06);
        } else if (gray < 0.5) {
          gbColor = vec3(0.19, 0.38, 0.19);
        } else if (gray < 0.75) {
          gbColor = vec3(0.55, 0.68, 0.06);
        } else {
          gbColor = vec3(0.61, 0.74, 0.06);
        }
        
        finalColor = vec4(gbColor, color.a);
      }
    `;

    const gpuProgram = GlProgram.from({ vertex, fragment, name: 'fixed-gameboy' });

    super({
      glProgram: gpuProgram,
      resources: {},
    });
  }
}
