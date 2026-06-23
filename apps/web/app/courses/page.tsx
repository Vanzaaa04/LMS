import { CoursesCatalogView } from '@/components/course/CoursesCatalogView';
import { getStudentCourses } from '@/lib/api/courseRepository';

export default async function CoursesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const params = await searchParams;
  const courses = await getStudentCourses();

  return <CoursesCatalogView courses={courses} searchQuery={params.q ?? ''} />;
}
