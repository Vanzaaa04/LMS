import { notFound } from 'next/navigation';
import { CourseDetailView } from '@/components/course/CourseDetailView';
import { getStudentCourseDetail } from '@/lib/api/courseRepository';

export const dynamic = 'force-dynamic';

export default async function CourseDetailPage({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const { courseId } = await params;
  const course = await getStudentCourseDetail(courseId);

  if (!course) {
    notFound();
  }

  return <CourseDetailView course={course} />;
}
