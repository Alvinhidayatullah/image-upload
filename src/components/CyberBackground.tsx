"use client";

/**
 * Lightweight Modern Static Background
 * - Deep Obsidian void base (#05070B)
 * - Subtle atmospheric gradients without any heavy animation or WebGL loops
 */
export default function CyberBackground() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-0 overflow-hidden select-none">
      {/* Deep Obsidian base */}
      <div className="absolute inset-0 bg-[#05070B]" />

      {/* Atmospheric subtle static lighting gradients */}
      <div className="absolute inset-x-0 top-0 h-[40vh] bg-[radial-gradient(ellipse_80%_50%_at_50%_-10%,rgba(0,240,255,0.06),transparent_70%)]" />
      <div className="absolute right-0 top-[20%] h-[40vh] w-[35vw] bg-[radial-gradient(ellipse_at_center,rgba(255,0,60,0.025),transparent_70%)]" />
      <div className="absolute left-0 bottom-0 h-[35vh] w-[40vw] bg-[radial-gradient(ellipse_at_center,rgba(0,255,163,0.02),transparent_70%)]" />

      {/* Static clean bottom border */}
      <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
    </div>
  );
}

