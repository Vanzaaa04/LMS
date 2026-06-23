
import axios from "axios";
import type {
  Quiz,
  QuizQuestion,
  QuizAttempt,
  QuizResult,
  LeaderboardEntry,
} from "@/app/types/quiz";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001",
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = sessionStorage.getItem("token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ─── Helper: mapping response API → tipe frontend ────────────────────────────

// Backend quiz shape:
// { id, title, courseId, xpReward, passingScore, timeLimit, _count: { questions } }
function mapQuiz(raw: any): Quiz {
  return {
    id: raw.id,
    title: raw.title,
    courseId: raw.courseId ?? "",
    moduleId: raw.moduleId ?? "",
    moduleTitle: raw.moduleTitle ?? "",
    status: raw.status ?? "DRAFT",
    totalQuestions: raw._count?.questions ?? raw.totalQuestions ?? 0,
    durationMinutes: raw.timeLimit ?? raw.durationMinutes ?? 30,
    xpReward: raw.xpReward ?? 0,
    minimumScore: raw.passingScore ?? raw.minimumScore ?? 70,
    createdAt: raw.createdAt ?? "",
    updatedAt: raw.updatedAt ?? "",
  };
}

// Backend question shape:
// { id, question, optionA, optionB, optionC, optionD }
// correctAnswer tidak dikirim ke mahasiswa
function mapQuestion(raw: any, index: number): QuizQuestion {
  return {
    id: raw.id,
    quizId: raw.quizId ?? "",
    order: index + 1,
    questionText: raw.question ?? raw.questionText ?? "",
    points: raw.points ?? 20,
    explanation: raw.explanation,
    options: [
      { id: `${raw.id}-A`, label: "A", text: raw.optionA ?? "", isCorrect: raw.correctAnswer === "A" },
      { id: `${raw.id}-B`, label: "B", text: raw.optionB ?? "", isCorrect: raw.correctAnswer === "B" },
      { id: `${raw.id}-C`, label: "C", text: raw.optionC ?? "", isCorrect: raw.correctAnswer === "C" },
      { id: `${raw.id}-D`, label: "D", text: raw.optionD ?? "", isCorrect: raw.correctAnswer === "D" },
    ],
  };
}

// Backend submit response:
// { score, passed, xpGained, details: [{questionId, question, correctAnswer, studentAnswer, isCorrect}] }
function mapSubmitResult(raw: any, quiz: Quiz, questions: QuizQuestion[], answers: Record<string, string>, startTime: number): QuizResult {
  const correct = raw.details?.filter((d: any) => d.isCorrect).length ?? 0;
  const wrong = raw.details?.filter((d: any) => !d.isCorrect && d.studentAnswer).length ?? 0;

  // Inject isCorrect ke options berdasarkan detail dari backend
  const questionsWithAnswer: QuizQuestion[] = questions.map((q) => {
    const detail = raw.details?.find((d: any) => d.questionId === q.id);
    if (!detail) return q;
    return {
      ...q,
      options: q.options.map((opt) => ({
        ...opt,
        isCorrect: opt.label === detail.correctAnswer,
      })),
    };
  });

  return {
    attempt: {
      id: "attempt-" + Date.now(),
      quizId: quiz.id,
      studentId: "",
      answers,
      score: raw.score ?? 0,
      totalCorrect: correct,
      totalWrong: wrong,
      durationSeconds: Math.round((Date.now() - startTime) / 1000),
      submittedAt: new Date().toISOString(),
      status: raw.passed ? "lulus" : "tidak_lulus",
    },
    quiz,
    questions: questionsWithAnswer,
  };
}

// Backend leaderboard shape:
// { position, id, name, xp }
function mapLeaderboard(raw: any, currentUserId?: string): LeaderboardEntry {
  return {
    rank: raw.position ?? raw.rank ?? 0,
    studentId: raw.id ?? raw.studentId ?? "",
    studentName: raw.name ?? raw.studentName ?? "",
    totalXp: raw.xp ?? raw.totalXp ?? 0,
    courseCompletion: raw.courseCompletion ?? 0,
    isCurrentUser: currentUserId ? raw.id === currentUserId : raw.isCurrentUser,
  };
}

// ─── Mahasiswa ────────────────────────────────────────────────────────────────

export async function getQuizzesByCourse(courseId: string): Promise<Quiz[]> {
  const { data } = await api.get("/quizzes", { params: { courseId } });
  return Array.isArray(data) ? data.map(mapQuiz) : [];
}

export async function getQuizzes(): Promise<Quiz[]> {
  const { data } = await api.get("/quizzes");
  return Array.isArray(data) ? data.map(mapQuiz) : [];
}

export async function getQuizById(quizId: string): Promise<Quiz> {
  const { data } = await api.get(`/quizzes/${quizId}`);
  return mapQuiz(data);
}

export async function getQuizQuestions(quizId: string): Promise<QuizQuestion[]> {
  const { data } = await api.get(`/quizzes/${quizId}/questions`);
  return Array.isArray(data) ? data.map(mapQuestion) : [];
}

// answers: { questionId -> optionId } misal { "abc": "abc-B" }
// Backend butuh: [{ questionId: "abc", answer: "B" }]
export async function submitQuiz(
  quizId: string,
  answers: Record<string, string>,
  quiz: Quiz,
  questions: QuizQuestion[],
  startTime: number
): Promise<QuizResult> {
  // Konversi answers dari { questionId: optionId } ke [{ questionId, answer: "A"/"B"/"C"/"D" }]
  const apiAnswers = Object.entries(answers).map(([questionId, optionId]) => {
    // optionId format: "{questionId}-A" atau "{questionId}-B" dll
    const label = optionId.split("-").pop() ?? "A";
    return { questionId, answer: label };
  });

  const { data } = await api.post(`/quizzes/${quizId}/submit`, { answers: apiAnswers });

  // Simpan result ke sessionStorage untuk halaman review
  const result = mapSubmitResult(data, quiz, questions, answers, startTime);
  sessionStorage.setItem(`quiz-result-${result.attempt.id}`, JSON.stringify(result));

  return result;
}

export async function getQuizSubmission(quizId: string): Promise<any | null> {
  try {
    const { data } = await api.get(`/quizzes/${quizId}/submission`);
    return data;
  } catch {
    return null;
  }
}

export async function getQuizSubmissionResult(quizId: string): Promise<QuizResult | null> {
  try {
    const { data: submission } = await api.get(`/quizzes/${quizId}/submission`);
    if (!submission) return null;

    const quiz = await getQuizById(quizId);
    const baseQuestions = await getQuizQuestions(quizId);

    const correctCount = submission.details?.filter((d: any) => d.isCorrect).length ?? 0;
    const wrong = submission.details?.filter((d: any) => !d.isCorrect && d.studentAnswer).length ?? 0;

    const answers: Record<string, string> = {};
    submission.details?.forEach((d: any) => {
      if (d.studentAnswer) {
        answers[d.questionId] = `${d.questionId}-${d.studentAnswer}`;
      }
    });

    const questions: QuizQuestion[] = baseQuestions.map((q) => {
      const detail = submission.details?.find((d: any) => d.questionId === q.id);
      if (!detail) return q;
      return {
        ...q,
        options: q.options.map((opt) => ({
          ...opt,
          isCorrect: opt.label === detail.correctAnswer,
        })),
      };
    });

    return {
      attempt: {
        id: submission.id,
        quizId: quiz.id,
        studentId: submission.studentId,
        answers,
        score: submission.score,
        totalCorrect: correctCount,
        totalWrong: wrong,
        durationSeconds: 0,
        submittedAt: submission.createdAt,
        status: submission.passed ? "lulus" : "tidak_lulus",
      },
      quiz,
      questions,
    };
  } catch (error) {
    console.error("Failed to load quiz submission from database", error);
    return null;
  }
}

export async function getMyAttempt(quizId: string): Promise<QuizAttempt | null> {
  try {
    const { data } = await api.get(`/quizzes/${quizId}/my-attempt`);
    return data;
  } catch {
    return null;
  }
}

export async function getLeaderboard(): Promise<LeaderboardEntry[]> {
  const { data } = await api.get("/leaderboard");
  const currentUserId = typeof window !== "undefined"
    ? sessionStorage.getItem("userId") ?? undefined
    : undefined;
  return Array.isArray(data) ? data.map((d) => mapLeaderboard(d, currentUserId)) : [];
}

export async function getQuizStats(quizId: string): Promise<any> {
  const { data } = await api.get(`/quizzes/${quizId}/submissions`);
  const enrollments = data.courseEnrollments || [];
  const submissions = data.submissions || [];

  const studentResults = enrollments.map((en: any) => {
    const student = en.user;
    const sub = submissions.find((s: any) => s.studentId === student.id);
    const email = student.email || "";
    const nim = email.includes("@") ? email.split("@")[0] : email;
    const initials = student.name ? student.name.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2) : "M";
    const colors = ["#ef4444", "#3b82f6", "#10b981", "#f59e0b", "#6366f1", "#8b5cf6", "#ec4899"];
    const avatarColor = colors[student.name.charCodeAt(0) % colors.length] || "#3b82f6";

    return {
      studentId: student.id,
      studentName: student.name,
      nim,
      initials,
      avatarColor,
      durationSeconds: null,
      status: sub ? "selesai" : "belum",
      score: sub ? sub.score : null,
    };
  });

  const scores = submissions.map((s: any) => s.score);
  const averageScore = scores.length > 0 ? Math.round(scores.reduce((a: number, b: number) => a + b, 0) / scores.length) : 0;
  const highestScore = scores.length > 0 ? Math.max(...scores) : 0;
  const lowestScore = scores.length > 0 ? Math.min(...scores) : 0;

  return {
    totalParticipants: submissions.length,
    totalEnrolled: enrollments.length,
    averageScore,
    highestScore,
    lowestScore,
    studentResults,
  };
}

