# Ruang Dosen - Changelog (Sprint / fe-dashboard)

Dokumen ini berisi rangkuman seluruh perubahan yang telah dilakukan pada direktori `apps/api` (Backend) dan `apps/web` (Frontend) sejak awal melakukan *pull* dari branch `origin/develop` hingga saat ini.

---

## 🌐 Perubahan pada Frontend (`apps/web`)

1. **Halaman Login Baru (`app/login`)**
   - Mengimplementasikan desain statis `login.html` menjadi komponen Next.js (`page.tsx`).
   - Menyertakan validasi form dasar dan integrasi visual.

2. **Dashboard Dosen (`app/dashboard_dosen`)**
   - Membuat tampilan antarmuka (UI) interaktif untuk Dashboard Dosen.
   - Fitur utama meliputi:
     - Ringkasan statistik (Mata Kuliah Aktif, Total Mahasiswa, Tugas Pending, Proyek Riset).
     - Daftar Mata Kuliah yang diampu beserta indikator perkembangan silabus (Syllabus Completion).
     - Panel *Recent Submissions* untuk melihat tugas mahasiswa yang baru dikirim dan statusnya (Perlu Ditinjau / Sudah Dinilai).
   - Pemisahan styling khusus pada `dashboard.css` dengan variabel tema (*design tokens*).

3. **Dashboard Admin (`app/dashboard_admin`)**
   - Menduplikasi dan mengadaptasi *layout* Dashboard Dosen khusus untuk kebutuhan Administrator.
   - Fitur utama meliputi:
     - Ringkasan statistik platform (*Total Mata Kuliah, Total Dosen, Total Mahasiswa, Tugas Pending*).
     - Warna aksen merah (*red/purple gradient*) untuk membedakan secara visual dari Dashboard Dosen.
     - Akses manajemen global (Dosen, Mahasiswa, Seluruh Mata Kuliah).

4. **Dashboard Mahasiswa (`app/dashboard_mahasiswa`)**
   - Membuat antarmuka Dashboard Mahasiswa yang mencakup ringkasan metrik (Overall Progress, Completed Modules, Pending Assignments).
   - Menampilkan daftar Mata Kuliah Aktif beserta progres belajar (*progress bar*).
   - Menambahkan panel *Deadlines* dan statistik mini (GPA dan Peringkat).

5. **Penyelarasan Desain Sidebar Navigasi (Seluruh Dashboard)**
   - Menyamakan struktur navigasi sidebar di ketiga dashboard (Dosen, Admin, Mahasiswa) menjadi lebih minimalis (Dashboard, Courses, Calendar, Resources).
   - Memperbarui gaya indikator menu aktif (*blue edge line* dan latar biru muda) tanpa label kategori yang terkesan penuh.

6. **Routing Halaman Utama (`app/page.tsx`)**
   - Memperbarui halaman utama (root `/`) agar secara otomatis me-redirect pengunjung langsung ke halaman `/login`.

7. **Perbaikan Bug & Fitur Dosen (Course Management)**
   - Menonaktifkan fitur "Create Quiz" karena berada di luar cakupan saat ini.
   - Memperbaiki style tombol disabled pada komponen `.btn-link` agar dirender dengan benar.
   - Memperbaiki bug "Silent Failure" saat edit/hapus modul dan material pada course yang berasal dari API (state lokal `MANAGE_COURSE_OVERRIDES` sekarang diinisialisasi otomatis).
   - Memperbaiki kompatibilitas Next.js 16 pada `revalidateTag` yang sebelumnya menyebabkan error kompilasi TypeScript.
   - Memperbaiki Editor Tugas (Assignment Editor) yang sebelumnya statis; menambahkan fungsi server actions untuk membuat, menyimpan, dan menghapus tugas, serta menghubungkannya ke mock data `lecturerCourseManagement.ts`.
   - Menghindari *Error Overlay* (layar merah) bawaan Next.js 16 di mode development saat API backend offline dengan merubah `console.error` menjadi `console.warn` pada proses fallback fetch data layout dan material.

---

## ⚙️ Perubahan pada Backend (`apps/api`)

1. **Perbaikan E2E Tests (`test/admin.e2e-spec.ts`)**
   - Memperbaiki error TypeScript (*Strict Null Checks* - `Object is possibly 'null'`) pada file `admin.e2e-spec.ts`.
   - Menambahkan *non-null assertion* (`!`) pada `adminRecord!.id` dan `studentRecord!.id` untuk memastikan pengujian E2E dapat di-compile dengan sukses.

