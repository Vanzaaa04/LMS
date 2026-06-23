import { cookies } from 'next/headers';
import { notFound, redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { LecturerModuleEditorView } from '@/components/lecturer/LecturerModuleEditorView';
import { getLecturerModule } from '@/lib/api/courseRepository';
import { updateModuleApi, deleteModuleApi } from '@/lib/api/courseApi';

interface LecturerEditModulePageProps {
  params: Promise<{ courseId: string; moduleId: string }>;
}

export default async function LecturerEditModulePage({
  params,
}: LecturerEditModulePageProps) {
  const { courseId, moduleId } = await params;
  const moduleData = await getLecturerModule(courseId, moduleId);

  if (!moduleData) {
    notFound();
  }

  async function handleSave(data: any) {
    'use server';

    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    if (token) {
      await updateModuleApi(courseId, moduleId, {
        title: data.title,
        description: data.description,
      }, token);
    }

    revalidatePath(`/dosen/courses/${courseId}`);
    redirect(`/dosen/courses/${courseId}`);
  }

  async function handleDelete() {
    'use server';

    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    if (token) {
      await deleteModuleApi(courseId, moduleId, token);
    }

    revalidatePath(`/dosen/courses/${courseId}`);
    redirect(`/dosen/courses/${courseId}`);
  }

  return (
    <LecturerModuleEditorView
      mode="edit"
      course={moduleData.course}
      termLabel={moduleData.termLabel}
      module={moduleData.module}
      moduleCount={moduleData.moduleCount}
      onSave={handleSave}
      onDelete={handleDelete}
    />
  );
}
