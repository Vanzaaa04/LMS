'use client';

import Link from 'next/link';
import React from 'react';
import type {
  AssignmentEditorMode,
  LecturerAssignmentStatus,
  LecturerCourse,
  LecturerCourseModule,
  LecturerModuleAssessment,
} from '@/lib/types/course';
import { LecturerBreadcrumbs } from './LecturerBreadcrumbs';
import { DeleteConfirmationDialog } from './shared/DeleteConfirmationDialog';
import { updateFormField } from './shared/updateFormField';
import { uploadFileApi } from '@/lib/api/courseApi';
import {
  LECTURER_CARD_CLASSNAME,
  LECTURER_COMPACT_CONTROL_CLASSNAME,
} from './shared/lecturerUiStyles';

interface ExistingAssignmentItem {
  assignment: LecturerModuleAssessment;
  module: LecturerCourseModule;
}

interface AssignmentEditorFormState {
  title: string;
  description: string;
  assignedDate: string;
  deadline: string;
  submissionRequirement: string;
  status: LecturerAssignmentStatus;
  templateName: string;
  templateMeta: string;
  templateUrl: string;
  maxAttempts: string;
  gradingMethod: string;
}

interface LecturerAssignmentEditorViewProps {
  mode: AssignmentEditorMode;
  course: LecturerCourse;
  module: LecturerCourseModule;
  existingAssignments: ExistingAssignmentItem[];
  assignment?: LecturerModuleAssessment & { maxAttempts?: number; gradingMethod?: string };
  onSave: (formData: FormData) => Promise<void>;
  onDelete?: () => Promise<void>;
  returnHref?: string;
}

const SUBMISSION_REQUIREMENT_OPTIONS = [
  'File Upload (PDF, DOCX, ZIP)',
  'Text Entry',
  'External Link Submission',
];
const ASSIGNMENT_STATUS_STYLE: Record<LecturerAssignmentStatus, { background: string; color: string }> = {
  Active: { background: '#E7EEFF', color: 'var(--color-brand-primary)' },
  Draft: { background: '#F1F2F4', color: 'var(--color-text-secondary)' },
  Scheduled: { background: '#FFF3D6', color: '#9A5B00' },
};

