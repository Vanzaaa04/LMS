import { cookies } from 'next/headers';
import { notFound, redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { LecturerModuleEditorView } from '@/components/lecturer/LecturerModuleEditorView';
import { getLecturerManageCourse } from '@/lib/api/courseRepository';
import { createModuleApi } from '@/lib/api/courseApi';

interface LecturerCreateModulePageProps {
  params: Promise<{ courseId: string }>;
}

export default async function LecturerCreateModulePage({
  params,
}: LecturerCreateModulePageProps) {
  const { courseId } = await params;
  const courseData = await getLecturerManageCourse(courseId);

  if (!courseData) {
    notFound();
  }

  async function handleSave(data: any) {
    'use server';

    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    if (token) {
      await createModuleApi(courseId, {
        title: data.title,
        description: data.description,
      }, token);
    }

    revalidatePath(`/dosen/courses/${courseId}`);
    redirect(`/dosen/courses/${courseId}`);
  }

  return (
    <LecturerModuleEditorView
      mode="create"
      course={courseData.course}
      termLabel={courseData.termLabel}
      moduleCount={courseData.modules.length}
      onSave={handleSave}
    />
  );
}
