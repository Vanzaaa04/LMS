'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  Play, FileText, BookOpen, HelpCircle,
  CheckCircle2, ChevronDown, ChevronUp, Calendar, Clock,
} from 'lucide-react';
import { cn } from '@/app/lib/utils';
import { getQuizzesByCourse, getQuizSubmission } from '@/app/lib/api/quiz';
import { QuizInfoModal } from '@/app/components/quiz/QuizInfoModal';
import type { Quiz } from '@/app/types/quiz';
import { slugify } from '@/utils/slugify';

import type { CourseContentItem, CourseContentTab, CourseDetail, CourseModule } from '@/lib/types/course';
import type { CourseSource } from '@/lib/courseNavigation';
import {
  buildAssignmentHref,
  buildMaterialHref,
  COURSE_CATALOG_HREF,
  getCourseBreadcrumbParent,
  getCourseSource,
} from '@/lib/courseNavigation';
import { getCourseContentVisualConfig } from './courseContentPresentation';

// ─── Konstanta ────────────────────────────────────────────────────────────────

const TABS: { key: CourseContentTab; label: string }[] = [
  { key: 'materials', label: 'Materials' },
  { key: 'quizzes', label: 'Quizzes' },
  { key: 'assignments', label: 'Assignments' },
  { key: 'labs', label: 'Labs' },
];

const MATERIAL_ICON_MAP = {
  video:   { Icon: Play,      bg: 'bg-blue-50',  color: 'text-blue-600' },
  pdf:     { Icon: FileText,  bg: 'bg-gray-100', color: 'text-gray-600' },
  article: { Icon: BookOpen,  bg: 'bg-gray-100', color: 'text-gray-600' },
  assignment: { Icon: FileText, bg: 'bg-gray-100', color: 'text-gray-600' },
  lab: { Icon: BookOpen, bg: 'bg-gray-100', color: 'text-gray-600' },
} as const;

// ─── Helper: cek apakah quiz sudah pernah dikerjakan ─────────────────────────

function getCompletedAttemptId(quizId: string): string | null {
  if (typeof window === 'undefined') return null;
  for (let i = 0; i < sessionStorage.length; i++) {
    const key = sessionStorage.key(i);
    if (!key?.startsWith('quiz-result-')) continue;
    try {
      const data = JSON.parse(sessionStorage.getItem(key) ?? '');
      if (data?.attempt?.quizId === quizId) return data.attempt.id;
    } catch {
      // skip invalid entry
    }
  }
  return null;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function EmptyState({ text }: { text: string }) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white px-6 py-14 text-center text-sm text-gray-400">
      {text}
    </div>
  );
}

interface QuizRowProps {
  quiz: Quiz;
  completedAttemptId: string | null;
  onStart: (quiz: Quiz) => void;
  onReview: (attemptId: string, quizId: string) => void;
}

