precision mediump float;

varying vec2 vTextureCoord;

uniform sampler2D uSampler;
uniform float time;

// CRT effect parameters
uniform float curvature;
uniform float scanlineIntensity;
uniform float phosphorGlow;
uniform float screenFlicker;
uniform float noiseAmount;

// Helper function to apply barrel distortion for screen curvature
vec2 applyCurvature(vec2 coord, float amount) {
    // Convert to centered coordinates (-1 to 1)
    vec2 centered = coord - 0.5;
    
    // Apply barrel distortion
    float r2 = dot(centered, centered);
    float distortion = 1.0 + amount * r2;
    
    // Apply distortion and convert back to texture coordinates
    return centered * distortion + 0.5;
}

// Generate scanlines effect
float getScanlines(vec2 coord, float intensity) {
    // Calculate scanline position based on screen resolution
    float scanline = sin(coord.y * 600.0 * 3.14159 * 2.0) * 0.5 + 0.5;
    
    // Apply intensity and create alternating pattern
    return 1.0 - (1.0 - scanline) * intensity;
}

// Generate phosphor glow effect
vec3 applyPhosphorGlow(vec3 color, float glowAmount) {
    // Calculate luminance
    float luminance = dot(color, vec3(0.299, 0.587, 0.114));
    
    // Create glow based on brightness
    vec3 glow = color * luminance * glowAmount;
    
    // Add slight color shift for phosphor effect
    glow.r *= 1.1;
    glow.g *= 0.9;
    glow.b *= 0.8;
    
    return color + glow;
}

// Generate screen flicker
float getFlicker(float time, float intensity) {
    // Create subtle random flicker using sine waves
    float flicker1 = sin(time * 60.0) * 0.5 + 0.5;
    float flicker2 = sin(time * 47.3) * 0.3 + 0.7;
    float flicker3 = sin(time * 83.7) * 0.2 + 0.8;
    
    float combinedFlicker = flicker1 * flicker2 * flicker3;
    
    // Apply intensity and ensure minimum brightness
    return mix(1.0, combinedFlicker, intensity * 0.1);
}

// Generate noise
float getNoise(vec2 coord, float time, float amount) {
    // Create pseudo-random noise using coordinate and time
    vec2 noiseCoord = coord + time * 0.1;
    float noise = fract(sin(dot(noiseCoord, vec2(12.9898, 78.233))) * 43758.5453);
    
    // Convert to bipolar noise and apply amount
    return (noise - 0.5) * amount * 0.1;
}

void main(void) {
    vec2 coord = vTextureCoord;
    
    // Apply screen curvature
    if (curvature > 0.0) {
        coord = applyCurvature(coord, curvature * 0.2);
        
        // Check if coordinates are outside the screen bounds after distortion
        if (coord.x < 0.0 || coord.x > 1.0 || coord.y < 0.0 || coord.y > 1.0) {
            gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
            return;
        }
    }
    
    // Sample the original texture
    vec4 color = texture2D(uSampler, coord);
    
    // Apply scanlines
    if (scanlineIntensity > 0.0) {
        float scanlineFactor = getScanlines(coord, scanlineIntensity);
        color.rgb *= scanlineFactor;
    }
    
    // Apply phosphor glow
    if (phosphorGlow > 0.0) {
        color.rgb = applyPhosphorGlow(color.rgb, phosphorGlow);
    }
    
    // Apply screen flicker
    if (screenFlicker > 0.0) {
        float flickerFactor = getFlicker(time, screenFlicker);
        color.rgb *= flickerFactor;
    }
    
    // Add noise
    if (noiseAmount > 0.0) {
        float noise = getNoise(coord, time, noiseAmount);
        color.rgb += vec3(noise);
    }
    
    // Ensure color values stay within valid range
    color.rgb = clamp(color.rgb, 0.0, 1.0);
    
    gl_FragColor = color;
}