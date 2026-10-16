"use client";

import dynamic from "next/dynamic";
import { useEffect } from "react";
import { useBloom } from "@/hero/bloomStore";

const HeroScene = dynamic(() => import("@/scene/HeroScene").then((m) => m.HeroScene), { ssr: false });

export function LotusLab() {
  useEffect(() => {
    const p = Number(new URLSearchParams(window.location.search).get("p") ?? "1");
    useBloom.setState({ progress: p, bloomed: p >= 1, bloomedAt: null });
  }, []);
  return (
    <main className="room" style={{ position: "relative", height: "100dvh" }}>
      <div style={{ position: "absolute", inset: 0 }} data-lab-framing="close">
        <HeroScene reducedMotion lab />
      </div>
    </main>
  );
}
