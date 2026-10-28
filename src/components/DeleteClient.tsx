"use client";

import { useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, CheckCircle2, FileX, Skull, TriangleAlert } from "lucide-react";
import TiltCard, { Depth } from "./TiltCard";
import { removeFromVault } from "@/lib/vault";
import { formatBytes } from "@/lib/utils";
import { playClick, playSuccess } from "@/lib/sound";

type Meta = { id: string; filename: string; ext: string; sizeBytes: number; createdAt: string };
type State = "confirm" | "terminating" | "terminated";

export default function DeleteClient({ token, record }: { token: string; record: Meta | null }) {
  const [state, setState] = useState<State>("confirm");
  const [error, setError] = useState<string | null>(null);

  async function terminate() {
    playClick();
    setState("terminating");
    setError(null);
    try {
      const res = await fetch(`/api/delete/${token}`, { method: "DELETE" });
      const data = await res.json().catch(() => null);
      if (!res.ok) throw new Error(data?.error ?? `Purge failed (HTTP ${res.status}).`);
      removeFromVault((v) => v.deleteToken === token);
      playSuccess();
      setState("terminated");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Termination aborted.");
      setState("confirm");
    }
  }

  if (!record) {
    return (
      <TiltCard accent="magenta" serial="PURGE//NOT-FOUND">
        <Depth z={30} className="flex flex-col items-center gap-4 py-8 text-center font-mono">
          <div className="flex h-16 w-16 items-center justify-center border border-cyber-magenta/40 bg-cyber-magenta/10">
            <FileX className="h-9 w-9 text-cyber-magenta" />
          </div>
          <h1 className="font-display text-xl font-bold uppercase tracking-[0.14em] neon-text-magenta">
            Asset Not Found
          </h1>
          <p className="max-w-md text-xs text-slate-400">
            The deletion token is invalid, or the asset has already been permanently purged from the Neon database.
          </p>
          <BackHome />
        </Depth>
      </TiltCard>
    );
  }

  const direct = `/i/${record.id}.${record.ext}`;

  return (
    <TiltCard accent="magenta" serial="PURGE//PROTOCOL-ZERO">
      <AnimatePresence mode="wait">
        {state === "terminated" ? (
          <motion.div
            key="done"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center gap-4 py-8 text-center font-mono"
          >
            <Depth z={40}>
              <div className="flex h-16 w-16 items-center justify-center border border-cyber-emerald/40 bg-cyber-emerald/10">
                <CheckCircle2 className="h-10 w-10 text-cyber-emerald drop-shadow-[0_0_12px_#00ffa3]" />
              </div>
            </Depth>
            <h1 className="font-display text-2xl font-bold uppercase tracking-[0.14em] text-cyber-emerald">
              Asset Terminated
            </h1>
            <p className="max-w-md text-xs text-slate-300">
              <span className="text-white font-bold">{record.filename}</span> and its binary records have been permanently eradicated from the Neon cluster.
            </p>
            <BackHome />
          </motion.div>
        ) : (
          <motion.div key="confirm" exit={{ opacity: 0, filter: "blur(6px)" }} transition={{ duration: 0.3 }}>
            <Depth z={20} className="mb-6 border-b border-white/10 pb-4">
              <p className="hud-label flex items-center gap-1.5 text-cyber-magenta">
                <TriangleAlert className="h-3.5 w-3.5 animate-pulse" /> HAZARD ZONE // REVOCATION PROTOCOL
              </p>
              <h1 className="font-display text-xl font-bold uppercase tracking-[0.12em] text-white sm:text-2xl mt-0.5">
                Confirm Asset Deletion
              </h1>
            </Depth>

            {/* Asset Visual Preview */}
            <Depth z={45} className="mb-6 flex justify-center">
              <div className="cyber-cut border-2 border-cyber-magenta/60 bg-[#060912] p-2 shadow-neon-magenta">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={direct}
                  alt={record.filename}
                  className={`max-h-64 w-auto max-w-full object-contain ${
                    state === "terminating" ? "animate-pulse grayscale" : ""
                  }`}
                />
              </div>
            </Depth>

            {/* Telemetry Specification Table */}
            <Depth z={25}>
              <dl className="cyber-cut-sm mb-6 grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 border border-cyber-border bg-[#060912] p-4 font-mono text-xs">
                <dt className="text-slate-500 uppercase text-[10px] tracking-wider">Filename</dt>
                <dd className="truncate text-white font-bold">{record.filename}</dd>

                <dt className="text-slate-500 uppercase text-[10px] tracking-wider">Asset ID</dt>
                <dd className="text-cyber-cyan">{record.id}</dd>

                <dt className="text-slate-500 uppercase text-[10px] tracking-wider">Payload Size</dt>
                <dd className="text-slate-300">{formatBytes(record.sizeBytes)}</dd>

                <dt className="text-slate-500 uppercase text-[10px] tracking-wider">Ingested At</dt>
                <dd className="text-slate-300">
                  {new Date(record.createdAt).toLocaleString("id-ID", { dateStyle: "medium", timeStyle: "medium" })}
                </dd>
              </dl>

              <div className="mb-6 border-l-2 border-cyber-magenta bg-cyber-magenta/10 p-3 font-mono text-xs text-slate-300">
                <strong className="text-cyber-magenta uppercase">Warning:</strong> This operation is irreversible. All direct links, forum embeds, and markdown pointers will immediately 404.
              </div>

              {error && (
                <div role="alert" className="cyber-cut-sm mb-4 border border-cyber-magenta bg-cyber-magenta/20 p-3 font-mono text-xs text-cyber-magenta">
                  {error}
                </div>
              )}
            </Depth>

            {/* Action Buttons */}
            <Depth z={35} className="flex flex-col gap-3 sm:flex-row">
              <Link href="/" id="cancel-delete" className="cyber-btn-ghost flex-1 py-3.5 text-center" onClick={() => playClick()}>
                [ ABORT & RETURN ]
              </Link>
              <button
                id="terminate-button"
                type="button"
                onClick={terminate}
                disabled={state === "terminating"}
                className="cyber-btn-danger flex-[2] py-4 text-xs tracking-[0.2em]"
              >
                <Skull className="h-4 w-4" />
                {state === "terminating" ? "PURGING DATABASE CLUSTER..." : "[ TERMINATE FILE PERMANENTLY ]"}
              </button>
            </Depth>
          </motion.div>
        )}
      </AnimatePresence>
    </TiltCard>
  );
}

function BackHome() {
  return (
    <Link href="/" id="back-home" className="cyber-btn mt-3" onClick={() => playClick()}>
      <ArrowLeft className="h-4 w-4" /> RETURN TO UPLINK CONSOLE
    </Link>
  );
}
