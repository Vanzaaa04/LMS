'use client';

import Link from 'next/link';
import React from 'react';
import { LecturerBreadcrumbs } from './LecturerBreadcrumbs';
import type {
  LecturerEnrollmentData,
  LecturerEnrollmentStudent,
} from '@/lib/types/course';

import { enrollStudentAction } from '@/app/actions/enrollStudent';
import { removeStudentAction } from '@/app/actions/removeStudent';

interface LecturerManageEnrollmentViewProps {
  data: LecturerEnrollmentData;
}

const PAGE_SIZE_OPTIONS = ['10', '20', '50'] as const;

export function LecturerManageEnrollmentView({
  data,
}: LecturerManageEnrollmentViewProps) {
  const [searchQuery, setSearchQuery] = React.useState('');
  const [pageSize, setPageSize] = React.useState<number>(10);
  const [currentPage, setCurrentPage] = React.useState(1);
  const [isEnrollModalOpen, setEnrollModalOpen] = React.useState(false);

  const filteredStudents = React.useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();

    if (!normalizedQuery) {
      return data.students;
    }

    return data.students.filter((student) =>
      [student.name, student.email].some((value) =>
        value.toLowerCase().includes(normalizedQuery)
      )
    );
  }, [data.students, searchQuery]);

  const totalPages = Math.max(1, Math.ceil(filteredStudents.length / pageSize));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const paginatedStudents = filteredStudents.slice(
    (safeCurrentPage - 1) * pageSize,
    safeCurrentPage * pageSize
  );

  return (
    <div className="mx-auto w-full max-w-[1320px] px-4 py-8 sm:px-6 lg:px-8">
      <LecturerBreadcrumbs
        items={[
          { label: 'Home', href: '/dashboard_dosen' },
          { label: 'Courses', href: '/dosen/courses' },
          { label: data.courseTitle, href: `/dosen/courses/${data.courseId}` },
          { label: 'Enrolled Students' },
        ]}
      />

      <section className="mb-8 flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
        <div className="min-w-0">
          <Link
            href={`/dosen/courses/${data.courseId}`}
            className="mb-5 inline-flex h-11 items-center justify-center gap-2 rounded-[14px] border px-4 text-sm font-semibold no-underline transition-colors hover:bg-[#F5F8FF]"
            style={{
              borderColor: 'var(--color-border)',
              color: 'var(--color-brand-primary)',
              background: '#FFFFFF',
            }}
          >
            <ChevronLeftIcon />
            Back to Manage Course
          </Link>

          <h1
            className="text-[34px] font-bold leading-tight sm:text-[44px]"
            style={{ color: 'var(--color-text-primary)' }}
          >
            Enrolled Students
          </h1>
          <p
            className="mt-3 text-lg sm:text-[20px]"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            {data.courseCode} - {data.termLabel}
          </p>
        </div>

        <div className="w-full max-w-[360px] flex flex-col items-end gap-3">
          <button
            onClick={() => setEnrollModalOpen(true)}
            className="inline-flex h-11 items-center justify-center rounded-[14px] px-6 text-sm font-semibold text-white transition-colors hover:bg-opacity-90"
            style={{ background: 'var(--color-brand-primary)' }}
          >
            Enroll Student
          </button>
          <div className="w-full">
            <SearchInput
              value={searchQuery}
              onChange={(value) => {
                setSearchQuery(value);
                setCurrentPage(1);
              }}
            />
          </div>
        </div>
      </section>

      {isEnrollModalOpen && (
        <EnrollModal
          courseId={data.courseId}
          onClose={() => setEnrollModalOpen(false)}
        />
      )}

      <section className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
        <SummaryCard
          label="Total Students"
          value={String(data.students.length)}
          helper="Currently enrolled in this course"
        />
        <SummaryCard
          label="Average Progress"
          value={`${Math.round(getAverageProgress(data.students))}%`}
          helper="Based on recorded student activity"
        />
        <SummaryCard
          label="On Track"
          value={String(getOnTrackStudentCount(data.students))}
          helper="Students with progress at 75% or higher"
        />
      </section>

      <section
        className="overflow-hidden rounded-[28px] border bg-white shadow-[0_12px_28px_rgba(15,33,74,0.04)]"
        style={{ borderColor: 'var(--color-border)' }}
      >
        <div className="hidden grid-cols-[2.2fr_2.3fr_1.4fr_1.3fr] gap-6 border-b px-8 py-6 text-[15px] font-bold uppercase tracking-[0.05em] lg:grid" style={{ borderColor: 'rgba(195,198,214,0.8)', color: 'var(--color-text-secondary)' }}>
          <span>Student Name</span>
          <span>Email Address</span>
          <span>Date Joined</span>
          <span className="text-right">Actions</span>
        </div>

        <div className="divide-y" style={{ borderColor: 'rgba(195,198,214,0.75)' }}>
          {paginatedStudents.length > 0 ? (
            paginatedStudents.map((student) => (
              <EnrollmentRow key={student.id} courseId={data.courseId} student={student} />
            ))
          ) : (
            <EmptyEnrollmentState />
          )}
        </div>

        <div className="flex flex-col gap-4 border-t px-5 py-5 sm:px-8 lg:flex-row lg:items-center lg:justify-between" style={{ borderColor: 'rgba(195,198,214,0.8)' }}>
          <div className="flex items-center gap-3 text-base" style={{ color: 'var(--color-text-secondary)' }}>
            <span>Show entries:</span>
            <div className="w-[88px]">
              <SelectInput
                value={String(pageSize)}
                onChange={(value) => {
                  setPageSize(Number(value));
                  setCurrentPage(1);
                }}
                options={PAGE_SIZE_OPTIONS}
              />
            </div>
          </div>

          <div className="flex items-center justify-between gap-4 lg:justify-end">
            <span className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
              {buildPaginationSummary(filteredStudents.length, safeCurrentPage, pageSize)}
            </span>

            <div className="flex items-center gap-2">
              <PaginationButton
                label="Previous page"
                disabled={safeCurrentPage === 1}
                onClick={() => setCurrentPage(Math.max(1, safeCurrentPage - 1))}
              >
                <ChevronLeftIcon />
              </PaginationButton>
              <PaginationButton
                label="Next page"
                disabled={safeCurrentPage === totalPages}
                onClick={() => setCurrentPage(Math.min(totalPages, safeCurrentPage + 1))}
              >
                <ChevronRightIcon />
              </PaginationButton>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
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
      className="flex h-full flex-col rounded-[24px] border bg-white px-5 py-5 shadow-[0_10px_22px_rgba(15,33,74,0.04)]"
      style={{ borderColor: 'var(--color-border)' }}
    >
      <p className="text-sm font-semibold" style={{ color: 'var(--color-text-secondary)' }}>
        {label}
      </p>
      <strong className="mt-3 block text-[34px] leading-none" style={{ color: 'var(--color-text-primary)' }}>
        {value}
      </strong>
      <p className="mt-3 text-sm" style={{ color: 'var(--color-text-muted)' }}>
        {helper}
      </p>
    </article>
  );
}

