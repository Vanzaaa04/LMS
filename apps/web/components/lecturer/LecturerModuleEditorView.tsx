'use client';

import Link from 'next/link';
import React from 'react';
import type {
  LecturerCourseModule,
} from '@/lib/types/course';
import type { LecturerCourse } from '@/lib/types/course';
import { LecturerBreadcrumbs } from './LecturerBreadcrumbs';
import { DeleteConfirmationDialog } from './shared/DeleteConfirmationDialog';
import {
  LECTURER_CARD_CLASSNAME,
  LECTURER_LARGE_CONTROL_CLASSNAME,
} from './shared/lecturerUiStyles';
import { updateFormField } from './shared/updateFormField';

type ModuleEditorMode = 'create' | 'edit';
type ModuleVisibilityStatus = 'Published' | 'Draft';

interface ModuleEditorFormState {
  title: string;
  description: string;
  sequence: string;
  durationWeeks: string;
  visibilityStatus: ModuleVisibilityStatus;
}

interface LecturerModuleEditorViewProps {
  mode: ModuleEditorMode;
  course: LecturerCourse;
  termLabel: string;
  moduleCount: number;
  module?: LecturerCourseModule;
  onSave?: (data: ModuleEditorFormState) => Promise<void>;
  onDelete?: () => Promise<void>;
}

const MODULE_DURATION_OPTIONS = ['1', '2', '3', '4', '5'];

