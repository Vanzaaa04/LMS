'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { buildApiUrl } from '@/lib/api/apiConfig';

interface AvailableCourse {
  id: string;
  title: string;
  className: string | null;
  credits: number;
  department: string;
  targetSemester: number;
  enrollmentCap: number;
  description: string | null;
  teachingFormat: string;
  _count: { enrollments: number; modules: number };
}

export default function AvailableClassesPage() {
  const [courses, setCourses] = useState<AvailableCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [claiming, setClaiming] = useState<string | null>(null);
  const router = useRouter();

  const fetchAvailable = useCallback(async () => {
    try {
      const token = sessionStorage.getItem('token');
      if (!token) { router.push('/login'); return; }

      const res = await fetch(buildApiUrl('/courses/available'), {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setCourses(await res.json());
      }
    } catch (err) {
      console.error('Failed to fetch available classes', err);
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => { fetchAvailable(); }, [fetchAvailable]);

  const handleClaim = async (courseId: string) => {
    setClaiming(courseId);
    try {
      const token = sessionStorage.getItem('token');
      const res = await fetch(buildApiUrl(`/courses/${courseId}/claim`), {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        // Remove from list
        setCourses(prev => prev.filter(c => c.id !== courseId));
      } else {
        const err = await res.json();
        alert(err.message || 'Gagal mengambil kelas');
      }
    } catch (err) {
      console.error(err);
      alert('Gagal mengambil kelas');
    } finally {
      setClaiming(null);
    }
  };

  // Group courses by semester
  const grouped = courses.reduce<Record<number, AvailableCourse[]>>((acc, c) => {
    const sem = c.targetSemester || 1;
    if (!acc[sem]) acc[sem] = [];
    acc[sem].push(c);
    return acc;
  }, {});

  const sortedSemesters = Object.keys(grouped).map(Number).sort((a, b) => a - b);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: 40, height: 40, border: '3px solid #e5e7eb', borderTopColor: '#2563EB', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 16px' }} />
          <p style={{ color: '#6b7280', fontSize: 14 }}>Memuat kelas yang tersedia...</p>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div style={{ padding: '32px 40px', maxWidth: 1200, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <button
          onClick={() => router.push('/dosen/courses')}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#2563EB', fontSize: 14, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6, marginBottom: 16, padding: 0 }}
        >
          ← Kembali ke Mata Kuliah Saya
        </button>
        <h1 style={{ fontSize: 28, fontWeight: 800, color: '#0f172a', margin: '0 0 8px 0', letterSpacing: '-0.02em' }}>
          Kelas Tersedia
        </h1>
        <p style={{ color: '#64748b', fontSize: 15, margin: 0, lineHeight: 1.6 }}>
          Berikut adalah daftar kelas yang dibuat oleh Admin dan belum diambil oleh dosen manapun.
          Klik <strong>"Ambil Kelas"</strong> untuk menjadi pengampu kelas tersebut.
        </p>
      </div>

      {courses.length === 0 ? (
        <div style={{
          textAlign: 'center', padding: '60px 20px', background: '#f8fafc',
          borderRadius: 16, border: '2px dashed #e2e8f0',
        }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>📭</div>
          <h3 style={{ fontSize: 18, fontWeight: 700, color: '#334155', margin: '0 0 8px 0' }}>
            Tidak ada kelas tersedia saat ini
          </h3>
          <p style={{ color: '#64748b', fontSize: 14, margin: 0 }}>
            Admin belum membuat kelas baru, atau semua kelas sudah diambil oleh dosen lain.
          </p>
        </div>
      ) : (
        sortedSemesters.map(sem => (
          <div key={sem} style={{ marginBottom: 40 }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20,
              paddingBottom: 12, borderBottom: '2px solid #e2e8f0',
            }}>
              <span style={{
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                width: 36, height: 36, borderRadius: 10, fontSize: 14, fontWeight: 800,
                background: 'linear-gradient(135deg, #2563EB, #7C3AED)', color: 'white',
              }}>
                {sem}
              </span>
              <h2 style={{ fontSize: 18, fontWeight: 700, color: '#0f172a', margin: 0 }}>
                Semester {sem}
              </h2>
              <span style={{ fontSize: 13, color: '#94a3b8', fontWeight: 500 }}>
                {grouped[sem].length} kelas
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 16 }}>
              {grouped[sem].map(course => (
                <div
                  key={course.id}
                  style={{
                    background: 'white', borderRadius: 16, border: '1px solid #e2e8f0',
                    padding: 24, transition: 'all 0.2s ease',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                  }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 8px 25px rgba(0,0,0,0.08)'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(0)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 1px 3px rgba(0,0,0,0.04)'; }}
                >
                  {/* Title + Class badge */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                    <h3 style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', margin: 0, lineHeight: 1.4, flex: 1 }}>
                      {course.title}
                    </h3>
                    {course.className && (
                      <span style={{
                        padding: '4px 10px', borderRadius: 8, fontSize: 12, fontWeight: 700,
                        background: '#EEF2FF', color: '#4338CA', marginLeft: 8, whiteSpace: 'nowrap',
                      }}>
                        Kelas {course.className}
                      </span>
                    )}
                  </div>

                  {course.description && (
                    <p style={{ fontSize: 13, color: '#64748b', margin: '0 0 16px 0', lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {course.description}
                    </p>
                  )}

                  {/* Meta info */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
                    <span style={{ padding: '4px 10px', borderRadius: 6, fontSize: 12, fontWeight: 600, background: '#f1f5f9', color: '#475569' }}>
                      {course.credits} SKS
                    </span>
                    <span style={{ padding: '4px 10px', borderRadius: 6, fontSize: 12, fontWeight: 600, background: '#f1f5f9', color: '#475569' }}>
                      {course.department}
                    </span>
                    <span style={{ padding: '4px 10px', borderRadius: 6, fontSize: 12, fontWeight: 600, background: '#f1f5f9', color: '#475569' }}>
                      Kapasitas: {course.enrollmentCap}
                    </span>
                    <span style={{ padding: '4px 10px', borderRadius: 6, fontSize: 12, fontWeight: 600, background: '#f1f5f9', color: '#475569' }}>
                      {course.teachingFormat}
                    </span>
                  </div>

                  {/* Claim button */}
                  <button
                    onClick={() => handleClaim(course.id)}
                    disabled={claiming === course.id}
                    style={{
                      width: '100%', padding: '12px 0', borderRadius: 12, border: 'none',
                      background: claiming === course.id ? '#94a3b8' : 'linear-gradient(135deg, #2563EB, #1d4ed8)',
                      color: 'white', fontSize: 14, fontWeight: 700, cursor: claiming === course.id ? 'wait' : 'pointer',
                      transition: 'all 0.2s ease', letterSpacing: '0.01em',
                    }}
                  >
                    {claiming === course.id ? 'Mengambil kelas...' : '✋ Ambil Kelas Ini'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
