"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { BarChart2 } from "lucide-react";
import { getQuizzes } from "@/app/lib/api/quiz";
import type { Quiz } from "@/app/types/quiz";

export default function DosenStatsPage() {
  const router = useRouter();
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getQuizzes()
      .then(setQuizzes)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-1">Statistik Kuis</h1>
      <p className="text-sm text-gray-500 mb-6">Pilih kuis untuk melihat statistik performa mahasiswa.</p>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : quizzes.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-gray-200 p-12 text-center text-gray-400 text-sm">
          Belum ada kuis tersedia.
        </div>
      ) : (
        <div className="space-y-3">
          {quizzes.map((quiz) => (
            <div
              key={quiz.id}
              className="flex items-center gap-4 bg-white rounded-2xl border border-gray-200 p-4 hover:border-blue-300 hover:shadow-sm transition cursor-pointer"
              onClick={() => router.push(`/dosen/quiz/${quiz.id}/stats`)}
            >
              <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0">
                <BarChart2 className="w-5 h-5 text-blue-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900">{quiz.title}</p>
                <p className="text-xs text-gray-500 mt-0.5">
                  {quiz.moduleTitle} • {quiz.durationMinutes} menit
                </p>
              </div>
              <span className="text-xs text-blue-600 font-semibold">Lihat Stats →</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
