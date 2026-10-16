"use client";

import { Canvas, useFrame, useLoader, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import { LinearMipmapLinearFilter, NoColorSpace, ShaderMaterial, TextureLoader, type Group, type Texture } from "three";

/**
 * The approved lotus as a real surface: its texture is displaced by a depth map, so a
 * small tilt produces true parallax between the heart and the outer petals. Pixels are
 * passed through untouched (no tone mapping), so it matches the approved design exactly.
 */

export type LotusLive = { glow: number; bright: number; tiltScale: number };

const ASPECT = 520 / 820;
const PAD = 1.16; // canvas is 16% larger than the lotus so tilt never clips

const vert = /* glsl */ `
uniform sampler2D uDepth;
uniform float uAmt;
varying vec2 vUv;
void main() {
  vUv = uv;
  vec3 p = position;
  p.z += texture2D(uDepth, uv).r * uAmt;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
}`;

const frag = /* glsl */ `
uniform sampler2D uMap;
uniform float uGlow;
uniform float uBright;
varying vec2 vUv;
void main() {
  vec4 c = texture2D(uMap, vUv);
  vec2 q = (vUv - vec2(0.5, 0.47)) * vec2(1.0, ${ASPECT.toFixed(4)});
  float heart = smoothstep(0.2, 0.0, length(q));
  c.rgb = c.rgb * uBright + uGlow * vec3(1.0, 0.86, 0.62) * heart * 0.55;
  gl_FragColor = vec4(c.rgb * c.a, c.a);
}`;

function prep(t: Texture) {
  t.colorSpace = NoColorSpace;
  t.minFilter = LinearMipmapLinearFilter;
  t.anisotropy = 8;
  return t;
}

function Plane({ live, onReady }: { live: React.RefObject<LotusLive>; onReady?: () => void }) {
  const [map, depth] = useLoader(TextureLoader, ["/assets/lotus.png", "/assets/lotus-depth.png"]);
  const group = useRef<Group>(null);
  const { invalidate } = useThree();
  const target = useRef({ x: 0, y: 0 });

  const mat = useMemo(
    () =>
      new ShaderMaterial({
        uniforms: { uMap: { value: prep(map) }, uDepth: { value: prep(depth) }, uAmt: { value: 0.22 }, uGlow: { value: 0 }, uBright: { value: 1 } },
        vertexShader: vert,
        fragmentShader: frag,
        transparent: true,
        premultipliedAlpha: true,
        depthWrite: false,
      }),
    [map, depth],
  );
  useEffect(() => () => mat.dispose(), [mat]);
  // textures are loaded once this mounts; reveal after the first real frame
  useEffect(() => {
    invalidate();
    const id = requestAnimationFrame(() => requestAnimationFrame(() => onReady?.()));
    return () => cancelAnimationFrame(id);
  }, [invalidate, onReady]);

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      target.current = { x: (e.clientX / window.innerWidth) * 2 - 1, y: (e.clientY / window.innerHeight) * 2 - 1 };
      invalidate();
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, [invalidate]);

  useFrame(() => {
    const g = group.current;
    if (!g) return;
    const k = live.current?.tiltScale ?? 1;
    const ty = target.current.x * 0.075 * k; // ≈ ±4°
    const tx = target.current.y * 0.05 * k;
    g.rotation.y += (ty - g.rotation.y) * 0.08;
    g.rotation.x += (tx - g.rotation.x) * 0.08;
    mat.uniforms.uGlow.value = live.current?.glow ?? 0;
    mat.uniforms.uBright.value = live.current?.bright ?? 1;
    // keep rendering only while something is still settling
    if (Math.abs(ty - g.rotation.y) > 0.0005 || Math.abs(tx - g.rotation.x) > 0.0005 || (live.current?.glow ?? 0) > 0.001) invalidate();
  });

  return (
    <group ref={group}>
      <mesh material={mat}>
        <planeGeometry args={[2, 2 * ASPECT, 200, 130]} />
      </mesh>
    </group>
  );
}

export default function LotusCanvas({ live, active, onReady }: { live: React.RefObject<LotusLive>; active: boolean; onReady?: () => void }) {
  // camera framing: the plane (2 wide) fills 1/PAD of the view
  const fov = 20;
  const dist = (2 * ASPECT * PAD) / (2 * Math.tan(((fov / 2) * Math.PI) / 180));
  return (
    <Canvas
      frameloop={active ? "demand" : "never"}
      dpr={[1, 2]}
      gl={{ antialias: true, alpha: true, premultipliedAlpha: true, powerPreference: "high-performance" }}
      camera={{ fov, position: [0, 0, dist], near: 0.1, far: 50 }}
      style={{ position: "absolute", left: `${-((PAD - 1) / 2) * 100}%`, top: `${-((PAD - 1) / 2) * 100}%`, width: `${PAD * 100}%`, height: `${PAD * 100}%` }}
      onCreated={({ gl }) => gl.setClearColor(0x000000, 0)}
      aria-hidden="true"
    >
      <Plane live={live} onReady={onReady} />
    </Canvas>
  );
}
