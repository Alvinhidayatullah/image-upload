"use client";

import { useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, CheckCircle2, FileX, Trash2, TriangleAlert } from "lucide-react";
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
      if (!res.ok) throw new Error(data?.error ?? `Gagal menghapus gambar (HTTP ${res.status}).`);
      removeFromVault((v) => v.deleteToken === token);
      playSuccess();
      setState("terminated");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Penghapusan dibatalkan karena kesalahan jaringan.");
      setState("confirm");
    }
  }

  if (!record) {
    return (
      <TiltCard accent="magenta">
        <Depth z={30} className="flex flex-col items-center gap-4 py-8 text-center font-mono">
          <div className="flex h-16 w-16 items-center justify-center rounded-xl border border-cyber-magenta/40 bg-cyber-magenta/10">
            <FileX className="h-8 w-8 text-cyber-magenta" />
          </div>
          <h1 className="font-display text-xl font-bold uppercase tracking-wide text-white">
            Gambar Tidak Ditemukan
          </h1>
          <p className="max-w-md text-xs text-slate-400">
            Token hapus tidak valid atau gambar telah dihapus sebelumnya dari database.
          </p>
          <BackHome />
        </Depth>
      </TiltCard>
    );
  }

  const direct = `/i/${record.id}.${record.ext}`;

  return (
    <TiltCard accent="magenta">
      <AnimatePresence mode="wait">
        {state === "terminated" ? (
          <motion.div
            key="done"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center gap-4 py-8 text-center font-mono"
          >
            <Depth z={40}>
              <div className="flex h-16 w-16 items-center justify-center rounded-xl border border-cyber-emerald/40 bg-cyber-emerald/10">
                <CheckCircle2 className="h-9 w-9 text-cyber-emerald" />
              </div>
            </Depth>
            <h1 className="font-display text-2xl font-bold uppercase tracking-wide text-cyber-emerald">
              Gambar Berhasil Dihapus
            </h1>
            <p className="max-w-md text-xs text-slate-300">
              File <strong className="text-white">{record.filename}</strong> dan data binary telah dihapus secara permanen dari server.
            </p>
            <BackHome />
          </motion.div>
        ) : (
          <motion.div key="confirm" exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
            <Depth z={20} className="mb-6 border-b border-white/10 pb-4">
              <div className="flex items-center gap-2">
                <TriangleAlert className="h-4 w-4 text-cyber-magenta" />
                <span className="font-mono text-xs font-bold uppercase tracking-wider text-cyber-magenta">
                  Konfirmasi Penghapusan
                </span>
              </div>
              <h1 className="font-display text-xl font-bold uppercase tracking-wide text-white sm:text-2xl mt-1">
                Hapus Gambar Permanen
              </h1>
              <p className="text-xs text-slate-400 mt-1">
                Tindakan ini tidak dapat dibatalkan. Gambar akan terhapus dari server dan semua link yang dibagikan tidak akan dapat diakses lagi.
              </p>
            </Depth>

            {/* Visual Preview */}
            <Depth z={45} className="mb-6 flex justify-center">
              <div className="transparency-checkerboard rounded-xl border-2 border-cyber-magenta/50 p-2 shadow-[0_0_25px_rgba(255,0,60,0.2)]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={direct}
                  alt={record.filename}
                  className={`max-h-64 w-auto max-w-full object-contain ${
                    state === "terminating" ? "animate-pulse opacity-50" : ""
                  }`}
                />
              </div>
            </Depth>

            {/* Metadata Deck */}
            <Depth z={30} className="mb-6 space-y-2 rounded-xl border border-white/10 bg-[#060910] p-4 font-mono text-xs">
              <div className="flex justify-between border-b border-white/5 pb-2">
                <span className="text-slate-400">Nama File:</span>
                <span className="text-white font-bold truncate max-w-xs">{record.filename}</span>
              </div>
              <div className="flex justify-between border-b border-white/5 pb-2">
                <span className="text-slate-400">Ukuran:</span>
                <span className="text-cyber-cyan">{formatBytes(record.sizeBytes)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Format:</span>
                <span className="uppercase text-cyber-yellow">{record.ext}</span>
              </div>
            </Depth>

            {error && (
              <div className="mb-4 rounded-lg border border-cyber-magenta bg-cyber-magenta/10 p-3 text-xs text-cyber-magenta font-mono">
                {error}
              </div>
            )}

            {/* Actions */}
            <Depth z={35} className="flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                id="btn-confirm-delete"
                disabled={state === "terminating"}
                onClick={terminate}
                className="cyber-btn-danger flex-1 py-3 text-xs tracking-wider"
              >
                <Trash2 className="h-4 w-4" />
                <span>{state === "terminating" ? "MENGHAPUS GAMBAR..." : "HAPUS GAMBAR SEKARANG"}</span>
              </button>
              <Link
                href="/"
                className="cyber-btn-ghost py-3 text-xs text-center sm:px-6"
                onClick={() => playClick()}
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Batal</span>
              </Link>
            </Depth>
          </motion.div>
        )}
      </AnimatePresence>
    </TiltCard>
  );
}

function BackHome() {
  return (
    <Link
      href="/"
      onClick={() => playClick()}
      className="cyber-btn-cyan mt-4 inline-flex items-center gap-2 px-5 py-2.5 text-xs font-mono font-bold"
    >
      <ArrowLeft className="h-4 w-4" />
      <span>Kembali ke Halaman Utama</span>
    </Link>
  );
}
