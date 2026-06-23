/**
 * verify_quiz_flow.js
 * Skrip verifikasi end-to-end untuk memastikan alur kuis (pembuatan dosen, penambahan soal, pengerjaan mahasiswa, reward XP) berfungsi penuh.
 * Jalankan dengan: node verify_quiz_flow.js
 */

const BASE_URL = "http://localhost:3001";

const log = (step, msg, data) => {
  const icon = data?.error ? "❌" : "✅";
  console.log(`\n${icon} [LANGKAH ${step}] ${msg}`);
  if (data) console.log("   ↳ ", JSON.stringify(data, null, 2).split("\n").join("\n     "));
};

const logInfo = (msg) => console.log(`\n   ℹ️  ${msg}`);
const logError = (msg) => { console.error(`\n🔴 GAGAL: ${msg}`); process.exit(1); };

async function runVerification() {
  console.log("=".repeat(60));
  console.log("  RUANG DOSEN – VERIFIKASI ALUR KUIS & REWARD XP");
  console.log("=".repeat(60));

  let dosenToken = null;
  let studentToken = null;
  let courseId = null;
  let moduleId = null;
  let quizId = null;
  let questionId = null;

  // ─── LANGKAH 1: Login Dosen ─────────────────────────────────────────────
  logInfo("Mencoba login sebagai Dosen...");
  const loginDosenRes = await fetch(`${BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "dosen@ruangdosen.ac.id", password: "password123" }),
  });
  const loginDosenData = await loginDosenRes.json();
  if (!loginDosenRes.ok) logError(`Login dosen gagal: ${JSON.stringify(loginDosenData)}`);
  dosenToken = loginDosenData.access_token;
  log(1, "Login Dosen Berhasil", { name: loginDosenData.user?.name, email: loginDosenData.user?.email, role: loginDosenData.user?.role });

  // ─── LANGKAH 2: Ambil Kelas & Modul Dosen ───────────────────────────────
  logInfo("Mengambil daftar kelas dosen...");
  const coursesRes = await fetch(`${BASE_URL}/courses/my`, {
    headers: { Authorization: `Bearer ${dosenToken}` },
  });
  const coursesData = await coursesRes.json();
  if (!coursesRes.ok) logError(`Gagal mengambil kelas: ${JSON.stringify(coursesData)}`);
  const courses = Array.isArray(coursesData) ? coursesData : [];
  if (courses.length === 0) logError("Dosen tidak memiliki kelas. Pastikan data seed terpasang.");
  courseId = courses[0].id;

  // Ambil detail modul untuk kelas tersebut
  logInfo(`Mengambil modul untuk kelas: ${courses[0].title}`);
  const modulesRes = await fetch(`${BASE_URL}/courses/${courseId}/modules`, {
    headers: { Authorization: `Bearer ${dosenToken}` },
  });
  const modulesData = await modulesRes.json();
  if (!modulesRes.ok) logError(`Gagal mengambil modul: ${JSON.stringify(modulesData)}`);
  const modules = Array.isArray(modulesData) ? modulesData : [];
  if (modules.length === 0) logError("Mata kuliah tidak memiliki modul.");
  moduleId = modules[0].id;
  log(2, "Mengambil Kelas & Modul Berhasil", { course: courses[0].title, module: modules[0].title, moduleId });

  // ─── LANGKAH 3: Dosen Membuat Kuis Baru ─────────────────────────────────
  logInfo("Membuat kuis baru...");
  const quizTitle = `Kuis Integrasi Test ${Date.now()}`;
  const createQuizRes = await fetch(`${BASE_URL}/quizzes`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${dosenToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      title: quizTitle,
      moduleId: moduleId,
      xpReward: 120,
      passingScore: 70,
      timeLimit: 15,
      status: "PUBLISHED",
    }),
  });
  const createQuizData = await createQuizRes.json();
  if (!createQuizRes.ok) logError(`Gagal membuat kuis: ${JSON.stringify(createQuizData)}`);
  quizId = createQuizData.id;
  log(3, "Pembuatan Kuis Berhasil", { id: quizId, title: createQuizData.title, status: createQuizData.status, xpReward: createQuizData.xpReward });

  // ─── LANGKAH 4: Dosen Menambahkan Pertanyaan ke Kuis ────────────────────
  logInfo(`Menambahkan pertanyaan ke kuis ID: ${quizId}...`);
  const createQRes = await fetch(`${BASE_URL}/quiz-questions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${dosenToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      quizId: quizId,
      question: "Siapa pembuat program asisten Antigravity?",
      optionA: "Google DeepMind Team",
      optionB: "Browser Default",
      optionC: "Placeholder Inc",
      optionD: "Tidak Diketahui",
      correctAnswer: "A",
    }),
  });
  const createQData = await createQRes.json();
  if (!createQRes.ok) logError(`Gagal menambah pertanyaan: ${JSON.stringify(createQData)}`);
  questionId = createQData.id;
  log(4, "Penambahan Pertanyaan Berhasil", {
    questionId,
    question: createQData.question,
    options: createQData.options,
    correctAnswer: "A (Google DeepMind Team)"
  });

  // ─── LANGKAH 5: Login Mahasiswa ─────────────────────────────────────────
  logInfo("Mencoba login sebagai Mahasiswa...");
  const loginStudentRes = await fetch(`${BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "mahasiswa@ruangdosen.ac.id", password: "password123" }),
  });
  const loginStudentData = await loginStudentRes.json();
  if (!loginStudentRes.ok) logError(`Login mahasiswa gagal: ${JSON.stringify(loginStudentData)}`);
  studentToken = loginStudentData.access_token;

  // Cek profil mahasiswa awal untuk melihat XP awal
  const profileRes = await fetch(`${BASE_URL}/auth/profile`, {
    headers: { Authorization: `Bearer ${studentToken}` },
  });
  const profileData = await profileRes.json();
  if (!profileRes.ok) logError(`Fetch profil awal mahasiswa gagal: ${JSON.stringify(profileData)}`);
  const initialXp = profileData.xp || 0;
  log(5, "Login Mahasiswa & Profil Awal", { name: profileData.name, initial_xp: initialXp });

  // ─── LANGKAH 6: Mahasiswa Mengerjakan Kuis ──────────────────────────────
  logInfo(`Mengambil pertanyaan kuis ID: ${quizId} dari sisi mahasiswa...`);
  const studentQuizRes = await fetch(`${BASE_URL}/quizzes/${quizId}/questions`, {
    headers: { Authorization: `Bearer ${studentToken}` },
  });
  const studentQuizQuestions = await studentQuizRes.json();
  if (!studentQuizRes.ok) logError(`Gagal mengambil pertanyaan kuis: ${JSON.stringify(studentQuizQuestions)}`);

  logInfo("Mengirimkan jawaban mahasiswa ke kuis...");
  // Kirim jawaban benar ("A") untuk pertanyaan yang baru saja dibuat
  const submitRes = await fetch(`${BASE_URL}/quizzes/${quizId}/submit`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${studentToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      answers: [
        { questionId: questionId, answer: "A" }
      ]
    }),
  });
  const submitData = await submitRes.json();
  if (!submitRes.ok) logError(`Submit kuis gagal: ${JSON.stringify(submitData)}`);
  log(6, "Submit Jawaban Kuis Berhasil", {
    score: submitData.score,
    passed: submitData.passed,
    xpGained: submitData.xpGained,
    details: submitData.details
  });

  // ─── LANGKAH 7: Verifikasi XP Mahasiswa Bertambah ───────────────────────
  logInfo("Memverifikasi perolehan XP baru di profil mahasiswa...");
  const finalProfileRes = await fetch(`${BASE_URL}/auth/profile`, {
    headers: { Authorization: `Bearer ${studentToken}` },
  });
  const finalProfileData = await finalProfileRes.json();
  if (!finalProfileRes.ok) logError(`Fetch profil akhir mahasiswa gagal: ${JSON.stringify(finalProfileData)}`);
  const finalXp = finalProfileData.xp || 0;
  const xpDifference = finalXp - initialXp;

  log(7, "Verifikasi Perubahan XP", {
    initial_xp: initialXp,
    final_xp: finalXp,
    xp_gained_calculated: xpDifference,
    xp_match_expected: xpDifference === 120 ? "✅ SINKRON (120 XP)" : "❌ KESALAHAN SINKRONISASI"
  });

  if (xpDifference !== 120) {
    logError(`Perbedaan XP tidak sesuai. Diharapkan +120, didapatkan +${xpDifference}`);
  }

  // ─── RINGKASAN ───────────────────────────────────────────────────────────
  console.log("\n" + "=".repeat(60));
  console.log("  🎉 INTEGRASI BERHASIL! Alur Kuis, Jawaban & XP Terverifikasi.");
  console.log("=".repeat(60));
  console.log(`  Kuis ID     : ${quizId}`);
  console.log(`  Kuis Judul  : ${quizTitle}`);
  console.log(`  Mahasiswa   : ${finalProfileData.name}`);
  console.log(`  XP Awal     : ${initialXp}`);
  console.log(`  XP Akhir    : ${finalXp}`);
  console.log("=".repeat(60) + "\n");
}

runVerification().catch((err) => {
  console.error("\n🔴 ERROR TIDAK TERDUGA:", err.message);
  process.exit(1);
});