2. **Pembaruan Dependensi (`package.json` & `package-lock.json`)**
   - Menyelesaikan masalah kerentanan (vulnerability) dari proses `npm install` dengan melakukan pembaruan versi (bump version) pada library NestJS.
   - Menambahkan script `dev` untuk kemudahan menjalankan server development.

   **Detail Perubahan `apps/api/package.json`**:
   
   *Sebelum:*
   ```json
     "scripts": {
       "build": "nest build",
       "format": "prettier --write \"src/**/*.ts\" \"test/**/*.ts\"",
   ```
   *Sesudah:*
   ```json
     "scripts": {
       "dev": "npm run start:dev",
       "build": "nest build",
       "format": "prettier --write \"src/**/*.ts\" \"test/**/*.ts\"",
   ```

   *Sebelum:*
   ```json
     "dependencies": {
       "@nestjs/common": "^11.0.1",
       "@nestjs/core": "^11.0.1",
       "@nestjs/jwt": "^11.0.2",
       "@nestjs/passport": "^11.0.5",
       "@nestjs/platform-express": "^11.0.1",
       "@nestjs/swagger": "^11.4.3",
   ```
   *Sesudah:*
   ```json
     "dependencies": {
       "@nestjs/common": "^11.0.1",
       "@nestjs/core": "^11.0.1",
       "@nestjs/jwt": "^11.0.2",
       "@nestjs/passport": "^11.0.5",
       "@nestjs/platform-express": "^11.1.24",
       "@nestjs/swagger": "^11.4.3",
   ```

   **Detail Perubahan `package-lock.json` (Root)**:
   - Terjadi pembaruan otomatis referensi dependencies turunan dari `platform-express` yang menambal kerentanan (seperti *multer* dan *cors*):
   
   *Sebelum:*
   ```json
       "node_modules/@nestjs/platform-express": {
         "version": "11.0.1",
         "resolved": "https://registry.npmjs.org/@nestjs/platform-express/-/platform-express-11.0.1.tgz",
         "dependencies": {
           "cors": "^2.8.5",
           "multer": "^1.4.4"
         }
       }
   ```
   *Sesudah:*
   ```json
       "node_modules/@nestjs/platform-express": {
         "version": "11.1.24",
         "resolved": "https://registry.npmjs.org/@nestjs/platform-express/-/platform-express-11.1.24.tgz",
         "dependencies": {
           "cors": "^2.8.5",
           "multer": "1.4.5-lts.1"
         }
       }
   ```

---

*Catatan: Pembaruan versi awal dashboard telah di-commit ke repositori. Berikut adalah catatan pembaruan lanjutan yang telah diintegrasikan.*

---

## 🚀 Pembaruan Lanjutan (Pasca Pembuatan Dashboard)

1. **Integrasi Backend API Secara Penuh**
   - Menghapus seluruh data *mock* lokal yang sebelumnya digunakan di folder `apps/web/lib/mock/`.
   - Mengubah alur pengambilan data (Fetch) menggunakan endpoint API sungguhan melalui modul terpusat (`courseApi.ts` dan `courseRepository.ts`).
   - Melakukan pembaruan pada tipe data (`apps/web/lib/types/course.ts`) agar 100% sinkron dengan skema database (Prisma Schema).

2. **Pengembangan Fitur Kuis & Lab**
   - Menyelesaikan UI/UX untuk sistem Kuis beserta integrasinya.
   - Menggabungkan *branch Labs*, menambahkan komponen khusus seperti *Lab Detail*, *Lab List*, *Quiz Workspace*, serta sistem pengumpulan tugas praktikum (*Task Detail and Submit*).

3. **Penyempurnaan Tampilan & Komponen Global (UI Polish)**
   - Menstandarkan layout untuk Dosen dengan menghapus *layout* lama (`DosenDashboardLayout`) dan menggunakan antarmuka seragam berbasis `AppShell`.
   - Memoles elemen navigasi utama (`SideNavBar`, `TopNavBar`, dan `Footer`) serta menstabilkan layout untuk Dashboard Mahasiswa.
   - Melakukan *refactoring* CSS pada masing-masing *dashboard* (Admin, Dosen, Mahasiswa) untuk memastikan gaya visual responsif dan konsisten.

4. **Perbaikan Bug, Penyesuaian Route & Stabilitas Codebase**
   - Memperbaiki sejumlah bug kecil, penyesuaian rute endpoint, dan menyelesaikan *silent failures* pada komponen manajemen kursus dosen.
   - Mengatasi error kompilasi yang disebabkan oleh ketidaksesuaian tipe Prisma.
   - Menambahkan skrip bantu `fix-tests.js` dan melakukan optimasi *dependency lock* (`package-lock.json`).

5. **Redesign Halaman Autentikasi & Pembuatan Fitur Registrasi**
   - Mengubah desain antarmuka halaman Login menjadi lebih modern (*premium UI*) dengan skema warna *blue gradient*, efek *glassmorphism* pada navbar, dan komponen input yang interaktif (`login.css`).
   - Membuat halaman Registrasi baru (`app/register`) yang terhubung penuh dengan endpoint API backend `POST /auth/register`. Form pendaftaran mencakup validasi Role (Mahasiswa/Dosen/Admin).
   - Memperbaiki logika API backend pada `GET /courses/my` (di `course.service.ts`) agar Dosen dapat melihat daftar mata kuliah yang diajarkannya secara akurat.
   - Mengembangkan skrip verifikasi *End-to-End* (`verify_register_flow.js`) yang secara otomatis menguji suksesnya alur registrasi, pembuatan token, hingga *enrollment* mahasiswa oleh dosen.


admin@test.com	password123
dosen@test.com	password123
student@test.com	password123