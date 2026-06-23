'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import type { CourseContentItem, CourseDetail } from '@/lib/types/course';
import { uploadFileApi, submitAssignmentApi } from '@/lib/api/courseApi';
import {
  buildAssignmentHref,
  buildCourseDetailHref,
  COURSE_CATALOG_HREF,
  getCourseBreadcrumbParent,
  getCourseSource,
} from '@/lib/courseNavigation';

interface AssignmentSubmissionViewProps {
  course: CourseDetail;
  assignment: CourseContentItem;
  previousAssignment?: CourseContentItem;
  nextAssignment?: CourseContentItem;
}

interface AssignmentActionBarProps {
  previousHref?: string;
  nextHref?: string;
  onSubmit?: () => void;
  submitting?: boolean;
}

interface AssignmentNavButtonProps {
  href?: string;
  label: string;
  direction: 'previous' | 'next';
  primary?: boolean;
}

interface StatusRowProps {
  icon: React.ReactNode;
  label: string;
  primaryText: string;
  secondaryText?: string;
  secondaryTone?: string;
  badge?: boolean;
}

const ASSIGNMENT_REQUIREMENTS = [
  'Implement the forward pass and activation function (Step or Sigmoid).',
  'Implement the training loop using the perceptron learning rule.',
  'Test your implementation on a simple linearly separable dataset (e.g., AND or OR gate logic).',
  'Provide a short report (PDF) explaining your code structure and demonstrating the output.',
];

