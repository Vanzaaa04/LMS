import { Lab, Task, StudentProfile } from './types';

export const INITIAL_STUDENT_PROFILE: StudentProfile = {
  name: 'Budi Santoso',
  nim: '2201083042',
  department: 'Teknik Informatika (D4)',
  semester: 4,
  avatarLetter: 'B',
};

export const INITIAL_LABS: Lab[] = [
  {
    id: 'lab-1',
    title: 'Lab Pemrograman Web Pro',
    dosen: 'Dr. Aris Setiawan',
    category: 'Rekayasa Perangkat Lunak',
    semester: 4,
    isRegistered: true,
    totalModules: 3,
    completedModules: 1,
    labGrade: 95,
    description: 'Laboratorium ini berfokus pada pengembangan aplikasi web interaktif, modern, dan scalable menggunakan ekosistem React, Node.js, Express, dan basis data SQL/NoSQL.',
    syllabus: ['Struktur Aplikasi Modern & Component Oriented UI', 'Manajemen State Global dengan React Hooks & Context', 'Integrasi RESTful API & Autentikasi JWT', '+1 Materi Lain'],
    registeredAt: '25 Mei 2026, 08:00 WIB',
    labStatus: 'Sudah Submit, menunggu penilaian'
  },
  {
    id: 'lab-2',
    title: 'Lab Jaringan Komputer',
    dosen: 'Prof. Heru Prasetyo',
    category: 'Infrastruktur Jaringan',
    semester: 4,
    isRegistered: true,
    totalModules: 4,
    completedModules: 0,
    labGrade: null,
    description: 'Praktikum mendalam mengenai infrastruktur jaringan komputer, meliputi konfigurasi perangkat keras router Cisco, switch, manajemen VLAN, dynamic routing, access control list (ACL), keamanan nirkabel...',
    syllabus: ['Arsitektur Subnetting VLSM & CIDR', 'Konfigurasi Switch Virtual (VLAN & Trunking)', 'Inter-VLAN Routing & Dynamic Routing (OSPF)', '+1 Materi Lain'],
    registeredAt: '26 Mei 2026, 09:15 WIB',
    labStatus: 'Belum Submit'
  },
  {
    id: 'lab-3',
    title: 'Lab Basis Data Terapan',
    dosen: 'Bpk. Ahmad Fauzi, M.Kom',
    category: 'Manajemen Data',
    semester: 4,
    isRegistered: false,
    totalModules: 5,
    completedModules: 0,
    labGrade: null,
    description: 'Fokus pada perancangan basis data relasional kompleks, optimasi query, stored procedure, trigger, dan transaksi database lanjutan menggunakan PostgreSQL dan Oracle.',
    syllabus: ['Advanced DDL & DML', 'Query Optimization & Indexing', 'Stored Procedure & Trigger', 'Database Security'],
    labStatus: 'Belum Submit'
  },
  {
    id: 'lab-4',
    title: 'Lab Kecerdasan Buatan',
    dosen: 'Dr. Siti Aminah',
    category: 'Kecerdasan Buatan',
    semester: 4,
    isRegistered: false,
    totalModules: 3,
    completedModules: 0,
    labGrade: null,
    description: 'Implementasi algoritma machine learning, neural networks, dan deep learning dasar menggunakan Python, scikit-learn, dan TensorFlow/Keras.',
    syllabus: ['Linear & Logistic Regression', 'Decision Trees & Random Forests', 'Basic Neural Networks', 'Computer Vision Basics'],
    labStatus: 'Belum Submit'
  }
];

export const INITIAL_TASKS: Task[] = [
  {
    id: 'TSK-WBP-01',
    labId: 'lab-1',
    title: 'Tugas 01: Membuat Layout Landing Page Sekolah',
    description: 'Buatlah sebuah layout responsif untuk halaman depan (landing page) sebuah sekolah menengah kejuruan. Layout harus mencakup navigasi, banner pahlawan (hero), bagian berita, dan footer. Gunakan Tailwind CSS atau CSS murni tanpa framework JS.',
    deadline: '05 Juni 2026, 23:59 WIB',
    deadlineRaw: new Date('2026-06-05T16:59:00Z'),
    format: ['File di-compress dalam bentuk ZIP/RAR', 'Sertakan file HTML dan CSS', 'Maksimal ukuran 10MB'],
    submission: {
      status: 'Selesai',
      submittedAt: '04 Juni 2026, 14:20 WIB',
      fileName: 'Tugas01_BudiSantoso_2201083042.zip',
      fileSize: '2.4 MB',
      grade: 95,
      feedback: 'Layout sangat rapi dan responsif. Penggunaan Tailwind sangat efektif. Pertahankan!',
      note: 'Ini tugas pertama saya Pak, sudah saya uji di mobile dan desktop.'
    }
  },
  {
    id: 'TSK-WBP-02',
    labId: 'lab-1',
    title: 'Tugas 02: Integrasi Beranda API & State Management',
    description: 'Integrasikan API berita yang sudah disediakan ke dalam layout yang dibuat pada Tugas 01. Gunakan React (dengan hooks useState dan useEffect) untuk fetch dan menampilkan data. Berikan state loading dan penanganan error yang baik.',
    deadline: '12 Juni 2026, 18:00 WIB',
    deadlineRaw: new Date('2026-06-12T11:00:00Z'),
    format: ['File ZIP berisi source code', 'Atau file PDF berisi link repositori GitHub'],
    submission: {
      status: 'Menunggu Penilaian',
      submittedAt: '05 Juni 2026, 10:15 WIB',
      fileName: 'Tugas02_BudiSantoso_GithubLink.pdf',
      fileSize: '120 KB',
      grade: null,
      feedback: null,
      note: 'Saya melampirkan link GitHub agar lebih mudah di-clone.'
    }
  },
  {
    id: 'TSK-JAR-01',
    labId: 'lab-2',
    title: 'Tugas 01: Subnetting VLSM Cisco Packet Tracer',
    description: 'Selesaikan skenario jaringan kantor cabang menggunakan Cisco Packet Tracer. Implementasikan VLSM untuk membagi blok IP 192.168.10.0/24 menjadi 4 departemen dengan jumlah host yang berbeda sesuai modul PDF.',
    deadline: '10 Juni 2026, 23:59 WIB',
    deadlineRaw: new Date('2026-06-10T16:59:00Z'),
    format: ['File .pkt (Cisco Packet Tracer)', 'Laporan singkat format PDF'],
    submission: null
  }
];

