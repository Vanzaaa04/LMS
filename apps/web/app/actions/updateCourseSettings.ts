'use server';

import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { updateCourseApi } from '@/lib/api/courseApi';

interface UpdateCourseSettingsPayload {
  title: string;
  department: string;
  semester: string;
  credits: number;
  teachingFormat: string;
  enrollmentCap: number;
  description: string;
  status: 'Active' | 'Draft' | 'Archived';
}

interface UpdateCourseSettingsResult {
  error?: string;
  success: boolean;
}

export async function updateCourseSettingsAction(
  courseId: string,
  payload: UpdateCourseSettingsPayload
): Promise<UpdateCourseSettingsResult> {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;

  if (!token) {
    return {
      success: false,
      error: 'Sesi login tidak ditemukan. Silakan login ulang.',
    };
  }

  try {
    await updateCourseApi(
      courseId,
      {
        title: payload.title.trim(),
        description: payload.description.trim(),
        credits: payload.credits,
        department: payload.department.trim(),
        semester: payload.semester.trim(),
        teachingFormat: payload.teachingFormat.trim(),
        enrollmentCap: payload.enrollmentCap,
        status: payload.status,
      },
      token
    );
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Gagal menyimpan pengaturan course.';

    return {
      success: false,
      error: message,
    };
  }

  revalidatePath('/dosen/courses');
  revalidatePath('/dashboard_dosen');
  revalidatePath(`/dosen/courses/${courseId}`);
  revalidatePath(`/dosen/courses/${courseId}/settings`);

  return {
    success: true,
  };
}
