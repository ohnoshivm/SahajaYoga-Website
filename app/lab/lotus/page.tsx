import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LotusLab } from "./LotusLab";

export const metadata: Metadata = { title: "Lotus lab", robots: { index: false } };

/** Dev-only tuning bench for the hero lotus. */
export default function Page() {
  if (process.env.NODE_ENV === "production") notFound();
  return <LotusLab />;
}
