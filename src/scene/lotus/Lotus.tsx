"use client";

import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import {
  AdditiveBlending,
  BufferAttribute,
  CanvasTexture,
  Color,
  DoubleSide,
  Group,
  Mesh,
  MeshPhysicalMaterial,
  PointLight,
  Sprite,
  SpriteMaterial,
} from "three";
import { useBloom } from "@/hero/bloomStore";
import { LOTUS_TIERS, createPetalGeometry, smoothstep, type Tier } from "./petalGeometry";

const PEARL = new Color("#f1e0c9");
const ROOT = new Color("#b0855a");
const INNER_GOLD = new Color("#e2ae74");
const GLOW = new Color("#fde0bd");
const SHEEN = new Color("#ffe9d2");

/** Pearlescent petal material with a golden root tint and an inner-face glow. */
function createPetalMaterial(glowStrength: number) {
  const material = new MeshPhysicalMaterial({
    color: PEARL,
    roughness: 0.58,
    metalness: 0,
    sheen: 1,
    sheenRoughness: 0.45,
    sheenColor: SHEEN,
    clearcoat: 0.16,
    clearcoatRoughness: 0.5,
    iridescence: 0.35,
    iridescenceIOR: 1.3,
    iridescenceThicknessRange: [180, 420],
    side: DoubleSide,
  });
  material.defines = { ...(material.defines ?? {}), USE_UV: "" };
  const uniforms = {
    uRoot: { value: ROOT },
    uInnerGold: { value: INNER_GOLD },
    uGlow: { value: GLOW },
    uGlowStrength: { value: glowStrength },
    uBloom: { value: 0 },
  };
  material.userData.uniforms = uniforms;
  material.onBeforeCompile = (shader) => {
    Object.assign(shader.uniforms, uniforms);
    shader.fragmentShader = shader.fragmentShader
      .replace(
        "#include <common>",
        `#include <common>
uniform vec3 uRoot;
uniform vec3 uInnerGold;
uniform vec3 uGlow;
uniform float uGlowStrength;
uniform float uBloom;`,
      )
      .replace(
        "#include <color_fragment>",
        `#include <color_fragment>
float along = vUv.y;
float across = abs(vUv.x - 0.5) * 2.0;
// gold-umber at the root, pearl along the body, a whisper brighter at the tip
diffuseColor.rgb = mix(uRoot, diffuseColor.rgb, smoothstep(0.0, 0.36, along));
// the inside of the flower carries a warm golden blush toward the heart
if (gl_FrontFacing) diffuseColor.rgb = mix(uInnerGold, diffuseColor.rgb, smoothstep(0.02, 0.78, along));
diffuseColor.rgb = mix(diffuseColor.rgb, vec3(0.99, 0.95, 0.91), smoothstep(0.7, 1.0, along) * 0.35);
// faint vein shading along the midrib
diffuseColor.rgb *= 1.0 - 0.05 * (1.0 - smoothstep(0.0, 0.18, across)) * smoothstep(0.1, 0.9, along);`,
      )
      .replace(
        "#include <emissivemap_fragment>",
        `#include <emissivemap_fragment>
float innerFace = gl_FrontFacing ? 1.0 : 0.3;
float rootGlow = pow(1.0 - vUv.y, 2.4);
totalEmissiveRadiance += uGlow * uGlowStrength * 2.6 * rootGlow * innerFace * (0.22 + 0.78 * uBloom);
// fake translucency: thin petal edges and grazing angles let warm light through
float facing = abs(dot(normal, normalize(vViewPosition)));
float rim = pow(1.0 - facing, 2.6);
float edge = smoothstep(0.55, 1.0, abs(vUv.x - 0.5) * 2.0);
totalEmissiveRadiance += vec3(1.0, 0.84, 0.66) * (0.16 * rim + 0.07 * edge) * (0.6 + 0.4 * uBloom);`,
      );
  };
  return material;
}

type PetalRef = { mesh: Mesh; tier: Tier; angle: number };

