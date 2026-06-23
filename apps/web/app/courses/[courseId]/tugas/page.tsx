import { notFound } from 'next/navigation';
import { AssignmentSubmissionView } from '@/components/course/AssignmentSubmissionView';
import { getStudentCourseDetail } from '@/lib/api/courseRepository';

export default async function CourseTugasPage({
  params,
  searchParams,
}: {
  params: Promise<{ courseId: string }>;
  searchParams: Promise<{ assignment?: string }>;
}) {
  const { courseId } = await params;
  const { assignment: requestedAssignmentId } = await searchParams;
  const course = await getStudentCourseDetail(courseId);
  const assignments = course?.tabs.assignments.flatMap((module) => module.items) ?? [];
  const selectedAssignmentIndex = getSelectedAssignmentIndex(assignments, requestedAssignmentId);
  const assignment = assignments[selectedAssignmentIndex];
  const previousAssignment = selectedAssignmentIndex > 0
    ? assignments[selectedAssignmentIndex - 1]
    : undefined;
  const nextAssignment = selectedAssignmentIndex < assignments.length - 1
    ? assignments[selectedAssignmentIndex + 1]
    : undefined;

  if (!course || !assignment) {
    notFound();
  }

  return (
    <AssignmentSubmissionView
      course={course}
      assignment={assignment}
      previousAssignment={previousAssignment}
      nextAssignment={nextAssignment}
    />
  );
}

function getSelectedAssignmentIndex(
  assignments: Array<{ id: string }>,
  requestedAssignmentId?: string
) {
  if (!requestedAssignmentId) {
    return 0;
  }

  const assignmentIndex = assignments.findIndex((assignment) => assignment.id === requestedAssignmentId);
  return assignmentIndex >= 0 ? assignmentIndex : 0;
}
