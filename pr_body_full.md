## Deskripsi Lengkap (Full Changelog)
Pull Request ini mencakup **seluruh fitur dan perbaikan** berskala besar yang telah kita kerjakan dari awal sesi hingga tuntas. Semua elemen inti LMS (Learning Management System) dari sisi Dosen, Mahasiswa, dan Admin kini saling terintegrasi secara penuh.

## 🚀 Fitur Besar yang Diselesaikan (Major Features)
1. **Sistem Notifikasi Global (Notification System)**
   - API Notifikasi yang memberi tahu mahasiswa tentang perubahan tugas, nilai baru, dan info lainnya.
   - UI lonceng notifikasi interaktif di *TopNavBar*.

2. **Integrasi Kalender Akademik (Calendar Workspace)**
   - Pembuatan calendar.module, API, dan komponen UI CalendarWorkspace yang menyoroti deadline tugas, kuis, dan praktikum secara visual.

3. **Manajemen Kuis (Quiz Engine)**
   - Fitur Dosen membuat, mengedit, dan melihat statistik kuis.
   - Fitur Mahasiswa mengerjakan kuis beserta batas percobaan (Max Attempts) dan otomatisasi skor akhir.

4. **Modul Praktikum & Tugas Terpadu (Lab & Assignment Submissions)**
   - Mahasiswa kini dapat mengunggah file tugas dan praktikum (PDF/dll).
   - Dosen dapat memberikan nilai (*grading*) dan *feedback* text yang langsung muncul di layar mahasiswa.
   - Implementasi logika batas maksimum pengerjaan (maxAttempts) dan aturan ambil nilai (gradingMethod: *Highest Score* / *Latest Attempt*).

5. **Pemisahan Katalog Kelas (Course Catalog & Enrollment)**
   - Logika pemisahan antara halaman "Kelas Tersedia" (courses/available) dan "Kelas Saya" (courses/my).
   - Pengecekan status *Enrollment* yang kokoh; mencegah mahasiswa masuk kelas tanpa terdaftar (mengatasi *infinite loop* bug).

## 💄 UI/UX Enhancements
- **Student Profile:** Desain avatar baru yang jauh lebih besar dan estetik berbasis gambar (kustom foto profil mahasiswa), serta penempatan *badge* akun yang proporsional.
- **Dashboard Analytics:** Perbaikan visualisasi *Total Course, Assignments*, dan status *progress* di Dashboard Mahasiswa.
- **Form Pengerjaan (Task Detail & Submit):** Merapikan kolom *upload*, menampilkan riwayat *submission*, dan membedakan status visual antara *Pending* dan *Graded*.
- Pembersihan komponen mati: Menghapus SKS Progress bar yang tidak terpakai, menghilangkan *View Schedule* fiktif, serta fitur proteksi tombol "Continue Learning".

## 🛠 Bug Fixes & Refactoring
- **Timezone Bug:** Memperbaiki sistem penyimpanan *Date* di Assignment/Lab Editor sehingga ssignedDate dan deadline tidak tiba-tiba kosong (hilang) saat dosen mencoba mengedit tugas lama.
- Perbaikan query Prisma pada pencarian relasi (indMany vs indUnique) di modul Penilaian.
- Seeding Data (seed.ts): Pembaruan struktur dummy data.
- **Export ERD Database:** Menyediakan clean_ddl.sql ANSI SQL yang dimodifikasi khusus agar kompatibel dengan Oracle SQL Developer Data Modeler.

## Dampak Keseluruhan
LMS kini sudah sepenuhnya berfungsi ganda (Dosen - Mahasiswa). Alur pengajaran, pemberian materi, hingga pengerjaan tugas & kuis sudah dapat dijalankan secara sempurna (End-to-End).
