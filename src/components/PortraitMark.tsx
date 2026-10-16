import Image from "next/image";

/**
 * Small, steady header portrait of Shri Mataji Nirmala Devi.
 * A photograph is shown only once its source and permission are confirmed
 * (see docs/01-audit-architecture-plan.md asset register). Until then the
 * frame renders a clearly labelled placeholder. Never animated.
 */
const APPROVED_PORTRAIT: { src: string; alt: string } | null = null;

export function PortraitMark() {
  return (
    <figure className="portrait" aria-label="Shri Mataji Nirmala Devi">
      <div className="portrait__frame">
        {APPROVED_PORTRAIT ? (
          <Image
            src={APPROVED_PORTRAIT.src}
            alt={APPROVED_PORTRAIT.alt}
            fill
            sizes="72px"
            className="portrait__img"
            priority
          />
        ) : (
          <span className="portrait__placeholder" aria-hidden="true" />
        )}
      </div>
      {!APPROVED_PORTRAIT && <figcaption className="portrait__caption">Photograph pending approval</figcaption>}
    </figure>
  );
}
