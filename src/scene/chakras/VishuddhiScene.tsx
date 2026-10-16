"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import {
  ACESFilmicToneMapping,
  Color,
  DoubleSide,
  ExtrudeGeometry,
  Group,
  MeshPhysicalMaterial,
  PMREMGenerator,
  Path,
  SRGBColorSpace,
  Shape,
} from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";

/**
 * Vishuddhi in three dimensions, following the official Sahaja Yoga USA chakra guide:
 * sixteen light-blue petals around a circle, a downward triangle, a cream ring and an
 * inner circle. Sculpted relief with a pearlescent finish; motion only while exploring.
 */

const PETALS = 16;

function petalShape(r0: number, r1: number, half: number) {
  const s = new Shape();
  const w = Math.sin(half) * r0;
  const mid = (r0 + r1) * 0.56;
  s.moveTo(-w, r0);
  s.bezierCurveTo(-w * 1.85, mid, -w * 0.4, r1 * 0.95, 0, r1);
  s.bezierCurveTo(w * 0.4, r1 * 0.95, w * 1.85, mid, w, r0);
  s.lineTo(-w, r0);
  return s;
}

function ringShape(outer: number, inner: number) {
  const s = new Shape();
  s.absarc(0, 0, outer, 0, Math.PI * 2, false);
  const hole = new Path();
  hole.absarc(0, 0, inner, 0, Math.PI * 2, true);
  s.holes.push(hole);
  return s;
}

function triangleOutline(r: number, thickness: number) {
  const pts = (rad: number) =>
    [0, 1, 2].map((k) => {
      const a = (k / 3) * Math.PI * 2 - Math.PI / 2; // downward triangle: apex at bottom
      return [Math.cos(a) * rad, Math.sin(a) * rad] as const;
    });
  const outer = pts(r);
  const inner = pts(r - thickness * 2);
  const s = new Shape();
  s.moveTo(outer[0][0], outer[0][1]);
  outer.slice(1).forEach(([x, y]) => s.lineTo(x, y));
  s.closePath();
  const h = new Path();
  h.moveTo(inner[0][0], inner[0][1]);
  [...inner.slice(1)].reverse().forEach(([x, y]) => h.lineTo(x, y));
  h.closePath();
  s.holes.push(h);
  return s;
}

function Environment() {
  const { gl, scene } = useThree();
  useEffect(() => {
    const pmrem = new PMREMGenerator(gl);
    const env = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environment = env;
    scene.environmentIntensity = 0.28;
    return () => {
      scene.environment = null;
      env.dispose();
      pmrem.dispose();
    };
  }, [gl, scene]);
  return null;
}

