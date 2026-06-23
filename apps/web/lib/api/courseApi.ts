import { apiRequest } from './httpClient';
import { getApiBaseUrl } from './apiConfig';

export type ApiMaterialType = 'TEXT' | 'VIDEO' | 'DOCUMENT';

export interface ApiUserSummary {
  id?: string;
  name: string;
  email?: string;
  role?: string;
  xp?: number;
}

export interface ApiCourseListItem {
  id: string;
  title: string;
  description?: string | null;
  credits?: number;
  department?: string | null;
  semester?: string | null;
  teachingFormat?: string | null;
  enrollmentCap?: number | null;
  status?: string | null;
  instructorId: string;
  instructor?: ApiUserSummary;
  createdAt: string;
  updatedAt: string;
  _count?: {
    enrollments?: number;
  };
}

export interface ApiMaterial {
  id: string;
  title: string;
  url?: string | null;
  content?: string | null;
  type: ApiMaterialType;
  moduleId: string;
  createdAt: string;
  updatedAt: string;
}
export interface ApiAssignment {
  id: string;
  title: string;
  description: string;
  status?: string;
  deadline: string;
  moduleId: string;
  submissionRequirement?: string;
  templateName?: string;
  templateUrl?: string;
  createdAt: string;
  updatedAt: string;
  _count?: {
    submissions?: number;
  };
}
export interface ApiQuiz {
  id: string;
  title: string;
  status?: string;
  passingScore?: number;
  xpReward?: number;
  timeLimit?: number;
  moduleId: string;
  createdAt: string;
  updatedAt: string;
}

export interface ApiLab {
  id: string;
  title: string;
  instructions: string;
  moduleId: string;
  createdAt: string;
  updatedAt: string;
}

export interface ApiCourseModule {
  id: string;
  title: string;
  description?: string | null;
  order: number;
  courseId: string;
  materials: ApiMaterial[];
  assignments: ApiAssignment[];
  quizzes: ApiQuiz[];
  labs: ApiLab[];
}

export interface ApiCourseDetail extends ApiCourseListItem {
  modules: ApiCourseModule[];
}

export function fetchCourses(accessToken?: string) {
  const headers: HeadersInit = {};
  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  }
  return apiRequest<ApiCourseListItem[]>('/courses', {
    headers,
    next: { revalidate: 0, tags: ['courses'] },
  });
}

export function fetchCourseDetail(courseId: string, accessToken?: string) {
  const headers: HeadersInit = {};
  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  }
  return apiRequest<ApiCourseDetail>(`/courses/${courseId}`, {
    headers,
    next: { revalidate: 0, tags: ['courses', `course-${courseId}`] },
  });
}

export function fetchMyCourses(accessToken: string) {
  return apiRequest<ApiCourseListItem[]>('/courses/my', {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    next: { revalidate: 0, tags: ['courses'] },
  });
}

export function enrollInCourse(courseId: string, accessToken: string) {
  return apiRequest<{ message?: string }>(`/courses/${courseId}/enroll`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
}

export function createCourseApi(
  data: {
    title: string;
    description?: string;
    instructorId: string;
    credits?: number;
    department?: string;
    semester?: string;
    teachingFormat?: string;
    enrollmentCap?: number;
    status?: string;
  },
  accessToken: string
) {
  return apiRequest<ApiCourseListItem>('/courses', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(data),
  });
}

export function updateCourseApi(
  courseId: string,
  data: {
    title?: string;
    description?: string;
    credits?: number;
    department?: string;
    semester?: string;
    teachingFormat?: string;
    enrollmentCap?: number;
    status?: string;
  },
  accessToken: string
) {
  return apiRequest<ApiCourseListItem>(`/courses/${courseId}`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(data),
  });
}

export function createMaterialApi(
  data: {
    title: string;
    type: ApiMaterialType;
    content?: string;
    url?: string;
    moduleId: string;
  },
  accessToken: string
) {
  return apiRequest<ApiMaterial>('/materials', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(data),
  });
}

// Assignment Endpoints
export function createAssignmentApi(
  data: {
    title: string;
    description: string;
    status?: string;
    deadline: string;
    moduleId: string;
    templateUrl?: string;
    templateName?: string;
    submissionRequirement?: string;
  },
  accessToken: string
) {
  return apiRequest<ApiAssignment>('/assignments', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(data),
  });
}

