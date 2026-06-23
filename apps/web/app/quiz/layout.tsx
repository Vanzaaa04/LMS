"use client";

import QuizHeader from "@/app/components/quiz/QuizHeader";

export default function QuizLayout({ children }: { children: React.ReactNode }) {
  return <QuizHeader>{children}</QuizHeader>;
}
