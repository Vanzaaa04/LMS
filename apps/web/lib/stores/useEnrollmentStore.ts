'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface EnrollmentStore {
  enrolledCourseIds: Array<number | string>;
  enrollCourse: (courseId: number | string) => void;
  unenrollCourse: (courseId: number | string) => void;
  resetEnrollments: () => void;
  setEnrollments: (courseIds: Array<number | string>) => void;
}

export const useEnrollmentStore = create<EnrollmentStore>()(
  persist(
    (set) => ({
      enrolledCourseIds: [],
      enrollCourse: (courseId) =>
        set((state) => ({
          enrolledCourseIds: state.enrolledCourseIds.includes(courseId)
            ? state.enrolledCourseIds
            : [...state.enrolledCourseIds, courseId],
        })),
      unenrollCourse: (courseId) =>
        set((state) => ({
          enrolledCourseIds: state.enrolledCourseIds.filter((id) => id !== courseId),
        })),
      resetEnrollments: () => set({ enrolledCourseIds: [] }),
      setEnrollments: (courseIds) => set({ enrolledCourseIds: courseIds }),
    }),
    {
      name: 'ruang-dosen-enrollments',
    }
  )
);
