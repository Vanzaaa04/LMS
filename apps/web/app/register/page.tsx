"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { buildApiUrl } from "@/lib/api/apiConfig";
import "../login/login.css";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState("STUDENT");
  const [angkatan, setAngkatan] = useState<string>("");
  const [semester, setSemester] = useState<string>("1");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // Generate tahun angkatan dari 2000 s/d tahun sekarang
  const currentYear = new Date().getFullYear();
  const angkatanOptions = Array.from(
    { length: currentYear - 1999 },
    (_, i) => currentYear - i
  );

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const response = await fetch(buildApiUrl("/auth/register"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          password,
          role,
          ...(role === "STUDENT" && angkatan ? { angkatan: parseInt(angkatan) } : {}),
          ...(role === "STUDENT" && semester ? { semester: parseInt(semester) } : {}),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Gagal mendaftar. Silakan coba lagi.");
      }

      setSuccess(`Akun berhasil dibuat untuk ${data.name}! Mengarahkan ke halaman login...`);
      setTimeout(() => router.push("/login"), 2000);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Terjadi kesalahan yang tidak diketahui.");
      }
    } finally {
      setLoading(false);
    }
  };

  const roleLabels: Record<string, string> = {
    STUDENT: "Mahasiswa",
    LECTURER: "Dosen",
    ADMIN: "Administrator",
  };

  return (
    <div className="login-page">
      <header className="navbar">
        <div className="brand">AFADIA Academy</div>
        <nav className="nav-links">
          <button onClick={() => alert("Pusat Bantuan:\n\n1. Hubungi admin@ruangdosen.ac.id untuk kendala pendaftaran.\n2. Baca panduan penggunaan setelah akun Anda aktif.\n3. Laporkan bug ke Tim IT Support.")} style={{ background: 'none', border: 'none', font: 'inherit', color: 'inherit', cursor: 'pointer', padding: 0 }}>Help</button>
          <button onClick={() => alert("Tentang AFADIA Academy:\n\nAFADIA Academy adalah Platform Learning Management System (LMS) Terpadu untuk mahasiswa dan dosen dalam mengelola kelas, praktikum (Practical Lab), tugas, kuis, dan materi kuliah secara interaktif.")} style={{ background: 'none', border: 'none', font: 'inherit', color: 'inherit', cursor: 'pointer', padding: 0 }}>About</button>
          <button className="btn-support" onClick={() => alert("Hubungi Support:\n\nEmail: support@ruangdosen.ac.id\nWhatsApp: +62 812-3456-7890\nJam Operasional: Senin - Jumat, 08.00 - 17.00 WIB")}>Contact Support</button>
        </nav>
      </header>

      <main className="login-container">
        {/* Bagian Kiri - Gambar dengan overlay */}
        <div className="image-section">
          <img
            src="https://images.unsplash.com/photo-1541339907198-e08756dedf3f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80"
            alt="Wisudawan"
            className="campus-image"
          />
          <div className="image-overlay">
            <h2>Bergabunglah Bersama Kami</h2>
            <p>Mulai perjalanan akademikmu bersama AFADIA Academy</p>
          </div>
        </div>

        {/* Bagian Kanan - Form Register */}
        <div className="form-section">
          <div className="form-wrapper">
            {/* Icon Logo */}
            <div className="form-logo">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
                <circle cx="9" cy="7" r="4"/>
                <line x1="19" y1="8" x2="19" y2="14"/>
                <line x1="22" y1="11" x2="16" y2="11"/>
              </svg>
            </div>

            <h1>Daftar Akun Baru</h1>
            <p className="subtitle">
              Silakan lengkapi data diri Anda untuk bergabung ke AFADIA Academy.
            </p>

            {error && (
              <div className="error-box">
                <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                {error}
              </div>
            )}

            {success && (
              <div className="success-box">
                <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                {success}
              </div>
            )}

            <form onSubmit={handleRegister}>
              <div className="input-group">
                <label htmlFor="name">Nama Lengkap</label>
                <input
                  type="text"
                  id="name"
                  placeholder="Masukkan nama lengkap Anda"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div className="input-group">
                <label htmlFor="email">Email / NIM</label>
                <input
                  type="email"
                  id="email"
                  placeholder="contoh: mahasiswa@kampus.ac.id"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="input-group">
                <label htmlFor="password">Password</label>
                <div className="password-wrapper">
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    placeholder="Min. 8 karakter"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    minLength={6}
                    required
                  />
                  <svg
                    className="toggle-password"
                    onClick={() => setShowPassword(!showPassword)}
                    xmlns="http://www.w3.org/2000/svg"
                    width="20" height="20" viewBox="0 0 24 24"
                    fill="none" stroke="currentColor" strokeWidth="2"
                    strokeLinecap="round" strokeLinejoin="round"
                  >
                    {showPassword ? (
                      <>
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
                        <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
                        <line x1="1" y1="1" x2="23" y2="23"/>
                      </>
                    ) : (
                      <>
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                        <circle cx="12" cy="12" r="3"/>
                      </>
                    )}
                  </svg>
                </div>
              </div>

              <div className="input-group">
                <label htmlFor="role">Daftar Sebagai</label>
                <select
                  id="role"
                  value={role}
                  onChange={(e) => {
                    setRole(e.target.value);
                    // Reset angkatan saat ganti role
                    if (e.target.value !== "STUDENT") setAngkatan("");
                  }}
                  required
                >
                  <option value="STUDENT">Mahasiswa</option>
                  <option value="LECTURER">Dosen</option>
                  <option value="ADMIN">Administrator</option>
                </select>
              </div>

              {/* Field Angkatan — hanya muncul jika role STUDENT */}
              {role === "STUDENT" && (
                <div className="input-group">
                  <label htmlFor="angkatan">Angkatan (Tahun Masuk)</label>
                  <select
                    id="angkatan"
                    value={angkatan}
                    onChange={(e) => setAngkatan(e.target.value)}
                    required
                  >
                    <option value="" disabled>Pilih tahun angkatan</option>
                    {angkatanOptions.map((year) => (
                      <option key={year} value={year}>
                        Angkatan {year}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Field Semester — hanya muncul jika role STUDENT */}
              {role === "STUDENT" && (
                <div className="input-group">
                  <label htmlFor="semester">Semester Aktif</label>
                  <select
                    id="semester"
                    value={semester}
                    onChange={(e) => setSemester(e.target.value)}
                    required
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
                      <option key={sem} value={sem}>
                        Semester {sem}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <button
                type="submit"
                className="btn-login"
                style={{ marginTop: "8px" }}
                disabled={loading || !!success}
              >
                {loading ? "Memproses..." : `Daftar sebagai ${roleLabels[role]}`}
              </button>
            </form>

            <p className="register-link">
              Sudah punya akun?{" "}
              <Link href="/login">Masuk di sini</Link>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
