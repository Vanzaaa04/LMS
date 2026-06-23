'use client';

interface DeleteConfirmationDialogProps {
  title: string;
  body: string;
  confirmLabel: string;
  labelledById: string;
  onCancel: () => void;
  onConfirm: () => void;
}

export function DeleteConfirmationDialog({
  title,
  body,
  confirmLabel,
  labelledById,
  onCancel,
  onConfirm,
}: DeleteConfirmationDialogProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#101828]/45 px-4">
      <div
        className="w-full max-w-[460px] rounded-[28px] border bg-white p-6 shadow-[0_24px_60px_rgba(16,24,40,0.18)]"
        style={{ borderColor: 'var(--color-border)' }}
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelledById}
      >
        <div
          className="mb-5 flex h-12 w-12 items-center justify-center rounded-full"
          style={{ background: '#FEE4E2', color: '#D92D20' }}
        >
          <TrashIcon />
        </div>
        <h2
          id={labelledById}
          className="text-[24px] font-bold"
          style={{ color: 'var(--color-text-primary)' }}
        >
          {title}
        </h2>
        <p className="mt-3 text-base leading-7" style={{ color: 'var(--color-text-secondary)' }}>
          {body}
        </p>
        <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onCancel}
            className="inline-flex h-12 items-center justify-center rounded-[14px] border px-5 text-base font-semibold transition-colors hover:bg-[#F8FAFD]"
            style={{
              borderColor: 'var(--color-border)',
              color: 'var(--color-text-secondary)',
            }}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="inline-flex h-12 items-center justify-center rounded-[14px] px-5 text-base font-semibold text-white transition-opacity hover:opacity-90"
            style={{ background: '#D92D20' }}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

function TrashIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden="true">
      <path
        d="M5.5 6h11M9 6V4.5a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1V6m-8 0V17a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V6"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M9.5 10v4.5M12.5 10v4.5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}
