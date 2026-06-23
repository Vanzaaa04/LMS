import Link from 'next/link';
import type { ReactNode } from 'react';
import type {
  GradingStatus,
  LecturerStudentProgressData,
  ProgressItemStatus,
  StudentAssignmentProgress,
  StudentMaterialProgress,
} from '@/lib/types/course';
import { LecturerBreadcrumbs } from './LecturerBreadcrumbs';

interface LecturerStudentProgressViewProps {
  data: LecturerStudentProgressData;
}

const MATERIAL_STATUS_STYLE: Record<ProgressItemStatus, { background: string; color: string }> = {
  Completed: { background: '#E7F6EE', color: '#187346' },
  'In Progress': { background: '#E7EEFF', color: 'var(--color-brand-primary)' },
  'Not Started': { background: '#F1F2F4', color: 'var(--color-text-secondary)' },
};

const ASSIGNMENT_STATUS_STYLE: Record<GradingStatus, { background: string; color: string }> = {
  Graded: { background: '#E7F6EE', color: '#187346' },
  Submitted: { background: '#FFF4DE', color: '#946200' },
  Missing: { background: '#FDECEC', color: '#B3261E' },
  Draft: { background: '#F1F2F4', color: 'var(--color-text-secondary)' },
};

export function LecturerStudentProgressView({ data }: LecturerStudentProgressViewProps) {
  const enrollmentHref = `/dosen/courses/${data.course.id}/enrollment`;

  return (
    <div className="mx-auto w-full max-w-[1180px] px-4 py-8 sm:px-6 lg:px-8">
      <LecturerBreadcrumbs
        items={[
          { label: 'Home', href: '/dashboard_dosen' },
          { label: 'Courses', href: '/dosen/courses' },
          { label: data.course.title, href: `/dosen/courses/${data.course.id}` },
          { label: 'Enrolled Students', href: enrollmentHref },
          { label: data.student.name },
        ]}
      />

      <HeaderSection data={data} enrollmentHref={enrollmentHref} />
      <SummaryGrid data={data} />

      <div className="space-y-6">
        <MaterialsSection materials={data.materials} />
        <AssignmentsSection assignments={data.assignments} />
        <EmptyAcademicSection title="Quizzes" message="Quiz progress is intentionally left empty for now." />
        <EmptyAcademicSection title="Labs" message="Lab progress is intentionally left empty for now." />
      </div>
    </div>
  );
}

function HeaderSection({
  data,
  enrollmentHref,
}: {
  data: LecturerStudentProgressData;
  enrollmentHref: string;
}) {
  return (
    <section className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
      <div className="min-w-0">
        <p
          className="mb-2 text-sm font-semibold uppercase tracking-[0.08em]"
          style={{ color: 'var(--color-brand-primary)' }}
        >
          Student Progress
        </p>
        <h1
          className="text-[34px] font-bold leading-tight sm:text-[44px]"
          style={{ color: 'var(--color-text-primary)' }}
        >
          {data.student.name}
        </h1>
        <p className="mt-3 text-lg" style={{ color: 'var(--color-text-secondary)' }}>
          {data.student.email} - {data.course.code} - {data.termLabel}
        </p>
      </div>

      <Link
        href={enrollmentHref}
        className="inline-flex h-12 min-w-[190px] items-center justify-center whitespace-nowrap rounded-[14px] border px-5 text-base font-semibold no-underline transition-colors hover:bg-[#F5F8FF]"
        style={{
          borderColor: 'var(--color-brand-primary)',
          color: 'var(--color-brand-primary)',
        }}
      >
        Back to Enrollment
      </Link>
    </section>
  );
}

function SummaryGrid({ data }: { data: LecturerStudentProgressData }) {
  return (
    <section className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
      <SummaryCard
        label="Material Progress"
        value={`${data.summary.materialProgressPercentage}%`}
        helper={`${data.summary.completedMaterials}/${data.summary.totalMaterials} materials completed`}
      />
      <SummaryCard
        label="Assignments"
        value={`${data.summary.gradedAssignments}/${data.summary.totalAssignments}`}
        helper="Graded assignments"
      />
      <SummaryCard
        label="Average Score"
        value={data.summary.averageAssignmentScore === null ? '-' : `${data.summary.averageAssignmentScore}`}
        helper="Assignment score average"
      />
      <SummaryCard
        label="Date Joined"
        value={formatDisplayDate(data.student.dateJoined)}
        helper="Student enrollment date"
      />
    </section>
  );
}

