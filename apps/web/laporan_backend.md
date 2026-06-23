# 📋 Laporan Lengkap Backend — Ruang Dosen

> **Tanggal Laporan:** 01 Juni 2026
> **Project:** Ruang Dosen (EduLab LMS)
> **Lokasi:** `apps/api`
> **Framework:** NestJS (TypeScript)
> **Database:** PostgreSQL + Prisma ORM
> **Dokumentasi API:** Swagger UI → `http://localhost:3001/api`

---

## 1. 🛠️ Teknologi & Stack

| Kategori | Teknologi | Versi |
|---|---|---|
| Framework | NestJS | ^11.0.1 |
| Bahasa | TypeScript | ^5.7.3 |
| ORM | Prisma | ^6.19.3 |
| Database | PostgreSQL | - |
| Autentikasi | JWT + Passport.js | ^11.0.2 |
| Hashing | Bcrypt | ^6.0.0 |
| Dokumentasi | Swagger UI | ^11.4.3 |
| Testing | Jest + Supertest | ^30.0.0 |

---

## 2. 🗄️ Skema Database (Prisma Models)

### Enum

```
Role         → ADMIN | LECTURER | STUDENT
MaterialType → TEXT | VIDEO | DOCUMENT
```

### Entitas & Relasi

```
User ──────────────────────────────────────────────────────────┐
  id, name, email, password, role (Role), xp (Int)            │
  ├── coursesTaught   → Course[]        (relasi: LECTURER)     │
  ├── enrollments     → Enrollment[]    (relasi: STUDENT)      │
  └── assignmentSubmissions → AssignmentSubmission[]           │
                                                               │
Course ────────────────────────────────────────────────────────┤
  id, title, description, instructorId → User                  │
  ├── materials   → Material[]                                  │
  ├── quizzes     → Quiz[]                                      │
  ├── assignments → Assignment[]                                │
  ├── labs        → PracticalLab[]                              │
  └── enrollments → Enrollment[]                                │
                                                               │
Material ──────────────────────────────────────────────────────┤
  id, title, url?, content?, type (MaterialType), courseId     │
                                                               │
Quiz ──────────────────────────────────────────────────────────┤
  id, title, passingScore (default 70), xpReward (default 100) │
  timeLimit (default 30), courseId                             │
  └── questions → QuizQuestion[]                               │
                                                               │
QuizQuestion ──────────────────────────────────────────────────┤
  id, quizId, question, options (Json), correctAnswer          │
                                                               │
Assignment ────────────────────────────────────────────────────┤
  id, title, description, deadline (DateTime), courseId        │
  └── submissions → AssignmentSubmission[]                     │
                                                               │
AssignmentSubmission ──────────────────────────────────────────┤
  id, assignmentId, studentId, fileUrl?, note?                 │
  status ("PENDING" | "GRADED"), score?, feedback?             │
  [UNIQUE: assignmentId + studentId]                           │
                                                               │
PracticalLab ──────────────────────────────────────────────────┤
  id, title, instructions, courseId                            │
                                                               │
Enrollment ────────────────────────────────────────────────────┘
  id, userId, courseId
  [UNIQUE: userId + courseId]
```

---

## 3. 📦 Modul yang Sudah Dibuat

Total modul yang terdaftar di `AppModule`:

```
AuthModule · CourseModule · MaterialModule · QuizModule
AssignmentModule · LeaderboardModule · AdminModule
```

---

## 4. 🔐 AuthModule — Autentikasi & Otorisasi

**File:** `src/auth/`

### Endpoint

| Method | Endpoint | Auth | Deskripsi |
|---|---|---|---|
| `POST` | `/auth/register` | ❌ Public | Mendaftarkan user baru (Student, Lecturer, Admin) |
| `POST` | `/auth/login` | ❌ Public | Login dan mendapatkan JWT Token |
| `GET` | `/auth/profile` | ✅ JWT | Melihat profil user yang sedang login |
| `PUT` | `/auth/profile` | ✅ JWT | Update nama / password (email & role diabaikan) |

### Business Logic (AuthService)

- **register():** Cek duplikat email → hash password (bcrypt, salt 10) → simpan ke DB → return user **tanpa** field `password`
- **login():** Cari user by email → compare password hash → generate JWT payload `{ sub: userId, role }` → return `{ access_token, user }`
- **getProfile():** Ambil data user `(name, email, role, xp, createdAt)` by `userId`
- **updateProfile():** Hanya bisa update `name` dan `password` (password di-hash ulang) — field `email` dan `role` **sengaja diabaikan** untuk keamanan