export function AssignmentSubmissionView({
  course,
  assignment,
  previousAssignment,
  nextAssignment,
}: AssignmentSubmissionViewProps) {
  const searchParams = useSearchParams();
  const source = getCourseSource(searchParams.get('from'));
  const courseDetailHref = buildCourseDetailHref(course.id, source);
  const parentBreadcrumb = getCourseBreadcrumbParent(source);
  const previousHref = previousAssignment
    ? buildAssignmentHref(course.id, previousAssignment.id, source)
    : undefined;
  const nextHref = nextAssignment
    ? buildAssignmentHref(course.id, nextAssignment.id, source)
    : undefined;

  const token = typeof window !== 'undefined' ? sessionStorage.getItem('token') : null;

  // Form states
  const [file, setFile] = useState<File | null>(null);
  const [textResponse, setTextResponse] = useState('');
  const [linkResponse, setLinkResponse] = useState('');
  const [studentNote, setStudentNote] = useState('');
  
  // Status states
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const requirement = assignment.submissionRequirement || 'File Upload (PDF, DOCX, ZIP)';

  const handleSubmit = async () => {
    if (!token) {
      setError('Sesi berakhir, silakan login kembali.');
      return;
    }

    const isText = requirement.includes('Text');
    const isLink = requirement.includes('Link') || requirement.includes('External');

    try {
      setSubmitting(true);
      setError(null);
      setSuccess(null);

      let fileUrl = '';

      if (isText) {
        if (!textResponse.trim()) {
          setError('Harap ketik jawaban teks Anda.');
          setSubmitting(false);
          return;
        }
        fileUrl = 'text-submission'; // Dummy indicator for text submission
      } else if (isLink) {
        if (!linkResponse.trim()) {
          setError('Harap masukkan tautan / link jawaban Anda.');
          setSubmitting(false);
          return;
        }
        fileUrl = linkResponse;
      } else {
        // File Upload
        if (!file) {
          setError('Harap pilih file tugas terlebih dahulu.');
          setSubmitting(false);
          return;
        }
        const uploadResult = await uploadFileApi(file, token);
        fileUrl = uploadResult.url;
      }

      // Submit assignment
      // Note is passed as studentNote. If it is Text submission, we prepend the text content to the note
      const finalNote = isText 
        ? `[Teks Jawaban]: ${textResponse}\n\n[Catatan]: ${studentNote}`.trim()
        : studentNote;

      await submitAssignmentApi(assignment.id, { fileUrl, note: finalNote }, token);

      setSuccess('Tugas berhasil dikumpulkan!');
      setIsSubmitted(true);
      setFile(null);
      setTextResponse('');
      setLinkResponse('');
      setStudentNote('');
    } catch (err: any) {
      console.error('Submit error:', err);
      setError(err.message || 'Terjadi kesalahan saat mengumpulkan tugas.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-full flex-col">
      <div className="mx-auto w-full max-w-[1280px] flex-1 px-4 py-8 sm:px-6 lg:px-8">
        <AssignmentBreadcrumbs
          course={course}
          courseDetailHref={courseDetailHref}
          parentLabel={parentBreadcrumb.label}
          parentHref={parentBreadcrumb.href}
          showParent={source === 'my-courses'}
        />

        {error && (
          <div className="mb-6 rounded-xl bg-red-50 p-4 text-sm font-semibold text-red-800 border border-red-200">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-6 rounded-xl bg-green-50 p-4 text-sm font-semibold text-green-800 border border-green-200">
            {success}
          </div>
        )}

        <div className="grid gap-7 xl:grid-cols-[minmax(0,1fr)_360px]">
          <main className="space-y-7">
            <AssignmentHero assignment={assignment} />
            <AssignmentBrief assignment={assignment} />
            <SubmissionBox
              requirement={requirement}
              file={file}
              setFile={setFile}
              textResponse={textResponse}
              setTextResponse={setTextResponse}
              linkResponse={linkResponse}
              setLinkResponse={setLinkResponse}
              studentNote={studentNote}
              setStudentNote={setStudentNote}
              isSubmitted={isSubmitted}
              submitting={submitting}
            />
          </main>

          <AssignmentStatusCard assignment={assignment} isSubmitted={isSubmitted} />
        </div>
      </div>

      <AssignmentActionBar 
        previousHref={previousHref} 
        nextHref={nextHref} 
        onSubmit={handleSubmit} 
        submitting={submitting || isSubmitted}
      />
    </div>
  );
}

function AssignmentBreadcrumbs({
  course,
  courseDetailHref,
  parentLabel,
  parentHref,
  showParent,
}: {
  course: CourseDetail;
  courseDetailHref: string;
  parentLabel: string;
  parentHref: string;
  showParent: boolean;
}) {
  return (
    <nav className="mb-7 flex flex-wrap items-center gap-2 text-sm sm:text-base" style={{ color: 'var(--color-text-secondary)' }}>
      <Link href="/dashboard_mahasiswa" className="transition-opacity hover:opacity-70">
        Home
      </Link>
      <span>&rsaquo;</span>
      <Link href={COURSE_CATALOG_HREF} className="transition-opacity hover:opacity-70">
        Courses
      </Link>
      {showParent ? (
        <>
          <span>&rsaquo;</span>
          <Link href={parentHref} className="transition-opacity hover:opacity-70">
            {parentLabel}
          </Link>
        </>
      ) : null}
      <span>&rsaquo;</span>
      <Link href={courseDetailHref} className="transition-opacity hover:opacity-70">
        {course.breadcrumbLabel ?? course.title}
      </Link>
      <span>&rsaquo;</span>
      <span>Tugas</span>
      <span>&rsaquo;</span>
      <span className="font-semibold" style={{ color: 'var(--color-text-primary)' }}>
        Pengumpulan
      </span>
    </nav>
  );
}

function AssignmentHero({ assignment }: { assignment: CourseContentItem }) {
  return (
    <AssignmentSection>
      <h1 className="text-xl font-bold leading-tight sm:text-2xl" style={{ color: 'var(--color-text-primary)' }}>
        {assignment.title}
      </h1>
      <p className="mt-3 text-base leading-7 sm:text-lg" style={{ color: 'var(--color-text-secondary)' }}>
        Kerjakan tugas ini sesuai dengan petunjuk yang diberikan di bawah.
      </p>
    </AssignmentSection>
  );
}

function AssignmentBrief({ assignment }: { assignment: CourseContentItem }) {
  const briefContent = assignment.summary || 'Follow the instructions provided to complete this assignment.';
  const requirements = assignment.content?.previewText 
    ? assignment.content.previewText.split('\n').filter(Boolean)
    : ASSIGNMENT_REQUIREMENTS;

  return (
    <AssignmentSection>
      <h2 className="text-lg font-bold" style={{ color: 'var(--color-text-primary)' }}>
        Assignment Brief
      </h2>
      <p className="mt-5 text-base leading-8 sm:text-lg" style={{ color: 'var(--color-text-secondary)' }}>
        {briefContent}
      </p>
      <ul className="mt-5 space-y-3 pl-6 text-base leading-7 sm:text-lg" style={{ color: 'var(--color-text-secondary)' }}>
        {requirements.map((requirement, idx) => (
          <li key={idx}>{requirement.replace(/^- /, '')}</li>
        ))}
      </ul>
    </AssignmentSection>
  );
}

function SubmissionBox({
  requirement,
  file,
  setFile,
  textResponse,
  setTextResponse,
  linkResponse,
  setLinkResponse,
  studentNote,
  setStudentNote,
  isSubmitted,
  submitting,
}: {
  requirement: string;
  file: File | null;
  setFile: (file: File | null) => void;
  textResponse: string;
  setTextResponse: (val: string) => void;
  linkResponse: string;
  setLinkResponse: (val: string) => void;
  studentNote: string;
  setStudentNote: (val: string) => void;
  isSubmitted: boolean;
  submitting: boolean;
}) {
  const isText = requirement.includes('Text') || requirement === 'Text Entry';
  const isLink = requirement.includes('Link') || requirement.includes('External');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  if (isSubmitted) {
    return (
      <AssignmentSection>
        <h2 className="text-lg font-bold" style={{ color: 'var(--color-text-primary)' }}>
          Submission Box
        </h2>
        <div className="mt-5 rounded-2xl border border-green-200 bg-green-50 p-6 text-center text-green-800">
          <p className="font-semibold text-lg">✓ Jawaban Anda Telah Dikumpulkan</p>
          <p className="text-sm mt-1">Tugas ini siap dinilai oleh Dosen/Admin.</p>
        </div>
      </AssignmentSection>
    );
  }

  return (
    <AssignmentSection>
      <h2 className="text-lg font-bold mb-4" style={{ color: 'var(--color-text-primary)' }}>
        Submission Box ({requirement})
      </h2>

      <div className="space-y-5">
        {isText ? (
          <div>
            <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--color-text-primary)' }}>
              Ketik Jawaban Anda:
            </label>
            <textarea
              className="w-full min-h-[160px] p-4 rounded-xl border focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
              style={{ borderColor: 'var(--color-border)' }}
              placeholder="Tuliskan jawaban lengkap Anda di sini..."
              value={textResponse}
              onChange={(e) => setTextResponse(e.target.value)}
              disabled={submitting}
            />
          </div>
        ) : isLink ? (
          <div>
            <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--color-text-primary)' }}>
              Masukkan Link Jawaban:
            </label>
            <input
              type="url"
              className="w-full p-3.5 rounded-xl border focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
              style={{ borderColor: 'var(--color-border)' }}
              placeholder="https://github.com/username/project atau tautan tugas Anda"
              value={linkResponse}
              onChange={(e) => setLinkResponse(e.target.value)}
              disabled={submitting}
            />
          </div>
        ) : (
          <div className="rounded-[24px] border-2 border-dashed px-5 py-10 text-center relative" style={{ borderColor: '#BFC7DA', background: '#FBFCFE' }}>
            <input 
              type="file" 
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
              onChange={handleFileChange}
              accept=".pdf,.py,.ipynb,.docx,.zip"
              disabled={submitting}
            />
            <UploadIcon />
            <h3 className="mt-4 text-base font-semibold" style={{ color: 'var(--color-text-primary)' }}>
              {file ? file.name : 'Drag and drop your files here'}
            </h3>
            <p className="mt-3 text-xs sm:text-sm" style={{ color: 'var(--color-text-secondary)' }}>
              Supported formats: PDF, DOCX, ZIP, PY, IPYNB (Max 50MB)
            </p>
            <button
              type="button"
              className="mt-7 inline-flex h-12 items-center justify-center rounded-xl border bg-white px-7 text-sm font-semibold transition-opacity hover:opacity-80"
              style={{ borderColor: 'var(--color-border)', color: 'var(--color-brand-primary)' }}
            >
              {file ? 'Change File' : 'Browse Files'}
            </button>
          </div>
        )}

        <div>
          <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--color-text-primary)' }}>
            Catatan Tambahan (Opsional):
          </label>
          <input
            type="text"
            className="w-full p-3.5 rounded-xl border focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
            style={{ borderColor: 'var(--color-border)' }}
            placeholder="Tulis catatan atau pesan singkat untuk dosen..."
            value={studentNote}
            onChange={(e) => setStudentNote(e.target.value)}
            disabled={submitting}
          />
        </div>
      </div>
    </AssignmentSection>
  );
}

