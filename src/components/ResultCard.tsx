"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { QRCodeSVG } from "qrcode.react";
import {
  Check,
  Code,
  Copy,
  ExternalLink,
  Link2,
  MessageSquare,
  QrCode,
  Trash2,
  X,
  Zap,
} from "lucide-react";
import TiltCard, { Depth } from "./TiltCard";
import CopyRow, { copyText } from "./CopyRow";
import { buildLinks, formatBytes, getClientOrigin, type UploadResult } from "@/lib/utils";
import { playClick, playCopyChirp } from "@/lib/sound";

/**
 * User-Friendly Result Card with QR Code and 4 Link Rails
 */
export default function ResultCard({
  result,
  onDismiss,
}: {
  result: UploadResult;
  onDismiss: () => void;
}) {
  const origin = getClientOrigin();
  const links = useMemo(() => buildLinks(origin, result), [origin, result]);
  const [copiedAll, setCopiedAll] = useState(false);

  async function handleCopyAll() {
    playCopyChirp();
    const manifest = `Direct Link: ${links.direct}\nHTML Embed: ${links.html}\nMarkdown: ${links.markdown}\nBBCode: ${links.bbcode}\nDelete Link: ${links.deletion}`;
    if (await copyText(manifest)) {
      setCopiedAll(true);
      setTimeout(() => setCopiedAll(false), 2000);
    }
  }

  return (
    <TiltCard id="result-card" accent="emerald">
      {/* Header Deck */}
      <Depth z={25} className="mb-5 flex flex-wrap items-start justify-between gap-4 border-b border-white/10 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-cyber-emerald shadow-neon-emerald animate-pulse" />
            <p className="font-mono text-xs font-bold uppercase tracking-wider text-cyber-emerald flex items-center gap-1.5">
              <Zap className="h-3 w-3" /> Berhasil Diunggah!
            </p>
          </div>
          <h2 className="font-display text-xl font-bold uppercase tracking-wide text-white sm:text-2xl mt-1">
            Gambar Siap Digunakan
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Salin tautan atau pindai QR Code di bawah untuk membagikan gambar.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            id="copy-all-manifest"
            onClick={handleCopyAll}
            className="cyber-btn-ghost text-xs px-3 py-1.5"
            title="Salin semua format link"
          >
            {copiedAll ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
            <span>{copiedAll ? "SEMUA DISALIN!" : "SALIN SEMUA LINK"}</span>
          </button>
          <button
            id="dismiss-result"
            type="button"
            onClick={() => {
              playClick();
              onDismiss();
            }}
            aria-label="Tutup panel hasil"
            className="cyber-cut-sm border border-white/10 p-1.5 text-slate-400 transition-colors hover:border-cyber-magenta hover:text-cyber-magenta"
            title="Tutup hasil"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </Depth>

      {/* 3D Floating Thumbnail Preview */}
      <Depth z={55} className="mb-6 flex flex-col items-center">
        <motion.a
          id="result-thumbnail"
          href={links.direct}
          target="_blank"
          rel="noopener noreferrer"
          whileHover={{ scale: 1.04, rotateX: 3, rotateY: -3, z: 20 }}
          transition={{ type: "spring", stiffness: 240, damping: 20 }}
          className="group relative block max-w-full"
          style={{ transformStyle: "preserve-3d" }}
          onClick={() => playClick()}
        >
          <div className="cyber-cut relative border-2 border-cyber-cyan/60 bg-[#060912] p-2 shadow-[0_0_30px_rgba(0,240,255,0.2)]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={links.direct}
              alt={result.filename}
              className="max-h-60 sm:max-h-64 w-auto max-w-full object-contain"
            />
            <div className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 transition-opacity group-hover:opacity-100">
              <span className="cyber-btn-cyan text-xs py-2 px-4 shadow-neon-cyan">
                <ExternalLink className="h-3.5 w-3.5" /> BUKA GAMBAR ASLI
              </span>
            </div>
          </div>
        </motion.a>

        <div className="mt-2.5 flex flex-wrap items-center justify-center gap-2 font-mono text-xs text-slate-400">
          <span className="text-cyber-yellow font-bold truncate max-w-xs">{result.filename}</span>
          <span>·</span>
          <span>{formatBytes(result.sizeBytes)}</span>
          <span>·</span>
          <span className="text-cyber-cyan uppercase">{result.ext}</span>
        </div>
      </Depth>

      {/* 2-Zone Body: QR Code & Links */}
      <div className="grid gap-6 md:grid-cols-[auto_1fr] border-t border-white/5 pt-5" style={{ transformStyle: "preserve-3d" }}>
        {/* QR Code */}
        <Depth z={35} className="flex flex-col items-center gap-2">
          <div className="flex items-center gap-1.5 font-mono text-[11px] text-slate-300">
            <QrCode className="h-3.5 w-3.5 text-cyber-cyan" /> Scan QR Ponsel
          </div>

          <div id="result-qr" className="relative p-2.5 bg-white border border-cyber-cyan shadow-neon-cyan">
            <QRCodeSVG value={links.direct} size={140} level="M" bgColor="#FFFFFF" fgColor="#05070B" marginSize={0} />
          </div>

          <p className="font-mono text-[10px] text-slate-500">Buka langsung di HP</p>
        </Depth>

        {/* Link Rails */}
        <Depth z={30} className="min-w-0 space-y-3">
          <CopyRow
            id="link-direct"
            label="Direct Link (Link Gambar Langsung)"
            sublabel="Paling umum: bisa dibuka di browser, dikirim ke WhatsApp/Telegram, atau dibagikan langsung"
            icon={<Link2 className="h-3.5 w-3.5" />}
            value={links.direct}
            accent="cyan"
          />
          <CopyRow
            id="link-html"
            label="Kode HTML (Embed Website / Blog)"
            sublabel="Kode <img> asli untuk disisipkan langsung ke file HTML atau postingan WordPress"
            icon={<Code className="h-3.5 w-3.5" />}
            value={links.html}
            accent="cyan"
          />
          <CopyRow
            id="link-markdown"
            label="Markdown"
            sublabel="Khusus untuk GitHub (README.md, Issue), Discord, Reddit, atau Notion"
            icon={<Code className="h-3.5 w-3.5" />}
            value={links.markdown}
            accent="cyan"
          />
          <CopyRow
            id="link-bbcode"
            label="BBCode Forum"
            sublabel="Khusus untuk forum diskusi internet (seperti Kaskus, phpBB, XenForo)"
            icon={<MessageSquare className="h-3.5 w-3.5" />}
            value={links.bbcode}
            accent="cyan"
          />
          <CopyRow
            id="link-delete"
            label="Link Hapus Gambar (Privat)"
            sublabel="Simpan link ini jika suatu saat Anda ingin menghapus gambar ini permanen dari server"
            icon={<Trash2 className="h-3.5 w-3.5" />}
            value={links.deletion}
            accent="magenta"
          />
        </Depth>
      </div>

      {/* Footer Actions */}
      <Depth z={25} className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-white/5 pt-4">
        <a
          href={links.direct}
          target="_blank"
          rel="noopener noreferrer"
          className="cyber-btn-ghost text-xs"
          onClick={() => playClick()}
        >
          <ExternalLink className="h-3.5 w-3.5" />
          <span>Buka di Tab Baru</span>
        </a>

        <button
          type="button"
          onClick={() => {
            playClick();
            onDismiss();
          }}
          className="cyber-btn-cyan text-xs py-2.5 px-5"
        >
          [ + UNGGAH GAMBAR LAIN ]
        </button>
      </Depth>
    </TiltCard>
  );
}
