'use client';

import Link from 'next/link';
import React from 'react';
import { updateCourseSettingsAction } from '@/app/actions/updateCourseSettings';
import type { LecturerManageCourseData } from '@/lib/types/course';
import { LecturerBreadcrumbs } from './LecturerBreadcrumbs';
import { DeleteConfirmationDialog } from './shared/DeleteConfirmationDialog';
import {
  LECTURER_CARD_CLASSNAME,
  LECTURER_COMPACT_CONTROL_CLASSNAME,
} from './shared/lecturerUiStyles';
import { updateFormField } from './shared/updateFormField';

type CourseStatusOption = 'Active' | 'Draft' | 'Archived';

interface CourseSettingsFormState {
  title: string;
  department: string;
  semester: string;
  credits: string;
  teachingFormat: string;
  enrollmentCap: string;
  description: string;
  status: CourseStatusOption;
}

interface LecturerCourseSettingsViewProps {
  data: LecturerManageCourseData;
}

const CREDIT_OPTIONS = ['1', '2', '3', '4', '5'] as const;
const TEACHING_FORMAT_OPTIONS = ['Teori dan Praktikum', 'Teori', 'Lainnya'] as const;

export function LecturerCourseSettingsView({
  data,
}: LecturerCourseSettingsViewProps) {
  const [formState, setFormState] = React.useState(() => createInitialSettingsState(data));
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);
  const [feedbackMessage, setFeedbackMessage] = React.useState<string | null>(null);
  const [feedbackTone, setFeedbackTone] = React.useState<'success' | 'error'>('success');
  const [isSaving, startSavingTransition] = React.useTransition();

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFeedbackMessage(null);

    const normalizedCredits = Number(formState.credits);
    const normalizedEnrollmentCap = Number(formState.enrollmentCap);

    if (!Number.isInteger(normalizedCredits) || normalizedCredits <= 0) {
      setFeedbackTone('error');
      setFeedbackMessage('Credits harus berupa angka bulat positif.');
      return;
    }

    if (!Number.isInteger(normalizedEnrollmentCap) || normalizedEnrollmentCap <= 0) {
      setFeedbackTone('error');
      setFeedbackMessage('Enrollment capacity harus berupa angka bulat positif.');
      return;
    }

    startSavingTransition(async () => {
      const result = await updateCourseSettingsAction(data.course.id, {
        title: formState.title,
        department: formState.department,
        semester: formState.semester,
        credits: normalizedCredits,
        teachingFormat: formState.teachingFormat,
        enrollmentCap: normalizedEnrollmentCap,
        description: formState.description,
        status: formState.status,
      });

      if (!result.success) {
        setFeedbackTone('error');
        setFeedbackMessage(result.error ?? 'Gagal menyimpan course settings.');
        return;
      }

      setFeedbackTone('success');
      setFeedbackMessage('Course settings berhasil disimpan.');
    });
  }

  return (
    <>
      <div className="mx-auto w-full max-w-[1120px] px-4 py-8 sm:px-6 lg:px-8">
        <LecturerBreadcrumbs
          items={[
            { label: 'Home', href: '/dashboard_dosen' },
            { label: 'Courses', href: '/dosen/courses' },
            { label: data.course.title, href: `/dosen/courses/${data.course.id}` },
            { label: 'Course Settings' },
          ]}
        />

        <section className="mb-8">
          <p className="text-lg" style={{ color: 'var(--color-text-secondary)' }}>
            {data.course.code} - {data.termLabel}
          </p>
          <h1
            className="mt-3 text-[34px] font-bold leading-tight sm:text-[48px]"
            style={{ color: 'var(--color-text-primary)' }}
          >
            Course Settings
          </h1>
          <p
            className="mt-3 max-w-[820px] text-lg leading-8"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            Update the core course information that students and teaching staff rely on:
            title, semester, credits, enrollment capacity, and publication state.
          </p>
        </section>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
          <form
            className={`${LECTURER_CARD_CLASSNAME} overflow-visible`}
            style={{ borderColor: 'var(--color-border)' }}
            onSubmit={handleSubmit}
          >
            <div className="space-y-0 px-5 py-6 sm:px-7 sm:py-7">
              {feedbackMessage ? (
                <div
                  className="mb-6 rounded-[16px] border px-4 py-3 text-sm font-medium"
                  style={{
                    borderColor:
                      feedbackTone === 'success' ? 'rgba(22, 163, 74, 0.18)' : 'rgba(217, 45, 32, 0.18)',
                    background:
                      feedbackTone === 'success' ? 'rgba(240, 253, 244, 0.95)' : 'rgba(254, 242, 242, 0.96)',
                    color: feedbackTone === 'success' ? '#166534' : '#B42318',
                  }}
                >
                  {feedbackMessage}
                </div>
              ) : null}

              <FormSection title="Basic Information">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <FormField label="Course Title">
                    <TextInput
                      value={formState.title}
                      onChange={(value) => updateFormField('title', value, setFormState)}
                      placeholder="Enter course title"
                    />
                  </FormField>
                  <FormField label="Semester">
                    <TextInput
                      value={formState.semester}
                      onChange={(value) => updateFormField('semester', value, setFormState)}
                      placeholder="Contoh: Ganjil 2026/2027"
                    />
                  </FormField>
                  <FormField label="Credits">
                    <SelectInput
                      value={formState.credits}
                      onChange={(value) => updateFormField('credits', value, setFormState)}
                      options={CREDIT_OPTIONS}
                    />
                  </FormField>
                  <FormField label="Teaching Format">
                    <SelectInput
                      value={formState.teachingFormat}
                      onChange={(value) => updateFormField('teachingFormat', value, setFormState)}
                      options={TEACHING_FORMAT_OPTIONS}
                    />
                  </FormField>
                </div>
              </FormSection>

              <FormSection title="Course Description">
                <FormField label="Description">
                  <TextAreaInput
                    value={formState.description}
                    onChange={(value) => updateFormField('description', value, setFormState)}
                    placeholder="Describe the course goals, coverage, and expected learning outcomes."
                  />
                </FormField>
              </FormSection>

              <FormSection title="Enrollment Settings">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <FormField label="Enrollment Capacity">
                    <TextInput
                      value={formState.enrollmentCap}
                      onChange={(value) => updateFormField('enrollmentCap', value, setFormState)}
                      placeholder="60"
                    />
                  </FormField>
                  <ReadOnlyMetric
                    label="Current Students"
                    value={`${data.enrolledStudents} enrolled`}
                  />
                </div>
              </FormSection>

              <FormSection title="Course Status">
                <div className="space-y-4">
                  <SimpleRadioOption
                    checked={formState.status === 'Active'}
                    label="Active"
                    onSelect={() => updateFormField('status', 'Active', setFormState)}
                  />
                  <SimpleRadioOption
                    checked={formState.status === 'Draft'}
                    label="Draft"
                    onSelect={() => updateFormField('status', 'Draft', setFormState)}
                  />
                </div>
              </FormSection>
            </div>

            <div
              className="flex flex-col gap-3 border-t px-5 py-5 sm:flex-row sm:justify-end sm:px-7"
              style={{ borderColor: 'rgba(195,198,214,0.75)' }}
            >
              <button
                type="button"
                onClick={() => setIsDeleteDialogOpen(true)}
                className="inline-flex h-12 items-center justify-center rounded-[14px] border px-5 text-base font-semibold transition-colors hover:bg-[#FFF5F5]"
                style={{ borderColor: '#D92D20', color: '#D92D20' }}
              >
                Delete Course
              </button>
              <Link
                href={`/dosen/courses/${data.course.id}`}
                className="inline-flex h-12 items-center justify-center rounded-[14px] border px-5 text-base font-semibold no-underline transition-colors hover:bg-[#F5F8FF]"
                style={{
                  borderColor: 'var(--color-brand-primary)',
                  color: 'var(--color-brand-primary)',
                }}
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={!canSaveSettings(formState) || isSaving}
                className="inline-flex h-12 items-center justify-center rounded-[14px] px-5 text-base font-semibold text-white transition-opacity disabled:cursor-not-allowed disabled:opacity-45"
                style={{ background: 'var(--color-brand-primary)' }}
              >
                {isSaving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>

          <aside className="space-y-6">
            <div
              className={`${LECTURER_CARD_CLASSNAME} relative overflow-hidden px-5 py-6 sm:px-6`}
              style={{
                borderColor: 'rgba(0, 53, 148, 0.16)',
                background:
                  'linear-gradient(145deg, #FFFFFF 0%, #F7FAFF 62%, #EEF4FF 100%)',
              }}
            >
              <div
                aria-hidden="true"
                className="absolute left-0 top-0 h-1 w-full"
                style={{ background: 'linear-gradient(90deg, #003594, #7DA8FF)' }}
              />
              <h2
                className="text-[22px] font-bold"
                style={{ color: 'var(--color-text-primary)' }}
              >
                Course Summary
              </h2>
              <div className="mt-4 space-y-2">
                <SummaryRow label="Modules" value={String(data.modules.length)} tone="blue" />
                <SummaryRow label="Assignments" value={String(data.course.assignmentCount)} tone="purple" />
                <SummaryRow label="Students" value={String(data.enrolledStudents)} tone="green" />
                <SummaryRow label="Department" value={formState.department} tone="neutral" />
                <SummaryRow label="Status" value={formState.status} tone={formState.status === 'Active' ? 'green' : 'orange'} />
              </div>
            </div>
          </aside>
        </div>
      </div>

      {isDeleteDialogOpen ? (
        <DeleteConfirmationDialog
          title="Delete Course"
          body={`This will remove "${data.course.title}" from the lecturer course list.`}
          confirmLabel="Delete Course"
          labelledById="delete-course-title"
          onCancel={() => setIsDeleteDialogOpen(false)}
          onConfirm={() => setIsDeleteDialogOpen(false)}
        />
      ) : null}
    </>
  );
}

function FormSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section
      className="border-b py-6 first:pt-0 last:border-b-0 last:pb-0"
      style={{ borderColor: 'rgba(195,198,214,0.75)' }}
    >
      <h2 className="mb-4 text-[22px] font-bold" style={{ color: 'var(--color-text-primary)' }}>
        {title}
      </h2>
      {children}
    </section>
  );
}

function FormField({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span
        className="mb-2 block text-sm font-semibold uppercase tracking-[0.04em]"
        style={{ color: 'var(--color-text-secondary)' }}
      >
        {label}
      </span>
      {children}
    </label>
  );
}

function TextInput({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}) {
  return (
    <input
      type="text"
      value={value}
      onChange={(event) => onChange(event.target.value)}
      placeholder={placeholder}
      className={LECTURER_COMPACT_CONTROL_CLASSNAME}
      style={{
        borderColor: 'var(--color-border)',
        background: '#FFFFFF',
        color: 'var(--color-text-primary)',
      }}
    />
  );
}

function TextAreaInput({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}) {
  return (
    <textarea
      value={value}
      onChange={(event) => onChange(event.target.value)}
      placeholder={placeholder}
      rows={6}
      className="w-full rounded-[14px] border px-4 py-3 text-base outline-none transition-colors focus:border-[#7DA8FF]"
      style={{
        borderColor: 'var(--color-border)',
        background: '#FFFFFF',
        color: 'var(--color-text-primary)',
      }}
    />
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
        className={`${LECTURER_COMPACT_CONTROL_CLASSNAME} appearance-none pr-11`}
        style={{
          borderColor: 'var(--color-border)',
          background: '#FFFFFF',
          color: 'var(--color-text-primary)',
        }}
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
      <span
        className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2"
        style={{ color: 'var(--color-text-secondary)' }}
      >
        <SelectChevronIcon />
      </span>
    </div>
  );
}

