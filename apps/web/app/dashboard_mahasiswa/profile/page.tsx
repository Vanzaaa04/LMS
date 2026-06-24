"use client";

import Link from "next/link";
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { buildApiUrl } from "@/lib/api/apiConfig";
import { StudentDashboardLayout } from "@/components/layout/StudentDashboardLayout";
import "../dashboard.css";
import "./profile.css";

/* ──────────────────────────────────────────────
   TYPES
─────────────────────────────────────────────── */
interface StudentProfile {
  id: string;
  name: string;
  email: string;
  role: string;
  xp: number;
  maxCredits: number;
  angkatan: number | null;
  semester: number | null;
  usedCredits: number;
  remainingCredits: number;
  createdAt: string;
}

/* ──────────────────────────────────────────────
   MAIN PAGE COMPONENT
─────────────────────────────────────────────── */
export default function MahasiswaProfilePage() {
  const router = useRouter();

  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState("");

  // Edit mode
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState("");
  const [editPassword, setEditPassword] = useState("");
  const [editSemester, setEditSemester] = useState<string>("");
  const [showPassword, setShowPassword] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState("");
  const [saveError, setSaveError] = useState("");

  /* ── fetch profile ── */
  const fetchProfile = useCallback(async () => {
    const token = sessionStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    try {
      const res = await fetch(buildApiUrl("/auth/profile"), {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.status === 401) {
        router.push("/login");
        return;
      }

      if (!res.ok) throw new Error("Gagal memuat profil.");

      const data: StudentProfile = await res.json();

      // Hanya izinkan mahasiswa
      if (data.role !== "STUDENT") {
        router.push("/dashboard_mahasiswa");
        return;
      }

      setProfile(data);
      setEditName(data.name);
      setEditSemester(data.semester?.toString() || "");
    } catch (err: unknown) {
      setFetchError(err instanceof Error ? err.message : "Terjadi kesalahan.");
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  /* ── save handler ── */
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveSuccess("");
    setSaveError("");
    setSaving(true);

    const token = sessionStorage.getItem("token");
    if (!token) { router.push("/login"); return; }

    try {
      const body: Record<string, any> = {};
      if (editName.trim() && editName.trim() !== profile?.name) {
        body.name = editName.trim();
      }
      if (editPassword) {
        if (editPassword.length < 6) {
          setSaveError("Password minimal 6 karakter.");
          setSaving(false);
          return;
        }
        body.password = editPassword;
      }
      const parsedSemester = parseInt(editSemester, 10);
      if (!isNaN(parsedSemester) && parsedSemester !== profile?.semester) {
        body.semester = parsedSemester;
      }

      if (Object.keys(body).length === 0) {
        setSaveError("Tidak ada perubahan yang disimpan.");
        setSaving(false);
        return;
      }

      const res = await fetch(buildApiUrl("/auth/profile"), {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Gagal menyimpan perubahan.");
      }

      // Update sessionStorage user name if name changed
      if (body.name) {
        try {
          const storedUser = JSON.parse(sessionStorage.getItem("user") || "{}");
          storedUser.name = body.name;
          sessionStorage.setItem("user", JSON.stringify(storedUser));
        } catch { /* ignore */ }
      }

      setSaveSuccess("Profil berhasil diperbarui!");
      setEditPassword("");
      setIsEditing(false);
      fetchProfile(); // refresh data
    } catch (err: unknown) {
      setSaveError(err instanceof Error ? err.message : "Terjadi kesalahan.");
    } finally {
      setSaving(false);
    }
  };

  /* ── helpers ── */
  const getInitials = (name: string) =>
    name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();

  const formatDate = (iso: string) => {
    try {
      return new Date(iso).toLocaleDateString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });
    } catch {
      return "-";
    }
  };

  const formatDateShort = (iso: string) => {
    try {
      return new Date(iso).toLocaleDateString("id-ID", {
        month: "short",
        year: "numeric",
      });
    } catch {
      return "-";
    }
  };

  const sksPercent = profile
    ? Math.round((profile.usedCredits / profile.maxCredits) * 100)
    : 0;

  const getMemberDuration = (iso: string) => {
    try {
      const diffMs = Date.now() - new Date(iso).getTime();
      const days = Math.floor(diffMs / 86400000);
      if (days < 30) return `${days} hari`;
      const months = Math.floor(days / 30);
      if (months < 12) return `${months} bulan`;
      return `${Math.floor(months / 12)} tahun`;
    } catch {
      return "-";
    }
  };

  /* ──────────────────────────────────────────────
     RENDER
  ─────────────────────────────────────────────── */
  if (loading) {
    return (
      <StudentDashboardLayout title="Profil Saya" activeTab="profile">
        <div className="profile-page" style={{ display: "flex", justifyContent: "center", minHeight: "60vh" }}>
          <div className="profile-loading">
            <div className="profile-spinner" />
            <p className="profile-loading-text">Memuat profil mahasiswa…</p>
          </div>
        </div>
      </StudentDashboardLayout>
    );
  }

  if (fetchError || !profile) {
    return (
      <StudentDashboardLayout title="Profil Saya" activeTab="profile">
        <div className="profile-page">
          <div className="profile-error-banner">
            <AlertIcon />
            {fetchError || "Profil tidak ditemukan."}
          </div>
        </div>
      </StudentDashboardLayout>
    );
  }

  return (
    <StudentDashboardLayout title="Profil Saya" activeTab="profile">
      <div className="profile-page">
          {/* ── HERO HEADER ── */}
      <section className="profile-hero">
        <div className="profile-hero-dots" />
        <div className="profile-hero-inner">
          {/* Avatar */}
          <div className="profile-avatar-wrap">
            <div className="profile-avatar overflow-hidden">
              <img 
                src="/custom_avatar.png" 
                alt="Avatar Mahasiswa" 
                className="w-full h-full object-cover"
              />
            </div>
            <div className="profile-avatar-badge">
              <CheckSmIcon />
            </div>
          </div>

          {/* Info */}
          <div className="profile-hero-info">
            <p className="profile-hero-greeting">Profil Mahasiswa</p>
            <h1 className="profile-hero-name">{profile.name}</h1>

            <div className="profile-hero-meta">
              <span className="profile-hero-chip">
                <GraduationIcon />
                Mahasiswa
              </span>
              {profile.angkatan && (
                <span className="profile-hero-chip">
                  <CalendarIcon />
                  Angkatan {profile.angkatan}
                </span>
              )}
              <span className="profile-hero-chip">
                <StarIcon />
                {profile.xp ?? 0} XP
              </span>
            </div>

            <p className="profile-hero-email">
              <MailIcon />
              {profile.email}
            </p>
          </div>

          {/* Actions */}
          <div className="profile-hero-actions">
            <button
              className="btn-edit-profile"
              onClick={() => {
                setIsEditing(true);
                setSaveError("");
                setSaveSuccess("");
                setEditName(profile.name);
                setEditPassword("");
              }}
              disabled={isEditing}
              id="btn-edit-profile"
            >
              <EditIcon />
              Edit Profil
            </button>
            <Link href="/dashboard_mahasiswa" className="btn-back-dashboard">
              <ArrowLeftIcon />
              Dashboard
            </Link>
          </div>
        </div>
      </section>

      {/* ── STAT CARDS ROW ── */}
      <section className="profile-stats-row">
        <div className="profile-stat-card">
          <div className="profile-stat-accent blue" />
          <div className="profile-stat-icon blue">
            <BookOpenIcon />
          </div>
          <div className="profile-stat-body">
            <p className="profile-stat-label">SKS Diambil</p>
            <p className="profile-stat-value">{profile.usedCredits}</p>
            <p className="profile-stat-sub">dari {profile.maxCredits} SKS</p>
          </div>
        </div>

        <div className="profile-stat-card">
          <div className="profile-stat-accent green" />
          <div className="profile-stat-icon green">
            <CheckCircleIcon />
          </div>
          <div className="profile-stat-body">
            <p className="profile-stat-label">SKS Tersisa</p>
            <p className="profile-stat-value">{profile.remainingCredits}</p>
            <p className="profile-stat-sub">SKS masih bisa diambil</p>
          </div>
        </div>

        <div className="profile-stat-card">
          <div className="profile-stat-accent purple" />
          <div className="profile-stat-icon purple">
            <ZapIcon />
          </div>
          <div className="profile-stat-body">
            <p className="profile-stat-label">Total XP</p>
            <p className="profile-stat-value">{profile.xp ?? 0}</p>
            <p className="profile-stat-sub">Experience points</p>
          </div>
        </div>

        <div className="profile-stat-card">
          <div className="profile-stat-accent orange" />
          <div className="profile-stat-icon orange">
            <TrendingUpIcon />
          </div>
          <div className="profile-stat-body">
            <p className="profile-stat-label">Max SKS</p>
            <p className="profile-stat-value">{profile.maxCredits}</p>
            <p className="profile-stat-sub">Batas SKS semester ini</p>
          </div>
        </div>
      </section>

      {/* ── SUCCESS / ERROR GLOBAL ── */}
      {saveSuccess && (
        <div className="profile-success-msg">
          <CheckCircleIcon />
          {saveSuccess}
        </div>
      )}

      {/* ── MAIN GRID ── */}
      <div className="profile-grid">
        {/* LEFT COLUMN */}
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          {/* Data Pribadi Card */}
          <div className="profile-card">
            <div className="profile-card-header">
              <h2 className="profile-card-title">
                <span className="profile-card-title-icon blue">
                  <UserIcon />
                </span>
                Data Pribadi
              </h2>
              {!isEditing && (
                <button
                  className="btn-edit-profile"
                  style={{ fontSize: "12px", padding: "8px 14px" }}
                  onClick={() => {
                    setIsEditing(true);
                    setSaveError("");
                    setSaveSuccess("");
                    setEditName(profile.name);
                    setEditPassword("");
                  }}
                  id="btn-edit-inline"
                >
                  <EditIcon />
                  Edit
                </button>
              )}
            </div>
            <div className="profile-card-body">
              {/* VIEW MODE */}
              {!isEditing && (
                <div className="profile-info-grid">
                  <div className="profile-field">
                    <span className="profile-field-label">Nama Lengkap</span>
                    <span className="profile-field-value">{profile.name}</span>
                  </div>
                  <div className="profile-field">
                    <span className="profile-field-label">Email</span>
                    <span className="profile-field-value">{profile.email}</span>
                  </div>
                  <div className="profile-field">
                    <span className="profile-field-label">Role</span>
                    <span className="profile-field-value">
                      <span className="profile-role-badge student">
                        <GraduationIcon />
                        Mahasiswa
                      </span>
                    </span>
                  </div>
                  <div className="profile-field">
                    <span className="profile-field-label">Angkatan</span>
                    <span className="profile-field-value">
                      {profile.angkatan
                        ? `Angkatan ${profile.angkatan}`
                        : <span className="muted">Belum diatur</span>}
                    </span>
                  </div>
                  <div className="profile-field">
                    <span className="profile-field-label">Semester</span>
                    <span className="profile-field-value">
                      {profile.semester
                        ? `Semester ${profile.semester}`
                        : <span className="muted">Belum diatur</span>}
                    </span>
                  </div>
                  <div className="profile-field">
                    <span className="profile-field-label">Bergabung Sejak</span>
                    <span className="profile-field-value">{formatDate(profile.createdAt)}</span>
                  </div>
                  <div className="profile-field">
                    <span className="profile-field-label">ID Akun</span>
                    <span className="profile-field-value" style={{ fontSize: "12px", wordBreak: "break-all" }}>
                      {profile.id}
                    </span>
                  </div>
                </div>
              )}

              {/* EDIT MODE */}
              {isEditing && (
                <form className="profile-form" onSubmit={handleSave}>
                  {saveError && (
                    <div className="profile-error-msg">
                      <AlertIcon />
                      {saveError}
                    </div>
                  )}

                  <div className="profile-form-row">
                    <div className="profile-input-group">
                      <label className="profile-input-label" htmlFor="edit-name">
                        Nama Lengkap
                      </label>
                      <input
                        id="edit-name"
                        className="profile-input"
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        required
                        disabled={saving}
                        placeholder="Masukkan nama lengkap"
                      />
                    </div>
                    <div className="profile-input-group">
                      <label className="profile-input-label">Email</label>
                      <input
                        className="profile-input"
                        type="email"
                        value={profile.email}
                        disabled
                      />
                      <span className="profile-input-hint">Email tidak dapat diubah</span>
                    </div>
                  </div>

                  <div className="profile-form-row">
                    <div className="profile-input-group">
                      <label className="profile-input-label">Angkatan</label>
                      <input
                        className="profile-input"
                        type="text"
                        value={profile.angkatan ? `Angkatan ${profile.angkatan}` : "-"}
                        disabled
                      />
                      <span className="profile-input-hint">Angkatan tidak dapat diubah</span>
                    </div>
                    <div className="profile-input-group">
                      <label className="profile-input-label" htmlFor="edit-semester">
                        Semester Saat Ini
                      </label>
                      <input
                        id="edit-semester"
                        className="profile-input"
                        type="number"
                        min="1"
                        max="14"
                        value={editSemester}
                        onChange={(e) => setEditSemester(e.target.value)}
                        disabled={saving}
                        placeholder="Contoh: 1"
                        required
                      />
                    </div>
                  </div>

                  <div className="profile-form-row">
                    <div className="profile-input-group">
                      <label className="profile-input-label" htmlFor="edit-password">
                        Password Baru{" "}
                        <span style={{ color: "var(--text-muted)", fontWeight: 500 }}>
                          (opsional)
                        </span>
                      </label>
                      <div className="profile-password-wrap">
                        <input
                          id="edit-password"
                          className="profile-input"
                          type={showPassword ? "text" : "password"}
                          value={editPassword}
                          onChange={(e) => setEditPassword(e.target.value)}
                          placeholder="Min. 6 karakter"
                          disabled={saving}
                          minLength={6}
                        />
                        <button
                          type="button"
                          className="profile-password-toggle"
                          onClick={() => setShowPassword((v) => !v)}
                          tabIndex={-1}
                        >
                          {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="profile-form-actions">
                    <button
                      type="submit"
                      className="btn-save"
                      disabled={saving}
                      id="btn-save-profile"
                    >
                      {saving ? "Menyimpan…" : "Simpan Perubahan"}
                    </button>
                    <button
                      type="button"
                      className="btn-cancel"
                      onClick={() => {
                        setIsEditing(false);
                        setSaveError("");
                        setEditName(profile.name);
                        setEditSemester(profile.semester?.toString() || "");
                        setEditPassword("");
                      }}
                      disabled={saving}
                    >
                      Batal
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>

          {/* Aktivitas / Timeline Card */}
          <div className="profile-card">
            <div className="profile-card-header">
              <h2 className="profile-card-title">
                <span className="profile-card-title-icon purple">
                  <ClockIcon />
                </span>
                Aktivitas Akun
              </h2>
            </div>
            <div className="profile-card-body">
              <div className="profile-activity-list">
                <div className="profile-activity-item">
                  <div className="profile-activity-dot blue">
                    <UserPlusIcon />
                  </div>
                  <div className="profile-activity-content">
                    <p className="profile-activity-title">Akun Dibuat</p>
                    <p className="profile-activity-desc">
                      Mendaftar sebagai Mahasiswa Angkatan {profile.angkatan ?? "-"}
                    </p>
                  </div>
                  <span className="profile-activity-time">{formatDateShort(profile.createdAt)}</span>
                </div>

                <div className="profile-activity-item">
                  <div className="profile-activity-dot green">
                    <CheckCircleIcon />
                  </div>
                  <div className="profile-activity-content">
                    <p className="profile-activity-title">Akun Terverifikasi</p>
                    <p className="profile-activity-desc">
                      Status akun aktif dan dapat mengakses sistem
                    </p>
                  </div>
                  <span className="profile-activity-time">{formatDateShort(profile.createdAt)}</span>
                </div>

                <div className="profile-activity-item">
                  <div className="profile-activity-dot purple">
                    <ZapIcon />
                  </div>
                  <div className="profile-activity-content">
                    <p className="profile-activity-title">Total XP Saat Ini</p>
                    <p className="profile-activity-desc">
                      {profile.xp ?? 0} experience points terkumpul
                    </p>
                  </div>
                  <span className="profile-activity-time">Sekarang</span>
                </div>

                <div className="profile-activity-item">
                  <div className="profile-activity-dot orange">
                    <BookOpenIcon />
                  </div>
                  <div className="profile-activity-content">
                    <p className="profile-activity-title">Penggunaan SKS</p>
                    <p className="profile-activity-desc">
                      {profile.usedCredits} dari {profile.maxCredits} SKS telah digunakan semester ini
                    </p>
                  </div>
                  <span className="profile-activity-time">Semester ini</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          {/* Informasi Akademik */}
          <div className="profile-card">
            <div className="profile-card-header">
              <h2 className="profile-card-title">
                <span className="profile-card-title-icon green">
                  <BookOpenIcon />
                </span>
                Info Akademik
              </h2>
            </div>
            <div className="profile-card-body">
              <div className="profile-academic-items">
                <div className="profile-academic-item">
                  <div className="profile-academic-left">
                    <div className="profile-academic-icon blue">
                      <CalendarIcon />
                    </div>
                    <div>
                      <p className="profile-academic-key">Angkatan</p>
                      <p className="profile-academic-sub">Tahun masuk</p>
                    </div>
                  </div>
                  <span className="profile-academic-val accent-blue">
                    {profile.angkatan ?? "-"}
                  </span>
                </div>

                <div className="profile-academic-item">
                  <div className="profile-academic-left">
                    <div className="profile-academic-icon orange">
                      <BookOpenIcon />
                    </div>
                    <div>
                      <p className="profile-academic-key">SKS Diambil</p>
                      <p className="profile-academic-sub">Semester ini</p>
                    </div>
                  </div>
                  <span className="profile-academic-val accent-orange">
                    {profile.usedCredits}
                  </span>
                </div>

                <div className="profile-academic-item">
                  <div className="profile-academic-left">
                    <div className="profile-academic-icon green">
                      <CheckCircleIcon />
                    </div>
                    <div>
                      <p className="profile-academic-key">SKS Tersisa</p>
                      <p className="profile-academic-sub">Masih bisa diambil</p>
                    </div>
                  </div>
                  <span className="profile-academic-val accent-green">
                    {profile.remainingCredits}
                  </span>
                </div>

                <div className="profile-academic-item">
                  <div className="profile-academic-left">
                    <div className="profile-academic-icon purple">
                      <TrendingUpIcon />
                    </div>
                    <div>
                      <p className="profile-academic-key">Maks SKS</p>
                      <p className="profile-academic-sub">Batas semester ini</p>
                    </div>
                  </div>
                  <span className="profile-academic-val">{profile.maxCredits}</span>
                </div>

                <div className="profile-academic-item">
                  <div className="profile-academic-left">
                    <div className="profile-academic-icon teal">
                      <ZapIcon />
                    </div>
                    <div>
                      <p className="profile-academic-key">Total XP</p>
                      <p className="profile-academic-sub">Experience points</p>
                    </div>
                  </div>
                  <span className="profile-academic-val">{profile.xp ?? 0}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Member Since Card */}
          <div className="profile-since-card">
            <p className="profile-since-label">Bergabung Sejak</p>
            <p className="profile-since-value">{formatDate(profile.createdAt)}</p>
            <p className="profile-since-sub">
              Sudah {getMemberDuration(profile.createdAt)} bersama AFADIA Academy
            </p>
          </div>

          {/* Quick Links */}
          <div className="profile-card">
            <div className="profile-card-header">
              <h2 className="profile-card-title">
                <span className="profile-card-title-icon blue">
                  <LinkIcon />
                </span>
                Navigasi Cepat
              </h2>
            </div>
            <div className="profile-card-body">
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                <QuickLink href="/dashboard_mahasiswa" icon={<HomeIcon />} label="Dashboard" color="blue" />
                <QuickLink href="/courses/my" icon={<BookOpenIcon />} label="Kursus Saya" color="purple" />
                <QuickLink href="/calendar" icon={<CalendarIcon />} label="Kalender Akademik" color="green" />
                <QuickLink href="/labs" icon={<FlaskIcon />} label="Practical Lab" color="orange" />
              </div>
            </div>
          </div>
        </div>
        </div>
      </div>
    </StudentDashboardLayout>
  );
}

/* ──────────────────────────────────────────────
   SUB-COMPONENTS
─────────────────────────────────────────────── */
function QuickLink({
  href,
  icon,
  label,
  color,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
  color: "blue" | "purple" | "green" | "orange";
}) {
  return (
    <Link
      href={href}
      style={{
        display: "flex",
        alignItems: "center",
        gap: "12px",
        padding: "12px 14px",
        borderRadius: "var(--radius-md)",
        border: "1px solid var(--border)",
        background: "var(--bg)",
        color: "var(--text-primary)",
        textDecoration: "none",
        fontSize: "13.5px",
        fontWeight: 600,
        transition: "all 0.2s ease",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLAnchorElement).style.background = "white";
        (e.currentTarget as HTMLAnchorElement).style.borderColor = "var(--border-hover)";
        (e.currentTarget as HTMLAnchorElement).style.transform = "translateX(3px)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLAnchorElement).style.background = "var(--bg)";
        (e.currentTarget as HTMLAnchorElement).style.borderColor = "var(--border)";
        (e.currentTarget as HTMLAnchorElement).style.transform = "translateX(0)";
      }}
    >
      <span
        style={{
          width: 32,
          height: 32,
          borderRadius: "var(--radius-sm)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          background:
            color === "blue"
              ? "var(--primary-light)"
              : color === "purple"
              ? "var(--purple-light)"
              : color === "green"
              ? "var(--green-light)"
              : "var(--orange-light)",
          color:
            color === "blue"
              ? "var(--primary)"
              : color === "purple"
              ? "var(--purple)"
              : color === "green"
              ? "var(--green)"
              : "var(--orange)",
        }}
      >
        {icon}
      </span>
      {label}
      <span style={{ marginLeft: "auto", color: "var(--text-muted)" }}>
        <ChevronRightIcon />
      </span>
    </Link>
  );
}

/* ──────────────────────────────────────────────
   ICON COMPONENTS
─────────────────────────────────────────────── */
function UserIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
      <circle cx="12" cy="7" r="4"/>
    </svg>
  );
}

function EditIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
    </svg>
  );
}

function GraduationIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
      <path d="M6 12v5c3 3 9 3 12 0v-5"/>
    </svg>
  );
}

function CalendarIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
      <line x1="16" y1="2" x2="16" y2="6"/>
      <line x1="8" y1="2" x2="8" y2="6"/>
      <line x1="3" y1="10" x2="21" y2="10"/>
    </svg>
  );
}

function StarIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" stroke="none" aria-hidden="true">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
    </svg>
  );
}

function MailIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
      <polyline points="22,6 12,13 2,6"/>
    </svg>
  );
}

function BookOpenIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
      <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
    </svg>
  );
}

function CheckCircleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
      <polyline points="22 4 12 14.01 9 11.01"/>
    </svg>
  );
}

function ZapIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
    </svg>
  );
}

function TrendingUpIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/>
      <polyline points="17 6 23 6 23 12"/>
    </svg>
  );
}

function ArrowLeftIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <line x1="19" y1="12" x2="5" y2="12"/>
      <polyline points="12 19 5 12 12 5"/>
    </svg>
  );
}

function CheckSmIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="20 6 9 17 4 12"/>
    </svg>
  );
}

function AlertIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="10"/>
      <line x1="12" y1="8" x2="12" y2="12"/>
      <line x1="12" y1="16" x2="12.01" y2="16"/>
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="10"/>
      <polyline points="12 6 12 12 16 14"/>
    </svg>
  );
}

function UserPlusIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
      <circle cx="9" cy="7" r="4"/>
      <line x1="19" y1="8" x2="19" y2="14"/>
      <line x1="22" y1="11" x2="16" y2="11"/>
    </svg>
  );
}

function ChevronRightIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
      <path d="m9 18 6-6-6-6"/>
    </svg>
  );
}

function HomeIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
      <polyline points="9 22 9 12 15 12 15 22"/>
    </svg>
  );
}

function FlaskIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M9 3h6m-5 6h4M6.5 21h11a2 2 0 0 0 1.8-2.9L15 10V4H9v6L5.7 18.1A2 2 0 0 0 7.5 21"/>
    </svg>
  );
}

function LinkIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
    </svg>
  );
}

function EyeIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
      <circle cx="12" cy="12" r="3"/>
    </svg>
  );
}

function EyeOffIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
      <line x1="1" y1="1" x2="23" y2="23"/>
    </svg>
  );
}
