'use client';

import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import {
  BarChart2,
  BookOpen,
  ChevronDown,
  FileText,
  HelpCircle,
  Link as LinkIcon,
  Lock,
  Pencil,
  PlayCircle,
  Plus,
  Settings,
  Users,
} from 'lucide-react';
import { getQuizzesByCourse } from '@/app/lib/api/quiz';
import type { Quiz } from '@/app/types/quiz';
import type {
  LecturerCourseModule,
  LecturerManageCourseData,
  LecturerMaterialKind,
} from '@/lib/types/course';
import { LecturerBreadcrumbs } from './LecturerBreadcrumbs';
import { slugify } from '@/utils/slugify';

interface LecturerManageCourseViewProps {
  data: LecturerManageCourseData;
}

type RawQuizResponse = Partial<Quiz> & {
  _count?: {
    questions?: number;
  };
  timeLimit?: number;
  passingScore?: number;
};

const MODULE_STATUS_STYLES = {
  Published: 'border-green-200 bg-green-50 text-green-700',
  Draft: 'border-amber-200 bg-amber-50 text-amber-700',
  Hidden: 'border-slate-200 bg-slate-50 text-slate-600',
} as const;

export function LecturerManageCourseView({ data }: LecturerManageCourseViewProps) {
  const router = useRouter();
  const courseId = data.course.id.toString();
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [quizError, setQuizError] = useState<string | null>(null);
  const [expandedModules, setExpandedModules] = useState<Record<string, boolean>>(() =>
    getInitialExpandedModules(data.modules)
  );

  useEffect(() => {
    let isMounted = true;

    async function loadQuizzes() {
      try {
        const rawQuizzes = await getQuizzesByCourse(courseId);
        if (!isMounted) return;

        setQuizzes(Array.isArray(rawQuizzes) ? rawQuizzes.map(adaptQuiz) : []);
        setQuizError(null);
      } catch (error) {
        console.error(error);
        if (!isMounted) return;

        setQuizzes([]);
        setQuizError('Gagal memuat data kuis.');
      }
    }

    loadQuizzes();

    return () => {
      isMounted = false;
    };
  }, [courseId]);

  const quizzesByModule = useMemo(() => groupQuizzesByModule(quizzes), [quizzes]);

  function toggleModule(moduleId: string) {
    setExpandedModules((currentModules) => ({
      ...currentModules,
      [moduleId]: !currentModules[moduleId],
    }));
  }

  return (
    <div className="mx-auto min-h-full w-full max-w-[1240px] px-4 py-7 sm:px-6 lg:px-8">
      <LecturerBreadcrumbs
        items={[
          { label: 'Home', href: '/dashboard_dosen' },
          { label: 'Courses', href: '/dosen/courses' },
          { label: data.course.title },
        ]}
      />

      <section className="rounded-[28px] border border-slate-200 bg-white px-5 py-5 shadow-sm sm:px-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-700">Manage Course</p>
            <h1 className="mt-2 text-3xl font-bold leading-tight text-slate-950 sm:text-4xl">
              {data.course.title}
            </h1>
            <div className="mt-3 flex flex-wrap items-center gap-2 text-sm font-medium text-slate-500">
              <span>{data.course.code}</span>
              <span>-</span>
              <span>{data.termLabel}</span>
              <span>-</span>
              <span>{data.credits} Credits</span>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => router.push(`/dosen/courses/${courseId}/settings`)}
              className="inline-flex h-11 items-center gap-2 rounded-xl border border-blue-200 bg-white px-4 text-sm font-semibold text-blue-700 shadow-sm transition hover:bg-blue-50"
            >
              <Settings className="h-4 w-4" />
              Course Settings
            </button>
            <button
              type="button"
              onClick={() => router.push(`/dosen/courses/${courseId}/modules/create`)}
              className="inline-flex h-11 items-center gap-2 rounded-xl bg-blue-700 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-800"
            >
              <Plus className="h-4 w-4" />
              New Module
            </button>
          </div>
        </div>
      </section>

      <div className="mt-6 grid gap-6 xl:grid-cols-[300px_minmax(0,1fr)]">
        <EnrollmentSummaryCard
          enrolledStudents={data.enrolledStudents}
          weeklyGrowth={data.weeklyGrowth}
          onManageEnrollment={() => router.push(`/dosen/courses/${courseId}/enrollment`)}
        />

        <section className="space-y-4">
          {quizError ? (
            <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-700">
              {quizError}
            </div>
          ) : null}

          {data.modules.length === 0 ? (
            <EmptyModulesCard onCreateModule={() => router.push(`/dosen/courses/${courseId}/modules/create`)} />
          ) : (
            data.modules.map((courseModule, moduleIndex) => {
              const moduleQuizzes = quizzesByModule.get(courseModule.id) ?? [];
              const moduleAssignments = courseModule.assessments.filter(
                (assessment) => assessment.kind === 'assignment'
              );
              const moduleLabs = courseModule.assessments.filter(
                (assessment) => assessment.kind === 'lab'
              );

              return (
                <ModuleCard
                  key={courseModule.id}
                  courseId={courseId}
                  moduleIndex={moduleIndex}
                  courseModule={courseModule}
                  moduleQuizzes={moduleQuizzes}
                  moduleAssignments={moduleAssignments}
                  moduleLabs={moduleLabs}
                  isExpanded={expandedModules[courseModule.id] ?? false}
                  onToggle={() => toggleModule(courseModule.id)}
                  onNavigate={(href) => router.push(href)}
                />
              );
            })
          )}
        </section>
      </div>
    </div>
  );
}

