import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { TRACKS } from "@/audio/tracks";

export const metadata: Metadata = { title: "Library & sources" };

const PRACTICES = [
  {
    title: "Raising the Kundalini",
    body: "Left hand before the lower abdomen, palm toward you, rising while the right hand circles it clockwise. Above the head, tie a knot. Three times: one knot, two, then three.",
  },
  {
    title: "Bandhan",
    body: "A shield of protection before and after meditation. The right hand travels from the left hip over the head to the right hip and back, about two inches from the body. Seven times.",
  },
  {
    title: "Footsoak",
    body: "In the evening: lukewarm water to the ankles with a handful of salt, a candle before you, palms up, eyes open, for up to ten minutes. Rinse the feet and the bowl afterwards.",
  },
];

export default function Page() {
  return (
    <>
      <SiteHeader />
      <main className="page room library">
        <section className="page__intro">
          <p className="page__label">Library</p>
          <h1 className="page__title">Learn from the source.</h1>
          <p className="page__lead">
            Practices summarised from published Sahaja Yoga guides, the chakra ragas, and where to go deeper. Teachings belong to their
            sources; please read them there.
          </p>
        </section>

        <section className="library__block" aria-labelledby="l-pr">
          <h2 id="l-pr" className="library__h">Practices</h2>
          <ol className="library__list">
            {PRACTICES.map((p) => (
              <li key={p.title}>
                <h3>{p.title}</h3>
                <p>{p.body}</p>
              </li>
            ))}
          </ol>
          <p className="library__src">
            From the Sahaja Yoga USA handouts (us.sahajayoga.org/handouts). Awaiting practitioner review.
          </p>
        </section>

        <section className="library__block" aria-labelledby="l-mu">
          <h2 id="l-mu" className="library__h">Chakra ragas</h2>
          <ul className="library__tracks">
            {TRACKS.map((t) => (
              <li key={t.id}>
                <Link href={`/chakras/${t.chakra}`}>{t.title}</Link>
                <span>{t.artist}</span>
              </li>
            ))}
          </ul>
          <p className="library__src">
            Sahaja Artists / USA Collective, “Music and Meditation”. All rights reserved by the artists; played through Bandcamp&apos;s
            official player.{" "}
            <a href="https://sahajsongs.bandcamp.com/album/music-and-meditation" target="_blank" rel="noopener">
              Support the album ↗
            </a>
          </p>
        </section>

        <section className="library__block" aria-labelledby="l-so">
          <h2 id="l-so" className="library__h">Go deeper</h2>
          <ul className="library__links">
            <li><a href="https://shrimataji.org/" target="_blank" rel="noopener">Shri Mataji Nirmala Devi: life and teachings ↗</a></li>
            <li><a href="https://shrimataji.org/experience-your-self-realization/" target="_blank" rel="noopener">Experience your Self-Realisation ↗</a></li>
            <li><a href="https://us.sahajayoga.org/meditation-videos/" target="_blank" rel="noopener">Guided meditation videos ↗</a></li>
            <li><a href="https://us.sahajayoga.org/classes/" target="_blank" rel="noopener">Free classes near you ↗</a></li>
            <li><a href="https://us.sahajayoga.org/chakras/" target="_blank" rel="noopener">The chakras and the subtle system ↗</a></li>
          </ul>
        </section>

        <section className="library__block" aria-labelledby="l-ab">
          <h2 id="l-ab" className="library__h">About this site</h2>
          <p className="library__p">
            SAHAJA YOGA is an independent project, not an official Sahaja Yoga website, made with respect for the practice. Sahaja Yoga
            meditation, founded by Shri Mataji Nirmala Devi in 1970, is always taught free of charge. This site does not give
            Self-Realisation, diagnose any condition, or measure spiritual progress.
          </p>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
