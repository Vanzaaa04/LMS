import Link from 'next/link';
import type { ReactNode } from 'react';
import type {
  LecturerAssignmentStatus,
  LecturerCourseModule,
  LecturerModuleAssessment,
} from '@/lib/types/course';
import type { LecturerCourse } from '@/lib/types/course';
import { LecturerBreadcrumbs } from './LecturerBreadcrumbs';

interface AssignmentListItem {
  assignment: LecturerModuleAssessment;
  module: LecturerCourseModule;
}

interface LecturerAssignmentsListViewProps {
  course: LecturerCourse;
  assignments: AssignmentListItem[];
}

const STATUS_STYLE: Record<LecturerAssignmentStatus, { background: string; color: string }> = {
  Active: { background: '#E7EEFF', color: 'var(--color-brand-primary)' },
  Draft: { background: '#F1F2F4', color: 'var(--color-text-secondary)' },
  Scheduled: { background: '#FFF3D6', color: '#9A5B00' },
};

export function LecturerAssignmentsListView({
  course,
  assignments,
}: LecturerAssignmentsListViewProps) {
  return (
    <div className="mx-auto w-full max-w-[1120px] px-4 py-8 sm:px-6 lg:px-8">
      <LecturerBreadcrumbs
        items={[
          { label: 'Home', href: '/dashboard_dosen' },
          { label: 'Courses', href: '/dosen/courses' },
          { label: course.title, href: `/dosen/courses/${course.id}` },
          { label: 'All Assignments' },
        ]}
      />

      <section className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1
            className="text-[34px] font-bold leading-tight sm:text-[44px]"
            style={{ color: 'var(--color-text-primary)' }}
          >
            All Assignments
          </h1>
          <p className="mt-3 text-lg" style={{ color: 'var(--color-text-secondary)' }}>
            Review every assignment across all modules in this course.
          </p>
        </div>
        <Link
          href={`/dosen/courses/${course.id}`}
          className="inline-flex h-12 items-center justify-center rounded-[14px] border px-5 text-base font-semibold no-underline transition-colors hover:bg-[#F5F8FF]"
          style={{
            borderColor: 'var(--color-brand-primary)',
            color: 'var(--color-brand-primary)',
          }}
        >
          Back to Course
        </Link>
      </section>

      {assignments.length > 0 ? (
        <section className="space-y-4">
          {assignments.map(({ assignment, module }) => (
            <AssignmentListCard
              key={assignment.id}
              courseId={course.id}
              module={module}
              assignment={assignment}
            />
          ))}
        </section>
      ) : (
        <EmptyAssignmentsState courseId={course.id} />
      )}
    </div>
  );
}

function EmptyAssignmentsState({ courseId }: { courseId: string }) {
  return (
    <section
      className="rounded-[24px] border bg-white px-6 py-16 text-center shadow-[0_14px_32px_rgba(15,33,74,0.04)]"
      style={{ borderColor: 'var(--color-border)' }}
    >
      <div
        className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-[20px]"
        style={{ background: '#EEF4FF', color: 'var(--color-brand-primary)' }}
      >
        <ClipboardIcon />
      </div>
      <h2 className="text-2xl font-bold" style={{ color: 'var(--color-text-primary)' }}>
        No assignments yet
      </h2>
      <p
        className="mx-auto mt-3 max-w-[520px] text-base leading-7"
        style={{ color: 'var(--color-text-secondary)' }}
      >
        This course does not have any assignments yet. Go back to the course module list and create an assignment from the module you want to use.
      </p>
      <Link
        href={`/dosen/courses/${courseId}`}
        className="mt-7 inline-flex h-12 items-center justify-center rounded-[14px] px-5 text-base font-semibold text-white no-underline transition-opacity hover:opacity-90"
        style={{ background: 'var(--color-brand-primary)' }}
      >
        Back to Course Modules
      </Link>
    </section>
  );
}

function AssignmentListCard({
  courseId,
  module,
  assignment,
}: {
  courseId: string;
  module: LecturerCourseModule;
  assignment: LecturerModuleAssessment;
}) {
  const status = assignment.status ?? 'Draft';

  return (
    <article
      className="grid grid-cols-1 gap-4 rounded-[20px] border bg-white px-5 py-5 shadow-[0_12px_28px_rgba(15,33,74,0.04)] lg:grid-cols-[minmax(0,1fr)_220px_auto]"
      style={{ borderColor: 'var(--color-border)' }}
    >
      <div className="min-w-0">
        <p className="text-sm font-semibold" style={{ color: 'var(--color-brand-primary)' }}>
          {module.orderLabel} - {module.title}
        </p>
        <h2
          className="mt-2 text-[22px] font-bold leading-tight"
          style={{ color: 'var(--color-text-primary)' }}
        >
          {assignment.title}
        </h2>
        <p className="mt-2 line-clamp-2 text-base" style={{ color: 'var(--color-text-secondary)' }}>
          {assignment.description ?? assignment.meta}
        </p>
      </div>

      <div className="space-y-2 text-base" style={{ color: 'var(--color-text-secondary)' }}>
        <p>{formatSubmissionText(assignment)}</p>
        <p>{assignment.deadline ? `Due ${formatDateLabel(assignment.deadline)}` : 'No deadline'}</p>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 lg:flex-col lg:items-end">
        <StatusPill status={status} />
        <div className="flex flex-wrap items-center gap-2 lg:justify-end">
          <AssignmentActionLink
            href={`/dosen/courses/${courseId}/modules/${module.id}/assignments/${assignment.id}/submissions`}
            primary
          >
            Submissions
          </AssignmentActionLink>
          <AssignmentActionLink
            href={`/dosen/courses/${courseId}/modules/${module.id}/assignments/${assignment.id}/edit`}
          >
            Edit
          </AssignmentActionLink>
        </div>
      </div>
    </article>
  );
}

function AssignmentActionLink({
  children,
  href,
  primary = false,
}: {
  children: ReactNode;
  href: string;
  primary?: boolean;
}) {
  return (
    <Link
      href={href}
      className="inline-flex h-11 items-center justify-center rounded-[12px] border px-4 text-base font-semibold no-underline transition-colors hover:bg-[#F5F8FF]"
      style={{
        background: primary ? 'var(--color-brand-primary)' : '#FFFFFF',
        borderColor: 'var(--color-brand-primary)',
        color: primary ? '#FFFFFF' : 'var(--color-brand-primary)',
      }}
    >
      {children}
    </Link>
  );
}

function StatusPill({ status }: { status: LecturerAssignmentStatus }) {
  return (
    <span
      className="rounded-full px-3 py-1 text-sm font-semibold"
      style={STATUS_STYLE[status]}
    >
      {status}
    </span>
  );
}

function formatSubmissionText(assignment: LecturerModuleAssessment) {
  if (assignment.status === 'Draft') {
    return 'Draft assignment';
  }

  return `${assignment.submittedCount ?? 0}/${assignment.studentCount ?? 0} submitted`;
}

function formatDateLabel(dateTime: string) {
  const [date] = dateTime.split('T');
  return date;
}

function ClipboardIcon() {
  return (
    <svg width="30" height="30" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M9 5h6M9 11h6M9 15h4M8.5 3.5h7l1 2h1.5A2.5 2.5 0 0 1 20.5 8v10A2.5 2.5 0 0 1 18 20.5H6A2.5 2.5 0 0 1 3.5 18V8A2.5 2.5 0 0 1 6 5.5h1.5l1-2Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

