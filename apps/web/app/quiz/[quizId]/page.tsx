"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { CountdownTimer } from "@/app/components/quiz/CountdownTimer";
import { ChoiceButton } from "@/app/components/quiz/ChoiceButton";
import { QuizNavGrid } from "@/app/components/quiz/QuizNavGrid";
import { SubmitConfirmModal } from "@/app/components/quiz/SubmitConfirmModal";
import { QuizResultModal } from "@/app/components/quiz/QuizResultModal";
import { getQuizById, getQuizQuestions, submitQuiz } from "@/app/lib/api/quiz";
import type { Quiz, QuizQuestion, QuizResult } from "@/app/types/quiz";

// ─── Helper ───────────────────────────────────────────────────────────────────

function calculateResult(
  quiz: Quiz,
  questions: QuizQuestion[],
  answers: Record<string, string>,
  startTime: number
): QuizResult {
  let correct = 0;
  questions.forEach((q) => {
    const correctOpt = q.options.find((o) => o.isCorrect);
    if (correctOpt && answers[q.id] === correctOpt.id) correct++;
  });

  const score = Math.round((correct / questions.length) * 100);
  const durationSeconds = Math.round((Date.now() - startTime) / 1000);

  return {
    attempt: {
      id: "attempt-" + Date.now(),
      quizId: quiz.id,
      studentId: "student-1",
      answers,
      score,
      totalCorrect: correct,
      totalWrong: Object.keys(answers).length - correct,
      durationSeconds,
      submittedAt: new Date().toISOString(),
      status: score >= quiz.minimumScore ? "lulus" : "tidak_lulus",
    },
    quiz,
    questions,
  };
}

// ─── Sub-component: kartu soal ────────────────────────────────────────────────

interface QuestionCardProps {
  question: QuizQuestion;
  index: number;
  total: number;
  selectedAnswer: string | undefined;
  onAnswer: (optionId: string) => void;
  onPrev: () => void;
  onNext: () => void;
}

