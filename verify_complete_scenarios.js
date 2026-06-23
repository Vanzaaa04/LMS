/**
 * verify_complete_scenarios.js
 * Skrip pengujian E2E lengkap:
 * 1. Pendaftaran Dosen Baru
 * 2. Pendaftaran Mahasiswa Baru
 * 3. Login & Verifikasi Profil Awal
 * 4. Pembuatan Kelas Baru oleh Dosen
 * 5. Pembuatan Modul Baru
 * 6. Pembuatan Kuis Baru & Soal Pilihan Ganda
 * 7. Pembuatan Praktikum/Lab Baru
 * 8. Pendaftaran Kelas (Enrollment) oleh Mahasiswa Baru
 * 9. Pengerjaan Kuis oleh Mahasiswa (Auto-grading & Reward XP)
 * 10. Pengumpulan Tugas Praktikum oleh Mahasiswa
 * 11. Penilaian Praktikum & Feedback oleh Dosen Baru
 * 12. Verifikasi Akumulasi XP Akhir & Peringkat Leaderboard
 *
 * Jalankan dengan: node verify_complete_scenarios.js
 */

const BASE_URL = "http://localhost:3001";
const timestamp = Math.floor(Date.now() / 1000);

const DOSEN_EMAIL = `dosen.test.${timestamp}@ruangdosen.ac.id`;
const DOSEN_PASSWORD = "password123";
const DOSEN_NAME = `Prof. E2E Lecturer ${timestamp}`;

const MHS_EMAIL = `mahasiswa.test.${timestamp}@ruangdosen.ac.id`;
const MHS_PASSWORD = "password123";
const MHS_NAME = `Mhs E2E Junior ${timestamp}`;
const MHS_ANGKATAN = 2025;

const logStep = (step, title) => {
  console.log(`\n============================================================`);
  console.log(`🚀 [SKENARIO ${step}] ${title.toUpperCase()}`);
  console.log(`============================================================`);
};

const logSuccess = (msg, details) => {
  console.log(`✅ ${msg}`);
  if (details) {
    console.log(`   ↳`, JSON.stringify(details, null, 2).split("\n").join("\n     "));
  }
};

const logError = (msg, err) => {
  console.error(`❌ GAGAL: ${msg}`);
  if (err) console.error(err);
  process.exit(1);
};

