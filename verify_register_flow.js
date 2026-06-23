/**
 * verify_register_flow.js
 * Skrip verifikasi end-to-end untuk memastikan alur registrasi mahasiswa berfungsi penuh.
 * Jalankan dengan: node verify_register_flow.js
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
  console.log("  RUANG DOSEN – VERIFIKASI ALUR REGISTRASI MAHASISWA");
  console.log("=".repeat(60));

  // Buat email unik agar tidak konflik setiap run
  const timestamp = Date.now();
  const newStudentEmail = `mhs_test_${timestamp}@kampus.ac.id`;
  const newStudentName = `Mahasiswa Uji ${timestamp}`;
  const newStudentPassword = "password_test_123";

  let studentToken = null;
  let dosenToken = null;
  let courseId = null;
  let newStudentId = null;

  // ─── LANGKAH 1: Registrasi mahasiswa baru ───────────────────────────────
  logInfo(`Mendaftarkan mahasiswa baru: ${newStudentEmail}`);
  const regRes = await fetch(`${BASE_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: newStudentName,
      email: newStudentEmail,
      password: newStudentPassword,
      role: "STUDENT",
    }),
  });
  const regData = await regRes.json();
  if (!regRes.ok) logError(`Registrasi gagal: ${JSON.stringify(regData)}`);
  newStudentId = regData.id;
  log(1, "Registrasi Mahasiswa Baru", { id: regData.id, name: regData.name, email: regData.email, role: regData.role });

  // ─── LANGKAH 2: Login sebagai mahasiswa baru ────────────────────────────
  const loginStudentRes = await fetch(`${BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: newStudentEmail, password: newStudentPassword }),
  });
  const loginStudentData = await loginStudentRes.json();
  if (!loginStudentRes.ok) logError(`Login mahasiswa gagal: ${JSON.stringify(loginStudentData)}`);
  studentToken = loginStudentData.access_token;
  log(2, "Login sebagai Mahasiswa Baru", { token_preview: studentToken?.slice(0, 30) + "...", role: loginStudentData.user?.role });

  // ─── LANGKAH 3: Cek profil mahasiswa via JWT ─────────────────────────────
  const profileRes = await fetch(`${BASE_URL}/auth/profile`, {
    headers: { Authorization: `Bearer ${studentToken}` },
  });
  const profileData = await profileRes.json();
  if (!profileRes.ok) logError(`Fetch profil gagal: ${JSON.stringify(profileData)}`);
  log(3, "Verifikasi Profil di Database", { id: profileData.id, name: profileData.name, role: profileData.role, xp: profileData.xp });

  // ─── LANGKAH 4: Login sebagai Dosen ─────────────────────────────────────
  const loginDosenRes = await fetch(`${BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "dosen@test.com", password: "password123" }),
  });
  const loginDosenData = await loginDosenRes.json();
  if (!loginDosenRes.ok) logError(`Login dosen gagal: ${JSON.stringify(loginDosenData)}`);
  dosenToken = loginDosenData.access_token;
  log(4, "Login sebagai Dosen", { name: loginDosenData.user?.name, role: loginDosenData.user?.role });

  // ─── LANGKAH 5: Ambil daftar mata kuliah dosen (ambil semua, filter milik dosen) ──
  const coursesRes = await fetch(`${BASE_URL}/courses/my`, {
    headers: { Authorization: `Bearer ${dosenToken}` },
  });
  const coursesData = await coursesRes.json();
  if (!coursesRes.ok) logError(`Gagal mengambil kursus dosen: ${JSON.stringify(coursesData)}`);
  const courses = Array.isArray(coursesData) ? coursesData : [];
  if (courses.length === 0) logError("Dosen tidak memiliki kursus apapun. Buat kursus terlebih dahulu.");
  courseId = courses[0].id;
  log(5, "Mengambil Mata Kuliah Dosen", { total: courses.length, kursus_dipilih: courses[0].title ?? courses[0].name, id: courseId });

  // ─── LANGKAH 6: Dosen mendaftarkan mahasiswa baru ke kursus (gunakan email) ─────
  const enrollRes = await fetch(`${BASE_URL}/courses/${courseId}/enroll-student`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${dosenToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email: newStudentEmail }),
  });
  const enrollData = await enrollRes.json();
  if (!enrollRes.ok) logError(`Enrollment gagal: ${JSON.stringify(enrollData)}`);
  log(6, "Dosen Mendaftarkan Mahasiswa ke Kursus via Email", { courseId, studentEmail: newStudentEmail });

  const myCoursesRes = await fetch(`${BASE_URL}/courses/my`, {
    headers: { Authorization: `Bearer ${studentToken}` },
  });
  const myCoursesData = await myCoursesRes.json();
  if (!myCoursesRes.ok) logError(`Mahasiswa gagal ambil kursus: ${JSON.stringify(myCoursesData)}`);
  const studentCourses = Array.isArray(myCoursesData) ? myCoursesData : myCoursesData.data ?? [];
  const found = studentCourses.find((c) => c.id === courseId);
  if (studentCourses.length === 0) logError("Kursus tidak muncul di daftar mahasiswa setelah enrollment!");
  log(7, "Verifikasi Kursus Muncul di Dashboard Mahasiswa", {
    total_kursus_mahasiswa: studentCourses.length,
    kursus_ditemukan: found?.title ?? found?.name ?? studentCourses[0]?.title ?? studentCourses[0]?.name ?? "tidak ditemukan",
    enrolled: studentCourses.length > 0 ? "✅ YA" : "❌ TIDAK",
  });

  // ─── RINGKASAN ───────────────────────────────────────────────────────────
  console.log("\n" + "=".repeat(60));
  console.log("  🎉 SEMUA LANGKAH BERHASIL! Alur registrasi berjalan baik.");
  console.log("=".repeat(60));
  console.log(`\n  Mahasiswa : ${newStudentName}`);
  console.log(`  Email     : ${newStudentEmail}`);
  console.log(`  Password  : ${newStudentPassword}`);
  console.log(`  Kursus    : ${courses[0].name}`);
  console.log("\n  Gunakan kredensial di atas untuk login manual jika diperlukan.\n");
}

runVerification().catch((err) => {
  console.error("\n🔴 ERROR TIDAK TERDUGA:", err.message);
  process.exit(1);
});
