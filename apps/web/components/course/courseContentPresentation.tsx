import React from 'react';
import type { CourseContentItem } from '@/lib/types/course';

interface CourseContentVisualConfig {
  metaLabel: string;
  background: string;
  icon: React.ReactNode;
  miniIcon: React.ReactNode;
}

export function getCourseContentVisualConfig(type: CourseContentItem['type']): CourseContentVisualConfig {
  switch (type) {
    case 'video':
      return {
        metaLabel: 'Video',
        background: '#E9F0FF',
        icon: <PlayIcon />,
        miniIcon: <MiniVideoIcon />,
      };
    case 'document':
      return {
        metaLabel: 'PDF Reading',
        background: '#F1F3F5',
        icon: <PdfIcon />,
        miniIcon: <MiniDocumentIcon />,
      };
    case 'article':
      return {
        metaLabel: 'Article',
        background: '#F1F3F5',
        icon: <ArticleIcon />,
        miniIcon: <MiniArticleIcon />,
      };
    case 'quiz':
      return {
        metaLabel: 'Quiz',
        background: '#EEF4FF',
        icon: <QuizIcon />,
        miniIcon: <MiniArticleIcon />,
      };
    case 'assignment':
      return {
        metaLabel: 'Assignment',
        background: '#EEF4FF',
        icon: <AssignmentIcon />,
        miniIcon: <MiniArticleIcon />,
      };
    case 'lab':
      return {
        metaLabel: 'Lab',
        background: '#EEF4FF',
        icon: <LabIcon />,
        miniIcon: <MiniArticleIcon />,
      };
  }
}

export function DocumentIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
      <path d="M8 4h8l5 5v15H8V4Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      <path d="M16 4v5h5" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      <path d="M11 17h6M11 13h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export function CloseIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <path d="M4 4 14 14M14 4 4 14" stroke="#434654" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function PlayIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
      <circle cx="14" cy="14" r="12" stroke="#003594" strokeWidth="2" />
      <path d="m12 10 7 4-7 4v-8Z" fill="#003594" />
    </svg>
  );
}

function PdfIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
      <path d="M9 4h7l5 5v15H9V4Z" stroke="#434654" strokeWidth="2" strokeLinejoin="round" />
      <path d="M16 4v5h5" stroke="#434654" strokeWidth="2" strokeLinejoin="round" />
      <path d="M12 18h5" stroke="#434654" strokeWidth="2" strokeLinecap="round" />
      <path d="M12 14h3" stroke="#434654" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function ArticleIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
      <rect x="6" y="4" width="16" height="20" rx="2" stroke="#434654" strokeWidth="2" />
      <path d="M11 10h6M11 14h8M11 18h8" stroke="#434654" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function QuizIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
      <circle cx="14" cy="14" r="10" stroke="#003594" strokeWidth="2" />
      <path d="M11.5 11a2.5 2.5 0 0 1 5 0c0 2-2.5 2-2.5 4" stroke="#003594" strokeWidth="2" strokeLinecap="round" />
      <circle cx="14" cy="20" r="1.2" fill="#003594" />
    </svg>
  );
}

function AssignmentIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
      <rect x="7" y="5" width="14" height="18" rx="2" stroke="#003594" strokeWidth="2" />
      <path d="M11 11h6M11 15h6M11 19h4" stroke="#003594" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function LabIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
      <path d="M11 5v4l-5 8.5A3 3 0 0 0 8.6 22h10.8a3 3 0 0 0 2.6-4.5L17 9V5" stroke="#003594" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M10 14h8" stroke="#003594" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function MiniVideoIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.4" />
      <path d="m6.6 5.3 4 2.7-4 2.7V5.3Z" fill="currentColor" />
    </svg>
  );
}

function MiniDocumentIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M4 2.5h5l3 3v8H4v-11Z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
      <path d="M9 2.5v3h3" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
    </svg>
  );
}

function MiniArticleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <rect x="3" y="2" width="10" height="12" rx="1.5" stroke="currentColor" strokeWidth="1.4" />
      <path d="M5.5 5.5h5M5.5 8h5M5.5 10.5h4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}
