export interface TaskSubmission {
  grade: number | null;
  feedback: string | null;
  status: string; // 'Selesai', 'Menunggu Penilaian'
  fileName: string;
  fileUrl?: string;
  fileSize: string;
  submittedAt: string;
  studentName?: string;
  nim?: string;
  note?: string;
}

export interface LabSubmission {
  submittedAt: string;
  fileName: string;
  fileSize: string;
  note?: string;
}

export interface Task {
  id: string;
  labId: string;
  title: string;
  description: string;
  format: string[];
  deadline: string;
  deadlineRaw: Date;
  submission: TaskSubmission | null;
}

export interface Lab {
  id: string;
  title: string;
  dosen: string;
  semester: number;
  description: string;
  instructions?: string;
  courseName?: string;
  syllabus: string[];
  thumbnailColor?: string;
  isRegistered: boolean;
  category: string;
  labStatus: 'Belum Submit' | 'Sudah Submit, menunggu penilaian' | 'Sudah Dinilai';
  labGrade?: number | null;
  labSubmission?: LabSubmission | null;
  totalModules?: number;
  completedModules?: number;
  registeredAt?: string;
  registrationNotes?: string;
}

export interface StudentProfile {
  semester: number;
  name: string;
  nim: string;
  department: string;
  avatarLetter: string;
}

export interface QuizQuestion {
  id: string;
  questionText: string;
  options: string[];
  correctOptionIndex: number;
  explanation: string;
}

export interface Quiz {
  id: string;
  labId: string;
  code: string;
  title: string;
  description: string;
  timeLimitMinutes: number;
  questions: QuizQuestion[];
}

export interface StudentQuizAttempt {
  id: string;
  quizId: string;
  studentName: string;
  nim: string;
  score: number;
  correctAnswersCount: number;
  totalQuestionsCount: number;
  completedAt: string;
  selectedAnswers: { [questionId: string]: number };
}