function ReadOnlyMetric({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div>
      <span
        className="mb-2 block text-sm font-semibold uppercase tracking-[0.04em]"
        style={{ color: 'var(--color-text-secondary)' }}
      >
        {label}
      </span>
      <div
        className="flex h-12 items-center rounded-[14px] border px-4 text-base"
        style={{
          borderColor: 'var(--color-border)',
          background: '#F8FAFD',
          color: 'var(--color-text-secondary)',
        }}
      >
        {value}
      </div>
    </div>
  );
}

function SimpleRadioOption({
  checked,
  label,
  onSelect,
}: {
  checked: boolean;
  label: string;
  onSelect: () => void;
}) {
  return (
    <button type="button" onClick={onSelect} className="flex items-center gap-4 text-left">
      <span
        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border"
        style={{
          borderColor: checked ? 'var(--color-brand-primary)' : 'var(--color-border)',
          background: '#FFFFFF',
        }}
      >
        {checked ? (
          <span
            className="block h-3.5 w-3.5 rounded-full"
            style={{ background: 'var(--color-brand-primary)' }}
            aria-hidden="true"
          />
        ) : null}
      </span>
      <span
        className="text-[18px] font-medium"
        style={{ color: 'var(--color-text-primary)' }}
      >
        {label}
      </span>
    </button>
  );
}

