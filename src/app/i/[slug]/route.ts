import { NextRequest, NextResponse } from "next/server";
import { ensureSchema, sql } from "@/lib/db";

export const runtime = "nodejs";

/**
 * Direct Image Delivery Endpoint (PRD §6.2)
 * /i/p_3953los8e1.jpg → stream biner gambar murni.
 */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const dot = slug.lastIndexOf(".");
  const id = dot > 0 ? slug.slice(0, dot) : slug;

  if (!/^[a-z0-9_]{1,16}$/i.test(id)) {
    return new NextResponse("Not Found", { status: 404 });
  }

  try {
    await ensureSchema();
    const rows = (await sql`
      SELECT image_data, mime_type FROM uploads WHERE id = ${id} LIMIT 1
    `) as { image_data: string; mime_type: string }[];

    const record = rows[0];
    if (!record) return new NextResponse("Not Found", { status: 404 });

    const buffer = Buffer.from(record.image_data, "base64");
    const headers: Record<string, string> = {
      "Content-Type": record.mime_type,
      "Cache-Control": "public, max-age=31536000, immutable",
      "Content-Length": String(buffer.length),
      "X-Content-Type-Options": "nosniff",
    };
    // SVG dapat memuat script — kunci eksekusinya saat dibuka langsung.
    if (record.mime_type === "image/svg+xml") {
      headers["Content-Security-Policy"] = "default-src 'none'; style-src 'unsafe-inline'; sandbox";
    }

    return new NextResponse(new Uint8Array(buffer), { headers });
  } catch (err) {
    console.error("[i/slug] error:", err);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
