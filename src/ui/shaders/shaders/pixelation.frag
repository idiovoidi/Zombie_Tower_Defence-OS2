precision mediump float;

varying vec2 vTextureCoord;
uniform sampler2D uSampler;
uniform float pixelSize;
uniform vec2 resolution;

void main(void) {
    // Calculate pixel coordinates
    vec2 coord = vTextureCoord * resolution;
    
    // Apply pixelation by flooring to nearest pixel boundary
    coord = floor(coord / pixelSize) * pixelSize;
    
    // Convert back to texture coordinates
    coord /= resolution;
    
    // Sample the texture at the pixelated coordinate
    gl_FragColor = texture2D(uSampler, coord);
}