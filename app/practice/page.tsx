import type { Metadata } from "next";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { PracticeView } from "@/pages-ui/PracticeView";

export const metadata: Metadata = { title: "My practice" };

export default function Page() {
  return (
    <>
      <SiteHeader />
      <PracticeView />
      <SiteFooter />
    </>
  );
}
