'use client';

import Link from 'next/link';
import React from 'react';
import { useRouter } from 'next/navigation';
import { getApiBaseUrl } from '@/lib/api/apiConfig';
import type {
  AssignmentSubmission,
  AssignmentSubmissionsData,
} from '@/lib/types/course';
import { LecturerBreadcrumbs } from './LecturerBreadcrumbs';
import { gradeSubmission } from '@/app/lib/api/assignment';

type AssignmentSubmissionStatus = 'Pending' | 'Graded' | 'Late';

interface LecturerAssignmentSubmissionsViewProps extends AssignmentSubmissionsData {}

const STATUS_STYLE: Record<AssignmentSubmissionStatus, { background: string; color: string }> = {
  Pending: { background: '#FFF3D6', color: '#9A5B00' },
  Graded: { background: '#E7F6EE', color: '#187346' },
  Late: { background: '#FFECEC', color: '#B42318' },
};

export function LecturerAssignmentSubmissionsView({
  course,
  moduleInfo,
  assignment,
  submissions,
}: LecturerAssignmentSubmissionsViewProps) {
  const router = useRouter();
  const [selectedSubmission, setSelectedSubmission] =
    React.useState<AssignmentSubmission | null>(null);
  const [localSubmissions, setLocalSubmissions] =
    React.useState<AssignmentSubmission[]>(submissions);
  const [isSaving, setIsSaving] = React.useState(false);

  React.useEffect(() => {
    setLocalSubmissions(submissions);
  }, [submissions]);

  const returnHref = `/dosen/courses/${course.id}/assignments`;

  const handleSaveGrade = async (score: number, feedback: string) => {
    if (!selectedSubmission) return;
    setIsSaving(true);
    try {
      await gradeSubmission(selectedSubmission.id, score, feedback);
      setLocalSubmissions((prev) =>
        prev.map((sub) =>
          sub.id === selectedSubmission.id
            ? { ...sub, score, feedback, status: 'Graded' }
            : sub
        )
      );
      setSelectedSubmission(null);
      router.refresh();
    } catch (err: any) {
      console.error(err);
      alert(err.message || 'Gagal menyimpan nilai.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <div className="mx-auto w-full max-w-[1180px] px-4 py-8 sm:px-6 lg:px-8">
        <LecturerBreadcrumbs
          items={[
            { label: 'Home', href: '/dashboard_dosen' },
            { label: 'Courses', href: '/dosen/courses' },
            { label: course.title, href: `/dosen/courses/${course.id}` },
            { label: 'Assignments', href: returnHref },
            { label: 'Submissions' },
          ]}
        />

        <HeaderSection
          courseId={course.id}
          moduleLabel={moduleInfo.orderLabel}
          assignmentTitle={assignment.title}
        />

        {localSubmissions.length > 0 ? (
          <SubmissionList
            submissions={localSubmissions}
            onGrade={setSelectedSubmission}
          />
        ) : (
          <EmptySubmissionsState courseId={course.id} />
        )}
      </div>

      <GradeSubmissionDialog
        submission={selectedSubmission}
        assignmentTitle={assignment.title}
        onClose={() => setSelectedSubmission(null)}
        onSave={handleSaveGrade}
        isSaving={isSaving}
      />
    </>
  );
}

function HeaderSection({
  courseId,
  moduleLabel,
  assignmentTitle,
}: {
  courseId: string;
  moduleLabel: string;
  assignmentTitle: string;
}) {
  return (
    <section className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
      <div className="min-w-0">
        <p
          className="mb-2 text-sm font-semibold uppercase tracking-[0.08em]"
          style={{ color: 'var(--color-brand-primary)' }}
        >
          {moduleLabel} Assignment Submissions
        </p>
        <h1
          className="text-[32px] font-bold leading-tight sm:text-[44px]"
          style={{ color: 'var(--color-text-primary)' }}
        >
          {assignmentTitle}
        </h1>
        <p className="mt-3 text-lg" style={{ color: 'var(--color-text-secondary)' }}>
          Review submitted files, submission dates, and grade student work.
        </p>
      </div>

      <Link
        href={`/dosen/courses/${courseId}/assignments`}
        className="inline-flex h-12 min-w-[190px] items-center justify-center whitespace-nowrap rounded-[14px] border px-5 text-base font-semibold no-underline transition-colors hover:bg-[#F5F8FF]"
        style={{
          borderColor: 'var(--color-brand-primary)',
          color: 'var(--color-brand-primary)',
        }}
      >
        Back to Assignments
      </Link>
    </section>
  );
}

function SubmissionList({
  submissions,
  onGrade,
}: {
  submissions: AssignmentSubmission[];
  onGrade: (submission: AssignmentSubmission) => void;
}) {
  return (
    <section
      className="overflow-hidden rounded-[24px] border bg-white shadow-[0_14px_32px_rgba(15,33,74,0.04)]"
      style={{ borderColor: 'var(--color-border)' }}
    >
      <div className="hidden grid-cols-[minmax(220px,1.2fr)_minmax(180px,0.8fr)_180px_140px_120px] gap-5 border-b px-6 py-4 text-sm font-bold uppercase tracking-[0.08em] lg:grid">
        <span>Student</span>
        <span>Submitted File</span>
        <span>Date Submitted</span>
        <span>Status</span>
        <span className="text-right">Action</span>
      </div>

      <div className="divide-y" style={{ borderColor: 'var(--color-border)' }}>
        {submissions.map((submission) => (
          <SubmissionRow
            key={submission.id}
            submission={submission}
            onGrade={onGrade}
          />
        ))}
      </div>
    </section>
  );
}

function SubmissionRow({
  submission,
  onGrade,
}: {
  submission: AssignmentSubmission;
  onGrade: (submission: AssignmentSubmission) => void;
}) {
  return (
    <article className="grid grid-cols-1 gap-4 px-5 py-5 lg:grid-cols-[minmax(220px,1.2fr)_minmax(180px,0.8fr)_180px_140px_120px] lg:items-center lg:px-6">
      <StudentIdentity submission={submission} />
      <SubmittedFile submission={submission} />
      <SubmissionDate submittedAt={submission.submittedAt} />
      <StatusPill status={submission.status} />
      <button
        type="button"
        onClick={() => onGrade(submission)}
        className="inline-flex h-11 items-center justify-center rounded-[12px] px-4 text-base font-semibold text-white transition-opacity hover:opacity-90 lg:justify-self-end"
        style={{ background: 'var(--color-brand-primary)' }}
      >
        Grade
      </button>
    </article>
  );
}

function StudentIdentity({ submission }: { submission: AssignmentSubmission }) {
  return (
    <div className="flex min-w-0 items-center gap-3">
      <div
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-sm font-bold"
        style={{ background: '#E7EEFF', color: 'var(--color-brand-primary)' }}
      >
        {createInitials(submission.student.name)}
      </div>
      <div className="min-w-0">
        <p className="truncate text-base font-bold" style={{ color: 'var(--color-text-primary)' }}>
          {submission.student.name}
        </p>
        <p className="truncate text-sm" style={{ color: 'var(--color-text-secondary)' }}>
          {submission.student.email}
        </p>
      </div>
    </div>
  );
}

const resolveFileUrl = (url?: string | null) => {
  if (!url) return "";
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  const baseUrl = getApiBaseUrl().replace(/\/$/, "");
  return `${baseUrl}${url.startsWith("/") ? "" : "/"}${url}`;
};

function SubmittedFile({ submission }: { submission: AssignmentSubmission }) {
  if (!submission.fileUrl) {
    return (
      <div className="min-w-0">
        <p className="truncate text-base font-semibold" style={{ color: 'var(--color-text-primary)' }}>
          No File
        </p>
      </div>
    );
  }

  const filename = submission.fileUrl.split("/").pop() || "Submitted File";

  return (
    <div className="min-w-0">
      <a
        href={resolveFileUrl(submission.fileUrl)}
        target="_blank"
        rel="noreferrer"
        className="truncate text-base font-semibold text-blue-600 hover:underline block"
        title={filename}
      >
        {filename}
      </a>
      <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
        Klik untuk mengunduh
      </p>
    </div>
  );
}

function SubmissionDate({ submittedAt }: { submittedAt: string }) {
  return (
    <p className="text-base" style={{ color: 'var(--color-text-secondary)' }}>
      {formatDateTime(submittedAt)}
    </p>
  );
}

function StatusPill({ status }: { status: AssignmentSubmissionStatus }) {
  return (
    <span
      className="inline-flex w-fit items-center rounded-full px-3 py-1 text-sm font-semibold"
      style={STATUS_STYLE[status]}
    >
      {status}
    </span>
  );
}

function EmptySubmissionsState({ courseId }: { courseId: string }) {
  return (
    <section
      className="rounded-[24px] border bg-white px-6 py-16 text-center shadow-[0_14px_32px_rgba(15,33,74,0.04)]"
      style={{ borderColor: 'var(--color-border)' }}
    >
      <h2 className="text-2xl font-bold" style={{ color: 'var(--color-text-primary)' }}>
        No submissions yet
      </h2>
      <p className="mx-auto mt-3 max-w-[520px] text-base" style={{ color: 'var(--color-text-secondary)' }}>
        No student has submitted this assignment yet.
      </p>
      <Link
        href={`/dosen/courses/${courseId}/assignments`}
        className="mt-7 inline-flex h-12 items-center justify-center rounded-[14px] px-5 text-base font-semibold text-white no-underline transition-opacity hover:opacity-90"
        style={{ background: 'var(--color-brand-primary)' }}
      >
        Back to Assignments
      </Link>
    </section>
  );
}

function GradeSubmissionDialog({
  submission,
  assignmentTitle,
  onClose,
  onSave,
  isSaving,
}: {
  submission: AssignmentSubmission | null;
  assignmentTitle: string;
  onClose: () => void;
  onSave: (score: number, feedback: string) => void;
  isSaving: boolean;
}) {
  const [score, setScore] = React.useState<string>('');
  const [feedback, setFeedback] = React.useState<string>('');

  React.useEffect(() => {
    if (submission) {
      setScore(submission.score !== undefined ? String(submission.score) : '');
      setFeedback(submission.feedback || '');
    }
  }, [submission]);

  if (!submission) {
    return null;
  }

  const handleSave = () => {
    const parsed = Number(score);
    if (score === '' || isNaN(parsed) || parsed < 0 || parsed > 100) {
      alert("Masukkan nilai yang valid (0 - 100)!");
      return;
    }
    onSave(parsed, feedback);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 px-4">
      <section className="w-full max-w-[520px] rounded-[24px] bg-white p-6 shadow-[0_24px_80px_rgba(15,33,74,0.24)]">
        <div className="mb-5">
          <p className="text-sm font-semibold uppercase tracking-[0.08em]" style={{ color: 'var(--color-brand-primary)' }}>
            Grade Submission
          </p>
          <h2 className="mt-2 text-2xl font-bold" style={{ color: 'var(--color-text-primary)' }}>
            {submission.student.name}
          </h2>
          <p className="mt-1 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
            {assignmentTitle}
          </p>
        </div>

        <div className="space-y-4">
          <label className="block">
            <span className="mb-2 block text-sm font-bold" style={{ color: 'var(--color-text-primary)' }}>
              Score
            </span>
            <input
              type="number"
              min="0"
              max="100"
              value={score}
              onChange={(e) => setScore(e.target.value)}
              placeholder="0 - 100"
              className="h-12 w-full rounded-[14px] border px-4 text-base outline-none"
              style={{ borderColor: 'var(--color-border)' }}
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-bold" style={{ color: 'var(--color-text-primary)' }}>
              Feedback
            </span>
            <textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Write brief feedback for the student..."
              className="min-h-[120px] w-full resize-none rounded-[14px] border px-4 py-3 text-base outline-none"
              style={{ borderColor: 'var(--color-border)' }}
            />
          </label>
        </div>

        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            className="h-11 rounded-[12px] border px-5 text-base font-semibold"
            style={{
              borderColor: 'var(--color-border)',
              color: 'var(--color-text-secondary)',
            }}
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={isSaving}
            onClick={handleSave}
            className="h-11 rounded-[12px] px-5 text-base font-semibold text-white flex items-center justify-center gap-2 animate-[pulse_2s_infinite]"
            style={{ background: 'var(--color-brand-primary)' }}
          >
            {isSaving ? (
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : null}
            Save Grade
          </button>
        </div>
      </section>
    </div>
  );
}

function createInitials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase())
    .join('');
}

function formatDateTime(dateTime: string) {
  return new Intl.DateTimeFormat('en', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(dateTime));
}

