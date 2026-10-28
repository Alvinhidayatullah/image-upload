"use client";

import { useEffect, useRef, useState, type DragEvent } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertTriangle,
  Clipboard,
  CloudUpload,
  Globe,
  HardDrive,
  Link2,
  RefreshCw,
  Upload,
  X,
} from "lucide-react";
import TiltCard, { Depth } from "./TiltCard";
import { openDialog } from "./Navbar";
import { ALLOWED_MIME, MAX_SIZE_BYTES, cn, formatBytes, type UploadResult } from "@/lib/utils";
import { playBlip, playClick, playCopyChirp, playSuccess, playTransmissionSweep } from "@/lib/sound";

type Tab = "device" | "url";
type Phase = "idle" | "transmitting" | "processing";

type FileMeta = {
  file: File;
  previewUrl: string;
  width?: number;
  height?: number;
};

function uploadFile(file: File, onProgress: (p: number) => void): Promise<UploadResult> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", "/api/upload");
    xhr.upload.onprogress = (e) => e.lengthComputable && onProgress(e.loaded / e.total);
    xhr.onload = () => {
      let data: (UploadResult & { error?: string }) | null = null;
      try {
        data = JSON.parse(xhr.responseText);
      } catch {
        /* response not JSON */
      }
      if (xhr.status >= 200 && xhr.status < 300 && data) resolve(data);
      else reject(new Error(data?.error ?? `Unggah gagal (HTTP ${xhr.status}).`));
    };
    xhr.onerror = () => reject(new Error("Koneksi jaringan terputus."));
    const fd = new FormData();
    fd.append("file", file);
    xhr.send(fd);
  });
}

async function uploadRemote(imageUrl: string): Promise<UploadResult> {
  const res = await fetch("/api/upload", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ imageUrl }),
  });
  const data = await res.json().catch(() => null);
  if (!res.ok || !data) throw new Error(data?.error ?? `Unggah gagal (HTTP ${res.status}).`);
  return data;
}

/**
 * User-Friendly Cyberpunk Upload Card
 */
