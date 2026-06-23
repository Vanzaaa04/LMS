"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { buildApiUrl } from "@/lib/api/apiConfig";
import { AdminSidebar } from "@/components/layout/AdminSidebar";
import "../../dashboard.css";

export default function AdminCourseDetailPage() {
  const params = useParams();
  const courseId = params.courseId as string;
  const [course, setCourse] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'info' | 'modules' | 'students'>('info');

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const token = sessionStorage.getItem("token");
        if (!token) return;
        const res = await fetch(buildApiUrl(`/courses/${courseId}`), {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          setCourse(await res.json());
        } else {
          setError("Mata kuliah tidak ditemukan.");
        }
      } catch (e) {
        setError("Gagal memuat mata kuliah.");
      } finally {
        setLoading(false);
      }
    };
    if (courseId) fetchCourse();
  }, [courseId]);

  if (loading) return <div style={{ padding: '40px', textAlign: 'center' }}>Memuat data...</div>;
  if (error || !course) return <div style={{ padding: '40px', textAlign: 'center', color: 'red' }}>{error}</div>;

  return (
    <div className="admin-dashboard app-wrapper">
      <AdminSidebar activeTab="courses" />
      <main className="main-content">
        <header className="top-bar">
          <div>
            <p className="page-title">Manajemen Mata Kuliah</p>
            <p className="page-subtitle">Detail informasi mata kuliah.</p>
          </div>
        </header>
        <div className="dashboard-content" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
            <Link href="/dashboard_admin/courses" style={{ color: 'var(--text-secondary)' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
            </Link>
            <div>
              <h1 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>Detail Mata Kuliah</h1>
              <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginTop: '4px' }}>Mode Admin: Read Only (Hanya Dosen yang dapat mengubah modul dan isi)</p>
            </div>
          </div>

          {/* Header Card */}
          <div style={{ background: 'white', borderRadius: '16px', padding: '24px 32px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)', marginBottom: '24px' }}>
            <h2 style={{ fontSize: '28px', color: '#111', marginBottom: '12px', fontWeight: 800 }}>{course.title}</h2>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '24px' }}>
              <span style={{ background: '#F1F5F9', color: '#475569', padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 600 }}>{course.credits} SKS</span>
              <span style={{ background: '#F1F5F9', color: '#475569', padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 600 }}>{course.semester}</span>
            </div>

            {/* Tab Selectors */}
            <div style={{ display: 'flex', borderBottom: '1px solid #E2E8F0', gap: '24px', margin: '0 -32px -24px -32px', padding: '0 32px' }}>
              <button 
                onClick={() => setActiveTab('info')}
                style={{ 
                  padding: '12px 4px', 
                  border: 'none', 
                  background: 'none', 
                  fontSize: '14px', 
                  fontWeight: 600, 
                  color: activeTab === 'info' ? 'var(--primary)' : 'var(--text-secondary)',
                  borderBottom: activeTab === 'info' ? '2px solid var(--primary)' : 'none',
                  cursor: 'pointer'
                }}
              >
                Informasi
              </button>
              <button 
                onClick={() => setActiveTab('modules')}
                style={{ 
                  padding: '12px 4px', 
                  border: 'none', 
                  background: 'none', 
                  fontSize: '14px', 
                  fontWeight: 600, 
                  color: activeTab === 'modules' ? 'var(--primary)' : 'var(--text-secondary)',
                  borderBottom: activeTab === 'modules' ? '2px solid var(--primary)' : 'none',
                  cursor: 'pointer'
                }}
              >
                Modul ({course.modules?.length || 0})
              </button>
              <button 
                onClick={() => setActiveTab('students')}
                style={{ 
                  padding: '12px 4px', 
                  border: 'none', 
                  background: 'none', 
                  fontSize: '14px', 
                  fontWeight: 600, 
                  color: activeTab === 'students' ? 'var(--primary)' : 'var(--text-secondary)',
                  borderBottom: activeTab === 'students' ? '2px solid var(--primary)' : 'none',
                  cursor: 'pointer'
                }}
              >
                Mahasiswa ({course.enrollments?.length || 0})
              </button>
            </div>
          </div>

          {/* Tab Content Area */}
          <div style={{ background: 'white', borderRadius: '16px', padding: '32px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}>
            
            {activeTab === 'info' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                <div style={{ padding: '20px', background: '#F8FAFC', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                  <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#334155', marginBottom: '12px', textTransform: 'uppercase' }}>Dosen Pengampu</h3>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#CBD5E1', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', color: 'white' }}>
                      {course.instructor?.name?.substring(0, 2).toUpperCase() || 'NA'}
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, color: '#0F172A' }}>{course.instructor?.name || 'Tidak ada dosen'}</div>
                      <div style={{ fontSize: '13px', color: '#64748B' }}>{course.instructor?.email || '-'}</div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#1E293B', marginBottom: '12px' }}>Deskripsi Kelas</h3>
                  <p style={{ color: '#475569', lineHeight: 1.6, whiteSpace: 'pre-line' }}>{course.description || 'Tidak ada deskripsi.'}</p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                  <div style={{ padding: '20px', border: '1px solid #E2E8F0', borderRadius: '12px' }}>
                    <div style={{ fontSize: '13px', color: '#64748B', fontWeight: 600, textTransform: 'uppercase', marginBottom: '8px' }}>Total Mahasiswa Terdaftar</div>
                    <div style={{ fontSize: '32px', fontWeight: 700, color: '#0F172A' }}>{course.enrollments?.length || 0} <span style={{ fontSize: '14px', color: '#94A3B8', fontWeight: 500 }}>/ {course.enrollmentCap}</span></div>
                  </div>
                  <div style={{ padding: '20px', border: '1px solid #E2E8F0', borderRadius: '12px' }}>
                    <div style={{ fontSize: '13px', color: '#64748B', fontWeight: 600, textTransform: 'uppercase', marginBottom: '8px' }}>Status Kelas</div>
                    <div style={{ display: 'inline-block', padding: '6px 16px', background: course.status === 'Active' ? '#DCFCE7' : '#F1F5F9', color: course.status === 'Active' ? '#166534' : '#475569', borderRadius: '20px', fontWeight: 600 }}>{course.status || 'Active'}</div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'modules' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#1F2937', marginBottom: '8px' }}>Daftar Modul Pembelajaran</h3>
                {(!course.modules || course.modules.length === 0) ? (
                  <div style={{ padding: '40px 20px', textAlign: 'center', color: '#888', border: '1px dashed #E2E8F0', borderRadius: '12px' }}>
                    Belum ada modul yang dibuat untuk mata kuliah ini.
                  </div>
                ) : (
                  course.modules.map((mod: any, index: number) => (
                    <div key={mod.id} style={{ border: '1px solid #E5E7EB', borderRadius: '12px', padding: '20px', background: '#FDFDFD' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', borderBottom: '1px solid #F3F4F6', paddingBottom: '10px' }}>
                        <div>
                          <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Pertemuan {index + 1}</span>
                          <h4 style={{ fontSize: '16px', fontWeight: 700, color: '#111827', margin: '4px 0 0 0' }}>{mod.title}</h4>
                        </div>
                      </div>
                      <p style={{ fontSize: '14px', color: '#4B5563', margin: '0 0 16px 0', lineHeight: 1.5 }}>{mod.description || 'Tidak ada deskripsi modul.'}</p>
                      
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '24px', fontSize: '13px', color: '#4B5563' }}>
                        <div>📚 <strong>{mod.materials?.length || 0}</strong> Materi</div>
                        <div>📝 <strong>{mod.assignments?.length || 0}</strong> Tugas</div>
                        <div>🎮 <strong>{mod.quizzes?.length || 0}</strong> Kuis</div>
                        <div>🔬 <strong>{mod.labs?.length || 0}</strong> Praktikum</div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {activeTab === 'students' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#1F2937', marginBottom: '8px' }}>Daftar Mahasiswa Terdaftar</h3>
                {(!course.enrollments || course.enrollments.length === 0) ? (
                  <div style={{ padding: '40px 20px', textAlign: 'center', color: '#888', border: '1px dashed #E2E8F0', borderRadius: '12px' }}>
                    Belum ada mahasiswa yang mengambil mata kuliah ini.
                  </div>
                ) : (
                  <div style={{ border: '1px solid #E5E7EB', borderRadius: '12px', overflow: 'hidden' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
                      <thead>
                        <tr style={{ background: '#F9FAFB', borderBottom: '1px solid #E5E7EB' }}>
                          <th style={{ padding: '16px', fontWeight: 600, color: '#374151' }}>Nama Mahasiswa</th>
                          <th style={{ padding: '16px', fontWeight: 600, color: '#374151' }}>Email / NIM</th>
                          <th style={{ padding: '16px', fontWeight: 600, color: '#374151' }}>Role</th>
                        </tr>
                      </thead>
                      <tbody>
                        {course.enrollments.map((enroll: any) => (
                          <tr key={enroll.id} style={{ borderBottom: '1px solid #E5E7EB' }}>
                            <td style={{ padding: '16px', fontWeight: 600, color: '#111827' }}>{enroll.user?.name}</td>
                            <td style={{ padding: '16px', color: '#4B5563' }}>{enroll.user?.email}</td>
                            <td style={{ padding: '16px' }}>
                              <span style={{ background: '#DEF7EC', color: '#03543F', padding: '4px 10px', borderRadius: '12px', fontSize: '11px', fontWeight: 700 }}>
                                {enroll.user?.role}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

          </div>
        </div>
      </main>
    </div>
  );
}
