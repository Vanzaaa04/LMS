import { MyCoursesCatalogView } from '@/components/course/MyCoursesCatalogView';
import { getStudentMyCourses } from '@/lib/api/courseRepository';
import { StudentDashboardLayout } from '@/components/layout/StudentDashboardLayout';

export const dynamic = 'force-dynamic';

export default async function MyCoursesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const params = await searchParams;
  const courses = await getStudentMyCourses();

  return (
    <StudentDashboardLayout title="Kursus Saya" activeTab="courses">
      <MyCoursesCatalogView courses={courses} searchQuery={params.q ?? ''} />
    </StudentDashboardLayout>
  );
}
