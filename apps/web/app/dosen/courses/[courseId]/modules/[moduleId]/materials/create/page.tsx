import { notFound, redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { LecturerMaterialEditorView } from '@/components/lecturer/LecturerMaterialEditorView';
import { getLecturerModule } from '@/lib/api/courseRepository';
import { createMaterialApi, uploadFileApi, type ApiMaterialType } from '@/lib/api/courseApi';


interface LecturerCreateMaterialPageProps {
  params: Promise<{ courseId: string; moduleId: string }>;
}

export default async function LecturerCreateMaterialPage({
  params,
}: LecturerCreateMaterialPageProps) {
  const { courseId, moduleId } = await params;
  const moduleData = await getLecturerModule(courseId, moduleId);

  if (!moduleData) {
    notFound();
  }

  async function handleSave(formData: FormData) {
    'use server';

    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const materialKind = formData.get('materialKind') as string;
    const externalUrl = formData.get('externalUrl') as string;
    const videoSourceMode = formData.get('videoSourceMode') as string;
    const file = formData.get('file') as File | null;

    let fileUrl = '';

    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) {
      throw new Error('Sesi login tidak ditemukan. Silakan login ulang.');
    }

    if (file && file.size > 0) {
      try {
        const uploadResult = await uploadFileApi(file, token);
        fileUrl = uploadResult.url;
      } catch (error) {
        console.error('File upload failed:', error);
        throw new Error('Gagal mengunggah file material.');
      }
    }

    let apiType: ApiMaterialType = 'TEXT';
    let resolvedUrl = externalUrl;

    if (materialKind === 'video') {
      apiType = 'VIDEO';
      resolvedUrl = videoSourceMode === 'link' ? externalUrl : fileUrl;
    } else if (materialKind === 'document') {
      apiType = 'DOCUMENT';
      resolvedUrl = fileUrl;
    } else {
      apiType = 'TEXT';
      resolvedUrl = externalUrl;
    }

    try {
      await createMaterialApi(
        {
          title,
          type: apiType,
          content: description,
          url: resolvedUrl,
          moduleId,
        },
        token
      );
    } catch (error) {
      console.error('Failed to create material via API:', error);
      throw new Error('Gagal membuat material. Periksa koneksi API dan coba lagi.');
    }

    revalidatePath(`/dosen/courses/${courseId}`);
    redirect(`/dosen/courses/${courseId}`);
  }

  return (
    <LecturerMaterialEditorView
      mode="create"
      course={moduleData.course}
      module={moduleData.module}
      onSave={handleSave}
    />
  );
}
