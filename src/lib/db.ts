import { neon } from "@neondatabase/serverless";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL belum diset di .env / .env.local");
}

export const sql = neon(process.env.DATABASE_URL);

export type UploadRecord = {
  id: string;
  filename: string;
  ext: string;
  mime_type: string;
  size_bytes: number;
  image_data: string;
  delete_token: string;
  created_at: string;
};

let schemaReady: Promise<void> | null = null;

/**
 * Auto-migration (PRD §4 & §8.2): memastikan tabel `uploads` tersedia
 * tanpa setup manual. Hanya dijalankan sekali per instance server.
 */
export function ensureSchema(): Promise<void> {
  if (!schemaReady) {
    schemaReady = (async () => {
      await sql`
        CREATE TABLE IF NOT EXISTS uploads (
          id VARCHAR(16) PRIMARY KEY,
          filename VARCHAR(255) NOT NULL,
          ext VARCHAR(10) NOT NULL,
          mime_type VARCHAR(100) NOT NULL,
          size_bytes INTEGER NOT NULL,
          image_data TEXT NOT NULL,
          delete_token VARCHAR(64) UNIQUE NOT NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        )
      `;
    })().catch((err) => {
      schemaReady = null; // izinkan retry pada request berikutnya
      throw err;
    });
  }
  return schemaReady;
}
