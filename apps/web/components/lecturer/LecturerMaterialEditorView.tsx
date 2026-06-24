'use client';

import Link from 'next/link';
import React from 'react';
import type {
  LecturerCourseModule,
  LecturerMaterialKind,
  LecturerMaterialVisibility,
  LecturerModuleMaterial,
} from '@/lib/types/course';
import type { LecturerCourse } from '@/lib/types/course';
import { LecturerBreadcrumbs } from './LecturerBreadcrumbs';
import { DeleteConfirmationDialog } from './shared/DeleteConfirmationDialog';
import {
  LECTURER_CARD_CLASSNAME,
  LECTURER_COMPACT_CONTROL_CLASSNAME,
} from './shared/lecturerUiStyles';
import { updateFormField } from './shared/updateFormField';

type MaterialEditorMode = 'create' | 'edit';
type VideoSourceMode = 'upload' | 'link';

interface MaterialEditorFormState {
  title: string;
  description: string;
  materialKind: LecturerMaterialKind;
  visibilityStatus: LecturerMaterialVisibility;
  externalUrl: string;
  videoSourceMode: VideoSourceMode;
}

interface LecturerMaterialEditorViewProps {
  mode: MaterialEditorMode;
  course: LecturerCourse;
  module: LecturerCourseModule;
  material?: LecturerModuleMaterial;
  onSave?: (data: FormData) => Promise<void>;
  onDelete?: () => Promise<void>;
}

const MATERIAL_TYPE_OPTIONS: Array<{
  label: string;
  kind: LecturerMaterialKind;
  acceptedFormats: string;
}> = [
  { label: 'Document', kind: 'document', acceptedFormats: 'PDF, PPTX, DOCX' },
  { label: 'Video', kind: 'video', acceptedFormats: 'MP4, WEBM, MOV' },
  { label: 'External Link', kind: 'link', acceptedFormats: 'URL' },
];