export function LecturerAssignmentEditorView({
  mode,
  course,
  module,
  existingAssignments,
  assignment,
  onSave,
  onDelete,
  returnHref,
}: LecturerAssignmentEditorViewProps) {
  const [formState, setFormState] = React.useState(() =>
    createInitialFormState(mode, assignment)
  );
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);
  const [isPending, setIsPending] = React.useState(false);
  const [uploading, setUploading] = React.useState(false);
  const [uploadError, setUploadError] = React.useState<string | null>(null);

  const pageTitle = mode === 'create' ? 'Create New Assignment' : 'Edit Assignment';

  const handleTemplateUpload = async (file: File) => {
    const token = typeof window !== 'undefined' ? sessionStorage.getItem('token') : null;
    if (!token) {
      setUploadError('Sesi login berakhir. Silakan login ulang.');
      return;
    }

    setUploading(true);
    setUploadError(null);
    try {
      const result = await uploadFileApi(file, token);
      setFormState(prev => ({
        ...prev,
        templateUrl: result.url,
        templateName: file.name,
        templateMeta: `${(file.size / 1024 / 1024).toFixed(2)} MB`
      }));
    } catch (err: any) {
      console.error('Template upload failed:', err);
      setUploadError(err.message || 'Gagal mengunggah file template.');
    } finally {
      setUploading(false);
    }
  };
  const submitButtonLabel = mode === 'create' ? 'Create Assignment' : 'Save Changes';
  const courseHref = `/dosen/courses/${course.id}`;
  const assignmentsHref = `/dosen/courses/${course.id}/assignments`;
  const cancelHref = returnHref ?? (mode === 'edit' ? assignmentsHref : courseHref);

  async function submitAssignment(statusOverride?: LecturerAssignmentStatus) {
    setIsPending(true);
    try {
      const formData = createAssignmentFormData(formState, statusOverride);
      await onSave(formData);
    } finally {
      setIsPending(false);
    }
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await submitAssignment();
  }

  async function handleDelete() {
    if (!onDelete) return;
    setIsPending(true);
    try {
      await onDelete();
    } finally {
      setIsPending(false);
    }
  }

  return (
    <>
      <div className="mx-auto w-full max-w-[1240px] px-4 py-8 sm:px-6 lg:px-8">
        <LecturerBreadcrumbs
          items={[
            { label: 'Home', href: '/dashboard_dosen' },
            { label: 'Courses', href: '/dosen/courses' },
            { label: course.title, href: courseHref },
            { label: mode === 'edit' ? 'Assignments' : module.orderLabel, href: cancelHref },
            { label: pageTitle },
          ]}
        />

        <section className="mb-8">
          <h1
            className="text-[34px] font-bold leading-tight sm:text-[44px]"
            style={{ color: 'var(--color-text-primary)' }}
          >
            {pageTitle}
          </h1>
          <p className="mt-3 text-lg" style={{ color: 'var(--color-text-secondary)' }}>
            Configure assignment details, deadlines, and submission parameters for students.
          </p>
        </section>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_300px]">
          <form
            className={`${LECTURER_CARD_CLASSNAME} overflow-hidden`}
            style={{ borderColor: 'var(--color-border)' }}
            onSubmit={handleSubmit}
          >
            <div className="space-y-0 px-5 py-6 sm:px-7 sm:py-7">
              <FormSection>
                <FormField label="Assignment Title">
                  <TextInput
                    value={formState.title}
                    onChange={(value) => updateFormField('title', value, setFormState)}
                    placeholder="Enter assignment title"
                  />
                </FormField>

                <div className="mt-7">
                  <FormField label="Description & Instructions">
                    <TextAreaInput
                      value={formState.description}
                      onChange={(value) => updateFormField('description', value, setFormState)}
                      placeholder="Provide detailed instructions, evaluation criteria, and expected learning outcomes..."
                    />
                  </FormField>
                </div>
              </FormSection>

              <FormSection>
                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                  <FormField label="Assigned Date">
                    <DateTimeInput
                      value={formState.assignedDate}
                      onChange={(value) => updateFormField('assignedDate', value, setFormState)}
                    />
                  </FormField>
                  <FormField label="Deadline">
                    <DateTimeInput
                      value={formState.deadline}
                      onChange={(value) => updateFormField('deadline', value, setFormState)}
                    />
                  </FormField>
                </div>
              </FormSection>

              <FormSection>
                <div className="grid grid-cols-1 gap-5 md:grid-cols-2 mb-5">
                  <FormField label="Max Attempts">
                    <TextInput
                      type="number"
                      value={formState.maxAttempts}
                      onChange={(value) => updateFormField('maxAttempts', value, setFormState)}
                      placeholder="e.g. 1, 3"
                      min="1"
                    />
                  </FormField>
                  <FormField label="Grading Method">
                    <SelectInput
                      value={formState.gradingMethod}
                      onChange={(value) =>
                        updateFormField('gradingMethod', value, setFormState)
                      }
                      options={['LATEST', 'HIGHEST']}
                    />
                  </FormField>
                </div>
                <FormField label="Submission Requirements">
                  <SelectInput
                    value={formState.submissionRequirement}
                    onChange={(value) =>
                      updateFormField('submissionRequirement', value, setFormState)
                    }
                    options={SUBMISSION_REQUIREMENT_OPTIONS}
                  />
                </FormField>
              </FormSection>

              {formState.submissionRequirement === 'File Upload (PDF, DOCX, ZIP)' && (
                <FormSection>
                  <h2
                    className="text-[18px] font-bold"
                    style={{ color: 'var(--color-text-primary)' }}
                  >
                    Assignment Template
                  </h2>
                  <p className="mt-2 text-base" style={{ color: 'var(--color-text-secondary)' }}>
                    Upload a template or reference file for students to use.
                  </p>
                  <TemplateUploadBox onUpload={handleTemplateUpload} uploading={uploading} />
                  {uploadError && (
                    <div className="mt-2 text-sm font-semibold text-red-600">
                      {uploadError}
                    </div>
                  )}
                  {formState.templateName ? (
                    <AttachedTemplate
                      fileName={formState.templateName}
                      fileMeta={formState.templateMeta}
                      onRemove={() => {
                        updateFormField('templateName', '', setFormState);
                        updateFormField('templateMeta', '', setFormState);
                        updateFormField('templateUrl', '', setFormState);
                      }}
                    />
                  ) : null}
                </FormSection>
              )}

              <FormSection>
                <h2
                  className="mb-4 text-[18px] font-bold"
                  style={{ color: 'var(--color-text-primary)' }}
                >
                  Assignment Status
                </h2>
                <div className="flex flex-wrap gap-5">
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
              {mode === 'edit' ? (
                <button
                  type="button"
                  onClick={() => setIsDeleteDialogOpen(true)}
                  className="inline-flex h-12 items-center justify-center rounded-[14px] border px-5 text-base font-semibold transition-colors hover:bg-[#FFF5F5]"
                  style={{ borderColor: '#D92D20', color: '#D92D20' }}
                >
                  Delete Assignment
                </button>
              ) : null}
              <Link
                href={cancelHref}
                className="inline-flex h-12 items-center justify-center rounded-[14px] border px-5 text-base font-semibold no-underline transition-colors hover:bg-[#F5F8FF]"
                style={{
                  borderColor: 'var(--color-border)',
                  color: 'var(--color-text-secondary)',
                }}
              >
                Kembali ke Kelas
              </Link>
              {mode === 'create' ? (
                <button
                  type="button"
                  disabled={!canSubmitAssignment(formState) || isPending}
                  onClick={() => submitAssignment('Draft')}
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-[14px] border px-5 text-base font-semibold transition-colors hover:bg-[#F5F8FF]"
                  style={{
                    borderColor: 'var(--color-brand-primary)',
                    color: 'var(--color-brand-primary)',
                  }}
                >
                  <DraftIcon />
                  Save as Draft
                </button>
              ) : null}
              <button
                type={mode === 'create' ? 'button' : 'submit'}
                onClick={mode === 'create' ? () => submitAssignment('Active') : undefined}
                disabled={!canSubmitAssignment(formState) || isPending}
                className="inline-flex h-12 items-center justify-center gap-2 rounded-[14px] px-5 text-base font-semibold text-white transition-opacity disabled:cursor-not-allowed disabled:opacity-45"
                style={{ background: 'var(--color-brand-primary)' }}
              >
                <SubmitIcon />
                {isPending ? 'Saving...' : submitButtonLabel}
              </button>
            </div>
          </form>

          <ExistingAssignmentsPanel
            courseId={course.id}
            assignments={existingAssignments}
          />
        </div>
      </div>

      {isDeleteDialogOpen ? (
        <DeleteConfirmationDialog
          title="Delete Assignment"
          body={`This will remove "${formState.title}" from ${module.title}.`}
          confirmLabel="Delete Assignment"
          labelledById="delete-assignment-title"
          onCancel={() => setIsDeleteDialogOpen(false)}
          onConfirm={() => {
            setIsDeleteDialogOpen(false);
            handleDelete();
          }}
        />
      ) : null}
    </>
  );
}

