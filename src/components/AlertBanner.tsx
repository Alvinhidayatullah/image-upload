"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldCheck, X } from "lucide-react";
import { playClick } from "@/lib/sound";

/**
 * Enterprise Operational Status Strip (Anti-AI Slop)
 * Compact, informative, military-spec HUD banner.
 */
export default function AlertBanner() {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <AnimatePresence>
      <motion.div
        role="region"
        id="system-alert"
        aria-label="System operational limits"
        initial={{ opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, height: 0, marginBottom: 0 }}
        className="cyber-cut relative mb-6 border border-cyber-cyan/20 bg-[#080d17]/80 px-4 py-2.5 backdrop-blur-md"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="relative flex h-2 w-2 shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyber-cyan opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-cyber-cyan" />
            </span>
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1 font-mono text-[11px]">
              <span className="font-bold text-cyber-cyan tracking-wider">[SYS//POLICY]</span>
              <span className="text-slate-300">
                MAX INGEST: <strong className="text-cyber-yellow">5.00 MB</strong>
              </span>
              <span className="text-slate-600 hidden sm:inline">|</span>
              <span className="text-slate-400">
                CODECS: <span className="text-slate-200">JPG · PNG · GIF · WEBP · SVG</span>
              </span>
              <span className="text-slate-600 hidden sm:inline">|</span>
              <span className="text-slate-400 flex items-center gap-1">
                <ShieldCheck className="h-3 w-3 text-cyber-emerald" />
                EXIF PURGED
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
            aria-label="Dismiss banner"
            className="self-end sm:self-center text-slate-500 hover:text-slate-300 transition-colors p-0.5"
            title="Dismiss notice"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
