import type { Metadata } from "next";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { SettingsView } from "@/pages-ui/SettingsView";

export const metadata: Metadata = { title: "Settings & privacy" };

export default function Page() {
  return (
    <>
      <SiteHeader />
      <SettingsView />
      <SiteFooter />
    </>
  );
}
