import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5MB (PRD §6.1)

export const ALLOWED_MIME: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/gif": "gif",
  "image/webp": "webp",
  "image/svg+xml": "svg",
};

export function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

/**
 * Origin dinamis (PRD §3): pakai NEXT_PUBLIC_APP_URL, tapi fallback ke
 * window.location.origin bila env belum disesuaikan saat produksi.
 */
export function getClientOrigin() {
  const envUrl = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/+$/, "");
  if (typeof window === "undefined") return envUrl ?? "";
  const winOrigin = window.location.origin;
  if (!envUrl) return winOrigin;
  try {
    const envHost = new URL(envUrl).hostname;
    const isEnvLocal = envHost === "localhost" || envHost === "127.0.0.1";
    if (isEnvLocal && envHost !== window.location.hostname) return winOrigin;
  } catch {
    return winOrigin;
  }
  return envUrl;
}

export type UploadLinks = {
  direct: string;
  html: string;
  bbcode: string;
  markdown: string;
  deletion: string;
};

/** Format link sesuai kebutuhan pengguna */
export function buildLinks(
  origin: string,
  item: { id: string; ext: string; filename: string; deleteToken: string },
): UploadLinks {
  const direct = `${origin}/i/${item.id}.${item.ext}`;
  return {
    direct,
    html: `<img src="${direct}" alt="${item.filename}" />`,
    bbcode: `[url=${origin}/v/${item.id}][img]${direct}[/img][/url]`,
    markdown: `![${item.filename}](${direct})`,
    deletion: `${origin}/delete/${item.deleteToken}`,
  };
}

export type UploadResult = {
  id: string;
  filename: string;
  ext: string;
  mimeType: string;
  sizeBytes: number;
  deleteToken: string;
  createdAt: string;
};
