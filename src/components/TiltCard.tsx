"use client";

import { useRef, type ReactNode } from "react";
import { motion, useMotionTemplate, useMotionValue, useSpring, useTransform } from "framer-motion";
import { cn } from "@/lib/utils";

type Accent = "cyan" | "magenta" | "yellow" | "emerald";

const ACCENT_CONFIG: Record<
  Accent,
  {
    border: string;
    borderGlow: string;
    cornerColor: string;
  }
> = {
  cyan: {
    border: "border-cyber-cyan/30 hover:border-cyber-cyan/50",
    borderGlow: "rgba(0,240,255,0.12)",
    cornerColor: "border-cyber-cyan",
  },
  yellow: {
    border: "border-cyber-yellow/30 hover:border-cyber-yellow/50",
    borderGlow: "rgba(252,238,10,0.12)",
    cornerColor: "border-cyber-yellow",
  },
  magenta: {
    border: "border-cyber-magenta/30 hover:border-cyber-magenta/50",
    borderGlow: "rgba(255,0,60,0.12)",
    cornerColor: "border-cyber-magenta",
  },
  emerald: {
    border: "border-cyber-emerald/30 hover:border-cyber-emerald/50",
    borderGlow: "rgba(0,255,163,0.12)",
    cornerColor: "border-cyber-emerald",
  },
};

/**
 * Clean & Sleek 3D Tilt Card (PRD §7)
 */
export default function TiltCard({
  children,
  className,
  accent = "cyan",
  id,
}: {
  children: ReactNode;
  className?: string;
  accent?: Accent;
  id?: string;
  serial?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const mx = useMotionValue(0);
  const my = useMotionValue(0);

  const sx = useSpring(mx, { stiffness: 120, damping: 20, mass: 0.5 });
  const sy = useSpring(my, { stiffness: 120, damping: 20, mass: 0.5 });

  const rotateY = useTransform(sx, [-0.5, 0.5], [-5, 5]);
  const rotateX = useTransform(sy, [-0.5, 0.5], [5, -5]);
  const glareX = useTransform(sx, [-0.5, 0.5], [10, 90]);
  const glareY = useTransform(sy, [-0.5, 0.5], [10, 90]);
  const glare = useMotionTemplate`radial-gradient(550px circle at ${glareX}% ${glareY}%, rgba(255,255,255,0.05), transparent 50%)`;

  const conf = ACCENT_CONFIG[accent];

  return (
    <div id={id} style={{ perspective: "1400px" }} className={cn("w-full", className)}>
      <motion.div
        ref={ref}
        onMouseMove={(e) => {
          const r = ref.current?.getBoundingClientRect();
          if (!r) return;
          mx.set((e.clientX - r.left) / r.width - 0.5);
          my.set((e.clientY - r.top) / r.height - 0.5);
        }}
        onMouseLeave={() => {
          mx.set(0);
          my.set(0);
        }}
        style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
        className="relative transition-shadow duration-300"
      >
        {/* Chassis Body */}
        <div
          aria-hidden
          className={cn(
            "pointer-events-none absolute inset-0 rounded-2xl bg-[#080c14]/90 backdrop-blur-xl border transition-colors",
            conf.border,
          )}
          style={{
            boxShadow: `0 20px 45px -10px rgba(0,0,0,0.8), 0 0 30px ${conf.borderGlow}`,
          }}
        />

        {/* Glare Reflection */}
        <motion.div aria-hidden className="pointer-events-none absolute inset-0 rounded-2xl" style={{ background: glare }} />

        {/* Main Content Area */}
        <div className="relative p-6 sm:p-8" style={{ transformStyle: "preserve-3d" }}>
          {children}
        </div>
      </motion.div>
    </div>
  );
}

export function Depth({
  z = 30,
  className,
  children,
}: {
  z?: number;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={className} style={{ transform: `translateZ(${z}px)` }}>
      {children}
    </div>
  );
}
