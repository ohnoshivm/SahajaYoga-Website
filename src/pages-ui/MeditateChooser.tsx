"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { CHAKRAS } from "@/chakras/registry";
import { ROUTINES } from "@/session/routines";
import { useSession } from "@/session/sessionStore";

export function MeditateChooser() {
  const router = useRouter();
  const begin = useSession((s) => s.begin);
  const active = useSession((s) => s.session);
  const [hydrated, setHydrated] = useState(false);
  const [chakra, setChakra] = useState<(typeof CHAKRAS)[number]["slug"]>("vishuddhi");
  useEffect(() => setHydrated(true), []);

  const start = (routineId: string) => {
    begin(routineId, { chakra });
    router.push("/meditate/session");
  };

  return (
    <main className="page room">
      <section className="page__intro">
        <p className="page__label">Meditate</p>
        <h1 className="page__title">Sit, and let the attention settle.</h1>
        <p className="page__lead">Choose how you would like to begin. Nothing to configure; you can change the screen at any moment.</p>
      </section>

      {hydrated && active && (
        <section className="resume" aria-label="Session in progress">
          <p>
            <strong>{active.routineName}</strong> is still open.
          </p>
          <Link className="text-action text-action--primary" href="/meditate/session">
            Resume <span aria-hidden="true">→</span>
          </Link>
        </section>
      )}

      <ol className="routines">
        {ROUTINES.map((r, i) => (
          <li key={r.id} className="routine">
            <span className="routine__n tabular" aria-hidden="true">
              {String(i + 1).padStart(2, "0")}
            </span>
            <div className="routine__body">
              <h2 className="routine__name">{r.name}</h2>
              <p className="routine__summary">{r.summary}</p>
              {r.phases.some((p) => p.kind === "chakra") && (
                <label className="routine__chakra">
                  Chakra
                  <select value={chakra} onChange={(e) => setChakra(e.target.value as typeof chakra)}>
                    {CHAKRAS.map((c) => (
                      <option key={c.slug} value={c.slug}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </label>
              )}
            </div>
            <button type="button" className="pill routine__go" onClick={() => start(r.id)}>
              Begin
            </button>
          </li>
        ))}
      </ol>

      <section className="seeker">
        <h2 className="seeker__title">New to Sahaja Yoga?</h2>
        <p>
          Sahaja Yoga begins with Self-Realisation, the awakening of the Kundalini, felt as a cool breeze on the palms and above the
          head. It is always free. This site does not give Self-Realisation; please experience it with the official guided video or a
          local class.
        </p>
        <p>
          <a className="text-action text-action--secondary" href="https://shrimataji.org/experience-your-self-realization/" target="_blank" rel="noopener">
            Experience it with Shri Mataji (shrimataji.org) <span aria-hidden="true">↗</span>
          </a>
        </p>
        <p>
          <a className="text-action text-action--secondary" href="https://us.sahajayoga.org/classes/" target="_blank" rel="noopener">
            Find a free class near you <span aria-hidden="true">↗</span>
          </a>
        </p>
      </section>
    </main>
  );
}