function AssignmentSection({ children }: { children: React.ReactNode }) {
  return (
    <section className="rounded-[28px] border bg-white px-6 py-7 shadow-[0_12px_28px_rgba(7,27,63,0.04)] sm:px-8" style={{ borderColor: 'var(--color-border)' }}>
      {children}
    </section>
  );
}

function AssignmentStatusCard({ 
  assignment, 
  isSubmitted 
}: { 
  assignment: CourseContentItem;
  isSubmitted: boolean;
}) {
  const metaParts = assignment.meta ? assignment.meta.split(' • ') : [];
  const points = metaParts.length > 0 ? metaParts[0] : '100 Points';
  const dueDate = metaParts.length > 1 ? metaParts[1] : 'No Due Date';

  return (
    <aside className="h-fit rounded-[28px] border bg-white px-6 py-7 shadow-[0_12px_28px_rgba(7,27,63,0.04)] xl:sticky xl:top-28" style={{ borderColor: 'var(--color-border)' }}>
      <h2 className="text-xl font-bold" style={{ color: 'var(--color-text-primary)' }}>
        Assignment Status
      </h2>
      <div className="mt-5 border-t pt-6" style={{ borderColor: 'var(--color-border)' }}>
        <StatusRow
          icon={<ClockStatusIcon />}
          label="Due Date"
          primaryText={dueDate}
          secondaryText="Open"
          secondaryTone="#A42C08"
        />
        <StatusRow
          icon={<TrophyIcon />}
          label="Points Possible"
          primaryText={points}
        />
        <StatusRow
          icon={<ClipboardStatusIcon />}
          label="Submission Status"
          primaryText={isSubmitted ? 'Submitted' : 'Not Submitted'}
          badge
        />
      </div>
    </aside>
  );
}

