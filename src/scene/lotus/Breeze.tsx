"use client";

import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import { AdditiveBlending, BufferAttribute, BufferGeometry, CanvasTexture, Points, PointsMaterial } from "three";
import { useBloom } from "@/hero/bloomStore";

const COUNT = 160;
const DURATION = 3.2; // seconds: the breeze rises once, then is gone (no loop)

function makeSpriteTexture() {
  const size = 64;
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  g.addColorStop(0, "rgba(255,255,255,1)");
  g.addColorStop(0.35, "rgba(255,255,255,0.45)");
  g.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, size, size);
  return new CanvasTexture(canvas);
}

/**
 * The cool breeze: one gentle rise of light from the lotus heart up through
 * the letters and out of the top of the frame, like vibrations over the fontanel.
 */
export function Breeze() {
  const points = useRef<Points>(null);
  const seeds = useMemo(() => {
    const s = new Float32Array(COUNT * 4);
    for (let i = 0; i < COUNT; i++) {
      s[i * 4] = (Math.random() - 0.5) * 0.7; // x spread
      s[i * 4 + 1] = (Math.random() - 0.5) * 0.7; // z spread
      s[i * 4 + 2] = Math.random() * 0.9; // delay
      s[i * 4 + 3] = 0.6 + Math.random() * 0.7; // speed
    }
    return s;
  }, []);

  const { geometry, material } = useMemo(() => {
    const geometry = new BufferGeometry();
    geometry.setAttribute("position", new BufferAttribute(new Float32Array(COUNT * 3), 3));
    geometry.setAttribute("color", new BufferAttribute(new Float32Array(COUNT * 4), 4));
    const material = new PointsMaterial({
      size: 0.05,
      sizeAttenuation: true,
      transparent: true,
      depthWrite: false,
      vertexColors: true,
      blending: AdditiveBlending,
      map: typeof document !== "undefined" ? makeSpriteTexture() : null,
    });
    return { geometry, material };
  }, []);

  useEffect(
    () => () => {
      geometry.dispose();
      material.map?.dispose();
      material.dispose();
    },
    [geometry, material],
  );

  useFrame(() => {
    const { bloomedAt } = useBloom.getState();
    const obj = points.current;
    if (!obj) return;
    if (bloomedAt === null) {
      obj.visible = false;
      return;
    }
    const elapsed = (performance.now() - bloomedAt) / 1000;
    if (elapsed > DURATION + 1) {
      obj.visible = false;
      return;
    }
    obj.visible = true;
    const pos = geometry.getAttribute("position") as BufferAttribute;
    const col = geometry.getAttribute("color") as BufferAttribute;
    for (let i = 0; i < COUNT; i++) {
      const delay = seeds[i * 4 + 2];
      const speed = seeds[i * 4 + 3];
      const life = Math.max(0, Math.min(1, (elapsed - delay) / DURATION));
      const rise = life * 3.4 * speed;
      const sway = Math.sin(life * 6 + i) * 0.08 * life;
      pos.setXYZ(i, seeds[i * 4] * (1 + life * 0.8) + sway, 0.25 + rise, seeds[i * 4 + 1] * (1 + life));
      // cool white: a whisper cooler than the warm room
      const alpha = life <= 0 ? 0 : Math.sin(Math.PI * life) * 0.85;
      col.setXYZW(i, 0.93, 0.97, 1.0, alpha);
    }
    pos.needsUpdate = true;
    col.needsUpdate = true;
  });

  return <points ref={points} geometry={geometry} material={material} visible={false} />;
}
