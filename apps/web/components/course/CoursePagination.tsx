import React from 'react';

interface CoursePaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const MAX_VISIBLE_PAGES = 3;

/**
 * CoursePagination — matches Figma pagination style:
 * Prev chevron | page numbers | ellipsis | Next chevron
 * Active page uses filled brand-primary style.
 */
export const CoursePagination: React.FC<CoursePaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
}) => {
  if (totalPages <= 1) return null;

  const visiblePages = Array.from(
    { length: Math.min(MAX_VISIBLE_PAGES, totalPages) },
    (_, i) => i + 1
  );

  const showEllipsis = totalPages > MAX_VISIBLE_PAGES;

  return (
    <div className="flex items-center justify-center gap-2 pt-8">
      {/* Previous button */}
      <PaginationButton
        onClick={() => onPageChange(Math.max(1, currentPage - 1))}
        disabled={currentPage === 1}
        aria-label="Previous page"
      >
        <ChevronLeftIcon />
      </PaginationButton>

      {/* Page number buttons */}
      {visiblePages.map((page) => (
        <PaginationButton
          key={page}
          onClick={() => onPageChange(page)}
          isActive={currentPage === page}
          aria-label={`Page ${page}`}
        >
          {page}
        </PaginationButton>
      ))}

      {/* Ellipsis for additional pages */}
      {showEllipsis && (
        <span
          className="w-10 h-10 flex items-center justify-center text-sm"
          style={{ color: 'var(--color-text-secondary)' }}
        >
          ...
        </span>
      )}

      {/* Next button */}
      <PaginationButton
        onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
        disabled={currentPage === totalPages}
        aria-label="Next page"
      >
        <ChevronRightIcon />
      </PaginationButton>
    </div>
  );
};

/* ── PaginationButton sub-component ── */

interface PaginationButtonProps {
  children: React.ReactNode;
  onClick: () => void;
  isActive?: boolean;
  disabled?: boolean;
  'aria-label'?: string;
}

const PaginationButton: React.FC<PaginationButtonProps> = ({
  children,
  onClick,
  isActive = false,
  disabled = false,
  'aria-label': ariaLabel,
}) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      className="w-10 h-10 flex items-center justify-center rounded text-sm transition-all"
      style={
        isActive
          ? { background: 'var(--color-brand-dark)', color: '#FFFFFF', border: 'none' }
          : {
              border: '1px solid var(--color-border)',
              color: 'var(--color-text-primary)',
              background: 'transparent',
              opacity: disabled ? 0.5 : 1,
            }
      }
    >
      {children}
    </button>
  );
};

/* ── Icons ── */

const ChevronLeftIcon: React.FC = () => (
  <svg width="8" height="13" viewBox="0 0 8 13" fill="none">
    <path d="M7 1L1 6.5L7 12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const ChevronRightIcon: React.FC = () => (
  <svg width="8" height="13" viewBox="0 0 8 13" fill="none">
    <path d="M1 1L7 6.5L1 12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