function ExistingAssignmentsPanel({
  courseId,
  assignments,
}: {
  courseId: string;
  assignments: ExistingAssignmentItem[];
}) {
  const previewAssignments = assignments.slice(0, 2);

  return (
    <aside
      className={`${LECTURER_CARD_CLASSNAME} h-fit px-5 py-6 sm:px-6`}
      style={{ borderColor: 'var(--color-border)' }}
    >
      <div className="flex items-center gap-3">
        <ClipboardIcon />
        <h2 className="text-[24px] font-bold" style={{ color: 'var(--color-text-primary)' }}>
          Existing Assignments
        </h2>
      </div>

      <div className="mt-5 space-y-4">
        {previewAssignments.map(({ assignment, module }) => (
          <ExistingAssignmentCard
            key={assignment.id}
            assignment={assignment}
            module={module}
          />
        ))}
      </div>

      <Link
        href={`/dosen/courses/${courseId}/assignments`}
        className="mt-5 inline-flex h-12 w-full items-center justify-center gap-2 border text-base font-semibold no-underline transition-colors hover:bg-[#F5F8FF]"
        style={{
          borderColor: 'var(--color-border)',
          color: 'var(--color-brand-primary)',
        }}
      >
        View All Assignments
        <ArrowRightIcon />
      </Link>
    </aside>
  );
}

