import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ToasterProvider } from "@/components/toaster-provider";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
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
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col font-sans">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:z-[100] focus:top-2 focus:left-2 focus:px-4 focus:py-2 focus:bg-blue-600 focus:text-white focus:rounded-md focus:text-sm focus:font-medium"
        >
          Skip to content
        </a>
        {children}
        <ToasterProvider />
      </body>
    </html>
  );
}
