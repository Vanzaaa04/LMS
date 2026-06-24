-- CreateSchema


-- CreateEnum


-- CreateEnum


-- CreateTable
CREATE TABLE "User" (
    "id" VARCHAR(4000) NOT NULL,
    "name" VARCHAR(4000) NOT NULL,
    "email" VARCHAR(4000) NOT NULL,
    "password" VARCHAR(4000) NOT NULL,
    "role" VARCHAR(255) NOT NULL DEFAULT 'STUDENT',
    "xp" INTEGER NOT NULL DEFAULT 0,
    "maxCredits" INTEGER NOT NULL DEFAULT 24,
    "angkatan" INTEGER,
    "semester" INTEGER DEFAULT 1,
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Course" (
    "id" VARCHAR(4000) NOT NULL,
    "title" VARCHAR(4000) NOT NULL,
    "description" VARCHAR(4000),
    "className" VARCHAR(4000),
    "credits" INTEGER NOT NULL DEFAULT 3,
    "department" VARCHAR(4000) NOT NULL DEFAULT 'Computer Science',
    "semester" VARCHAR(4000) NOT NULL DEFAULT 'Fall Semester 2026',
    "teachingFormat" VARCHAR(4000) NOT NULL DEFAULT 'Teori dan Praktikum',
    "targetSemester" INTEGER NOT NULL DEFAULT 1,
    "targetAngkatan" INTEGER,
    "enrollmentCap" INTEGER NOT NULL DEFAULT 60,
    "status" VARCHAR(4000) NOT NULL DEFAULT 'Active',
    "instructorId" VARCHAR(4000),
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP NOT NULL,

    CONSTRAINT "Course_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CourseModule" (
    "id" VARCHAR(4000) NOT NULL,
    "title" VARCHAR(4000) NOT NULL,
    "description" VARCHAR(4000),
    "order" INTEGER NOT NULL DEFAULT 0,
    "courseId" VARCHAR(4000) NOT NULL,
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP NOT NULL,

    CONSTRAINT "CourseModule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Material" (
    "id" VARCHAR(4000) NOT NULL,
    "title" VARCHAR(4000) NOT NULL,
    "url" VARCHAR(4000),
    "content" VARCHAR(4000),
    "type" VARCHAR(255) NOT NULL,
    "moduleId" VARCHAR(4000) NOT NULL,
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP NOT NULL,

    CONSTRAINT "Material_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Quiz" (
    "id" VARCHAR(4000) NOT NULL,
    "title" VARCHAR(4000) NOT NULL,
    "status" VARCHAR(4000) NOT NULL DEFAULT 'DRAFT',
    "passingScore" INTEGER NOT NULL DEFAULT 70,
    "xpReward" INTEGER NOT NULL DEFAULT 100,
    "timeLimit" INTEGER NOT NULL DEFAULT 30,
    "maxAttempts" INTEGER NOT NULL DEFAULT 1,
    "gradingMethod" VARCHAR(4000) NOT NULL DEFAULT 'LATEST',
    "moduleId" VARCHAR(4000) NOT NULL,
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP NOT NULL,

    CONSTRAINT "Quiz_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QuizQuestion" (
    "id" VARCHAR(4000) NOT NULL,
    "quizId" VARCHAR(4000) NOT NULL,
    "question" VARCHAR(4000) NOT NULL,
    "options" VARCHAR(4000) NOT NULL,
    "correctAnswer" VARCHAR(4000) NOT NULL,

    CONSTRAINT "QuizQuestion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Assignment" (
    "id" VARCHAR(4000) NOT NULL,
    "title" VARCHAR(4000) NOT NULL,
    "description" VARCHAR(4000) NOT NULL,
    "status" VARCHAR(4000) NOT NULL DEFAULT 'DRAFT',
    "deadline" TIMESTAMP NOT NULL,
    "templateUrl" VARCHAR(4000),
    "templateName" VARCHAR(4000),
    "submissionRequirement" VARCHAR(4000),
    "maxAttempts" INTEGER NOT NULL DEFAULT 1,
    "gradingMethod" VARCHAR(4000) NOT NULL DEFAULT 'LATEST',
    "moduleId" VARCHAR(4000) NOT NULL,
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP NOT NULL,

    CONSTRAINT "Assignment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AssignmentSubmission" (
    "id" VARCHAR(4000) NOT NULL,
    "assignmentId" VARCHAR(4000) NOT NULL,
    "studentId" VARCHAR(4000) NOT NULL,
    "fileUrl" VARCHAR(4000),
    "note" VARCHAR(4000),
    "status" VARCHAR(4000) NOT NULL DEFAULT 'PENDING',
    "score" INTEGER,
    "feedback" VARCHAR(4000),
    "attemptNumber" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP NOT NULL,

    CONSTRAINT "AssignmentSubmission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PracticalLab" (
    "id" VARCHAR(4000) NOT NULL,
    "title" VARCHAR(4000) NOT NULL,
    "instructions" VARCHAR(4000) NOT NULL,
    "fileUrl" VARCHAR(4000),
    "fileName" VARCHAR(4000),
    "maxAttempts" INTEGER NOT NULL DEFAULT 1,
    "gradingMethod" VARCHAR(4000) NOT NULL DEFAULT 'LATEST',
    "moduleId" VARCHAR(4000) NOT NULL,
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP NOT NULL,

    CONSTRAINT "PracticalLab_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LabSubmission" (
    "id" VARCHAR(4000) NOT NULL,
    "labId" VARCHAR(4000) NOT NULL,
    "studentId" VARCHAR(4000) NOT NULL,
    "fileUrl" VARCHAR(4000),
    "note" VARCHAR(4000),
    "status" VARCHAR(4000) NOT NULL DEFAULT 'PENDING',
    "score" INTEGER,
    "feedback" VARCHAR(4000),
    "attemptNumber" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP NOT NULL,

    CONSTRAINT "LabSubmission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Enrollment" (
    "id" VARCHAR(4000) NOT NULL,
    "userId" VARCHAR(4000) NOT NULL,
    "courseId" VARCHAR(4000) NOT NULL,
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Enrollment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QuizSubmission" (
    "id" VARCHAR(4000) NOT NULL,
    "quizId" VARCHAR(4000) NOT NULL,
    "studentId" VARCHAR(4000) NOT NULL,
    "score" INTEGER NOT NULL,
    "passed" BOOLEAN NOT NULL,
    "details" VARCHAR(4000) NOT NULL,
    "attemptNumber" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "QuizSubmission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" VARCHAR(4000) NOT NULL,
    "title" VARCHAR(4000) NOT NULL,
    "message" VARCHAR(4000) NOT NULL,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "userId" VARCHAR(4000) NOT NULL,
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Enrollment_userId_courseId_key" ON "Enrollment"("userId", "courseId");

-- AddForeignKey
ALTER TABLE "Course" ADD CONSTRAINT "Course_instructorId_fkey" FOREIGN KEY ("instructorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CourseModule" ADD CONSTRAINT "CourseModule_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Material" ADD CONSTRAINT "Material_moduleId_fkey" FOREIGN KEY ("moduleId") REFERENCES "CourseModule"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Quiz" ADD CONSTRAINT "Quiz_moduleId_fkey" FOREIGN KEY ("moduleId") REFERENCES "CourseModule"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuizQuestion" ADD CONSTRAINT "QuizQuestion_quizId_fkey" FOREIGN KEY ("quizId") REFERENCES "Quiz"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Assignment" ADD CONSTRAINT "Assignment_moduleId_fkey" FOREIGN KEY ("moduleId") REFERENCES "CourseModule"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssignmentSubmission" ADD CONSTRAINT "AssignmentSubmission_assignmentId_fkey" FOREIGN KEY ("assignmentId") REFERENCES "Assignment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssignmentSubmission" ADD CONSTRAINT "AssignmentSubmission_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PracticalLab" ADD CONSTRAINT "PracticalLab_moduleId_fkey" FOREIGN KEY ("moduleId") REFERENCES "CourseModule"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LabSubmission" ADD CONSTRAINT "LabSubmission_labId_fkey" FOREIGN KEY ("labId") REFERENCES "PracticalLab"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LabSubmission" ADD CONSTRAINT "LabSubmission_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Enrollment" ADD CONSTRAINT "Enrollment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Enrollment" ADD CONSTRAINT "Enrollment_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuizSubmission" ADD CONSTRAINT "QuizSubmission_quizId_fkey" FOREIGN KEY ("quizId") REFERENCES "Quiz"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuizSubmission" ADD CONSTRAINT "QuizSubmission_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

