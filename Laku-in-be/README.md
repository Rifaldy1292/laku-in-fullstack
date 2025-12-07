# Laku-in (Backend)

Ringkasan singkat: backend `laku-in-be` dibangun dengan NestJS dan Prisma. Repo ini menyediakan API untuk aplikasi Laku-in termasuk modul produk, transaksi, voice-ai, WhatsApp integration, dan lainnya.

**Kebutuhan**:

- Node.js >= 18
- npm atau pnpm
- PostgreSQL (atau database lain sesuai `DATABASE_URL` di `.env`)

**Langkah Setup**

1. Salin file environment dan edit variabelnya:
   - Copy contoh: `cp .env.example .env` (jika tersedia) atau buat file `.env`.

2. Install dependensi:

   ```bash
   npm install
   ```

3. Generate Prisma client:

   ```bash
   npx prisma generate
   ```

4. Jalankan migrasi database (development):

   ```bash
   npx prisma migrate dev
   ```

5. Menjalankan server:
   - Development (hot-reload):

     ```bash
     npm run start:dev
     ```

   - Production:

     ```bash
     npm run build
     npm run start:prod
     ```

**Variabel Environment Penting**

- `DATABASE_URL` — connection string database (Postgres contoh: `postgresql://user:pass@host:port/dbname`)
- `PORT` — port server (default NestJS 3000 jika tidak diset)
- OAuth / third-party keys (WhatsApp, OpenAI, dsb.) — lihat `src/*` untuk variabel lain yang diperlukan

Letakkan semua variabel sensitif di file `.env` dan jangan commit ke git.

**Contoh `.env` (masukkan ke file `.env` — jangan commit)**

Salin contoh di bawah ini ke file `.env` di root project lalu sesuaikan dengan kredensial lokal Anda:

```bash
# Example .env for laku-in-be (placeholders only — replace values)
DATABASE_URL="mysql://<DB_USER>:<DB_PASS>@<DB_HOST>:<DB_PORT>/<DB_NAME>"
PORT=4000

# JWT tokens
ACCESS_TOKEN_SECRET=<your_access_token_secret>
ACCESS_TOKEN_TTL=1d
REFRESH_TOKEN_SECRET=<your_refresh_token_secret>
REFRESH_TOKEN_TTL=7d

# Cookie
COOKIE_DOMAIN=localhost

# Node environment
NODE_ENV=development

# CORS
CORS_ORIGIN=http://localhost:3000

# Third-party service keys / endpoints (replace with your real keys)
LUNOS_API_KEY=<your_lunos_api_key>
LUNOS_API_URL=https://api.lunos.tech/v1
UNLI_API_KEY=<your_unli_api_key>
UNLI_API_URL=https://api.unli.dev/v1
MAILRY_API_KEY=<your_mailry_api_key>
MAILRY_SENDER_ID=<your_mailry_sender_id>
KOLOSAL_API_KEY=<your_kolosal_api_key>
KOLOSAL_URL=https://api.kolosal.ai/v1

# Add any other keys used in your environment below
# e.g. WHATSAPP_API_KEY=<value>
```

Pastikan file `.env` tidak di-track oleh git. Jika perlu, tambahkan `.env` ke `.gitignore`.

**Prisma**

- Skema berada di `prisma/schema.prisma`.
- Untuk membuat migrasi baru setelah perubahan model:

  ```bash
  npx prisma migrate dev --name your_migration_name
  npx prisma generate
  ```

**Scripts (ringkasan `package.json`)**

- `npm run start:dev` — jalankan NestJS dengan hot-reload (development)
- `npm run build` — build project
- `npm run start:prod` — jalankan build (production)
- `npm run test` — jalankan unit tests
- `npx prisma migrate dev` — apply migrations & update client

**Run lokal cepat**

1. Pastikan `DATABASE_URL` valid dan DB dapat diakses.
2. `npm install`
3. `npx prisma migrate dev`
4. `npm run start:dev`

**Catatan pengembangan**

- Struktur utama service ada di `src/` (modul seperti `products`, `transactions`, `voice-ai`, `whatsapp`, dll.).
- Module Prisma ada di `src/prisma/`.
- Gunakan `src/utils/logger.ts` untuk logging konsisten.
