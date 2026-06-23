"use client";

import { useEffect } from "react";
import { useRouter, useParams } from "next/navigation";

export default function Page() {
  const router = useRouter();
  const params = useParams();
  const courseId = params.courseId as string;
  const moduleId = params.moduleId as string;

  useEffect(() => {
    if (courseId && moduleId) {
      router.replace(`/dosen/quiz/create?courseId=${courseId}&moduleId=${moduleId}`);
    }
  }, [courseId, moduleId, router]);

  return (
    <div className="flex min-h-[60vh] items-center justify-center text-sm text-slate-500">
      Mengalihkan ke halaman pembuatan kuis...
    </div>
  );
}
