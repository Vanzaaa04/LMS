"use client";

import { CheckCircle, XCircle, Clock, FileText } from "lucide-react";
import type { QuizResult } from "@/app/types/quiz";

interface QuizResultModalProps {
  result: QuizResult;
  onReview: () => void;
  onBackToCourse: () => void;
}

export function QuizResultModal({
  result,
  onReview,
  onBackToCourse,
}: QuizResultModalProps) {
  const { attempt, quiz } = result;
  const isLulus = attempt.status === "lulus";
  const durationMin = Math.floor(attempt.durationSeconds / 60);
  const durationSec = attempt.durationSeconds % 60;
  const submittedDate = new Date(attempt.submittedAt).toLocaleDateString("id-ID", {
    day: "numeric", month: "long", year: "numeric",
  });
  const submittedTime = new Date(attempt.submittedAt).toLocaleTimeString("id-ID", {
    hour: "2-digit", minute: "2-digit",
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
        {/* Header icon */}
        <div className="flex flex-col items-center pt-8 pb-4 px-6">
          <div className="w-16 h-16 rounded-2xl bg-blue-600 flex items-center justify-center mb-4">
            <CheckCircle className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 text-center">{quiz.title}</h2>
          <p className="text-sm text-gray-500 mt-1">
            Selesai pada {submittedDate} • {submittedTime} WIB
          </p>
        </div>

        <div className="px-6 space-y-3 pb-4">
          {/* Score */}
          <div className="p-4 rounded-xl border border-gray-200 bg-gray-50 relative overflow-hidden">
            <p className="text-xs text-gray-500 uppercase tracking-wide font-medium mb-1">Nilai Anda</p>
            <div className="flex items-center justify-between relative z-10">
              <span className="text-4xl font-bold text-gray-900">
                {attempt.score}
                <span className="text-xl text-gray-400">/100</span>
              </span>
              <div className="flex flex-col items-end gap-1">
                <span className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm font-semibold ${
                  isLulus
                    ? "bg-green-100 text-green-700"
                    : "bg-red-100 text-red-700"
                }`}>
                  {isLulus ? (
                    <><CheckCircle className="w-4 h-4" /> Lulus</>
                  ) : (
                    <><XCircle className="w-4 h-4" /> Tidak Lulus</>
                  )}
                </span>
                {isLulus && quiz.xpReward && (
                  <span className="text-sm font-bold text-yellow-600 animate-[bounce_1s_ease-in-out_infinite]">
                    +{quiz.xpReward} XP
                  </span>
                )}
              </div>
            </div>
            {/* Background XP Animation */}
            {isLulus && (
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full text-center pointer-events-none animate-[ping_2s_ease-out_1]">
                 <span className="text-6xl opacity-10 text-yellow-500 font-black">+{quiz.xpReward} XP</span>
              </div>
            )}
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center gap-2 p-3 rounded-xl border border-gray-100 bg-gray-50">
              <Clock className="w-4 h-4 text-blue-600" />
              <div>
                <p className="text-xs text-gray-500">Durasi</p>
                <p className="text-sm font-semibold text-gray-800">
                  {durationMin} Menit {durationSec} Detik
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 p-3 rounded-xl border border-gray-100 bg-gray-50">
              <FileText className="w-4 h-4 text-blue-600" />
              <div>
                <p className="text-xs text-gray-500">Jawaban Benar</p>
                <p className="text-sm font-semibold text-gray-800">
                  {attempt.totalCorrect} dari {quiz.totalQuestions} Soal
                </p>
              </div>
            </div>
          </div>

          {/* Message */}
          <div className={`flex items-start gap-3 p-3 rounded-xl border ${
            isLulus
              ? "border-green-200 bg-green-50"
              : "border-red-200 bg-red-50"
          }`}>
            <span className="text-lg">{isLulus ? "🏆" : "📚"}</span>
            <p className={`text-sm leading-relaxed ${
              isLulus ? "text-green-800" : "text-red-800"
            }`}>
              {isLulus
                ? `Selamat! Anda telah melampaui skor minimum (${quiz.minimumScore}). Anda dapat melanjutkan ke materi berikutnya atau melihat ulasan jawaban Anda.`
                : `Anda belum mencapai skor minimum (${quiz.minimumScore}). Pelajari kembali materi dan coba lagi.`}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="px-6 pb-6 space-y-2">
          <button
            onClick={onReview}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-colors"
          >
            Lihat Review
          </button>
          <button
            onClick={onBackToCourse}
            className="w-full py-2 text-blue-600 hover:text-blue-800 font-medium text-sm transition-colors"
          >
            Kembali ke Kursus
          </button>
        </div>
      </div>
    </div>
  );
}
