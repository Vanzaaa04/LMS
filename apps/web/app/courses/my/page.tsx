import { MyCoursesCatalogView } from '@/components/course/MyCoursesCatalogView';
import { getStudentMyCourses } from '@/lib/api/courseRepository';

export const dynamic = 'force-dynamic';

export default async function MyCoursesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const params = await searchParams;
  const courses = await getStudentMyCourses();

  return <MyCoursesCatalogView courses={courses} searchQuery={params.q ?? ''} />;
}
