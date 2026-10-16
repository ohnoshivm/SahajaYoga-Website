import type { Metadata, Viewport } from "next";
import { Cormorant, Hanken_Grotesk } from "next/font/google";
import "./globals.css";

const cormorant = Cormorant({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-cormorant",
  display: "swap",
});
const hanken = Hanken_Grotesk({ subsets: ["latin"], weight: ["400", "500", "600"], variable: "--font-hanken", display: "swap" });

export const metadata: Metadata = {
  title: { default: "SAHAJA YOGA · A space to return to yourself", template: "%s · SAHAJA YOGA" },
  description:
    "An immersive Sahaja Yoga meditation companion: guided routines, a ten-lap mantra counter, the seven chakra worlds and their ragas. An independent project.",
};

export const viewport: Viewport = { themeColor: "#efe6db", width: "device-width", initialScale: 1 };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${cormorant.variable} ${hanken.variable}`}>
      <body>{children}</body>
    </html>
  );
}
