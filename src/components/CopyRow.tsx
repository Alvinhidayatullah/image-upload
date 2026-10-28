"use client";

import { useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, Copy } from "lucide-react";
import { cn } from "@/lib/utils";
import { playCopyChirp } from "@/lib/sound";

export async function copyText(text: string) {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    /* fallback to textarea */
  }
  const ta = document.createElement("textarea");
  ta.value = text;
  ta.setAttribute("readonly", "");
  ta.style.position = "fixed";
  ta.style.opacity = "0";
  document.body.appendChild(ta);
  ta.select();
  let ok = false;
  try {
    ok = document.execCommand("copy");
  } catch {
    ok = false;
  }
  document.body.removeChild(ta);
  return ok;
}

/**
 * Enterprise Tactical Copy Button with Audio & Visual Feedback
 */
export function CopyButton({
  value,
  id,
  className,
  label = "[ COPY ]",
}: {
  value: string;
  id?: string;
  className?: string;
  label?: string;
}) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    playCopyChirp();
    if (await copyText(value)) {
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    }
  }

  return (
    <button
      id={id}
      type="button"
      onClick={handleCopy}
      className={cn(
        "cyber-btn-ghost min-w-[96px] shrink-0 font-mono text-[11px]",
        copied && "border-cyber-yellow bg-cyber-yellow text-cyber-void shadow-neon-yellow",
        className,
      )}
      aria-live="polite"
    >
      <AnimatePresence mode="wait" initial={false}>
        {copied ? (
          <motion.span
            key="copied"
            initial={{ y: 6, opacity: 0 }}
            animate={{ y: 0, opacity: 1, scale: [1, 1.08, 1] }}
            exit={{ y: -6, opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="flex items-center gap-1 font-bold tracking-widest text-cyber-void"
          >
            <Check className="h-3 w-3 stroke-[3]" /> COPIED!
          </motion.span>
        ) : (
          <motion.span
            key="copy"
            initial={{ y: 6, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -6, opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="flex items-center gap-1.5"
          >
            <Copy className="h-3 w-3" /> {label}
          </motion.span>
        )}
      </AnimatePresence>
    </button>
  );
}

/**
 * High-Precision Link Rail with label, input, and copy button
 */
export default function CopyRow({
  id,
  label,
  sublabel,
  icon,
  value,
  accent = "cyan",
}: {
  id: string;
  label: string;
  sublabel: string;
  icon: ReactNode;
  value: string;
  accent?: "cyan" | "magenta" | "yellow";
}) {
  const accentClasses =
    accent === "magenta"
      ? "border-cyber-magenta/50 text-cyber-magenta focus:border-cyber-magenta"
      : accent === "yellow"
        ? "border-cyber-yellow/50 text-cyber-yellow focus:border-cyber-yellow"
        : "border-cyber-cyan/40 text-cyber-cyan focus:border-cyber-cyan";

  const labelClasses =
    accent === "magenta"
      ? "text-cyber-magenta"
      : accent === "yellow"
        ? "text-cyber-yellow"
        : "text-cyber-cyan";

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs font-mono">
        <label htmlFor={`${id}-input`} className="flex items-center gap-2 cursor-pointer">
          <span className={labelClasses}>{icon}</span>
          <span className="font-bold text-slate-100 uppercase tracking-wider text-[11px]">{label}</span>
          <span className="text-[10px] text-slate-500">{"// "}{sublabel}</span>
        </label>
      </div>
      <div className="flex items-stretch gap-2">
        <input
          id={`${id}-input`}
          readOnly
          value={value}
          onFocus={(e) => e.currentTarget.select()}
          className={cn(
            "cyber-input py-2.5 font-mono text-xs selection:bg-cyber-cyan selection:text-black",
            accentClasses,
          )}
        />
        <CopyButton id={`${id}-copy`} value={value} />
      </div>
    </div>
  );
}
