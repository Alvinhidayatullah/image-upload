import { NextRequest, NextResponse } from "next/server";
import { ensureSchema, sql } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** DELETE /api/delete/[token] — hapus baris dari Neon secara permanen (PRD §6.3) */
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ token: string }> },
) {
  const { token } = await params;
  if (!/^[a-f0-9]{32,64}$/i.test(token)) {
    return NextResponse.json({ error: "Token tidak valid." }, { status: 400 });
  }

  try {
    await ensureSchema();
    const rows = (await sql`
      DELETE FROM uploads WHERE delete_token = ${token} RETURNING id
    `) as { id: string }[];

    if (!rows[0]) {
      return NextResponse.json({ error: "File tidak ditemukan atau sudah dihapus." }, { status: 404 });
    }
    return NextResponse.json({ success: true, id: rows[0].id });
  } catch (err) {
    console.error("[delete] error:", err);
    return NextResponse.json({ error: "Terjadi kesalahan pada server." }, { status: 500 });
  }
}