### Komponen Keamanan

| File | Fungsi |
|---|---|
| `jwt.strategy.ts` | Validasi JWT dan inject `req.user` |
| `jwt-auth.guard.ts` | Guard untuk memproteksi endpoint dengan JWT |
| `roles.decorator.ts` | Decorator `@Roles()` untuk menandai role yang diizinkan |
| `roles.guard.ts` | Guard RBAC yang memeriksa role dari JWT token |

---

## 5. 📚 CourseModule — Manajemen Kelas

**File:** `src/course/`

### Endpoint

| Method | Endpoint | Auth | Deskripsi |
|---|---|---|---|
| `POST` | `/courses` | ❌ Public | Buat kelas baru (body: title, description, instructorId) |
| `GET` | `/courses` | ❌ Public | Ambil semua kelas beserta data instruktur & jumlah peserta |
| `GET` | `/courses/my` | ✅ JWT | Ambil kelas yang diikuti oleh user yang login |
| `GET` | `/courses/:id` | ❌ Public | Ambil detail kelas beserta materials, quizzes, assignments, labs |
| `PATCH` | `/courses/:id` | ✅ JWT | Update kelas (hanya oleh instruktur kelas tersebut) |
| `DELETE` | `/courses/:id` | ✅ JWT | Hapus kelas (hanya oleh instruktur kelas tersebut) |
| `POST` | `/courses/:id/enroll` | ✅ JWT | Mahasiswa mendaftar ke kelas |

### Business Logic (CourseService)

- **create():** Validasi instructor exists → validasi role `LECTURER`/`ADMIN` → buat course
- **enroll():** Cek course exists → cek tidak boleh duplicate enrollment → buat enrollment
- **getMyCourses():** Ambil semua enrollment milik user, return list course beserta nama instruktur
- **findAll():** Include data instruktur (id, name, email, role, xp) + `_count.enrollments`
- **findOne():** Include semua relasi: materials, quizzes, assignments, labs
- **update() / remove():** Validasi `course.instructorId === userId` → Forbidden jika bukan pemilik

---

## 6. 📖 MaterialModule — Manajemen Materi Pembelajaran

**File:** `src/material/`

### Endpoint

| Method | Endpoint | Auth | Deskripsi |
|---|---|---|---|
| `POST` | `/materials` | ✅ JWT | Tambah materi baru ke kelas |
| `GET` | `/materials/:id` | ✅ JWT | Ambil detail satu materi |
| `PUT` | `/materials/:id` | ✅ JWT | Update materi (hanya oleh instruktur kelas) |
| `DELETE` | `/materials/:id` | ✅ JWT | Hapus materi (hanya oleh instruktur kelas) |

### Body Request (POST/PUT)
```json
{
  "title": "string",
  "type": "TEXT | VIDEO | DOCUMENT",
  "content": "string (opsional)",
  "url": "string (opsional)",
  "courseId": "string"
}
```

### Business Logic (MaterialService)

- **create():** Validasi course exists → validasi `course.instructorId === userId` → buat material
- **findOne():** Cari material, throw `NotFoundException` jika tidak ada
- **update() / remove():** Include relasi course → validasi kepemilikan instruktur → update/hapus

---

## 7. 📝 QuizModule — Manajemen Kuis

**File:** `src/quiz/`
**Terdiri dari 2 controller:** `QuizController` dan `QuizQuestionController`

### Endpoint Quiz

| Method | Endpoint | Auth | Deskripsi |
|---|---|---|---|
| `POST` | `/quizzes` | ✅ JWT | Buat kuis baru |
| `GET` | `/quizzes` | ✅ JWT | Ambil semua kuis (bisa filter `?courseId=`) |
| `GET` | `/quizzes/:id` | ✅ JWT | Ambil detail kuis (**tanpa `correctAnswer`** — untuk keamanan) |
| `PATCH` | `/quizzes/:id` | ✅ JWT | Update kuis (hanya instruktur) |
| `DELETE` | `/quizzes/:id` | ✅ JWT | Hapus kuis (hanya instruktur) |
| `POST` | `/quizzes/:id/submit` | ✅ JWT | Kerjakan & submit kuis |
| `GET` | `/quizzes/:id/questions` | ✅ JWT | Ambil daftar soal kuis (**tanpa `correctAnswer`**) |

