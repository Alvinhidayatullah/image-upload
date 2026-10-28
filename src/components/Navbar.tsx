"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import { X, Zap } from "lucide-react";
import { copyText } from "./CopyRow";
import { cn } from "@/lib/utils";
import { playClick } from "@/lib/sound";

export function openDialog(id: string) {
  playClick();
  const el = document.getElementById(id);
  if (el instanceof HTMLDialogElement) el.showModal();
}

function InfoDialog({
  id,
  title,
  accent = "cyan",
  children,
}: {
  id: string;
  title: string;
  accent?: "cyan" | "magenta" | "yellow";
  children: ReactNode;
}) {
  const borderCol =
    accent === "magenta"
      ? "border-cyber-magenta"
      : accent === "yellow"
        ? "border-cyber-yellow"
        : "border-cyber-cyan";

  const textCol =
    accent === "magenta"
      ? "neon-text-magenta"
      : accent === "yellow"
        ? "neon-text-yellow"
        : "neon-text-cyan";

  return (
    <dialog
      id={id}
      className="cyber-dialog w-[calc(100%-2rem)] max-w-lg"
      aria-labelledby={`${id}-title`}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          playClick();
          e.currentTarget.close();
        }
      }}
    >
      <div className={cn("cyber-cut relative border-l-4 bg-[#0a0e17] p-6 shadow-2xl border", borderCol)}>
        <div className="mb-4 flex items-center justify-between border-b border-white/10 pb-3">
          <h2 id={`${id}-title`} className={cn("font-display text-sm font-bold uppercase tracking-wider", textCol)}>
            {title}
          </h2>
          <form method="dialog">
            <button
              id={`${id}-close`}
              aria-label="Tutup dialog"
              onClick={() => playClick()}
              className="cyber-cut-sm border border-white/10 p-1 text-slate-400 transition-colors hover:border-cyber-magenta hover:text-cyber-magenta"
            >
              <X className="h-4 w-4" />
            </button>
          </form>
        </div>
        <div className="space-y-3 text-xs leading-relaxed text-slate-300">{children}</div>
      </div>
    </dialog>
  );
}

function ReportAbuseForm() {
  const [link, setLink] = useState("");
  const [reason, setReason] = useState("");
  const [copied, setCopied] = useState(false);
  const report = `[LAPORAN PENYALAHGUNAAN CYBERIMG]\nLink Gambar: ${link || "N/A"}\nAlasan: ${reason || "N/A"}\nWaktu: ${new Date().toISOString()}`;

  return (
    <div className="space-y-3">
      <div>
        <label htmlFor="report-link" className="hud-label mb-1.5 block text-slate-400">
          Link Gambar (contoh: .../i/p_xxxx.jpg)
        </label>
        <input
          id="report-link"
          className="cyber-input text-xs"
          placeholder="https://.../i/p_3953los8e1.jpg"
          value={link}
          onChange={(e) => setLink(e.target.value)}
        />
      </div>
      <div>
        <label htmlFor="report-reason" className="hud-label mb-1.5 block text-slate-400">
          Keterangan Pelanggaran
        </label>
        <textarea
          id="report-reason"
          className="cyber-input min-h-[80px] resize-y text-xs"
          placeholder="Jelaskan alasan laporan (hak cipta, konten ilegal, malware, dll)..."
          value={reason}
          onChange={(e) => setReason(e.target.value)}
        />
      </div>
      <button
        id="report-copy"
        type="button"
        disabled={!link.trim() || !reason.trim()}
        onClick={async () => {
          playClick();
          if (await copyText(report)) {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
          }
        }}
        className="cyber-btn-danger w-full py-3"
      >
        {copied ? "LAPORAN BERHASIL DISALIN!" : "[ SALIN LAPORAN ]"}
      </button>
    </div>
  );
}


/**
 * Clean & Minimal Navigation Header
 */
