"use client";

import { useRef, useMemo, useEffect } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { useVideoTracker } from "@/components/functions/UseVideoTracker.jsx";

const TRAIL_SIZE = 32;

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
  uniform vec2 uTrail[32]; 
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
    
    for(int i = 0; i < 31; i++) {
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

      float age = float(i) / 31.0;
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

// Creates a fallback video that lives in the DOM (detached videos are
// unreliable in Safari/iOS). Only used when the container has no <video>.
const createFallbackVideo = (src) => {
  const vid = document.createElement("video");
  vid.crossOrigin = "anonymous"; // must be set BEFORE src
  vid.muted = true;
  vid.defaultMuted = true;
  vid.setAttribute("muted", "");
  vid.loop = true;
  vid.autoplay = true;
  vid.playsInline = true;
  vid.setAttribute("playsinline", "");
  vid.preload = "auto";
  vid.src = src;
  Object.assign(vid.style, {
    position: "fixed",
    top: "0",
    left: "0",
    width: "1px",
    height: "1px",
    opacity: "0",
    pointerEvents: "none",
    zIndex: "-1",
  });
  document.body.appendChild(vid);
  return vid;
};

const SingleVideoMesh = ({ element, videoSrc, brushSize = 0.07 }) => {
  const meshRef = useRef();
  const materialRef = useRef();
  const { size } = useThree();

  const trail = useMemo(
    () => new Array(TRAIL_SIZE).fill(0).map(() => new THREE.Vector2(-10, -10)),
    []
  );

  const mouseState = useRef({
    current: new THREE.Vector2(-10, -10),
    target: new THREE.Vector2(-10, -10),
    lastPos: new THREE.Vector2(-10, -10),
    isHovered: false,
  });

  // Created once. The texture is attached later in the effect below.
  const uniforms = useMemo(
    () => ({
      uTexture: { value: null },
      uResolution: { value: new THREE.Vector2(100, 100) },
      uImageRes: { value: new THREE.Vector2(1920, 1080) },
      uTrail: { value: trail },
      uTime: { value: 0 },
      uVelocity: { value: 0 },
      uBrushSize: { value: brushSize },
    }),
    [trail, brushSize]
  );

  // Video + texture setup. Reuses the page's own <video> when available.
  useEffect(() => {
    if (!element) return;

    let video = element.querySelector("video");
    let ownsVideo = false;

    if (!video) {
      const src = videoSrc || "/video/home/Banner.mp4";
      video = createFallbackVideo(src);
      ownsVideo = true;
    }

    const texture = new THREE.VideoTexture(video);
    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;
    texture.generateMipmaps = false;
    // colorSpace is left at default: this ShaderMaterial has no
    // colorspace_fragment, so raw sampled values are what we want.
    uniforms.uTexture.value = texture;

    const syncSize = () => {
      if (video.videoWidth && video.videoHeight) {
        uniforms.uImageRes.value.set(video.videoWidth, video.videoHeight);
      }
    };

    const tryPlay = () => {
      if (video.paused) {
        video.play().catch((e) => console.warn("Video play failed:", e));
      }
    };

    video.muted = true;
    syncSize();
    video.addEventListener("loadedmetadata", syncSize);
    video.addEventListener("canplay", tryPlay);
    window.addEventListener("pointerdown", tryPlay, { once: true });
    window.addEventListener("touchstart", tryPlay, { once: true });
    tryPlay();

    return () => {
      video.removeEventListener("loadedmetadata", syncSize);
      video.removeEventListener("canplay", tryPlay);
      window.removeEventListener("pointerdown", tryPlay);
      window.removeEventListener("touchstart", tryPlay);
      texture.dispose();
      uniforms.uTexture.value = null;
      if (ownsVideo) {
        video.pause();
        video.removeAttribute("src");
        video.load();
        video.remove();
      }
      // A video we did not create belongs to the page: never pause/remove it.
    };
  }, [element, videoSrc, uniforms]);

  // Track cursor UV using live viewport coordinates
  useEffect(() => {
    const handleGlobalPointerMove = (e) => {
      if (!element) return;

      const rect = element.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return;

      const uvX = (e.clientX - rect.left) / rect.width;
      const uvY = 1.0 - (e.clientY - rect.top) / rect.height;

      const isInside = uvX >= 0 && uvX <= 1 && uvY >= 0 && uvY <= 1;

      if (isInside) {
        if (!mouseState.current.isHovered) {
          mouseState.current.isHovered = true;
          mouseState.current.current.set(uvX, uvY);
          mouseState.current.target.set(uvX, uvY);
          mouseState.current.lastPos.set(uvX, uvY);

          for (let i = 0; i < TRAIL_SIZE; i++) {
            trail[i].set(uvX, uvY);
          }

          uniforms.uVelocity.value = 0;
        } else {
          mouseState.current.target.set(uvX, uvY);
        }
      } else {
        mouseState.current.isHovered = false;
      }
    };

    window.addEventListener("pointermove", handleGlobalPointerMove);
    return () => window.removeEventListener("pointermove", handleGlobalPointerMove);
  }, [element, trail, uniforms]);

  // Frame loop: sync mesh to the DOM element and run the trail physics
  useFrame((state, delta) => {
    if (!meshRef.current || !element) return;

    const rect = element.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;

    uniforms.uResolution.value.set(rect.width, rect.height);

    const x = rect.left + rect.width / 2 - size.width / 2;
    const y = -(rect.top + rect.height / 2 - size.height / 2);

    meshRef.current.position.set(x, y, 0);
    meshRef.current.scale.set(rect.width, rect.height, 1);

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
      <planeGeometry args={[1, 1, 1, 1]} />
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

const VideoMesh = ({ brushSize = 0.07 }) => {
  const containers = useVideoTracker();

  return (
    <group>
      {containers.map((container) => (
        <SingleVideoMesh
          key={container.id}
          element={container.element}
          videoSrc={container.videoSrc}
          brushSize={brushSize}
        />
      ))}
    </group>
  );
};

export default VideoMesh;