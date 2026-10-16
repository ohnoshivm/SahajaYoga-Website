/**
 * Private, local-only practice history (guest-first; no account, no network).
 * Writes are idempotent by session id, so a session is saved exactly once.
 */
export type SessionRecord = {
  id: string;
  routineId: string;
  routineName: string;
  startedAt: number;
  endedAt: number;
  activeMs: number;
  chakras: string[];
  totalTaps: number;
  rounds: number;
  incompleteRoundTaps: number;
  averageLapMs: number | null;
  status: "complete" | "ended-early";
  reflection?: string;
};

const KEY = "sy.history.v1";

export function readHistory(): SessionRecord[] {
  try {
    const raw = window.localStorage.getItem(KEY);
    const list = raw ? (JSON.parse(raw) as SessionRecord[]) : [];
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
}

export function saveRecord(record: SessionRecord): boolean {
  const list = readHistory();
  if (list.some((r) => r.id === record.id)) return false; // already saved: never twice
  list.unshift(record);
  try {
    window.localStorage.setItem(KEY, JSON.stringify(list));
    return true;
  } catch {
    return false;
  }
}

export function updateReflection(id: string, reflection: string) {
  const list = readHistory();
  const r = list.find((x) => x.id === id);
  if (!r) return;
  r.reflection = reflection.slice(0, 2000);
  try {
    window.localStorage.setItem(KEY, JSON.stringify(list));
  } catch {
    /* ignore */
  }
}

export function clearHistory() {
  try {
    window.localStorage.removeItem(KEY);
  } catch {
    /* ignore */
  }
}
