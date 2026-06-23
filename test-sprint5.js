const http = require('http');

function request(method, path, data = null, token = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3001,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json',
      },
    };
    if (token) options.headers['Authorization'] = `Bearer ${token}`;

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => (body += chunk));
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(body) });
        } catch (e) {
          resolve({ status: res.statusCode, data: body });
        }
      });
    });
    req.on('error', (e) => reject(e));
    if (data) req.write(JSON.stringify(data));
    req.end();
  });
}

async function runTests() {
  console.log('=== STARTING LIVE SPRINT 5 E2E HTTP TESTS ===');
  let tokenAdmin, tokenDosen, tokenMhs1, tokenMhs2;
  let adminId, dosenId, mhs1Id, mhs2Id;
  let courseId, moduleId, labId, assignmentId, quizId, materialId;
  let labSubmissionId;

  const ts = Date.now();
  const adminEmail = `admin_sp5_${ts}@test.com`;
  const dosenEmail = `dosen_sp5_${ts}@test.com`;
  const mhs1Email = `mhs1_sp5_${ts}@test.com`;
  const mhs2Email = `mhs2_sp5_${ts}@test.com`;

  try {
    // 1. REGISTER & LOGIN USERS
    console.log('\n[1] Registering users...');
    
    // Register Admin
    await request('POST', '/auth/register', { name: 'Admin SP5', email: adminEmail, password: 'password123', role: 'ADMIN' });
    let resAdmin = await request('POST', '/auth/login', { email: adminEmail, password: 'password123' });
    tokenAdmin = resAdmin.data.access_token;
    adminId = resAdmin.data.user.id;
    console.log(' - Admin registered.');

    // Register Dosen
    await request('POST', '/auth/register', { name: 'Dosen SP5', email: dosenEmail, password: 'password123', role: 'LECTURER' });
    let resDosen = await request('POST', '/auth/login', { email: dosenEmail, password: 'password123' });
    tokenDosen = resDosen.data.access_token;
    dosenId = resDosen.data.user.id;
    console.log(' - Dosen registered.');

    // Register Student 1: Semester 3, Angkatan 2024
    await request('POST', '/auth/register', { name: 'Mhs Semester 3', email: mhs1Email, password: 'password123', role: 'STUDENT', angkatan: 2024, semester: 3 });
    let resMhs1 = await request('POST', '/auth/login', { email: mhs1Email, password: 'password123' });
    tokenMhs1 = resMhs1.data.access_token;
    mhs1Id = resMhs1.data.user.id;
    console.log(' - Student 1 (Sem 3, Angkatan 2024) registered.');

    // Register Student 2: Semester 4, Angkatan 2024
    await request('POST', '/auth/register', { name: 'Mhs Semester 4', email: mhs2Email, password: 'password123', role: 'STUDENT', angkatan: 2024, semester: 4 });
    let resMhs2 = await request('POST', '/auth/login', { email: mhs2Email, password: 'password123' });
    tokenMhs2 = resMhs2.data.access_token;
    mhs2Id = resMhs2.data.user.id;
    console.log(' - Student 2 (Sem 4, Angkatan 2024) registered.');

    // 2. VERIFY COHORT FILTERING (FASE 9)
    console.log('\n[2] Verifying cohort course catalog filtering...');
    
    // Create course targeting Semester 3, Angkatan 2024
    let courseRes = await request('POST', '/courses', { 
      title: `Aljabar Linear SP5 ${ts}`, 
      instructorId: dosenId, 
      targetSemester: 3, 
      targetAngkatan: 2024 
    }, tokenDosen);
    courseId = courseRes.data.id;
    console.log(` - Created course targeting Sem 3, Angkatan 2024 (ID: ${courseId}).`);

    // Student 1 (Sem 3) lists courses
    let mhs1Courses = await request('GET', '/courses', null, tokenMhs1);
    const mhs1HasIt = mhs1Courses.data.some(c => c.id === courseId);
    console.log(` - Course visible to Student 1 (Sem 3): ${mhs1HasIt ? 'YES (Correct)' : 'NO (Incorrect)'}`);

    // Student 2 (Sem 4) lists courses
    let mhs2Courses = await request('GET', '/courses', null, tokenMhs2);
    const mhs2HasIt = mhs2Courses.data.some(c => c.id === courseId);
    console.log(` - Course visible to Student 2 (Sem 4): ${mhs2HasIt ? 'YES (Incorrect)' : 'NO (Correct)'}`);

    if (!mhs1HasIt || mhs2HasIt) {
      throw new Error('Cohort visibility filtering logic is broken!');
    }

    // Enroll Student 1 in the course
    await request('POST', `/courses/${courseId}/enroll`, null, tokenMhs1);
    console.log(' - Student 1 enrolled in course.');

    // 3. VERIFY ADMIN BYPASS FOR CONTENT CREATION & COHORT NOTIFICATIONS (FASE 10 & 11)
    console.log('\n[3] Creating module and contents using Admin (Admin Bypass check)...');

    // Admin creates module inside the course (which Dosen owns)
    let moduleRes = await request('POST', `/courses/${courseId}/modules`, {
      title: 'Modul Vektor',
      description: 'Definisi dan sifat-sifat vektor'
    }, tokenAdmin);
    moduleId = moduleRes.data.id;
    console.log(` - Module created by Admin (ID: ${moduleId})`);

    // Admin creates Practical Lab (Admin Bypass + Notif check)
    let labRes = await request('POST', '/labs', {
      title: 'Lab Vektor 1',
      instructions: 'Kerjakan soal vektor di lampiran.',
      moduleId
    }, tokenAdmin);
    labId = labRes.data.id;
    console.log(` - Lab created by Admin (ID: ${labId})`);

    // Admin creates Assignment (Admin Bypass + Notif check)
    let assignRes = await request('POST', '/assignments', {
      title: 'Tugas Vektor 1',
      description: 'Kumpulkan tugas format pdf.',
      deadline: new Date(Date.now() + 86400000).toISOString(),
      moduleId
    }, tokenAdmin);
    assignmentId = assignRes.data.id;
    console.log(` - Assignment created by Admin (ID: ${assignmentId})`);

    // Admin creates Quiz (Admin Bypass + Notif check)
    let quizRes = await request('POST', '/quizzes', {
      title: 'Kuis Vektor 1',
      moduleId,
      xpReward: 50,
      passingScore: 70
    }, tokenAdmin);
    quizId = quizRes.data.id;
    console.log(` - Quiz created by Admin (ID: ${quizId})`);

    // Admin creates Material (Admin Bypass + Notif check)
    let materialRes = await request('POST', '/materials', {
      title: 'Buku Aljabar Vektor',
      type: 'DOCUMENT',
      content: 'Materi dasar aljabar vektor.',
      moduleId
    }, tokenAdmin);
    materialId = materialRes.data.id;
    console.log(` - Material created by Admin (ID: ${materialId})`);

    // 4. VERIFY COHORT-SPECIFIC NOTIFICATIONS (FASE 11)
    console.log('\n[4] Checking cohort-specific notifications...');

    // Student 1 (Enrolled in course) checks notifications
    let mhs1Notifs = await request('GET', '/notifications', null, tokenMhs1);
    console.log(` - Student 1 Notification count: ${mhs1Notifs.data.length}`);
    const mhs1HasNotifs = mhs1Notifs.data.some(n => n.title.includes('Praktikum') || n.title.includes('Tugas') || n.title.includes('Kuis') || n.title.includes('Materi'));
    console.log(`   - Enrolled student received cohort notifications: ${mhs1HasNotifs ? 'YES (Correct)' : 'NO (Incorrect)'}`);

    // Student 2 (NOT Enrolled in course) checks notifications
    let mhs2Notifs = await request('GET', '/notifications', null, tokenMhs2);
    console.log(` - Student 2 Notification count: ${mhs2Notifs.data.length}`);
    const mhs2HasNotifs = mhs2Notifs.data.some(n => n.title.includes('Praktikum') || n.title.includes('Tugas') || n.title.includes('Kuis') || n.title.includes('Materi'));
    console.log(`   - Unenrolled student received cohort notifications: ${mhs2HasNotifs ? 'YES (Incorrect)' : 'NO (Correct)'}`);

    if (!mhs1HasNotifs || mhs2HasNotifs) {
      throw new Error('Cohort-specific notification logic is broken!');
    }

    // 5. VERIFY ADMIN BYPASS FOR SUBMISSION AND GRADING (FASE 10)
    console.log('\n[5] Verifying Admin Bypass for submission viewing and grading...');

    // Student 1 submits practical lab
    let subRes = await request('POST', `/labs/${labId}/submit`, {
      fileUrl: 'http://uploads/vektor_sub.pdf',
      note: 'Selesai pak'
    }, tokenMhs1);
    labSubmissionId = subRes.data.id;
    console.log(` - Student 1 submitted lab (Submission ID: ${labSubmissionId}).`);

    // Admin grades student's lab (Admin Bypass check!)
    let gradeRes = await request('PUT', `/lab-submissions/${labSubmissionId}/grade`, {
      score: 98,
      feedback: 'Kerja bagus'
    }, tokenAdmin);
    console.log(` - Admin graded lab (Grade Status: ${gradeRes.status}, Score: ${gradeRes.data.score})`);

    if (gradeRes.status !== 200 || gradeRes.data.score !== 98) {
      throw new Error('Admin bypass for grading failed!');
    }

    console.log('\n✅ ALL SPRINT 5 E2E TESTS COMPLETED SUCCESSFULLY!');
  } catch (error) {
    console.error('\n❌ TEST FAILED:', error.message || error);
    process.exit(1);
  }
}

runTests();
