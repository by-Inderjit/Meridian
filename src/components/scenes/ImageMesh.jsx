"use client";

import { useRef, useMemo, useEffect } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { useTexture } from "@react-three/drei";
import * as THREE from "three";

import { useContainerTracker } from "@/components/functions/UseContainerTracker.jsx";

// --- SHADERS ---
const vertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const fragmentShader = `
  uniform sampler2D uTexture;
  uniform vec2 uResolution;
  uniform vec2 uImageRes;
  uniform vec2 uTrail[64];
  uniform float uTime;
  uniform float uVelocity;
  uniform float uBrushSize;

  varying vec2 vUv;

  void main() {
    vec2 ratio = vec2(
      min((uResolution.x / uResolution.y) / (uImageRes.x / uImageRes.y), 1.0),
      min((uResolution.y / uResolution.x) / (uImageRes.y / uImageRes.x), 1.0)
    );
    
    vec2 uv = vec2(
      vUv.x * ratio.x + (1.0 - ratio.x) * 0.5,
      vUv.y * ratio.y + (1.0 - ratio.y) * 0.5
    );

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
      float intensity = pow(1.0 - age, 2.0); 
      
      float taper = sin(age * 3.1415926535);
      float currentBrushSize = uBrushSize * (0.1 + 0.9 * taper);
      
      float falloff = smoothstep(currentBrushSize, 0.0, dist) * intensity;
      
      if (falloff > 0.0) {
        dir /= currentBrushSize; 
        totalOffset += (dir * 4.0) * falloff;
      }
    }
    
    float distortionStrength = 0.1 * uVelocity;
    vec2 distortedUv = uv - totalOffset * distortionStrength;

    float r = texture2D(uTexture, distortedUv + totalOffset * distortionStrength * 0.2).r;
    float g = texture2D(uTexture, distortedUv).g;
    float b = texture2D(uTexture, distortedUv - totalOffset * distortionStrength * 0.2).b;
    
    gl_FragColor = vec4(r, g, b, 1.0);
  }
`;

const TRAIL_SIZE = 64;

// --- INDIVIDUAL MESH ITEM FOR EACH CONTAINER ---
const SingleImageMesh = ({ element, imgSrc, brushSize = 0.07 }) => {
  const meshRef = useRef();
  const materialRef = useRef();
  const { size } = useThree();

  const textureUrl = imgSrc || "/images/home/HeroBg.jpg";
  const texture = useTexture(textureUrl);

  const trail = useMemo(
    () => new Array(TRAIL_SIZE).fill(0).map(() => new THREE.Vector2(-10, -10)),
    []
  );

  const mouseState = useRef({
    current: new THREE.Vector2(-10, -10),
    target: new THREE.Vector2(-10, -10),
    lastPos: new THREE.Vector2(-10, -10),
    isHovered: false, // Tracks if mouse is currently inside the container
  });

  const uniforms = useMemo(
    () => ({
      uTexture: { value: texture },
      uResolution: { value: new THREE.Vector2(100, 100) },
      uImageRes: {
        value: new THREE.Vector2(
          texture?.image?.width || 1000,
          texture?.image?.height || 1000
        ),
      },
      uTrail: { value: trail },
      uTime: { value: 0 },
      uVelocity: { value: 0 },
      uBrushSize: { value: brushSize },
    }),
    [texture, brushSize]
  );

  useEffect(() => {
    if (materialRef.current && texture?.image) {
      materialRef.current.uniforms.uImageRes.value.set(
        texture.image.width,
        texture.image.height
      );
      materialRef.current.uniforms.uBrushSize.value = brushSize;
    }
  }, [texture, brushSize]);

  // Precise Mouse Enter/Move Listener
  useEffect(() => {
    const handleGlobalPointerMove = (e) => {
      if (!element) return;
      const rect = element.getBoundingClientRect();

      const uvX = (e.clientX - rect.left) / rect.width;
      const uvY = 1.0 - (e.clientY - rect.top) / rect.height;

      const isInside = uvX >= 0 && uvX <= 1 && uvY >= 0 && uvY <= 1;

      if (isInside) {
        // If mouse JUST entered the div from outside
        if (!mouseState.current.isHovered) {
          mouseState.current.isHovered = true;
          
          // Snap all points immediately to exact entry position (No lerp/stretch from old positions)
          mouseState.current.current.set(uvX, uvY);
          mouseState.current.target.set(uvX, uvY);
          mouseState.current.lastPos.set(uvX, uvY);

          for (let i = 0; i < TRAIL_SIZE; i++) {
            trail[i].set(uvX, uvY);
          }

          if (materialRef.current) {
            materialRef.current.uniforms.uVelocity.value = 0;
          }
        } else {
          // Normal mouse move inside the div
          mouseState.current.target.set(uvX, uvY);
        }
      } else {
        // Mouse left the div bounds
        mouseState.current.isHovered = false;
      }
    };

    window.addEventListener("pointermove", handleGlobalPointerMove);
    return () => window.removeEventListener("pointermove", handleGlobalPointerMove);
  }, [element, trail]);

  // ZERO-DELAY SYNCHRONOUS RENDER LOOP
  useFrame((state, delta) => {
    if (!meshRef.current || !element) return;

    // Synchronous DOM tracking
    const rect = element.getBoundingClientRect();

    const x = rect.left + rect.width / 2 - size.width / 2;
    const y = -(rect.top + rect.height / 2 - size.height / 2);

    meshRef.current.scale.set(rect.width, rect.height, 1);
    meshRef.current.position.set(x, y, 0);

    if (materialRef.current) {
      materialRef.current.uniforms.uResolution.value.set(rect.width, rect.height);
    }

    // Liquid Trail Physics
    const { current, target, lastPos } = mouseState.current;
    const distanceMoved = target.distanceTo(lastPos);
    const targetVelocity = Math.min(distanceMoved * 100, 1.0);

    uniforms.uVelocity.value = THREE.MathUtils.lerp(
      uniforms.uVelocity.value,
      targetVelocity > 0.001 ? targetVelocity : 0,
      1 - Math.exp(-10 * delta)
    );

    uniforms.uTime.value = state.clock.elapsedTime;
    current.lerp(target, 0.85);

    for (let i = TRAIL_SIZE - 1; i > 0; i--) {
      trail[i].copy(trail[i - 1]);
    }
    trail[0].copy(current);
    lastPos.copy(target);
  });

  return (
    <mesh ref={meshRef}>
      <planeGeometry args={[1, 1, 64, 64]} />
      <shaderMaterial
        ref={materialRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        transparent={true}
      />
    </mesh>
  );
};

// --- MAIN WRAPPER COMPONENT ---
const ImageMesh = ({ brushSize = 0.07 }) => {
  const containers = useContainerTracker();

  return (
    <group>
      {containers.map((container) => (
        <SingleImageMesh
          key={container.id}
          element={container.element}
          imgSrc={container.imgSrc}
          brushSize={brushSize}
        />
      ))}
    </group>
  );
};

export default ImageMesh;