function EnrollmentSummaryCard({
  enrolledStudents,
  weeklyGrowth,
  onManageEnrollment,
}: {
  enrolledStudents: number;
  weeklyGrowth: number;
  onManageEnrollment: () => void;
}) {
  return (
    <aside className="h-fit rounded-3xl bg-gradient-to-br from-blue-700 via-blue-600 to-indigo-700 p-6 text-white shadow-lg shadow-blue-950/10">
      <div className="mb-7 flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-blue-100">View Enrolled</p>
          <p className="text-sm font-semibold text-blue-100">Students</p>
        </div>
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/18 ring-1 ring-white/20">
          <Users className="h-5 w-5" />
        </div>
      </div>

      <p className="text-6xl font-black leading-none tracking-tight">{enrolledStudents}</p>
      <p className="mt-4 text-sm font-medium text-blue-100">+{weeklyGrowth} new students this week</p>

      <button
        type="button"
        onClick={onManageEnrollment}
        className="mt-7 inline-flex w-full items-center justify-center rounded-xl border border-white/25 bg-white/18 px-4 py-3 text-sm font-bold text-white transition hover:bg-white/25"
      >
        Manage Enrollment
      </button>
    </aside>
  );
}

function EmptyModulesCard({ onCreateModule }: { onCreateModule: () => void }) {
  return (
    <div className="rounded-3xl border-2 border-dashed border-slate-200 bg-white p-10 text-center shadow-sm">
      <BookOpen className="mx-auto mb-3 h-9 w-9 text-slate-300" />
      <p className="text-sm font-medium text-slate-500">Belum ada modul untuk kelas ini.</p>
      <button
        type="button"
        onClick={onCreateModule}
        className="mx-auto mt-5 inline-flex items-center gap-2 rounded-xl bg-blue-700 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-800"
      >
        <Plus className="h-4 w-4" />
        Buat Modul Pertama
      </button>
    </div>
  );
}

