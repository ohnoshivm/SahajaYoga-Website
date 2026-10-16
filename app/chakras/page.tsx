import type { Metadata } from "next";
import Link from "next/link";
import { CHAKRAS } from "@/chakras/registry";
import { Mandala } from "@/chakras/Mandala";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";

export const metadata: Metadata = { title: "Chakras", description: "The seven chakras of the Sahaja Yoga subtle system." };

/** The atlas: the subtle system read from the crown down, fully accessible without WebGL. */
export default function Page() {
  const ordered = [...CHAKRAS].reverse();
  return (
    <>
      <SiteHeader />
      <main className="page room atlas">
        <section className="page__intro">
          <p className="page__label">The subtle system</p>
          <h1 className="page__title">Seven chakras, three channels, one Kundalini.</h1>
          <p className="page__lead">
            Energy centres along the spine, each with its own qualities. Choose one to enter its world, listen to its raga, and meditate there.
          </p>
        </section>
        <ol className="atlas__list" reversed>
          {ordered.map((c) => (
            <li key={c.slug} className="atlas__item" data-world={c.slug}>
              <Link href={`/chakras/${c.slug}`} className="atlas__link">
                <span className="atlas__n tabular">{String(c.n).padStart(2, "0")}</span>
                <span className="atlas__form" aria-hidden="true">
                  <Mandala form={c.form} />
                </span>
                <span className="atlas__text">
                  <span className="atlas__name">{c.name}</span>
                  <span className="atlas__quality">
                    {c.quality} · {c.element}
                  </span>
                </span>
                <span className="atlas__go" aria-hidden="true">
                  →
                </span>
              </Link>
            </li>
          ))}
        </ol>
        <p className="atlas__note">
          Colours, elements and petal geometry follow the official Sahaja Yoga USA chakra guides.{" "}
          <a href="https://us.sahajayoga.org/chakras/" target="_blank" rel="noopener">
            Read more at sahajayoga.org ↗
          </a>
        </p>
      </main>
      <SiteFooter />
    </>
  );
}
