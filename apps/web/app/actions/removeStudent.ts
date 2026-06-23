'use server';

import { cookies } from 'next/headers';
import { revalidatePath, revalidateTag } from 'next/cache';
import { removeEnrollmentApi } from '@/lib/api/courseApi';

export async function removeStudentAction(courseId: string, studentId: string) {
  if (!studentId) {
    throw new Error('Student ID is required');
  }

  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;

  if (token) {
    await removeEnrollmentApi(courseId, studentId, token);
  }

  revalidateTag('courses', 'max');
  revalidateTag(`course-${courseId}`, 'max');
  revalidateTag('enrollments', 'max');
  revalidatePath(`/dosen/courses/${courseId}`);
  revalidatePath(`/dosen/courses/${courseId}/enrollment`);
}
