import { notFound } from 'next/navigation';
import { LecturerAssignmentSubmissionsView } from '@/components/lecturer/LecturerAssignmentSubmissionsView';
import { getLecturerAssignmentSubmissions } from '@/lib/api/courseRepository';

interface LecturerAssignmentSubmissionsPageProps {
  params: Promise<{ courseId: string; moduleId: string; assignmentId: string }>;
}

export default async function LecturerAssignmentSubmissionsPage({
  params,
}: LecturerAssignmentSubmissionsPageProps) {
  const { courseId, moduleId, assignmentId } = await params;
  const submissionsData = await getLecturerAssignmentSubmissions(courseId, moduleId, assignmentId);

  if (!submissionsData) {
    notFound();
  }

  return <LecturerAssignmentSubmissionsView {...submissionsData} />;
}
