"use client";

import { useEffect, useRef, useState } from "react";
import Navbar from "./Navbar";
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

  const uploadDeckRef = useRef<HTMLDivElement>(null);
  const topRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
    setVault(readVault());
    return subscribeVault(() => setVault(readVault()));
  }, []);

  function showResult(r: UploadResult) {
    setResult(r);
    requestAnimationFrame(() => topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }));
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      <main className="mx-auto w-full max-w-3xl px-4 pb-20 pt-8 sm:px-6 flex-1">
        {/* Clean Hero Header (Completely Static & Lightweight) */}
        <header className="mb-6 text-center">
          <h1 className="font-display text-3xl font-black uppercase tracking-wide text-white sm:text-5xl">
            image <span className="neon-text-cyan">upload</span>
          </h1>
          <p className="mt-2 text-xs sm:text-sm text-slate-400 max-w-md mx-auto">
            Hosting gambar cepat dan gratis. Dapatkan direct link, kode embed HTML, BBCode, dan QR code instan.
          </p>
        </header>

        {/* Operational System Policy Banner */}
        <AlertBanner />

        {/* Upload & Result Area */}
        <div ref={topRef} className="scroll-mt-24 space-y-6">
          {result && (
            <ResultCard result={result} onDismiss={() => setResult(null)} />
          )}

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