function StatusRow({
  icon,
  label,
  primaryText,
  secondaryText,
  secondaryTone,
  badge = false,
}: StatusRowProps) {
  return (
    <div className="mb-8 flex items-start gap-4 last:mb-0">
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#EEF0F2]" style={{ color: 'var(--color-text-muted)' }}>
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-sm font-semibold uppercase tracking-[0.12em]" style={{ color: 'var(--color-text-muted)' }}>
          {label}
        </p>
        {badge ? (
          <span className="mt-2 inline-flex rounded-full border bg-[#F3F4F8] px-4 py-1 text-base font-semibold" style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-secondary)' }}>
            {primaryText}
          </span>
        ) : (
          <p className="mt-1 text-lg font-semibold leading-7" style={{ color: 'var(--color-text-primary)' }}>
            {primaryText}
          </p>
        )}
        {secondaryText ? (
          <p className="mt-1 text-lg font-semibold" style={{ color: secondaryTone ?? 'var(--color-text-secondary)' }}>
            {secondaryText}
          </p>
        ) : null}
      </div>
    </div>
  );
}

function AssignmentActionBar({ previousHref, nextHref, onSubmit, submitting }: AssignmentActionBarProps) {
  return (
    <div className="border-t bg-white px-4 py-4 sm:px-6 lg:px-8 mt-6" style={{ borderColor: 'var(--color-border)' }}>
      <div className="mx-auto grid w-full max-w-[1280px] gap-3 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <AssignmentNavButton href={previousHref} label="Previous" direction="previous" />
          <AssignmentNavButton href={nextHref} label="Next" direction="next" primary />
        </div>
        <div className="flex justify-start xl:justify-end">
          <button
            type="button"
            onClick={onSubmit}
            disabled={submitting}
            className="inline-flex h-12 items-center justify-center rounded-xl bg-[#004AC6] px-8 text-base font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? 'Submitting...' : 'Submit Assignment'}
          </button>
        </div>
      </div>
    </div>
  );
}

