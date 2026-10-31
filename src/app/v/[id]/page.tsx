import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ExternalLink, ShieldCheck } from "lucide-react";
import Navbar from "@/components/Navbar";
import TiltCard, { Depth } from "@/components/TiltCard";
import { ensureSchema, sql } from "@/lib/db";
import { formatBytes } from "@/lib/utils";

export const dynamic = "force-dynamic";

type Row = { id: string; filename: string; ext: string; size_bytes: number };

async function getRecord(id: string): Promise<Row | null> {
  if (!/^[a-z0-9_]{1,16}$/i.test(id)) return null;
  await ensureSchema();
  const rows = (await sql`
    SELECT id, filename, ext, size_bytes FROM uploads WHERE id = ${id} LIMIT 1
  `) as Row[];
  return rows[0] ?? null;
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const record = await getRecord(id);
  return {
    title: record ? `${record.filename} — Vinz Upload` : "Gambar Tidak Ditemukan — Vinz Upload",
    description: "Gambar di-hosting melalui Vinz Upload.",
  };
}

/** Halaman tujuan [url=…/v/{id}] pada format BBCode (PRD §5.B.3 Baris 2) */
export default async function ViewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const record = await getRecord(id);
  if (!record) notFound();

  const direct = `/i/${record.id}.${record.ext}`;

  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-4xl px-4 pb-24 pt-10 sm:px-6">
        <TiltCard accent="cyan">
          <Depth z={20} className="mb-6 border-b border-white/10 pb-4">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-cyber-cyan shadow-neon-cyan animate-pulse" />
              <p className="font-mono text-xs font-bold uppercase tracking-wider text-cyber-cyan">
                Pratinjau Gambar
              </p>
            </div>
            <h1 className="truncate font-display text-xl font-bold uppercase tracking-wide text-white sm:text-2xl mt-1">
              {record.filename}
            </h1>
            <div className="mt-2 flex flex-wrap items-center gap-2 font-mono text-xs text-slate-400">
              <span className="text-cyber-cyan font-bold">{record.id}</span>
              <span>·</span>
              <span>{formatBytes(record.size_bytes)}</span>
              <span>·</span>
              <span className="uppercase text-cyber-yellow">{record.ext}</span>
              <span>·</span>
              <span className="text-cyber-emerald flex items-center gap-1">
                <ShieldCheck className="h-3.5 w-3.5" /> Aman & Terverifikasi
              </span>
            </div>
          </Depth>

          <Depth z={50} className="flex justify-center">
            <a
              href={direct}
              target="_blank"
              rel="noopener noreferrer"
              className="transparency-checkerboard group block rounded-xl border-2 border-cyber-cyan/50 p-2 shadow-neon-cyan"
            >
              <div className="relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={direct}
                  alt={record.filename}
                  className="max-h-[70vh] w-auto max-w-full object-contain"
                />
                <span className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 transition-opacity group-hover:opacity-100">
                  <span className="cyber-btn-cyan text-xs py-2 px-4 shadow-neon-cyan">
                    <ExternalLink className="h-3.5 w-3.5" /> Buka Gambar Langsung
                  </span>
                </span>
              </div>
            </a>
          </Depth>

          <Depth z={30} className="mt-8 flex flex-wrap items-center justify-center gap-3 border-t border-white/5 pt-5">
            <Link href="/" id="view-upload-own" className="cyber-btn text-xs py-2.5 px-5">
              <ArrowLeft className="h-4 w-4" /> Unggah Gambar Baru
            </Link>
          </Depth>
        </TiltCard>
      </main>
    </>
  );
}