export function updateAssignmentApi(
  id: string,
  data: {
    title?: string;
    description?: string;
    status?: string;
    deadline?: string;
    templateUrl?: string;
    templateName?: string;
    submissionRequirement?: string;
  },
  accessToken: string
) {
  return apiRequest<ApiAssignment>(`/assignments/${id}`, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(data),
  });
}

export function deleteAssignmentApi(id: string, accessToken: string) {
  return apiRequest<{ message?: string }>(`/assignments/${id}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
}

export function submitAssignmentApi(
  assignmentId: string,
  data: { fileUrl: string; note?: string },
  accessToken: string
) {
  return apiRequest<any>(`/assignments/${assignmentId}/submit`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(data),
  });
}

// Module Endpoints
export function fetchModulesApi(courseId: string, accessToken: string) {
  return apiRequest<ApiCourseModule[]>(`/courses/${courseId}/modules`, {
    headers: { Authorization: `Bearer ${accessToken}` },
    next: { revalidate: 0, tags: ['modules'] },
  });
}

export function createModuleApi(
  courseId: string,
  data: { title: string; description?: string },
  accessToken: string
) {
  return apiRequest<ApiCourseModule>(`/courses/${courseId}/modules`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${accessToken}` },
    body: JSON.stringify(data),
  });
}

export function updateModuleApi(
  courseId: string,
  moduleId: string,
  data: { title: string; description?: string },
  accessToken: string
) {
  return apiRequest<ApiCourseModule>(`/courses/${courseId}/modules/${moduleId}`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${accessToken}` },
    body: JSON.stringify(data),
  });
}

export function deleteModuleApi(courseId: string, moduleId: string, accessToken: string) {
  return apiRequest<{ message?: string }>(`/courses/${courseId}/modules/${moduleId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${accessToken}` },
  });
}

// Enrollment Management Endpoints
export function fetchCourseEnrollmentsApi(courseId: string, accessToken: string) {
  return apiRequest<
    {
      id: string;
      createdAt?: string;
      updatedAt?: string;
      user: { id: string; name: string; email: string };
    }[]
  >(
    `/courses/${courseId}/enrollments`,
    {
      headers: { Authorization: `Bearer ${accessToken}` },
      next: { revalidate: 0, tags: ['enrollments'] },
    }
  );
}

export function enrollStudentByEmailApi(courseId: string, email: string, accessToken: string) {
  return apiRequest<{ id: string; user: { id: string; name: string; email: string } }>(
    `/courses/${courseId}/enroll-student`,
    {
      method: 'POST',
      headers: { Authorization: `Bearer ${accessToken}` },
      body: JSON.stringify({ email }),
    }
  );
}

export function removeEnrollmentApi(courseId: string, studentId: string, accessToken: string) {
  return apiRequest<{ message?: string }>(
    `/courses/${courseId}/enrollment/${studentId}`,
    {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${accessToken}` },
    }
  );
}

export function updateMaterialApi(
  id: string,
  data: {
    title?: string;
    type?: ApiMaterialType;
    content?: string;
    url?: string;
  },
  accessToken: string
) {
  return apiRequest<ApiMaterial>(`/materials/${id}`, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(data),
  });
}

export function deleteMaterialApi(id: string, accessToken: string) {
  return apiRequest<{ message?: string }>(`/materials/${id}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
}

export async function uploadFileApi(file: File, accessToken: string) {
  const formData = new FormData();
  formData.append('file', file);

  const baseUrl = getApiBaseUrl().replace(/\/$/, '');
  const response = await fetch(`${baseUrl}/uploads`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    body: formData,
  });

  if (!response.ok) {
    throw new Error('File upload failed');
  }

  return response.json() as Promise<{ url: string; fileName: string; size: number }>;
}

export function fetchAssignmentSubmissionsApi(assignmentId: string, accessToken: string) {
  return apiRequest<any[]>(`/assignments/${assignmentId}/submissions`, {
    headers: { Authorization: `Bearer ${accessToken}` },
    next: { revalidate: 0 },
  });
}

export function fetchMyAssignmentSubmissionApi(assignmentId: string, accessToken: string) {
  return apiRequest<{
    id: string;
    status: string;
    score?: number | null;
    feedback?: string | null;
    fileUrl?: string | null;
    note?: string | null;
    createdAt: string;
  } | null>(`/assignments/${assignmentId}/my-submission`, {
    headers: { Authorization: `Bearer ${accessToken}` },
    next: { revalidate: 0 },
  });
}
