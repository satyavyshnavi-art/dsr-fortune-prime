import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ToasterProvider } from "@/components/toaster-provider";
import "./globals.css";

// Clean, neat type — Geist Sans for everything; Geist Mono available for
// tabular numbers when needed. No serif, no italic-as-design.
const sans = Geist({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});
const mono = Geist_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
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
      className={`${sans.variable} ${mono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans bg-[var(--parchment)] text-[var(--ink)]">
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
