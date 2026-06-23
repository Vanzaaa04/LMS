import { buildApiUrl } from './apiConfig';

export async function fetchAdminStats(token: string) {
  const res = await fetch(buildApiUrl('/admin/stats'), {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('Failed to fetch admin stats');
  return res.json();
}
