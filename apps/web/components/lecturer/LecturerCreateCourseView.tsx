'use client';

import React from 'react';
import Link from 'next/link';
import { LecturerBreadcrumbs } from './LecturerBreadcrumbs';
import { buildApiUrl } from '@/lib/api/apiConfig';
import './LecturerCreateCourseView.css';

type PublishingMode = 'draft' | 'published';
type TeachingFormat = 'Teori dan Praktikum' | 'Teori' | 'Lainnya';

interface CourseDraftFormState {
  title: string;
  department: string;
  semester: string;
  credits: string;
  teachingFormat: TeachingFormat;
  durationWeeks: string;
  enrollmentCap: string;
  description: string;
  includeStarterModule: boolean;
  targetSemester: string;
  targetAngkatan: string;
}

const CREDIT_OPTIONS = ['2', '3', '4'];
const TEACHING_FORMAT_OPTIONS: TeachingFormat[] = [
  'Teori dan Praktikum',
  'Teori',
  'Lainnya',
];

const INITIAL_FORM_STATE: CourseDraftFormState = {
  title: '',
  department: 'Computer Science',
  semester: '',
  credits: '3',
  teachingFormat: 'Teori dan Praktikum',
  durationWeeks: '12',
  enrollmentCap: '60',
  description: '',
  includeStarterModule: true,
  targetSemester: '1',
  targetAngkatan: '',
};

