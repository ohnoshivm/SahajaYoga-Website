import type { Metadata } from "next";
import { Suspense } from "react";
import { SiteHeader } from "@/components/SiteHeader";
import { CompleteView } from "@/pages-ui/CompleteView";

export const metadata: Metadata = { title: "Session complete" };

export default function Page() {
  return (
    <>
      <SiteHeader />
      <Suspense>
        <CompleteView />
      </Suspense>
    </>
  );
}
