"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { LotusMark } from "./LotusMark";

/**
 * The small top-centre portrait is reserved for a permitted, authentic photograph of
 * Shri Mataji. It loads from /private/portrait.png (kept out of the public repo until
 * its source and permission are confirmed); if absent, a labelled placeholder shows.
 */
function Portrait() {
  const [ok, setOk] = useState(true);
  return (
    <figure className="hd__portrait">
      <div className="hd__ring">
        {ok ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src="/private/portrait.png" alt="Shri Mataji Nirmala Devi" onError={() => setOk(false)} />
        ) : (
          <span className="hd__ph" role="img" aria-label="Photograph of Shri Mataji, pending approval">
            Photo pending
          </span>
        )}
      </div>
    </figure>
  );
}

const NAV = [
  { href: "/meditate", label: "Meditate" },
  { href: "/chakras", label: "Chakras" },
  { href: "/practice", label: "My practice" },
];

export function Header({ hidden = false }: { hidden?: boolean }) {
  const path = usePathname();
  const [open, setOpen] = useState(false);
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <>
      <header className="hd" data-hidden={hidden}>
        <Link href="/" className="hd__brand" aria-label="SAHAJA YOGA, home">
          <LotusMark />
          <span>SAHAJA YOGA</span>
        </Link>
        <Portrait />
        <nav className="hd__nav" aria-label="Main">
          {NAV.map((n) => (
            <Link key={n.href} href={n.href} className={`pill${path?.startsWith(n.href) ? " pill--on" : ""}`} aria-current={path?.startsWith(n.href) ? "page" : undefined}>
              {n.label}
            </Link>
          ))}
        </nav>
        <button type="button" className="pill pill--sm hd__menu" aria-expanded={open} aria-controls="menu" onClick={() => setOpen(true)}>
          Menu
        </button>
      </header>
      {open && (
        <div className="menu" id="menu" role="dialog" aria-modal="true" aria-label="Menu">
          <button type="button" className="pill pill--sm menu__close" onClick={() => setOpen(false)}>
            Close
          </button>
          {[...NAV, { href: "/library", label: "Library" }, { href: "/start", label: "New here" }].map((n) => (
            <Link key={n.href} href={n.href} onClick={() => setOpen(false)}>
              {n.label}
            </Link>
          ))}
        </div>
      )}
    </>
  );
}
