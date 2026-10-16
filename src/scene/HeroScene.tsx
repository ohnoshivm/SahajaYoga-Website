"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import { ACESFilmicToneMapping, Group, PMREMGenerator, SRGBColorSpace } from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { HOLD_SECONDS, RELEASE_SPEED, useBloom } from "@/hero/bloomStore";
import { Breeze } from "./lotus/Breeze";
import { Lotus } from "./lotus/Lotus";

/** Neutral studio reflections generated locally (no network HDRI). */
function StudioEnvironment() {
  const { gl, scene } = useThree();
  useEffect(() => {
    const pmrem = new PMREMGenerator(gl);
    const env = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environment = env;
    scene.environmentIntensity = 0.2;
    return () => {
      scene.environment = null;
      env.dispose();
      pmrem.dispose();
    };
  }, [gl, scene]);
  return null;
}

/** Integrates the hold into bloom progress every frame (no React re-renders). */
function BloomDriver({ reducedMotion }: { reducedMotion: boolean }) {
  useFrame((_, delta) => {
    const s = useBloom.getState();
    if (s.bloomed) return;
    const dt = Math.min(delta, 1 / 20);
    if (s.holding) {
      if (reducedMotion) {
        s.completeBloom(true);
        return;
      }
      // stillness helps: a fast-moving pointer slows the opening, never stops it
      const rate = (1 / HOLD_SECONDS) * (1 - 0.45 * s.agitation);
      const next = Math.min(1, s.progress + dt * rate);
      if (next >= 1) s.completeBloom();
      else s.setProgress(next);
    } else if (s.progress > 0) {
      s.setProgress(Math.max(0, s.progress - (dt * RELEASE_SPEED) / HOLD_SECONDS));
    }
  });
  return null;
}

/** Frames the lotus to a share of the viewport width, and lifts it slightly once bloomed. */
function Framing({ children, lab = false }: { children: React.ReactNode; lab?: boolean }) {
  const group = useRef<Group>(null);
  const { viewport, size } = useThree();
  useFrame(() => {
    if (!group.current) return;
    const portrait = size.width / size.height < 0.8;
    const share = lab ? 0.62 : portrait ? 0.86 : 0.38;
    // bloomed lotus diameter ≈ 2.2 world units at scale 1
    const target = (viewport.width * share) / 2.2;
    const g = group.current;
    g.scale.setScalar(lab ? target : g.scale.x + (target - g.scale.x) * 0.12);
    const { progress } = useBloom.getState();
    g.position.y = (lab ? -0.55 : -0.62) * target + progress * 0.05 * target;
  });
  return <group ref={group}>{children}</group>;
}

export function HeroScene({ reducedMotion, lab = false }: { reducedMotion: boolean; lab?: boolean }) {
  return (
    <Canvas
      className="hero-canvas"
      dpr={[1, 1.75]}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      camera={{ fov: 26, position: [0, 2.9, 6.6], near: 0.1, far: 50 }}
      onCreated={({ gl, camera }) => {
        gl.toneMapping = ACESFilmicToneMapping;
        gl.toneMappingExposure = 0.94;
        gl.outputColorSpace = SRGBColorSpace;
        gl.setClearColor(0x000000, 0);
        camera.lookAt(0, 0, 0);
      }}
    >
      <StudioEnvironment />
      <hemisphereLight args={["#fff0de", "#9c7e60", 0.42]} />
      <directionalLight position={[-3.5, 4.5, 4]} intensity={2.7} color="#ffe4c2" />
      <directionalLight position={[-1.5, 0.6, 5]} intensity={0.45} color="#fff3e6" />
      <directionalLight position={[3.2, 1.6, -3]} intensity={1.1} color="#f7cfa0" />
      {!lab && <BloomDriver reducedMotion={reducedMotion} />}
      <Framing lab={lab}>
        <Lotus breathe={!reducedMotion} />
        {!reducedMotion && <Breeze />}
      </Framing>
    </Canvas>
  );
}
