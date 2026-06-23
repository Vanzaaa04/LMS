import { notFound } from 'next/navigation';
import { LecturerStudentProgressView } from '@/components/lecturer/LecturerStudentProgressView';
import { getLecturerStudentProgress } from '@/lib/api/courseRepository';

interface LecturerStudentProgressPageProps {
  params: Promise<{ courseId: string; studentId: string }>;
}

export default async function LecturerStudentProgressPage({
  params,
}: LecturerStudentProgressPageProps) {
  const { courseId, studentId } = await params;
  const progressData = await getLecturerStudentProgress(courseId, studentId);

  if (!progressData) {
    notFound();
  }

  return <LecturerStudentProgressView data={progressData} />;
}
