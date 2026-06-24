"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Clock, GripVertical, Plus, Save, Send, Star, Trash2 } from "lucide-react";
import {
  createQuestion,
  deleteQuestion,
  deleteQuiz,
  getQuizById,
  getQuizQuestions,
  updateQuestion,
  updateQuiz,
} from "@/app/lib/api/quiz";
import type { Quiz, QuizQuestion } from "@/app/types/quiz";
import { LecturerBreadcrumbs } from "@/components/lecturer/LecturerBreadcrumbs";

interface OptionFormState {
  label: string;
  text: string;
  isCorrect: boolean;
}

interface QuestionFormState {
  questionText: string;
  options: OptionFormState[];
  explanation: string;
  points: number;
  required: boolean;
  shuffle: boolean;
}

function createEmptyQuestionForm(): QuestionFormState {
  return {
    questionText: "",
    options: [
      { label: "A", text: "", isCorrect: false },
      { label: "B", text: "", isCorrect: false },
      { label: "C", text: "", isCorrect: false },
      { label: "D", text: "", isCorrect: false },
    ],
    explanation: "",
    points: 5,
    required: true,
    shuffle: false,
  };
}

function mapQuestionToForm(question: QuizQuestion): QuestionFormState {
  return {
    questionText: question.questionText,
    options: question.options.map((option) => ({
      label: option.label,
      text: option.text,
      isCorrect: option.isCorrect ?? false,
    })),
    explanation: question.explanation ?? "",
    points: question.points,
    required: true,
    shuffle: false,
  };
}

