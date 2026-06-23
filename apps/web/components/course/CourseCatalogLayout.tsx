'use client';

import React from 'react';
import Link from 'next/link';
import { CourseCard } from '@/components/course/CourseCard';
import { CourseFilters, type CategoryOption } from '@/components/course/CourseFilters';
import { CoursePagination } from '@/components/course/CoursePagination';
import { COURSE_CATALOG_HREF } from '@/lib/courseNavigation';
import type { Course, CourseLevel } from '@/lib/types/course';

interface CourseCatalogLayoutProps {
  title: string;
  description: string;
  currentBreadcrumb: string;
  courses: Course[];
  selectedCategory: CategoryOption;
  selectedLevel: 'All' | CourseLevel;
  currentPage: number;
  totalPages: number;
  emptyState: React.ReactNode;
  onCategoryChange: (category: CategoryOption) => void;
  onLevelChange: (level: 'All' | CourseLevel) => void;
  onPageChange: (page: number) => void;
  onResetFilters: () => void;
  onCourseClick: (course: Course) => void;
  onEnroll: (course: Course) => void;
}

export function CourseCatalogLayout({
  title,
  description,
  currentBreadcrumb,
  courses,
  selectedCategory,
  selectedLevel,
  currentPage,
  totalPages,
  emptyState,
  onCategoryChange,
  onLevelChange,
  onPageChange,
  onResetFilters,
  onCourseClick,
  onEnroll,
}: CourseCatalogLayoutProps) {
  return (
    <div className="mx-auto w-full max-w-[1200px] px-4 py-6 sm:px-6 sm:py-8">
      <CatalogBreadcrumb currentLabel={currentBreadcrumb} />

      <header className="mb-8 border-b pb-8" style={{ borderColor: 'var(--color-border)' }}>
        <h1
          className="mb-2 text-2xl font-bold tracking-[-0.8px] sm:text-3xl lg:text-[40px] lg:leading-[48px]"
          style={{ color: 'var(--color-text-primary)', fontFamily: "'Liberation Sans', Arial, sans-serif" }}
        >
          {title}
        </h1>
        <p
          className="text-sm sm:text-lg"
          style={{ color: 'var(--color-text-secondary)', fontFamily: "'Liberation Sans', Arial, sans-serif" }}
        >
          {description}
        </p>
      </header>

      <CourseFilters
        selectedCategory={selectedCategory}
        onCategoryChange={onCategoryChange}
        selectedLevel={selectedLevel}
        onLevelChange={onLevelChange}
        onResetFilters={onResetFilters}
      />

      {courses.length > 0 ? (
        <>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 sm:gap-6 xl:grid-cols-3 lg:gap-8">
            {courses.map((course) => (
              <CourseCard
                key={course.id}
                course={course}
                onClick={onCourseClick}
                onEnroll={onEnroll}
              />
            ))}
          </div>

          <CoursePagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={onPageChange}
          />
        </>
      ) : (
        emptyState
      )}
    </div>
  );
}

function CatalogBreadcrumb({ currentLabel }: { currentLabel: string }) {
  return (
    <nav className="mb-6 flex flex-wrap items-center gap-2 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
      <Link href="/dashboard_mahasiswa" className="transition-opacity hover:opacity-70">
        Home
      </Link>
      <span>&rsaquo;</span>
      {currentLabel === 'Courses' ? (
        <span style={{ color: 'var(--color-text-primary)' }}>Courses</span>
      ) : (
        <>
          <Link href={COURSE_CATALOG_HREF} className="transition-opacity hover:opacity-70">
            Courses
          </Link>
          <span>&rsaquo;</span>
          <span style={{ color: 'var(--color-text-primary)' }}>{currentLabel}</span>
        </>
      )}
    </nav>
  );
}

