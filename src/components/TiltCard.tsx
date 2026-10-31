"use client";

import { useEffect, useRef, useState, type MouseEvent, type ReactNode } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { cn } from "@/lib/utils";

type Accent = "cyan" | "magenta" | "yellow" | "emerald";

const ACCENT_STYLES: Record<
  Accent,
  {
    border: string;
    glow: string;
    specular: string;
    hudBadge: string;
  }
> = {
  cyan: {
    border: "border-cyber-cyan/30 hover:border-cyber-cyan/50",
    glow: "rgba(0, 240, 255, 0.08)",
    specular: "rgba(0, 240, 255, 0.12)",
    hudBadge: "border-cyber-cyan/40 bg-cyber-cyan/10 text-cyber-cyan",
  },
  yellow: {
    border: "border-cyber-yellow/30 hover:border-cyber-yellow/50",
    glow: "rgba(252, 238, 10, 0.08)",
    specular: "rgba(252, 238, 10, 0.12)",
    hudBadge: "border-cyber-yellow/40 bg-cyber-yellow/10 text-cyber-yellow",
  },
  magenta: {
    border: "border-cyber-magenta/30 hover:border-cyber-magenta/50",
    glow: "rgba(255, 0, 60, 0.08)",
    specular: "rgba(255, 0, 60, 0.12)",
    hudBadge: "border-cyber-magenta/40 bg-cyber-magenta/10 text-cyber-magenta",
  },
  emerald: {
    border: "border-cyber-emerald/30 hover:border-cyber-emerald/50",
    glow: "rgba(0, 255, 163, 0.08)",
    specular: "rgba(0, 255, 163, 0.12)",
    hudBadge: "border-cyber-emerald/40 bg-cyber-emerald/10 text-cyber-emerald",
  },
};

/**
 * Lightweight 3D Perspective Card (Simple, Sleek, Zero-Lag)
 * - Hardware-accelerated CSS 3D perspective (1000px)
 * - Damped micro-tilt (-3.5deg to +3.5deg) on desktop hover
 * - Auto-disabled on mobile/touch screens to ensure 100% fluid performance
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
  const cardRef = useRef<HTMLDivElement>(null);
  const [canTilt, setCanTilt] = useState(false);

  // Motion values for smooth 3D rotation
  const mouseX = useMotionValue(0.5);
  const mouseY = useMotionValue(0.5);

  // Smooth springs to eliminate any jitter (Anti-Lag)
  const springX = useSpring(mouseX, { stiffness: 180, damping: 24, mass: 0.8 });
  const springY = useSpring(mouseY, { stiffness: 180, damping: 24, mass: 0.8 });

  // Subtle max tilt: ±3.5 degrees (Classy & grounded, not over-the-top)
  const rotateX = useTransform(springY, [0, 1], [3.5, -3.5]);
  const rotateY = useTransform(springX, [0, 1], [-3.5, 3.5]);

  // Subtle specular light position
  const lightX = useTransform(springX, [0, 1], [20, 80]);
  const lightY = useTransform(springY, [0, 1], [20, 80]);

  useEffect(() => {
    // Only enable mouse tilt on fine-pointer (mouse) desktop devices
    if (typeof window !== "undefined") {
      const isFinePointer = window.matchMedia("(pointer: fine)").matches;
      const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      setCanTilt(isFinePointer && !prefersReducedMotion);
    }
  }, []);

  function handleMouseMove(e: MouseEvent<HTMLDivElement>) {
    if (!canTilt || !cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    mouseX.set(Math.max(0, Math.min(1, x)));
    mouseY.set(Math.max(0, Math.min(1, y)));
  }

  function handleMouseLeave() {
    if (!canTilt) return;
    // Return smoothly to center
    mouseX.set(0.5);
    mouseY.set(0.5);
  }

  const styles = ACCENT_STYLES[accent];

  // Specular gradient calculated at top level
  const specularBg = useTransform(
    [lightX, lightY],
    ([x, y]) => `radial-gradient(circle 380px at ${x}% ${y}%, ${styles.specular}, transparent 70%)`,
  );

  return (
    <div
      style={{ perspective: 1000 }}
      className="relative w-full"
    >
      <motion.div
        ref={cardRef}
        id={id}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{
          rotateX: canTilt ? rotateX : 0,
          rotateY: canTilt ? rotateY : 0,
          transformStyle: "preserve-3d",
          willChange: canTilt ? "transform" : "auto",
        }}
        className={cn(
          "relative w-full rounded-2xl border bg-[#080c14]/90 backdrop-blur-xl shadow-2xl transition-colors duration-200",
          styles.border,
          className,
        )}
      >
        {/* Subtle Specular Ambient Sheen */}
        {canTilt && (
          <motion.div
            aria-hidden
            className="pointer-events-none absolute -inset-px rounded-2xl opacity-60 transition-opacity duration-300"
            style={{
              background: specularBg,
            }}
          />
        )}

        {/* Content Deck with Layered 3D Depth */}
        <div
          className="relative p-6 sm:p-8"
          style={{ transformStyle: "preserve-3d" }}
        >
          {children}
        </div>
      </motion.div>
    </div>
  );
}

/**
 * 3D Depth Layer component (PRD §7)
 * Lifts elements forward in 3D space with hardware-accelerated translateZ
 */
export function Depth({
  z = 20,
  className,
  children,
}: {
  z?: number;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div
      className={className}
      style={{
        transform: `translateZ(${z}px)`,
        transformStyle: "preserve-3d",
      }}
    >
      {children}
    </div>
  );
}