function makeHaloTexture() {
  const size = 128;
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  g.addColorStop(0, "rgba(255,226,184,0.95)");
  g.addColorStop(0.25, "rgba(255,214,160,0.45)");
  g.addColorStop(1, "rgba(255,214,160,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, size, size);
  return new CanvasTexture(canvas);
}

/** Additive halo that brightens as the lotus opens. */
function HeartHalo() {
  const ref = useRef<Sprite>(null);
  const texture = useMemo(() => (typeof document !== "undefined" ? makeHaloTexture() : null), []);
  useEffect(() => () => texture?.dispose(), [texture]);
  useFrame(() => {
    const s = ref.current;
    if (!s) return;
    const p = smoothstep(0.3, 1, useBloom.getState().progress);
    (s.material as SpriteMaterial).opacity = 0.15 + 0.75 * p;
    s.scale.setScalar(0.7 + 0.8 * p);
  });
  return (
    <sprite ref={ref} position={[0, 0.42, 0]}>
      <spriteMaterial map={texture} transparent depthWrite={false} blending={AdditiveBlending} toneMapped={false} />
    </sprite>
  );
}

export function Lotus({ breathe = true }: { breathe?: boolean }) {
  const group = useRef<Group>(null);
  const coreLight = useRef<PointLight>(null);
  const petals = useRef<PetalRef[]>([]);

  const tiers = useMemo(
    () =>
      LOTUS_TIERS.map((tier) => {
        const geometry = createPetalGeometry({ ...tier.shape, curl: tier.shape.curl });
        // morph target: the same petal with its open-state curl
        const open = createPetalGeometry({ ...tier.shape, curl: tier.curlOpen });
        geometry.morphAttributes.position = [open.getAttribute("position") as BufferAttribute];
        geometry.morphAttributes.normal = [open.getAttribute("normal") as BufferAttribute];
        open.dispose();
        return { tier, geometry, material: createPetalMaterial(tier.glow) };
      }),
    [],
  );

  useEffect(
    () => () => {
      tiers.forEach(({ geometry, material }) => {
        geometry.dispose();
        material.dispose();
      });
    },
    [tiers],
  );

  useFrame((state) => {
    const { progress } = useBloom.getState();
    const t = state.clock.elapsedTime;

    for (const p of petals.current) {
      const local = smoothstep(p.tier.window[0], p.tier.window[1], progress);
      const tilt = p.tier.tiltClosed + (p.tier.tiltOpen - p.tier.tiltClosed) * local;
      p.mesh.rotation.x = tilt;
      if (p.mesh.morphTargetInfluences) p.mesh.morphTargetInfluences[0] = local;
      const mat = p.mesh.material as MeshPhysicalMaterial;
      (mat.userData.uniforms as { uBloom: { value: number } }).uBloom.value = progress;
    }

    if (coreLight.current) coreLight.current.intensity = 0.4 + 4.2 * smoothstep(0.35, 1, progress);

    if (group.current) {
      // pointer depth on the lotus only, ≤ 3°
      const targetX = -0.06 + state.pointer.y * 0.05;
      const targetY = state.pointer.x * 0.05;
      group.current.rotation.x += (targetX - group.current.rotation.x) * 0.04;
      group.current.rotation.y += (targetY - group.current.rotation.y) * 0.04;
      // a breath every ~6s while exploring
      const breath = breathe ? Math.sin((t * Math.PI * 2) / 6) * 0.006 : 0;
      group.current.scale.setScalar(1 + breath);
    }
  });

  return (
    <group ref={group}>
      {tiers.map(({ tier, geometry, material }, ti) => (
        <group key={ti} position={[0, tier.lift, 0]}>
          {Array.from({ length: tier.count }, (_, k) => {
            const angle = ((k + tier.phase) / tier.count) * Math.PI * 2;
            return (
              <group key={k} rotation={[0, angle, 0]}>
                <mesh
                  geometry={geometry}
                  material={material}
                  position={[0, 0, tier.radius]}
                  rotation={[tier.tiltClosed, 0, 0]}
                  morphTargetInfluences={[0]}
                  ref={(mesh) => {
                    if (!mesh) return;
                    const existing = petals.current.find((p) => p.mesh === mesh);
                    if (!existing) petals.current.push({ mesh, tier, angle });
                  }}
                />
              </group>
            );
          })}
        </group>
      ))}
      {/* warm light living inside the flower */}
      <pointLight ref={coreLight} position={[0, 0.32, 0]} color="#ffd3a1" intensity={0.25} distance={3.2} decay={1.4} />
      {/* the glowing heart: a warm seed of light with a soft halo */}
      <mesh position={[0, 0.26, 0]}>
        <sphereGeometry args={[0.1, 24, 16]} />
        <meshBasicMaterial color="#ffe2b8" toneMapped={false} />
      </mesh>
      <HeartHalo />
    </group>
  );
}
