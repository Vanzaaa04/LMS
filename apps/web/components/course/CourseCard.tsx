import React from 'react';
import { Course } from '@/lib/types/course';

interface CourseCardProps {
  course: Course;
  onClick: (course: Course) => void;
  onEnroll?: (course: Course) => void;
}

export const CourseCard: React.FC<CourseCardProps> = ({ course, onClick, onEnroll }) => {
  return (
    <article
      className="flex flex-col overflow-hidden rounded-xl border bg-white transition-shadow hover:shadow-lg cursor-pointer"
      style={{ borderColor: 'var(--color-border)' }}
      onClick={() => onClick(course)}
    >
      <div className={`relative flex h-48 w-full items-center justify-center ${course.bannerColorClass}`}>
        <span className="select-none text-6xl">{course.bannerEmoji}</span>

        <span
          className="absolute left-4 top-4 rounded px-2 py-1 text-[10px] font-bold uppercase tracking-[0.5px]"
          style={{
            background: 'rgba(248,249,250,0.9)',
            color: 'var(--color-text-primary)',
            backdropFilter: 'blur(4px)',
          }}
        >
          {course.level}
        </span>

        {course.isNew ? (
          <span
            className="absolute right-4 top-4 rounded-full px-3 py-1 text-xs font-semibold text-white"
            style={{ background: 'var(--color-brand-light)' }}
          >
            New
          </span>
        ) : null}
      </div>

      <div className="flex flex-1 flex-col justify-between p-6">
        <div>
          <div className="mb-1">
            <span
              className="inline-block rounded px-2 py-1 text-[10px] font-bold uppercase tracking-[0.5px]"
              style={{ background: 'var(--color-brand-subtle)', color: 'var(--color-text-muted)' }}
            >
              {course.category}
            </span>
          </div>

          <h3
            className="mb-1 mt-1 text-xl font-normal leading-tight"
            style={{ color: 'var(--color-text-primary)', fontFamily: "'Liberation Sans', Arial, sans-serif" }}
          >
            {course.title}
            {course.className && (
              <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-brand-primary)', marginLeft: '8px' }}>
                (Kelas {course.className})
              </span>
            )}
          </h3>

          <div className="mb-3 flex items-center gap-1">
            <PersonIcon />
            <span className="text-xs font-medium" style={{ color: 'var(--color-text-secondary)' }}>
              {course.instructorName}
            </span>
          </div>

          <div className="mb-4 flex flex-wrap items-center gap-2">
            <span
              className="inline-flex items-center rounded-full px-3 py-1 text-[11px] font-semibold"
              style={{ background: 'var(--color-brand-subtle)', color: 'var(--color-brand-primary)' }}
            >
              {course.creditHours} Credits
            </span>
          </div>

          <p className="mb-6 text-sm leading-[1.5]" style={{ color: 'var(--color-text-secondary)' }}>
            {course.description}
          </p>
        </div>

        <div className="border-t pt-4" style={{ borderColor: 'rgba(195,198,214,0.5)' }}>
          <CourseActionButton
            status={course.status}
            onContinue={() => onClick(course)}
            onEnroll={() => onEnroll?.(course)}
          />
        </div>
      </div>
    </article>
  );
};

interface CourseActionButtonProps {
  status: Course['status'];
  onContinue: () => void;
  onEnroll?: () => void;
}

const CourseActionButton: React.FC<CourseActionButtonProps> = ({ status, onContinue, onEnroll }) => {
  const requiresEnroll = status === 'notstart';

  return (
    <button
      type="button"
      className="w-full rounded py-2 text-center text-sm font-medium transition-all"
      style={
        requiresEnroll
          ? { background: 'var(--color-brand-light)', color: '#FFFFFF', border: 'none' }
          : {
              border: '1px solid var(--color-brand-primary)',
              color: 'var(--color-brand-primary)',
              background: 'transparent',
            }
      }
      onClick={(e) => {
        e.stopPropagation();
        if (requiresEnroll && onEnroll) {
          onEnroll();
        } else {
          onContinue();
        }
      }}
    >
      {requiresEnroll ? 'Enroll' : 'Continue'}
    </button>
  );
};

const PersonIcon: React.FC = () => (
  <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
    <circle cx="5" cy="3" r="2" fill="#434654" />
    <path d="M1 9c0-2.21 1.79-4 4-4s4 1.79 4 4" stroke="#434654" strokeWidth="1.2" strokeLinecap="round" />
  </svg>
);
