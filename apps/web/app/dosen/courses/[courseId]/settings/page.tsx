import { notFound } from 'next/navigation';
import { LecturerCourseSettingsView } from '@/components/lecturer/LecturerCourseSettingsView';
import { getLecturerManageCourse } from '@/lib/api/courseRepository';

interface LecturerCourseSettingsPageProps {
  params: Promise<{ courseId: string }>;
}

export default async function LecturerCourseSettingsPage({
  params,
}: LecturerCourseSettingsPageProps) {
  const { courseId } = await params;
  const courseData = await getLecturerManageCourse(courseId);

  if (!courseData) {
    notFound();
  }

  return <LecturerCourseSettingsView data={courseData} />;
}