export default function Navbar() {
  return (
    <>
      <header className="sticky top-0 z-30 border-b border-cyber-border bg-[#05070B]/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3.5 sm:px-6">
          {/* Brand Logo */}
          <Link
            href="/"
            id="nav-logo"
            className="group flex items-center gap-2.5"
            aria-label="image upload — Beranda"
            onClick={() => playClick()}
          >
            <div className="relative flex h-8 w-8 items-center justify-center rounded-lg border border-cyber-cyan/50 bg-cyber-cyan/10">
              <Zap className="h-4 w-4 text-cyber-cyan transition-transform group-hover:scale-110" />
            </div>
            <div>
              <span className="font-display text-lg font-black uppercase tracking-wider text-white">
                image <span className="text-cyber-cyan">upload</span>
              </span>
            </div>
          </Link>
        </div>
      </header>

      {/* Format File Modal */}
      <InfoDialog id="dialog-supported" title="Format Gambar yang Didukung">
        <p className="text-slate-300">
          Layanan ini menerima berbagai format gambar populer tanpa penurunan kualitas:
        </p>
        <div className="grid grid-cols-2 gap-2 my-2 font-mono text-xs">
          {[
            { codec: "WEBP", max: "Maks 5MB", desc: "Ringan & kompresi optimal" },
            { codec: "PNG", max: "Maks 5MB", desc: "Transparansi lossless" },
            { codec: "JPG / JPEG", max: "Maks 5MB", desc: "Standar fotografi umum" },
            { codec: "GIF", max: "Maks 5MB", desc: "Gambar animasi bergerak" },
            { codec: "SVG", max: "Maks 5MB", desc: "Format vektor tajam" },
          ].map((item) => (
            <div key={item.codec} className="border border-cyber-border bg-[#05070B] p-2.5">
              <div className="flex items-center justify-between">
                <span className="font-bold text-cyber-cyan">{item.codec}</span>
                <span className="text-[10px] text-cyber-yellow">{item.max}</span>
              </div>
              <p className="mt-1 text-[11px] text-slate-400">{item.desc}</p>
            </div>
          ))}
        </div>
        <p className="text-[11px] text-slate-400">
          ✓ Informasi EXIF pribadi (lokasi GPS, tipe kamera) otomatis dibersihkan demi menjaga privasi Anda.
        </p>
      </InfoDialog>

      {/* Aturan Layanan Modal */}
      <InfoDialog id="dialog-terms" title="Aturan Layanan (Terms of Service)" accent="yellow">
        <ol className="space-y-2 list-decimal list-inside text-xs text-slate-300">
          <li>Dilarang mengunggah konten ilegal, pornografi, kekerasan ekstrem, atau malware.</li>
          <li>Dilarang mengunggah karya yang melanggar hak cipta pihak lain.</li>
          <li>Simpan <strong>Deletion Link</strong> Anda dengan aman untuk menghapus gambar di kemudian hari.</li>
          <li>File yang melanggar ketentuan hukum dapat dihapus tanpa pemberitahuan sebelumnya.</li>
        </ol>
      </InfoDialog>

      {/* Tombol Cepat Modal */}
      <InfoDialog id="dialog-shortcuts" title="Tombol Cepat Keyboard">
        <div className="space-y-2 font-mono text-xs">
          {[
            { key: "Ctrl + V", action: "Tempel gambar langsung dari clipboard" },
            { key: "ESC", action: "Batalkan gambar yang dipilih / tutup dialog" },
          ].map((s) => (
            <div key={s.key} className="flex items-center justify-between border-b border-white/5 py-2">
              <span className="rounded bg-black/60 border border-cyber-border px-2 py-1 text-cyber-cyan">
                {s.key}
              </span>
              <span className="text-slate-300">{s.action}</span>
            </div>
          ))}
        </div>
      </InfoDialog>

      {/* Lapor Pelanggaran Modal */}
      <InfoDialog id="dialog-report" title="Lapor Pelanggaran Konten" accent="magenta">
        <p className="text-slate-400">
          Temukan konten ilegal atau pelanggaran hak cipta? Tempel URL dan alasan untuk disalin ke tim pengelola.
        </p>
        <ReportAbuseForm />
      </InfoDialog>
    </>
  );
}
