"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { chakraBySlug } from "@/chakras/registry";
import { readHistory, type SessionRecord } from "@/session/history";
import { formatClock } from "@/session/timer";

const dayFmt = new Intl.DateTimeFormat(undefined, { weekday: "short", day: "numeric", month: "short" });
const timeFmt = new Intl.DateTimeFormat(undefined, { hour: "numeric", minute: "2-digit" });

/** Private practice overview: what was practised and for how long. Never a score. */
export function PracticeView() {
  const [history, setHistory] = useState<SessionRecord[] | null>(null);
  useEffect(() => setHistory(readHistory()), []);

  const totals = useMemo(() => {
    const h = history ?? [];
    return {
      sessions: h.length,
      minutes: Math.round(h.reduce((a, r) => a + r.activeMs, 0) / 60000),
      rounds: h.reduce((a, r) => a + r.rounds, 0),
    };
  }, [history]);

  return (
    <main className="page room">
      <section className="page__intro">
        <p className="page__label">My practice</p>
        <h1 className="page__title">{history && history.length > 0 ? "Your quiet record." : "Nothing here yet."}</h1>
        <p className="page__lead">
          {history && history.length > 0
            ? "What you practised and for how long, kept only on this device."
            : "Sessions you finish are kept privately on this device. Begin whenever you are ready."}
        </p>
        <p style={{ marginTop: "var(--s-5)" }}>
          <Link className="text-action text-action--primary" href="/meditate">
            Begin meditation <span aria-hidden="true">→</span>
          </Link>
        </p>
      </section>

      {history && history.length > 0 && (
        <>
          <dl className="totals">
            <div>
              <dt>Sessions</dt>
              <dd className="tabular">{totals.sessions}</dd>
            </div>
            <div>
              <dt>Minutes</dt>
              <dd className="tabular">{totals.minutes}</dd>
            </div>
            <div>
              <dt>Mantra rounds</dt>
              <dd className="tabular">{totals.rounds}</dd>
            </div>
          </dl>
          <ol className="history">
            {history.map((r) => (
              <li key={r.id} className="history__row">
                <span className="history__date">
                  {dayFmt.format(r.startedAt)} <span className="history__time">{timeFmt.format(r.startedAt)}</span>
                </span>
                <span className="history__name">
                  {r.routineName}
                  {r.chakras.length > 0 && ` · ${r.chakras.map((c) => chakraBySlug(c)?.name ?? c).join(", ")}`}
                </span>
                <span className="history__num tabular">{formatClock(r.activeMs)}</span>
                <span className="history__num tabular">
                  {r.rounds} {r.rounds === 1 ? "round" : "rounds"}
                </span>
              </li>
            ))}
          </ol>
          <p className="history__foot">
            <Link href="/settings">Export or delete your practice data</Link>
          </p>
        </>
      )}
    </main>
  );
}
