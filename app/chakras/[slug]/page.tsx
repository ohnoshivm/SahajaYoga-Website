import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CHAKRAS, chakraBySlug } from "@/chakras/registry";
import { ChakraWorld } from "@/pages-ui/ChakraWorld";

export function generateStaticParams() {
  return CHAKRAS.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const c = chakraBySlug(slug);
  return c ? { title: `${c.name}: ${c.quality}`, description: c.line } : {};
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const chakra = chakraBySlug(slug);
  if (!chakra) notFound();
  return <ChakraWorld chakra={chakra} />;
}
