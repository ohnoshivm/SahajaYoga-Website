"use client";

import dynamic from "next/dynamic";
import { useCallback, useRef, useState } from "react";
import type { ChakraSlug } from "@/chakras/registry";
import { useOnScreen, useWebGL } from "./Lotus";

const ChakraCanvas = dynamic(() => import("@/scene/ChakraCanvas"), { ssr: false });

/** A chakra form: the approved still render paints first (and is the no-WebGL fallback); the live 3D form fades in over it. */
export function ChakraForm({ slug, className = "", style, live = true, still = false }: { slug: ChakraSlug; className?: string; style?: React.CSSProperties; live?: boolean; still?: boolean }) {
  const box = useRef<HTMLDivElement>(null);
  const webgl = useWebGL();
  const on = useOnScreen(box);
  const [ready, setReady] = useState(false);
  const onReady = useCallback(() => setReady(true), []);
  const use3D = live && webgl;
  return (
    <div ref={box} className={`form-wrap ${className}`} style={style} aria-hidden="true">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={`/assets/chakra-${slug}.png`} alt="" draggable={false} style={{ position: "absolute", inset: 0, opacity: use3D && ready ? 0 : 1, transition: "opacity 500ms" }} />
      {use3D && <ChakraCanvas slug={slug} active={on} still={still} onReady={onReady} />}
    </div>
  );
}
