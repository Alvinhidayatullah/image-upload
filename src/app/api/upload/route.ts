import { NextRequest, NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { customAlphabet } from "nanoid";
import { ensureSchema, sql } from "@/lib/db";
import { ALLOWED_MIME, MAX_SIZE_BYTES, buildLinks } from "@/lib/utils";
import {
  checkUploadRateLimit,
  detectTrueMimeType,
  sanitizeSafeFilename,
  validateSafeRemoteUrl,
} from "@/lib/security";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Short ID generator: "p_" + 10 random lowercase alphanumeric chars (PRD §4 & §6.1)
const shortId = customAlphabet("0123456789abcdefghijklmnopqrstuvwxyz", 10);

class UploadError extends Error {
  constructor(message: string, public status = 400) {
    super(message);
  }
}

type Incoming = { buffer: Buffer; mime: string; filename: string };

function getClientIp(req: NextRequest): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  const realIp = req.headers.get("x-real-ip");
  if (realIp) return realIp.trim();
  return "unknown-client";
}

async function fromFormData(req: NextRequest): Promise<Incoming> {
  const form = await req.formData();
  const file = form.get("file");

  if (!file || typeof file === "string" || !(file instanceof Blob)) {
    throw new UploadError("Pilih file gambar untuk diunggah.", 400);
  }

  if (file.size <= 0) {
    throw new UploadError("File yang dipilih kosong.", 400);
  }

  if (file.size > MAX_SIZE_BYTES) {
    throw new UploadError("Ukuran file melebihi batas maksimal 5MB.", 413);
  }

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  // Magic Bytes verification (Strict Anti-Spoofing)
  const trueMime = detectTrueMimeType(buffer);
  if (!trueMime || !ALLOWED_MIME[trueMime]) {
    throw new UploadError(
      "Format file tidak didukung atau file rusak. Gunakan JPG, PNG, GIF, WEBP, atau SVG.",
      415,
    );
  }

  return { buffer, mime: trueMime, filename: file.name || "image" };
}

async function fromRemoteUrl(req: NextRequest): Promise<Incoming> {
  const body = (await req.json().catch(() => null)) as { imageUrl?: string } | null;
  const raw = body?.imageUrl?.trim();
  if (!raw) {
    throw new UploadError("URL gambar wajib diisi.", 400);
  }

  // 1. Anti-SSRF URL Validation (Blocks Private IPs & Cloud Metadata)
  let targetUrl: URL;
  try {
    targetUrl = validateSafeRemoteUrl(raw);
  } catch (err) {
    throw new UploadError(err instanceof Error ? err.message : "URL tidak aman atau tidak valid.", 400);
  }

  // 2. Fetch with safe timeout and redirect prevention
  let res: Response;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 12000);

  try {
    res = await fetch(targetUrl.href, {
      method: "GET",
      headers: {
        Accept: "image/*",
        "User-Agent": "CyberImg-Host/2.0 (Image Verification)",
      },
      redirect: "error", // Prevent redirect chaining to internal network addresses
      signal: controller.signal,
    });
  } catch (err: unknown) {
    clearTimeout(timeoutId);
    if (err instanceof Error && err.name === "AbortError") {
      throw new UploadError("Koneksi ke server sumber melebihi batas waktu (timeout).", 504);
    }
    throw new UploadError("Gagal menghubungi server sumber gambar atau dialihkan secara tidak aman.", 502);
  } finally {
    clearTimeout(timeoutId);
  }

  if (!res.ok) {
    throw new UploadError(`Server sumber gambar merespons status ${res.status}.`, 502);
  }

  // Check declared content length if available
  const declaredLen = Number(res.headers.get("content-length") ?? 0);
  if (declaredLen > MAX_SIZE_BYTES) {
    throw new UploadError("Ukuran gambar melebihi batas maksimal 5MB.", 413);
  }

  // 3. Stream reader with strict byte counter to prevent memory exhaustion / buffer bomb
  if (!res.body) {
    throw new UploadError("Tidak ada data yang diterima dari server sumber.", 502);
  }

  const reader = res.body.getReader();
  const chunks: Uint8Array[] = [];
  let totalBytes = 0;

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      if (value) {
        totalBytes += value.length;
        if (totalBytes > MAX_SIZE_BYTES) {
          await reader.cancel();
          throw new UploadError("Ukuran gambar melebihi batas maksimal 5MB.", 413);
        }
        chunks.push(value);
      }
    }
  } catch (err) {
    if (err instanceof UploadError) throw err;
    throw new UploadError("Terputus saat mengunduh gambar dari server sumber.", 502);
  }

  if (totalBytes === 0) {
    throw new UploadError("File dari URL kosong.", 400);
  }

  const buffer = Buffer.concat(chunks);

  // 4. Magic Bytes Verification
  const trueMime = detectTrueMimeType(buffer);
  if (!trueMime || !ALLOWED_MIME[trueMime]) {
    throw new UploadError(
      "Konten dari URL bukan format gambar yang didukung (JPG, PNG, GIF, WEBP, SVG).",
      415,
    );
  }

  const pathSegments = targetUrl.pathname.split("/").filter(Boolean);
  const rawFilename = pathSegments.pop() || "remote_image";
  let filename = rawFilename;
  try {
    filename = decodeURIComponent(rawFilename);
  } catch {
    filename = rawFilename;
  }

  return { buffer, mime: trueMime, filename };
}

export async function POST(req: NextRequest) {
  try {
    // 1. Rate Limiting Check
    const clientIp = getClientIp(req);
    if (!checkUploadRateLimit(clientIp, 40, 60_000)) {
      return NextResponse.json(
        { error: "Terlalu banyak permintaan unggah. Silakan tunggu 1 menit sebelum mengunggah lagi." },
        { status: 429 },
      );
    }

    // 2. Parse payload based on Content-Type
    const contentType = req.headers.get("content-type") ?? "";
    const incoming = contentType.includes("application/json")
      ? await fromRemoteUrl(req)
      : await fromFormData(req);

    const ext = ALLOWED_MIME[incoming.mime];
    const filename = sanitizeSafeFilename(incoming.filename, ext);
    const id = `p_${shortId()}`;
    const deleteToken = randomBytes(16).toString("hex"); // 32 chars hex
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
  } catch (err: unknown) {
    if (err instanceof UploadError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    console.error("[upload] error:", err);
    return NextResponse.json({ error: "Terjadi kesalahan pada server saat memproses unggahan." }, { status: 500 });
  }
}
