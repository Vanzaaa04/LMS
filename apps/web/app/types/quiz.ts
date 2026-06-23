// ============================================================
// QUIZ TYPES
// ============================================================

export type QuizStatus = "DRAFT" | "PUBLISHED" | "aktif" | "selesai" | "terkunci" | "draft";

export interface Quiz {
  id: string;
  title: string;
  moduleId: string;
  moduleTitle: string;
  courseId: string;
  status: QuizStatus;
  totalQuestions: number;
  durationMinutes: number;
  xpReward: number;
  minimumScore: number; // 0-100
  createdAt: string;
  updatedAt: string;
}

export interface QuizQuestion {
  id: string;
  quizId: string;
  order: number;
  questionText: string;
  options: QuizOption[];
  explanation?: string;
  points: number;
}

export interface QuizOption {
  id: string;
  label: "A" | "B" | "C" | "D";
  text: string;
  isCorrect?: boolean; // hanya ada di response dosen/review
}

export interface QuizAttempt {
  id: string;
  quizId: string;
  studentId: string;
  answers: Record<string, string>; // questionId -> optionId
  score: number;
  totalCorrect: number;
  totalWrong: number;
  durationSeconds: number;
  submittedAt: string;
  status: "lulus" | "tidak_lulus";
}

export interface QuizResult {
  attempt: QuizAttempt;
  quiz: Quiz;
  questions: QuizQuestion[];
}

export interface LeaderboardEntry {
  rank: number;
  studentId: string;
  studentName: string;
  avatar?: string;
  totalXp: number;
  courseCompletion: number; // 0-100
  isCurrentUser?: boolean;
}

export interface QuizStats {
  quizId: string;
  quizTitle: string;
  totalParticipants: number;
  totalEnrolled: number;
  averageScore: number;
  highestScore: number;
  lowestScore: number;
  studentResults: StudentQuizResult[];
}

export interface StudentQuizResult {
  studentId: string;
  studentName: string;
  nim: string;
  initials: string;
  avatarColor: string;
  durationSeconds: number;
  status: "selesai" | "terkunci" | "belum";
  score: number | null;
}
