"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { readHistory, updateReflection, type SessionRecord } from "@/session/history";
import { formatClock } from "@/session/timer";
import { chakraBySlug } from "@/chakras/registry";

export function CompleteView() {
  const id = useSearchParams().get("id");
  const [record, setRecord] = useState<SessionRecord | null>(null);
  const [note, setNote] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const r = readHistory().find((x) => x.id === id) ?? null;
    setRecord(r);
    setNote(r?.reflection ?? "");
  }, [id]);

  if (!record) {
    return (
      <main className="page room page--center">
        <h1 className="page__title">Session not found on this device.</h1>
        <Link className="text-action text-action--primary" href="/practice">
          My practice <span aria-hidden="true">→</span>
        </Link>
      </main>
    );
  }

  return (
    <main className="page room page--center complete">
      <p className="page__label">{record.routineName}</p>
      <h1 className="complete__time tabular">{formatClock(record.activeMs)}</h1>
      <p className="page__lead">of meditation, saved on this device.</p>
      <dl className="complete__stats">
        <div>
          <dt>Rounds</dt>
          <dd className="tabular">{record.rounds}</dd>
        </div>
        <div>
          <dt>Repetitions</dt>
          <dd className="tabular">{record.totalTaps}</dd>
        </div>
        {record.chakras.length > 0 && (
          <div>
            <dt>Chakra</dt>
            <dd>{record.chakras.map((c) => chakraBySlug(c)?.name ?? c).join(", ")}</dd>
          </div>
        )}
      </dl>
      <label className="complete__note">
        <span>A note for yourself (optional)</span>
        <textarea
          value={note}
          maxLength={2000}
          rows={3}
          onChange={(e) => {
            setNote(e.target.value);
            setSaved(false);
          }}
        />
      </label>
      <div className="complete__actions">
        <button
          type="button"
          className="pill"
          onClick={() => {
            updateReflection(record.id, note);
            setSaved(true);
          }}
        >
          {saved ? "Saved" : "Save note"}
        </button>
        <Link className="text-action text-action--primary" href="/meditate">
          Meditate again
        </Link>
        <Link className="text-action text-action--secondary" href="/practice">
          My practice <span aria-hidden="true">→</span>
        </Link>
      </div>
    </main>
  );
}
