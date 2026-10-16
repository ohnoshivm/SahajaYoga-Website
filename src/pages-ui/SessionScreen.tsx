"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { MeditationStage } from "@/meditation/MeditationStage";
import { useSession } from "@/session/sessionStore";

export function SessionScreen() {
  const router = useRouter();
  const session = useSession((s) => s.session);
  const recover = useSession((s) => s.recover);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const done = () => {
      recover();
      setHydrated(true);
    };
    if (useSession.persist.hasHydrated()) done();
    else return useSession.persist.onFinishHydration(done);
  }, [recover]);

  if (!hydrated) return <div className="stage room" aria-busy="true" />;

  if (!session) {
    return (
      <main className="page room page--center">
        <h1 className="page__title">No session is open.</h1>
        <p className="page__lead">Your practice history is safe on this device.</p>
        <Link className="text-action text-action--primary" href="/meditate">
          Choose a meditation <span aria-hidden="true">→</span>
        </Link>
      </main>
    );
  }

  return <MeditationStage onFinished={(id) => router.push(`/meditate/complete?id=${encodeURIComponent(id)}`)} />;
}
