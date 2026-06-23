import { notFound } from 'next/navigation';
import { LecturerAssignmentsListView } from '@/components/lecturer/LecturerAssignmentsListView';
import { getLecturerAssignmentsByCourse } from '@/lib/api/courseRepository';

interface LecturerAssignmentsPageProps {
  params: Promise<{ courseId: string }>;
}

export default async function LecturerAssignmentsPage({
  params,
}: LecturerAssignmentsPageProps) {
  const { courseId } = await params;
  const assignmentData = await getLecturerAssignmentsByCourse(courseId);

  if (!assignmentData) {
    notFound();
  }

  return (
    <LecturerAssignmentsListView
      course={assignmentData.course}
      assignments={assignmentData.assignments}
    />
  );
}
