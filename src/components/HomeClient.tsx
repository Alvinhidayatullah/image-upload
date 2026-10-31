"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import gsap from "gsap";
import Navbar from "./Navbar";
import CyberEmblem3D from "./CyberEmblem3D";
import AlertBanner from "./AlertBanner";
import UploadCard from "./UploadCard";
import ResultCard from "./ResultCard";
import LocalVault from "./LocalVault";
import { addToVault, clearVault, readVault, removeFromVault, subscribeVault } from "@/lib/vault";
import type { UploadResult } from "@/lib/utils";

export default function HomeClient() {
  const [result, setResult] = useState<UploadResult | null>(null);
  const [vault, setVault] = useState<UploadResult[]>([]);
  const [mounted, setMounted] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLElement>(null);
  const uploadDeckRef = useRef<HTMLDivElement>(null);
  const topRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
    setVault(readVault());
    return subscribeVault(() => setVault(readVault()));
  }, []);

  // Lightweight GSAP Entrance Animation (Anti-Lag, single pass)
  useEffect(() => {
    const ctx = gsap.context(() => {
      if (heroRef.current) {
        gsap.fromTo(
          heroRef.current,
          { opacity: 0, y: 14 },
          { opacity: 1, y: 0, duration: 0.45, ease: "power2.out", clearProps: "all" },
        );
      }
    }, containerRef);

    return () => ctx.revert();
  }, []);

  function showResult(r: UploadResult) {
    setResult(r);
    requestAnimationFrame(() => topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }));
  }

  return (
    <div ref={containerRef} className="flex min-h-screen flex-col">
      <Navbar />

      <main className="mx-auto w-full max-w-3xl px-4 pb-20 pt-8 sm:px-6 flex-1">
        {/* Sleek Hero Header with 3D Cyber Emblem */}
        <header ref={heroRef} className="mb-6 text-center">
          <CyberEmblem3D />
          <h1 className="font-display text-3xl font-black uppercase tracking-wide text-white sm:text-5xl">
            image <span className="neon-text-cyan">upload</span>
          </h1>
          <p className="mt-2 text-xs sm:text-sm text-slate-400 max-w-md mx-auto">
            Hosting gambar cepat dan gratis. Dapatkan direct link, kode embed HTML, BBCode, dan QR code instan.
          </p>
        </header>

        {/* Operational System Policy Banner (PRD §5.A.2) */}
        <AlertBanner />

        {/* Upload & Result Area */}
        <div ref={topRef} className="scroll-mt-24 space-y-6">
          <AnimatePresence mode="popLayout">
            {result && (
              <motion.div
                key={result.id}
                initial={{ opacity: 0, y: -16, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96, filter: "blur(6px)", transition: { duration: 0.2 } }}
                transition={{ duration: 0.35 }}
              >
                <ResultCard result={result} onDismiss={() => setResult(null)} />
              </motion.div>
            )}
          </AnimatePresence>

          <div ref={uploadDeckRef}>
            <UploadCard
              onUploaded={(r) => {
                addToVault(r);
                showResult(r);
              }}
            />
          </div>
        </div>

        {/* Local Vault Archive (PRD §5.C) */}
        {mounted && (
          <LocalVault
            items={vault}
            onSelect={showResult}
            onForget={(id) => removeFromVault((v) => v.id === id)}
            onClear={clearVault}
          />
        )}
      </main>

      {/* Clean & Respectful Footer */}
      <footer className="mt-auto border-t border-cyber-border bg-[#05070B] py-6 font-mono text-[11px] text-slate-500 text-center">
        <div className="mx-auto max-w-4xl px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>image upload · hosting gambar cepat & murni</span>
          <span className="text-slate-600">PostgreSQL Powered</span>
        </div>
      </footer>
    </div>
  );
}
