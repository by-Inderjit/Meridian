export const vertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

export const fragmentShader = `
  uniform sampler2D uTexture;
  uniform vec2 uResolution;
  uniform vec2 uImageRes;
  uniform vec2 uTrail[64];
  uniform float uTime;
  uniform float uVelocity;
  uniform float uBrushSize;

  varying vec2 vUv;

  void main() {
    // 1. Object-Fit: Cover Logic
    vec2 ratio = vec2(
      min((uResolution.x / uResolution.y) / (uImageRes.x / uImageRes.y), 1.0),
      min((uResolution.y / uResolution.x) / (uImageRes.y / uImageRes.x), 1.0)
    );
    
    vec2 uv = vec2(
      vUv.x * ratio.x + (1.0 - ratio.x) * 0.5,
      vUv.y * ratio.y + (1.0 - ratio.y) * 0.5
    );

    // 2. Water Brush Trail Effect
    vec2 totalOffset = vec2(0.0);
    
    for(int i = 0; i < 63; i++) {
      vec2 a = uTrail[i];
      vec2 b = uTrail[i+1];
      vec2 pa = vUv - a;
      vec2 ba = b - a;
      float l2 = dot(ba, ba);
      
      float h = 0.0;
      if (l2 > 0.000001) {
        h = clamp(dot(pa, ba) / l2, 0.0, 1.0);
      }
      
      vec2 closestPoint = a + ba * h;
      vec2 dir = vUv - closestPoint;
      float dist = length(dir);

      float age = float(i) / 63.0;
      // non-linear fade for smoother tail
      float intensity = pow(1.0 - age, 2.0); 
      
      // Taper the brush size at both the start and end of the trail
      // This creates a pointy tip at the mouse cursor and the tail
      float taper = sin(age * 1.1415926535);
      float currentBrushSize = uBrushSize * (0.1 + 0.9 * taper);
      
      float falloff = smoothstep(currentBrushSize, 0.0, dist) * intensity;
      
      if (falloff > 0.0) {
        // Divide by currentBrushSize instead of dist to avoid the sharp seam at the center.
        // This makes the displacement 0 at the exact center and smoothly increase outwards.
        dir /= currentBrushSize; 
        
        // Multiply by 4.0 to maintain the same visual strength of the distortion
        totalOffset += (dir * 4.0) * falloff;
      }
    }
    
    // Scale the distortion based on velocity so it rests when the mouse stops
    float distortionStrength = 0.1 * uVelocity;
    vec2 distortedUv = uv - totalOffset * distortionStrength; // subtract to bulge out

    // Glassy chromatic aberration effect
    float r = texture2D(uTexture, distortedUv + totalOffset * distortionStrength * 0.2).r;
    float g = texture2D(uTexture, distortedUv).g;
    float b = texture2D(uTexture, distortedUv - totalOffset * distortionStrength * 0.2).b;
    
    gl_FragColor = vec4(r, g, b, 1.0);
  }
`;