"use client";

import { X, List, Clock, CheckCircle, AlertCircle } from "lucide-react";
import type { Quiz } from "@/app/types/quiz";

interface QuizInfoModalProps {
  quiz: Quiz;
  onStart: () => void;
  onClose: () => void;
}

export function QuizInfoModal({ quiz, onStart, onClose }: QuizInfoModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex flex-col items-center pt-8 pb-4 px-6">
          <div className="w-16 h-16 rounded-2xl bg-blue-600 flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-900 text-center">{quiz.title}</h2>
          <p className="text-sm text-gray-500 mt-1">{quiz.moduleTitle}</p>
        </div>

        {/* Info cards */}
        <div className="px-6 space-y-3 pb-4">
          <div className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 bg-gray-50">
            <List className="w-5 h-5 text-blue-600" />
            <div>
              <p className="text-sm font-semibold text-gray-800">{quiz.totalQuestions} Soal</p>
              <p className="text-xs text-gray-500">Pilihan Ganda</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 bg-gray-50">
            <Clock className="w-5 h-5 text-blue-600" />
            <div>
              <p className="text-sm font-semibold text-gray-800">{quiz.durationMinutes} Menit</p>
              <p className="text-xs text-gray-500">Waktu Pengerjaan</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 bg-gray-50">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <div>
              <p className="text-sm font-semibold text-gray-800">Skor Minimum: {quiz.minimumScore}</p>
              <p className="text-xs text-gray-500">Batas Kelulusan</p>
            </div>
          </div>

          {/* Warning */}
          <div className="flex items-start gap-3 p-3 rounded-xl border border-orange-200 bg-orange-50">
            <AlertCircle className="w-4 h-4 text-orange-500 mt-0.5 flex-shrink-0" />
            <p className="text-xs text-orange-700 leading-relaxed">
              Pastikan Anda memiliki koneksi internet yang stabil sebelum memulai kuis ini.
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="px-6 pb-6 space-y-2">
          <button
            onClick={onStart}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-colors"
          >
            Mulai Sekarang
          </button>
          <button
            onClick={onClose}
            className="w-full py-2 text-gray-600 hover:text-gray-800 font-medium text-sm transition-colors"
          >
            Batal
          </button>
        </div>
      </div>
    </div>
  );
}
