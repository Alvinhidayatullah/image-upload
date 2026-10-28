import { NextRequest, NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { customAlphabet } from "nanoid";
import { ensureSchema, sql } from "@/lib/db";
import { ALLOWED_MIME, MAX_SIZE_BYTES, buildLinks } from "@/lib/utils";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// "p_" + 10 karakter acak → contoh: p_3953los8e1 (PRD §6.1)
const shortId = customAlphabet("0123456789abcdefghijklmnopqrstuvwxyz", 10);

class UploadError extends Error {
  constructor(message: string, public status = 400) {
    super(message);
  }
}

type Incoming = { buffer: Buffer; mime: string; filename: string };

function validate(mime: string, size: number) {
  if (!ALLOWED_MIME[mime]) {
    throw new UploadError(
      "Format file tidak didukung. Gunakan JPG, PNG, GIF, WEBP, atau SVG.",
      415,
    );
  }
  if (size <= 0) throw new UploadError("File kosong.");
  if (size > MAX_SIZE_BYTES) {
    throw new UploadError("Ukuran file melebihi batas maksimal 5MB.", 413);
  }
}

function sanitizeFilename(name: string, ext: string) {
  let clean = name.replace(/[\\/:*?"<>|\u0000-\u001f]/g, "_").trim();
  if (!clean) clean = `image.${ext}`;
  if (!/\.[a-z0-9]{2,5}$/i.test(clean)) clean = `${clean}.${ext}`;
  return clean.slice(-255);
}

async function fromFormData(req: NextRequest): Promise<Incoming> {
  const form = await req.formData();
  const file = form.get("file");
  // Catatan: Node 18 tidak punya global `File`, jadi cek sebagai Blob.
  if (!file || typeof file === "string" || !(file instanceof Blob)) {
    throw new UploadError("Tidak ada file yang dikirim.");
  }
  const mime = file.type.toLowerCase();
  validate(mime, file.size);
  const buffer = Buffer.from(await file.arrayBuffer());
  validate(mime, buffer.length);
  return { buffer, mime, filename: file.name };
}

async function fromRemoteUrl(req: NextRequest): Promise<Incoming> {
  const body = (await req.json().catch(() => null)) as { imageUrl?: string } | null;
  const raw = body?.imageUrl?.trim();
  if (!raw) throw new UploadError("URL gambar wajib diisi.");

  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    throw new UploadError("URL tidak valid.");
  }
  if (url.protocol !== "http:" && url.protocol !== "https:") {
    throw new UploadError("Hanya URL http/https yang diizinkan.");
  }

  let res: Response;
  try {
    res = await fetch(url, { redirect: "follow", signal: AbortSignal.timeout(15000) });
  } catch {
    throw new UploadError("Gagal menghubungi server sumber gambar.", 502);
  }
  if (!res.ok) throw new UploadError(`Server sumber merespons ${res.status}.`, 502);

  const mime = (res.headers.get("content-type") ?? "").split(";")[0].trim().toLowerCase();
  const declared = Number(res.headers.get("content-length") ?? 0);
  validate(mime, declared || 1);

  const buffer = Buffer.from(await res.arrayBuffer());
  validate(mime, buffer.length);

  const lastSegment = url.pathname.split("/").filter(Boolean).pop() ?? "";
  let filename = "";
  try {
    filename = decodeURIComponent(lastSegment);
  } catch {
    filename = lastSegment;
  }
  return { buffer, mime, filename };
}

export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get("content-type") ?? "";
    const incoming = contentType.includes("application/json")
      ? await fromRemoteUrl(req)
      : await fromFormData(req);

    const ext = ALLOWED_MIME[incoming.mime];
    const filename = sanitizeFilename(incoming.filename, ext);
    const id = `p_${shortId()}`;
    const deleteToken = randomBytes(16).toString("hex"); // 32 karakter hex
    const imageData = incoming.buffer.toString("base64");

    await ensureSchema();
    const rows = (await sql`
      INSERT INTO uploads (id, filename, ext, mime_type, size_bytes, image_data, delete_token)
      VALUES (${id}, ${filename}, ${ext}, ${incoming.mime}, ${incoming.buffer.length}, ${imageData}, ${deleteToken})
      RETURNING created_at
    `) as { created_at: string }[];

    const origin = (process.env.NEXT_PUBLIC_APP_URL || req.nextUrl.origin).replace(/\/+$/, "");
    const result = {
      id,
      filename,
      ext,
      mimeType: incoming.mime,
      sizeBytes: incoming.buffer.length,
      deleteToken,
      createdAt: new Date(rows[0]?.created_at ?? Date.now()).toISOString(),
    };

    return NextResponse.json({ ...result, urls: buildLinks(origin, result) }, { status: 201 });
  } catch (err) {
    if (err instanceof UploadError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    console.error("[upload] error:", err);
    return NextResponse.json({ error: "Terjadi kesalahan pada server." }, { status: 500 });
  }
}
