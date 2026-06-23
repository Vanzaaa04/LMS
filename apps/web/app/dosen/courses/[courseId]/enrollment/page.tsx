import { notFound } from 'next/navigation';
import { LecturerManageEnrollmentView } from '@/components/lecturer/LecturerManageEnrollmentView';
import { getLecturerEnrollment } from '@/lib/api/courseRepository';

export default async function LecturerManageEnrollmentPage({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const { courseId } = await params;
  const enrollmentData = await getLecturerEnrollment(courseId);

  if (!enrollmentData) {
    notFound();
  }

  return <LecturerManageEnrollmentView data={enrollmentData} />;
}
