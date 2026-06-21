import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Portfolify — Your Professional Developer Card",
  description: "Create a design-first, premium digital developer card. Showcase projects and collect verified skill endorsements.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full dark antialiased`}
    >
      <body className="min-h-full flex flex-col bg-black text-neutral-100 relative overflow-x-hidden">
        {/* Animated Ambient Apple TV Screensaver Background */}
        <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
          {/* Orb 1: Ambient Violet/Indigo Glow */}
          <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full bg-indigo-600/[0.12] blur-[130px] animate-bubble-slow-1" />
          {/* Orb 2: Ambient Deep Blue Glow */}
          <div className="absolute bottom-[-20%] right-[-10%] w-[700px] h-[700px] rounded-full bg-blue-600/[0.10] blur-[140px] animate-bubble-slow-2" />
          {/* Orb 3: Ambient Charcoal/Teal Glow */}
          <div className="absolute top-[30%] left-[10%] w-[500px] h-[500px] rounded-full bg-emerald-600/[0.05] blur-[120px] animate-bubble-slow-3" />
        </div>

        {/* Content Wrapper */}
        <div className="relative z-10 flex-1 flex flex-col">
          {children}
        </div>
      </body>
    </html>
  );
}