// ─── Dosen ────────────────────────────────────────────────────────────────────

export async function createQuiz(payload: {
  title: string;
  moduleId: string;
  xpReward: number;
  minimumScore: number;
  durationMinutes: number;
  status?: string;
}): Promise<Quiz> {
  const { data } = await api.post("/quizzes", {
    title: payload.title,
    moduleId: payload.moduleId,
    xpReward: payload.xpReward,
    passingScore: payload.minimumScore,
    timeLimit: payload.durationMinutes,
    status: payload.status ?? "DRAFT",
  });
  return mapQuiz(data);
}

export async function updateQuiz(
  quizId: string,
  payload: Partial<{
    title: string;
    xpReward: number;
    minimumScore: number;
    durationMinutes: number;
    status: string;
  }>
): Promise<Quiz> {
  const body: Record<string, unknown> = {};
  if (payload.title !== undefined) body.title = payload.title;
  if (payload.xpReward !== undefined) body.xpReward = payload.xpReward;
  if (payload.minimumScore !== undefined) body.passingScore = payload.minimumScore;
  if (payload.durationMinutes !== undefined) body.timeLimit = payload.durationMinutes;
  if (payload.status !== undefined) body.status = payload.status;

  const { data } = await api.patch(`/quizzes/${quizId}`, body);
  return mapQuiz(data);
}

