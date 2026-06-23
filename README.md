# 🏫 Platform E-Learning & Praktikum: Ruang Dosen

**Ruang Dosen** adalah platform Learning Management System (LMS) interaktif yang dirancang khusus untuk mengelola perkuliahan, kuis berbasis gamifikasi, pengerjaan tugas, dan sesi praktikum laboratorium (Asisten Laboratorium/Aslab). Platform ini mengintegrasikan peran Administrator (Admin), Dosen/Pengajar (Lecturer), dan Mahasiswa (Student) dalam satu ekosistem monorepo yang responsif, modern, dan andal.

Aplikasi ini menggunakan pendekatan gamifikasi dengan menerapkan **XP (Experience Points)**, di mana mahasiswa mengumpulkan XP dari kuis yang berhasil diselesaikan untuk memperebutkan posisi tertinggi di papan peringkat (Leaderboard) global.

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

### 1. Akun Pengujian Utama (Domain @ruangdosen.ac.id)
| Role | Email | Password | Nama Pengguna / Deskripsi |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@ruangdosen.ac.id` | `password123` | Admin Ruang Dosen (Manajemen Platform) |
| **Dosen** | `dosen@ruangdosen.ac.id` | `password123` | Dr. Aris Setiawan (Pengampu Pemrograman Web) |
| **Dosen 2** | `dosen2@ruangdosen.ac.id` | `password123` | Prof. Heru Prasetyo |
| **Mahasiswa 1** | `mahasiswa@ruangdosen.ac.id` | `password123` | Budi Santoso (Mahasiswa Aktif) |
| **Mahasiswa 2** | `mahasiswa2@ruangdosen.ac.id` | `password123` | Siti Aminah (Mahasiswa Aktif) |

### 2. Akun Kompatibilitas Pengujian E2E (Domain @test.com)
| Role | Email | Password | Nama Pengguna |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@test.com` | `password123` | Admin Kampus |
| **Dosen** | `dosen@test.com` | `password123` | Dosen Ariel |
| **Mahasiswa** | `student@test.com` | `password123` | Mahasiswa Rajin |

---

## 🚀 Panduan Detail Menjalankan Aplikasi (Setup & Run)

Ikuti langkah-langkah di bawah ini secara berurutan untuk memasang dan menjalankan aplikasi di lingkungan lokal Anda.

### 1. Prasyarat Sistem
Pastikan perangkat Anda sudah terinstal:
- **Node.js** (Rekomendasi versi 18 ke atas)
- **NPM** (Bawaan Node.js) atau Yarn
- **PostgreSQL** (Pastikan service database berjalan di port `5432`)

---

### 2. Konfigurasi Environment Variables (`.env`)

Sebelum menjalankan aplikasi, Anda wajib membuat dan mengonfigurasi berkas `.env` pada folder backend agar koneksi database dan JWT dapat berjalan.

1. Buka direktori backend: `apps/api/`
2. Buat file baru bernama `.env` (atau salin dari `.env.example` jika tersedia).
3. Isi file `.env` tersebut dengan variabel berikut:
   ```env
   DATABASE_URL="postgresql://postgres:admin123@localhost:5432/ruang_dosen"
   JWT_SECRET="ruang-dosen-secret-key-2024"
   PORT=3001
   ```
   *Catatan: Ganti parameter URL postgres di atas sesuai dengan username, password, dan nama database PostgreSQL lokal Anda.*

---

### 3. Instalasi Dependency
Kembali ke root direktori proyek, lalu jalankan perintah instalasi berikut untuk mengunduh semua package dependency yang dibutuhkan frontend dan backend:
```bash
npm install
```

---

### 4. Setup Database & Prisma (Migration & Seed)
Jalankan urutan perintah di bawah ini untuk membuat tabel database dan mengisi data awal (seeding) ke PostgreSQL:

1. **Jalankan Migrasi Database**:
   ```bash
   npx prisma migrate dev --schema=apps/api/prisma/schema.prisma
   ```
   Perintah ini akan membuat struktur tabel di PostgreSQL sesuai dengan skema Prisma.

2. **Jalankan Seeding Data**:
   Jalankan script seed untuk memasukkan akun pengguna, mata kuliah, materi, kuis, dan data dummy pengujian:
   ```bash
   npx prisma db seed --schema=apps/api/prisma/schema.prisma
   ```

---