function SummaryRow({
  label,
  tone,
  value,
}: {
  label: string;
  tone: SummaryTone;
  value: string;
}) {
  const style = SUMMARY_TONE_STYLE[tone];

  return (
    <div
      className="grid grid-cols-[minmax(0,110px)_minmax(0,1fr)] items-start gap-x-3 rounded-[14px] border px-3 py-2.5"
      style={{
        background: style.background,
        borderColor: style.borderColor,
      }}
    >
      <span
        className="text-sm font-semibold uppercase tracking-[0.04em]"
        style={{ color: style.labelColor }}
      >
        {label}
      </span>
      <span
        className="text-right text-base font-semibold leading-6"
        style={{
          color: 'var(--color-text-primary)',
          wordBreak: 'break-word',
        }}
      >
        {value}
      </span>
    </div>
  );
}

type SummaryTone = 'blue' | 'purple' | 'green' | 'orange' | 'neutral';

const SUMMARY_TONE_STYLE: Record<
  SummaryTone,
  { background: string; borderColor: string; labelColor: string }
> = {
  blue: {
    background: 'rgba(231, 238, 255, 0.78)',
    borderColor: 'rgba(0, 53, 148, 0.1)',
    labelColor: 'var(--color-brand-primary)',
  },
  purple: {
    background: 'rgba(237, 233, 254, 0.72)',
    borderColor: 'rgba(124, 58, 237, 0.12)',
    labelColor: '#6D35C5',
  },
  green: {
    background: 'rgba(220, 252, 231, 0.62)',
    borderColor: 'rgba(22, 163, 74, 0.12)',
    labelColor: '#187346',
  },
  orange: {
    background: 'rgba(255, 247, 237, 0.82)',
    borderColor: 'rgba(234, 88, 12, 0.14)',
    labelColor: '#A14B08',
  },
  neutral: {
    background: 'rgba(248, 250, 253, 0.86)',
    borderColor: 'rgba(195, 198, 214, 0.45)',
    labelColor: 'var(--color-text-secondary)',
  },
};

function createInitialSettingsState(
  data: LecturerManageCourseData
): CourseSettingsFormState {
  return {
    title: data.course.title,
    department: data.course.department,
    semester: data.course.semester ?? data.termLabel,
    credits: String(data.credits),
    teachingFormat: data.course.teachingFormat ?? 'Teori dan Praktikum',
    enrollmentCap: String(data.course.enrollmentCap ?? Math.max(data.enrolledStudents + 12, 60)),
    description: createCourseDescription(data),
    status: data.course.status,
  };
}

function createCourseDescription(data: LecturerManageCourseData) {
  if (data.course.description?.trim()) {
    return data.course.description;
  }

  return `${data.course.title} is a lecturer-managed course for ${data.course.department} students. The course currently includes ${data.modules.length} modules and ${data.course.assignmentCount} assignments across ${data.termLabel.toLowerCase()}.`;
}

function canSaveSettings(formState: CourseSettingsFormState) {
  return Boolean(
    formState.title.trim() &&
      formState.department.trim() &&
      formState.semester.trim() &&
      formState.credits.trim() &&
      formState.teachingFormat.trim() &&
      formState.enrollmentCap.trim() &&
      formState.description.trim()
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

