'use client';

import React, { useState, useRef, useEffect } from 'react';
import { CourseLevel } from '@/lib/types/course';

export const CATEGORY_OPTIONS = ['All', 'Computer Science', 'Mathematics', 'Physics', 'Data Science', 'Literature', 'History'] as const;
export type CategoryOption = typeof CATEGORY_OPTIONS[number];

export const LEVEL_OPTIONS: Array<'All' | CourseLevel> = ['All', 'Beginner', 'Intermediate', 'Advanced'];

interface CourseFiltersProps {
  selectedCategory: CategoryOption;
  onCategoryChange: (category: CategoryOption) => void;
  selectedLevel: 'All' | CourseLevel;
  onLevelChange: (level: 'All' | CourseLevel) => void;
  onResetFilters: () => void;
}

/**
 * CourseFilters — two dropdown buttons (Category, Level) with a reset link.
 * Matches the Figma filter bar layout.
 */
export const CourseFilters: React.FC<CourseFiltersProps> = ({
  selectedCategory,
  onCategoryChange,
  selectedLevel,
  onLevelChange,
  onResetFilters,
}) => {
  return (
    <div className="mb-8 flex flex-wrap items-center gap-3">
      <DropdownFilter
        label="Category"
        value={selectedCategory}
        options={[...CATEGORY_OPTIONS]}
        onChange={(v) => onCategoryChange(v as CategoryOption)}
        icon={<CategoryIcon />}
      />

      <DropdownFilter
        label="Level"
        value={selectedLevel}
        options={LEVEL_OPTIONS}
        onChange={(v) => onLevelChange(v as 'All' | CourseLevel)}
        icon={<LevelIcon />}
      />

      <div className="flex-1" />

      <button
        onClick={onResetFilters}
        className="text-sm font-semibold transition-opacity hover:opacity-70"
        style={{ color: 'var(--color-brand-primary)' }}
      >
        Reset Filters
      </button>
    </div>
  );
};

/* ── DropdownFilter sub-component ── */

interface DropdownFilterProps {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
  icon: React.ReactNode;
}

const DropdownFilter: React.FC<DropdownFilterProps> = ({ label, value, options, onChange, icon }) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const displayLabel = value === 'All' ? label : value;

  return (
    <div ref={containerRef} className="relative">
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-semibold transition-colors hover:border-gray-400"
        style={{
          background: 'var(--color-bg-input)',
          borderColor: 'var(--color-border)',
          color: 'var(--color-text-primary)',
          height: '38px',
        }}
      >
        {icon}
        <span>{displayLabel}</span>
        <ChevronDownIcon />
      </button>

      {isOpen && (
        <div
          className="absolute top-full left-0 mt-2 z-50 flex flex-col gap-3 rounded-xl border shadow-xl p-4 min-w-[200px]"
          style={{ background: 'var(--color-bg-white)', borderColor: 'var(--color-border)' }}
        >
          <p className="text-[10px] font-bold uppercase tracking-[0.6px]" style={{ color: 'var(--color-text-secondary)' }}>
            Select {label}
          </p>
          <div className="flex flex-col gap-2">
            {options.map((option) => (
              <label key={option} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name={label}
                  value={option}
                  checked={value === option}
                  onChange={() => { onChange(option); setIsOpen(false); }}
                  className="w-4 h-4 rounded"
                  style={{ accentColor: 'var(--color-brand-primary)' }}
                />
                <span className="text-sm font-medium" style={{ color: 'var(--color-text-secondary)' }}>
                  {option}
                </span>
              </label>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

/* ── Inline icons ── */

const CategoryIcon: React.FC = () => (
  <svg width="16" height="17" viewBox="0 0 16 17" fill="none">
    <rect width="6" height="6" rx="1" fill="currentColor" />
    <rect x="10" width="6" height="6" rx="1" fill="currentColor" />
    <rect y="10" width="6" height="6" rx="1" fill="currentColor" />
    <rect x="10" y="10" width="6" height="6" rx="1" fill="currentColor" />
  </svg>
);

const LevelIcon: React.FC = () => (
  <svg width="13" height="14" viewBox="0 0 13 14" fill="none">
    <rect x="0" y="9" width="3" height="5" rx="1" fill="currentColor" />
    <rect x="5" y="5" width="3" height="9" rx="1" fill="currentColor" />
    <rect x="10" y="0" width="3" height="14" rx="1" fill="currentColor" />
  </svg>
);

const ChevronDownIcon: React.FC = () => (
  <svg width="9" height="6" viewBox="0 0 9 6" fill="none">
    <path d="M1 1l3.5 3.5L8 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);
