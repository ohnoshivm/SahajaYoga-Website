import type { Metadata, Viewport } from "next";
import { Cormorant, Geist } from "next/font/google";
import "./globals.css";

const cormorant = Cormorant({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-cormorant",
  display: "swap",
});

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "SAHAJA YOGA: a space to return to yourself",
    template: "%s · SAHAJA YOGA",
  },
  description:
    "An immersive Sahaja Yoga meditation space: guided practice, the seven chakras, a ten-lap mantra counter and your own quiet practice history. An independent project.",
  applicationName: "SAHAJA YOGA",
};

export const viewport: Viewport = {
  themeColor: "#efe6db",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${cormorant.variable} ${geist.variable}`}>
      <body className="grain">{children}</body>
    </html>
  );
}
