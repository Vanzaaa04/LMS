# 🏫 Platform E-Learning & Praktikum: AFADIA Academy

**AFADIA Academy** adalah platform Learning Management System (LMS) interaktif yang dirancang khusus untuk mengelola perkuliahan, kuis berbasis gamifikasi, pengerjaan tugas, dan sesi praktikum laboratorium (Asisten Laboratorium/Aslab). Platform ini mengintegrasikan peran Administrator (Admin), Dosen/Pengajar (Lecturer), dan Mahasiswa (Student) dalam satu ekosistem monorepo yang responsif, modern, dan andal.

Aplikasi ini tidak hanya berfungsi sebagai pengelola kelas, tetapi juga menawarkan pengalaman belajar modern dengan menerapkan **Sistem Notifikasi Real-time**, **Kalender Akademik Terintegrasi**, dan pendekatan gamifikasi menggunakan **XP (Experience Points)**.

---

## 🛠️ Stack Teknologi & Arsitektur

Proyek ini dibangun menggunakan arsitektur Monorepo berbasis **Turborepo** dengan detail stack sebagai berikut:
- **Frontend (`apps/web`)**: Next.js 15+ (App Router), React, Lucide Icons, Tailwind CSS, dan Vanilla CSS Custom UI.
- **Backend (`apps/api`)**: NestJS (TypeScript framework), JWT Authentication, Passport.js.
- **Database & ORM**: PostgreSQL sebagai database relasional utama dan Prisma ORM untuk pemodelan data & migrasi.
- **Task Runner**: Turborepo (`turbo`) untuk orkestrasi build, dev, dan lint.

---

## 🔐 Kredensial Akun Pengujian (Login Credentials)

Untuk memudahkan pengujian fungsionalitas di setiap role, gunakan akun-akun bawaan berikut yang telah di-seed ke dalam database:

