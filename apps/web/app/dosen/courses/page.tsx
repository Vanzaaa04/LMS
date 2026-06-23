import { LecturerCoursesView } from '@/components/lecturer/LecturerCoursesView';
import { getLecturerCourses } from '@/lib/api/courseRepository';

export default async function LecturerCoursesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const params = await searchParams;
  const courses = await getLecturerCourses();

  return (
    <LecturerCoursesView
      courses={courses}
      searchQuery={params.q ?? ''}
    />
  );
}
