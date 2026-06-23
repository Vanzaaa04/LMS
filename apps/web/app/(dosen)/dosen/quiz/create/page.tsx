"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Save, Send } from "lucide-react";
import { createQuiz } from "@/app/lib/api/quiz";
import { LecturerBreadcrumbs } from "@/components/lecturer/LecturerBreadcrumbs";

interface ModuleOption {
  id: string;
  title: string;
}

type QuizPublishStatus = "DRAFT" | "PUBLISHED";

interface QuizCreateFormState {
  title: string;
  courseId: string;
  moduleId: string;
  xpReward: number;
  minimumScore: number;
  durationMinutes: number;
  maxAttempts: number;
  gradingMethod: string;
}

const DEFAULT_FORM_STATE = {
  title: "",
  courseId: "",
  moduleId: "",
  xpReward: 100,
  minimumScore: 70,
  durationMinutes: 60,
  maxAttempts: 1,
  gradingMethod: "LATEST",
} satisfies QuizCreateFormState;

export default function CreateQuizPage() {
  return (
    <Suspense fallback={<CreateQuizLoadingState />}>
      <CreateQuizContent />
    </Suspense>
  );
}

function CreateQuizLoadingState() {
  return (
    <div className="min-h-full bg-slate-50">
      <div className="mx-auto w-full max-w-[1240px] px-4 py-8 sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <p className="text-sm text-slate-500">Memuat form kuis...</p>
        </div>
      </div>
    </div>
  );
}

function CreateQuizContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const prefilledCourseId = searchParams.get("courseId") ?? "";
  const prefilledModuleId = searchParams.get("moduleId") ?? "";
  const returnHref = prefilledCourseId ? `/dosen/courses/${prefilledCourseId}` : "/dosen/courses";

  const [formState, setFormState] = useState<QuizCreateFormState>({
    ...DEFAULT_FORM_STATE,
    courseId: prefilledCourseId,
    moduleId: prefilledModuleId,
  });
  const [modules, setModules] = useState<ModuleOption[]>([]);
  const [errorMessage, setErrorMessage] = useState("");
  const [submittingStatus, setSubmittingStatus] = useState<QuizPublishStatus | null>(null);

  useEffect(() => {
    async function loadModules() {
      if (!formState.courseId) {
        setModules([]);
        return;
      }

      try {
        const token = sessionStorage.getItem("token");
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001"}/courses/${formState.courseId}/modules`,
          { headers: token ? { Authorization: `Bearer ${token}` } : {} }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch modules");
        }

        const payload = await response.json();
        const nextModules = Array.isArray(payload)
          ? payload.map((moduleItem: { id: string; title?: string; name?: string }) => ({
              id: moduleItem.id,
              title: moduleItem.title ?? moduleItem.name ?? moduleItem.id,
            }))
          : [];

        setModules(nextModules);

        if (!prefilledModuleId && !nextModules.some((moduleItem) => moduleItem.id === formState.moduleId)) {
          setFormState((currentState) => ({ ...currentState, moduleId: "" }));
        }
      } catch (error) {
        console.error(error);
        setModules([]);
      }
    }

    loadModules();
  }, [formState.courseId, formState.moduleId, prefilledModuleId]);

  function updateField(fieldName: keyof QuizCreateFormState, value: string | number) {
    setFormState((currentState) => ({
      ...currentState,
      [fieldName]: value,
    }));
  }

  async function submitQuiz(status: QuizPublishStatus) {
    const validationMessage = validateQuizForm(formState);
    if (validationMessage) {
      setErrorMessage(validationMessage);
      return;
    }

    setErrorMessage("");
    setSubmittingStatus(status);

    try {
      const createdQuiz = await createQuiz({
        title: formState.title,
        moduleId: formState.moduleId,
        xpReward: formState.xpReward,
        minimumScore: formState.minimumScore,
        durationMinutes: formState.durationMinutes,
        maxAttempts: formState.maxAttempts,
        gradingMethod: formState.gradingMethod,
        status,
      });

      router.push(`/dosen/quiz/${createdQuiz.id}/edit`);
    } catch (error) {
      console.error(error);
      setErrorMessage("Gagal membuat kuis. Periksa koneksi server dan coba lagi.");
    } finally {
      setSubmittingStatus(null);
    }
  }

  return (
    <div className="min-h-full bg-slate-50">
      <div className="mx-auto w-full max-w-[1240px] px-4 py-8 sm:px-6 lg:px-8">
        <LecturerBreadcrumbs
          items={[
            { label: "Home", href: "/dashboard_dosen" },
            { label: "Courses", href: "/dosen/courses" },
            ...(prefilledCourseId ? [{ label: "Manage Course", href: returnHref }] : []),
            { label: "Create Quiz" },
          ]}
        />

        <section className="mb-8">
          <h1 className="text-[34px] font-bold leading-tight text-slate-950 sm:text-[44px]">
            Create Quiz
          </h1>
          <p className="mt-3 text-lg text-slate-500">
            Isi informasi dasar kuis sebelum menambahkan pertanyaan di editor.
          </p>
        </section>

        <div className="rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="space-y-7 px-5 py-6 sm:px-7 sm:py-7">
            {errorMessage ? (
              <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {errorMessage}
              </div>
            ) : null}

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">Judul Quiz</label>
              <input
                type="text"
                value={formState.title}
                onChange={(event) => updateField("title", event.target.value)}
                placeholder="Contoh: Quiz Pengenalan Machine Learning"
                className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">Modul</label>
                <select
                  value={formState.moduleId}
                  onChange={(event) => updateField("moduleId", event.target.value)}
                  disabled={Boolean(prefilledModuleId) || !formState.courseId || modules.length === 0}
                  className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-50"
                >
                  <option value="">Pilih modul...</option>
                  {modules.map((moduleItem) => (
                    <option key={moduleItem.id} value={moduleItem.id}>
                      {moduleItem.title}
                    </option>
                  ))}
                  {prefilledModuleId && modules.length === 0 ? <option value={prefilledModuleId}>Memuat...</option> : null}
                </select>
              </div>

              <div className="rounded-2xl border border-blue-100 bg-blue-50 px-4 py-4">
                <p className="text-sm font-semibold text-slate-800">Alur pembuatan quiz</p>
                <p className="mt-1 text-sm text-slate-500">
                  Setelah quiz dibuat, Anda akan diarahkan ke editor untuk menambahkan dan mengatur pertanyaan.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
              <NumberField
                label="Reward XP"
                value={formState.xpReward}
                min={0}
                suffix="XP"
                onChange={(value) => updateField("xpReward", value)}
              />
              <NumberField
                label="Skor Minimum Lulus"
                value={formState.minimumScore}
                min={0}
                max={100}
                suffix="%"
                onChange={(value) => updateField("minimumScore", value)}
              />
              <NumberField
                label="Durasi"
                value={formState.durationMinutes}
                min={1}
                suffix="min"
                onChange={(value) => updateField("durationMinutes", value)}
              />
            </div>
            
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <NumberField
                label="Max Attempts"
                value={formState.maxAttempts}
                min={1}
                suffix="kali"
                onChange={(value) => updateField("maxAttempts", value)}
              />
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">Grading Method</label>
                <select
                  value={formState.gradingMethod}
                  onChange={(event) => updateField("gradingMethod", event.target.value)}
                  className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                >
                  <option value="LATEST">Latest Attempt</option>
                  <option value="HIGHEST">Highest Score</option>
                </select>
              </div>
            </div>
          </div>

          <div className="flex flex-col-reverse gap-3 border-t border-slate-200 px-5 py-5 sm:flex-row sm:justify-end sm:px-7">
            <button
              type="button"
              onClick={() => router.push(returnHref)}
              className="rounded-2xl border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => submitQuiz("DRAFT")}
              disabled={submittingStatus !== null}
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-blue-200 px-5 py-3 text-sm font-semibold text-blue-700 transition hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Save className="h-4 w-4" />
              {submittingStatus === "DRAFT" ? "Saving..." : "Save as Draft"}
            </button>
            <button
              type="button"
              onClick={() => submitQuiz("PUBLISHED")}
              disabled={submittingStatus !== null}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-blue-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Send className="h-4 w-4" />
              {submittingStatus === "PUBLISHED" ? "Publishing..." : "Publish Quiz"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function NumberField({
  label,
  value,
  min,
  max,
  suffix,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max?: number;
  suffix: string;
  onChange: (value: number) => void;
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-semibold text-slate-700">{label}</label>
      <div className="relative">
        <input
          type="number"
          value={value}
          min={min}
          max={max}
          onChange={(event) => onChange(Number(event.target.value))}
          className="w-full rounded-2xl border border-slate-300 px-4 py-3 pr-12 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
        />
        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400">
          {suffix}
        </span>
      </div>
    </div>
  );
}

function validateQuizForm(formState: QuizCreateFormState) {
  if (!formState.title.trim()) {
    return "Judul quiz tidak boleh kosong.";
  }

  if (!formState.moduleId) {
    return "Pilih modul terlebih dahulu.";
  }

  return "";
}
