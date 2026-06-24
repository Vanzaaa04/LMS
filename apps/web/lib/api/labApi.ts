import { apiRequest } from './httpClient';

export interface ApiLab {
  id: string;
  title: string;
  instructions: string;
  moduleId: string;
  courseName?: string;
  instructor?: string;
  status?: 'available' | 'pending' | 'completed' | 'active';
  score?: number | null;
  fileUrl?: string;
  fileName?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ApiLabSubmission {
  id: string;
  labId: string;
  studentId: string;
  fileUrl: string;
  note?: string;
  status: 'PENDING' | 'GRADED';
  score?: number | null;
  feedback?: string | null;
  createdAt: string;
  updatedAt: string;
  student?: {
    id: string;
    name: string;
    email: string;
  };
}

export function fetchLabsApi(accessToken: string) {
  return apiRequest<ApiLab[]>('/dashboard/labs', {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    next: { revalidate: 0 },
  });
}

export function fetchLabDetailApi(labId: string, accessToken: string) {
  return apiRequest<ApiLab>(`/labs/${labId}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    next: { revalidate: 0 },
  });
}

export function createLabApi(
  data: { title: string; instructions: string; moduleId: string; fileUrl?: string; fileName?: string; maxAttempts?: number; gradingMethod?: string },
  accessToken: string
) {
  return apiRequest<ApiLab>('/labs', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(data),
  });
}

export function submitLabApi(
  labId: string,
  data: { fileUrl: string; note?: string },
  accessToken: string
) {
  return apiRequest<ApiLabSubmission>(`/labs/${labId}/submit`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(data),
  });
}

export function fetchLabSubmissionsApi(labId: string, accessToken: string) {
  return apiRequest<ApiLabSubmission[]>(`/labs/${labId}/submissions`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    next: { revalidate: 0 },
  });
}

export function gradeLabSubmissionApi(
  submissionId: string,
  data: { score: number; feedback?: string },
  accessToken: string
) {
  return apiRequest<ApiLabSubmission>(`/lab-submissions/${submissionId}/grade`, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(data),
  });
}

export function fetchMyLabSubmissionApi(labId: string, accessToken: string) {
  return apiRequest<ApiLabSubmission | null>(`/labs/${labId}/my-submission`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    next: { revalidate: 0 },
  });
}

export function updateLabApi(
  labId: string,
  data: { title?: string; instructions?: string; fileUrl?: string; fileName?: string; maxAttempts?: number; gradingMethod?: string },
  accessToken: string
) {
  return apiRequest<ApiLab>(`/labs/${labId}`, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(data),
  });
}

export function deleteLabApi(labId: string, accessToken: string) {
  return apiRequest<{ success: boolean }>(`/labs/${labId}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
}