export default function QuizEditorPage() {
  const router = useRouter();
  const params = useParams();
  const quizId = params.quizId as string;

  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [activeQuestionId, setActiveQuestionId] = useState<string | null>(null);
  const [questionForm, setQuestionForm] = useState<QuestionFormState>(createEmptyQuestionForm());
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [isDeletingQuiz, setIsDeletingQuiz] = useState(false);
  const [isAddingQuestion, setIsAddingQuestion] = useState(false);

  useEffect(() => {
    async function loadQuizEditor() {
      setErrorMessage(null);

      try {
        const [quizData, questionsData] = await Promise.all([
          getQuizById(quizId),
          getQuizQuestions(quizId),
        ]);

        setQuiz(quizData);
        setQuestions(questionsData);

        if (questionsData.length > 0) {
          setCurrentQuestionIndex(0);
          setActiveQuestionId(questionsData[0].id);
          setQuestionForm(mapQuestionToForm(questionsData[0]));
        } else {
          setCurrentQuestionIndex(0);
          setActiveQuestionId(null);
          setQuestionForm(createEmptyQuestionForm());
        }
      } catch (error) {
        console.error(error);
        setErrorMessage("Gagal memuat data quiz. Periksa koneksi server.");
      } finally {
        setIsLoading(false);
      }
    }

    loadQuizEditor();
  }, [quizId]);

  async function persistActiveQuestion() {
    if (!activeQuestionId) {
      return null;
    }

    const updatedQuestion = await updateQuestion(activeQuestionId, {
      questionText: questionForm.questionText,
      options: questionForm.options,
      explanation: questionForm.explanation,
      points: questionForm.points,
    });

    setQuestions((currentQuestions) =>
      currentQuestions.map((questionItem) =>
        questionItem.id === activeQuestionId ? updatedQuestion : questionItem
      )
    );

    return updatedQuestion;
  }

  async function switchQuestion(nextIndex: number) {
    if (nextIndex === currentQuestionIndex) {
      return;
    }

    try {
      await persistActiveQuestion();
    } catch (error) {
      console.error("Failed to save the current question before switching.", error);
    }

    const targetQuestion = questions[nextIndex];
    if (!targetQuestion) {
      return;
    }

    setCurrentQuestionIndex(nextIndex);
    setActiveQuestionId(targetQuestion.id);
    setQuestionForm(mapQuestionToForm(targetQuestion));
  }

  async function saveQuizDraft() {
    if (!quiz) {
      return;
    }

    setIsSavingDraft(true);
    setErrorMessage(null);

    try {
      await persistActiveQuestion();
      const updatedQuiz = await updateQuiz(quizId, { status: "DRAFT" });
      setQuiz(updatedQuiz);
    } catch (error) {
      console.error(error);
      setErrorMessage("Gagal menyimpan draft quiz.");
    } finally {
      setIsSavingDraft(false);
    }
  }

  async function publishQuizNow() {
    if (!quiz) {
      return;
    }

    setIsPublishing(true);
    setErrorMessage(null);

    try {
      await persistActiveQuestion();
      const updatedQuiz = await updateQuiz(quizId, { status: "PUBLISHED" });
      setQuiz(updatedQuiz);
      router.push(`/dosen/quiz/${quizId}/stats`);
    } catch (error) {
      console.error(error);
      setErrorMessage("Gagal menerbitkan quiz.");
    } finally {
      setIsPublishing(false);
    }
  }

  async function removeCurrentQuiz() {
    if (!quiz) {
      return;
    }

    const shouldDelete = window.confirm("Yakin ingin menghapus quiz ini?");
    if (!shouldDelete) {
      return;
    }

    setIsDeletingQuiz(true);
    setErrorMessage(null);

    try {
      await deleteQuiz(quizId);
      const fallbackHref = quiz.courseId ? `/dosen/courses/${quiz.courseId}` : "/dosen/courses";
      router.push(fallbackHref);
    } catch (error) {
      console.error(error);
      setErrorMessage("Gagal menghapus quiz.");
    } finally {
      setIsDeletingQuiz(false);
    }
  }

  async function addQuestion() {
    setIsAddingQuestion(true);
    setErrorMessage(null);

    try {
      await persistActiveQuestion();

      const newQuestion = await createQuestion(quizId, {
        questionText: "Tulis pertanyaan di sini...",
        options: [
          { label: "A", text: "", isCorrect: true },
          { label: "B", text: "", isCorrect: false },
          { label: "C", text: "", isCorrect: false },
          { label: "D", text: "", isCorrect: false },
        ],
        explanation: "",
        points: 10,
      });

      setQuestions((currentQuestions) => {
        const nextQuestions = [...currentQuestions, newQuestion];
        const nextIndex = nextQuestions.length - 1;

        setCurrentQuestionIndex(nextIndex);
        setActiveQuestionId(newQuestion.id);
        setQuestionForm(mapQuestionToForm(newQuestion));

        return nextQuestions;
      });
    } catch (error) {
      console.error(error);
      setErrorMessage("Gagal menambah soal baru.");
    } finally {
      setIsAddingQuestion(false);
    }
  }

  async function removeQuestion(index: number) {
    const questionToDelete = questions[index];
    if (!questionToDelete) {
      return;
    }

    const shouldDelete = window.confirm("Yakin ingin menghapus soal ini?");
    if (!shouldDelete) {
      return;
    }

    try {
      await deleteQuestion(questionToDelete.id);

      const remainingQuestions = questions.filter((_, questionIndex) => questionIndex !== index);
      setQuestions(remainingQuestions);

      if (remainingQuestions.length === 0) {
        setCurrentQuestionIndex(0);
        setActiveQuestionId(null);
        setQuestionForm(createEmptyQuestionForm());
        return;
      }

      const nextIndex = Math.min(index, remainingQuestions.length - 1);
      const nextQuestion = remainingQuestions[nextIndex];

      setCurrentQuestionIndex(nextIndex);
      setActiveQuestionId(nextQuestion.id);
      setQuestionForm(mapQuestionToForm(nextQuestion));
    } catch (error) {
      console.error(error);
      setErrorMessage("Gagal menghapus soal.");
    }
  }

  function markCorrectAnswer(optionLabel: string) {
    setQuestionForm((currentForm) => ({
      ...currentForm,
      options: currentForm.options.map((option) => ({
        ...option,
        isCorrect: option.label === optionLabel,
      })),
    }));
  }

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
      </div>
    );
  }

  if (errorMessage && !quiz) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <p className="mb-3 font-medium text-red-600">{errorMessage}</p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
          >
            Coba Lagi
          </button>
        </div>
      </div>
    );
  }

  if (!quiz) {
    return null;
  }

  const courseHref = quiz.courseId ? `/dosen/courses/${quiz.courseId}` : "/dosen/courses";
  const quizStatusLabel = quiz.status === "PUBLISHED" ? "Published" : "Draft";

  return (
    <div className="min-h-full bg-slate-50 pb-8">
      <div className="mx-auto w-full max-w-[1240px] px-4 py-8 sm:px-6 lg:px-8">
        <LecturerBreadcrumbs
          items={[
            { label: "Home", href: "/dashboard_dosen" },
            { label: "Courses", href: "/dosen/courses" },
            { label: "Manage Course", href: courseHref },
            { label: "Edit Quiz" },
          ]}
        />

        <section className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <div className="mb-3 inline-flex items-center rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-bold uppercase tracking-[0.14em] text-blue-700">
              {quizStatusLabel}
            </div>
            <h1 className="text-[34px] font-bold leading-tight text-slate-950 sm:text-[44px]">
              Editor Quiz: {quiz.title}
            </h1>
            <p className="mt-2 text-lg text-slate-500">
              Tambahkan pertanyaan, simpan draft, atau terbitkan quiz ketika sudah siap.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => router.push(courseHref)}
              className="inline-flex items-center gap-2 rounded-2xl border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              Kembali ke Kelas
            </button>
            <button
              type="button"
              onClick={removeCurrentQuiz}
              disabled={isDeletingQuiz}
              className="inline-flex items-center gap-2 rounded-2xl border border-red-200 px-5 py-3 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Trash2 className="h-4 w-4" />
              {isDeletingQuiz ? "Deleting..." : "Delete Quiz"}
            </button>
            <button
              type="button"
              onClick={saveQuizDraft}
              disabled={isSavingDraft || isPublishing}
              className="inline-flex items-center gap-2 rounded-2xl border border-blue-200 px-5 py-3 text-sm font-semibold text-blue-700 transition hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Save className="h-4 w-4" />
              {isSavingDraft ? "Saving..." : "Save as Draft"}
            </button>
            <button
              type="button"
              onClick={publishQuizNow}
              disabled={isPublishing || isSavingDraft}
              className="inline-flex items-center gap-2 rounded-2xl bg-blue-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Send className="h-4 w-4" />
              {isPublishing ? "Publishing..." : "Publish Quiz"}
            </button>
          </div>
        </section>

        {errorMessage ? (
          <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {errorMessage}
          </div>
        ) : null}

        <div className="flex flex-col gap-6 lg:flex-row">
          <aside className="w-full flex-shrink-0 space-y-4 lg:w-64">
            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="mb-4 flex items-center gap-2">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-white">
                  <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                </div>
                <span className="text-sm font-semibold text-slate-700">Pengaturan Quiz</span>
              </div>

              <div className="space-y-3">
                <ReadonlyField icon={<Clock className="h-4 w-4 text-slate-400" />} label="Durasi (Menit)" value={String(quiz.durationMinutes)} />
                <ReadonlyField icon={<Star className="h-4 w-4 text-slate-400" />} label="Ambang Kelulusan (%)" value={String(quiz.minimumScore)} />
                <ReadonlyField icon={<Star className="h-4 w-4 text-slate-400" />} label="Max Attempts" value={String(quiz.maxAttempts ?? 1)} />
                <ReadonlyField icon={<Star className="h-4 w-4 text-slate-400" />} label="Grading Method" value={quiz.gradingMethod ?? "LATEST"} />
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="mb-3 text-sm font-semibold text-slate-700">Navigasi Soal</p>
              <div className="flex flex-wrap gap-2">
                {questions.map((_, questionIndex) => (
                  <button
                    key={questionIndex}
                    type="button"
                    onClick={() => switchQuestion(questionIndex)}
                    className={`h-10 w-10 rounded-xl border-2 text-sm font-semibold transition ${
                      questionIndex === currentQuestionIndex
                        ? "border-blue-600 bg-blue-600 text-white"
                        : "border-slate-200 bg-white text-slate-600 hover:border-blue-300"
                    }`}
                  >
                    {questionIndex + 1}
                  </button>
                ))}
              </div>
            </div>
          </aside>

          <main className="min-w-0 flex-1 space-y-4">
            {questions.length === 0 ? (
              <div className="rounded-3xl border-2 border-dashed border-slate-200 bg-white p-12 text-center shadow-sm">
                <p className="mb-4 text-sm text-slate-500">Belum ada soal. Tambahkan soal pertama.</p>
                <button
                  type="button"
                  onClick={addQuestion}
                  disabled={isAddingQuestion}
                  className="mx-auto inline-flex items-center gap-2 rounded-2xl bg-blue-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <Plus className="h-4 w-4" />
                  {isAddingQuestion ? "Adding..." : "Tambah Soal Baru"}
                </button>
              </div>
            ) : (
              <div className="space-y-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white">
                      {currentQuestionIndex + 1}
                    </div>
                    <span className="text-sm font-semibold text-slate-700">Pertanyaan Pilihan Ganda</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => removeQuestion(currentQuestionIndex)}
                      className="rounded-lg p-1.5 text-slate-400 transition hover:bg-red-50 hover:text-red-500"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100"
                    >
                      <GripVertical className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">Teks Pertanyaan</label>
                  <textarea
                    rows={3}
                    value={questionForm.questionText}
                    onChange={(event) =>
                      setQuestionForm((currentForm) => ({
                        ...currentForm,
                        questionText: event.target.value,
                      }))
                    }
                    placeholder="Tulis pertanyaan di sini..."
                    className="w-full resize-none rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Pilihan Jawaban{" "}
                    <span className="font-normal text-slate-400">(Centang untuk kunci jawaban)</span>
                  </label>

                  <div className="space-y-2">
                    {questionForm.options.map((option) => (
                      <div
                        key={option.label}
                        className={`flex items-center gap-3 rounded-2xl border-2 p-3 transition ${
                          option.isCorrect ? "border-blue-500 bg-blue-50" : "border-slate-200"
                        }`}
                      >
                        <input
                          type="radio"
                          name="correct-answer"
                          checked={option.isCorrect}
                          onChange={() => markCorrectAnswer(option.label)}
                          className="h-4 w-4 cursor-pointer text-blue-600"
                        />
                        <span
                          className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${
                            option.isCorrect ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-600"
                          }`}
                        >
                          {option.label}.
                        </span>
                        <input
                          type="text"
                          value={option.text}
                          onChange={(event) =>
                            setQuestionForm((currentForm) => ({
                              ...currentForm,
                              options: currentForm.options.map((currentOption) =>
                                currentOption.label === option.label
                                  ? { ...currentOption, text: event.target.value }
                                  : currentOption
                              ),
                            }))
                          }
                          placeholder={`Opsi ${option.label}`}
                          className="flex-1 bg-transparent text-sm text-slate-800 outline-none placeholder:text-slate-400"
                        />
                        {option.isCorrect ? (
                          <span className="rounded bg-blue-600 px-2 py-0.5 text-xs font-bold text-white">
                            KUNCI
                          </span>
                        ) : null}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col gap-4 border-t border-slate-100 pt-2 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex flex-wrap items-center gap-4">
                    <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-600">
                      <input
                        type="checkbox"
                        checked={questionForm.required}
                        onChange={(event) =>
                          setQuestionForm((currentForm) => ({
                            ...currentForm,
                            required: event.target.checked,
                          }))
                        }
                        className="h-4 w-4 rounded text-blue-600"
                      />
                      Wajib Diisi
                    </label>

                    <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-600">
                      <input
                        type="checkbox"
                        checked={questionForm.shuffle}
                        onChange={(event) =>
                          setQuestionForm((currentForm) => ({
                            ...currentForm,
                            shuffle: event.target.checked,
                          }))
                        }
                        className="h-4 w-4 rounded text-blue-600"
                      />
                      Acak Pilihan
                    </label>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-sm text-slate-500">Poin:</span>
                    <input
                      type="number"
                      min={1}
                      value={questionForm.points}
                      onChange={(event) =>
                        setQuestionForm((currentForm) => ({
                          ...currentForm,
                          points: Number(event.target.value),
                        }))
                      }
                      className="w-16 rounded-lg border border-slate-200 px-2 py-1 text-center text-sm font-semibold text-slate-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />
                  </div>
                </div>
              </div>
            )}

            <button
              type="button"
              onClick={addQuestion}
              disabled={isAddingQuestion}
              className="flex w-full items-center justify-center gap-2 rounded-3xl border-2 border-dashed border-slate-200 bg-white py-4 text-sm font-medium text-slate-500 transition hover:border-blue-300 hover:bg-blue-50/30 hover:text-blue-600 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Plus className="h-5 w-5" />
              {isAddingQuestion ? "Adding..." : "Tambah Soal Baru"}
            </button>
          </main>
        </div>
      </div>
    </div>
  );
}

function ReadonlyField({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div>
      <label className="mb-1 block text-xs text-slate-500">{label}</label>
      <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700">
        {icon}
        <span>{value}</span>
      </div>
    </div>
  );
}