import { Quiz, StudentQuizAttempt } from './types';

export const INITIAL_QUIZZES: Quiz[] = [
  {
    id: 'quiz-web-01',
    labId: 'lab-1',
    code: 'Q-WBP-01',
    title: 'Kuis Modul 1: Dasar-Dasar React & Component',
    description: 'Uji pemahaman Anda tentang konsep dasar React, component lifecycle, props, state, dan penggunaan hooks useState dan useEffect.',
    timeLimitMinutes: 15,
    questions: [
      {
        id: 'qw1-1',
        questionText: 'Apa kegunaan utama dari hook useState() di React?',
        options: [
          'Untuk mengambil data dari server secara asinkron',
          'Untuk menyimpan dan memperbarui nilai state lokal di dalam sebuah komponen',
          'Untuk menghubungkan komponen dengan Redux store',
          'Untuk memanipulasi DOM secara langsung'
        ],
        correctOptionIndex: 1,
        explanation: 'useState() adalah hook yang memungkinkan komponen fungsional menyimpan nilai state lokal. Ia mengembalikan sebuah array dengan nilai saat ini dan fungsi setter untuk memperbarui nilai tersebut.'
      },
      {
        id: 'qw1-2',
        questionText: 'Kapan useEffect() dengan dependency array kosong ([]) akan dijalankan?',
        options: [
          'Setiap kali komponen dirender ulang',
          'Hanya ketika ada props yang berubah',
          'Hanya sekali setelah komponen pertama kali dimount ke DOM',
          'Sebelum komponen dirender untuk pertama kalinya'
        ],
        correctOptionIndex: 2,
        explanation: 'useEffect dengan dependency array kosong ([]) berjalan setara dengan componentDidMount pada class component, yaitu hanya satu kali setelah komponen pertama kali dirender dan dipasang ke DOM.'
      },
      {
        id: 'qw1-3',
        questionText: 'Manakah cara yang benar untuk meneruskan data dari komponen induk ke komponen anak di React?',
        options: [
          'Menggunakan setState() langsung dari komponen anak',
          'Menggunakan Context API secara wajib untuk semua data',
          'Meneruskan data melalui props ke komponen anak',
          'Menyimpan data di sessionStorage dan mengambilnya di komponen anak'
        ],
        correctOptionIndex: 2,
        explanation: 'Props adalah mekanisme utama untuk meneruskan data dari komponen induk (parent) ke komponen anak (child) di React. Data mengalir satu arah, dari atas ke bawah (unidirectional data flow).'
      },
      {
        id: 'qw1-4',
        questionText: 'Apa yang dimaksud dengan "Virtual DOM" di React?',
        options: [
          'Sebuah database khusus yang menyimpan seluruh elemen HTML',
          'Representasi ringan dari DOM nyata yang disimpan di memori JavaScript',
          'Sebuah framework CSS yang dioptimalkan untuk React',
          'Plugin browser untuk mendebugging komponen React'
        ],
        correctOptionIndex: 1,
        explanation: 'Virtual DOM adalah representasi ringan (lightweight copy) dari DOM asli yang disimpan di memori. React menggunakannya untuk membandingkan perubahan (diffing) sebelum hanya memperbarui bagian DOM nyata yang benar-benar berubah, sehingga meningkatkan performa.'
      },
      {
        id: 'qw1-5',
        questionText: 'Apa tujuan dari atribut "key" saat merender sebuah daftar (list) di React?',
        options: [
          'Untuk styling CSS secara unik pada setiap elemen list',
          'Untuk mengirimkan data form secara aman',
          'Untuk membantu React mengidentifikasi elemen mana yang berubah, ditambah, atau dihapus',
          'Untuk menambahkan event listener pada setiap elemen list'
        ],
        correctOptionIndex: 2,
        explanation: 'Atribut "key" memberikan identitas unik bagi setiap item dalam sebuah daftar. React menggunakan key untuk secara efisien mencocokkan elemen-elemen antara render sebelumnya dan saat ini, sehingga proses rekonsiliasi menjadi lebih cepat dan akurat.'
      }
    ]
  },
  {
    id: 'quiz-web-02',
    labId: 'lab-1',
    code: 'Q-WBP-02',
    title: 'Kuis Modul 2: REST API & Async JavaScript',
    description: 'Uji kemampuan Anda dalam memahami konsep RESTful API, penggunaan Fetch API, async/await, serta penanganan error pada komunikasi data di aplikasi web.',
    timeLimitMinutes: 20,
    questions: [
      {
        id: 'qw2-1',
        questionText: 'Metode HTTP mana yang paling tepat digunakan untuk membuat sumber daya baru di server?',
        options: ['GET', 'PUT', 'POST', 'DELETE'],
        correctOptionIndex: 2,
        explanation: 'Metode POST digunakan untuk mengirim data ke server dengan tujuan membuat sumber daya baru. GET untuk membaca data, PUT untuk memperbarui data yang sudah ada, dan DELETE untuk menghapus data.'
      },
      {
        id: 'qw2-2',
        questionText: 'Apa yang terjadi jika sebuah Promise di-reject dan tidak ada blok .catch() atau try/catch yang menanganinya?',
        options: [
          'Program akan berhenti total dan tidak bisa dilanjutkan',
          'Error tersebut akan diabaikan secara diam-diam oleh browser',
          'Akan terjadi "Unhandled Promise Rejection" yang bisa menyebabkan bug tersembunyi',
          'Browser akan otomatis me-retry request tersebut sebanyak 3 kali'
        ],
        correctOptionIndex: 2,
        explanation: '"Unhandled Promise Rejection" adalah kondisi di mana sebuah Promise gagal (reject) tetapi tidak ada handler error yang menanggapinya. Ini adalah sumber bug yang umum dan di Node.js modern bisa menyebabkan proses berhenti.'
      },
      {
        id: 'qw2-3',
        questionText: 'Apa kegunaan dari header "Content-Type: application/json" pada sebuah HTTP request?',
        options: [
          'Untuk mengautentikasi pengguna yang membuat request',
          'Untuk memberitahu server bahwa body dari request berformat JSON',
          'Untuk mengenkripsi konten yang dikirim',
          'Untuk mengompresi ukuran data yang dikirimkan'
        ],
        correctOptionIndex: 1,
        explanation: 'Header Content-Type memberitahu penerima (server) tentang format media yang ada di body request. Nilai "application/json" menunjukkan bahwa data yang dikirim adalah dalam format JSON, sehingga server dapat mem-parse-nya dengan benar.'
      }
    ]
  },
  {
    id: 'quiz-jar-01',
    labId: 'lab-2',
    code: 'Q-JAR-01',
    title: 'Kuis Modul 1: Dasar Jaringan & Subnetting',
    description: 'Uji pemahaman konsep dasar jaringan komputer, model OSI, protokol TCP/IP, dan teknik penghitungan subnetting CIDR.',
    timeLimitMinutes: 25,
    questions: [
      {
        id: 'qj1-1',
        questionText: 'Pada model OSI, layer manakah yang bertanggung jawab untuk routing paket antar jaringan yang berbeda?',
        options: ['Layer 2 (Data Link)', 'Layer 3 (Network)', 'Layer 4 (Transport)', 'Layer 7 (Application)'],
        correctOptionIndex: 1,
        explanation: 'Layer 3 (Network Layer) bertanggung jawab untuk pengalamatan logis (IP Address) dan penentuan jalur terbaik (routing) untuk mengirimkan paket data antar jaringan yang berbeda. Perangkat yang bekerja di layer ini adalah Router.'
      },
      {
        id: 'qj1-2',
        questionText: 'Berapa banyak host yang dapat digunakan pada jaringan dengan prefix /26?',
        options: ['62 host', '64 host', '30 host', '126 host'],
        correctOptionIndex: 0,
        explanation: 'Prefix /26 berarti 26 bit untuk network, sehingga tersisa 6 bit untuk host. Jumlah total alamat = 2^6 = 64. Dikurangi 2 (network address dan broadcast address), tersisa 62 host yang dapat digunakan.'
      },
      {
        id: 'qj1-3',
        questionText: 'Protokol apa yang digunakan untuk memetakan alamat IP ke alamat MAC pada jaringan lokal (LAN)?',
        options: ['DNS (Domain Name System)', 'DHCP (Dynamic Host Configuration Protocol)', 'ARP (Address Resolution Protocol)', 'ICMP (Internet Control Message Protocol)'],
        correctOptionIndex: 2,
        explanation: 'ARP (Address Resolution Protocol) adalah protokol yang digunakan untuk menemukan alamat hardware (MAC Address) dari sebuah perangkat di jaringan lokal berdasarkan alamat IP-nya yang sudah diketahui.'
      }
    ]
  }
];

export const INITIAL_QUIZ_ATTEMPTS: StudentQuizAttempt[] = [];
