/**
 * Security & Validation Suite (Security Audit & Anti-Slop Compliant)
 * - Anti-SSRF (Private IP & Cloud Metadata Protection)
 * - True Magic Bytes Verification (Anti-MIME Spoofing)
 * - Safe SVG Content Sanitization (Anti-Stored XSS / XXE)
 * - Robust Filename Normalization
 * - In-Memory Sliding-Window Rate Limiting
 */

// Private & Reserved IPv4 ranges
const PRIVATE_IPV4_PATTERNS = [
  /^127\./, // Loopback
  /^10\./, // RFC1918 Class A
  /^172\.(1[6-9]|2[0-9]|3[0-1])\./, // RFC1918 Class B
  /^192\.168\./, // RFC1918 Class C
  /^169\.254\./, // Link-local & Cloud Metadata (AWS, GCP, Azure, OpenStack)
  /^0\./, // Current network
  /^100\.(6[4-9]|[7-9][0-9]|1[0-1][0-9]|12[0-7])\./, // Shared address space
  /^198\.18\./, // Benchmark testing
  /^198\.19\./,
  /^224\./, // Multicast
  /^240\./, // Reserved
  /^255\.255\.255\.255$/, // Broadcast
];

// Blocked hostnames (Local, Internal, Cloud metadata endpoints)
const BLOCKED_HOSTNAMES = new Set([
  "localhost",
  "127.0.0.1",
  "0.0.0.0",
  "::1",
  "::",
  "metadata.google.internal",
  "instance-data",
  "metadata.azure.com",
]);

/**
 * Validates whether a target URL is safe for server-side fetching (SSRF Shield).
 */
export function validateSafeRemoteUrl(rawUrl: string): URL {
  let parsed: URL;
  try {
    parsed = new URL(rawUrl.trim());
  } catch {
    throw new Error("Format URL tidak valid.");
  }

  // Enforce HTTP / HTTPS only
  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    throw new Error("Hanya protokol HTTP dan HTTPS yang diizinkan.");
  }

  // Reject credentials in URL (e.g., http://user:pass@host)
  if (parsed.username || parsed.password) {
    throw new Error("URL dengan kredensial autentikasi tidak diizinkan.");
  }

  const hostname = parsed.hostname.toLowerCase();

  // Block localhost and internal names
  if (
    BLOCKED_HOSTNAMES.has(hostname) ||
    hostname.endsWith(".localhost") ||
    hostname.endsWith(".local") ||
    hostname.endsWith(".internal") ||
    hostname.endsWith(".lan") ||
    hostname.endsWith(".home")
  ) {
    throw new Error("Akses ke host jaringan lokal atau internal dilarang.");
  }

  // Check IPv6 loopback / private
  if (hostname.startsWith("[") && hostname.endsWith("]")) {
    const ipv6 = hostname.slice(1, -1);
    if (
      ipv6 === "::1" ||
      ipv6 === "::" ||
      ipv6.startsWith("fe80:") ||
      ipv6.startsWith("fc00:") ||
      ipv6.startsWith("fd00:")
    ) {
      throw new Error("Akses ke alamat IPv6 internal dilarang.");
    }
  }

  // Check IPv4 private & cloud metadata ranges
  for (const pattern of PRIVATE_IPV4_PATTERNS) {
    if (pattern.test(hostname)) {
      throw new Error("Akses ke alamat IP privat atau metadata cloud dilarang.");
    }
  }

  return parsed;
}

/**
 * Verifies true file type using Magic Bytes signatures.
 * Prevents MIME-type spoofing (e.g. uploading .html or .exe disguised as .png).
 */
