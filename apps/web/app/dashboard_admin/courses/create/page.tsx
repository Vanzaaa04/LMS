"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { buildApiUrl } from "@/lib/api/apiConfig";
import { AdminSidebar } from "@/components/layout/AdminSidebar";
import "../../dashboard.css";

const CREDIT_OPTIONS = ['2', '3', '4'];

export default function AdminCreateCoursePage() {
  const router = useRouter();
  const [draft, setDraft] = useState({
    title: '',
    semester: '',
    credits: '3',
    enrollmentCap: '60',
    description: '',
    instructorId: ''
  });
  
  const [lecturers, setLecturers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLecturers = async () => {
      try {
        const token = sessionStorage.getItem('token');
        if (!token) return;
        const res = await fetch(buildApiUrl('/admin/users?role=LECTURER'), {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setLecturers(data);
          if (data.length > 0) {
            setDraft(d => ({ ...d, instructorId: data[0].id }));
          }
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchLecturers();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!draft.title || !draft.description || !draft.instructorId) {
      setError("Silakan lengkapi semua data wajib.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const token = sessionStorage.getItem('token');
      const res = await fetch(buildApiUrl('/courses'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          title: draft.title,
          description: draft.description,
          credits: Number(draft.credits),
          semester: draft.semester,
          enrollmentCap: Number(draft.enrollmentCap),
          instructorId: draft.instructorId
        })
      });
      
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Gagal membuat mata kuliah");
      }
      
      router.push('/dashboard_admin/courses');
    } catch (err: any) {
      setError(err.message);
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
            <p className="page-subtitle">Tambah mata kuliah baru dan tugaskan dosen pengampu.</p>
          </div>
        </header>
        <div className="dashboard-content" style={{ padding: '24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
        <Link href="/dashboard_admin/courses" style={{ color: 'var(--text-secondary)' }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
        </Link>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>Tambah Mata Kuliah</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginTop: '4px' }}>Buat mata kuliah baru dan tugaskan dosen pengampu.</p>
        </div>
      </div>

      <div style={{ background: 'white', borderRadius: '16px', padding: '32px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}>
        {error && <div style={{ padding: '12px', background: '#FEF2F2', color: '#B91C1C', borderRadius: '8px', marginBottom: '24px', fontSize: '14px' }}>{error}</div>}
        
        <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: '#334155', marginBottom: '8px' }}>Judul Mata Kuliah</label>
            <input type="text" value={draft.title} onChange={e => setDraft({...draft, title: e.target.value})} placeholder="Contoh: Pemrograman Web Dasar" style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #CBD5E1' }} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '20px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: '#334155', marginBottom: '8px' }}>Dosen Pengampu</label>
              <select value={draft.instructorId} onChange={e => setDraft({...draft, instructorId: e.target.value})} style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #CBD5E1', background: 'white' }}>
                {lecturers.length === 0 && <option value="">Loading Dosen...</option>}
                {lecturers.map(l => <option key={l.id} value={l.id}>{l.name} ({l.email})</option>)}
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: '#334155', marginBottom: '8px' }}>Semester</label>
              <input type="text" value={draft.semester} onChange={e => setDraft({...draft, semester: e.target.value})} placeholder="Contoh: Ganjil 2026/2027" style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #CBD5E1' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: '#334155', marginBottom: '8px' }}>SKS</label>
              <select value={draft.credits} onChange={e => setDraft({...draft, credits: e.target.value})} style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #CBD5E1', background: 'white' }}>
                {CREDIT_OPTIONS.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: '#334155', marginBottom: '8px' }}>Kapasitas Maksimal</label>
              <input type="number" value={draft.enrollmentCap} onChange={e => setDraft({...draft, enrollmentCap: e.target.value})} style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #CBD5E1' }} />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: '#334155', marginBottom: '8px' }}>Deskripsi Mata Kuliah</label>
            <textarea value={draft.description} onChange={e => setDraft({...draft, description: e.target.value})} placeholder="Tuliskan gambaran umum dan tujuan pembelajaran..." rows={4} style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #CBD5E1', resize: 'vertical' }}></textarea>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '16px' }}>
            <Link href="/dashboard_admin/courses" style={{ padding: '10px 20px', background: '#F1F5F9', color: '#475569', borderRadius: '8px', fontWeight: 600, textDecoration: 'none', fontSize: '14px' }}>Batal</Link>
            <button type="submit" disabled={loading} style={{ padding: '10px 24px', background: 'var(--primary)', color: 'white', borderRadius: '8px', fontWeight: 600, border: 'none', fontSize: '14px', cursor: loading ? 'not-allowed' : 'pointer' }}>
              {loading ? 'Menyimpan...' : 'Buat Mata Kuliah'}
            </button>
          </div>
        </form>
      </div>
      </div>
      </main>
    </div>
  );
}

