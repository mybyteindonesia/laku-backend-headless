# Setup Guide: Supabase & Google Cloud (Sheets API)

Panduan ini akan membantu kamu mempersiapkan infrastruktur backend (Supabase) dan integrasi Google Sheets.

---

## BAGIAN 1: Supabase Setup (Database)

Kita menggunakan Supabase sebagai database utama untuk menyimpan data Leads (orang yang mau jual HP) dan menyimpan copy data harga.

### 1. Buat Project Baru
1. Buka [database.new](https://database.new) (redirect ke Supabase).
2. Login dengan GitHub atau Email.
3. Klik **"New Project"**.
4. Isi form:
   - **User**: Pilih organization kamu (default).
   - **Name**: `mybyte-kaitori` (atau nama lain yang kamu suka).
   - **Database Password**: **PENTING!** Simpan password ini di password manager / notes kamu. Jangan sampai hilang.
   - **Region**: Pilih yang dekat dengan user target. Jika targetnya Indonesia/Jepang, **Singapore** (Southeast Asia) atau **Tokyo** (Northeast Asia) adalah pilihan terbaik.
5. Klik **"Create new project"**. Tunggu 1-2 menit sampai setup selesai (Status berubah jadi hijau *"Active"*).

### 2. Dapatkan API Keys (Penting untuk Coding)
Setelah project aktif:
1. Di sidebar kiri, klik icon **Settings** (roda gigi) -> Pilih **API**.
2. Di bagian "Project URL", copy **URL** tersebut.
   - *Simpan sebagai: `NEXT_PUBLIC_SUPABASE_URL`*
3. Di bagian "Project API keys", cari yang **`anon`** `public`. Copy kodenya.
   - *Simpan sebagai: `NEXT_PUBLIC_SUPABASE_ANON_KEY`*

> **Catatan:** Jangan bagikan `service_role` key (secret) sembarangan. Kita hanya butuh yang `anon` untuk frontend nanti.

---

## BAGIAN 2: Google Cloud Service Account (Untuk Google Sheets)

Ini dibutuhkan agar sistem kita bisa "membaca" harga yang kamu edit di Google Sheets secara otomatis.

### 1. Buat Project di Google Cloud
1. Buka [Google Cloud Console](https://console.cloud.google.com/).
2. Di pojok kiri atas (sebelah logo Google Cloud), klik dropdown project -> **"New Project"**.
3. Beri nama: `MyByte Kaitori Website`.
4. Klik **Create**. Pastikan project tersebut yang sedang terpilih sekarang.

### 2. Aktifkan Google Sheets API
1. Di sidebar kiri, pilih **APIs & Services** -> **Enabled APIs & services**.
2. Klik tombol **"+ ENABLE APIS AND SERVICES"** di atas.
3. Cari / Search: **"Google Sheets API"**.
4. Klik hasilnya, lalu klik tombol **Enable**.

### 3. Buat Service Account (Robot Akun)
1. Setelah API aktif, kembali ke menu **APIs & Services** -> **Credentials**.
2. Klik **"+ CREATE CREDENTIALS"** (di atas) -> Pilih **Service Account**.
3. **Step 1 (Details)**:
   - Name: `sheets-reader`
   - Description: `Untuk baca harga dari Google Sheets Kaitaori`
   - Klik **Create and Continue**.
4. **Step 2 (Permissions)**:
   - Role: Cari dan pilih **"Viewer"** (Basic -> Viewer). Kita cuma butuh baca, gak perlu edit.
   - Klik **Continue**.
5. **Step 3**: Kosongkan saja, klik **Done**.

### 4. Download Kunci Rahasia (JSON)
1. Di halaman Credentials tadi, di bagian "Service Accounts", klik email service account yang baru dibuat (bentuknya mirip: `sheets-reader@mybyte-kaitori-website.iam.gserviceaccount.com`).
2. Masuk ke tab **KEYS**.
3. Klik **ADD KEY** -> **Create new key**.
4. Pilih format **JSON**.
5. Klik **Create**. File akan otomatis ter-download ke komputer kamu.
6. **Rename file ini menjadi:** `service-account.json`.
   - *Nanti file ini akan kita masukkan ke folder project codingan.*

### 5. Share Google Sheet ke Service Account (CRITICAL STEP)
Langkah ini sering terlupa dan bikin error.
1. Buka file Google Sheets yang berisi data harga kamu (atau buat Sheet baru kosong dulu).
2. Klik tombol **Share** (pojok kanan atas Sheet).
3. Di kolom "Add people", copas **Email Service Account** tadi (yang berakhiran `...gserviceaccount.com`).
4. Pastikan permissionnya **Viewer**.
5. Klik **Send** / **Share**.
6. **Copy ID Google Sheet kamu**.
   - ID ada di URL, antara `/d/` dan `/edit`.
   - Contoh: `docs.google.com/spreadsheets/d/`**`1xYz_ini_adalah_id_sheet_kamu_123`**`/edit`
   - Simpan ID ini, nanti kita butuh di kodingan.

---

## Ringkasan yang harus kamu simpan:
1. **Supabase URL**
2. **Supabase Anon Key**
3. **File `service-account.json`**
4. **Google Sheet ID**

Jika semua sudah siap, kita bisa mulai coding!
