import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { CHAKRAS, chakraBySlug } from "@/chakras/registry";
import { ChakraWorld } from "@/world/ChakraWorld";

export function generateStaticParams() {
  return CHAKRAS.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const c = chakraBySlug((await params).slug);
  return c ? { title: c.name, description: c.worldLine } : {};
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const c = chakraBySlug((await params).slug);
  if (!c) notFound();
  return <ChakraWorld chakra={c} />;
}