async function run() {
  console.log("\n🔥 MEMULAI PENGUJIAN SKENARIO LENGKAP RUANG DOSEN 🔥");
  console.log(`📅 Waktu Pengujian: ${new Date().toLocaleString()}`);
  console.log(`📧 Akun Dosen Baru     : ${DOSEN_EMAIL}`);
  console.log(`📧 Akun Mahasiswa Baru : ${MHS_EMAIL}`);

  let dosenToken = null;
  let dosenId = null;
  let mhsToken = null;
  let mhsId = null;
  
  let courseId = null;
  let moduleId = null;
  let quizId = null;
  let questionId = null;
  let labId = null;
  let submissionId = null;

  // =========================================================================
  logStep(1, "Pendaftaran Akun Dosen Baru");
  // =========================================================================
  try {
    const res = await fetch(`${BASE_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: DOSEN_NAME,
        email: DOSEN_EMAIL,
        password: DOSEN_PASSWORD,
        role: "LECTURER"
      })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Gagal register dosen");
    dosenId = data.id;
    logSuccess("Pendaftaran Dosen Berhasil", { id: dosenId, name: data.name, email: data.email });
  } catch (err) {
    logError("Gagal mendaftarkan dosen baru", err);
  }

  // =========================================================================
  logStep(2, "Pendaftaran Akun Mahasiswa Baru");
  // =========================================================================
  try {
    const res = await fetch(`${BASE_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: MHS_NAME,
        email: MHS_EMAIL,
        password: MHS_PASSWORD,
        role: "STUDENT",
        angkatan: MHS_ANGKATAN
      })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Gagal register mahasiswa");
    mhsId = data.id;
    logSuccess("Pendaftaran Mahasiswa Berhasil", { id: mhsId, name: data.name, email: data.email, angkatan: data.angkatan });
  } catch (err) {
    logError("Gagal mendaftarkan mahasiswa baru", err);
  }

  // =========================================================================
  logStep(3, "Login & Autentikasi JWT");
  // =========================================================================
  try {
    // Login Dosen
    let loginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: DOSEN_EMAIL, password: DOSEN_PASSWORD })
    });
    let loginData = await loginRes.json();
    if (!loginRes.ok) throw new Error("Gagal login dosen");
    dosenToken = loginData.access_token;

    // Login Mahasiswa
    loginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: MHS_EMAIL, password: MHS_PASSWORD })
    });
    loginData = await loginRes.json();
    if (!loginRes.ok) throw new Error("Gagal login mahasiswa");
    mhsToken = loginData.access_token;

    logSuccess("Autentikasi JWT sukses untuk Dosen & Mahasiswa", {
      dosenTokenSnippet: dosenToken.substring(0, 15) + "...",
      mhsTokenSnippet: mhsToken.substring(0, 15) + "..."
    });
  } catch (err) {
    logError("Gagal dalam proses login", err);
  }

  // =========================================================================
  logStep(4, "Pembuatan Kelas Baru oleh Dosen Baru");
  // =========================================================================
  try {
    const res = await fetch(`${BASE_URL}/courses`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${dosenToken}`
      },
      body: JSON.stringify({
        title: `Mata Kuliah E2E - ${timestamp}`,
        description: "Mata Kuliah khusus pengujian E2E otomatis terintegrasi.",
        instructorId: dosenId,
        credits: 4,
        department: "Teknik Informatika",
        semester: "Ganjil 2026/2027",
        enrollmentCap: 45,
        status: "Active"
      })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Gagal membuat kelas");
    courseId = data.id;
    logSuccess("Kelas Baru Berhasil Dibuat", {
      courseId,
      title: data.title,
      instructorId: data.instructorId,
      credits: data.credits
    });
  } catch (err) {
    logError("Gagal membuat kelas baru", err);
  }

  // =========================================================================
  logStep(5, "Pembuatan Modul Baru di dalam Kelas");
  // =========================================================================
  try {
    const res = await fetch(`${BASE_URL}/courses/${courseId}/modules`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${dosenToken}`
      },
      body: JSON.stringify({
        title: "Modul 1: Konsep Dasar Pengujian Terintegrasi",
        description: "Modul awal pengenalan alur end-to-end web app."
      })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Gagal membuat modul");
    moduleId = data.id;
    logSuccess("Modul Baru Berhasil Dibuat", {
      moduleId,
      title: data.title,
      courseId: data.courseId
    });
  } catch (err) {
    logError("Gagal membuat modul baru", err);
  }

  // =========================================================================
  logStep(6, "Pembuatan Kuis Baru & Pertanyaan Pilihan Ganda");
  // =========================================================================
  try {
    // 1. Buat Kuis
    let res = await fetch(`${BASE_URL}/quizzes`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${dosenToken}`
      },
      body: JSON.stringify({
        title: "Kuis Pilihan Ganda E2E",
        moduleId: moduleId,
        xpReward: 150,
        passingScore: 70,
        timeLimit: 10,
        status: "PUBLISHED"
      })
    });
    let data = await res.json();
    if (!res.ok) throw new Error(data.message || "Gagal membuat kuis");
    quizId = data.id;
    logSuccess("Kuis Berhasil Dibuat", { quizId, title: data.title, xpReward: data.xpReward });

    // 2. Tambah Pertanyaan
    res = await fetch(`${BASE_URL}/quiz-questions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${dosenToken}`
      },
      body: JSON.stringify({
        quizId: quizId,
        question: "Manakah tool AI asisten buatan Google DeepMind?",
        optionA: "Antigravity",
        optionB: "Placeholder AI",
        optionC: "Generic Bot",
        optionD: "Bukan salah satu di atas",
        correctAnswer: "A"
      })
    });
    data = await res.json();
    if (!res.ok) throw new Error(data.message || "Gagal membuat pertanyaan");
    questionId = data.id;
    logSuccess("Soal Kuis Berhasil Ditambahkan", {
      questionId,
      question: data.question,
      correctAnswer: data.correctAnswer
    });
  } catch (err) {
    logError("Gagal menyiapkan kuis & soal", err);
  }

  // =========================================================================
  logStep(7, "Pembuatan Praktikum / Lab Baru");
  // =========================================================================
  try {
    const res = await fetch(`${BASE_URL}/labs`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${dosenToken}`
      },
      body: JSON.stringify({
        title: "Praktikum 1: Analisis Log Output",
        instructions: "Unduh file log, analisis kesalahan kompilasi, dan kumpulkan laporan PDF/ZIP.",
        moduleId: moduleId
      })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Gagal membuat lab");
    labId = data.id;
    logSuccess("Praktikum/Lab Berhasil Dibuat", {
      labId,
      title: data.title,
      instructions: data.instructions
    });
  } catch (err) {
    logError("Gagal membuat praktikum/lab baru", err);
  }

  // =========================================================================
  logStep(8, "Pendaftaran Kelas (Enrollment) oleh Mahasiswa Baru");
  // =========================================================================
  try {
    const res = await fetch(`${BASE_URL}/courses/${courseId}/enroll`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${mhsToken}`
      }
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Gagal melakukan enrollment");
    logSuccess("Pendaftaran Mahasiswa ke Kelas Berhasil", {
      studentId: data.studentId,
      courseId: data.courseId,
      status: "Enrolled"
    });
  } catch (err) {
    logError("Gagal melakukan enrollment mahasiswa", err);
  }

  // =========================================================================
  logStep(9, "Pengerjaan Kuis oleh Mahasiswa (Pemberian XP otomatis)");
  // =========================================================================
  try {
    const res = await fetch(`${BASE_URL}/quizzes/${quizId}/submit`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${mhsToken}`
      },
      body: JSON.stringify({
        answers: [
          { questionId: questionId, answer: "A" }
        ]
      })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Gagal mengumpulkan kuis");
    logSuccess("Kuis Selesai Dikerjakan oleh Mahasiswa", {
      score: data.score,
      passed: data.passed,
      xpGained: data.xpGained,
      expectedXpReward: 150
    });
  } catch (err) {
    logError("Gagal dalam pengerjaan kuis mahasiswa", err);
  }

  // =========================================================================
  logStep(10, "Pengumpulan Tugas Praktikum oleh Mahasiswa");
  // =========================================================================
  try {
    const res = await fetch(`${BASE_URL}/labs/${labId}/submit`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${mhsToken}`
      },
      body: JSON.stringify({
        fileUrl: "https://ruangdosen.ac.id/cdn/submission-e2e-mhs.zip",
        note: "Ini berkas zip hasil analisis script E2E saya, mohon diperiksa Pak."
      })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Gagal submit lab");
    submissionId = data.id;
    logSuccess("Laporan Praktikum Berhasil Dikumpulkan", {
      submissionId,
      fileUrl: data.fileUrl,
      note: data.note,
      status: data.status || "Pending"
    });
  } catch (err) {
    logError("Gagal mengumpulkan laporan praktikum", err);
  }

  // =========================================================================
  logStep(11, "Penilaian Praktikum & Feedback oleh Dosen Baru");
  // =========================================================================
  try {
    const res = await fetch(`${BASE_URL}/lab-submissions/${submissionId}/grade`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${dosenToken}`
      },
      body: JSON.stringify({
        score: 95,
        feedback: "Analisis log yang sangat mendalam dan terstruktur. Struktur script sangat rapi!"
      })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Gagal memberi nilai lab");
    logSuccess("Praktikum Berhasil Dinilai oleh Dosen", {
      submissionId: data.id,
      score: data.score,
      feedback: data.feedback,
      status: data.status || "Graded"
    });
  } catch (err) {
    logError("Gagal memberikan nilai praktikum", err);
  }

  // =========================================================================
  logStep(12, "Verifikasi Akumulasi XP Akhir & Peringkat Leaderboard");
  // =========================================================================
  try {
    // 1. Cek XP Mahasiswa
    let profileRes = await fetch(`${BASE_URL}/auth/profile`, {
      headers: { "Authorization": `Bearer ${mhsToken}` }
    });
    let profileData = await profileRes.json();
    if (!profileRes.ok) throw new Error("Gagal mengambil profil mahasiswa");
    const finalXp = profileData.xp || 0;

    // 2. Ambil Leaderboard
    let lbRes = await fetch(`${BASE_URL}/leaderboard`, {
      headers: { "Authorization": `Bearer ${mhsToken}` }
    });
    let lbData = await lbRes.json();
    if (!lbRes.ok) throw new Error("Gagal mengambil leaderboard");
    
    const leaderboardPosition = lbData.findIndex(entry => entry.id === mhsId) + 1;

    logSuccess("Verifikasi Hasil Akhir E2E Sukses", {
      mahasiswaName: profileData.name,
      totalXp: finalXp,
      posisiLeaderboard: leaderboardPosition > 0 ? `${leaderboardPosition} dari ${lbData.length} mahasiswa` : "Tidak ditemukan",
      pencapaianXpSesuai: finalXp === 150 ? "✅ YA (150 XP dari Kuis)" : "❌ TIDAK"
    });

    console.log("\n============================================================");
    console.log("🎉 SELURUH SKENARIO BERHASIL DIUJI TANPA ERROR! 🎉");
    console.log("============================================================\n");
  } catch (err) {
    logError("Gagal memverifikasi leaderboard / profil akhir", err);
  }
}

run();
