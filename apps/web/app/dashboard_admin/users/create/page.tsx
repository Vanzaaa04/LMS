"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { buildApiUrl } from "@/lib/api/apiConfig";
import { AdminSidebar } from "@/components/layout/AdminSidebar";
import "../../dashboard.css";

export default function AdminCreateUserPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState("STUDENT");
  const [angkatan, setAngkatan] = useState<string>("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const currentYear = new Date().getFullYear();
  const angkatanOptions = Array.from({ length: currentYear - 1999 }, (_, i) => currentYear - i);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const token = sessionStorage.getItem("token");
      if (!token) throw new Error("Sesi Anda telah berakhir. Silakan login kembali.");

      const response = await fetch(buildApiUrl("/auth/register"), {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          name, email, password, role,
          ...(role === "STUDENT" && angkatan ? { angkatan: parseInt(angkatan) } : {}),
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Gagal membuat pengguna.");

      setSuccess(`Akun berhasil dibuat untuk ${data.name}! Mengembalikan ke tabel pengguna...`);
      setTimeout(() => router.push("/dashboard_admin/users"), 2000);
    } catch (err: unknown) {
      if (err instanceof Error) setError(err.message);
      else setError("Terjadi kesalahan yang tidak diketahui.");
    } finally {
      setLoading(false);
    }
  };

  const roleLabels: Record<string, string> = { STUDENT: "Mahasiswa", LECTURER: "Dosen", ADMIN: "Administrator" };

  return (
    <div className="admin-dashboard app-wrapper">
      <AdminSidebar activeTab="users" />
      <main className="main-content">
        <header className="top-bar">
          <div>
            <p className="page-title">Tambah Pengguna Baru</p>
            <p className="page-subtitle">Daftarkan akun baru ke dalam sistem Ruang Dosen</p>
          </div>
          <div className="top-bar-right">
            <Link href="/dashboard_admin/users" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '8px 16px', borderRadius: '12px', border: '1px solid var(--border)', color: 'var(--text-secondary)', fontSize: '14px', fontWeight: 600 }}>
              ← Batal & Kembali
            </Link>
          </div>
        </header>

        <div className="dashboard-content">
          <div style={{ background: "var(--card-bg)", borderRadius: "var(--radius-xl, 16px)", padding: "32px", boxShadow: "var(--shadow-sm)", border: "1px solid var(--border)", width: '100%', maxWidth: '600px', margin: '40px auto' }}>
            
            {error && (
              <div style={{ background: '#FEE2E2', color: '#B91C1C', padding: '16px', borderRadius: '12px', marginBottom: '24px', fontSize: '14px', fontWeight: 600 }}>{error}</div>
            )}
            {success && (
              <div style={{ background: '#E7F6EE', color: '#187346', padding: '16px', borderRadius: '12px', marginBottom: '24px', fontSize: '14px', fontWeight: 600 }}>{success}</div>
            )}

            <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <label htmlFor="name" style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 700 }}>Nama Lengkap</label>
                <input type="text" id="name" placeholder="Masukkan nama lengkap" value={name} onChange={e => setName(e.target.value)} required
                  style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid var(--border)', fontSize: '15px' }} />
              </div>

              <div>
                <label htmlFor="email" style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 700 }}>Email / NIM</label>
                <input type="text" id="email" placeholder="contoh: dosen@kampus.ac.id atau 2201083000" value={email} onChange={e => setEmail(e.target.value)} required
                  style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid var(--border)', fontSize: '15px' }} />
              </div>

              <div>
                <label htmlFor="password" style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 700 }}>Password</label>
                <div style={{ position: 'relative' }}>
                  <input type={showPassword ? "text" : "password"} id="password" placeholder="Minimal 6 karakter" value={password} onChange={e => setPassword(e.target.value)} minLength={6} required
                    style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid var(--border)', fontSize: '15px', paddingRight: '48px' }} />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#999' }}>
                    {showPassword ? '🙈' : '👁️'}
                  </button>
                </div>
              </div>

              <div>
                <label htmlFor="role" style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 700 }}>Role Pengguna</label>
                <select id="role" value={role} onChange={e => { setRole(e.target.value); if (e.target.value !== "STUDENT") setAngkatan(""); }} required
                  style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid var(--border)', fontSize: '15px', background: 'white' }}>
                  <option value="STUDENT">Mahasiswa</option>
                  <option value="LECTURER">Dosen</option>
                  <option value="ADMIN">Administrator</option>
                </select>
              </div>

              {role === "STUDENT" && (
                <div>
                  <label htmlFor="angkatan" style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 700 }}>Tahun Angkatan</label>
                  <select id="angkatan" value={angkatan} onChange={e => setAngkatan(e.target.value)} required
                    style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid var(--border)', fontSize: '15px', background: 'white' }}>
                    <option value="" disabled>Pilih tahun angkatan</option>
                    {angkatanOptions.map(year => <option key={year} value={year}>Angkatan {year}</option>)}
                  </select>
                </div>
              )}

              <div style={{ marginTop: '12px' }}>
                <button type="submit" disabled={loading || !!success}
                  style={{ width: '100%', padding: '14px', background: 'var(--primary, #2563EB)', color: 'white', borderRadius: '12px', border: 'none', fontSize: '15px', fontWeight: 600, cursor: 'pointer', opacity: (loading || !!success) ? 0.7 : 1 }}>
                  {loading ? "Menyimpan Data..." : `Daftarkan ${roleLabels[role]}`}
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}