export function LecturerModuleEditorView({
  mode,
  course,
  termLabel,
  moduleCount,
  module,
  onSave,
  onDelete,
}: LecturerModuleEditorViewProps) {
  const [formState, setFormState] = React.useState<ModuleEditorFormState>(() =>
    createInitialFormState(mode, moduleCount, module)
  );
  const [feedbackMessage, setFeedbackMessage] = React.useState<string | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);
  const [isSaving, setIsSaving] = React.useState(false);
  const [isDeleting, setIsDeleting] = React.useState(false);

  const pageTitle = mode === 'create' ? 'Create New Module' : 'Edit Module';
  const submitButtonLabel = mode === 'create' ? 'Create Module' : 'Save Changes';

  return (
    <>
      <div className="mx-auto w-full max-w-[1120px] px-4 py-8 sm:px-6 lg:px-8">
        <LecturerBreadcrumbs
          items={[
            { label: 'Home', href: '/dashboard_dosen' },
            { label: 'Courses', href: '/dosen/courses' },
            { label: course.title, href: `/dosen/courses/${course.id}` },
            { label: pageTitle },
          ]}
        />

        <section className="mb-8">
          <p className="text-lg" style={{ color: 'var(--color-text-secondary)' }}>
            {course.code} - {termLabel}
          </p>
          <h1
            className="mt-3 text-[34px] font-bold leading-tight sm:text-[48px]"
            style={{ color: 'var(--color-text-primary)' }}
          >
            {pageTitle}
          </h1>
          <p
            className="mt-3 max-w-[820px] text-lg leading-8"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            {getPageDescription(mode)}
          </p>
        </section>

        {feedbackMessage ? (
          <div
            className="mb-6 rounded-[18px] border px-5 py-4 text-sm sm:text-base"
            style={{
              borderColor: '#B7D1FF',
              background: '#EEF4FF',
              color: 'var(--color-brand-primary)',
            }}
          >
            {feedbackMessage}
          </div>
        ) : null}

        <form
          className={`${LECTURER_CARD_CLASSNAME} overflow-visible`}
          style={{ borderColor: 'var(--color-border)' }}
          onSubmit={async (event) => {
            event.preventDefault();
            if (onSave) {
              setIsSaving(true);
              try {
                await onSave(formState);
              } catch (error) {
                console.error(error);
                setFeedbackMessage('An error occurred while saving.');
                setIsSaving(false);
              }
            } else {
              setFeedbackMessage(getFeedbackMessage(mode));
            }
          }}
        >
          <div className="space-y-0 px-5 py-6 sm:px-7 sm:py-7">
            <FormSection>
              <FormField label="Module Title *">
                <TextInput
                  value={formState.title}
                  onChange={(value) => updateFormField('title', value, setFormState)}
                  placeholder="e.g., Introduction to Neural Networks"
                />
              </FormField>

              <div className="mt-8">
                <FormField
                  label="Description / Learning Objectives *"
                  helperText="Outline what students will learn in this module."
                >
                  <TextAreaInput
                    value={formState.description}
                    onChange={(value) => updateFormField('description', value, setFormState)}
                    placeholder="By the end of this module, students will be able to..."
                  />
                </FormField>
              </div>
            </FormSection>

            <FormSection>
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <FormField label="Sequence / Order">
                  <SelectInput
                    value={formState.sequence}
                    onChange={(value) => updateFormField('sequence', value, setFormState)}
                    options={buildSequenceOptions(moduleCount, mode === 'edit')}
                  />
                </FormField>
                <FormField label="Module Duration (Weeks)">
                  <SelectInput
                    value={formState.durationWeeks}
                    onChange={(value) => updateFormField('durationWeeks', value, setFormState)}
                    options={MODULE_DURATION_OPTIONS}
                  />
                </FormField>
              </div>
            </FormSection>

            <FormSection>
              <div>
                <h2
                  className="mb-5 text-[18px] font-bold"
                  style={{ color: 'var(--color-text-primary)' }}
                >
                  Visibility Status
                </h2>
                <div className="space-y-4">
                  <SimpleRadioOption
                    checked={formState.visibilityStatus === 'Published'}
                    label="Published"
                    onSelect={() =>
                      updateFormField('visibilityStatus', 'Published', setFormState)
                    }
                  />
                  <SimpleRadioOption
                    checked={formState.visibilityStatus === 'Draft'}
                    label="Draft"
                    onSelect={() => updateFormField('visibilityStatus', 'Draft', setFormState)}
                  />
                </div>
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
                Delete Module
              </button>
            ) : null}
            <Link
              href={`/dosen/courses/${course.id}`}
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
              disabled={!canSubmitModule(formState) || isSaving}
              className="inline-flex h-12 items-center justify-center rounded-[14px] px-5 text-base font-semibold text-white transition-opacity disabled:cursor-not-allowed disabled:opacity-45"
              style={{ background: 'var(--color-brand-primary)' }}
            >
              {isSaving ? 'Saving...' : submitButtonLabel}
            </button>
          </div>
        </form>
      </div>

      {isDeleteDialogOpen ? (
        <DeleteConfirmationDialog
          title="Delete Module"
          body={`This will remove "${formState.title}" from ${course.title}.`}
          confirmLabel={isDeleting ? 'Deleting...' : 'Delete Module'}
          labelledById="delete-module-title"
          onCancel={() => setIsDeleteDialogOpen(false)}
          onConfirm={async () => {
            if (onDelete) {
              setIsDeleting(true);
              try {
                await onDelete();
              } catch (error) {
                console.error(error);
                setFeedbackMessage('An error occurred while deleting.');
                setIsDeleting(false);
                setIsDeleteDialogOpen(false);
              }
            } else {
              setIsDeleteDialogOpen(false);
            }
          }}
        />
      ) : null}
    </>
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
  helperText,
  children,
}: {
  label: string;
  helperText?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span
        className="mb-3 block text-[18px] font-bold"
        style={{ color: 'var(--color-text-primary)' }}
      >
        {label}
      </span>
      {helperText ? (
        <span
          className="mb-4 block text-base leading-7"
          style={{ color: 'var(--color-text-secondary)' }}
        >
          {helperText}
        </span>
      ) : null}
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
      className={LECTURER_LARGE_CONTROL_CLASSNAME}
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
      className="w-full rounded-[16px] border px-5 py-4 text-base outline-none transition-colors focus:border-[#7DA8FF]"
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
        className={`${LECTURER_LARGE_CONTROL_CLASSNAME} appearance-none pr-12`}
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
        className="pointer-events-none absolute right-5 top-1/2 -translate-y-1/2"
        style={{ color: 'var(--color-text-secondary)' }}
      >
        <SelectChevronIcon />
      </span>
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
    <button
      type="button"
      onClick={onSelect}
      className="flex items-center gap-4 text-left"
    >
      <span
        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border"
        style={{
          borderColor: checked ? 'var(--color-brand-primary)' : 'var(--color-border)',
          background: '#FFFFFF',
        }}
      >
        {checked ? <SimpleRadioCheckIcon /> : null}
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

function createInitialFormState(
  mode: ModuleEditorMode,
  moduleCount: number,
  module?: LecturerCourseModule
): ModuleEditorFormState {
  if (mode === 'edit' && module) {
    return {
      title: module.title,
      description: module.description ?? '',
      sequence: module.orderLabel,
      durationWeeks: String(module.durationWeeks ?? 1),
      visibilityStatus: module.status === 'Published' ? 'Published' : 'Draft',
    };
  }

  return {
    title: '',
    description: '',
    sequence: `Module ${moduleCount + 1} (End of current list)`,
    durationWeeks: '1',
    visibilityStatus: 'Draft',
  };
}

function buildSequenceOptions(moduleCount: number, isEditMode: boolean) {
  const sequenceOptions = Array.from({ length: moduleCount }, (_, index) => `Module ${index + 1}`);

  if (isEditMode) {
    return sequenceOptions;
  }

  return [...sequenceOptions, `Module ${moduleCount + 1} (End of current list)`];
}

function canSubmitModule(formState: ModuleEditorFormState) {
  return Boolean(formState.title.trim() && formState.description.trim());
}

function getPageDescription(mode: ModuleEditorMode) {
  return mode === 'create'
    ? 'Add a new module to organize course content, materials, and assessments.'
    : 'Update the module structure, learning objectives, duration, and visibility before students access the content.';
}

function getFeedbackMessage(mode: ModuleEditorMode) {
  return mode === 'create'
    ? 'New module data is prepared locally. Connect this form to the backend create endpoint when it is ready.'
    : 'Module changes are saved locally. Connect this form to the backend update endpoint when it is ready.';
}

function SimpleRadioCheckIcon() {
  return (
    <span
      className="block h-3.5 w-3.5 rounded-full"
      style={{ background: 'var(--color-brand-primary)' }}
      aria-hidden="true"
    />
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