### Endpoint Quiz Question

| Method | Endpoint | Auth | Deskripsi |
|---|---|---|---|
| `POST` | `/quiz-questions` | ✅ JWT | Tambah soal ke kuis (hanya instruktur) |
| `PUT` | `/quiz-questions/:id` | ✅ JWT | Update soal (hanya instruktur) |
| `DELETE` | `/quiz-questions/:id` | ✅ JWT | Hapus soal (hanya instruktur) |

### Business Logic (QuizService)

- **create():** Validasi course exists → buat quiz dengan default `timeLimit: 30`
- **findAll():** Include jumlah soal (`_count.questions`) per kuis
- **findOne():** **Sanitize response** — `correctAnswer` dihapus dari setiap soal sebelum dikembalikan ke client
- **submit():** Hitung jumlah jawaban benar → kalkulasi skor `(benar/total)*100` → cek `score >= passingScore` → jika lulus, **increment XP user** sebesar `quiz.xpReward`
- **createQuestion():** Validasi user adalah instruktur kuis → simpan options sebagai JSON `{optionA, optionB, optionC, optionD}`
- **getQuestionsForQuiz():** Format ulang JSON options menjadi field flat (optionA-D), **tanpa correctAnswer**

---

## 8. 📌 AssignmentModule — Manajemen Tugas

**File:** `src/assignment/`
**Terdiri dari 2 controller:** `AssignmentController` dan `AssignmentSubmissionController`

### Endpoint Assignment

| Method | Endpoint | Auth | Deskripsi |
|---|---|---|---|
| `POST` | `/assignments` | ✅ JWT | Buat tugas baru (hanya instruktur) |
| `GET` | `/assignments` | ❌ Public | Ambil semua tugas (filter `?courseId=`) |
| `GET` | `/assignments/:id` | ❌ Public | Ambil detail tugas |
| `PUT` | `/assignments/:id` | ✅ JWT | Update tugas (hanya instruktur kelas) |
| `DELETE` | `/assignments/:id` | ✅ JWT | Hapus tugas (hanya instruktur kelas) |
| `POST` | `/assignments/:id/submit` | ✅ JWT | Mahasiswa mengumpulkan tugas |
| `GET` | `/assignments/:id/submissions` | ✅ JWT | Lihat semua submisi (hanya instruktur) |

### Endpoint Assignment Submission

| Method | Endpoint | Auth | Deskripsi |
|---|---|---|---|
| `PUT` | `/assignment-submissions/:id/grade` | ✅ JWT | Nilai submisi (score + feedback, hanya instruktur) |

### Business Logic (AssignmentService)

- **create():** Validasi course exists → buat assignment (deadline dikonversi ke `Date`)
- **submit():** Validasi assignment exists → **cek enrollment mahasiswa di kelas** → cek tidak boleh submit duplikat → buat submisi dengan status `PENDING`
- **getSubmissions():** Validasi hanya instruktur kelas yang bisa melihat → return semua submisi beserta data student
- **gradeSubmission():** Validasi instruktur → update `{ score, feedback, status: "GRADED" }`
- **update() / remove():** Validasi `assignment.course.instructorId === userId`

---

## 9. 🏆 LeaderboardModule — Papan Peringkat

**File:** `src/leaderboard/`

### Endpoint

| Method | Endpoint | Auth | Deskripsi |
|---|---|---|---|
| `GET` | `/leaderboard` | ❌ Public | Ambil peringkat mahasiswa berdasarkan XP |

### Business Logic (LeaderboardService)

- **getLeaderboard():** Ambil semua user dengan `role: "STUDENT"` → urutkan `orderBy xp desc` → tambahkan field `position` (1, 2, 3...) ke setiap entri → return array dengan posisi, id, nama, xp

---

## 10. 👑 AdminModule — Manajemen Admin

**File:** `src/admin/`
**Proteksi:** Seluruh endpoint membutuhkan **JWT + Role ADMIN** (`@UseGuards(JwtAuthGuard, RolesGuard)` + `@Roles('ADMIN')`)

### Endpoint

