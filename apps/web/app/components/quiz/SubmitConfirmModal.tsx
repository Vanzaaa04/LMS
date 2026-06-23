"use client";

import { AlertTriangle } from "lucide-react";

interface SubmitConfirmModalProps {
  unansweredCount: number;
  onConfirm: () => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

export function SubmitConfirmModal({
  unansweredCount,
  onConfirm,
  onCancel,
  isSubmitting = false,
}: SubmitConfirmModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4 p-6">
        {/* Icon */}
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 rounded-full bg-orange-100 flex items-center justify-center">
            <span className="text-orange-500 text-3xl font-bold">!</span>
          </div>
        </div>

        <h2 className="text-xl font-bold text-gray-900 text-center mb-1">
          Kirim jawaban?
        </h2>
        <p className="text-sm text-gray-500 text-center mb-4">
          Anda tidak bisa mengubah setelah ini.
        </p>

        {/* Warning unanswered */}
        {unansweredCount > 0 && (
          <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50 border border-red-200 mb-4">
            <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0" />
            <p className="text-sm text-red-700">
              {unansweredCount} soal belum dijawab. Tetap kirim?
            </p>
          </div>
        )}

        <button
          onClick={onConfirm}
          disabled={isSubmitting}
          className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-semibold rounded-xl transition-colors mb-2"
        >
          {isSubmitting ? "Mengirim..." : "Kirim Sekarang"}
        </button>
        <button
          onClick={onCancel}
          className="w-full py-2 text-blue-600 hover:text-blue-800 font-medium text-sm transition-colors"
        >
          Batal
        </button>
      </div>
    </div>
  );
}
