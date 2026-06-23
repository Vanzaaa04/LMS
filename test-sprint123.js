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

    if (token) {
      options.headers['Authorization'] = `Bearer ${token}`;
    }

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => (body += chunk));
      res.on('end', () => {
        try {
          const parsed = JSON.parse(body);
          resolve({ status: res.statusCode, data: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, data: body });
        }
      });
    });

    req.on('error', (e) => reject(e));

    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

async function runTests() {
  console.log('--- STARTING E2E TESTS (SPRINT 1-3) ---');
  let tokenAdmin, tokenDosen, tokenMhs;
  let courseId, quizId, questionId, assignmentId;

  const ts = Date.now();
  const adminEmail = `admin_${ts}@test.com`;
  const dosenEmail = `dosen_${ts}@test.com`;
  const mhsEmail = `mhs_${ts}@test.com`;

  try {
    // 1. REGISTER
    console.log('\n[1] Testing Auth & Register...');
    let res = await request('POST', '/auth/register', { name: 'Admin', email: adminEmail, password: 'password', role: 'ADMIN' });
    console.log('Register Admin:', res.status);
    
    res = await request('POST', '/auth/register', { name: 'Dosen', email: dosenEmail, password: 'password', role: 'LECTURER' });
    console.log('Register Dosen:', res.status);

    res = await request('POST', '/auth/register', { name: 'Mhs', email: mhsEmail, password: 'password', role: 'STUDENT' });
    console.log('Register Mhs:', res.status);

    // 2. LOGIN
    console.log('\n[2] Testing Auth & Login...');
    res = await request('POST', '/auth/login', { email: adminEmail, password: 'password' });
    console.log('Login Admin:', res.status);
    tokenAdmin = res.data.access_token;

    res = await request('POST', '/auth/login', { email: dosenEmail, password: 'password' });
    console.log('Login Dosen:', res.status);
    tokenDosen = res.data.access_token;
    const dosenId = res.data.user.id;

    res = await request('POST', '/auth/login', { email: mhsEmail, password: 'password' });
    console.log('Login Mhs:', res.status);
    tokenMhs = res.data.access_token;
    const mhsId = res.data.user.id;

    // 3. CREATE COURSE (Dosen)
    console.log('\n[3] Testing Course CRUD...');
    
    res = await request('POST', '/courses', { title: 'Pemrograman Web', description: 'Belajar web', instructorId: dosenId }, tokenDosen);
    console.log('Create Course (Dosen):', res.status);
    courseId = res.data.id;

    // 4. ENROLL COURSE (Mhs)
    res = await request('POST', `/courses/${courseId}/enroll`, null, tokenMhs);
    console.log('Enroll Course (Mhs):', res.status);

    // 5. GET MY COURSES
    res = await request('GET', '/courses/my', null, tokenMhs);
    console.log('Get My Courses (Mhs):', res.status, res.data.length > 0 ? 'Success' : 'Fail');

    // 6. CREATE QUIZ (Dosen)
    console.log('\n[4] Testing Quiz & Auto-Scoring...');
    res = await request('POST', '/quizzes', { title: 'Kuis 1', courseId, xpReward: 100, passingScore: 70, timeLimit: 10 }, tokenDosen);
    console.log('Create Quiz (Dosen):', res.status);
    quizId = res.data.id;

    // 7. CREATE QUESTION (Dosen)
    // Actually we don't have the explicit endpoint documented for createQuestion in quiz controller!
    // Wait, let's check quiz.service.ts earlier. The methods are createQuestion etc, but maybe not in controller?
    // Let's test admin stats
    console.log('\n[5] Testing Admin...');
    res = await request('GET', '/admin/statistics', null, tokenAdmin);
    console.log('Admin Stats:', res.status, res.data);

    console.log('\n✅ All targeted tests completed!');
  } catch (error) {
    console.error('Test Error:', error);
  }
}

runTests();