function formatDisplayDate(dateValue: string) {
  if (!dateValue || dateValue === '-') {
    return '-';
  }

  const parsedDate = new Date(dateValue);
  if (Number.isNaN(parsedDate.getTime())) {
    return dateValue;
  }

  return new Intl.DateTimeFormat('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(parsedDate);
}

function SummaryCard({
  label,
  value,
  helper,
}: {
  label: string;
  value: string;
  helper: string;
}) {
  return (
    <article
      className="rounded-[22px] border bg-white px-5 py-5 shadow-[0_10px_22px_rgba(15,33,74,0.04)]"
      style={{ borderColor: 'var(--color-border)' }}
    >
      <p className="text-sm font-semibold" style={{ color: 'var(--color-text-secondary)' }}>
        {label}
      </p>
      <strong className="mt-3 block text-[30px] leading-none" style={{ color: 'var(--color-text-primary)' }}>
        {value}
      </strong>
      <p className="mt-3 text-sm" style={{ color: 'var(--color-text-muted)' }}>
        {helper}
      </p>
    </article>
  );
}

function MaterialsSection({ materials }: { materials: StudentMaterialProgress[] }) {
  return (
    <ProgressSection title="Materials">
      {materials.length > 0 ? (
        <div className="space-y-3">
          {materials.map((material) => (
            <MaterialProgressRow key={material.id} material={material} />
          ))}
        </div>
      ) : (
        <SectionEmptyState message="No material progress available yet." />
      )}
    </ProgressSection>
  );
}

function MaterialProgressRow({ material }: { material: StudentMaterialProgress }) {
  return (
    <div
      className="grid grid-cols-1 gap-3 rounded-[16px] border px-4 py-4 md:grid-cols-[90px_minmax(0,1fr)_150px_140px] md:items-center"
      style={{ borderColor: 'var(--color-border)' }}
    >
      <span className="text-sm font-bold" style={{ color: 'var(--color-brand-primary)' }}>
        {material.moduleLabel}
      </span>
      <div className="min-w-0">
        <p className="truncate text-base font-semibold" style={{ color: 'var(--color-text-primary)' }}>
          {material.title}
        </p>
        <p className="mt-1 text-sm capitalize" style={{ color: 'var(--color-text-secondary)' }}>
          {material.type}
        </p>
      </div>
      <StatusPill status={material.status} styleMap={MATERIAL_STATUS_STYLE} />
      <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
        {material.completedAt ?? '-'}
      </p>
    </div>
  );
}

function AssignmentsSection({ assignments }: { assignments: StudentAssignmentProgress[] }) {
  return (
    <ProgressSection title="Assignments">
      {assignments.length > 0 ? (
        <div className="space-y-3">
          {assignments.map((assignment) => (
            <AssignmentProgressRow key={assignment.id} assignment={assignment} />
          ))}
        </div>
      ) : (
        <SectionEmptyState message="No assignment progress available yet." />
      )}
    </ProgressSection>
  );
}

function AssignmentProgressRow({ assignment }: { assignment: StudentAssignmentProgress }) {
  return (
    <div
      className="grid grid-cols-1 gap-3 rounded-[16px] border px-4 py-4 md:grid-cols-[90px_minmax(0,1fr)_150px_110px_140px] md:items-center"
      style={{ borderColor: 'var(--color-border)' }}
    >
      <span className="text-sm font-bold" style={{ color: 'var(--color-brand-primary)' }}>
        {assignment.moduleLabel}
      </span>
      <p className="min-w-0 truncate text-base font-semibold" style={{ color: 'var(--color-text-primary)' }}>
        {assignment.title}
      </p>
      <StatusPill status={assignment.status} styleMap={ASSIGNMENT_STATUS_STYLE} />
      <p className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>
        {assignment.score === undefined ? '-' : `${assignment.score}/${assignment.maxScore}`}
      </p>
      <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
        {assignment.submittedAt ?? '-'}
      </p>
    </div>
  );
}

function EmptyAcademicSection({ title, message }: { title: string; message: string }) {
  return (
    <ProgressSection title={title}>
      <SectionEmptyState message={message} />
    </ProgressSection>
  );
}

function ProgressSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section
      className="rounded-[24px] border bg-white px-5 py-5 shadow-[0_12px_28px_rgba(15,33,74,0.04)] sm:px-6"
      style={{ borderColor: 'var(--color-border)' }}
    >
      <h2 className="mb-5 text-[24px] font-bold" style={{ color: 'var(--color-text-primary)' }}>
        {title}
      </h2>
      {children}
    </section>
  );
}

function SectionEmptyState({ message }: { message: string }) {
  return (
    <div
      className="rounded-[16px] border border-dashed px-4 py-5 text-base"
      style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-secondary)' }}
    >
      {message}
    </div>
  );
}

function StatusPill<Status extends string>({
  status,
  styleMap,
}: {
  status: Status;
  styleMap: Record<Status, { background: string; color: string }>;
}) {
  return (
    <span
      className="inline-flex w-fit rounded-full px-3 py-1 text-sm font-semibold"
      style={styleMap[status]}
    >
      {status}
    </span>
  );
}

