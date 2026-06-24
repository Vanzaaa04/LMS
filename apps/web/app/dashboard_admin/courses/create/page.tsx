"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { buildApiUrl } from "@/lib/api/apiConfig";
import { AdminSidebar } from "@/components/layout/AdminSidebar";
import "../../dashboard.css";

const CREDIT_OPTIONS = ['2', '3', '4'];
const SEMESTER_OPTIONS = [1, 2, 3, 4, 5, 6, 7, 8];

export default function AdminCreateCoursePage() {
  const router = useRouter();
  const [draft, setDraft] = useState({
    title: '',
    className: '',
    semester: '',
    credits: '3',
    enrollmentCap: '40',
    description: '',
    department: 'Teknik Informatika',
    teachingFormat: 'Teori dan Praktikum',
    targetSemester: '1',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!draft.title) {
      setError("Silakan isi Judul Mata Kuliah.");
      return;
    }
    setLoading(true);
    setError(null);
    setSuccess(null);
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
          className: draft.className || null,
          credits: Number(draft.credits),
          semester: draft.semester,
          enrollmentCap: Number(draft.enrollmentCap),
          department: draft.department,
          teachingFormat: draft.teachingFormat,
          targetSemester: Number(draft.targetSemester),
          // No instructorId — Dosen will claim the class later
        })
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Gagal membuat mata kuliah");
      }

      setSuccess(`✅ Mata Kuliah "${draft.title}"${draft.className ? ` Kelas ${draft.className}` : ''} berhasil dibuat!`);
      // Reset form for quick multi-creation
      setDraft(d => ({ ...d, className: '', description: '' }));
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const labelStyle: React.CSSProperties = { display: 'block', fontSize: '14px', fontWeight: 600, color: '#334155', marginBottom: '8px' };
  const inputStyle: React.CSSProperties = { width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #CBD5E1', fontSize: '14px', transition: 'border-color 0.2s' };

  return (
    <div className="admin-dashboard app-wrapper">
      <AdminSidebar activeTab="courses" />
      <main className="main-content">
        <header className="top-bar">
          <div>
            <p className="page-title">Manajemen Mata Kuliah</p>
            <p className="page-subtitle">Buat mata kuliah baru beserta kelasnya. Dosen akan mengambil kelas secara mandiri.</p>
          </div>
        </header>
        <div className="dashboard-content" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
            <Link href="/dashboard_admin/courses" style={{ color: 'var(--text-secondary)' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
            </Link>
            <div>
              <h1 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>Tambah Mata Kuliah & Kelas</h1>
              <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginTop: '4px' }}>
                Buat mata kuliah baru. Dosen akan mengambil kelas melalui halaman "Kelas Tersedia".
              </p>
            </div>
          </div>

          {/* Info Banner */}
          <div style={{ background: 'linear-gradient(135deg, #EEF2FF, #E0E7FF)', borderRadius: 12, padding: '16px 20px', marginBottom: 24, border: '1px solid #C7D2FE', display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontSize: 24 }}>💡</span>
            <div>
              <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: '#3730A3' }}>Tips: Buat Beberapa Kelas Sekaligus</p>
              <p style={{ margin: '4px 0 0', fontSize: 12, color: '#4338CA' }}>
                Setelah berhasil membuat kelas, form tidak akan di-reset sepenuhnya. Anda bisa langsung mengubah nama kelas (misal dari "A" ke "B") lalu klik Simpan lagi.
              </p>
            </div>
          </div>

          <div style={{ background: 'white', borderRadius: '16px', padding: '32px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}>
            {error && <div style={{ padding: '12px 16px', background: '#FEF2F2', color: '#B91C1C', borderRadius: '10px', marginBottom: '20px', fontSize: '14px', fontWeight: 500 }}>{error}</div>}
            {success && <div style={{ padding: '12px 16px', background: '#F0FDF4', color: '#166534', borderRadius: '10px', marginBottom: '20px', fontSize: '14px', fontWeight: 500 }}>{success}</div>}

            <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* Row 1: Title + Class Name */}
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px' }}>
                <div>
                  <label style={labelStyle}>Judul Mata Kuliah *</label>
                  <input type="text" value={draft.title} onChange={e => setDraft({...draft, title: e.target.value})} placeholder="Contoh: Pemrograman Web Lanjut" style={inputStyle} required />
                </div>
                <div>
                  <label style={labelStyle}>Nama Kelas</label>
                  <input type="text" value={draft.className} onChange={e => setDraft({...draft, className: e.target.value})} placeholder="Contoh: A, B, Reguler" style={inputStyle} />
                </div>
              </div>

              {/* Row 2: Target Semester + Department + Teaching Format */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px' }}>
                <div>
                  <label style={labelStyle}>Target Semester *</label>
                  <select 
                    value={draft.targetSemester} 
                    onChange={e => {
                      const val = e.target.value;
                      const sem = parseInt(val);
                      const currentYear = new Date().getFullYear();
                      const period = (sem % 2 === 1) ? `Ganjil ${currentYear}/${currentYear + 1}` : `Genap ${currentYear}/${currentYear + 1}`;
                      setDraft({ ...draft, targetSemester: val, semester: period });
                    }} 
                    style={{ ...inputStyle, background: 'white' }}
                  >
                    {SEMESTER_OPTIONS.map(s => <option key={s} value={s}>Semester {s}</option>)}
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Jurusan / Departemen</label>
                  <input type="text" value={draft.department} onChange={e => setDraft({...draft, department: e.target.value})} style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Format Pengajaran</label>
                  <select value={draft.teachingFormat} onChange={e => setDraft({...draft, teachingFormat: e.target.value})} style={{ ...inputStyle, background: 'white' }}>
                    <option value="Teori dan Praktikum">Teori dan Praktikum</option>
                    <option value="Teori">Teori</option>
                    <option value="Praktikum">Praktikum</option>
                  </select>
                </div>
              </div>

              {/* Row 3: SKS + Kapasitas + Periode Semester */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px' }}>
                <div>
                  <label style={labelStyle}>SKS</label>
                  <select value={draft.credits} onChange={e => setDraft({...draft, credits: e.target.value})} style={{ ...inputStyle, background: 'white' }}>
                    {CREDIT_OPTIONS.map(c => <option key={c} value={c}>{c} SKS</option>)}
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Kapasitas Mahasiswa</label>
                  <input type="number" value={draft.enrollmentCap} onChange={e => setDraft({...draft, enrollmentCap: e.target.value})} style={inputStyle} min="1" />
                </div>
                <div>
                  <label style={labelStyle}>Periode Semester</label>
                  <input type="text" value={draft.semester} onChange={e => setDraft({...draft, semester: e.target.value})} placeholder="Contoh: Ganjil 2026/2027" style={inputStyle} />
                </div>
              </div>

              {/* Description */}
              <div>
                <label style={labelStyle}>Deskripsi Mata Kuliah</label>
                <textarea value={draft.description} onChange={e => setDraft({...draft, description: e.target.value})} placeholder="Tuliskan gambaran umum dan tujuan pembelajaran (Opsional)..." rows={4} style={{ ...inputStyle, resize: 'vertical' }}></textarea>
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '8px' }}>
                <Link href="/dashboard_admin/courses" style={{ padding: '10px 20px', background: '#F1F5F9', color: '#475569', borderRadius: '10px', fontWeight: 600, textDecoration: 'none', fontSize: '14px', display: 'inline-flex', alignItems: 'center' }}>Batal</Link>
                <button type="submit" disabled={loading} style={{ padding: '10px 28px', background: loading ? '#94a3b8' : 'var(--primary)', color: 'white', borderRadius: '10px', fontWeight: 700, border: 'none', fontSize: '14px', cursor: loading ? 'not-allowed' : 'pointer', transition: 'all 0.2s' }}>
                  {loading ? 'Menyimpan...' : '✨ Buat Mata Kuliah'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
