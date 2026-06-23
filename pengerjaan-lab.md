# Laporan Fitur Frontend (Web Ruang Dosen)

Berikut adalah daftar fitur utama aplikasi *Frontend* yang telah dikembangkan dan siap digunakan:

### 1. Ruang Kerja Dosen (Lecturer Workspace)
- **Manajemen Lab Praktikum:** Menampilkan seluruh daftar laboratorium, lengkap dengan fitur Filter berdasarkan kategori dan Pencarian (*Search*) nama Lab.
- **Sistem Penilaian Mahasiswa (*Grading System*):** Dosen atau Asisten dapat melihat daftar mahasiswa yang sudah mengumpulkan tugas/laporan dan langsung memberikan nilai (angka) di dalam sistem.
- **Manajemen Kuis Demo:** Dosen bisa memantau daftar kuis dan skor yang didapat oleh setiap mahasiswa pada masing-masing demo modul.

### 2. Area Mahasiswa (Student Workspace)
- **Pendaftaran Praktikum (*Enrollment Gate*):** Sistem kunci akses di mana mahasiswa harus mendaftar (registrasi) terlebih dahulu sebelum bisa melihat rincian materi, demo, dan tugas pada suatu Lab.
- **Pengumpulan Tugas (*Submission*):** Form unggah file bagi mahasiswa untuk mengirimkan laporan praktikum (format `.zip` atau `.pdf`) beserta catatan tambahan.
- **Sistem Kuis Interaktif (Demo Lab):**
  - Antarmuka pengerjaan kuis pilihan ganda.
  - Penilaian instan (otomatis) segera setelah kuis dikumpulkan.
  - Fitur Pembahasan Kuis (Kunci Jawaban) yang bisa diakses setelah kuis selesai.
  - Aturan keamanan: Kuis yang sudah selesai dikerjakan akan dikunci otomatis agar tidak bisa diulangi.