function SearchInput({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="relative">
      <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2" style={{ color: 'var(--color-text-secondary)' }}>
        <SearchIcon />
      </span>
      <input
        type="text"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Find student..."
        className="h-12 w-full rounded-[18px] border pl-12 pr-4 text-base outline-none transition-colors focus:border-[#7DA8FF]"
        style={{ borderColor: 'var(--color-border)', background: '#FFFFFF', color: 'var(--color-text-primary)' }}
      />
    </div>
  );
}

function EnrollModal({
  courseId,
  onClose,
}: {
  courseId: string;
  onClose: () => void;
}) {
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const [isSubmitting, startTransition] = React.useTransition();

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    startTransition(async () => {
      try {
        await enrollStudentAction(courseId, formData);
        onClose();
      } catch (error) {
        console.error('Failed to enroll student:', error);
        setErrorMessage(
          error instanceof Error
            ? error.message
            : 'Failed to enroll student. Please check the email and try again.'
        );
      }
    });
  }

  return (
    <>
      <button
        type="button"
        aria-label="Close enrollment modal"
        className="fixed inset-0 z-50 bg-black/35"
        onClick={onClose}
      />

      <div className="fixed left-1/2 top-1/2 z-50 w-[calc(100%-32px)] max-w-[460px] -translate-x-1/2 -translate-y-1/2 rounded-[24px] border bg-white p-6 shadow-2xl">
        <div className="mb-5">
          <h2 className="text-2xl font-bold" style={{ color: 'var(--color-text-primary)' }}>
            Enroll Student
          </h2>
          <p className="mt-2 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
            Add a student to this course using the email of an existing student account.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="block">
            <span className="mb-2 block text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>
              Email Address
            </span>
            <input
              name="email"
              type="email"
              required
              placeholder="student@university.edu"
              className="h-12 w-full rounded-[14px] border px-4 text-base outline-none focus:border-[#7DA8FF]"
              style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-primary)' }}
            />
          </label>

          {errorMessage ? (
            <p className="text-sm font-medium text-red-600">{errorMessage}</p>
          ) : null}

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="h-11 rounded-[14px] border px-5 text-sm font-semibold transition-colors hover:bg-gray-50 disabled:opacity-60"
              style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-secondary)' }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="h-11 rounded-[14px] px-5 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
              style={{ background: 'var(--color-brand-primary)' }}
            >
              {isSubmitting ? 'Enrolling...' : 'Enroll Student'}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}