export function LecturerMaterialEditorView({
  mode,
  course,
  module,
  material,
  onSave,
  onDelete,
}: LecturerMaterialEditorViewProps) {
  const [formState, setFormState] = React.useState(() =>
    createInitialFormState(mode, material)
  );
  const [selectedFile, setSelectedFile] = React.useState<File | null>(null);
  const [isSaving, setIsSaving] = React.useState(false);
  const [feedbackMessage, setFeedbackMessage] = React.useState<string | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);

  const pageTitle = mode === 'create' ? 'Create Course Material' : 'Edit Course Material';
  const submitButtonLabel = mode === 'create' ? 'Create Material' : 'Save Changes';
  const returnHref = `/dosen/courses/${course.id}`;

  return (
    <>
      <div className="mx-auto w-full max-w-[1040px] px-4 py-8 sm:px-6 lg:px-8">
        <LecturerBreadcrumbs
          items={[
            { label: 'Home', href: '/dashboard_dosen' },
            { label: 'Courses', href: '/dosen/courses' },
            { label: course.title, href: returnHref },
            { label: module.orderLabel, href: returnHref },
            { label: pageTitle },
          ]}
        />

        <section className="mb-8">
          <h1
            className="text-[34px] font-bold leading-tight sm:text-[48px]"
            style={{ color: 'var(--color-text-primary)' }}
          >
            {pageTitle}
          </h1>
          <p className="mt-2 text-lg" style={{ color: 'var(--color-text-secondary)' }}>
            {module.title}
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
          className={`${LECTURER_CARD_CLASSNAME} overflow-hidden`}
          style={{ borderColor: 'var(--color-border)' }}
          onSubmit={async (event) => {
            event.preventDefault();
            setIsSaving(true);
            setFeedbackMessage(null);
            try {
              if (onSave) {
                const formData = new FormData();
                formData.append('title', formState.title);
                formData.append('description', formState.description);
                formData.append('materialKind', formState.materialKind);
                formData.append('visibilityStatus', formState.visibilityStatus);
                formData.append('externalUrl', formState.externalUrl);
                formData.append('videoSourceMode', formState.videoSourceMode);
                if (selectedFile) {
                  formData.append('file', selectedFile);
                }
                await onSave(formData);
              } else {
                setFeedbackMessage(mode === 'create' ? 'Material created locally.' : 'Material changes saved locally.');
                setIsSaving(false);
              }
            } catch (error: any) {
              console.error(error);
              setFeedbackMessage(error?.message || 'An error occurred while saving.');
              setIsSaving(false);
            }
          }}
        >
          <div className="space-y-0 px-5 py-6 sm:px-7 sm:py-7">
            <FormSection>
              <FormField label="Material Title">
                <TextInput
                  value={formState.title}
                  onChange={(value) => updateFormField('title', value, setFormState)}
                  placeholder="Enter material title"
                />
              </FormField>

              <div className="mt-7">
                <FieldLabel label="Material Type" />
                <div className="flex flex-col gap-3 md:flex-row">
                  {MATERIAL_TYPE_OPTIONS.map((option) => (
                    <MaterialTypeButton
                      key={option.kind}
                      label={option.label}
                      kind={option.kind}
                      acceptedFormats={option.acceptedFormats}
                      selected={formState.materialKind === option.kind}
                      onSelect={() => updateMaterialKind(option.kind, setFormState)}
                    />
                  ))}
                </div>
              </div>

              <div className="mt-7">
                <FormField label="Description">
                  <TextAreaInput
                    value={formState.description}
                    onChange={(value) => updateFormField('description', value, setFormState)}
                    placeholder="Write a short description for this material."
                  />
                </FormField>
              </div>
            </FormSection>

            <FormSection>
              <MaterialSourcePanel
                formState={formState}
                material={material}
                mode={mode}
                onChange={setFormState}
                selectedFile={selectedFile}
                onFileSelect={setSelectedFile}
              />
            </FormSection>

            <FormSection>
              <h2
                className="mb-4 text-[18px] font-medium"
                style={{ color: 'var(--color-text-primary)' }}
              >
                Visibility Status
              </h2>
              <div className="flex flex-wrap gap-5">
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
                Delete Material
              </button>
            ) : null}
            <Link
              href={returnHref}
              className="inline-flex h-12 items-center justify-center rounded-[14px] border px-5 text-base font-semibold no-underline transition-colors hover:bg-[#F5F8FF]"
              style={{
                borderColor: 'var(--color-brand-primary)',
                color: 'var(--color-brand-primary)',
              }}
            >
              Kembali ke Kelas
            </Link>
            <button
              type="submit"
              disabled={!canSubmitMaterial(formState) || isSaving}
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
          title="Delete Material"
          body={`This will remove "${formState.title}" from ${module.title}.`}
          confirmLabel="Delete Material"
          labelledById="delete-material-title"
          onCancel={() => setIsDeleteDialogOpen(false)}
          onConfirm={async () => {
            if (onDelete) {
              setIsSaving(true);
              try {
                await onDelete();
              } catch (error: any) {
                console.error(error);
                setFeedbackMessage(error?.message || 'An error occurred while deleting.');
                setIsSaving(false);
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

function MaterialSourcePanel({
  formState,
  material,
  mode,
  onChange,
  selectedFile,
  onFileSelect,
}: {
  formState: MaterialEditorFormState;
  material?: LecturerModuleMaterial;
  mode: MaterialEditorMode;
  onChange: React.Dispatch<React.SetStateAction<MaterialEditorFormState>>;
  selectedFile: File | null;
  onFileSelect: (file: File | null) => void;
}) {
  if (formState.materialKind === 'video') {
    return (
      <VideoSourcePanel
        formState={formState}
        material={material}
        mode={mode}
        onChange={onChange}
        selectedFile={selectedFile}
        onFileSelect={onFileSelect}
      />
    );
  }

  if (formState.materialKind === 'link') {
    return (
      <LinkSourcePanel
        externalUrl={formState.externalUrl}
        onChange={(value) => updateFormField('externalUrl', value, onChange)}
      />
    );
  }

  return (
    <DocumentSourcePanel
      material={material}
      mode={mode}
      selectedFile={selectedFile}
      onFileSelect={onFileSelect}
    />
  );
}

function DocumentSourcePanel({
  material,
  mode,
  selectedFile,
  onFileSelect,
}: {
  material?: LecturerModuleMaterial;
  mode: MaterialEditorMode;
  selectedFile: File | null;
  onFileSelect: (file: File | null) => void;
}) {
  const hasAttachedFile = mode === 'edit' && material?.fileName;
  const displayFile = selectedFile
    ? { name: selectedFile.name, meta: `${(selectedFile.size / (1024 * 1024)).toFixed(2)} MB - Selected to upload` }
    : hasAttachedFile
    ? { name: material.fileName ?? '', meta: material.fileMeta ?? 'Uploaded file' }
    : null;

  return (
    <div className="rounded-[18px] border bg-[#F4F5F7] px-5 py-5" style={{ borderColor: '#D9DDE7' }}>
      <h2 className="text-[20px] font-semibold" style={{ color: 'var(--color-text-primary)' }}>
        {displayFile ? 'Attached File' : 'Document Upload'}
      </h2>
      {displayFile ? (
        <AttachedFileCard
          fileName={displayFile.name}
          fileMeta={displayFile.meta}
          onRemove={selectedFile ? () => onFileSelect(null) : undefined}
        />
      ) : null}
      <UploadDropzone
        icon={<DocumentUploadIcon />}
        title={displayFile ? 'Drag and drop to replace file' : 'Drag and drop document files here'}
        browseText="browse your computer"
        meta="Max file size: 50MB. Supported formats: PDF, PPTX, DOCX."
        accept=".pdf,.pptx,.docx"
        onFileSelect={onFileSelect}
      />
    </div>
  );
}

function VideoSourcePanel({
  formState,
  material,
  mode,
  onChange,
  selectedFile,
  onFileSelect,
}: {
  formState: MaterialEditorFormState;
  material?: LecturerModuleMaterial;
  mode: MaterialEditorMode;
  onChange: React.Dispatch<React.SetStateAction<MaterialEditorFormState>>;
  selectedFile: File | null;
  onFileSelect: (file: File | null) => void;
}) {
  const hasAttachedVideo =
    mode === 'edit' && formState.videoSourceMode === 'upload' && material?.fileName;

  const displayFile = selectedFile
    ? { name: selectedFile.name, meta: `${(selectedFile.size / (1024 * 1024)).toFixed(2)} MB - Selected to upload` }
    : hasAttachedVideo
    ? { name: material.fileName ?? '', meta: material.fileMeta ?? 'Uploaded video' }
    : null;

  return (
    <div className="rounded-[18px] border bg-[#F4F5F7] px-5 py-5" style={{ borderColor: '#D9DDE7' }}>
      <h2 className="text-[20px] font-semibold" style={{ color: 'var(--color-text-primary)' }}>
        Video Source Details
      </h2>
      <div className="mt-6 flex border-b" style={{ borderColor: 'var(--color-border)' }}>
        <SourceTab
          selected={formState.videoSourceMode === 'upload'}
          label="Upload Video"
          onSelect={() => updateVideoSourceMode('upload', onChange)}
        />
        <SourceTab
          selected={formState.videoSourceMode === 'link'}
          label="Use Video Link"
          onSelect={() => updateVideoSourceMode('link', onChange)}
        />
      </div>
      {formState.videoSourceMode === 'upload' ? (
        <>
          {displayFile ? (
            <AttachedFileCard
              fileName={displayFile.name}
              fileMeta={displayFile.meta}
              icon={<VideoUploadIcon />}
              onRemove={selectedFile ? () => onFileSelect(null) : undefined}
            />
          ) : null}
          <UploadDropzone
            icon={<VideoUploadIcon />}
            title={displayFile ? 'Drag and drop to replace video' : 'Drag and drop video files here'}
            browseText="browse your computer"
            meta="Max file size: 500MB. Supported formats: MP4, WEBM, MOV."
            accept=".mp4,.webm,.mov"
            onFileSelect={onFileSelect}
          />
        </>
      ) : (
        <div className="mt-5">
          <FormField label="Video URL">
            <TextInput
              value={formState.externalUrl}
              onChange={(value) => updateFormField('externalUrl', value, onChange)}
              placeholder="https://youtube.com/watch?v=..."
            />
          </FormField>
        </div>
      )}
    </div>
  );
}

function LinkSourcePanel({
  externalUrl,
  onChange,
}: {
  externalUrl: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="rounded-[18px] border bg-[#F4F5F7] px-5 py-5" style={{ borderColor: '#D9DDE7' }}>
      <h2 className="text-[20px] font-semibold" style={{ color: 'var(--color-text-primary)' }}>
        Link Details
      </h2>
      <div className="mt-5">
        <FormField label="External URL">
          <TextInput
            value={externalUrl}
            onChange={onChange}
            placeholder="https://your-resource-url"
          />
        </FormField>
        <p className="mt-2 text-sm italic" style={{ color: 'var(--color-text-secondary)' }}>
          Ensure the URL includes http:// or https://
        </p>
      </div>
    </div>
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
      <FieldLabel label={label} />
      {children}
    </label>
  );
}

function FieldLabel({ label }: { label: string }) {
  return (
    <span
      className="mb-3 block text-[18px] font-medium"
      style={{ color: 'var(--color-text-primary)' }}
    >
      {label}
    </span>
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
      rows={5}
      className="w-full rounded-[14px] border px-4 py-3 text-base outline-none transition-colors focus:border-[#7DA8FF]"
      style={{
        borderColor: 'var(--color-border)',
        background: '#FFFFFF',
        color: 'var(--color-text-primary)',
      }}
    />
  );
}

function MaterialTypeButton({
  label,
  kind,
  acceptedFormats,
  selected,
  onSelect,
}: {
  label: string;
  kind: LecturerMaterialKind;
  acceptedFormats: string;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className="flex min-h-[86px] flex-1 items-start gap-3 rounded-[16px] border px-4 py-4 text-left transition-colors hover:bg-[#F5F8FF]"
      style={{
        borderColor: selected ? 'var(--color-brand-primary)' : 'var(--color-border)',
        background: selected ? '#EEF4FF' : '#FFFFFF',
        color: selected ? 'var(--color-brand-primary)' : 'var(--color-text-secondary)',
      }}
    >
      <span className="mt-0.5 shrink-0">
        <MaterialKindIcon kind={kind} />
      </span>
      <span className="min-w-0">
        <span className="block text-base font-semibold">{label}</span>
        <span className="mt-1 block text-sm" style={{ color: 'var(--color-text-secondary)' }}>
          {acceptedFormats}
        </span>
      </span>
    </button>
  );
}

function SourceTab({
  selected,
  label,
  onSelect,
}: {
  selected: boolean;
  label: string;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className="px-5 pb-3 text-base font-semibold transition-colors"
      style={{
        borderBottom: selected ? '3px solid var(--color-brand-primary)' : '3px solid transparent',
        color: selected ? 'var(--color-brand-primary)' : 'var(--color-text-secondary)',
      }}
    >
      {label}
    </button>
  );
}

function AttachedFileCard({
  fileName,
  fileMeta,
  icon = <DocumentUploadIcon />,
  onRemove,
}: {
  fileName: string;
  fileMeta: string;
  icon?: React.ReactNode;
  onRemove?: () => void;
}) {
  return (
    <div
      className="mt-5 flex items-center justify-between gap-4 rounded-[14px] border bg-white px-4 py-4"
      style={{ borderColor: 'var(--color-border)' }}
    >
      <div className="flex min-w-0 items-center gap-4">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[12px] bg-[#E7EEFF] text-[#003594]">
          {icon}
        </span>
        <div className="min-w-0">
          <p className="truncate text-base font-semibold" style={{ color: 'var(--color-text-primary)' }}>
            {fileName}
          </p>
          <p className="mt-1 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
            {fileMeta}
          </p>
        </div>
      </div>
      {onRemove ? (
        <button
          type="button"
          onClick={onRemove}
          aria-label="Remove attached file"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-colors hover:bg-[#FFF5F5]"
          style={{ color: '#D92D20' }}
        >
          <TrashIcon />
        </button>
      ) : (
        <button
          type="button"
          aria-label="Download attached file"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-colors hover:bg-[#EEF3FF]"
          style={{ color: 'var(--color-text-secondary)' }}
        >
          <DownloadIcon />
        </button>
      )}
    </div>
  );
}

function UploadDropzone({
  icon,
  title,
  browseText,
  meta,
  accept,
  onFileSelect,
}: {
  icon: React.ReactNode;
  title: string;
  browseText: string;
  meta: string;
  accept?: string;
  onFileSelect?: (file: File) => void;
}) {
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = React.useState(false);

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onFileSelect?.(e.target.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onFileSelect?.(e.dataTransfer.files[0]);
    }
  };

  return (
    <div
      onClick={handleClick}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`mt-5 flex min-h-[172px] cursor-pointer flex-col items-center justify-center rounded-[16px] border-2 border-dashed px-5 py-8 text-center transition-colors ${
        isDragOver ? 'border-[var(--color-brand-primary)] bg-[#F5F8FF]' : 'bg-white'
      }`}
      style={{ borderColor: isDragOver ? 'var(--color-brand-primary)' : '#C5CADB' }}
    >
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept={accept}
        className="hidden"
      />
      <span className="mb-3 text-[#747C8F]">{icon}</span>
      <p className="text-[18px] font-medium" style={{ color: 'var(--color-text-primary)' }}>
        {title}
      </p>
      <p className="mt-2 text-base" style={{ color: 'var(--color-text-secondary)' }}>
        or <span style={{ color: 'var(--color-brand-primary)' }}>{browseText}</span>
      </p>
      <p className="mt-3 text-sm" style={{ color: 'var(--color-text-muted)' }}>
        {meta}
      </p>
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

function createInitialFormState(
  mode: MaterialEditorMode,
  material?: LecturerModuleMaterial
): MaterialEditorFormState {
  if (mode === 'edit' && material) {
    return {
      title: material.title,
      description: material.description ?? '',
      materialKind: material.kind,
      visibilityStatus: material.visibilityStatus ?? 'Published',
      externalUrl: material.externalUrl ?? '',
      videoSourceMode: material.externalUrl ? 'link' : 'upload',
    };
  }

  return {
    title: '',
    description: '',
    materialKind: 'document',
    visibilityStatus: 'Published',
    externalUrl: '',
    videoSourceMode: 'upload',
  };
}

function updateMaterialKind(
  materialKind: LecturerMaterialKind,
  setFormState: React.Dispatch<React.SetStateAction<MaterialEditorFormState>>
) {
  setFormState((currentState) => ({
    ...currentState,
    materialKind,
    externalUrl: '',
    videoSourceMode: 'upload',
  }));
}

function updateVideoSourceMode(
  videoSourceMode: VideoSourceMode,
  setFormState: React.Dispatch<React.SetStateAction<MaterialEditorFormState>>
) {
  setFormState((currentState) => ({
    ...currentState,
    videoSourceMode,
    externalUrl: videoSourceMode === 'link' ? currentState.externalUrl : '',
  }));
}

function canSubmitMaterial(formState: MaterialEditorFormState) {
  if (!formState.title.trim() || !formState.description.trim()) {
    return false;
  }

  if (formState.materialKind === 'link') {
    return isValidExternalUrl(formState.externalUrl);
  }

  if (formState.materialKind === 'video') {
    if (formState.videoSourceMode === 'link') {
      return isValidExternalUrl(formState.externalUrl);
    }
    return true;
  }

  if (formState.materialKind === 'document') {
    return true;
  }

  return true;
}

function isValidExternalUrl(url: string) {
  return url.startsWith('http://') || url.startsWith('https://');
}

function MaterialKindIcon({ kind }: { kind: LecturerMaterialKind }) {
  if (kind === 'video') {
    return <VideoUploadIcon />;
  }

  if (kind === 'link') {
    return <LinkIcon />;
  }

  return <DocumentUploadIcon />;
}

function DocumentUploadIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden="true">
      <path d="M6 2.5h8l3 3V19H6V2.5Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      <path d="M14 2.5V6h3" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      <path d="M9 10h5M9 13.5h5M9 17h3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function VideoUploadIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M5 7h14v11H5V7Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      <path d="M7 4l2 3M12 4l2 3M17 4l2 3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function LinkIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden="true">
      <path d="M9 7.5h-2A3.5 3.5 0 0 0 7 14h2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M13 7.5h2a3.5 3.5 0 0 1 0 6.5h-2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M8.5 11h5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function DownloadIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden="true">
      <path d="M11 3v10M7 9l4 4 4-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M5 17h12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6"></polyline>
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
      <line x1="10" y1="11" x2="10" y2="17"></line>
      <line x1="14" y1="11" x2="14" y2="17"></line>
    </svg>
  );
}
