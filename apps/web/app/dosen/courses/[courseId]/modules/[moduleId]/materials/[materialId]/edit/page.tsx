import { notFound, redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { LecturerMaterialEditorView } from '@/components/lecturer/LecturerMaterialEditorView';
import { getLecturerMaterial } from '@/lib/api/courseRepository';
import { updateMaterialApi, deleteMaterialApi, uploadFileApi, type ApiMaterialType } from '@/lib/api/courseApi';


interface LecturerEditMaterialPageProps {
  params: Promise<{ courseId: string; moduleId: string; materialId: string }>;
}

export default async function LecturerEditMaterialPage({
  params,
}: LecturerEditMaterialPageProps) {
  const { courseId, moduleId, materialId } = await params;
  const materialData = await getLecturerMaterial(courseId, moduleId, materialId);

  if (!materialData) {
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
      resolvedUrl = videoSourceMode === 'link' ? externalUrl : (fileUrl || materialData!.material.fileName || '');
    } else if (materialKind === 'document') {
      apiType = 'DOCUMENT';
      resolvedUrl = fileUrl || materialData!.material.fileName || '';
    } else {
      apiType = 'TEXT';
      resolvedUrl = externalUrl;
    }

    try {
      await updateMaterialApi(
        materialId,
        {
          title,
          type: apiType,
          content: description,
          url: resolvedUrl,
        },
        token
      );
    } catch (error) {
      console.error('Failed to update material via API:', error);
      throw new Error('Gagal menyimpan perubahan material. Periksa koneksi API dan coba lagi.');
    }

    revalidatePath(`/dosen/courses/${courseId}`);
    redirect(`/dosen/courses/${courseId}`);
  }

  async function handleDelete() {
    'use server';

    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) {
      throw new Error('Sesi login tidak ditemukan. Silakan login ulang.');
    }

    try {
      await deleteMaterialApi(materialId, token);
    } catch (error) {
      console.error('Failed to delete material via API:', error);
      throw new Error('Gagal menghapus material. Periksa koneksi API dan coba lagi.');
    }

    revalidatePath(`/dosen/courses/${courseId}`);
    redirect(`/dosen/courses/${courseId}`);
  }

  return (
    <LecturerMaterialEditorView
      mode="edit"
      course={materialData.course}
      module={materialData.module}
      material={materialData.material}
      onSave={handleSave}
      onDelete={handleDelete}
    />
  );
}