function QuestionCard({
  question, index, total, selectedAnswer, onAnswer, onPrev, onNext,
}: QuestionCardProps) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 space-y-4">
      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
        Soal {index + 1} dari {total}
      </p>
      <p className="text-base text-gray-800 leading-relaxed">
        {question.questionText}
      </p>
      <div className="space-y-2.5">
        {question.options.map((opt) => (
          <ChoiceButton
            key={opt.id}
            label={opt.label as "A" | "B" | "C" | "D"}
            text={opt.text}
            selected={selectedAnswer === opt.id}
            onClick={() => onAnswer(opt.id)}
          />
        ))}
      </div>
      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
        <button
          onClick={onPrev}
          disabled={index === 0}
          className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed text-sm font-medium transition-colors"
        >
          ← Prev
        </button>
        <span className="text-xs text-gray-400">{index + 1} / {total}</span>
        <button
          onClick={onNext}
          disabled={index === total - 1}
          className="px-4 py-2 rounded-lg bg-blue-700 text-white hover:bg-blue-800 disabled:opacity-40 disabled:cursor-not-allowed text-sm font-medium transition-colors"
        >
          Next →
        </button>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function QuizPage() {
  const router = useRouter();
  const params = useParams();
  const quizId = params.quizId as string;

  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [startTime, setStartTime] = useState(() => Date.now());
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<QuizResult | null>(null);
  const [timeExpiredToast, setTimeExpiredToast] = useState(false);

  useEffect(() => {
    async function loadQuiz() {
      try {
        const [quizData, questionsData] = await Promise.all([
          getQuizById(quizId),
          getQuizQuestions(quizId),
        ]);
        setQuiz(quizData);
        setQuestions(questionsData);
        setStartTime(Date.now()); // Reset start time when loaded
      } catch (error) {
        console.error("Failed to load quiz from API:", error);
      } finally {
        setIsLoading(false);
      }
    }
    loadQuiz();
  }, [quizId]);

  const currentQuestion = questions[currentIndex];

  const answeredIndices = new Set(
    questions.map((q, i) => (answers[q.id] ? i : -1)).filter((i) => i >= 0)
  );
  const unansweredCount = questions.length - answeredIndices.size;

 const doSubmit = useCallback(async () => {
    if (!quiz) return;
    setIsSubmitting(true);
    try {
      const res = await submitQuiz(quizId, answers, quiz, questions, startTime);
      setResult(res);
    } catch {
      // Fallback ke kalkulasi lokal jika API gagal
      const res = calculateResult(quiz, questions, answers, startTime);
      sessionStorage.setItem(`quiz-result-${res.attempt.id}`, JSON.stringify(res));
      setResult(res);
    } finally {
      setShowSubmitModal(false);
      setIsSubmitting(false);
    }
  }, [quizId, quiz, questions, answers, startTime]);

  const handleSubmit = useCallback(() => {
    if (answeredIndices.size === 0) {
      alert("Jawab minimal 1 soal sebelum submit.");
      return;
    }
    doSubmit();
  }, [answeredIndices.size, doSubmit]);

  const handleTimeExpire = useCallback(async () => {
    if (!quiz) return;
    setTimeExpiredToast(true);
    setShowSubmitModal(false);
    await new Promise((r) => setTimeout(r, 600));
    try {
      const res = await submitQuiz(quizId, answers, quiz, questions, startTime);
      setResult(res);
    } catch {
      const res = calculateResult(quiz, questions, answers, startTime);
      sessionStorage.setItem(`quiz-result-${res.attempt.id}`, JSON.stringify(res));
      setResult(res);
    }
  }, [quizId, quiz, questions, answers, startTime]);

  const navigatePrev = () => setCurrentIndex((i) => Math.max(0, i - 1));
  const navigateNext = () => setCurrentIndex((i) => Math.min(questions.length - 1, i + 1));

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center text-gray-400 text-sm">
        Memuat kuis...
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center text-gray-400 text-sm">
        Kuis tidak ditemukan atau gagal dimuat.
      </div>
    );
  }

  if (!currentQuestion) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center text-gray-400 text-sm">
        Soal tidak ditemukan.
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-full">

      {/* Sub-header: judul + timer */}
      <div className="bg-white border-b border-gray-100 px-6 py-3 flex items-center justify-between gap-4">
        <h2 className="text-sm font-semibold text-gray-700 truncate">{quiz.title}</h2>
        <CountdownTimer
          durationSeconds={quiz.durationMinutes * 60}
          onExpire={handleTimeExpire}
        />
      </div>

      {/* Toast waktu habis */}
      {timeExpiredToast && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-red-600 text-white px-5 py-2.5 rounded-xl shadow-lg text-sm font-medium whitespace-nowrap">
          ⏰ Waktu habis! Jawaban otomatis dikirim.
        </div>
      )}

      <div className="max-w-5xl mx-auto px-4 py-5">

        {/* Desktop layout */}
        <div className="hidden md:flex gap-6">
          <aside className="w-52 flex-shrink-0 space-y-4">
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                Navigasi Soal
              </p>
              <QuizNavGrid
                total={questions.length}
                current={currentIndex}
                answered={answeredIndices}
                onNavigate={setCurrentIndex}
              />
            </div>
            <button
              onClick={() => setShowSubmitModal(true)}
              className="w-full py-2.5 bg-blue-700 hover:bg-blue-800 text-white font-semibold rounded-xl text-sm transition-colors"
            >
              Finish Quiz
            </button>
          </aside>

          <main className="flex-1 min-w-0">
            <QuestionCard
              question={currentQuestion}
              index={currentIndex}
              total={questions.length}
              selectedAnswer={answers[currentQuestion.id]}
              onAnswer={(id) => setAnswers((p) => ({ ...p, [currentQuestion.id]: id }))}
              onPrev={navigatePrev}
              onNext={navigateNext}
            />
          </main>
        </div>

        {/* Mobile layout: soal dulu, navigasi di bawah */}
        <div className="md:hidden space-y-4">
          <QuestionCard
            question={currentQuestion}
            index={currentIndex}
            total={questions.length}
            selectedAnswer={answers[currentQuestion.id]}
            onAnswer={(id) => setAnswers((p) => ({ ...p, [currentQuestion.id]: id }))}
            onPrev={navigatePrev}
            onNext={navigateNext}
          />
          <div className="bg-white rounded-2xl border border-gray-200 p-4 space-y-3">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Navigasi Soal
            </p>
            <QuizNavGrid
              total={questions.length}
              current={currentIndex}
              answered={answeredIndices}
              onNavigate={setCurrentIndex}
            />
            <button
              onClick={() => setShowSubmitModal(true)}
              className="w-full py-2.5 bg-blue-700 hover:bg-blue-800 text-white font-semibold rounded-xl text-sm transition-colors"
            >
              Finish Quiz
            </button>
          </div>
        </div>
      </div>

      {/* Modals */}
      {showSubmitModal && (
        <SubmitConfirmModal
          unansweredCount={unansweredCount}
          onConfirm={handleSubmit}
          onCancel={() => setShowSubmitModal(false)}
          isSubmitting={isSubmitting}
        />
      )}
      {result && (
        <QuizResultModal
          result={result}
          onReview={() => router.push(`/quiz/${quizId}/review?attemptId=${result.attempt.id}`)}
          onBackToCourse={() => router.push(`/courses/${quiz.courseId}`)}
        />
      )}
    </div>
  );
}