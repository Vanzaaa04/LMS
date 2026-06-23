"use client";

import { useEffect } from "react";
import { useRouter, useParams } from "next/navigation";

export default function Page() {
  const router = useRouter();
  const params = useParams();
  const quizId = params.quizId as string;

  useEffect(() => {
    if (quizId) {
      router.replace(`/dosen/quiz/${quizId}/edit`);
    }
  }, [quizId, router]);

  return (
    <div className="flex min-h-[60vh] items-center justify-center text-sm text-slate-500">
      Mengalihkan ke halaman editor kuis...
    </div>
  );
}
