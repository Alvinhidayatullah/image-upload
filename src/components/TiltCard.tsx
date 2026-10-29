"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type Accent = "cyan" | "magenta" | "yellow" | "emerald";

const ACCENT_CONFIG: Record<
  Accent,
  {
    border: string;
    borderGlow: string;
  }
> = {
  cyan: {
    border: "border-cyber-cyan/35 hover:border-cyber-cyan/50",
    borderGlow: "rgba(0,240,255,0.06)",
  },
  yellow: {
    border: "border-cyber-yellow/35 hover:border-cyber-yellow/50",
    borderGlow: "rgba(252,238,10,0.06)",
  },
  magenta: {
    border: "border-cyber-magenta/35 hover:border-cyber-magenta/50",
    borderGlow: "rgba(255,0,60,0.06)",
  },
  emerald: {
    border: "border-cyber-emerald/35 hover:border-cyber-emerald/50",
    borderGlow: "rgba(0,255,163,0.06)",
  },
};

/**
 * Clean & Solid Card Container (Zero gimmicky tilt/glare animation)
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
  const conf = ACCENT_CONFIG[accent];

  return (
    <div
      id={id}
      className={cn(
        "relative w-full rounded-2xl border bg-[#080c14]/90 backdrop-blur-xl transition-colors shadow-2xl",
        conf.border,
        className,
      )}
      style={{
        boxShadow: `0 20px 45px -10px rgba(0,0,0,0.8), 0 0 25px ${conf.borderGlow}`,
      }}
    >
      <div className="relative p-6 sm:p-8">
        {children}
      </div>
    </div>
  );
}

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