function EnrollmentRow({
  courseId,
  student,
}: {
  courseId: string;
  student: LecturerEnrollmentStudent;
}) {
  const initials = getInitials(student.name);
  const progressHref = `/dosen/courses/${courseId}/enrollment/${student.id}/progress`;
  const [isRemoving, startTransition] = React.useTransition();

  const handleRemove = () => {
    if (window.confirm(`Are you sure you want to remove ${student.name} from this course?`)) {
      startTransition(() => {
        removeStudentAction(courseId, student.id).catch((error) => console.error('Failed to remove:', error));
      });
    }
  };

  return (
    <article className="px-5 py-5 sm:px-8">
      <div className="hidden grid-cols-[2.2fr_2.3fr_1.4fr_1.3fr] items-center gap-6 lg:grid">
        <div className="flex min-w-0 items-center gap-4">
          <Avatar initials={initials} />
          <p className="truncate text-[18px] font-semibold" style={{ color: 'var(--color-text-primary)' }}>
            {student.name}
          </p>
        </div>

        <p className="truncate text-base" style={{ color: 'var(--color-text-secondary)' }}>
          {student.email}
        </p>
        <p className="text-base" style={{ color: 'var(--color-text-secondary)' }}>
          {formatDisplayDate(student.dateJoined)}
        </p>
        <div className="flex justify-end gap-2">
          <RowActionLink href={progressHref}>View Progress</RowActionLink>
          <button
            onClick={handleRemove}
            disabled={isRemoving}
            className="inline-flex h-10 items-center justify-center rounded-[12px] border px-4 text-sm font-semibold transition-colors hover:bg-red-50 disabled:opacity-50"
            style={{ borderColor: '#E53935', color: '#E53935' }}
          >
            {isRemoving ? 'Removing...' : 'Remove'}
          </button>
        </div>
      </div>

      <div className="space-y-4 lg:hidden">
        <div className="flex items-start gap-4">
          <Avatar initials={initials} />
          <div className="min-w-0 flex-1">
            <p className="text-[18px] font-semibold" style={{ color: 'var(--color-text-primary)' }}>
              {student.name}
            </p>
            <p className="mt-1 break-all text-sm" style={{ color: 'var(--color-text-secondary)' }}>
              {student.email}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
          <span>Joined {formatDisplayDate(student.dateJoined)}</span>
        </div>

        <div className="flex gap-2">
          <RowActionLink href={progressHref}>View Progress</RowActionLink>
          <button
            onClick={handleRemove}
            disabled={isRemoving}
            className="inline-flex h-10 items-center justify-center rounded-[12px] border px-4 text-sm font-semibold transition-colors hover:bg-red-50 disabled:opacity-50"
            style={{ borderColor: '#E53935', color: '#E53935' }}
          >
            {isRemoving ? 'Removing...' : 'Remove'}
          </button>
        </div>
      </div>
    </article>
  );
}

