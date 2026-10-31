import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import DeleteClient from "@/components/DeleteClient";
import { ensureSchema, sql } from "@/lib/db";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Hapus Gambar — Vinz Upload",
  description: "Halaman konfirmasi penghapusan gambar permanen.",
  robots: { index: false, follow: false },
};

type Row = { id: string; filename: string; ext: string; size_bytes: number; created_at: string };

export default async function DeletePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  let record: Row | null = null;

  if (/^[a-f0-9]{32,64}$/i.test(token)) {
    await ensureSchema();
    const rows = (await sql`
      SELECT id, filename, ext, size_bytes, created_at FROM uploads WHERE delete_token = ${token} LIMIT 1
    `) as Row[];
    record = rows[0] ?? null;
  }

  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-3xl px-4 pb-24 pt-10 sm:px-6">
        <DeleteClient
          token={token}
          record={
            record && {
              id: record.id,
              filename: record.filename,
              ext: record.ext,
              sizeBytes: record.size_bytes,
              createdAt: new Date(record.created_at).toISOString(),
            }
          }
        />
      </main>
    </>
  );
}