function AssignmentNavButton({
  href,
  label,
  direction,
  primary = false,
}: AssignmentNavButtonProps) {
  const borderColor = primary ? 'var(--color-brand-primary)' : 'var(--color-border)';
  const textColor = primary ? 'var(--color-brand-primary)' : 'var(--color-text-secondary)';
  const content = (
    <>
      {direction === 'previous' ? <AssignmentArrowIcon direction="previous" /> : null}
      {label}
      {direction === 'next' ? <AssignmentArrowIcon direction="next" /> : null}
    </>
  );

  if (href) {
    return (
      <Link
        href={href}
        className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border bg-white px-6 text-base font-semibold no-underline transition-opacity hover:opacity-80"
        style={{ borderColor, color: textColor }}
      >
        {content}
      </Link>
    );
  }

  return (
    <button
      type="button"
      disabled
      className="inline-flex h-12 cursor-not-allowed items-center justify-center gap-2 rounded-xl border bg-white px-6 text-base font-semibold opacity-45"
      style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-secondary)' }}
    >
      {content}
    </button>
  );
}

function AssignmentArrowIcon({ direction }: { direction: 'previous' | 'next' }) {
  const isPrevious = direction === 'previous';

  return (
    <svg
      aria-hidden="true"
      className="h-4 w-4 shrink-0"
      viewBox="0 0 16 16"
      fill="none"
    >
      <path
        d={isPrevious ? 'M10 3.5 5.5 8l4.5 4.5M6 8h6.5' : 'M6 3.5 10.5 8 6 12.5M3.5 8H10'}
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function UploadIcon() {
  return (
    <svg className="mx-auto h-10 w-10" viewBox="0 0 24 24" fill="none" style={{ color: 'var(--color-text-muted)' }}>
      <path d="M8 17H7a4 4 0 0 1-.8-7.92A5.5 5.5 0 0 1 16.6 7.2 4.5 4.5 0 0 1 17.5 16H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M12 12v7M9 15l3-3 3 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ClockStatusIcon() {
  return (
    <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
      <path d="M12 7v5l3 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function TrophyIcon() {
  return (
    <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none">
      <path d="M8 4h8v4a4 4 0 0 1-8 0V4Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      <path d="M8 6H5a3 3 0 0 0 3 3M16 6h3a3 3 0 0 1-3 3M12 12v4M9 20h6M10 16h4v4h-4v-4Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
    </svg>
  );
}

function ClipboardStatusIcon() {
  return (
    <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none">
      <path d="M9 4h6l1 2h3v16H5V6h3l1-2Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      <path d="M9 12h4M9 16h3M16 15l2 2 3-4" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
    </svg>
  );
}