function ExistingAssignmentCard({
  assignment,
  module,
}: {
  assignment: LecturerModuleAssessment;
  module: LecturerCourseModule;
}) {
  const status = assignment.status ?? 'Draft';

  return (
    <article
      className="rounded-[16px] border bg-white px-4 py-4"
      style={{ borderColor: 'var(--color-border)' }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="truncate text-base font-bold" style={{ color: 'var(--color-text-primary)' }}>
            {module.orderLabel}: {assignment.title}
          </h3>
          <p className="mt-2 flex items-center gap-2 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
            <StudentsTinyIcon />
            {formatSubmissionText(assignment)}
          </p>
        </div>
        <StatusPill status={status} />
      </div>
    </article>
  );
}

function FormSection({ children }: { children: React.ReactNode }) {
  return (
    <section
      className="border-b py-6 first:pt-0 last:border-b-0 last:pb-0"
      style={{ borderColor: 'rgba(195,198,214,0.75)' }}
    >
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
        className="mb-3 block text-base font-bold"
        style={{ color: 'var(--color-text-primary)' }}
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
  type = 'text',
  min,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  type?: string;
  min?: string;
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      placeholder={placeholder}
      min={min}
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

function DateTimeInput({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <input
      type="datetime-local"
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className={LECTURER_COMPACT_CONTROL_CLASSNAME}
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
        <ChevronDownIcon />
      </span>
    </div>
  );
}

function TemplateUploadBox({ onUpload, uploading }: { onUpload: (file: File) => void; uploading: boolean }) {
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onUpload(e.target.files[0]);
    }
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  return (
    <div
      className="mt-4 flex min-h-[136px] flex-col items-center justify-center rounded-[16px] border-2 border-dashed px-5 py-6 text-center"
      style={{ borderColor: '#C5CADB', background: '#FBFCFE' }}
    >
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        onChange={handleFileChange}
        disabled={uploading}
      />
      <button
        type="button"
        onClick={triggerFileSelect}
        disabled={uploading}
        className="inline-flex h-11 items-center gap-2 rounded-[12px] px-5 text-base font-semibold text-white disabled:opacity-50"
        style={{ background: 'var(--color-brand-primary)' }}
      >
        <UploadIcon />
        {uploading ? 'Uploading...' : 'Upload Template'}
      </button>
      <p className="mt-3 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
        or drag and drop here
      </p>
    </div>
  );
}

function AttachedTemplate({
  fileName,
  fileMeta,
  onRemove,
}: {
  fileName: string;
  fileMeta: string;
  onRemove: () => void;
}) {
  return (
    <div
      className="mt-4 flex max-w-[340px] items-center justify-between gap-4 rounded-[16px] border px-4 py-4"
      style={{ borderColor: 'var(--color-border)', background: '#F8FAFD' }}
    >
      <div className="flex min-w-0 items-center gap-3">
        <span style={{ color: 'var(--color-brand-primary)' }}>
          <DocumentIcon />
        </span>
        <div className="min-w-0">
          <p className="truncate text-base font-semibold" style={{ color: 'var(--color-text-primary)' }}>
            {fileName}
          </p>
          <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
            {fileMeta}
          </p>
        </div>
      </div>
      <button
        type="button"
        aria-label="Remove assignment template"
        onClick={onRemove}
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-colors hover:bg-[#EEF3FF]"
        style={{ color: 'var(--color-text-secondary)' }}
      >
        <CloseIcon />
      </button>
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
    <button type="button" onClick={onSelect} className="flex items-center gap-3 text-left">
      <span
        className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border"
        style={{
          borderColor: checked ? 'var(--color-brand-primary)' : 'var(--color-border)',
          background: '#FFFFFF',
        }}
      >
        {checked ? (
          <span
            className="block h-2.5 w-2.5 rounded-full"
            style={{ background: 'var(--color-brand-primary)' }}
            aria-hidden="true"
          />
        ) : null}
      </span>
      <span className="text-base font-medium" style={{ color: 'var(--color-text-primary)' }}>
        {label}
      </span>
    </button>
  );
}

function StatusPill({ status }: { status: LecturerAssignmentStatus }) {
  return (
    <span
      className="shrink-0 rounded-full px-3 py-1 text-sm font-semibold"
      style={ASSIGNMENT_STATUS_STYLE[status]}
    >
      {status}
    </span>
  );
}

function formatDateTimeLocal(isoString?: string | null) {
  if (!isoString) return '';
  const date = new Date(isoString);
  if (isNaN(date.getTime())) return '';
  const tzOffset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - tzOffset).toISOString().slice(0, 16);
}

function createInitialFormState(
  mode: AssignmentEditorMode,
  assignment?: LecturerModuleAssessment & { maxAttempts?: number; gradingMethod?: string }
): AssignmentEditorFormState {
  if (mode === 'edit' && assignment) {
    return {
      title: assignment.title,
      description: assignment.description ?? '',
      assignedDate: formatDateTimeLocal(assignment.assignedDate),
      deadline: formatDateTimeLocal(assignment.deadline),
      submissionRequirement: assignment.submissionRequirement ?? SUBMISSION_REQUIREMENT_OPTIONS[0],
      status: assignment.status ?? 'Draft',
      templateName: assignment.templateName ?? '',
      templateMeta: assignment.templateMeta ?? '',
      templateUrl: assignment.templateUrl ?? '',
      maxAttempts: assignment.maxAttempts?.toString() ?? '1',
      gradingMethod: assignment.gradingMethod ?? 'LATEST',
    };
  }

  return {
    title: '',
    description: '',
    assignedDate: '',
    deadline: '',
    submissionRequirement: SUBMISSION_REQUIREMENT_OPTIONS[0],
    status: 'Draft',
    templateName: '',
    templateMeta: '',
    templateUrl: '',
    maxAttempts: '1',
    gradingMethod: 'LATEST',
  };
}

function createAssignmentFormData(
  formState: AssignmentEditorFormState,
  statusOverride?: LecturerAssignmentStatus
) {
  const formData = new FormData();
  formData.set('title', formState.title);
  formData.set('description', formState.description);
  formData.set('assignedDate', formState.assignedDate);
  formData.set('deadline', formState.deadline);
  formData.set('submissionRequirement', formState.submissionRequirement);
  formData.set('status', statusOverride ?? formState.status);
  formData.set('templateName', formState.templateName);
  formData.set('templateMeta', formState.templateMeta);
  formData.set('templateUrl', formState.templateUrl);
  formData.set('maxAttempts', formState.maxAttempts);
  formData.set('gradingMethod', formState.gradingMethod);
  return formData;
}

function canSubmitAssignment(formState: AssignmentEditorFormState) {
  return Boolean(
    formState.title.trim() &&
      formState.description.trim() &&
      formState.assignedDate &&
      formState.deadline &&
      formState.submissionRequirement
  );
}

function formatSubmissionText(assignment: LecturerModuleAssessment) {
  if (assignment.status === 'Draft') {
    return assignment.deadline ? `Scheduled for ${formatDateLabel(assignment.deadline)}` : 'Draft';
  }

  return `${assignment.submittedCount ?? 0}/${assignment.studentCount ?? 0} Submitted`;
}

function formatDateLabel(dateTime: string) {
  const [date] = dateTime.split('T');
  return date;
}

function ClipboardIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M8 4h8l1 3H7l1-3Z" stroke="#003594" strokeWidth="1.8" strokeLinejoin="round" />
      <path d="M6 6h12v16H6V6Z" stroke="#003594" strokeWidth="1.8" strokeLinejoin="round" />
      <path d="M9 11h6M9 15h6" stroke="#003594" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function StudentsTinyIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M6 7a2 2 0 1 0 0-4 2 2 0 0 0 0 4Zm-3 6a3 3 0 0 1 6 0" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M11 7a1.7 1.7 0 1 0 0-3.4M10 10.5a2.8 2.8 0 0 1 3 2.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function ArrowRightIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
      <path d="M4 9h10M10 5l4 4-4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ChevronDownIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <path d="M3.5 5.5 7 9l3.5-3.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function UploadIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
      <path d="M9 12V3M5.5 6.5 9 3l3.5 3.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M4 14.5h10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function DocumentIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden="true">
      <path d="M6 2.5h8l3 3V19H6V2.5Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      <path d="M14 2.5V6h3" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      <path d="M9 11h5M9 15h4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
      <path d="m5 5 8 8M13 5l-8 8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function DraftIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
      <path d="M4 3h10v12H4V3Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      <path d="M6.5 7h5M6.5 10.5h3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function SubmitIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
      <path d="M3 9a6 6 0 0 1 10.5-4M15 9a6 6 0 0 1-10.5 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M12 4h2V2M6 14H4v2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="m7 9 1.5 1.5L12 7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

