"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import { ACESFilmicToneMapping, PMREMGenerator, SRGBColorSpace, type Group } from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import type { ChakraSlug } from "@/chakras/registry";
import { buildForm } from "./chakraGeometry";

const TILT = -0.42;

function Env() {
  const { gl, scene } = useThree();
  useEffect(() => {
    const pmrem = new PMREMGenerator(gl);
    const env = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environment = env;
    scene.environmentIntensity = 0.42;
    return () => {
      scene.environment = null;
      env.dispose();
      pmrem.dispose();
    };
  }, [gl, scene]);
  return null;
}

function Form({ slug, still, onReady }: { slug: ChakraSlug; still: boolean; onReady?: () => void }) {
  const { parts, materials } = useMemo(() => buildForm(slug), [slug]);
  const group = useRef<Group>(null);
  const target = useRef({ x: 0, y: 0 });
  const { invalidate } = useThree();

  useEffect(
    () => () => {
      new Set(parts.map((p) => p.geometry)).forEach((g) => g.dispose());
      Object.values(materials).forEach((m) => m.dispose());
    },
    [parts, materials],
  );
  useEffect(() => {
    invalidate();
    const id = requestAnimationFrame(() => requestAnimationFrame(() => onReady?.()));
    return () => cancelAnimationFrame(id);
  }, [invalidate, onReady]);

  useEffect(() => {
    if (still) {
      target.current = { x: 0, y: 0 };
      invalidate();
      return;
    }
    const onMove = (e: PointerEvent) => {
      target.current = { x: (e.clientX / window.innerWidth) * 2 - 1, y: (e.clientY / window.innerHeight) * 2 - 1 };
      invalidate();
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, [still, invalidate]);

  useFrame(() => {
    const g = group.current;
    if (!g) return;
    // the form turns a few degrees toward the pointer; it never spins, the triangle stays true
    const ty = target.current.x * 0.07, tx = TILT + target.current.y * 0.05;
    g.rotation.y += (ty - g.rotation.y) * 0.06;
    g.rotation.x += (tx - g.rotation.x) * 0.06;
    if (Math.abs(ty - g.rotation.y) > 0.0004 || Math.abs(tx - g.rotation.x) > 0.0004) invalidate();
  });

  return (
    <group ref={group} rotation={[TILT, 0, 0]} scale={0.98}>
      {parts.map((p, i) => (
        <mesh key={i} geometry={p.geometry} material={materials[p.material]} rotation={[0, 0, p.rotationZ ?? 0]} position={[0, 0, p.z ?? 0]} />
      ))}
      <pointLight position={[0, 0, 0.5]} color="#ffe2b8" intensity={1.4} distance={2.2} decay={1.6} />
    </group>
  );
}

export default function ChakraCanvas({ slug, active, still = false, onReady }: { slug: ChakraSlug; active: boolean; still?: boolean; onReady?: () => void }) {
  return (
    <Canvas
      frameloop={active ? "demand" : "never"}
      dpr={[1, 2]}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      camera={{ fov: 26, position: [0, 0, 6.2], near: 0.1, far: 50 }}
      onCreated={({ gl }) => {
        gl.toneMapping = ACESFilmicToneMapping;
        gl.toneMappingExposure = 0.92;
        gl.outputColorSpace = SRGBColorSpace;
        gl.setClearColor(0x000000, 0);
      }}
      style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
      aria-hidden="true"
    >
      <Env />
      <hemisphereLight args={["#fffaf2", "#3a3230", 0.35]} />
      <directionalLight position={[-3.2, 4.2, 5]} intensity={1.7} color="#fff6ea" />
      <directionalLight position={[4, -1.5, 3]} intensity={0.45} color="#e8f0ff" />
      <directionalLight position={[0.5, 3, -4]} intensity={1.2} color="#ffffff" />
      <Form slug={slug} still={still} onReady={onReady} />
    </Canvas>
  );
}
