"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Archive,
  Check,
  Clock,
  Copy,
  Eye,
  Grid,
  List,
  Search,
  Trash2,
  X,
} from "lucide-react";
import { CopyButton, copyText } from "./CopyRow";
import { buildLinks, formatBytes, getClientOrigin, type UploadResult } from "@/lib/utils";
import { playClick, playCopyChirp } from "@/lib/sound";

/**
 * User-Friendly Local Vault (Riwayat Unggahan)
 */
export default function LocalVault({
  items,
  onSelect,
  onForget,
  onClear,
}: {
  items: UploadResult[];
  onSelect: (item: UploadResult) => void;
  onForget: (id: string) => void;
  onClear: () => void;
}) {
  const origin = getClientOrigin();
  const [search, setSearch] = useState("");
  const [filterCodec, setFilterCodec] = useState<string>("ALL");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [copiedBatch, setCopiedBatch] = useState(false);

  const codecs = useMemo(() => {
    const set = new Set<string>();
    items.forEach((item) => set.add(item.ext.toUpperCase()));
    return ["ALL", ...Array.from(set)];
  }, [items]);

  const filtered = useMemo(() => {
    return items.filter((item) => {
      const matchSearch =
        item.filename.toLowerCase().includes(search.toLowerCase()) ||
        item.id.toLowerCase().includes(search.toLowerCase());
      const matchCodec = filterCodec === "ALL" || item.ext.toUpperCase() === filterCodec;
      return matchSearch && matchCodec;
    });
  }, [items, search, filterCodec]);

  async function handleCopyAllLinks() {
    playCopyChirp();
    const allLinks = filtered.map((item) => `${origin}/i/${item.id}.${item.ext}`).join("\n");
    if (await copyText(allLinks)) {
      setCopiedBatch(true);
      setTimeout(() => setCopiedBatch(false), 2000);
    }
  }

  return (
    <section id="local-vault" aria-labelledby="vault-title" className="mt-12">
      {/* Archive Header */}
      <div className="mb-5 flex flex-wrap items-end justify-between gap-4 border-b border-white/10 pb-4">
        <div>
          <h2
            id="vault-title"
            className="flex items-center gap-2 font-display text-xl font-bold uppercase tracking-wide text-white sm:text-2xl"
          >
            <Archive className="h-5 w-5 text-cyber-cyan" />
            <span>Riwayat Unggahan</span>
            <span className="font-mono text-xs font-normal text-slate-400">({items.length} gambar)</span>
          </h2>
          <p className="mt-1 text-xs text-slate-400">
            Tersimpan di browser ini — tetap ada meskipun halaman di-refresh.
          </p>
        </div>

        {items.length > 0 && (
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              id="vault-copy-all"
              onClick={handleCopyAllLinks}
              className="cyber-btn-ghost text-xs"
              title="Salin semua direct link gambar"
            >
              {copiedBatch ? <Check className="h-3.5 w-3.5 text-cyber-emerald" /> : <Copy className="h-3.5 w-3.5" />}
              <span>{copiedBatch ? "SEMUA LINK DISALIN!" : "SALIN SEMUA LINK"}</span>
            </button>
            <button
              id="vault-clear"
              type="button"
              onClick={() => {
                playClick();
                if (confirm("Hapus semua riwayat dari browser ini? (Gambar di server tidak ikut terhapus).")) {
                  onClear();
                }
              }}
              className="cyber-btn-ghost border-cyber-magenta/40 text-cyber-magenta hover:!bg-cyber-magenta hover:!text-white text-xs"
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span>BERSIHKAN RIWAYAT</span>
            </button>
          </div>
        )}
      </div>

      {/* Search & Codec Filter Bar */}
      {items.length > 0 && (
        <div className="mb-5 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 font-mono text-xs">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500" />
            <input
              type="text"
              id="vault-search-input"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari berdasarkan nama file..."
              className="cyber-input pl-9 py-2 text-xs"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 border border-cyber-border bg-[#05070B] p-1">
              {codecs.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => {
                    playClick();
                    setFilterCodec(c);
                  }}
                  className={`px-2 py-1 text-[10px] uppercase font-bold tracking-wider transition-colors ${
                    filterCodec === c
                      ? "bg-cyber-cyan text-cyber-void"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>

            <div className="flex items-center border border-cyber-border bg-[#05070B] p-1">
              <button
                type="button"
                onClick={() => {
                  playClick();
                  setViewMode("grid");
                }}
                className={`p-1 transition-colors ${viewMode === "grid" ? "bg-cyber-yellow text-cyber-void" : "text-slate-400 hover:text-white"}`}
                title="Tampilan Grid"
              >
                <Grid className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                onClick={() => {
                  playClick();
                  setViewMode("list");
                }}
                className={`p-1 transition-colors ${viewMode === "list" ? "bg-cyber-yellow text-cyber-void" : "text-slate-400 hover:text-white"}`}
                title="Tampilan List"
              >
                <List className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      {items.length === 0 ? (
        <div className="rounded-xl border border-white/10 bg-[#060a12]/60 px-6 py-12 text-center text-sm text-slate-400">
          <Archive className="mx-auto h-8 w-8 text-slate-500 mb-2" />
          <p className="font-bold text-slate-300">Belum ada riwayat unggahan</p>
          <p className="text-xs text-slate-500 mt-0.5">Gambar yang Anda unggah akan muncul di sini.</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-xl border border-white/10 bg-[#060a12]/60 px-6 py-8 text-center text-sm text-slate-400">
          Tidak ada gambar yang cocok dengan pencarian.
        </div>
      ) : viewMode === "grid" ? (
        /* GRID VIEW */
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence initial={false}>
            {filtered.map((item, i) => {
              const links = buildLinks(origin, item);
              return (
                <motion.li
                  key={item.id}
                  layout
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.94 }}
                  transition={{ duration: 0.2, delay: Math.min(i * 0.03, 0.25) }}
                  whileHover={{ y: -3 }}
                  className="cyber-cut group border border-cyber-cyan/25 bg-[#090d18] transition-all hover:border-cyber-cyan/60 hover:shadow-neon-cyan flex flex-col"
                >
                  <button
                    type="button"
                    id={`vault-view-${item.id}`}
                    onClick={() => {
                      playClick();
                      onSelect(item);
                    }}
                    className="relative block aspect-video w-full overflow-hidden bg-[#04060A] border-b border-white/10"
                    aria-label={`Tampilkan link untuk ${item.filename}`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={links.direct}
                      alt={item.filename}
                      loading="lazy"
                      className="h-full w-full object-contain transition-transform duration-300 group-hover:scale-105"
                    />
                    <span className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 transition-opacity group-hover:opacity-100">
                      <span className="cyber-btn-cyan text-[10px] py-1.5 px-3">
                        <Eye className="h-3.5 w-3.5" /> [ LIHAT LINK ]
                      </span>
                    </span>
                    <span className="absolute top-2 left-2 bg-black/80 px-1.5 py-0.5 font-mono text-[9px] uppercase text-cyber-cyan border border-cyber-cyan/40">
                      {item.ext}
                    </span>
                  </button>

                  <div className="flex flex-1 flex-col justify-between p-3.5 space-y-2.5 font-mono">
                    <div>
                      <p className="truncate font-bold text-slate-200 text-xs" title={item.filename}>
                        {item.filename}
                      </p>
                      <p className="flex items-center gap-1.5 text-[10px] text-slate-500 mt-1">
                        <Clock className="h-3 w-3" />
                        {new Date(item.createdAt).toLocaleString("id-ID", {
                          dateStyle: "short",
                          timeStyle: "short",
                        })}
                        <span>· {formatBytes(item.sizeBytes)}</span>
                      </p>
                    </div>

                    <div className="flex items-center gap-1.5 pt-1 border-t border-white/5">
                      <CopyButton
                        id={`vault-copy-${item.id}`}
                        value={links.direct}
                        label="SALIN LINK"
                        className="flex-1 text-[10px] py-1.5"
                      />
                      <a
                        id={`vault-delete-${item.id}`}
                        href={links.deletion}
                        className="cyber-btn-ghost border-cyber-magenta/40 text-cyber-magenta hover:!bg-cyber-magenta hover:!text-white text-[10px] p-2"
                        title="Hapus gambar"
                        onClick={() => playClick()}
                      >
                        <Trash2 className="h-3 w-3" />
                      </a>
                      <button
                        id={`vault-forget-${item.id}`}
                        type="button"
                        onClick={() => {
                          playClick();
                          onForget(item.id);
                        }}
                        className="cyber-btn-ghost border-white/15 text-slate-400 text-[10px] p-2"
                        title="Hapus dari riwayat browser saja"
                        aria-label="Hapus dari riwayat"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                </motion.li>
              );
            })}
          </AnimatePresence>
        </ul>
      ) : (
        /* LIST VIEW */
        <div className="border border-cyber-border bg-[#090d18] font-mono text-xs overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-[#05070B] border-b border-white/10 text-slate-400 text-[10px] uppercase">
              <tr>
                <th className="py-2.5 px-4">Gambar</th>
                <th className="py-2.5 px-3">Format</th>
                <th className="py-2.5 px-3">Ukuran</th>
                <th className="py-2.5 px-3">Waktu</th>
                <th className="py-2.5 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filtered.map((item) => {
                const links = buildLinks(origin, item);
                return (
                  <tr key={item.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-2 px-4 flex items-center gap-3">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={links.direct}
                        alt=""
                        className="h-8 w-8 object-cover border border-white/10 bg-black/50"
                      />
                      <div className="min-w-0">
                        <button
                          type="button"
                          onClick={() => {
                            playClick();
                            onSelect(item);
                          }}
                          className="font-bold text-slate-200 hover:text-cyber-cyan text-left truncate block max-w-xs"
                          title={item.filename}
                        >
                          {item.filename}
                        </button>
                      </div>
                    </td>
                    <td className="py-2 px-3">
                      <span className="hud-tag border-cyber-cyan/30 text-cyber-cyan uppercase">{item.ext}</span>
                    </td>
                    <td className="py-2 px-3 text-slate-400">{formatBytes(item.sizeBytes)}</td>
                    <td className="py-2 px-3 text-slate-500 text-[11px]">
                      {new Date(item.createdAt).toLocaleString("id-ID", { dateStyle: "short", timeStyle: "short" })}
                    </td>
                    <td className="py-2 px-4 text-right space-x-1">
                      <CopyButton value={links.direct} label="SALIN" className="text-[10px] py-1 px-2.5" />
                      <a
                        href={links.deletion}
                        className="cyber-btn-ghost border-cyber-magenta/40 text-cyber-magenta hover:!bg-cyber-magenta hover:!text-white text-[10px] p-1.5 inline-flex"
                        title="Hapus"
                      >
                        <Trash2 className="h-3 w-3" />
                      </a>
                      <button
                        type="button"
                        onClick={() => {
                          playClick();
                          onForget(item.id);
                        }}
                        className="cyber-btn-ghost border-white/15 text-slate-400 text-[10px] p-1.5"
                        title="Hapus dari riwayat"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
