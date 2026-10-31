"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import { ShieldAlert, X, Zap } from "lucide-react";
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
  const report = `[LAPORAN PENYALAHGUNAAN KONTEN]\nLink Gambar: ${link || "N/A"}\nAlasan: ${reason || "N/A"}\nWaktu: ${new Date().toISOString()}`;

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
          placeholder="Jelaskan alasan laporan (hak cipta, konten terlarang, malware, privasi)..."
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
        className="cyber-btn-danger w-full py-2.5 text-xs font-mono font-bold"
      >
        {copied ? "LAPORAN BERHASIL DISALIN!" : "Salin Format Laporan"}
      </button>
    </div>
  );
}

/**
 * Clean & Minimal Navigation Header (PRD §5.A.1)
 */
export default function Navbar() {
  return (
    <>
      <header className="sticky top-0 z-30 border-b border-cyber-border bg-[#05070B]/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
          {/* Brand Logo */}
          <Link
            href="/"
            id="nav-logo"
            className="group flex items-center gap-2.5"
            aria-label="Vinz Upload — Beranda"
            onClick={() => playClick()}
          >
            <div className="relative flex h-8 w-8 items-center justify-center rounded-lg border border-cyber-cyan/50 bg-cyber-cyan/10">
              <Zap className="h-4 w-4 text-cyber-cyan transition-transform group-hover:scale-110" />
            </div>
            <div>
              <span className="font-display text-lg font-black uppercase tracking-wider text-white">
                vinz <span className="text-cyber-cyan">upload</span>
              </span>
            </div>
          </Link>

          {/* Minimalist Nav Links (PRD §5.A.1) */}
          <nav aria-label="Menu Informasi" className="flex items-center gap-2 sm:gap-4 font-mono text-xs">
            <button
              type="button"
              id="nav-format"
              onClick={() => openDialog("dialog-supported")}
              className="text-slate-400 hover:text-cyber-cyan transition-colors px-2 py-1"
            >
              Format
            </button>
            <button
              type="button"
              id="nav-terms"
              onClick={() => openDialog("dialog-terms")}
              className="text-slate-400 hover:text-cyber-yellow transition-colors px-2 py-1"
            >
              Ketentuan
            </button>
            <button
              type="button"
              id="nav-report"
              onClick={() => openDialog("dialog-report")}
              className="text-slate-400 hover:text-cyber-magenta transition-colors px-2 py-1 flex items-center gap-1"
            >
              <ShieldAlert className="h-3.5 w-3.5" /> Lapor
            </button>
          </nav>
        </div>
      </header>

      {/* Format File Modal */}
      <InfoDialog id="dialog-supported" title="Format Gambar yang Didukung">
        <p className="text-slate-300">
          Layanan ini menerima berbagai format gambar populer tanpa penurunan kualitas:
        </p>
        <div className="grid grid-cols-2 gap-2 my-2 font-mono text-xs">
          {[
            { codec: "PNG", max: "Maks 5MB", desc: "Transparansi lossless murni" },
            { codec: "JPG / JPEG", max: "Maks 5MB", desc: "Standar fotografi umum" },
            { codec: "WEBP", max: "Maks 5MB", desc: "Ringan & kompresi efisien" },
            { codec: "GIF", max: "Maks 5MB", desc: "Animasi bergerak" },
            { codec: "SVG", max: "Maks 5MB", desc: "Vektor tajam aman" },
          ].map((item) => (
            <div key={item.codec} className="border border-cyber-border bg-[#05070B] p-2.5 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="font-bold text-cyber-cyan">{item.codec}</span>
                <span className="text-[10px] text-cyber-yellow">{item.max}</span>
              </div>
              <p className="mt-1 text-[11px] text-slate-400">{item.desc}</p>
            </div>
          ))}
        </div>
        <p className="text-[11px] text-slate-400">
          ✓ Privasi terlindungi: Informasi EXIF pribadi (lokasi GPS, tipe kamera) otomatis dibersihkan saat diunggah.
        </p>
      </InfoDialog>

      {/* Aturan Layanan Modal */}
      <InfoDialog id="dialog-terms" title="Ketentuan Layanan" accent="yellow">
        <ol className="space-y-2 list-decimal list-inside text-xs text-slate-300">
          <li>Dilarang mengunggah konten ilegal, pornografi, kekerasan, atau file berbahaya (malware).</li>
          <li>Dilarang mengunggah materi yang melanggar hak cipta milik pihak lain.</li>
          <li>Simpan <strong>Deletion Link</strong> Anda untuk menghapus gambar kapan saja bila sudah tidak diperlukan.</li>
          <li>File yang terbukti melanggar ketentuan hukum atau dilaporkan dapat dihapus demi keamanan bersama.</li>
        </ol>
      </InfoDialog>

      {/* Lapor Pelanggaran Modal */}
      <InfoDialog id="dialog-report" title="Lapor Pelanggaran Konten" accent="magenta">
        <p className="text-slate-400">
          Menemukan konten yang melanggar ketentuan atau hak cipta? Masukkan tautan gambar dan keterangan di bawah untuk menyalin draf laporan.
        </p>
        <ReportAbuseForm />
      </InfoDialog>
    </>
  );
}
