import type { Metadata, Viewport } from "next";
import { Orbitron, Space_Grotesk, Share_Tech_Mono } from "next/font/google";
import "./globals.css";
import CyberBackground from "@/components/CyberBackground";

const display = Orbitron({
  subsets: ["latin"],
  weight: ["500", "700", "800", "900"],
  variable: "--font-display",
});

const sans = Space_Grotesk({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-sans",
});

const mono = Share_Tech_Mono({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: "image upload",
  description:
    "Fast and lightweight image upload service. Instant Direct Links, BBCode, Markdown, and QR Code.",
};

export const viewport: Viewport = {
  themeColor: "#05070B",
  colorScheme: "dark",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="id" className={`${display.variable} ${sans.variable} ${mono.variable}`} suppressHydrationWarning>
      <body className="min-h-dvh bg-cyber-void font-sans text-slate-200 antialiased selection:bg-cyber-yellow selection:text-cyber-void" suppressHydrationWarning>
        <CyberBackground />
        <div className="relative z-10 flex min-h-dvh flex-col">{children}</div>
      </body>
    </html>
  );
}
