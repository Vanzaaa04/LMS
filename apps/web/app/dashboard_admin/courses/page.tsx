"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { buildApiUrl } from "@/lib/api/apiConfig";
import { AdminSidebar } from "@/components/layout/AdminSidebar";
import "../dashboard.css";

export default function AdminCoursesPage() {
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const token = sessionStorage.getItem("token");
      if (!token) return;
      const res = await fetch(buildApiUrl("/courses"), {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setCourses(await res.json());
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-dashboard app-wrapper">
      <AdminSidebar activeTab="courses" />
      <main className="main-content">
        <header className="top-bar">
          <div>
            <p className="page-title">Manajemen Mata Kuliah</p>
            <p className="page-subtitle">Kelola semua mata kuliah dan kelas yang ada di sistem.</p>
          </div>
        </header>
        <div className="dashboard-content" style={{ padding: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', marginBottom: '24px' }}>
        <Link href="/dashboard_admin/courses/create" style={{ background: 'var(--primary)', color: 'white', padding: '10px 16px', borderRadius: '8px', textDecoration: 'none', fontWeight: 600, fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
          Tambah Mata Kuliah
        </Link>
      </div>

      <div style={{ background: 'white', borderRadius: '12px', border: '1px solid var(--border)', overflow: 'hidden' }}>
        <table className="users-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={{ textAlign: 'left', padding: '16px', borderBottom: '1px solid var(--border)', background: '#f8fafc', fontSize: '12px', color: 'var(--text-secondary)' }}>MATA KULIAH</th>
              <th style={{ textAlign: 'left', padding: '16px', borderBottom: '1px solid var(--border)', background: '#f8fafc', fontSize: '12px', color: 'var(--text-secondary)' }}>KELAS</th>
              <th style={{ textAlign: 'left', padding: '16px', borderBottom: '1px solid var(--border)', background: '#f8fafc', fontSize: '12px', color: 'var(--text-secondary)' }}>DOSEN PENGAMPU</th>
              <th style={{ textAlign: 'left', padding: '16px', borderBottom: '1px solid var(--border)', background: '#f8fafc', fontSize: '12px', color: 'var(--text-secondary)' }}>SEMESTER</th>
              <th style={{ textAlign: 'left', padding: '16px', borderBottom: '1px solid var(--border)', background: '#f8fafc', fontSize: '12px', color: 'var(--text-secondary)' }}>MAHASISWA</th>
              <th style={{ textAlign: 'right', padding: '16px', borderBottom: '1px solid var(--border)', background: '#f8fafc', fontSize: '12px', color: 'var(--text-secondary)' }}>AKSI</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} style={{ textAlign: 'center', padding: '24px', color: '#888' }}>Memuat data...</td></tr>
            ) : courses.length === 0 ? (
              <tr><td colSpan={6} style={{ textAlign: 'center', padding: '24px', color: '#888' }}>Belum ada mata kuliah terdaftar.</td></tr>
            ) : (
              courses.map(course => (
                <tr key={course.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '16px' }}>
                    <strong style={{ display: 'block', fontSize: '14px', color: '#111' }}>{course.title}</strong>
                    <span style={{ fontSize: '12px', color: '#666' }}>{course.department} • {course.credits} SKS</span>
                  </td>
                  <td style={{ padding: '16px' }}>
                    {course.className ? (
                      <span style={{ padding: '4px 10px', borderRadius: '8px', fontSize: '12px', fontWeight: 700, background: '#EEF2FF', color: '#4338CA' }}>Kelas {course.className}</span>
                    ) : (
                      <span style={{ fontSize: '12px', color: '#94a3b8' }}>—</span>
                    )}
                  </td>
                  <td style={{ padding: '16px', fontSize: '13px', color: '#333' }}>
                    {course.instructor ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#DBEAFE', color: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600, fontSize: '10px' }}>
                          {course.instructor.name?.substring(0, 2).toUpperCase()}
                        </div>
                        {course.instructor.name}
                      </div>
                    ) : (
                      <span style={{ padding: '4px 10px', borderRadius: '8px', fontSize: '11px', fontWeight: 600, background: '#FEF3C7', color: '#92400E' }}>Belum ada dosen</span>
                    )}
                  </td>
                  <td style={{ padding: '16px' }}>
                    <span style={{ padding: '4px 10px', borderRadius: '8px', fontSize: '12px', fontWeight: 700, background: 'linear-gradient(135deg, #2563EB11, #7C3AED11)', color: '#4338CA' }}>Semester {course.targetSemester || '—'}</span>
                  </td>
                  <td style={{ padding: '16px', fontSize: '13px', color: '#333' }}>
                    {course._count?.enrollments || 0} / {course.enrollmentCap}
                  </td>
                  <td style={{ padding: '16px', textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                      <Link href={`/dashboard_admin/courses/${course.id}`} style={{ background: '#f1f5f9', color: '#334155', textDecoration: 'none', padding: '6px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: 600, display: 'inline-block' }}>Detail</Link>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
        </div>
      </main>
    </div>
  );
}

