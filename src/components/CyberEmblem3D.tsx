"use client";

import { motion } from "framer-motion";

/**
 * Pure CSS/GPU 3D Cyber Emblem (Simple, Sleek, 0% CPU overhead)
 * - Renders a 3D isometric holographic cyber prism
 * - Fully hardware-accelerated via CSS 3D transforms
 * - Zero WebGL or animation loops, preserving full battery & 60fps responsiveness
 */
export default function CyberEmblem3D() {
  return (
    <div
      aria-hidden
      className="relative mx-auto mb-4 flex h-16 w-16 items-center justify-center select-none"
      style={{ perspective: 600 }}
    >
      {/* Ambient Radial Glow */}
      <div className="absolute inset-0 rounded-full bg-cyber-cyan/15 blur-xl pointer-events-none" />

      {/* 3D Isometric Rotating Assembly */}
      <motion.div
        className="relative h-10 w-10"
        style={{
          transformStyle: "preserve-3d",
        }}
        animate={{
          rotateX: [60, 60],
          rotateZ: [0, 360],
        }}
        transition={{
          rotateZ: { duration: 18, repeat: Infinity, ease: "linear" },
        }}
        whileHover={{ scale: 1.15 }}
      >
        {/* Top Face */}
        <div
          className="absolute inset-0 border border-cyber-cyan/80 bg-cyber-cyan/10 backdrop-blur-sm shadow-[0_0_15px_rgba(0,240,255,0.4)]"
          style={{ transform: "translateZ(14px)" }}
        />

        {/* Bottom Face */}
        <div
          className="absolute inset-0 border border-cyber-yellow/60 bg-cyber-yellow/5"
          style={{ transform: "translateZ(-14px)" }}
        />

        {/* Center Glowing Core */}
        <div
          className="absolute inset-2 rounded-full border border-cyber-cyan bg-cyber-cyan shadow-[0_0_12px_#00f0ff]"
          style={{ transform: "translateZ(0px)" }}
        />

        {/* Outer Ring */}
        <div
          className="absolute -inset-3 rounded-full border border-dashed border-cyber-cyan/40"
          style={{ transform: "translateZ(0px)" }}
        />
      </motion.div>
    </div>
  );
}
