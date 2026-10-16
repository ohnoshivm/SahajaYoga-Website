import type { Metadata } from "next";
import { SiteHeader } from "@/components/SiteHeader";
import { MeditateChooser } from "@/pages-ui/MeditateChooser";

export const metadata: Metadata = { title: "Meditate" };

export default function Page() {
  return (
    <>
      <SiteHeader />
      <MeditateChooser />
    </>
  );
}
