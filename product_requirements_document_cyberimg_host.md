# Product Requirements Document (PRD): CyberImg — 3D Cyberpunk Image Hosting

## 1. Project Overview
**CyberImg** adalah aplikasi web *fullstack image hosting* modern yang terinspirasi dari fungsionalitas simpel *top4top.io*, namun dibalut dengan antarmuka **Cyberpunk Futuristik beranimasi 3D interaktif**. 

Pengguna dapat mengunggah gambar (melalui perangkat lokal atau URL), melihatnya secara *live* di browser, dan langsung mendapatkan berbagai format tautan panggilan (*Direct Link*, *BBCode/Forum*, *Markdown/HTML*, dan *Delete Link*) beserta **QR Code** otomatis. Gambar disimpan langsung di dalam database **Neon PostgreSQL** dan disajikan kembali sebagai *stream binary* murni melalui *Next.js Route Handlers* sehingga URL gambar dapat dipanggil langsung di mana saja (layaknya CDN).

---

## 2. Tech Stack & Libraries
AI Agent (Antigravity) wajib menggunakan teknologi berikut:
* **Framework:** Next.js 14/15 (App Router, TypeScript)
* **Styling:** Tailwind CSS (dengan kustomisasi tema warna Neon Cyberpunk: *Cyber Yellow `#FCEE0A`*, *Neon Cyan `#00F0FF`*, *Neon Magenta `#FF003C`*, dan *Deep Void `#07070C`*)
* **Animation & 3D UI:** `framer-motion` (menggunakan `useMotionValue`, `useTransform`, `useSpring` untuk efek 3D Perspective Tilt Card, *glitch transition*, dan *floating holographic elements*)
* **Database:** Neon.tech Serverless PostgreSQL (`@neondatabase/serverless` atau `pg` + `drizzle-orm` / `prisma`)
* **Utilities & Icons:** 
  * `lucide-react` (Ikon futuristik)
  * `qrcode.react` (Generate QR Code otomatis untuk link gambar)
  * `nanoid` atau `crypto` (Generate ID pendek unik untuk nama file & *delete token*)

---

## 3. Environment Configuration (`.env`)
Gunakan konfigurasi koneksi database Neon.tech berikut di dalam file `.env` / `.env.local`:

```env
DATABASE_URL="postgresql://neondb_owner:npg_oO8kGJD7QwMc@ep-billowing-cell-az81n0sg-pooler.c-3.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```
*(Catatan untuk AI Agent: Gunakan `window.location.origin` di sisi klien sebagai fallback dinamis jika `NEXT_PUBLIC_APP_URL` belum disesuaikan saat produksi).*

---

## 4. Database Schema (Neon PostgreSQL)
Buat tabel `uploads` secara otomatis (menggunakan script inisialisasi SQL atau ORM migration) dengan skema berikut agar gambar dapat disimpan tanpa memerlukan layanan *cloud storage* pihak ketiga tambahan:

