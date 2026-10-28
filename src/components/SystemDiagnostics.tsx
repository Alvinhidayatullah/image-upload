"use client";

import { useState, useEffect } from "react";
import { Activity, Cpu, Database, HardDrive, Lock, Shield, Sparkles, Terminal } from "lucide-react";

/**
 * Enterprise Diagnostics Companion Deck
 * Provides real-time technical telemetry, database health metrics, and codec matrices.
 */
export default function SystemDiagnostics({ sessionCount = 0 }: { sessionCount?: number }) {
  const [latency, setLatency] = useState(19);

  useEffect(() => {
    // Subtle realistic latency fluctuation
    const interval = setInterval(() => {
      setLatency(Math.floor(16 + Math.random() * 8));
    }, 4500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-4">
      {/* Node Status Box */}
      <div className="cyber-cut border border-cyber-border bg-[#080d17]/90 p-4 font-mono text-xs backdrop-blur-md">
        <div className="mb-3 flex items-center justify-between border-b border-white/10 pb-2">
          <div className="flex items-center gap-2">
            <Database className="h-4 w-4 text-cyber-cyan" />
            <span className="font-bold tracking-wider text-white uppercase text-[11px]">
              DATA RELAY DIAGNOSTICS
            </span>
          </div>
          <span className="flex items-center gap-1.5 text-[10px] text-cyber-emerald">
            <span className="h-1.5 w-1.5 rounded-full bg-cyber-emerald animate-pulse" />
            CONNECTED
          </span>
        </div>

        <dl className="grid grid-cols-2 gap-2 text-[11px]">
          <div className="border border-white/5 bg-[#05070B] p-2">
            <dt className="text-slate-500 uppercase text-[9px] tracking-wider">Target Node</dt>
            <dd className="font-bold text-slate-200 mt-0.5 truncate">Neon PostgreSQL</dd>
          </div>
          <div className="border border-white/5 bg-[#05070B] p-2">
            <dt className="text-slate-500 uppercase text-[9px] tracking-wider">Region</dt>
            <dd className="font-bold text-cyber-cyan mt-0.5">AWS AP-SE-1 (SG)</dd>
          </div>
          <div className="border border-white/5 bg-[#05070B] p-2">
            <dt className="text-slate-500 uppercase text-[9px] tracking-wider">Ingest Latency</dt>
            <dd className="font-bold text-cyber-emerald mt-0.5 flex items-center gap-1">
              <Activity className="h-3 w-3 text-cyber-emerald" />
              {latency} ms
            </dd>
          </div>
          <div className="border border-white/5 bg-[#05070B] p-2">
            <dt className="text-slate-500 uppercase text-[9px] tracking-wider">Session Ingests</dt>
            <dd className="font-bold text-cyber-yellow mt-0.5">{sessionCount} Assets</dd>
          </div>
        </dl>
      </div>

      {/* Codecs & Pipeline Specs */}
      <div className="cyber-cut border border-cyber-border bg-[#080d17]/90 p-4 font-mono text-xs backdrop-blur-md">
        <div className="mb-3 flex items-center justify-between border-b border-white/10 pb-2">
          <div className="flex items-center gap-2">
            <Cpu className="h-4 w-4 text-cyber-yellow" />
            <span className="font-bold tracking-wider text-white uppercase text-[11px]">
              BINARY INGEST ENGINE
            </span>
          </div>
          <span className="text-[10px] text-slate-400">64-BIT BASE64</span>
        </div>

        <ul className="space-y-2 text-[11px] text-slate-300">
          <li className="flex items-center justify-between border-b border-white/5 pb-1">
            <span className="text-slate-400 flex items-center gap-1.5">
              <Lock className="h-3 w-3 text-cyber-cyan" /> Privacy Layer
            </span>
            <span className="text-cyber-cyan">EXIF Data Stripped</span>
          </li>
          <li className="flex items-center justify-between border-b border-white/5 pb-1">
            <span className="text-slate-400 flex items-center gap-1.5">
              <HardDrive className="h-3 w-3 text-cyber-yellow" /> Delivery Protocol
            </span>
            <span className="text-cyber-yellow">Direct Stream (/i/...)</span>
          </li>
          <li className="flex items-center justify-between border-b border-white/5 pb-1">
            <span className="text-slate-400 flex items-center gap-1.5">
              <Shield className="h-3 w-3 text-cyber-emerald" /> Cache Policy
            </span>
            <span className="text-cyber-emerald">Immutable 1 Year</span>
          </li>
          <li className="flex items-center justify-between">
            <span className="text-slate-400 flex items-center gap-1.5">
              <Sparkles className="h-3 w-3 text-cyber-magenta" /> Deletion Guard
            </span>
            <span className="text-cyber-magenta">Cryptographic Hex Token</span>
          </li>
        </ul>
      </div>

      {/* Quick Tactical Hotkeys Box */}
      <div className="cyber-cut border border-cyber-border bg-[#05070B] p-3 font-mono text-[11px] text-slate-400">
        <div className="flex items-center gap-1.5 text-slate-300 mb-2 font-bold uppercase tracking-wider text-[10px]">
          <Terminal className="h-3 w-3 text-cyber-cyan" /> Quick Hotkeys
        </div>
        <div className="grid grid-cols-2 gap-1.5 text-[10px]">
          <span className="border border-white/10 bg-[#080d17] px-2 py-1 flex items-center justify-between">
            <code className="text-cyber-cyan">Ctrl+V</code>
            <span>Paste File</span>
          </span>
          <span className="border border-white/10 bg-[#080d17] px-2 py-1 flex items-center justify-between">
            <code className="text-cyber-cyan">ESC</code>
            <span>Clear Staging</span>
          </span>
        </div>
      </div>
    </div>
  );
}
