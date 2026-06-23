"use client";

import { Suspense, useState, useEffect } from "react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import { CheckCircle, XCircle } from "lucide-react";
import { ChoiceButton } from "@/app/components/quiz/ChoiceButton";
import { QuizNavGrid } from "@/app/components/quiz/QuizNavGrid";
import type { QuizResult } from "@/app/types/quiz";
import { getQuizSubmissionResult } from "@/app/lib/api/quiz";

function QuizReviewContent() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const quizId = params.quizId as string;
  const attemptId = searchParams.get("attemptId") ?? "";

  const [result, setResult] = useState<QuizResult | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const loadResult = async () => {
      if (attemptId && !attemptId.startsWith("attempt-")) {
        const stored = sessionStorage.getItem(`quiz-result-${attemptId}`);
        if (stored) {
          setResult(JSON.parse(stored));
          return;
        }
      }

      // Fetch from database directly
      const res = await getQuizSubmissionResult(quizId);
      if (res) {
        setResult(res);
      }
    };
    loadResult();
  }, [attemptId, quizId]);

  if (!result) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const { attempt, quiz, questions } = result;
  const currentQuestion = questions[currentIndex];
  const myAnswer = attempt.answers[currentQuestion.id];

  const correctSet = new Set<number>();
  const wrongSet = new Set<number>();
  questions.forEach((q, i) => {
    const ans = attempt.answers[q.id];
    const correct = q.options.find((o) => o.isCorrect);
    if (ans && correct) {
      if (ans === correct.id) correctSet.add(i);
      else wrongSet.add(i);
    }
  });

  const answeredSet = new Set([...correctSet, ...wrongSet]);
  const isCurrentCorrect = correctSet.has(currentIndex);

  return (
    <div className="bg-gray-50 min-h-full">
      <div className="max-w-5xl mx-auto px-4 py-5">

        {/* DESKTOP */}
        <div className="hidden md:flex gap-6">
          <aside className="w-52 flex-shrink-0">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
              Navigasi Soal
            </p>
            <QuizNavGrid
              total={questions.length}
              current={currentIndex}
              answered={answeredSet}
              correct={correctSet}
              wrong={wrongSet}
              onNavigate={setCurrentIndex}
            />
            <button
              onClick={() => router.push(`/courses/${quiz.courseId}`)}
              className="w-full mt-5 py-2.5 bg-blue-700 hover:bg-blue-800 text-white font-semibold rounded-xl text-sm transition-colors"
            >
              Kembali ke kursus
            </button>
          </aside>

          <main className="flex-1 min-w-0">
            <ReviewScoreBar attempt={attempt} quiz={quiz} />
            <ReviewCard
              question={currentQuestion}
              index={currentIndex}
              total={questions.length}
              myAnswer={myAnswer}
              isCorrect={isCurrentCorrect}
              onPrev={() => setCurrentIndex((i) => Math.max(0, i - 1))}
              onNext={() => setCurrentIndex((i) => Math.min(questions.length - 1, i + 1))}
            />
          </main>
        </div>

        {/* MOBILE */}
        <div className="md:hidden space-y-4">
          <ReviewScoreBar attempt={attempt} quiz={quiz} />
          <ReviewCard
            question={currentQuestion}
            index={currentIndex}
            total={questions.length}
            myAnswer={myAnswer}
            isCorrect={isCurrentCorrect}
            onPrev={() => setCurrentIndex((i) => Math.max(0, i - 1))}
            onNext={() => setCurrentIndex((i) => Math.min(questions.length - 1, i + 1))}
          />
          <div className="bg-white rounded-2xl border border-gray-200 p-4 space-y-3">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Navigasi Soal
            </p>
            <QuizNavGrid
              total={questions.length}
              current={currentIndex}
              answered={answeredSet}
              correct={correctSet}
              wrong={wrongSet}
              onNavigate={setCurrentIndex}
            />
            <button
              onClick={() => router.push(`/courses/${quiz.courseId}`)}
              className="w-full py-2.5 bg-blue-700 hover:bg-blue-800 text-white font-semibold rounded-xl text-sm transition-colors"
            >
              Kembali ke kursus
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function ReviewScoreBar({ attempt, quiz }: { attempt: QuizResult["attempt"]; quiz: QuizResult["quiz"] }) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Review Kuis: {quiz.title}</h1>
        <p className="text-xs text-gray-500 mt-1">
          {new Date(attempt.submittedAt).toLocaleDateString("id-ID", {
            day: "numeric", month: "long", year: "numeric",
          })}{" "}
          • Durasi: {Math.floor(attempt.durationSeconds / 60)} menit {attempt.durationSeconds % 60} detik
        </p>
      </div>
      <div className="flex items-center gap-3 bg-white border border-gray-200 rounded-xl px-4 py-2.5 shadow-sm">
        <div>
          <span className="text-2xl font-extrabold text-gray-900">{attempt.score}</span>
          <span className="text-sm text-gray-400">/100</span>
          <p className="text-xs text-gray-400 uppercase tracking-wide">Skor</p>
        </div>
        <div className="w-px h-8 bg-gray-200" />
        <div className="flex items-center gap-1 text-green-600">
          <CheckCircle className="w-4 h-4" />
          <span className="font-bold text-sm">{attempt.totalCorrect}</span>
          <span className="text-xs text-gray-400">Benar</span>
        </div>
        <div className="flex items-center gap-1 text-red-500">
          <XCircle className="w-4 h-4" />
          <span className="font-bold text-sm">{attempt.totalWrong}</span>
          <span className="text-xs text-gray-400">Salah</span>
        </div>
      </div>
    </div>
  );
}

interface ReviewCardProps {
  question: QuizResult["questions"][0];
  index: number;
  total: number;
  myAnswer: string | undefined;
  isCorrect: boolean;
  onPrev: () => void;
  onNext: () => void;
}

function ReviewCard({ question, index, total, myAnswer, isCorrect, onPrev, onNext }: ReviewCardProps) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-gray-800">Pertanyaan {index + 1}</h3>
        <span className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${
          isCorrect ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
        }`}>
          {isCorrect
            ? <><CheckCircle className="w-3 h-3" /> Jawaban Benar</>
            : <><XCircle className="w-3 h-3" /> Jawaban Salah</>}
        </span>
      </div>

      <p className="text-gray-800 leading-relaxed">{question.questionText}</p>

      <div className="space-y-2.5">
        {question.options.map((opt) => (
          <ChoiceButton
            key={opt.id}
            label={opt.label as "A" | "B" | "C" | "D"}
            text={opt.text}
            selected={myAnswer === opt.id}
            isCorrect={opt.isCorrect}
            isWrong={myAnswer === opt.id && !opt.isCorrect}
            showAnswer
            onClick={() => {}}
          />
        ))}
      </div>

      {question.explanation && (
        <div className="border-l-4 border-blue-600 bg-blue-50 p-3 rounded-r-xl">
          <p className="text-xs font-semibold text-blue-700 uppercase tracking-wide mb-1">
            📖 Penjelasan Materi
          </p>
          <p className="text-sm text-gray-700 leading-relaxed italic">{question.explanation}</p>
        </div>
      )}

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

export default function QuizReviewPage() {
  return (
    <Suspense fallback={
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <QuizReviewContent />
    </Suspense>
  );
}