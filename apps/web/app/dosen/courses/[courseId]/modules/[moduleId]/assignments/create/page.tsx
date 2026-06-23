import { notFound, redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { LecturerAssignmentEditorView } from '@/components/lecturer/LecturerAssignmentEditorView';
import { getLecturerModule, getLecturerAssignmentsByCourse } from '@/lib/api/courseRepository';
import { createAssignmentApi } from '@/lib/api/courseApi';
import { cookies } from 'next/headers';

interface LecturerCreateAssignmentPageProps {
  params: Promise<{ courseId: string; moduleId: string }>;
}

export default async function LecturerCreateAssignmentPage({
  params,
}: LecturerCreateAssignmentPageProps) {
  const { courseId, moduleId } = await params;
  const moduleData = await getLecturerModule(courseId, moduleId);
  const courseAssignments = await getLecturerAssignmentsByCourse(courseId);

  if (!moduleData || !courseAssignments) {
    notFound();
  }

  async function handleSave(formData: FormData) {
    'use server';

    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const status = formData.get('status') as string;
    const deadline = formData.get('deadline') as string;
    const submissionRequirement = formData.get('submissionRequirement') as string;
    const templateName = formData.get('templateName') as string;
    const templateUrl = formData.get('templateUrl') as string;

    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) {
      throw new Error('Sesi login tidak ditemukan. Silakan login ulang.');
    }

    try {
      await createAssignmentApi(
        {
          title,
          description,
          status: status === 'Active' ? 'ACTIVE' : 'DRAFT',
          deadline: new Date(deadline).toISOString(),
          moduleId,
          submissionRequirement,
          templateName: templateName || undefined,
          templateUrl: templateUrl || undefined,
        },
        token
      );
    } catch (error) {
      console.error('Failed to create assignment via API:', error);
      throw new Error('Gagal membuat assignment. Periksa koneksi API dan coba lagi.');
    }

    revalidatePath(`/dosen/courses/${courseId}`);
    redirect(`/dosen/courses/${courseId}`);
  }

  return (
    <LecturerAssignmentEditorView
      mode="create"
      course={moduleData.course}
      module={moduleData.module}
      existingAssignments={courseAssignments.assignments}
      onSave={handleSave}
    />
  );
}