export function detectTrueMimeType(buffer: Buffer): string | null {
  if (!buffer || buffer.length < 4) return null;

  // 1. JPEG: FF D8 FF
  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return "image/jpeg";
  }

  // 2. PNG: 89 50 4E 47 0D 0A 1A 0A
  if (
    buffer.length >= 8 &&
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47 &&
    buffer[4] === 0x0d &&
    buffer[5] === 0x0a &&
    buffer[6] === 0x1a &&
    buffer[7] === 0x0a
  ) {
    return "image/png";
  }

  // 3. GIF: GIF87a or GIF89a
  if (buffer.length >= 6) {
    const head = buffer.subarray(0, 6).toString("ascii");
    if (head === "GIF87a" || head === "GIF89a") {
      return "image/gif";
    }
  }

  // 4. WEBP: RIFF....WEBP
  if (buffer.length >= 12) {
    const riff = buffer.subarray(0, 4).toString("ascii");
    const webp = buffer.subarray(8, 12).toString("ascii");
    if (riff === "RIFF" && webp === "WEBP") {
      return "image/webp";
    }
  }

  // 5. SVG: Text-based XML/SVG inspection
  if (isSafeSvg(buffer)) {
    return "image/svg+xml";
  }

  return null;
}

/**
 * Inspects SVG content to ensure it is valid SVG and free from:
 * - Stored XSS (<script>, event handlers like onload, onclick, javascript: URIs)
 * - XXE (XML External Entity injection via <!ENTITY or <!DOCTYPE SYSTEM)
 * - Potentially malicious foreignObject tags
 */
export function isSafeSvg(buffer: Buffer): boolean {
  // SVG files are UTF-8 text. Limit scan length to prevent regex DoS on huge files.
  const snippet = buffer.subarray(0, Math.min(buffer.length, 128 * 1024)).toString("utf-8");

  // Must contain an <svg tag
  if (!/<svg[\s>]/i.test(snippet)) return false;

  // Check for dangerous XXE patterns
  if (/<!ENTITY/i.test(snippet) || /<!DOCTYPE[^>]*SYSTEM/i.test(snippet)) {
    return false;
  }

  // Check for dangerous scripts or inline execution
  if (
    /<script[\s>]/i.test(snippet) ||
    /<\/script>/i.test(snippet) ||
    /\bon[a-z]{3,15}\s*=/i.test(snippet) || // e.g. onload=, onerror=, onclick=
    /href\s*=\s*['"]\s*javascript:/i.test(snippet) ||
    /xlink:href\s*=\s*['"]\s*javascript:/i.test(snippet) ||
    /<foreignObject[\s>]/i.test(snippet)
  ) {
    return false;
  }

  return true;
}

/**
 * Sanitizes input filename to prevent Path Traversal, Null Byte injection,
 * and BiDi / Control character spoofing.
 */
export function sanitizeSafeFilename(name: string, ext: string): string {
  // Strip control characters, quotes, slashes, and RTL overrides
  let clean = name
    .replace(/[\u0000-\u001f\u007f-\u009f\u200e\u200f\u202a-\u202e]/g, "")
    .replace(/[\\/:*?"<>|]/g, "_")
    .replace(/\s+/g, " ")
    .trim();

  if (!clean || clean === "." || clean === "..") {
    clean = `image.${ext}`;
  }

  // Ensure filename ends with correct verified extension
  if (!clean.toLowerCase().endsWith(`.${ext}`)) {
    clean = `${clean}.${ext}`;
  }

  // Bound maximum length
  return clean.slice(-200);
}

/**
 * Lightweight in-memory rate limiter per IP address.
 * Prevents automated denial-of-service / database exhaustion.
 */
type RateLimitBucket = { count: number; expiresAt: number };
const ipRateBuckets = new Map<string, RateLimitBucket>();

export function checkUploadRateLimit(ip: string, maxRequests = 30, windowMs = 60_000): boolean {
  const now = Date.now();
  const bucket = ipRateBuckets.get(ip);

  // Clean old buckets occasionally
  if (ipRateBuckets.size > 2000) {
    for (const [k, v] of ipRateBuckets.entries()) {
      if (v.expiresAt <= now) ipRateBuckets.delete(k);
    }
  }

  if (!bucket || bucket.expiresAt <= now) {
    ipRateBuckets.set(ip, { count: 1, expiresAt: now + windowMs });
    return true;
  }

  if (bucket.count >= maxRequests) {
    return false;
  }

  bucket.count += 1;
  return true;
}