function Avatar({ initials }: { initials: string }) {
  const palette = getAvatarPalette(initials);

  return (
    <div
      className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-[20px] font-bold"
      style={{ background: palette.background, color: palette.color }}
    >
      {initials}
    </div>
  );
}

function RowActionLink({ children, href }: { children: React.ReactNode; href: string }) {
  return (
    <Link
      href={href}
      className="inline-flex h-10 items-center justify-center rounded-[12px] border px-4 text-sm font-semibold transition-colors hover:bg-[#F5F8FF]"
      style={{ borderColor: 'var(--color-brand-primary)', color: 'var(--color-brand-primary)' }}
    >
      {children}
    </Link>
  );
}

function EmptyEnrollmentState() {
  return (
    <div className="px-6 py-16 text-center">
      <h2 className="text-xl font-semibold" style={{ color: 'var(--color-text-primary)' }}>
        No students found
      </h2>
      <p className="mt-2 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
        Try another search keyword or adjust the current page size.
      </p>
    </div>
  );
}

function SelectInput({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (value: string) => void;
  options: readonly string[];
}) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-11 w-full appearance-none rounded-[14px] border px-4 pr-10 text-base outline-none transition-colors focus:border-[#7DA8FF]"
        style={{ borderColor: 'var(--color-border)', background: '#FFFFFF', color: 'var(--color-text-primary)' }}
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
      <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--color-text-secondary)' }}>
        <SelectChevronIcon />
      </span>
    </div>
  );
}

function PaginationButton({
  children,
  disabled,
  label,
  onClick,
}: {
  children: React.ReactNode;
  disabled: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className="inline-flex h-10 w-10 items-center justify-center rounded-[12px] border transition-opacity disabled:cursor-not-allowed disabled:opacity-45"
      style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-secondary)' }}
    >
      {children}
    </button>
  );
}

function buildPaginationSummary(totalCount: number, currentPage: number, pageSize: number) {
  if (totalCount === 0) {
    return 'Showing 0 students';
  }

  const start = (currentPage - 1) * pageSize + 1;
  const end = Math.min(totalCount, currentPage * pageSize);

  return `Showing ${start}-${end} of ${totalCount}`;
}

function getAverageProgress(students: LecturerEnrollmentStudent[]) {
  if (students.length === 0) {
    return 0;
  }

  const totalProgress = students.reduce(
    (progressSum, student) => progressSum + student.progressPercentage,
    0
  );

  return totalProgress / students.length;
}

function getOnTrackStudentCount(students: LecturerEnrollmentStudent[]) {
  return students.filter((student) => student.progressPercentage >= 75).length;
}

function getInitials(name: string) {
  return name
    .split(' ')
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');
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

function getAvatarPalette(initials: string) {
  const palettes = [
    { background: '#DCE8FF', color: '#4A5E8A' },
    { background: '#C45414', color: '#FFFFFF' },
    { background: '#2F66D8', color: '#FFFFFF' },
    { background: '#DDE7FF', color: '#4B5E89' },
    { background: '#184B9C', color: '#FFFFFF' },
  ];

  const paletteIndex = initials
    .split('')
    .reduce((sum, character) => sum + character.charCodeAt(0), 0) % palettes.length;

  return palettes[paletteIndex];
}

function SearchIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
      <circle cx="8" cy="8" r="5.75" stroke="currentColor" strokeWidth="1.8" />
      <path d="m12.5 12.5 3 3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function ChevronLeftIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
      <path d="M10.5 4.5 6 9l4.5 4.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ChevronRightIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
      <path d="M7.5 4.5 12 9l-4.5 4.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function SelectChevronIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <path
        d="M3.5 5.5 7 9l3.5-3.5"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