export default function UploadCard({ onUploaded }: { onUploaded: (r: UploadResult) => void }) {
  const [tab, setTab] = useState<Tab>("device");
  const [meta, setMeta] = useState<FileMeta | null>(null);
  const [url, setUrl] = useState("");
  const [agreed, setAgreed] = useState(true);
  const [phase, setPhase] = useState<Phase>("idle");
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const busy = phase !== "idle";
  const hasPayload = tab === "device" ? !!meta : url.trim().length > 0;
  const canUpload = agreed && hasPayload && !busy;

  function inspectAndSetFile(f: File | undefined | null) {
    setError(null);
    if (!f) return;

    if (!ALLOWED_MIME[f.type]) {
      setMeta(null);
      setError("Format file tidak didukung. Gunakan JPG, PNG, WEBP, GIF, atau SVG.");
      return;
    }
    if (f.size > MAX_SIZE_BYTES) {
      setMeta(null);
      setError(`Ukuran file (${formatBytes(f.size)}) melebihi batas maksimal 5MB.`);
      return;
    }

    const previewUrl = URL.createObjectURL(f);
    const newMeta: FileMeta = { file: f, previewUrl };

    const img = new Image();
    img.onload = () => {
      setMeta({
        ...newMeta,
        width: img.naturalWidth,
        height: img.naturalHeight,
      });
      playCopyChirp();
    };
    img.onerror = () => {
      setMeta(newMeta);
      playCopyChirp();
    };
    img.src = previewUrl;
  }

  useEffect(() => {
    return () => {
      if (meta?.previewUrl) URL.revokeObjectURL(meta.previewUrl);
    };
  }, [meta]);

  // Global Paste (Ctrl+V) listener
  useEffect(() => {
    function handlePaste(e: ClipboardEvent) {
      if (busy) return;
      const activeEl = document.activeElement;
      if (activeEl?.tagName === "INPUT" || activeEl?.tagName === "TEXTAREA") return;

      const items = e.clipboardData?.items;
      if (!items) return;

      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        if (item.type.startsWith("image/")) {
          const pastedFile = item.getAsFile();
          if (pastedFile) {
            e.preventDefault();
            setTab("device");
            inspectAndSetFile(pastedFile);
            break;
          }
        }
      }
    }

    function handleKeyDown(e: KeyboardEvent) {
      if (busy) return;
      if (e.key === "Escape" && meta) {
        setMeta(null);
        if (inputRef.current) inputRef.current.value = "";
        playClick();
      }
    }

    window.addEventListener("paste", handlePaste);
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("paste", handlePaste);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [busy, meta]);

  function onDrop(e: DragEvent) {
    e.preventDefault();
    setDragging(false);
    if (busy) return;
    inspectAndSetFile(e.dataTransfer.files?.[0]);
  }

  async function handlePasteFromClipboard() {
    playClick();
    try {
      if (navigator.clipboard && navigator.clipboard.read) {
        const items = await navigator.clipboard.read();
        for (const item of items) {
          const imageType = item.types.find((t) => t.startsWith("image/"));
          if (imageType) {
            const blob = await item.getType(imageType);
            const file = new File([blob], `clipboard_${Date.now()}.${ALLOWED_MIME[imageType] || "png"}`, {
              type: imageType,
            });
            inspectAndSetFile(file);
            return;
          }
        }
      }
      setError("Tidak ada data gambar di clipboard. Salin gambar lalu tekan Ctrl+V.");
    } catch {
      setError("Akses clipboard ditolak browser. Silakan tekan Ctrl+V langsung.");
    }
  }

  async function handleUpload() {
    if (!canUpload) return;
    setError(null);
    setProgress(0);
    playTransmissionSweep();

    try {
      let result: UploadResult;
      if (tab === "device" && meta) {
        setPhase("transmitting");
        result = await uploadFile(meta.file, (p) => {
          setProgress(p);
          if (p >= 1) setPhase("processing");
        });
      } else {
        setPhase("processing");
        result = await uploadRemote(url.trim());
      }
      playSuccess();
      onUploaded(result);
      setMeta(null);
      setUrl("");
      if (inputRef.current) inputRef.current.value = "";
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal mengunggah gambar.");
    } finally {
      setPhase("idle");
      setProgress(0);
    }
  }

  return (
    <TiltCard id="upload-card" accent="cyan">
      {/* Card Header */}
      <Depth z={25} className="mb-5 flex items-center justify-between gap-3 border-b border-white/10 pb-4">
        <div>
          <h2 className="font-display text-xl font-bold uppercase tracking-wide text-white sm:text-2xl">
            Unggah Gambar
          </h2>
          <p className="mt-1 text-xs text-slate-400">
            Dapatkan tautan langsung, BBCode, Markdown, dan QR Code secara instan.
          </p>
        </div>
        <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-mono uppercase tracking-wider text-cyber-cyan border border-cyber-cyan/30 bg-cyber-cyan/5">
          <span className="h-1.5 w-1.5 rounded-full bg-cyber-cyan animate-pulse" />
          Maks 5 MB
        </span>
      </Depth>

      {/* Tabs Switcher */}
      <Depth z={25} className="mb-5">
        <div role="tablist" aria-label="Metode unggah" className="grid grid-cols-2 gap-2">
          {(
            [
              { key: "device", label: "Upload dari Perangkat", icon: HardDrive },
              { key: "url", label: "Tarik dari URL", icon: Globe },
            ] as const
          ).map(({ key, label, icon: Icon }) => {
            const active = tab === key;
            return (
              <button
                key={key}
                id={`tab-${key}`}
                role="tab"
                type="button"
                aria-selected={active}
                disabled={busy}
                onClick={() => {
                  playClick();
                  setTab(key);
                  setError(null);
                }}
                onMouseEnter={() => playBlip()}
                className={cn(
                  "relative flex items-center justify-center gap-2 rounded-lg border px-4 py-3 font-mono text-xs font-bold uppercase tracking-wider transition-all",
                  active
                    ? "border-cyber-cyan bg-cyber-cyan/15 text-cyber-cyan shadow-[0_0_15px_rgba(0,240,255,0.2)]"
                    : "border-white/10 bg-[#060910] text-slate-400 hover:border-cyber-cyan/40 hover:text-white",
                )}
              >
                <Icon className="h-4 w-4" />
                <span>{label}</span>
                {active && (
                  <motion.span
                    layoutId="tab-indicator-bar"
                    className="absolute inset-x-0 -bottom-px h-[2px] bg-cyber-cyan shadow-neon-cyan"
                  />
                )}
              </button>
            );
          })}
        </div>
      </Depth>

      {/* Main Tab Panels */}
      <Depth z={35}>
        <AnimatePresence mode="wait" initial={false}>
          {tab === "device" ? (
            <motion.div
              key="panel-device"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.15 }}
              className="space-y-4"
            >
              {/* Dropzone */}
              {!meta ? (
                <div
                  id="dropzone"
                  onDragOver={(e) => {
                    e.preventDefault();
                    if (!busy) setDragging(true);
                  }}
                  onDragLeave={() => setDragging(false)}
                  onDrop={onDrop}
                  onClick={() => !busy && inputRef.current?.click()}
                  onKeyDown={(e) => {
                    if ((e.key === "Enter" || e.key === " ") && !busy) {
                      e.preventDefault();
                      inputRef.current?.click();
                    }
                  }}
                  role="button"
                  tabIndex={0}
                  aria-label="Area drag and drop gambar. Klik untuk memilih file."
                  className={cn(
                    "group relative flex cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border border-cyber-cyan/35 px-4 py-12 text-center transition-all duration-200",
                    dragging
                      ? "border-cyber-cyan bg-cyber-cyan/[0.1] shadow-neon-cyan scale-[1.01]"
                      : "bg-[#060a12]/80 hover:border-cyber-cyan/70 hover:bg-cyber-cyan/[0.04] shadow-[inset_0_0_20px_rgba(0,240,255,0.02)]",
                  )}
                >
                  <motion.div
                    animate={dragging ? { scale: 1.15, y: -4 } : { scale: 1, y: [0, -4, 0] }}
                    transition={dragging ? { duration: 0.2 } : { duration: 2.6, repeat: Infinity, ease: "easeInOut" }}
                  >
                    <CloudUpload
                      className={cn("h-12 w-12", dragging ? "text-cyber-yellow" : "text-cyber-cyan")}
                      strokeWidth={1.5}
                    />
                  </motion.div>

                  <div>
                    <p className="font-display text-sm font-bold uppercase tracking-wider text-white">
                      {dragging ? "Lepaskan untuk Memilih Gambar" : "Tarik & Lepas Gambar ke Sini"}
                    </p>
                    <p className="mt-1 text-xs text-slate-400">
                      atau klik untuk memilih file dari perangkat Anda
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
                    <span className="cyber-btn-cyan pointer-events-none px-5 py-2 text-xs">
                      [ PILIH GAMBAR ]
                    </span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePasteFromClipboard();
                      }}
                      className="cyber-btn-ghost px-4 py-2 text-xs"
                      title="Atau tekan Ctrl+V"
                    >
                      <Clipboard className="h-3.5 w-3.5" />
                      <span>PASTE DARI CLIPBOARD (Ctrl+V)</span>
                    </button>
                  </div>

                  <p className="text-[11px] font-mono text-slate-500 pt-1">
                    Mendukung JPG, PNG, WEBP, GIF, SVG (Maksimal 5MB)
                  </p>

                  <input
                    ref={inputRef}
                    id="file-input"
                    type="file"
                    accept={Object.keys(ALLOWED_MIME).join(",")}
                    className="sr-only"
                    tabIndex={-1}
                    onChange={(e) => inspectAndSetFile(e.target.files?.[0])}
                  />
                </div>
              ) : (
                /* Selected File Preview Box */
                <motion.div
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="rounded-xl border border-cyber-cyan/50 bg-[#080d18] p-4 shadow-neon-cyan"
                >
                  <div className="flex flex-col sm:flex-row gap-4 items-center">
                    <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-lg border border-cyber-cyan/40 bg-black/70 flex items-center justify-center">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={meta.previewUrl}
                        alt="Preview gambar"
                        className="h-full w-full object-contain"
                      />
                    </div>

                    <div className="min-w-0 flex-1 space-y-2 text-xs w-full">
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-cyber-yellow">
                          File Siap Diunggah
                        </span>
                        <button
                          type="button"
                          id="clear-staged-file"
                          onClick={() => {
                            playClick();
                            setMeta(null);
                            if (inputRef.current) inputRef.current.value = "";
                          }}
                          className="text-slate-400 hover:text-cyber-magenta transition-colors flex items-center gap-1 text-[11px]"
                          title="Batalkan pilihan file"
                        >
                          <X className="h-4 w-4" />
                          <span>[Ganti]</span>
                        </button>
                      </div>

                      <p className="truncate font-bold text-white text-sm" title={meta.file.name}>
                        {meta.file.name}
                      </p>

                      <div className="flex flex-wrap items-center gap-3 font-mono text-[11px] text-slate-400">
                        <span>Ukuran: <strong className="text-cyber-cyan">{formatBytes(meta.file.size)}</strong></span>
                        {meta.width && (
                          <span>Resolusi: <strong className="text-slate-200">{meta.width} × {meta.height} px</strong></span>
                        )}
                        <span className="uppercase text-slate-400">Format: {meta.file.type.split("/")[1] || "IMAGE"}</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="panel-url"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.15 }}
              className="space-y-3 font-mono"
            >
              <label htmlFor="remote-url" className="hud-label flex items-center gap-2 text-slate-300">
                <Link2 className="h-4 w-4 text-cyber-cyan" /> Masukkan URL Gambar
              </label>

              <div className="relative">
                <input
                  id="remote-url"
                  type="url"
                  inputMode="url"
                  autoComplete="off"
                  spellCheck={false}
                  placeholder="https://example.com/gambar.jpg"
                  value={url}
                  disabled={busy}
                  onChange={(e) => {
                    setUrl(e.target.value);
                    setError(null);
                  }}
                  onKeyDown={(e) => e.key === "Enter" && handleUpload()}
                  className="cyber-input pr-10 text-xs sm:text-sm"
                />
                {url && (
                  <button
                    type="button"
                    onClick={() => {
                      playClick();
                      setUrl("");
                    }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>

              <p className="text-[11px] text-slate-400">
                Sistem akan mengunduh gambar dari tautan tersebut dan menyimpannya ke server (maksimal 5MB).
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </Depth>

      {/* Error Alert */}
      <AnimatePresence>
        {error && (
          <motion.div
            id="upload-error"
            role="alert"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="cyber-cut-sm mt-4 flex items-center gap-2.5 border border-cyber-magenta/60 bg-cyber-magenta/10 px-3.5 py-2.5 text-xs text-cyber-magenta">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Terms Agreement Checkbox */}
      <Depth z={25} className="mt-5 border-t border-white/5 pt-4">
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
          <label htmlFor="terms-checkbox" className="group flex cursor-pointer items-center gap-2.5 select-none">
            <input
              id="terms-checkbox"
              type="checkbox"
              checked={agreed}
              onChange={(e) => {
                playClick();
                setAgreed(e.target.checked);
              }}
              className="h-4 w-4 cursor-pointer accent-cyber-yellow rounded-none bg-black border border-cyber-cyan/60"
            />
            <span className="text-slate-300 group-hover:text-cyber-cyan transition-colors">
              Saya menyetujui Aturan Layanan (Terms of Service)
            </span>
          </label>
          <button
            type="button"
            id="open-terms"
            onClick={() => openDialog("dialog-terms")}
            className="text-slate-400 hover:text-cyber-cyan transition-colors underline decoration-dotted text-xs"
          >
            [Lihat Aturan]
          </button>
        </div>
      </Depth>

      {/* Action Upload Button */}
      <Depth z={40} className="mt-5">
        <button
          id="upload-button"
          type="button"
          disabled={!canUpload}
          onClick={handleUpload}
          className={cn(
            "cyber-btn w-full py-4 text-sm tracking-[0.18em]",
            busy && "!cursor-wait !bg-cyber-yellow/90 !text-cyber-void",
          )}
        >
          {busy ? (
            <span className="flex items-center gap-2">
              <RefreshCw className="h-4 w-4 animate-spin" />
              {phase === "transmitting"
                ? `MENGUNGGAH GAMBAR... ${Math.round(progress * 100)}%`
                : "MENYIMPAN KE SERVER..."}
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <Upload className="h-4 w-4" />
              <span>[ UNGGAH GAMBAR SEKARANG ]</span>
            </span>
          )}
        </button>

        {/* Progress Bar */}
        <div className="relative mt-2 h-1 overflow-hidden bg-white/5" aria-hidden={!busy}>
          <AnimatePresence>
            {busy && (
              <>
                <motion.div
                  className="absolute inset-y-0 left-0 bg-gradient-to-r from-cyber-cyan via-cyber-yellow to-cyber-magenta"
                  initial={{ width: 0 }}
                  animate={{ width: phase === "transmitting" ? `${Math.max(progress * 100, 5)}%` : "100%" }}
                  exit={{ opacity: 0 }}
                  transition={{ ease: "easeOut" }}
                />
                <motion.div
                  className="absolute inset-y-0 w-1/4 bg-white/90 shadow-[0_0_12px_#ffffff]"
                  initial={{ x: "-100%" }}
                  animate={{ x: "400%" }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.9, repeat: Infinity, ease: "linear" }}
                />
              </>
            )}
          </AnimatePresence>
        </div>

        {!agreed && (
          <p className="mt-2 text-center text-xs text-cyber-magenta">
            Centang persetujuan aturan layanan untuk mengaktifkan tombol upload.
          </p>
        )}
      </Depth>
    </TiltCard>
  );
}