| Method | Endpoint | Auth | Deskripsi |
|---|---|---|---|
| `GET` | `/admin/users` | ✅ ADMIN | Ambil semua user (bisa filter `?role=STUDENT/LECTURER`) |
| `PUT` | `/admin/users/:id` | ✅ ADMIN | Ubah role user |
| `DELETE` | `/admin/users/:id` | ✅ ADMIN | Hapus user (tidak bisa hapus akun sendiri) |
| `GET` | `/admin/statistics` | ✅ ADMIN | Statistik platform |

### Business Logic (AdminService)

- **getUsers():** Filter opsional berdasarkan `role`, diurutkan `createdAt desc`
- **updateRole():** Validasi user exists → update role
- **deleteUser():** Validasi user exists → hapus; controller tambahkan guard: `req.user.id === id` → throw `ForbiddenException`
- **getStatistics():** Jalankan 7 query **secara paralel** dengan `Promise.all()`:
  - `totalUsers`, `totalStudents`, `totalLecturers`, `totalAdmins`
  - `totalCourses`, `totalQuizzes`, `totalAssignments`

---

## 11. 🌱 Database Seeding (`prisma/seed.ts`)

Seed data awal yang tersedia untuk development/testing:

| Role | Email | Password |
|---|---|---|
| ADMIN | `admin@test.com` | `password123` |
| LECTURER | `dosen@test.com` | `password123` |
| STUDENT | `student@test.com` | `password123` |

> Seed menggunakan `upsert` sehingga aman dijalankan berulang kali.

---

## 12. ⚙️ Konfigurasi Global (main.ts)

- **Port:** `3001` (default, bisa di-override via env `PORT`)
- **CORS:** Enabled untuk semua origin (`app.enableCors()`)
- **Swagger UI:** Tersedia di `http://localhost:3001/api`
  - Title: *EduLab LMS - Ruang Dosen API*
  - JWT Auth: Terintegrasi dengan `addBearerAuth()`, `persistAuthorization: true`

---

## 13. 🗂️ Ringkasan Seluruh Endpoint

| # | Prefix | Jumlah Endpoint | Proteksi |
|---|---|---|---|
| 1 | `/auth` | 4 | Campuran (Public + JWT) |
| 2 | `/courses` | 7 | Campuran (Public + JWT) |
| 3 | `/materials` | 4 | Full JWT |
| 4 | `/quizzes` | 7 | Full JWT |
| 5 | `/quiz-questions` | 3 | Full JWT |
| 6 | `/assignments` | 7 | Campuran (Public + JWT) |
| 7 | `/assignment-submissions` | 1 | Full JWT |
| 8 | `/leaderboard` | 1 | Public |
| 9 | `/admin` | 4 | JWT + ADMIN Role |
| **Total** | | **38 Endpoint** | |

---

## 14. ✅ Fitur yang Sudah Lengkap

- [x] Sistem autentikasi JWT (register, login, profile)
- [x] Role-based Access Control (RBAC): ADMIN, LECTURER, STUDENT
- [x] CRUD penuh untuk Course dengan validasi ownership
- [x] CRUD penuh untuk Material dengan validasi ownership
- [x] CRUD penuh untuk Quiz beserta manajemen soal
- [x] Sistem enrollment mahasiswa ke kelas
- [x] Sistem submit & penilaian tugas (Assignment)
- [x] Sistem submit kuis dengan kalkulasi skor otomatis
- [x] Gamifikasi: XP otomatis bertambah saat lulus kuis
- [x] Papan peringkat (Leaderboard) berdasarkan XP
- [x] Dasbor statistik untuk Admin
- [x] Manajemen user oleh Admin (CRUD + ubah role)
- [x] Dokumentasi Swagger UI lengkap dengan JWT auth
- [x] Database seed untuk data testing awal
- [x] CORS enabled untuk integrasi Frontend

## 15. ⚠️ Catatan & Yang Belum Ada

- [ ] **PracticalLab** — Model sudah ada di schema, tapi **belum ada module/controller/service**-nya
- [ ] **Validasi Input** — Belum menggunakan `class-validator` / `ValidationPipe` (DTO validasi masih manual)
- [ ] **Rate Limiting** — Belum ada throttling untuk endpoint login
- [ ] **File Upload** — `fileUrl` pada assignment submission masih berupa string URL biasa, belum ada fitur upload file langsung
- [ ] **Refresh Token** — Sistem auth hanya menggunakan `access_token`, belum ada mekanisme refresh