function Form({ still }: { still: boolean }) {
  const group = useRef<Group>(null);
  const { viewport, size } = useThree();

  const parts = useMemo(() => {
    const extrude = { depth: 0.05, bevelEnabled: true, bevelThickness: 0.035, bevelSize: 0.03, bevelSegments: 6, curveSegments: 32 };
    const petal = new ExtrudeGeometry(petalShape(0.56, 1.0, (Math.PI / PETALS) * 0.92), extrude);
    const disc = new ExtrudeGeometry(ringShape(0.6, 0.52), { ...extrude, depth: 0.06 });
    const plate = new ExtrudeGeometry(ringShape(0.53, 0.0001), { depth: 0.02, bevelEnabled: false, curveSegments: 64 });
    const tri = new ExtrudeGeometry(triangleOutline(0.5, 0.035), { ...extrude, depth: 0.05 });
    const cream = new ExtrudeGeometry(ringShape(0.22, 0.17), { ...extrude, depth: 0.06 });
    const inner = new ExtrudeGeometry(ringShape(0.13, 0.0001), { ...extrude, depth: 0.08 });

    const pearlBlue = new MeshPhysicalMaterial({
      color: new Color("#86bde4"),
      roughness: 0.42,
      metalness: 0,
      sheen: 1,
      sheenColor: new Color("#cfe8fb"),
      sheenRoughness: 0.5,
      clearcoat: 0.4,
      clearcoatRoughness: 0.25,
      iridescence: 0.4,
      iridescenceIOR: 1.3,
      side: DoubleSide,
    });
    const deepBlue = new MeshPhysicalMaterial({ color: new Color("#2f5f86"), roughness: 0.5, clearcoat: 0.3 });
    const creamMat = new MeshPhysicalMaterial({
      color: new Color("#f3e9d8"),
      roughness: 0.4,
      sheen: 0.8,
      sheenColor: new Color("#fff8ee"),
      emissive: new Color("#f3e9d8"),
      emissiveIntensity: 0.04,
    });
    const glowMat = new MeshPhysicalMaterial({
      color: new Color("#cfe9fb"),
      emissive: new Color("#b9dcf2"),
      emissiveIntensity: 0.55,
      roughness: 0.3,
    });
    return { petal, disc, plate, tri, cream, inner, pearlBlue, deepBlue, creamMat, glowMat };
  }, []);

  useEffect(
    () => () => {
      Object.values(parts).forEach((p) => (p as { dispose?: () => void }).dispose?.());
    },
    [parts],
  );

  useFrame((state, delta) => {
    const g = group.current;
    if (!g) return;
    const fit = Math.min(viewport.width, viewport.height) / 2.35;
    g.scale.setScalar(fit);
    // the form never spins: the downward triangle must keep its true orientation
    void delta;
    if (!still) {
      const tx = -0.32 + state.pointer.y * 0.06;
      const ty = state.pointer.x * 0.06;
      g.rotation.x += (tx - g.rotation.x) * 0.04;
      g.rotation.y += (ty - g.rotation.y) * 0.04;
    } else {
      g.rotation.x += (-0.32 - g.rotation.x) * 0.05;
      g.rotation.y += (0 - g.rotation.y) * 0.05;
    }
  });

  void size;

  return (
    <group ref={group} rotation={[-0.32, 0, 0]}>
      {Array.from({ length: PETALS }, (_, i) => (
        <group key={i} rotation={[0, 0, (i / PETALS) * Math.PI * 2]}>
          {/* each petal leans gently toward the viewer, cupped like a lotus */}
          <mesh geometry={parts.petal} material={parts.pearlBlue} rotation={[0.22, 0, 0]} position={[0, 0, -0.02]} />
        </group>
      ))}
      <mesh geometry={parts.plate} material={parts.deepBlue} position={[0, 0, -0.03]} />
      <mesh geometry={parts.disc} material={parts.pearlBlue} />
      <mesh geometry={parts.tri} material={parts.pearlBlue} position={[0, 0, 0.04]} />
      <mesh geometry={parts.cream} material={parts.creamMat} position={[0, 0, 0.06]} />
      <mesh geometry={parts.inner} material={parts.glowMat} position={[0, 0, 0.08]} />
      <pointLight position={[0, 0, 0.6]} color="#cfe9fb" intensity={1.6} distance={2.5} decay={1.5} />
    </group>
  );
}

export function VishuddhiScene({ still = false }: { still?: boolean }) {
  return (
    <Canvas
      className="chakra-canvas"
      dpr={[1, 1.75]}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      camera={{ fov: 30, position: [0, 0, 5.2] }}
      onCreated={({ gl }) => {
        gl.toneMapping = ACESFilmicToneMapping;
        gl.toneMappingExposure = 0.88;
        gl.outputColorSpace = SRGBColorSpace;
        gl.setClearColor(0x000000, 0);
      }}
    >
      <Environment />
      <hemisphereLight args={["#e9f4ff", "#0e2238", 0.5]} />
      <directionalLight position={[-2.5, 3.5, 4]} intensity={1.8} color="#f4fbff" />
      <directionalLight position={[3, -1, 2]} intensity={0.6} color="#9fc3e6" />
      <Form still={still} />
    </Canvas>
  );
}
