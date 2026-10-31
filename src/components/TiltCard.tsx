"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type Accent = "cyan" | "magenta" | "yellow" | "emerald";

const ACCENT_STYLES: Record<
  Accent,
  {
    border: string;
    glow: string;
  }
> = {
  cyan: {
    border: "border-cyber-cyan/35 hover:border-cyber-cyan/50",
    glow: "rgba(0, 240, 255, 0.06)",
  },
  yellow: {
    border: "border-cyber-yellow/35 hover:border-cyber-yellow/50",
    glow: "rgba(252, 238, 10, 0.06)",
  },
  magenta: {
    border: "border-cyber-magenta/35 hover:border-cyber-magenta/50",
    glow: "rgba(255, 0, 60, 0.06)",
  },
  emerald: {
    border: "border-cyber-emerald/35 hover:border-cyber-emerald/50",
    glow: "rgba(0, 255, 163, 0.06)",
  },
};

/**
 * Clean & Solid Static Card Container
 * - Zero 3D mouse-tracking tilt or motion calculations
 * - Zero GPU/CPU overhead, buttery smooth, completely stable
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
}) {
  const styles = ACCENT_STYLES[accent];

  return (
    <div
      id={id}
      className={cn(
        "relative w-full rounded-2xl border bg-[#080c14]/90 backdrop-blur-xl shadow-2xl transition-colors duration-150",
        styles.border,
        className,
      )}
      style={{
        boxShadow: `0 20px 45px -10px rgba(0, 0, 0, 0.8), 0 0 25px ${styles.glow}`,
      }}
    >
      <div className="relative p-6 sm:p-8">
        {children}
      </div>
    </div>
  );
}

/**
 * Static Depth wrapper (Zero 3D transform jitter)
 */
export function Depth({
  className,
  children,
}: {
  z?: number;
  className?: string;
  children: ReactNode;
}) {
  return <div className={className}>{children}</div>;
}
