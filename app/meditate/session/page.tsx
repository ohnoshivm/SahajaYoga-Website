import type { Metadata } from "next";
import { SessionScreen } from "@/pages-ui/SessionScreen";

export const metadata: Metadata = { title: "Meditation" };

export default function Page() {
  return <SessionScreen />;
}