### Akun Pengujian Utama (Domain @ruangdosen.ac.id)
| Role | Email | Password | Nama Pengguna / Deskripsi |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@ruangdosen.ac.id` | `password123` | Admin AFADIA Academy |
| **Dosen** | `dosen@ruangdosen.ac.id` | `password123` | Dr. Aris Setiawan |
| **Mahasiswa** | `mahasiswa@ruangdosen.ac.id` | `password123` | Budi Santoso |

---

## 🚀 Panduan Detail Menjalankan Aplikasi (Setup & Run)

Ikuti langkah-langkah di bawah ini secara berurutan untuk memasang dan menjalankan aplikasi di lingkungan lokal Anda.

### 1. Prasyarat Sistem
Pastikan perangkat Anda sudah terinstal:
- **Node.js** (Rekomendasi versi 18 ke atas)
- **NPM** (Bawaan Node.js) atau Yarn
- **PostgreSQL** (Pastikan service database berjalan di port `5432`)

### 2. Konfigurasi Environment Variables (`.env`)

1. Buka direktori backend: `apps/api/`
2. Buat file baru bernama `.env` (atau salin dari `.env.example`).
3. Isi file `.env` tersebut dengan variabel berikut:
   ```env
   DATABASE_URL="postgresql://postgres:admin123@localhost:5432/ruang_dosen"
   JWT_SECRET="ruang-dosen-secret-key-2024"
   PORT=3001
   ```
   *Catatan: Ganti parameter URL postgres di atas sesuai dengan username, password, dan nama database PostgreSQL lokal Anda.*

### 3. Instalasi Dependency
Kembali ke root direktori proyek, lalu jalankan instalasi:
```bash
npm install
```

### 4. Setup Database & Prisma (Migration & Seed)
Jalankan urutan perintah di bawah ini untuk membuat tabel database dan mengisi data awal (seeding) ke PostgreSQL:

1. **Jalankan Migrasi Database**:
   ```bash
   npx prisma migrate dev --schema=apps/api/prisma/schema.prisma
   ```

2. **Jalankan Seeding Data**:
   ```bash
   npx prisma db seed --schema=apps/api/prisma/schema.prisma
   ```

### 5. Menjalankan Server Development
Untuk menjalankan frontend (Next.js) dan backend (NestJS) secara paralel, jalankan perintah berikut di root proyek:
```bash
npm run dev
```

Server akan aktif pada alamat berikut:
- **Frontend (Web Application)**: [http://localhost:3000](http://localhost:3000)
- **Backend (REST API)**: [http://localhost:3001](http://localhost:3001)

---

## 📈 Alur Kerja & Langkah Penggunaan Aplikasi (Application Workflow)

### 1. Navigasi & Hak Akses Berbasis Role (Role-Based Access)
- **Mahasiswa**: Mengakses menu *Available Courses* (Katalog Kelas Tersedia), *My Courses* (Kelas Aktif), *Calendar*, *Resources*, dan *Leaderboard*. Profil mahasiswa dilengkapi dengan avatar estetik.
- **Dosen**: Mengelola kelas (*Manage Courses*), membuat modul pembelajaran, tugas, praktikum (Lab), dan kuis.
- **Admin**: Memantau dashboard global, serta menambah atau menghapus akses *Users*.

### 2. Pilar 1 — Manajemen Kelas & Materi (Course & Learning Materials)
- **Pembuatan Kelas (Dosen)**: Dosen membuat kelas baru beserta deskripsi, SKS, kuota, dan semester. 
- **Pendaftaran Kelas (Mahasiswa)**: Mahasiswa mencari kelas di halaman **Katalog Kelas (Available Courses)** lalu mendaftar (*Enroll*). Kelas yang berhasil di-enroll akan berpindah secara otomatis ke **My Courses** agar terhindar dari tumpang tindih.
- **Penyampaian Materi**: Dosen menyusun *Module* yang berisi materi berformat teks, video, atau dokumen PDF yang dapat dibaca dan diunduh langsung oleh mahasiswa.

### 3. Pilar 2 — Tugas & Praktikum Laboratorium (Assignments & Labs)
- **Penerbitan Tugas (Dosen)**: Dosen memberikan tugas atau praktikum dengan **batas waktu (deadline)**, **batas maksimal percobaan kumpul (Max Attempts)**, dan metode penilaian akhir (**Grading Method: Highest Score / Latest Attempt**).
- **Pengumpulan & Evaluasi (Mahasiswa)**: Mahasiswa mengunggah file tugas (PDF/dll). Status pengumpulan dilacak sangat akurat: dari *Pending* (menunggu dinilai) hingga *Graded* (sudah dinilai).
- **Pemberian Nilai**: Dosen memeriksa file kiriman mahasiswa lalu memberikan skor akhir dan kolom *Feedback* yang otomatis tampil di layar mahasiswa.

### 4. Pilar 3 — Kuis Interaktif & Gamifikasi (Interactive Quizzes & Leaderboard)
- **Pembuatan Kuis**: Dosen menentukan durasi kuis, nilai minimal kelulusan (KKM), reward XP, serta opsi pembatasan pengerjaan berulang (*Max Attempts*).
- **Pengerjaan Live Timer**: Mahasiswa mengerjakan kuis pilihan ganda yang dinilai secara otomatis oleh server (*Auto-Scoring*).
- **Gamifikasi (Leaderboard)**: Mahasiswa yang lulus kuis (Skor ≥ KKM) mendapatkan *Experience Points (XP)*. XP ini akan diadu secara global pada papan *Leaderboard* bergaya kompetitif.

### 5. Pilar 4 — Sistem Pintar (Calendar & Notifications)
- **Sistem Notifikasi Global**: Bell Icon di panel navigasi akan memperlihatkan daftar pengingat *real-time* kepada pengguna.
- **Kalender Akademik Terpusat (Backend Integrated)**: Mahasiswa & Dosen memiliki akses ke kalender digital. Deadline Tugas, Praktikum, dan Kuis otomatis terpampang di kalender (warna merah/hijau) berdasarkan data dari *Database Server*, membantu pengguna mengatur manajemen waktu.

---

## 🗄️ Relational Model & DDL (Data Definition Language) Export
Jika Anda ingin melihat atau mendemonstrasikan Diagram Relasional (ERD) proyek ini di alat bantu pihak ketiga seperti **Oracle SQL Developer Data Modeler**:
1. Gunakan file `clean_ddl.sql` yang berada di folder utama proyek. File ini sudah dibersihkan dari *syntax* PostgreSQL spesifik (seperti Enum & Create Schema) agar kompatibel 100% dengan standar Oracle Data Modeler.
2. Di Oracle Data Modeler, klik **File -> Import -> DDL File**.
3. Pilih `clean_ddl.sql` dan set dialek ke Oracle Database 21c/12c. Relasi dan struktur tabel akan langsung tergambar.
