import { notFound } from 'next/navigation';
import { LecturerManageCourseView } from '@/components/lecturer/LecturerManageCourseView';
import { getLecturerManageCourse } from '@/lib/api/courseRepository';

export default async function LecturerManageCoursePage({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const { courseId } = await params;
  const courseManagementData = await getLecturerManageCourse(courseId);

  if (!courseManagementData) {
    notFound();
  }

  return <LecturerManageCourseView data={courseManagementData} />;
}
