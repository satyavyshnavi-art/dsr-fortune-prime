import type { Metadata } from "next";
import { Newsreader, JetBrains_Mono } from "next/font/google";
import { ToasterProvider } from "@/components/toaster-provider";
import "./globals.css";

// Specification Sheet pairing — two fonts, no third:
// - Newsreader (display italic) for hero numbers, page titles
// - JetBrains Mono for EVERYTHING ELSE: body, labels, nav, data, status
//
// Mono-everywhere is the signature move. Most dashboards use sans for body;
// this one reads like a building's technical document because we don't.
const display = Newsreader({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
  display: "swap",
});
const mono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "DSR Fortune Prime — Facility Management",
  description: "Comprehensive facility management portal for DSR Fortune Prime",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${display.variable} ${mono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-mono bg-[var(--parchment)] text-[var(--ink)]">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:z-[100] focus:top-2 focus:left-2 focus:px-4 focus:py-2 focus:bg-[var(--mark)] focus:text-white focus:rounded focus:text-sm focus:font-medium"
        >
          Skip to content
        </a>
        {children}
        <ToasterProvider />
      </body>
    </html>
  );
}