```sql
CREATE TABLE IF NOT EXISTS uploads (
  id VARCHAR(16) PRIMARY KEY,              -- Short ID unik, contoh: "p_3953los8e1"
  filename VARCHAR(255) NOT NULL,          -- Nama asli file, contoh: "fsociety.jpg"
  ext VARCHAR(10) NOT NULL,                -- Ekstensi file, contoh: "jpg", "png", "webp"
  mime_type VARCHAR(100) NOT NULL,         -- Contoh: "image/jpeg", "image/png"
  size_bytes INTEGER NOT NULL,             -- Ukuran file dalam byte
  image_data TEXT NOT NULL,                -- Base64 encoded binary data dari gambar
  delete_token VARCHAR(64) UNIQUE NOT NULL,-- Token rahasia untuk menghapus gambar
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

---

## 5. Core Features & User Flow (Berdasarkan Referensi UI)

### A. State 1: Upload Interface (Referensi Gambar 1)
1. **Top Cyberpunk Navbar:**
   * Menampilkan logo neon **CYBER//TOP** di kanan/kiri dengan efek *glow*.
   * Menu navigasi minimalis: *Supported Files* (Format yang didukung), *Terms of Service* (Aturan Layanan), dan *Report Abuse*.
2. **System Alert Banner:**
   * Banner peringatan bergaya terminal/HUD merah menyala di bagian atas yang menginformasikan batas ukuran file (misal: Maks 5MB, format JPG, PNG, GIF, WEBP) dan larangan mengunggah konten ilegal.
3. **3D Holographic Upload Card (Framer Motion 3D Tilt):**
   * Memiliki **2 Tab Navigasi**:
     * **Tab 1: Upload dari Perangkat (Default)** — Area *Drag & Drop* atau tombol `[ ...BROWSE ]` bergaya HUD yang menampilkan nama file yang dipilih.
     * **Tab 2: Tarik dari URL (Remote Upload)** — Input URL gambar eksternal untuk diunduh dan disimpan ke server kita.
   * **Terms Checkbox:** Kotak centang interaktif *"Saya menyetujui Aturan Protokol Jaringan (Terms of Service)"*. Tombol upload terkunci (disabled) sebelum kotak ini dicentang.
   * **Action Button:** Tombol `[ UPLOAD KE JARINGAN ]` dengan animasi *scanning progress bar* saat proses unggah berlangsung.

### B. State 2: Post-Upload Result Card (Referensi Gambar 2)
Ketika gambar selesai diunggah, tampilkan panel hasil di atas form upload (sehingga user bisa langsung melihat hasilnya sekaligus mengunggah gambar lain di bawahnya):
1. **Live Image Preview (3D Floating Thumbnail):**
   * Menampilkan *thumbnail* gambar yang baru saja diunggah di bagian tengah atas kartu hasil dengan bingkai neon dan efek *hover 3D zoom*.
2. **QR Code Generator (Sisi Kiri):**
   * Menampilkan QR Code dari **Direct Image Link** dengan bingkai kontras tinggi agar mudah dipindai dari kamera ponsel.
3. **4 Baris Output Link Siap Salin (Sisi Kanan):**
   Setiap baris memiliki label di sampingnya dan tombol `[ COPY ]` yang memberikan efek animasi *"COPIED!"* saat diklik:
   * **Baris 1 — Direct Image Link (Tautan Langsung):**
     * Format: `{ORIGIN}/i/{id}.{ext}` (Contoh: `http://localhost:3000/i/p_3953los8e1.jpg`)
     * *Fungsi:* URL ini langsung merender file gambar murni di browser dan bisa dipakai di tag `<img src="..." />` di website mana pun.
   * **Baris 2 — Forum / BBCode Link (Tautan Forum):**
     * Format: `[url={ORIGIN}/v/{id}][img]{ORIGIN}/i/{id}.{ext}[/img][/url]`
   * **Baris 3 — Markdown / Thumbnail HTML Link:**
     * Format: `[![{filename}]({ORIGIN}/i/{id}.{ext})]({ORIGIN}/i/{id}.{ext})`
   * **Baris 4 — Deletion Link (Tautan Hapus):**
     * Format: `{ORIGIN}/delete/{delete_token}`
     * *Fungsi:* Ketika URL ini dibuka, pengguna diarahkan ke halaman konfirmasi penghapusan gambar dari database Neon.

### C. State 3: Recent Uploads / Local Vault (Fitur Tambahan Opsional di Bawah)
* Menyimpan riwayat unggahan pengguna di `localStorage` browser agar pengguna tetap bisa melihat daftar gambar dan *delete link* milik mereka meskipun halaman di-*refresh*.

---

## 6. Backend API & Routing Architecture

AI Agent harus mengimplementasikan *endpoints* berikut di Next.js App Router:

1. **`POST /api/upload`**
   * Menerima `FormData` (file gambar) atau JSON (`imageUrl` untuk fitur upload via URL).
   * Memvalidasi tipe file (`image/jpeg`, `image/png`, `image/gif`, `image/webp`, `image/svg+xml`) dan ukuran (maksimal 5MB agar performa database tetap cepat).
   * Mengonversi `ArrayBuffer` gambar menjadi string `base64`.
   * Menghasilkan `id` unik (contoh: `p_` + 10 karakter acak) dan `delete_token` (32 karakter hex).
   * Menyimpan data ke tabel `uploads` di Neon PostgreSQL.
   * Mengembalikan respons JSON berisi semua metadata dan URL.