function QuizRow({ quiz, completedAttemptId, onStart, onReview }: QuizRowProps) {
  if (!quiz) return null;

  const isCompleted = Boolean(completedAttemptId);

  return (
    <div className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50 transition-colors">
      <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-orange-50">
        <HelpCircle className="h-5 w-5 text-orange-500" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-gray-900 text-sm">{quiz.title}</p>
        <p className="text-xs text-gray-500 mt-0.5">
          Quiz • {quiz.durationMinutes} min • {quiz.totalQuestions} questions
        </p>
      </div>
      {isCompleted ? (
        <button
          onClick={() => onReview(completedAttemptId!, quiz.id)}
          className="flex-shrink-0 rounded-lg border border-blue-700 px-4 py-1.5 text-xs font-semibold text-blue-700 transition-colors hover:bg-blue-50"
        >
          Lihat Review
        </button>
      ) : (
        <button
          onClick={() => onStart(quiz)}
          className="flex-shrink-0 rounded-lg bg-blue-700 px-4 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-blue-800"
        >
          Start Quiz
        </button>
      )}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

interface CourseDetailViewProps {
  course: CourseDetail;
}

export function CourseDetailView({ course }: CourseDetailViewProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const source = getCourseSource(searchParams.get('from'));
  const breadcrumbContext = getCourseBreadcrumbParent(source);
  const firstMaterial = course.tabs.materials[0]?.items[0];

  const [activeTab, setActiveTab] = useState<CourseContentTab>('materials');
  const modules = course.tabs[activeTab];
  
  // By default, open all modules
  const [openModules, setOpenModules] = useState<Record<string, boolean>>(
    Object.fromEntries(modules.map((m) => [m.id, true]))
  );
  const [selectedQuiz, setSelectedQuiz] = useState<Quiz | null>(null);
  const [courseQuizzes, setCourseQuizzes] = useState<Quiz[]>([]);
  const [completedQuizAttempts, setCompletedQuizAttempts] = useState<Record<string, string>>({});
  const [assignmentSubmissions, setAssignmentSubmissions] = useState<Record<string, { status: string; score?: number | null }>>({});

  useEffect(() => {
    async function fetchQuizzes() {
      try {
        const quizzes = await getQuizzesByCourse(course.id.toString());
        setCourseQuizzes(quizzes);

        const attempts: Record<string, string> = {};
        await Promise.all(
          quizzes.map(async (quiz) => {
            try {
              const submission = await getQuizSubmission(quiz.id);
              if (submission) {
                attempts[quiz.id] = submission.id;
              }
            } catch (err) {
              // Ignore
            }
          })
        );
        setCompletedQuizAttempts(attempts);
      } catch (err) {
        console.error('Failed to load course quizzes', err);
      }
    }
    fetchQuizzes();
  }, [course.id]);

  // Fetch student's assignment submissions for score display
  useEffect(() => {
    async function fetchMyAssignmentSubmissions() {
      const token = typeof window !== 'undefined' ? sessionStorage.getItem('token') : null;
      if (!token) return;

      const allAssignmentIds: string[] = [];
      course.tabs.assignments?.forEach((mod) => {
        mod.items.forEach((item) => {
          if (item.type === 'assignment') allAssignmentIds.push(item.id);
        });
      });

      if (allAssignmentIds.length === 0) return;

      const baseUrl = (process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001').replace(/\/$/, '');
      const results: Record<string, { status: string; score?: number | null }> = {};

      await Promise.all(
        allAssignmentIds.map(async (assignmentId) => {
          try {
            const res = await fetch(`${baseUrl}/assignments/${assignmentId}/my-submission`, {
              headers: { Authorization: `Bearer ${token}` },
            });
            if (res.ok) {
              const data = await res.json();
              if (data) {
                results[assignmentId] = { status: data.status, score: data.score };
              }
            }
          } catch {
            // Ignore individual failures
          }
        })
      );

      setAssignmentSubmissions(results);
    }
    fetchMyAssignmentSubmissions();
  }, [course.id, course.tabs.assignments]);

  useEffect(() => {
    // Update openModules when switching tabs
    setOpenModules(Object.fromEntries(course.tabs[activeTab].map((m) => [m.id, true])));
  }, [activeTab, course.tabs]);

  function toggleModule(id: string) {
    setOpenModules((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  function handleStartQuiz(quiz: Quiz) {
    if (quiz) setSelectedQuiz(quiz);
  }

  function handleReview(attemptId: string, quizId: string) {
    router.push(`/quiz/${quizId}/review?attemptId=${attemptId}`);
  }

  return (
    <div className="mx-auto w-full max-w-[1280px] px-4 py-8 sm:px-6 lg:px-8">
      <nav className="mb-7 flex flex-wrap items-center gap-2 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
        <Link href="/dashboard_mahasiswa" className="transition-opacity hover:opacity-70">
          Home
        </Link>
        <span>›</span>
        <Link href={COURSE_CATALOG_HREF} className="transition-opacity hover:opacity-70">
          Courses
        </Link>
        {source === 'my-courses' ? (
          <>
            <span>›</span>
            <Link href={breadcrumbContext.href} className="transition-opacity hover:opacity-70">
              {breadcrumbContext.label}
            </Link>
          </>
        ) : null}
        <span>›</span>
        <span style={{ color: 'var(--color-text-primary)' }}>{course.breadcrumbLabel ?? course.title}</span>
      </nav>

      <section
        className="overflow-hidden rounded-[28px] border bg-white shadow-[0_14px_40px_rgba(7,27,63,0.05)]"
        style={{ borderColor: 'var(--color-border)' }}
      >
        {/* Banner Section */}
        <div className={`relative h-[172px] w-full lg:h-[210px] ${course.bannerColorClass}`}>
          <div
            className="absolute left-1/2 top-[40px] h-3 w-16 -translate-x-1/2 rounded-full opacity-30"
            style={{ background: 'rgba(255,255,255,0.42)' }}
          />
        </div>

      {/* ── Card info course ── */}
      <div className="relative z-10 mx-4 -mt-10 mb-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-md md:-mt-12 lg:mx-8 lg:-mt-14">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">

          {/* Kiri: info */}
          <div className="flex-1 min-w-0">
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-bold uppercase tracking-wide text-blue-700">
                {course.heroAccentLabel || 'Intermediate'}
              </span>
              <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700">
                {course.creditHours} Credits
              </span>
              <span className="flex items-center gap-1 rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-600">
                <Clock className="h-3 w-3" />
                {course.durationWeeks ?? 12} Weeks
              </span>
            </div>

            <h1 className="mb-3 text-xl font-bold text-gray-900 lg:text-2xl">
              {course.title}
            </h1>

            <div className="mb-4 flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-700 text-xs font-bold text-white">
                {course.instructorInitials}
              </div>
              <span className="text-sm font-medium text-gray-800">
                {course.instructorName}
              </span>
              <span className="text-gray-300">•</span>
              <span className="text-sm text-gray-500">
                {course.instructorRole || 'Instructor'}
              </span>
            </div>

            <p className="mb-5 text-sm leading-relaxed text-gray-600">
              {course.description} {course.subtitle}
            </p>

            <div className="flex items-center gap-3">
              <div className="h-2 flex-1 overflow-hidden rounded-full bg-gray-200">
                <div
                  className="h-full rounded-full bg-blue-700 transition-all"
                  style={{ width: `${course.progressPercentage}%` }}
                />
              </div>
              <span className="whitespace-nowrap text-sm text-gray-500">
                {course.progressPercentage}% Complete
              </span>
            </div>
          </div>

          {/* Kanan: tombol aksi */}
          <div className="flex w-full flex-col gap-3 self-start lg:w-[200px] lg:flex-shrink-0">
            {firstMaterial ? (
              <Link 
                href={buildMaterialHref(course.id, firstMaterial.id, source)}
                className="flex items-center justify-center gap-2 rounded-xl bg-blue-700 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-blue-800"
              >
                <Play className="h-4 w-4 fill-white" />
                {course.status === 'notstart' ? 'Start Learning' : 'Continue Learning'}
              </Link>
            ) : (
              <button className="flex items-center justify-center gap-2 rounded-xl bg-blue-700 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-blue-800">
                <Play className="h-4 w-4 fill-white" />
                {course.status === 'notstart' ? 'Start Learning' : 'Continue Learning'}
              </button>
            )}
            
            <button className="flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50">
              <Calendar className="h-4 w-4" />
              View Schedule
            </button>
          </div>
        </div>
      </div>

      {/* ── Tabs ── */}
      <div className="mx-4 lg:mx-8">
        <div className="flex border-b border-gray-200 bg-white rounded-t-xl px-2">
          {TABS.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={cn(
                "border-b-2 px-5 py-4 text-sm font-medium transition-colors",
                activeTab === key
                  ? "border-blue-700 text-blue-700"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              )}
            >
              {label}
            </button>
          ))}
        </div>

        {/* ── Konten tab ── */}
        <div className="rounded-b-xl border border-t-0 border-gray-200 bg-gray-50 p-5">

          {/* Materials & Assignments & Labs */}
          {activeTab !== 'quizzes' && (
            <div className="space-y-4">
              {modules.length === 0 ? (
                <EmptyState text={`Belum ada ${activeTab} untuk course ini.`} />
              ) : (
                modules.map((modul) => (
                  <div
                    key={modul.id}
                    className="overflow-hidden rounded-2xl border border-gray-200 bg-white"
                  >
                    {/* Header modul */}
                    <button
                      onClick={() => toggleModule(modul.id)}
                      className="flex w-full items-center justify-between px-6 py-4 hover:bg-gray-50 transition-colors"
                    >
                      <h2 className="font-semibold text-gray-900">{modul.title}</h2>
                      {openModules[modul.id]
                        ? <ChevronUp className="h-5 w-5 text-gray-400" />
                        : <ChevronDown className="h-5 w-5 text-gray-400" />
                      }
                    </button>

                    {/* Daftar item */}
                    {openModules[modul.id] && (
                      <div className="divide-y divide-gray-100 border-t border-gray-100">
                        {modul.items.map((item) => {
                          const iconConfig = MATERIAL_ICON_MAP[item.type as keyof typeof MATERIAL_ICON_MAP] ?? MATERIAL_ICON_MAP.article;
                          const Icon = iconConfig.Icon;
                          const href = activeTab === 'materials' 
                            ? buildMaterialHref(course.id, item.id, source)
                            : activeTab === 'labs'
                            ? `/labs/${slugify(item.title)}`
                            : buildAssignmentHref(course.id, item.id, source);

                          return (
                            <Link
                              key={item.id}
                              href={href}
                              className={cn(
                                "flex items-center gap-4 px-6 py-4 hover:bg-gray-50 transition-colors",
                                item.isCompleted && "border-l-4 border-l-blue-600"
                              )}
                            >
                              <div className={cn("flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl", iconConfig.bg)}>
                                <Icon className={cn("h-5 w-5", iconConfig.color)} />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-gray-900 text-sm">{item.title}</p>
                                <p className="text-xs text-gray-500 mt-0.5">{item.meta}</p>
                              </div>
                              {/* Assignment submission status & score */}
                              {activeTab === 'assignments' && (() => {
                                const sub = assignmentSubmissions[item.id];
                                if (sub?.status === 'GRADED') {
                                  return (
                                    <div className="flex flex-col items-end gap-1 flex-shrink-0">
                                      <span className="text-[10px] font-bold px-2.5 py-1 rounded uppercase tracking-wider" style={{ background: '#D1FAE5', color: '#065F46' }}>
                                        Sudah Dinilai
                                      </span>
                                      <span className="text-sm font-bold" style={{ color: (sub.score ?? 0) >= 80 ? '#059669' : '#D97706' }}>
                                        {sub.score}/100
                                      </span>
                                    </div>
                                  );
                                }
                                if (sub?.status === 'PENDING') {
                                  return (
                                    <span className="text-[10px] font-bold px-2.5 py-1 rounded uppercase tracking-wider flex-shrink-0" style={{ background: '#DBEAFE', color: '#1D4ED8' }}>
                                      Menunggu Penilaian
                                    </span>
                                  );
                                }
                                return (
                                  <span className="text-[10px] font-bold px-2.5 py-1 rounded uppercase tracking-wider flex-shrink-0" style={{ background: '#FEF3C7', color: '#92400E' }}>
                                    Belum Dikerjakan
                                  </span>
                                );
                              })()}
                              {item.isCompleted && (
                                <CheckCircle2 className="h-5 w-5 flex-shrink-0 text-blue-600" />
                              )}
                            </Link>
                          );
                        })}

                        {/* Tampilkan baris quiz jika ada di modul ini (hanya untuk referensi quiz di tab materials) */}
                        {activeTab === 'materials' && courseQuizzes.filter(q => q.moduleId === modul.id).map(quiz => (
                          <QuizRow
                            key={quiz.id}
                            quiz={quiz}
                            completedAttemptId={completedQuizAttempts[quiz.id] || getCompletedAttemptId(quiz.id)}
                            onStart={handleStartQuiz}
                            onReview={handleReview}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          )}

          {/* Quizzes Tab */}
          {activeTab === "quizzes" && (
            <div className="space-y-3">
              {courseQuizzes.length === 0 ? (
                <EmptyState text="Belum ada kuis untuk course ini." />
              ) : (
                courseQuizzes.map((quiz) => {
                  const completedAttemptId = completedQuizAttempts[quiz.id] || getCompletedAttemptId(quiz.id);
                  const isCompleted = Boolean(completedAttemptId);
                  return (
                    <div
                      key={quiz.id}
                      className="flex items-center gap-4 rounded-2xl border border-gray-200 bg-white px-5 py-4"
                    >
                      <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-orange-50">
                        <HelpCircle className="h-5 w-5 text-orange-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-900 text-sm">{quiz.title}</p>
                        <div className="mt-1 flex items-center gap-3 text-xs text-gray-500">
                          <span>{quiz.durationMinutes} menit</span>
                          <span>{quiz.totalQuestions} soal</span>
                          <span className="font-medium text-yellow-600">+{quiz.xpReward} XP</span>
                        </div>
                      </div>
                      {isCompleted ? (
                        <button
                          onClick={() => handleReview(completedAttemptId!, quiz.id)}
                          className="flex-shrink-0 rounded-lg border border-blue-700 px-4 py-2 text-xs font-semibold text-blue-700 transition-colors hover:bg-blue-50"
                        >
                          Lihat Review
                        </button>
                      ) : (
                        <button
                          onClick={() => setSelectedQuiz(quiz)}
                          className="flex-shrink-0 rounded-lg bg-blue-700 px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-blue-800"
                        >
                          Mulai Kuis
                        </button>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>
      </div>
      </section>

      {/* Modal info quiz */}
      {selectedQuiz && (
        <QuizInfoModal
          quiz={selectedQuiz}
          onStart={() => router.push(`/quiz/${selectedQuiz.id}`)}
          onClose={() => setSelectedQuiz(null)}
        />
      )}
    </div>
  );
}

function ActionButton({
  children,
  primary = false,
  icon,
  href,
  onClick,
}: {
  children: React.ReactNode;
  primary?: boolean;
  icon?: React.ReactNode;
  href?: string;
  onClick?: () => void;
}) {
  const className = "flex h-14 items-center justify-center gap-2 rounded-[18px] border px-5 text-lg font-semibold transition-opacity hover:opacity-90";
  const style =
    primary
      ? {
          background: 'var(--color-brand-primary)',
          borderColor: 'var(--color-brand-primary)',
          color: '#FFFFFF',
        }
      : {
          background: '#FFFFFF',
          borderColor: 'var(--color-brand-primary)',
          color: 'var(--color-brand-primary)',
        };

  if (href) {
    return (
      <Link
        href={href}
        className={className}
        style={style}
      >
        {icon}
        {children}
      </Link>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className="flex h-14 items-center justify-center gap-2 rounded-[18px] border px-5 text-lg font-semibold transition-opacity hover:opacity-90"
      style={style}
    >
      {icon}
      {children}
    </button>
  );
}

function ChevronIcon({ expanded }: { expanded: boolean }) {
  return (
    <svg
      width="28"
      height="28"
      viewBox="0 0 28 28"
      fill="none"
      style={{ transform: expanded ? 'rotate(0deg)' : 'rotate(-90deg)', transition: 'transform 0.2s ease' }}
    >
      <path d="M7 11.5 14 18.5 21 11.5" stroke="#434654" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <circle cx="8" cy="8" r="6.25" stroke="currentColor" strokeWidth="1.5" />
      <path d="M8 4.5v3.75l2.5 1.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <path d="m4 9 3.2 3.2L14 5.5" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function PlayButtonIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <circle cx="9" cy="9" r="8" stroke="currentColor" strokeWidth="1.8" />
      <path d="m7.5 5.8 5 3.2-5 3.2V5.8Z" fill="currentColor" />
    </svg>
  );
}

function CalendarButtonIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <rect x="2" y="3.5" width="14" height="12.5" rx="2" stroke="currentColor" strokeWidth="1.6" />
      <path d="M12.5 2v3M5.5 2v3M2 7.5h14" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

function getContentItemHref({
  activeTab,
  courseId,
  itemId,
  source,
}: {
  activeTab: CourseContentTab;
  courseId: number | string;
  itemId: string;
  source: CourseSource;
}) {
  if (activeTab === 'materials') {
    return buildMaterialHref(courseId, itemId, source);
  }

  if (activeTab === 'assignments') {
    return buildAssignmentHref(courseId, itemId, source);
  }

  return undefined;
}
