import { NextResponse } from 'next/server';
import { enrollInCourse } from '@/lib/api/courseApi';
import { getDemoStudentAccessToken } from '@/lib/api/demoStudentSession';
import { ApiRequestError } from '@/lib/api/httpClient';

export async function POST(
  request: Request,
  context: { params: Promise<{ courseId: string }> }
) {
  try {
    const { courseId } = await context.params;
    
    // Read the authorization header
    const authHeader = request.headers.get('Authorization');
    let accessToken = '';
    if (authHeader && authHeader.startsWith('Bearer ')) {
      accessToken = authHeader.substring(7);
    } else {
      accessToken = await getDemoStudentAccessToken();
    }

    await enrollInCourse(courseId, accessToken);

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof ApiRequestError) {
      if (error.status === 409) {
        return NextResponse.json({ success: true, alreadyEnrolled: true });
      }

      return NextResponse.json(
        { success: false, message: error.message },
        { status: error.status || 500 }
      );
    }

    return NextResponse.json(
      { success: false, message: 'Failed to enroll in course.' },
      { status: 500 }
    );
  }
}
