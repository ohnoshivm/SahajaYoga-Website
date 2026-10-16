"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { CHAKRAS, type Chakra } from "@/chakras/registry";
import { GUIDANCE } from "@/chakras/guidance";
import { HandMap } from "@/chakras/HandMap";
import { Mandala } from "@/chakras/Mandala";
import { bandcampEmbedUrl, trackForChakra } from "@/audio/tracks";
import { MeditationStage } from "@/meditation/MeditationStage";
import { usePrefs } from "@/meditation/prefs";
import { useSession } from "@/session/sessionStore";
import { SiteHeader } from "@/components/SiteHeader";

const VishuddhiScene = dynamic(() => import("@/scene/chakras/VishuddhiScene").then((m) => m.VishuddhiScene), {
  ssr: false,
  loading: () => null,
});

export function ChakraWorld({ chakra }: { chakra: Chakra }) {
  const router = useRouter();
  const begin = useSession((s) => s.begin);
  const session = useSession((s) => s.session);
  const music = usePrefs((s) => s.chakraMusic);
  const setPrefs = usePrefs((s) => s.set);
  const [meditating, setMeditating] = useState(false);
  const [drawer, setDrawer] = useState(false);
  const [webgl, setWebgl] = useState(true);
  const drawerRef = useRef<HTMLDivElement>(null);
  const track = trackForChakra(chakra.slug);
  const guidance = GUIDANCE[chakra.slug];
  const i = CHAKRAS.findIndex((c) => c.slug === chakra.slug);
  const prev = CHAKRAS[i - 1];
  const next = CHAKRAS[i + 1];

  useEffect(() => {
    try {
      const c = document.createElement("canvas");
      setWebgl(!!(c.getContext("webgl2") || c.getContext("webgl")));
    } catch {
      setWebgl(false);
    }
  }, []);

  useEffect(() => {
    if (!drawer) return;
    drawerRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setDrawer(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [drawer]);

  const meditateHere = () => {
    begin("chakra", { chakra: chakra.slug, mode: "guided" });
    setMeditating(true);
  };

  const show3D = chakra.slug === "vishuddhi" && webgl;

  return (
    <div className="world" data-world={chakra.slug}>
      <SiteHeader />
      <main className="world__main">
        <section className="world__stage" aria-labelledby="world-title">
          <h1 id="world-title" className="world__name">
            {chakra.name}
          </h1>
          <div className="world__form" aria-hidden="true">
            {show3D ? <VishuddhiScene /> : <Mandala form={chakra.form} />}
          </div>
          <p className="world__descriptor">
            {chakra.quality} · {chakra.element} · {chakra.colourName}
          </p>
        </section>

        <section className="world__panel" aria-label={`${chakra.name}: meditate, listen, understand`}>
          <p className="world__line">{chakra.line}</p>

          <div className="world__actions">
            <button type="button" className="pill pill--solid" onClick={meditateHere}>
              Meditate here
            </button>
            <button type="button" className="text-action text-action--secondary" onClick={() => setDrawer(true)} aria-expanded={drawer}>
              Understand {chakra.name}
            </button>
          </div>

          {track && (
            <div className="listen">
              <p className="listen__title">
                <span className="listen__label">Raga</span> {track.raga}
              </p>
              {music === "on" ? (
                <>
                  <iframe
                    className="listen__player"
                    title={`${track.title}, ${track.artist}`}
                    src={bandcampEmbedUrl(track, { bg: "#16324a", link: "#b9dcf2" })}
                    loading="lazy"
                    allow="autoplay"
                  />
                  <p className="listen__credit">
                    {track.artist} · {track.attribution} · via{" "}
                    <a href={track.sourceUrl} target="_blank" rel="noopener">
                      Bandcamp
                    </a>
                  </p>
                  <button type="button" className="listen__toggle" onClick={() => setPrefs({ chakraMusic: "off" })}>
                    Continue silently
                  </button>
                </>
              ) : (
                <div className="listen__consent">
                  <button type="button" className="pill" onClick={() => setPrefs({ chakraMusic: "on" })}>
                    Enable chakra music
                  </button>
                  {music === "unset" && (
                    <button type="button" className="listen__toggle" onClick={() => setPrefs({ chakraMusic: "off" })}>
                      Continue silently
                    </button>
                  )}
                </div>
              )}
            </div>
          )}

          <HandMap finger={chakra.finger} label={chakra.fingerLabel} />

          <nav className="world__nav" aria-label="Other chakras">
            {prev ? (
              <Link href={`/chakras/${prev.slug}`}>
                <span aria-hidden="true">←</span> {prev.name}
              </Link>
            ) : (
              <span />
            )}
            <Link href="/chakras">All chakras</Link>
            {next ? (
              <Link href={`/chakras/${next.slug}`}>
                {next.name} <span aria-hidden="true">→</span>
              </Link>
            ) : (
              <span />
            )}
          </nav>
        </section>
      </main>

      {drawer && (
        <div className="drawer-scrim" onClick={() => setDrawer(false)}>
          <div
            ref={drawerRef}
            className="drawer"
            role="dialog"
            aria-modal="true"
            aria-labelledby="drawer-title"
            tabIndex={-1}
            onClick={(e) => e.stopPropagation()}
          >
            <button type="button" className="drawer__close pill" onClick={() => setDrawer(false)}>
              Close
            </button>
            <p className="page__label">Chakra {chakra.n}</p>
            <h2 id="drawer-title" className="drawer__title">
              {chakra.title}
            </h2>
            <h3 className="drawer__h">Qualities</h3>
            <ul className="drawer__list">
              {guidance.qualities.map((q) => (
                <li key={q}>{q}</li>
              ))}
            </ul>
            <h3 className="drawer__h">Simple practices from the guides</h3>
            <ul className="drawer__list drawer__list--plain">
              {guidance.balance.map((b) => (
                <li key={b}>{b}</li>
              ))}
            </ul>
            <h3 className="drawer__h">Where it is felt</h3>
            <p>{chakra.fingerLabel}. Element: {chakra.element.toLowerCase()}. Colour: {chakra.colourName.toLowerCase()}.</p>
            <h3 className="drawer__h">Sources</h3>
            <ul className="drawer__list drawer__list--plain">
              <li>
                <a href="https://us.sahajayoga.org/handouts/" target="_blank" rel="noopener">
                  Sahaja Yoga USA, chakra guides ↗
                </a>
              </li>
              <li>
                <a href="https://shrimataji.org/chakras-qualities/" target="_blank" rel="noopener">
                  Shri Mataji Foundation, chakras &amp; qualities ↗
                </a>
              </li>
            </ul>
            <p className="drawer__note">
              Paraphrased from published Sahaja Yoga guides{chakra.reviewed ? "." : "; awaiting practitioner review."} This site
              describes practice; it does not diagnose or treat any condition.
            </p>
          </div>
        </div>
      )}

      {meditating && session && (
        <MeditationStage
          onFinished={(id) => {
            setMeditating(false);
            router.push(`/meditate/complete?id=${encodeURIComponent(id)}`);
          }}
        />
      )}
    </div>
  );
}
