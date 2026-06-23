import axios from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001",
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = sessionStorage.getItem("token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export async function gradeSubmission(
  submissionId: string,
  score: number,
  feedback?: string
): Promise<any> {
  const { data } = await api.put(`/assignment-submissions/${submissionId}/grade`, {
    score,
    feedback,
  });
  return data;
}
