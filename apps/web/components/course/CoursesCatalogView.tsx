'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { CourseCatalogLayout } from '@/components/course/CourseCatalogLayout';
import { EnrollModal } from '@/components/course/EnrollModal';
import { useCourses } from '@/hooks/useCourses';
import { isCourseEnrolled } from '@/lib/courseEnrollment';
import { buildCourseDetailHref } from '@/lib/courseNavigation';
import type { Course } from '@/lib/types/course';
import { useEnrollmentStore } from '@/lib/stores/useEnrollmentStore';

interface CoursesCatalogViewProps {
  courses: Course[];
  searchQuery: string;
}

export function CoursesCatalogView({ courses, searchQuery }: CoursesCatalogViewProps) {
  const router = useRouter();
  const [enrollCourse, setEnrollCourse] = React.useState<Course | null>(null);
  const [isSubmittingEnroll, setIsSubmittingEnroll] = React.useState(false);
  const [enrollError, setEnrollError] = React.useState<string | null>(null);
  const enrolledCourseIds = useEnrollmentStore((state) => state.enrolledCourseIds);
  const enrollCourseById = useEnrollmentStore((state) => state.enrollCourse);
  const courseFilters = useCourses(courses, searchQuery);

  const visibleCourses = React.useMemo(() => {
    return courseFilters.paginatedCourses.map((course) =>
      isCourseEnrolled(course, enrolledCourseIds) && course.status === 'notstart'
        ? { ...course, status: 'ongoing' as const, progressPercentage: 0 }
        : course
    );
  }, [courseFilters.paginatedCourses, enrolledCourseIds]);

  const handleConfirmEnroll = async (course: Course) => {
    setIsSubmittingEnroll(true);
    setEnrollError(null);

    try {
      const token = typeof window !== 'undefined' ? sessionStorage.getItem('token') : null;
      const headers: Record<string, string> = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`/api/student/courses/${course.id}/enroll`, {
        method: 'POST',
        headers,
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        if (data?.alreadyEnrolled || response.status === 409) {
          // Already enrolled, sync state and proceed
          enrollCourseById(course.id);
          setEnrollCourse(null);
          router.push(buildCourseDetailHref(course.id, 'courses'));
          return;
        }
        throw new Error(data?.message || 'Failed to enroll');
      }

      enrollCourseById(course.id);
      setEnrollCourse(null);
      router.push(buildCourseDetailHref(course.id, 'courses'));
    } catch (err: any) {
      setEnrollError(err.message === 'Failed to enroll' ? 'Gagal mendaftarkan course. Coba lagi.' : err.message || 'Gagal mendaftarkan course. Coba lagi.');
    } finally {
      setIsSubmittingEnroll(false);
    }
  };

  const handleCourseClick = (course: Course) => {
    if (!isCourseEnrolled(course, enrolledCourseIds)) {
      setEnrollCourse(course);
      return;
    }

    router.push(buildCourseDetailHref(course.id, 'courses'));
  };

  return (
    <>
      <EnrollModal
        course={enrollCourse}
        onClose={() => setEnrollCourse(null)}
        onConfirm={handleConfirmEnroll}
        isSubmitting={isSubmittingEnroll}
        errorMessage={enrollError}
      />
      <CourseCatalogLayout
        title="Explore Courses"
        description="Discover academic modules designed for rigorous intellectual growth."
        currentBreadcrumb="Courses"
        courses={visibleCourses}
        selectedCategory={courseFilters.selectedCategory}
        selectedLevel={courseFilters.selectedLevel}
        currentPage={courseFilters.currentPage}
        totalPages={courseFilters.totalPages}
        emptyState={<EmptyState />}
        onCategoryChange={courseFilters.setSelectedCategory}
        onLevelChange={courseFilters.setSelectedLevel}
        onPageChange={courseFilters.setCurrentPage}
        onResetFilters={courseFilters.resetFilters}
        onCourseClick={handleCourseClick}
        onEnroll={setEnrollCourse}
      />
    </>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center py-24 text-center">
      <span className="mb-4 text-5xl grayscale">🔍</span>
      <h3 className="mb-2 text-lg font-bold" style={{ color: 'var(--color-text-secondary)' }}>
        No courses found
      </h3>
      <p className="mb-5 max-w-[280px] text-sm" style={{ color: 'var(--color-text-secondary)' }}>
        Try adjusting your filters or search query.
      </p>
    </div>
  );
}
