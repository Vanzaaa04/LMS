import { CoursesCatalogView } from '@/components/course/CoursesCatalogView';
import { getStudentCourses } from '@/lib/api/courseRepository';
import { AppShell } from '@/components/layout/AppShell';

export const dynamic = 'force-dynamic';

export default async function CoursesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const params = await searchParams;
  const courses = await getStudentCourses();

  return (
    <AppShell>
      <CoursesCatalogView courses={courses} searchQuery={params.q ?? ''} />
    </AppShell>
  );
}
