"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { buildApiUrl } from "@/lib/api/apiConfig";
import "./login.css";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch(buildApiUrl("/auth/login"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Gagal login. Periksa email dan password Anda.");
      }

      sessionStorage.setItem("token", data.access_token);
      sessionStorage.setItem("user", JSON.stringify(data.user));
      document.cookie = `token=${data.access_token}; path=/; max-age=86400; SameSite=Lax`;

      router.replace(getDashboardPathByRole(data.user?.role));
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

  return (
    <div className="login-page">
      <header className="navbar">
        <div className="brand">AFADIA Academy</div>
        <nav className="nav-links">
          <button onClick={() => alert("Pusat Bantuan:\n\n1. Hubungi admin@afadia.ac.id untuk kendala akun.\n2. Baca panduan penggunaan di halaman dashboard masing-masing setelah login.\n3. Laporkan bug ke Tim IT Support.")} style={{ background: 'none', border: 'none', font: 'inherit', color: 'inherit', cursor: 'pointer', padding: 0 }}>Help</button>
          <button onClick={() => alert("Tentang AFADIA Academy:\n\nAFADIA Academy adalah Platform Learning Management System (LMS) Terpadu untuk mahasiswa dan dosen dalam mengelola kelas, praktikum (Practical Lab), tugas, kuis, dan materi kuliah secara interaktif.")} style={{ background: 'none', border: 'none', font: 'inherit', color: 'inherit', cursor: 'pointer', padding: 0 }}>About</button>
          <button className="btn-support" onClick={() => alert("Hubungi Support:\n\nEmail: support@afadia.ac.id\nWhatsApp: +62 812-3456-7890\nJam Operasional: Senin - Jumat, 08.00 - 17.00 WIB")}>Contact Support</button>
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
            <h2>Selamat Datang di AFADIA Academy</h2>
            <p>Platform pembelajaran akademik terpadu</p>
          </div>
        </div>

        {/* Bagian Kanan - Form Login */}
        <div className="form-section">
          <div className="form-wrapper">
            {/* Icon Logo */}
            <div className="form-logo">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
                <path d="M6 12v5c3 3 9 3 12 0v-5" />
              </svg>
            </div>

            <h1>Masuk ke AFADIA Academy</h1>
            <p className="subtitle">
              Silakan masukkan akun akademis Anda untuk melanjutkan.
            </p>

            {error && (
              <div className="error-box">
                <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
                {error}
              </div>
            )}

            <form onSubmit={handleLogin}>
              <div className="input-group">
                <label htmlFor="email">Email / NIM</label>
                <input
                  type="text"
                  id="email"
                  placeholder="contoh: dosen@kampus.ac.id"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="input-group">
                <label htmlFor="password">Password / PIC</label>
                <div className="password-wrapper">
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
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
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                        <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                        <line x1="1" y1="1" x2="23" y2="23" />
                      </>
                    ) : (
                      <>
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                        <circle cx="12" cy="12" r="3" />
                      </>
                    )}
                  </svg>
                </div>
              </div>

              <div className="form-options">
                <label className="remember-me">
                  <input type="checkbox" /> Ingat Saya
                </label>
                <button 
                  type="button" 
                  onClick={() => alert("Silakan hubungi administrator via email di admin@afadia.ac.id atau kunjungi unit IT kampus untuk mereset kata sandi Anda.")}
                  className="forgot-password"
                  style={{ background: 'none', border: 'none', padding: 0, font: 'inherit', cursor: 'pointer' }}
                >
                  Lupa Password?
                </button>
              </div>

              <button type="submit" className="btn-login" disabled={loading}>
                {loading ? "Memproses..." : "Masuk"}
              </button>
            </form>

            <p className="register-link">
              Belum punya akun?{" "}
              <Link href="/register">Daftar di sini</Link>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}

function getDashboardPathByRole(role?: string) {
  const normalizedRole = role?.toUpperCase();
  if (normalizedRole === "ADMIN") return "/dashboard_admin";
  if (normalizedRole === "LECTURER" || normalizedRole === "DOSEN") return "/dashboard_dosen";
  return "/dashboard_mahasiswa";
}
