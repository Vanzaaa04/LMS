import type { Course } from '@/lib/types/course';

export function isCourseEnrolled(course: Course, enrolledCourseIds: Array<number | string>) {
  return enrolledCourseIds.includes(course.id);
}
