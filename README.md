# image-upload

A sleek, fast, and modern image upload platform built with Next.js, Tailwind CSS, Framer Motion, and Neon PostgreSQL.

## Features

- ⚡ **Instant Image Upload**: Upload images via drag & drop, file picker, clipboard paste (`Ctrl+V`), or remote URL.
- 🔗 **Multiple Link Formats**:
  - Direct Link
  - HTML Embed (`<img />`)
  - Markdown (`![alt](url)`)
  - BBCode (`[img]url[/img]`)
  - Private Deletion Link
- 📱 **QR Code Matrix**: Scan directly from mobile devices.
- 🔒 **Privacy Focused**: Automatic EXIF metadata scrubbing.
- 🎨 **Modern Aesthetic**: Ultra-lightweight dark theme with smooth solid borders.

## Tech Stack

- **Framework**: Next.js 15 (App Router, React 19)
- **Styling**: Tailwind CSS & Lucide Icons
- **Database**: Neon Serverless PostgreSQL (`@neondatabase/serverless`)
- **Animation**: Framer Motion & GSAP

## Getting Started

1. Clone repository:
   ```bash
   git clone https://github.com/Alvinhidayatullah/image-upload.git
   cd image-upload
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Setup environment variables:
   Copy `.env.example` to `.env.local` and set your database connection:
   ```env
   DATABASE_URL="your_neon_postgresql_url"
   NEXT_PUBLIC_APP_URL="http://localhost:3000"
   ```

4. Run development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.