function ModuleCard({
  courseId,
  moduleIndex,
  courseModule,
  moduleQuizzes,
  moduleAssignments,
  moduleLabs,
  isExpanded,
  onToggle,
  onNavigate,
}: {
  courseId: string;
  moduleIndex: number;
  courseModule: LecturerCourseModule;
  moduleQuizzes: Quiz[];
  moduleAssignments: LecturerCourseModule['assessments'];
  moduleLabs: LecturerCourseModule['assessments'];
  isExpanded: boolean;
  onToggle: () => void;
  onNavigate: (href: string) => void;
}) {
  const isHiddenModule = courseModule.status === 'Hidden';

  return (
    <article className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center justify-between gap-4 px-5 py-5 text-left transition hover:bg-slate-50 sm:px-6"
      >
        <div className="flex min-w-0 flex-1 items-center gap-4">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-sm font-black text-blue-700">
            M{moduleIndex + 1}
          </span>
          <div className="min-w-0">
            <h2 className="truncate text-base font-bold text-slate-950">{courseModule.title}</h2>
            <p className="mt-1 text-sm text-slate-500">
              {courseModule.weekLabel} - {courseModule.materials.length} Materials - {moduleQuizzes.length} Quiz - {moduleAssignments.length + moduleLabs.length} Assessment
            </p>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-3">
          <ModuleStatusBadge status={courseModule.status} />
          <ChevronDown className={`h-5 w-5 text-slate-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
        </div>
      </button>

      {isExpanded && !isHiddenModule ? (
        <div className="divide-y divide-slate-100 border-t border-slate-100">
          <LearningMaterialsSection courseId={courseId} courseModule={courseModule} onNavigate={onNavigate} />
          <AssessmentsSection
            courseId={courseId}
            courseModule={courseModule}
            quizzes={moduleQuizzes}
            assignments={moduleAssignments}
            labs={moduleLabs}
            onNavigate={onNavigate}
          />
          <div className="flex justify-end px-5 py-4 sm:px-6">
            <button
              type="button"
              onClick={() => onNavigate(`/dosen/courses/${courseId}/modules/${courseModule.id}/edit`)}
              className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
            >
              Edit Module Settings
            </button>
          </div>
        </div>
      ) : null}
    </article>
  );
}

function LearningMaterialsSection({
  courseId,
  courseModule,
  onNavigate,
}: {
  courseId: string;
  courseModule: LecturerCourseModule;
  onNavigate: (href: string) => void;
}) {
  return (
    <section className="px-5 py-5 sm:px-6">
      <SectionHeader
        icon={<FileText className="h-4 w-4" />}
        title="Learning Materials"
        actionNode={
          <button
            type="button"
            onClick={() => onNavigate(`/dosen/courses/${courseId}/modules/${courseModule.id}/materials/create`)}
            className="flex items-center gap-1.5 rounded-xl border border-blue-200 bg-blue-50/50 px-3.5 py-1.5 text-xs font-bold text-blue-700 shadow-sm transition hover:bg-blue-600 hover:text-white"
          >
            <Plus className="h-3.5 w-3.5" />
            Add Material
          </button>
        }
      />

      <div className="mt-4 space-y-3">
        {courseModule.materials.length === 0 ? (
          <EmptyText>No materials yet.</EmptyText>
        ) : (
          courseModule.materials.map((material) => (
            <div
              key={material.id}
              className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50/60 px-4 py-3 transition hover:border-blue-200 hover:bg-blue-50/40"
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-blue-600 shadow-sm">
                <MaterialKindIcon kind={material.kind} />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-bold text-slate-900">{material.title}</p>
                <p className="mt-0.5 truncate text-xs text-slate-500">{material.meta}</p>
              </div>
              <button
                type="button"
                onClick={() => onNavigate(`/dosen/courses/${courseId}/modules/${courseModule.id}/materials/${material.id}/edit`)}
                className="rounded-xl p-2 text-slate-400 transition hover:bg-blue-100 hover:text-blue-700"
                aria-label={`Edit ${material.title}`}
              >
                <Pencil className="h-4 w-4" />
              </button>
            </div>
          ))
        )}
      </div>
    </section>
  );
}

function AssessmentsSection({
  courseId,
  courseModule,
  quizzes,
  assignments,
  labs,
  onNavigate,
}: {
  courseId: string;
  courseModule: LecturerCourseModule;
  quizzes: Quiz[];
  assignments: LecturerCourseModule['assessments'];
  labs: LecturerCourseModule['assessments'];
  onNavigate: (href: string) => void;
}) {
  const hasAssessments = quizzes.length > 0 || assignments.length > 0 || labs.length > 0;
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  useEffect(() => {
    if (!isDropdownOpen) return;
    const handleClose = () => setIsDropdownOpen(false);
    window.addEventListener('click', handleClose);
    return () => window.removeEventListener('click', handleClose);
  }, [isDropdownOpen]);

  return (
    <section className="px-5 py-5 sm:px-6">
      <SectionHeader
        icon={<HelpCircle className="h-4 w-4" />}
        title="Assessments"
        actionNode={
          <div className="relative inline-block text-left">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsDropdownOpen(!isDropdownOpen);
              }}
              className="flex items-center gap-1.5 rounded-xl border border-blue-200 bg-blue-50/50 px-3.5 py-1.5 text-xs font-bold text-blue-700 shadow-sm transition hover:bg-blue-600 hover:text-white"
            >
              <Plus className="h-3.5 w-3.5" />
              Add Assessment
              <ChevronDown className={`ml-0.5 h-3.5 w-3.5 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {isDropdownOpen && (
              <div 
                className="absolute right-0 mt-2 w-48 origin-top-right rounded-2xl border border-slate-200 bg-white p-1.5 shadow-lg ring-1 ring-black/5 focus:outline-none z-50"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  type="button"
                  onClick={() => {
                    setIsDropdownOpen(false);
                    onNavigate(`/dosen/quiz/create?courseId=${courseId}&moduleId=${courseModule.id}`);
                  }}
                  className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
                >
                  <HelpCircle className="h-4 w-4 text-red-500" />
                  Create Quiz
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsDropdownOpen(false);
                    onNavigate(`/dosen/courses/${courseId}/modules/${courseModule.id}/assignments/create`);
                  }}
                  className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
                >
                  <FileText className="h-4 w-4 text-blue-500" />
                  Create Assignment
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsDropdownOpen(false);
                    onNavigate(`/dosen/courses/${courseId}/modules/${courseModule.id}/labs/create`);
                  }}
                  className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
                >
                  <svg className="h-4 w-4 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
                    <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
                  </svg>
                  Create Lab
                </button>
              </div>
            )}
          </div>
        }
      />

      <div className="mt-4 space-y-3">
        {!hasAssessments ? <EmptyText>No assessments yet.</EmptyText> : null}

        {quizzes.map((quiz) => (
          <div
            key={quiz.id}
            className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 transition hover:border-blue-200 hover:bg-blue-50/40"
          >
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-50 text-red-600">
              <HelpCircle className="h-4 w-4" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-bold text-slate-900">{quiz.title}</p>
              <p className="mt-0.5 text-xs text-slate-500">
                {quiz.durationMinutes} menit - {quiz.totalQuestions} Questions
              </p>
            </div>
            <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700">
              {getQuizBadgeLabel(quiz)}
            </span>
            <button
              type="button"
              onClick={() => onNavigate(`/dosen/quiz/${quiz.id}/stats`)}
              className="rounded-xl p-2 text-slate-400 transition hover:bg-blue-100 hover:text-blue-700"
              aria-label={`Lihat statistik ${quiz.title}`}
            >
              <BarChart2 className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => onNavigate(`/dosen/quiz/${quiz.id}/edit`)}
              className="rounded-xl p-2 text-slate-400 transition hover:bg-blue-100 hover:text-blue-700"
              aria-label={`Edit ${quiz.title}`}
            >
              <Pencil className="h-4 w-4" />
            </button>
          </div>
        ))}

        {assignments.map((assignment) => (
          <div
            key={assignment.id}
            className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 transition hover:border-blue-200 hover:bg-blue-50/40"
          >
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <FileText className="h-4 w-4" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-bold text-slate-900">{assignment.title}</p>
              <p className="mt-0.5 truncate text-xs text-slate-500">{assignment.meta}</p>
            </div>
            {assignment.badgeLabel ? (
              <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700">
                {assignment.badgeLabel}
              </span>
            ) : null}
            <button
              type="button"
              onClick={() => onNavigate(`/dosen/courses/${courseId}/modules/${courseModule.id}/assignments/${assignment.id}/submissions`)}
              className="rounded-xl p-2 text-slate-400 transition hover:bg-blue-100 hover:text-blue-700"
              aria-label={`Lihat pengumpulan ${assignment.title}`}
            >
              <Users className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => onNavigate(`/dosen/courses/${courseId}/modules/${courseModule.id}/assignments/${assignment.id}/edit`)}
              className="rounded-xl p-2 text-slate-400 transition hover:bg-blue-100 hover:text-blue-700"
              aria-label={`Edit ${assignment.title}`}
            >
              <Pencil className="h-4 w-4" />
            </button>
          </div>
        ))}

        {labs.map((lab) => (
          <div
            key={lab.id}
            className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 transition hover:border-blue-200 hover:bg-blue-50/40"
          >
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-purple-50 text-purple-600">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
                <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
              </svg>
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-bold text-slate-900">{lab.title}</p>
              <p className="mt-0.5 truncate text-xs text-slate-500">Practical Lab</p>
            </div>
            <span className="rounded-full bg-purple-50 px-3 py-1 text-xs font-bold text-purple-700">
              Practical Lab
            </span>
            <button
              type="button"
              onClick={() => onNavigate(`/labs/${slugify(lab.title)}?mode=lecturer`)}
              className="rounded-xl p-2 text-slate-400 transition hover:bg-blue-100 hover:text-blue-700"
              aria-label={`Manage ${lab.title}`}
            >
              <Pencil className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}

function SectionHeader({
  icon,
  title,
  actionNode,
}: {
  icon: ReactNode;
  title: string;
  actionNode?: ReactNode;
}) {
  return (
    <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
      <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.12em] text-slate-700">
        {icon}
        {title}
      </div>
      {actionNode ? <div>{actionNode}</div> : null}
    </div>
  );
}

function ModuleStatusBadge({ status }: { status: LecturerCourseModule['status'] }) {
  const lockIcon = status === 'Hidden' ? <Lock className="h-3 w-3" /> : null;

  return (
    <span className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-bold ${MODULE_STATUS_STYLES[status]}`}>
      {lockIcon}
      {status}
    </span>
  );
}

function EmptyText({ children }: { children: ReactNode }) {
  return <p className="text-sm italic text-slate-500">{children}</p>;
}

function MaterialKindIcon({ kind }: { kind: LecturerMaterialKind }) {
  if (kind === 'video') {
    return <PlayCircle className="h-4 w-4" />;
  }

  if (kind === 'link') {
    return <LinkIcon className="h-4 w-4" />;
  }

  return <FileText className="h-4 w-4" />;
}

function adaptQuiz(rawQuiz: RawQuizResponse): Quiz {
  return {
    id: rawQuiz.id ?? '',
    title: rawQuiz.title ?? 'Untitled Quiz',
    courseId: rawQuiz.courseId ?? '',
    moduleId: rawQuiz.moduleId ?? '',
    moduleTitle: rawQuiz.moduleTitle ?? '-',
    status: rawQuiz.status ?? 'DRAFT',
    totalQuestions: rawQuiz._count?.questions ?? rawQuiz.totalQuestions ?? 0,
    durationMinutes: rawQuiz.timeLimit ?? rawQuiz.durationMinutes ?? 0,
    xpReward: rawQuiz.xpReward ?? 0,
    minimumScore: rawQuiz.passingScore ?? rawQuiz.minimumScore ?? 0,
    createdAt: rawQuiz.createdAt ?? '',
    updatedAt: rawQuiz.updatedAt ?? '',
  };
}

function groupQuizzesByModule(quizzes: Quiz[]) {
  const quizzesByModule = new Map<string, Quiz[]>();

  for (const quiz of quizzes) {
    const currentQuizzes = quizzesByModule.get(quiz.moduleId) ?? [];
    quizzesByModule.set(quiz.moduleId, [...currentQuizzes, quiz]);
  }

  return quizzesByModule;
}

function getInitialExpandedModules(modules: LecturerCourseModule[]) {
  return Object.fromEntries(modules.map((courseModule) => [courseModule.id, courseModule.defaultExpanded ?? true]));
}

function getQuizBadgeLabel(quiz: Quiz) {
  return quiz.status === 'DRAFT' || quiz.status === 'draft' ? 'Draft' : 'Auto-graded';
}