export function LecturerCreateCourseView() {
  const [draft, setDraft] = React.useState(INITIAL_FORM_STATE);
  const [feedbackMessage, setFeedbackMessage] = React.useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = React.useState(false);

  if (isSubmitted) {
    return (
      <div className="create-course-wrapper dashboard-content">
        <LecturerBreadcrumbs
          items={[
            { label: 'Home', href: '/dashboard_dosen' },
            { label: 'Courses', href: '/dosen/courses' },
            { label: 'Create Course' },
          ]}
        />
        <div className="form-card" style={{ padding: '60px 20px', textAlign: 'center', marginTop: '32px' }}>
          <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: '#E8F5E9', color: '#4CAF50', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
          </div>
          <h2 style={{ fontSize: '28px', color: 'var(--primary)', marginBottom: '16px' }}>Course Created Successfully!</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '32px', fontSize: '16px' }}>
            Your new course <strong>{draft.title}</strong> has been created.
          </p>
          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
            <Link href="/dosen/courses" className="btn-draft" style={{ textDecoration: 'none' }}>
              Back to Courses
            </Link>
            <button
              onClick={() => {
                setDraft(INITIAL_FORM_STATE);
                setIsSubmitted(false);
                setFeedbackMessage(null);
                window.scrollTo(0, 0);
              }}
              className="btn-submit"
            >
              Create Another Course
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="create-course-wrapper dashboard-content">
      <LecturerBreadcrumbs
        items={[
          { label: 'Home', href: '/dashboard_dosen' },
          { label: 'Courses', href: '/dosen/courses' },
          { label: 'Create Course' },
        ]}
      />

      <section className="create-course-header">
        <div className="header-text">
          <h1>Create New Course</h1>
          <p>
            Fill in the course identity, delivery plan, and publishing setup before the backend generates the course code and saves the data.
          </p>
        </div>

        <Link
          href="/dosen/courses"
          className="btn-back"
        >
          Back to Courses
        </Link>
      </section>

      {feedbackMessage ? (
        <div className="feedback-msg">
          {feedbackMessage}
        </div>
      ) : null}

      <form
        className="form-card"
        onSubmit={(event) => event.preventDefault()}
      >
        <div className="form-body">
          <FormSection title="Course Information">
            <div className="grid-cols-1 md:grid-cols-2">
              <FormField label="Course Title">
                <TextInput
                  value={draft.title}
                  onChange={(value) => updateDraftField('title', value, setDraft)}
                  placeholder="Enter course title"
                />
              </FormField>
              <FormField label="Semester Label (Descriptive)">
                <TextInput
                  value={draft.semester}
                  onChange={(value) => updateDraftField('semester', value, setDraft)}
                  placeholder="Contoh: Ganjil 2026/2027"
                />
              </FormField>
              <FormField label="Credits">
                <SelectInput
                  value={draft.credits}
                  onChange={(value) => updateDraftField('credits', value, setDraft)}
                  options={CREDIT_OPTIONS}
                />
              </FormField>
              <FormField label="Target Semester Mahasiswa (1-8)">
                <SelectInput
                  value={draft.targetSemester}
                  onChange={(value) => updateDraftField('targetSemester', value, setDraft)}
                  options={['1', '2', '3', '4', '5', '6', '7', '8']}
                />
              </FormField>
              <FormField label="Target Angkatan Mahasiswa (Opsional)">
                <TextInput
                  value={draft.targetAngkatan}
                  onChange={(value) => updateDraftField('targetAngkatan', value, setDraft)}
                  placeholder="Contoh: 2024 (kosongkan jika untuk semua angkatan)"
                />
              </FormField>
            </div>
          </FormSection>

          <FormSection title="Delivery Setup">
            <div className="grid-cols-1 md:grid-cols-3">
              <FormField label="Teaching Format">
                <SelectInput
                  value={draft.teachingFormat}
                  onChange={(value) =>
                    updateDraftField('teachingFormat', value as TeachingFormat, setDraft)
                  }
                  options={TEACHING_FORMAT_OPTIONS}
                />
              </FormField>
              <FormField label="Duration (weeks)">
                <TextInput
                  value={draft.durationWeeks}
                  onChange={(value) => updateDraftField('durationWeeks', value, setDraft)}
                  placeholder="12"
                />
              </FormField>
              <FormField label="Enrollment Cap">
                <TextInput
                  value={draft.enrollmentCap}
                  onChange={(value) => updateDraftField('enrollmentCap', value, setDraft)}
                  placeholder="60"
                />
              </FormField>
            </div>
          </FormSection>

          <FormSection title="Description">
            <FormField label="Course Overview">
              <TextAreaInput
                value={draft.description}
                onChange={(value) => updateDraftField('description', value, setDraft)}
                placeholder="Describe the course scope and expected student outcomes."
              />
            </FormField>
          </FormSection>

          <div className="create-course-section">
            <h2 className="create-course-section-title">Initial Course Options</h2>
            <div className="grid-cols-1">
              <CheckboxRow
                checked={draft.includeStarterModule}
                label="Generate a starter module outline"
                onToggle={() => toggleDraftFlag('includeStarterModule', setDraft)}
              />
            </div>
          </div>
        </div>

        <div className="form-actions">
          <button
            type="button"
            onClick={() => {
              setFeedbackMessage('Course draft is saved locally. You can continue preparing modules and materials.');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="btn-draft"
          >
            Save Draft
          </button>
          <button
            type="button"
            onClick={async () => {
              try {
                const token = sessionStorage.getItem('token');
                const userRaw = sessionStorage.getItem('user');
                if (!token || !userRaw) throw new Error("Sesi Anda tidak valid. Silakan login ulang.");
                const user = JSON.parse(userRaw);
                
                const response = await fetch(buildApiUrl('/courses'), {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                  },
                  body: JSON.stringify({
                    title: draft.title,
                    description: draft.description,
                    credits: Number(draft.credits),
                    department: draft.department,
                    semester: draft.semester,
                    teachingFormat: draft.teachingFormat,
                    enrollmentCap: Number(draft.enrollmentCap),
                    targetSemester: Number(draft.targetSemester),
                    targetAngkatan: draft.targetAngkatan ? Number(draft.targetAngkatan) : null,
                    instructorId: user.id
                  })
                });
                
                if (!response.ok) {
                  throw new Error("Gagal membuat mata kuliah.");
                }
                
                setIsSubmitted(true);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              } catch (err: any) {
                setFeedbackMessage(err.message || "Terjadi kesalahan saat menyimpan kelas.");
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }
            }}
            disabled={!canCreateCourse(draft)}
            className="btn-submit"
          >
            Create Course
          </button>
        </div>
      </form>
    </div>
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
    <section className="create-course-section">
      <h2 className="create-course-section-title">
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
    <label className="form-field">
      <span className="field-label">
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
      className="input-control"
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
    <div className="select-wrapper">
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="input-control select-control"
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
      <span className="select-icon">
        <SelectChevronIcon />
      </span>
    </div>
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
      rows={5}
      className="textarea-control"
    />
  );
}

function CheckboxRow({
  checked,
  label,
  onToggle,
}: {
  checked: boolean;
  label: string;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={`checkbox-row ${checked ? 'checked' : ''}`}
    >
      <span className="checkbox-box">
        {checked ? <CheckIcon /> : null}
      </span>
      <span className="checkbox-label">
        {label}
      </span>
    </button>
  );
}

function updateDraftField<K extends keyof CourseDraftFormState>(
  key: K,
  value: CourseDraftFormState[K],
  setDraft: React.Dispatch<React.SetStateAction<CourseDraftFormState>>
) {
  setDraft((currentDraft) => ({
    ...currentDraft,
    [key]: value,
  }));
}

function toggleDraftFlag(
  key: 'includeStarterModule',
  setDraft: React.Dispatch<React.SetStateAction<CourseDraftFormState>>
) {
  setDraft((currentDraft) => ({
    ...currentDraft,
    [key]: !currentDraft[key],
  }));
}



function canCreateCourse(draft: CourseDraftFormState) {
  return Boolean(
    draft.title.trim() &&
      draft.department.trim() &&
      draft.description.trim() &&
      draft.durationWeeks.trim() &&
      draft.enrollmentCap.trim()
  );
}

function CheckIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
      <path
        d="m2.5 6 2 2L9.5 3"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
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