### 5. Menjalankan Server Development
Untuk menjalankan frontend (Next.js) dan backend (NestJS) secara paralel secara bersamaan, jalankan perintah berikut di root direktori proyek:
```bash
npm run dev
```

Server akan aktif pada alamat berikut:
- **Frontend (Web Application)**: [http://localhost:3000](http://localhost:3000)
- **Backend (REST API)**: [http://localhost:3001](http://localhost:3001)

---

## 📈 Alur Kerja & Langkah Penggunaan Aplikasi (Application Workflow)

Berikut adalah alur penggunaan aplikasi secara berurutan berdasarkan pilar fitur utama dan interaksi antar-pengguna:

### 1. Registrasi Akun & Autentikasi (Auth Gate)
- **Daftar Akun**: Pengguna baru yang belum terdaftar dapat membuka halaman `/register`, memasukkan nama lengkap, email, password, dan memilih *Role* (Mahasiswa / Dosen / Admin). Password akan dienkripsi secara aman menggunakan *bcrypt* di server.
- **Masuk Ke Sistem**: Pengguna mengakses `/login` dan memasukkan email serta password. Sistem akan mengembalikan JWT token yang disimpan di dalam `sessionStorage` sebagai otorisasi akses menu terlindungi.
- **Menu Navigasi Dinamis**: Setelah login, pengguna diarahkan ke dashboard masing-masing. Sidebar navigasi (`AppShell`) akan otomatis membatasi menu berdasarkan hak akses role:
  - **Mahasiswa**: Dashboard, Courses (Katalog Kelas), Calendar, Resources, Leaderboard.
  - **Dosen**: Dashboard, My Courses (Manajemen Kelas), Calendar, Resources.
  - **Admin**: Dashboard Admin, Manage Users, Manage Courses.

---

### 2. Pilar 1 — Manajemen Course & Materi (Course & Learning Materials)
- **Membuat Kelas Baru (Dosen)**:
  1. Dosen masuk ke menu **My Courses** lalu menekan tombol **Create Course**.
  2. Mengisi judul mata kuliah, deskripsi, SKS, kuota kelas, format pengajaran, dan semester akademik.
  3. Setelah dibuat, kelas akan otomatis muncul di halaman katalog kelas mahasiswa.
- **Pendaftaran Kelas (Mahasiswa)**:
  1. Mahasiswa membuka menu **Courses** (Katalog Kelas) untuk mencari kelas yang tersedia.
  2. Mahasiswa menekan tombol **Enroll** pada kelas pilihan. Setelah mengonfirmasi pendaftaran, kelas akan berpindah ke tab kelas aktif mahasiswa dan konten kelas (Modul/Materi) dapat diakses penuh.
- **Manajemen Materi Pembelajaran (Dosen)**:
  1. Dosen membuka halaman detail kelas di tab manajemen, lalu membuat modul/minggu perkuliahan.
  2. Di dalam modul, dosen dapat menambahkan materi dengan 3 pilihan jenis:
     - **Teks**: Catatan kuliah/materi berbentuk artikel teks.
     - **Video**: Embed link video pembelajaran (contoh: link YouTube).
     - **Dokumen**: Berkas PDF/PowerPoint yang dapat diunduh mahasiswa.
- **Mempelajari Materi (Mahasiswa)**:
  1. Mahasiswa masuk ke menu kelas yang diikutinya, memilih tab **Materi**, dan mengeklik materi terkait.
  2. Tampilan viewer akan menyesuaikan format materi (video player interaktif untuk video, dokumen viewer + tombol unduh untuk dokumen, dan artikel terformat untuk materi teks).

---

### 3. Pilar 2 — Kuis Interaktif & Gamifikasi (Interactive Quizzes & Leaderboard)
- **Pembuatan Kuis & Soal (Dosen)**:
  1. Dosen masuk ke modul kelas aktif, memilih tab **Kuis**, lalu mengeklik **Create Quiz**.
  2. Dosen menentukan judul kuis, durasi pengerjaan (menit), batas minimal nilai kelulusan (KKM), dan bobot XP reward (contoh: 100 XP).
  3. Dosen menambahkan soal pilihan ganda (pertanyaan, 4 opsi jawaban A/B/C/D, serta kunci jawaban yang benar).
- **Mengerjakan Kuis (Mahasiswa)**:
  1. Mahasiswa masuk ke detail kelas, memilih tab **Kuis**, dan mengeklik tombol **Mulai Kuis**.
  2. Soal ditampilkan satu per satu dengan tombol navigasi *Next* / *Previous*. Status jawaban yang dipilih akan tersimpan di state lokal mahasiswa.
  3. **Countdown Timer**: Di pojok kanan atas, durasi kuis berjalan mundur. Jika waktu kurang dari 1 menit, timer akan berkedip merah. Jika waktu habis sebelum submit, jawaban otomatis terkirim.
- **Penilaian Otomatis & Penambahan XP (Sistem)**:
  1. Setelah mahasiswa menekan **Submit**, backend secara real-time mencocokkan jawaban mahasiswa dengan kunci jawaban dosen (*auto-scoring*).
  2. Skor akhir ditampilkan instan beserta status Kelulusan (Lulus/Tidak Lulus).
  3. Mahasiswa dapat melihat pembahasan soal (kunci jawaban yang benar vs jawaban yang salah).
  4. Jika mahasiswa dinyatakan **Lulus** (skor ≥ KKM), poin XP kuis tersebut otomatis masuk ke total XP di profil mahasiswa.
  5. Setelah kuis dikerjakan, akses pengerjaan kuis tersebut akan dikunci untuk mencegah pengerjaan ulang.
- **Leaderboard Global (Papan Peringkat)**:
  1. Mahasiswa dapat mengakses menu **Leaderboard** untuk melihat peringkat seluruh mahasiswa secara real-time.
  2. Papan peringkat diurutkan berdasarkan total akumulasi poin XP. Peringkat 1, 2, dan 3 akan mendapatkan lencana medali emas, perak, dan perunggu (🥇🥈🥉).

---

### 4. Pilar 3 — Praktikum & Pengumpulan Tugas (Practical Labs & Assignments)
- **Penerbitan Tugas & Praktikum (Dosen)**:
  1. Dosen membuat item praktikum (Lab) atau tugas umum (Assignment) baru di dalam modul kelas.
  2. Dosen menuliskan judul, petunjuk/instruksi pengerjaan yang lengkap, serta menentukan tenggat waktu (deadline).
- **Pengumpulan Tugas (Mahasiswa)**:
  1. Mahasiswa membuka modul perkuliahan, masuk ke tab **Tugas / Lab**, dan membaca panduan instruksi.
  2. Mengunggah berkas jawaban praktikum (format PDF, ZIP, JPG, dll) serta menambahkan catatan tambahan pada kolom text area, kemudian menekan **Submit**.
  3. Status pengerjaan tugas berubah secara dinamis:
     - **Belum Dikerjakan (Grey Badge)**: Belum mengunggah tugas.
     - **Menunggu Penilaian (Yellow Badge)**: Tugas berhasil diunggah dan menunggu konfirmasi dosen.
     - **Sudah Dinilai (Green Badge)**: Dosen telah memberikan nilai, dan skor beserta komentar dosen akan langsung tampil di layar mahasiswa.
- **Pemberian Nilai (Dosen)**:
  1. Dosen membuka panel kelas di menu tugas/lab, lalu melihat daftar pengumpulan (*Submissions*).
  2. Dosen mengunduh berkas kiriman mahasiswa, meninjau catatannya, lalu menekan **Grade / Beri Nilai**.
  3. Dosen memasukkan skor angka (0-100) beserta feedback teks, lalu menyimpannya. Sistem akan memperbarui status penyerahan mahasiswa.

---

### 5. Fitur Pendukung Lainnya
- **Kalender Akademik & Agenda Personal**:
  - Semua pengguna dapat mengakses halaman **Calendar**.
  - Sistem otomatis mengambil data tugas & praktikum dari database dan menandai tanggal tenggat waktunya di kalender dengan warna **Merah**.
  - Pengguna dapat membuat agenda personal (kustom) dengan mengeklik tanggal kalender, menentukan judul, deskripsi, dan kategori warna (Biru, Ungu, Hijau, Kuning). Agenda personal disimpan di `localStorage` per masing-masing akun pengguna.
- **Kelola Pengguna & Statistik Global (Admin)**:
  - Admin dapat memantau grafik statistik global (total pengguna per kategori role, jumlah kelas aktif, tugas pending, dll).
  - Admin memiliki akses menu **Manage Users** untuk menaikkan/menurunkan hak akses role pengguna lain (misal: merubah student menjadi dosen) atau menghapus akun dari sistem dengan konfirmasi modal.
