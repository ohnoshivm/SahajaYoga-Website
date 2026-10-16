"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { CHAKRAS, worldVars, type Chakra } from "@/chakras/registry";
import { GUIDANCE } from "@/chakras/guidance";
import { bandcampEmbedUrl, trackForChakra } from "@/audio/tracks";
import { usePrefs } from "@/meditation/prefs";
import { useSession } from "@/session/sessionStore";
import { Header } from "@/ui/Header";
import { ChakraForm } from "@/ui/ChakraForm";
import { Seeds } from "@/meditation/Seeds";
import { clock, useCountInput, useCounterView, useElapsed, useIdle, useSessionLife } from "@/meditation/useMeditation";

const v = (o: Record<string, number>) => Object.fromEntries(Object.entries(o).map(([k, n]) => [`--${k}`, n])) as React.CSSProperties;

/** Remember where a world was entered from, so its colour can open from that exact point. */
export function rememberOrigin(e: React.MouseEvent) {
  try {
    sessionStorage.setItem("sy.origin", JSON.stringify({ x: e.clientX, y: e.clientY, t: Date.now() }));
  } catch {}
}

export function ChakraWorld({ chakra }: { chakra: Chakra }) {
  const router = useRouter();
  const root = useRef<HTMLDivElement>(null);
  const [drawer, setDrawer] = useState(false);
  const session = useSession((s) => s.session);
  const begin = useSession((s) => s.begin);
  const finish = useSession((s) => s.finish);
  const pause = useSession((s) => s.pause);
  const resume = useSession((s) => s.resume);
  const undo = useSession((s) => s.undo);
  const music = usePrefs((s) => s.chakraMusic);
  const setPrefs = usePrefs((s) => s.set);
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);

  const phase = session?.phases[session.phaseIndex];
  const meditating = hydrated && !!session && phase?.kind === "chakra" && phase.chakra === chakra.slug;
  const track = trackForChakra(chakra.slug);
  const guidance = GUIDANCE[chakra.slug];
  const i = CHAKRAS.findIndex((c) => c.slug === chakra.slug);
  const prev = CHAKRAS[i - 1], next = CHAKRAS[i + 1];

  // the world's colour opens as a circle from the point you clicked to enter it
  useLayoutEffect(() => {
    const el = root.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let o: { x: number; y: number; t: number } | null = null;
    try {
      o = JSON.parse(sessionStorage.getItem("sy.origin") ?? "null");
      sessionStorage.removeItem("sy.origin");
    } catch {}
    if (!o || Date.now() - o.t > 4000) return;
    el.animate([{ clipPath: `circle(0px at ${o.x}px ${o.y}px)` }, { clipPath: `circle(150vmax at ${o.x}px ${o.y}px)` }], { duration: 900, easing: "cubic-bezier(.45,0,.2,1)" });
  }, []);

  useEffect(() => {
    if (!drawer) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setDrawer(false);
    window.addEventListener("keydown", onKey);
    document.getElementById("drawer")?.focus();
    return () => window.removeEventListener("keydown", onKey);
  }, [drawer]);

  const surface = useRef<HTMLDivElement>(null);
  const { awake } = useIdle();
  useCountInput(surface, meditating && !drawer);
  useSessionLife(meditating);
  const elapsed = useElapsed();
  const cv = useCounterView();

  const meditateHere = () => {
    if (!session) begin("chakra", { chakra: chakra.slug, mode: "immersive" });
  };
  const end = () => {
    const id = finish(cv && cv.totalTaps > 0 ? "complete" : "ended-early");
    if (id) router.push(`/meditate/complete?id=${encodeURIComponent(id)}`);
  };

  const state = meditating ? "meditating" : drawer ? "understand" : "arrival";
  return (
    <div ref={root} className="world wv" data-state={state} style={worldVars(chakra)}>
      <div style={{ ["--hd-ink" as string]: "var(--wink)" }}>
        <Header hidden={meditating} />
      </div>
      <main className="stage wv__stage" ref={surface} aria-labelledby="world-name">
        <h1 id="world-name" className="display pos pos--row wv__name" style={v({ x: 0, y: 186, fs: 262, px: 0, py: 140, pfs: 82 })}>
          {chakra.name}
        </h1>

        <div className="pos wv__formbox" style={v({ x: 400, y: 170, w: 640, px: 10, py: 160, pw: 370 })}>
          <div className="form-glow wv__glow" />
          <ChakraForm slug={chakra.slug} className="wv__form" />
        </div>

        {/* session layer: the time stands where the name stood, the seeds draw in beneath */}
        <div className="num pos pos--row wv__timer" style={v({ x: 0, y: 150, fs: 380, px: 0, py: 150, pfs: 142 })} aria-hidden={!meditating}>
          {clock(elapsed)}
        </div>
        {cv && (
          <div className="pos wv__seeds" style={v({ x: 360, y: 744, w: 720, px: 25, py: 560, pw: 340 })}>
            <Seeds lit={cv.roundJustCompleted ? 10 : cv.currentLap} complete={cv.roundJustCompleted} width={720} height={140} style={{ width: "100%", height: "auto", color: "var(--wsoft)" }} />
          </div>
        )}
        <div className="sbar wv__sbar" aria-live="polite">
          <div>
            <p className="sbar__t">{chakra.name} · Mantra</p>
            <p className="sbar__s">{session?.routineName ?? ""}</p>
          </div>
          <div className="sbar__r">
            {cv && cv.roundJustCompleted ? (
              <>
                <p className="sbar__t">Round {cv.displayRound} complete</p>
                <p className="sbar__s">next tap begins round {cv.displayRound + 1}</p>
              </>
            ) : (
              <>
                <p className="sbar__t">Round {cv?.displayRound ?? 1}</p>
                <p className="sbar__s">{cv?.displayLap ?? 0} of 10</p>
              </>
            )}
          </div>
        </div>
        <div className="wv__controls" data-awake={awake} data-no-count>
          {session?.status === "paused" ? (
            <button type="button" className="pill pill--sm pill--quiet" onClick={resume}>Resume</button>
          ) : (
            <button type="button" className="pill pill--sm pill--quiet" onClick={pause}>Pause</button>
          )}
          <button type="button" className="pill pill--sm pill--quiet" onClick={undo}>Undo</button>
          <button type="button" className="pill pill--sm" onClick={end}>Finish</button>
        </div>
        <p className="wv__hint">{session?.status === "paused" ? "Paused. Press P or Resume to continue." : "Tap anywhere to count"}</p>

        {/* arrival layer */}
        <div className="pos wv__line" style={v({ x: 96, y: 680, w: 400, px: 24, py: 528, pw: 342 })}>
          <p className="serif wv__quality">{chakra.worldLine}</p>
          <p className="soft wv__desc">
            {chakra.element} · {chakra.colourName} · {chakra.felt.replace(/\.$/, "")}
          </p>
        </div>
        <div className="pos pos--row wv__actions" style={v({ x: 0, y: 796, px: 0, py: 712 })}>
          <button type="button" className="pill pill--solid pill--lg" onClick={meditateHere}>
            Meditate here
          </button>
          <button type="button" className="text-action" onClick={() => setDrawer(true)} aria-expanded={drawer} aria-controls="drawer">
            Understand {chakra.name}
          </button>
        </div>
        {prev && (
          <Link href={`/chakras/${prev.slug}`} className="quiet-link pos wv__prev desk-only" style={v({ x: 56, y: 462 })} onClick={rememberOrigin}>
            ← {prev.name}
          </Link>
        )}
        {next && (
          <Link href={`/chakras/${next.slug}`} className="quiet-link pos-r wv__next desk-only" style={v({ x: 1384, y: 462 })} onClick={rememberOrigin}>
            {next.name} →
          </Link>
        )}

        {track && (
          <div className="pos-r wv__raga" style={v({ x: 1344, y: 680, px: 366, py: 612 })} data-no-count>
            <p className="wv__raga-name">
              <span className="soft">Raga</span> {track.raga}
            </p>
            <p className="wv__raga-by">
              {track.artist} · “Music and Meditation”
            </p>
            {music === "on" ? (
              <>
                <iframe
                  className="wv__player"
                  title={`${track.title}, ${track.artist}`}
                  src={bandcampEmbedUrl(track, { bg: chakra.theme.env, link: chakra.theme.ink })}
                  loading="lazy"
                  allow="autoplay"
                />
                <button type="button" className="quiet-link" onClick={() => setPrefs({ chakraMusic: "off" })}>
                  Continue silently
                </button>
              </>
            ) : (
              <div className="wv__consent">
                {music === "unset" && (
                  <button type="button" className="quiet-link" onClick={() => setPrefs({ chakraMusic: "off" })}>
                    Continue silently
                  </button>
                )}
                <button type="button" className="pill pill--sm pill--quiet" onClick={() => setPrefs({ chakraMusic: "on" })}>
                  Enable chakra music
                </button>
              </div>
            )}
          </div>
        )}
      </main>

      {drawer && (
        <div className="wv__scrim" onClick={() => setDrawer(false)}>
          <aside id="drawer" className="drawer" role="dialog" aria-modal="true" aria-labelledby="drawer-title" tabIndex={-1} onClick={(e) => e.stopPropagation()}>
            <button type="button" className="pill pill--sm pill--quiet drawer__close" onClick={() => setDrawer(false)}>
              Close
            </button>
            <h2 id="drawer-title" className="serif drawer__title">{chakra.name}</h2>
            <p className="drawer__sub">The {chakra.ordinal} chakra · {chakra.petals === 1000 ? "a thousand" : chakra.petals} petals</p>
            <h3>Qualities</h3>
            <p className="serif drawer__qualities">{guidance.qualities.join(" · ")}</p>
            <h3>Simple practices from the guides</h3>
            <ol>{guidance.balance.map((b) => <li key={b}>{b}</li>)}</ol>
            <h3>Where it is felt</h3>
            <p>{chakra.felt.replace("Felt ", "").replace(/^./, (c) => c.toUpperCase())} Element: {chakra.element.toLowerCase()}. Colour: {chakra.colourName.toLowerCase()}.</p>
            <h3>Sources</h3>
            <p>
              <a href="https://us.sahajayoga.org/handouts/" target="_blank" rel="noopener">Sahaja Yoga USA, chakra guides ↗</a>
              <br />
              <a href="https://shrimataji.org/chakras-qualities/" target="_blank" rel="noopener">Shri Mataji Foundation, chakras &amp; qualities ↗</a>
            </p>
            <p className="drawer__note">Paraphrased from published Sahaja Yoga guides{chakra.reviewed ? "." : ", awaiting practitioner review."} Describes practice; it does not diagnose or treat any condition.</p>
          </aside>
        </div>
      )}
    </div>
  );
}
