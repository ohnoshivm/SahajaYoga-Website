"use client";

import { useState } from "react";
import { usePrefs } from "@/meditation/prefs";
import { clearHistory, readHistory } from "@/session/history";

export function SettingsView() {
  const prefs = usePrefs();
  const [confirm, setConfirm] = useState(false);
  const [done, setDone] = useState("");

  const exportData = () => {
    const blob = new Blob([JSON.stringify({ exportedAt: new Date().toISOString(), sessions: readHistory() }, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "sahaja-yoga-practice.json";
    a.click();
    URL.revokeObjectURL(url);
    setDone("Exported.");
  };

  const toggle = (key: "haptics" | "bell" | "showCount", label: string) => (
    <label className="setting">
      <span>
        <strong>{label}</strong>
      </span>
      <input type="checkbox" role="switch" checked={prefs[key]} onChange={(e) => prefs.set({ [key]: e.target.checked })} />
    </label>
  );

  return (
    <main className="page room">
      <section className="page__intro">
        <p className="page__label">Settings &amp; privacy</p>
        <h1 className="page__title">Yours, and only yours.</h1>
        <p className="page__lead">No account and no tracking. Your practice history lives in this browser until you remove it.</p>
      </section>

      <section className="settings" aria-labelledby="s-med">
        <h2 id="s-med" className="settings__h">Meditation</h2>
        {toggle("haptics", "Vibrate on each repetition (phones)")}
        {toggle("bell", "Soft bell at the end of each round")}
        {toggle("showCount", "Show the round and lap count")}
        <label className="setting">
          <span>
            <strong>Chakra music</strong>
          </span>
          <select value={prefs.chakraMusic} onChange={(e) => prefs.set({ chakraMusic: e.target.value as typeof prefs.chakraMusic })}>
            <option value="unset">Ask me</option>
            <option value="on">On</option>
            <option value="off">Off</option>
          </select>
        </label>
      </section>

      <section className="settings" id="accessibility" aria-labelledby="s-a11y">
        <h2 id="s-a11y" className="settings__h">Accessibility</h2>
        <p className="settings__p">
          The site follows your system&apos;s reduce-motion setting: the lotus opens at a tap, the chakra journey becomes a still
          list, and nothing moves on its own. Every control works with a keyboard; while meditating, Space or Enter counts, Backspace
          undoes, P pauses.
        </p>
      </section>

      <section className="settings" aria-labelledby="s-data">
        <h2 id="s-data" className="settings__h">Your data</h2>
        <div className="settings__row">
          <button type="button" className="pill" onClick={exportData}>
            Export practice (JSON)
          </button>
          {!confirm ? (
            <button type="button" className="pill" onClick={() => setConfirm(true)}>
              Delete all practice data
            </button>
          ) : (
            <span className="settings__confirm">
              Delete every saved session on this device?
              <button
                type="button"
                className="pill"
                onClick={() => {
                  clearHistory();
                  setConfirm(false);
                  setDone("All practice data deleted.");
                }}
              >
                Yes, delete
              </button>
              <button type="button" className="pill" onClick={() => setConfirm(false)}>
                Keep it
              </button>
            </span>
          )}
        </div>
        <p className="settings__p" role="status">
          {done}
        </p>
      </section>
    </main>
  );
}