2. **`GET /i/[slug]/route.ts` (Direct Image Delivery Endpoint — KRUSIAL)**
   * Menangkap parameter `[slug]` (misal: `p_3953los8e1.jpg`), memisahkan `id` (`p_3953los8e1`) dari ekstensinya.
   * Mengambil `image_data` (base64) dan `mime_type` dari database Neon berdasarkan `id`.
   * Mengonversi kembali `base64` menjadi `Buffer` biner: `Buffer.from(record.image_data, 'base64')`.
   * Mengembalikan `new NextResponse(buffer)` dengan HTTP Headers:
     * `Content-Type`: sesuai `mime_type` (misal `image/jpeg`)
     * `Cache-Control`: `public, max-age=31536000, immutable`
   * *Hasil:* Saat URL `http://localhost:3000/i/p_3953los8e1.jpg` dibuka di tab baru atau dipanggil lewat kode HTML, browser menampilkannya murni sebagai file gambar *live*.

3. **`GET & DELETE /delete/[token]`**
   * Halaman `src/app/delete/[token]/page.tsx` menampilkan pratinjau gambar yang akan dihapus beserta tombol merah menyala `[ TERMINATE FILE ]`.
   * Saat dikonfirmasi, memanggil endpoint `DELETE /api/delete/[token]` untuk menghapus baris dari database Neon secara permanen.

---

## 7. UI/UX & Framer Motion 3D Specifications (Cyberpunk Aesthetic)

Pastikan antarmuka tidak terlihat datar (flat). Gunakan **Framer Motion** secara maksimal:
* **3D Perspective Container:** Bungkus kartu utama dengan `perspective: 1200px`. Gunakan *mouse tracking* (`onMouseMove`) dengan `useMotionValue` dan `useSpring` pada Framer Motion untuk memiringkan kartu (`rotateX` dan `rotateY` antara `-8deg` hingga `8deg`) mengikuti pergerakan kursor pengguna.
* **Layered 3D Depth (`translateZ`):** Berikan properti `style={{ transform: "translateZ(40px)" }}` pada elemen di dalam kartu (seperti *thumbnail* gambar, QR Code, dan tombol upload) agar terlihat melayang secara 3D di atas latar kartu utama.
* **Cyberpunk Background Grid:** Buat latar belakang *grid* perspektif 3D bergerak di bagian bawah layar (menggunakan CSS / Framer Motion) dengan efek *glow* cyan dan magenta.
* **Glitch & Scanline Effects:** Tambahkan overlay *scanline* CRT tipis (`pointer-events-none`) dan animasi *hover* bergaya *cyber-cut* (sudut terpotong `clip-path: polygon(...)`) pada setiap tombol dan kotak input.

---

## 8. Implementation Steps for AI Agent
1. Inisialisasi proyek Next.js (App Router) dan instal dependensi: `framer-motion`, `@neondatabase/serverless`, `lucide-react`, `qrcode.react`, `clsx`, `tailwind-merge`.
2. Buat koneksi database di `src/lib/db.ts` menggunakan `@neondatabase/serverless` dan jalankan fungsi auto-migrasi `CREATE TABLE IF NOT EXISTS uploads...` agar tabel langsung siap tanpa setup manual.
3. Buat Route Handler `src/app/api/upload/route.ts` untuk menangani unggahan file lokal maupun tarik dari URL.
4. Buat Route Handler `src/app/i/[slug]/route.ts` untuk menyajikan gambar secara *live* di browser melalui URL langsung.
5. Buat Route Handler `src/app/api/delete/[token]/route.ts` dan halaman UI `src/app/delete/[token]/page.tsx` untuk fitur penghapusan gambar.
6. Bangun halaman utama `src/app/page.tsx` dengan animasi 3D Framer Motion penuh, menggabungkan panel Upload (Referensi 1) dan panel Hasil Unggahan beserta QR Code & 4 jenis link (Referensi 2).
7. Pastikan semua fungsi *Copy to Clipboard*, pratinjau gambar langsung, dan pemanggilan URL gambar bekerja tanpa error.