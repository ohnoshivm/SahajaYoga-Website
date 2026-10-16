"use client";

import { useCallback } from "react";
import { Header } from "@/ui/Header";
import { Hero } from "./Hero";

export function Home() {
  const toAscent = useCallback(() => {
    document.getElementById("ascent")?.scrollIntoView({ behavior: "smooth" });
  }, []);
  return (
    <>
      <Header />
      <main>
        <Hero onBloomed={toAscent} />
        <div id="ascent" />
      </main>
    </>
  );
}
