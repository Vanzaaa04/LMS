"use client";

interface ChoiceButtonProps {
  label: "A" | "B" | "C" | "D";
  text: string;
  selected: boolean;
  disabled?: boolean;
  // review mode
  isCorrect?: boolean;
  isWrong?: boolean;
  showAnswer?: boolean;
  onClick: () => void;
}

export function ChoiceButton({
  label,
  text,
  selected,
  disabled = false,
  isCorrect,
  isWrong,
  showAnswer,
  onClick,
}: ChoiceButtonProps) {
  let containerClass =
    "flex items-center gap-4 w-full px-4 py-3 rounded-lg border-2 text-left transition-all cursor-pointer ";

  if (showAnswer) {
    if (isCorrect) {
      containerClass +=
        "border-blue-500 bg-blue-50 text-blue-900";
    } else if (isWrong && selected) {
      containerClass +=
        "border-red-400 bg-red-50 text-red-700";
    } else {
      containerClass +=
        "border-gray-200 bg-white text-gray-700 cursor-default";
    }
  } else if (selected) {
    containerClass +=
      "border-blue-600 bg-blue-50 text-blue-900";
  } else {
    containerClass +=
      "border-gray-200 bg-white text-gray-700 hover:border-blue-300 hover:bg-blue-50/50";
  }

  if (disabled) containerClass += " opacity-70 cursor-default";

  return (
    <button
      type="button"
      className={containerClass}
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
    >
      <span
        className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2 ${
          showAnswer && isCorrect
            ? "border-blue-600 bg-blue-600 text-white"
            : showAnswer && isWrong && selected
            ? "border-red-400 bg-red-400 text-white"
            : selected
            ? "border-blue-600 bg-blue-600 text-white"
            : "border-gray-300 bg-white text-gray-600"
        }`}
      >
        {label}
      </span>
      <span className="flex-1 text-sm leading-relaxed">{text}</span>
      {showAnswer && isCorrect && (
        <span className="text-xs font-semibold text-blue-700 uppercase tracking-wide">
          Jawaban Benar
        </span>
      )}
      {showAnswer && isWrong && selected && (
        <span className="text-red-400">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="10" strokeWidth="2" />
            <path strokeLinecap="round" d="M15 9l-6 6M9 9l6 6" strokeWidth="2" />
          </svg>
        </span>
      )}
    </button>
  );
}
