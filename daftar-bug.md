Berikut daftar bug yang ditemukan di fitur course:

🔴 Backend (API)
POST /courses tidak dilindungi JwtAuthGuard — siapa pun bisa membuat course tanpa autentikasi. (

course.controller.ts
)

GET /courses/:id tidak dilindungi guard — detail course (termasuk materials, quizzes, assignments, labs) bisa diakses tanpa login. (

course.controller.ts
)

update() menggunakan data: any — tidak ada validasi/typing pada body update, rentan menerima field sembarangan termasuk instructorId. (

course.service.ts
)

remove() tidak menghapus enrollment terkait — menghapus course tanpa cascade ke tabel enrollment, berpotensi data orphan / foreign key error tergantung skema Prisma. (

course.service.ts
)

Tidak ada role check di enroll() — LECTURER/ADMIN bisa mendaftar sebagai student ke course. (

course.service.ts
)

enroll mengembalikan HTTP 400 saat sudah enrolled — seharusnya 409 Conflict, tapi backend melempar BadRequestException. (

course.service.ts
)

🔴 Frontend – Data & Logic
Page material reader hardcode getCourseMaterialById(Number(courseId)) — API course menggunakan UUID (string), bukan number. Konversi ke Number() selalu menghasilkan NaN, sehingga page material selalu notFound(). (

materials/[materialId]/page.tsx
)

Page tugas hardcode getCourseDetailById(Number(courseId)) — sama dengan bug #7, course dari API tidak akan pernah ditemukan, selalu 404. (

tugas/page.tsx
)

getDemoStudentAccessToken() login ulang setiap request — tidak ada token caching/session, setiap server request ke getStudentMyCourses() atau getStudentEnrolledCourseIds() melakukan login baru ke backend. (

demoStudentSession.ts
)

getStudentEnrolledCourseIds() dipanggil dua kali secara bersamaan di getStudentCourses() — sekali untuk enrolled IDs, dan getStudentMyCourses() juga memanggil hal yang sama. (

courseRepository.ts
)

isCourseEnrolled() menganggap semua course non-notstart sebagai enrolled — course dengan status ongoing atau completed dari mock data selalu dianggap enrolled meskipun bukan dari API. (

courseEnrollment.ts
)

EnrollmentStore tidak pernah di-reset / di-unenroll — setelah enroll, tidak ada mekanisme untuk menghapus dari store (misalnya jika unenroll di backend). (

useEnrollmentStore.ts
)

🟡 Frontend – UI/UX
AssignmentSubmissionView — "Submit" button tidak melakukan apa-apa — SubmissionBox dan AssignmentActionBar tidak memiliki handler upload/submit aktual, hanya UI statis. (

AssignmentSubmissionView.tsx
)

Due Date dan Points di AssignmentStatusCard hardcoded — tidak menggunakan data assignment.meta dari props sama sekali. (

AssignmentSubmissionView.tsx
)

AssignmentBrief menggunakan konten hardcoded — brief, deskripsi, dan requirements tidak mengambil dari assignment.summary / data API. (

AssignmentSubmissionView.tsx
)

YouTube embed URL tidak dikonversi ke format embed — MaterialReaderView langsung menggunakan URL youtube.com/watch?v=... sebagai src iframe, yang tidak bisa diputar (harus youtube.com/embed/...). (

MaterialReaderView.tsx
)

MarkdownArticle menggunakan index sebagai key list item — saat konten berubah, React tidak bisa diff dengan benar. (

MaterialReaderView.tsx
)

Submit button di ContentItemCard tidak memiliki aksi — hanya dekoratif, tidak menavigasi ke halaman tugas. (

CourseDetailView.tsx
)

View Schedule button tidak memiliki aksi — button tanpa href dan tanpa handler. (

CourseDetailView.tsx
)

EmptyState di CoursesCatalogView menampilkan teks "Search" alih-alih emoji — <span>Search</span> seharusnya icon/emoji. (

CoursesCatalogView.tsx
)

Error HTTP non-409 saat enroll diabaikan — route handler route.ts mengembalikan alreadyEnrolled: true untuk 409, tapi CoursesCatalogView hanya mengecek response.ok, tidak membedakan error spesifik. (

route.ts
)