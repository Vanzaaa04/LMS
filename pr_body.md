## Deskripsi
Pull Request ini berisi seluruh pembaruan fitur, perbaikan bug, dan penyempurnaan UI yang telah kita kerjakan, terutama pada sisi Dashboard Dosen dan Mahasiswa.

## Fitur & Perubahan Utama
1. **Course Management & Submissions:**
   - Menambahkan fitur maxAttempts (Batas Percobaan) dan gradingMethod (Metode Penilaian: *Highest* / *Latest*) untuk tugas (Assignment) dan praktikum (Lab).
   - Memperbaiki alur dan format penyimpanan ssignedDate dan deadline (timezone correction) agar data tidak hilang saat dosen mengedit tugas.
   - Pengecekan status kumpul (*Pending* vs *Graded*) secara akurat.

2. **UI & User Experience Enhancements:**
   - Menyempurnakan tampilan **Profil Mahasiswa** dengan mengganti inisial huruf menjadi foto avatar kustom berbentuk lingkaran penuh yang ukurannya lebih besar.
   - Merapikan posisi badge (centang hijau) pada avatar profil.
   - Membersihkan elemen UI yang tidak berfungsi seperti tombol *View Schedule* dan menyembunyikan *Continue Learning* jika materi belum ada.
   - Menghapus komponen SKS Progress bar yang statis (tidak terpakai) di halaman profil mahasiswa.

3. **Perbaikan Bug (Bug Fixes):**
   - Menangani isu di mana modul/tugas yang di-klik tidak langsung memunculkan feedback nilai secara dinamis.
   - Perbaikan masalah *infinite loop* & mapping undefined saat mahasiswa melakukan enroll dan membuka kelas yang baru didaftarkan.
   - Penyesuaian CourseDetailView untuk mahasiswa.

## Dampak
- Dosen kini dapat mengedit Assignment/Lab tanpa kehilangan data tanggal.
- Mahasiswa dapat melihat batas kumpul, metode penilaian, dan detail kursus dengan UI yang jauh lebih bersih dan estetik.
- Tidak ada lagi error yang menghambat *enrollment* kelas.