export async function deleteQuiz(quizId: string): Promise<void> {
  await api.delete(`/quizzes/${quizId}`);
}

export async function createQuestion(
  quizId: string,
  payload: {
    questionText: string;
    options: { label: string; text: string; isCorrect: boolean }[];
    explanation?: string;
    points: number;
  }
): Promise<QuizQuestion> {
  const correctOpt = payload.options.find((o) => o.isCorrect);
  const body = {
    quizId,
    question: payload.questionText,
    optionA: payload.options.find((o) => o.label === "A")?.text ?? "",
    optionB: payload.options.find((o) => o.label === "B")?.text ?? "",
    optionC: payload.options.find((o) => o.label === "C")?.text ?? "",
    optionD: payload.options.find((o) => o.label === "D")?.text ?? "",
    correctAnswer: correctOpt?.label ?? "A",
  };
  const { data } = await api.post("/quiz-questions", body);
  return mapQuestion(data, 0);
}

export async function updateQuestion(
  questionId: string,
  payload: Partial<{
    questionText: string;
    options: { label: string; text: string; isCorrect: boolean }[];
    explanation: string;
    points: number;
  }>
): Promise<QuizQuestion> {
  const body: Record<string, unknown> = {};
  if (payload.questionText !== undefined) body.question = payload.questionText;
  if (payload.options !== undefined) {
    body.optionA = payload.options.find((o) => o.label === "A")?.text ?? "";
    body.optionB = payload.options.find((o) => o.label === "B")?.text ?? "";
    body.optionC = payload.options.find((o) => o.label === "C")?.text ?? "";
    body.optionD = payload.options.find((o) => o.label === "D")?.text ?? "";
    const correct = payload.options.find((o) => o.isCorrect);
    if (correct) body.correctAnswer = correct.label;
  }
  const { data } = await api.put(`/quiz-questions/${questionId}`, body);
  return mapQuestion(data, 0);
}

export async function deleteQuestion(questionId: string): Promise<void> {
  await api.delete(`/quiz-questions/${questionId}`);
}
