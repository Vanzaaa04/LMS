'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { CourseCatalogLayout } from '@/components/course/CourseCatalogLayout';
import { useCourses } from '@/hooks/useCourses';
import { buildCourseDetailHref } from '@/lib/courseNavigation';
import type { Course } from '@/lib/types/course';

interface MyCoursesCatalogViewProps {
  courses: Course[];
  searchQuery: string;
}

export function MyCoursesCatalogView({ courses, searchQuery }: MyCoursesCatalogViewProps) {
  const router = useRouter();
  const courseFilters = useCourses(courses, searchQuery);

  const visibleCourses = React.useMemo(() => {
    return courseFilters.paginatedCourses.map((course) =>
      course.status === 'notstart'
        ? { ...course, status: 'ongoing' as const, progressPercentage: 0 }
        : course
    );
  }, [courseFilters.paginatedCourses]);

  const handleCourseClick = (course: Course) => {
    router.push(buildCourseDetailHref(course.id, 'my-courses'));
  };

  return (
    <CourseCatalogLayout
      title="My Courses"
      description="Courses you are actively enrolled in and ready to continue."
      currentBreadcrumb="My Courses"
      courses={visibleCourses}
      selectedCategory={courseFilters.selectedCategory}
      selectedLevel={courseFilters.selectedLevel}
      currentPage={courseFilters.currentPage}
      totalPages={courseFilters.totalPages}
      emptyState={<MyCoursesEmptyState />}
      onCategoryChange={courseFilters.setSelectedCategory}
      onLevelChange={courseFilters.setSelectedLevel}
      onPageChange={courseFilters.setCurrentPage}
      onResetFilters={courseFilters.resetFilters}
      onCourseClick={handleCourseClick}
      onEnroll={() => undefined}
    />
  );
}

function MyCoursesEmptyState() {
  return (
    <div className="rounded-[22px] border bg-white px-6 py-16 text-center" style={{ borderColor: 'var(--color-border)' }}>
      <h2 className="text-xl font-semibold" style={{ color: 'var(--color-text-primary)' }}>
        No enrolled courses found
      </h2>
      <p className="mt-2 text-sm mb-6" style={{ color: 'var(--color-text-secondary)' }}>
        Enroll in a course from the main course catalog to see it here.
      </p>
      <Link 
        href="/courses" 
        className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 shadow-sm"
      >
        Lihat Katalog Kelas
      </Link>
    </div>
  );
}
