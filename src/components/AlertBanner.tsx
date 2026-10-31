"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Info, ShieldCheck, X } from "lucide-react";
import { playClick } from "@/lib/sound";

/**
 * Clean & Informative Operational Alert Banner (PRD §5.A.2)
 * Crisp, human copy adhering to No-AI-Slop & Anti-Slop guidelines.
 */
export default function AlertBanner() {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <AnimatePresence>
      <motion.div
        role="region"
        id="system-alert"
        aria-label="Informasi batas unggahan"
        initial={{ opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, height: 0, marginBottom: 0 }}
        className="cyber-cut relative mb-6 border border-cyber-cyan/30 bg-[#080d17]/85 px-4 py-3 backdrop-blur-md shadow-lg"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3 min-w-0">
            <span className="relative flex h-2 w-2 shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyber-cyan opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-cyber-cyan" />
            </span>
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1 font-mono text-[11px]">
              <span className="font-bold text-cyber-cyan tracking-wider flex items-center gap-1">
                <Info className="h-3 w-3" /> INFORMASI:
              </span>
              <span className="text-slate-300">
                Maksimal <strong className="text-cyber-yellow">5 MB</strong>
              </span>
              <span className="text-slate-600 hidden sm:inline">·</span>
              <span className="text-slate-300">
                Format: <span className="text-white">JPG, PNG, GIF, WEBP, SVG</span>
              </span>
              <span className="text-slate-600 hidden sm:inline">·</span>
              <span className="text-cyber-emerald flex items-center gap-1 font-medium">
                <ShieldCheck className="h-3 w-3" /> Privasi EXIF Bersih
              </span>
            </div>
          </div>

          <button
            type="button"
            id="dismiss-alert-banner"
            onClick={() => {
              playClick();
              setDismissed(true);
            }}
            aria-label="Tutup pemberitahuan"
            className="self-end sm:self-center text-slate-400 hover:text-white transition-colors p-1"
            title="Tutup pemberitahuan"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
