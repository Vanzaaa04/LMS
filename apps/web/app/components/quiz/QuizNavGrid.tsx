"use client";

interface QuizNavGridProps {
  total: number;
  current: number; // 0-based index
  answered: Set<number>;
  // review mode: pass correct/wrong sets
  correct?: Set<number>;
  wrong?: Set<number>;
  onNavigate: (index: number) => void;
}

export function QuizNavGrid({
  total,
  current,
  answered,
  correct,
  wrong,
  onNavigate,
}: QuizNavGridProps) {
  return (
    <div className="grid grid-cols-5 gap-2">
      {Array.from({ length: total }, (_, i) => {
        let cls =
          "w-10 h-10 rounded-lg text-sm font-semibold border-2 transition-all cursor-pointer flex items-center justify-center ";

        if (i === current) {
          cls += "border-blue-600 bg-blue-600 text-white";
        } else if (correct && correct.has(i)) {
          cls += "border-green-600 bg-green-600 text-white";
        } else if (wrong && wrong.has(i)) {
          cls += "border-red-500 bg-red-500 text-white";
        } else if (answered.has(i)) {
          cls += "border-blue-400 bg-blue-100 text-blue-700";
        } else {
          cls += "border-gray-300 bg-white text-gray-600 hover:border-blue-300";
        }

        return (
          <button
            key={i}
            type="button"
            className={cls}
            onClick={() => onNavigate(i)}
          >
            {i + 1}
          </button>
        );
      })}
    </div>
  );
}
