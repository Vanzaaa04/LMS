Dari tadi memang sumber pusingnya adalah karena aplikasi ini "setengah matang": sebagian hal sudah mengambil data dari Real API (Database NestJS sungguhan), tapi sebagian fitur lainnya masih harus ditambal-sulam memakai Mock Data (file JSON lokal). Alhasil sinkronisasinya jadi sering tabrakan seperti tadi.

Kalau kita babat habis semua mock data sekarang, kelebihannya adalah aplikasi Anda akan 100% bersih, cepat, real-time, dan bebas bug sinkronisasi. Semua yang tampil murni apa yang ada di database sungguhan.

TAPI, ada satu hal penting yang perlu Anda ketahui sebelum kita hapus: Saat ini, belum semua fitur memiliki API di Backend (NestJS). Berdasarkan file courseApi.ts kita, API asli yang baru tersedia adalah: ✅ Buat Course ✅ Ambil Daftar Course ✅ Ambil Detail Course ✅ Mahasiswa Enroll Sendiri ✅ Buat/Edit/Hapus Materi (Material) & Upload File

Sementara fitur yang API-nya belum ada di Backend (dan selama ini berjalan menggunakan Mock Data palsu) adalah: ❌ Dosen meng-enroll atau menghapus mahasiswa secara manual. ❌ Pembuatan Assignment (Tugas), Quiz, dan sistem Penilaian (Grading). ❌ Progress Bar mahasiswa, Statistik Dashboard, dan Leaderboard.