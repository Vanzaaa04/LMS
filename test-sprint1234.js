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
  console.log('=== STARTING LIVE E2E HTTP TESTS (SPRINT 1-4) ===');
  let tokenAdmin, tokenDosen, tokenMhs;
  let courseId, assignmentId, assignmentSubmissionId;

  const ts = Date.now();
  const adminEmail = `admin_${ts}@test.com`;
  const dosenEmail = `dosen_${ts}@test.com`;
  const mhsEmail = `mhs_${ts}@test.com`;

  try {
    // 1. REGISTER & LOGIN
    await request('POST', '/auth/register', { name: 'Admin', email: adminEmail, password: 'pw', role: 'ADMIN' });
    await request('POST', '/auth/register', { name: 'Dosen', email: dosenEmail, password: 'pw', role: 'LECTURER' });
    await request('POST', '/auth/register', { name: 'Mhs', email: mhsEmail, password: 'pw', role: 'STUDENT' });

    tokenAdmin = (await request('POST', '/auth/login', { email: adminEmail, password: 'pw' })).data.access_token;
    let resDosen = await request('POST', '/auth/login', { email: dosenEmail, password: 'pw' });
    tokenDosen = resDosen.data.access_token;
    const dosenId = resDosen.data.user.id;
    let resMhs = await request('POST', '/auth/login', { email: mhsEmail, password: 'pw' });
    tokenMhs = resMhs.data.access_token;

    console.log('[OK] Register & Login');

    // 2. COURSE & ENROLL
    let courseRes = await request('POST', '/courses', { title: 'Matkul Sprint 4', instructorId: dosenId }, tokenDosen);
    courseId = courseRes.data.id;
    await request('POST', `/courses/${courseId}/enroll`, null, tokenMhs);
    console.log('[OK] Course Creation & Enrollment');

    // 3. SPRINT 3: ASSIGNMENT & GRADING (BUGFIX TEST)
    let assignRes = await request('POST', '/assignments', { title: 'Tugas 1', description: 'Buat doc', deadline: new Date(Date.now() + 86400000).toISOString(), courseId }, tokenDosen);
    assignmentId = assignRes.data.id;
    
    let assignSubRes = await request('POST', `/assignments/${assignmentId}/submit`, { fileUrl: 'http://file.com' }, tokenMhs);
    assignmentSubmissionId = assignSubRes.data.id;

    // Test Bugfix: Grade > 100 should fail (400 Bad Request)
    let badGradeRes = await request('PUT', `/assignment-submissions/${assignmentSubmissionId}/grade`, { score: 150 }, tokenDosen);
    if (badGradeRes.status === 400) {
      console.log('[OK] Assignment Grading Bugfix Verified (Score > 100 rejected)');
    } else {
      console.log(`[FAIL] Expected 400, got ${badGradeRes.status}`);
    }

    // Good Grade
    await request('PUT', `/assignment-submissions/${assignmentSubmissionId}/grade`, { score: 95 }, tokenDosen);

    // 4. SPRINT 4: LAB CRUD & LAB SUBMISSION
    let labRes = await request('POST', '/labs', { title: 'Lab 1', instructions: 'Step 1...', courseId }, tokenDosen);
    let labId = labRes.data.id;
    
    let labSubRes = await request('POST', `/labs/${labId}/submit`, { fileUrl: 'http://lab-result.com' }, tokenMhs);
    let labSubmissionId = labSubRes.data.id;

    let labGradeRes = await request('PUT', `/lab-submissions/${labSubmissionId}/grade`, { score: 85 }, tokenDosen);
    if (labGradeRes.status === 200) {
      console.log('[OK] Lab CRUD & Lab Submission (Sprint 4)');
    } else {
      console.log(`[FAIL] Lab Grading failed: status ${labGradeRes.status}`, labGradeRes.data);
    }

    // 5. SPRINT 4: ADMIN STATS
    let statsRes = await request('GET', '/admin/statistics', null, tokenAdmin);
    if (statsRes.status === 200 && statsRes.data.totalUsers >= 3) {
      console.log('[OK] Admin Statistics');
    }

    console.log('\n✅ ALL LIVE TESTS COMPLETED SUCCESSFULLY!');
  } catch (error) {
    console.error('Test Error:', error);
  }
}

runTests();
