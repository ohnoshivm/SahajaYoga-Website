import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Hero } from "@/hero/Hero";
import { Ascent } from "@/ascent/Ascent";
import { Return } from "@/return/Return";
import { SmoothScroll } from "@/motion/SmoothScroll";

export default function Home() {
  return (
    <>
      <SmoothScroll />
      <SiteHeader />
      <main>
        <Hero />
        <Ascent />
        <Return />
      </main>
      <SiteFooter />
    </>
  );
}
