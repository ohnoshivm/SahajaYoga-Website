"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { LotusMark } from "./LotusMark";
import { PortraitMark } from "./PortraitMark";

const NAV = [
  { href: "/meditate", label: "Meditate" },
  { href: "/chakras", label: "Chakras" },
  { href: "/practice", label: "My Practice" },
];

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const menuButton = useRef<HTMLButtonElement>(null);
  const firstLink = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    if (!open) return;
    firstLink.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        menuButton.current?.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    document.documentElement.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.documentElement.style.overflow = "";
    };
  }, [open]);

  return (
    <header className="site-header">
      <Link href="/" className="wordmark" aria-label="SAHAJA YOGA, home">
        <LotusMark className="wordmark__mark" />
        <span className="wordmark__text">SAHAJA YOGA</span>
      </Link>

      <PortraitMark />

      <nav aria-label="Primary" className="site-nav">
        <ul className="site-nav__list">
          {NAV.map((item) => (
            <li key={item.href}>
              <Link href={item.href} className="pill">
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
        <button
          ref={menuButton}
          type="button"
          className="pill site-nav__menu-btn"
          aria-expanded={open}
          aria-controls="site-menu"
          onClick={() => setOpen((v) => !v)}
        >
          {open ? "Close" : "Menu"}
        </button>
      </nav>

      <div id="site-menu" className="site-menu" data-open={open} hidden={!open}>
        <ul>
          {NAV.map((item, i) => (
            <li key={item.href}>
              <Link
                ref={i === 0 ? firstLink : undefined}
                href={item.href}
                className="site-menu__link"
                onClick={() => setOpen(false)}
              >
                {item.label}
              </Link>
            </li>
          ))}
          <li>
            <Link href="/library" className="site-menu__link site-menu__link--quiet" onClick={() => setOpen(false)}>
              Library
            </Link>
          </li>
        </ul>
      </div>
    </header>
  );
}
