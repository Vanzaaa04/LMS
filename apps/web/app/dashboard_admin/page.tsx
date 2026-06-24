"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { buildApiUrl } from "@/lib/api/apiConfig";
import { AdminSidebar } from "@/components/layout/AdminSidebar";
import "./dashboard.css";

const parseSender = (msg: string) => {
  const match = msg.match(/^\[([\s\S]*?)\]\n\n([\s\S]*)/);
  if (match) {
    return { sender: match[1], body: match[2] };
  }
  return { sender: null, body: msg };
};

export default function DashboardAdminPage() {
  const [coursesOpen, setCoursesOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [courses, setCourses] = useState<any[]>([]);
  const [stats, setStats] = useState({
    totalCourses: 0,
    totalLecturers: 0,
    totalStudents: 0,
    pendingSubmissions: 0,
  });
  const [loading, setLoading] = useState(true);
  const [notifOpen, setNotifOpen] = useState(false);
  const [showNotifForm, setShowNotifForm] = useState(false);
  const [notifForm, setNotifForm] = useState({ title: '', message: '' });
  const [notifications, setNotifications] = useState<any[]>([]);
  const [selectedNotif, setSelectedNotif] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const token = sessionStorage.getItem("token");
        if (!token) {
          router.push("/login");
          return;
        }

        let currentUser = JSON.parse(sessionStorage.getItem("user") || "null");
        if (currentUser) setUser(currentUser);

        try {
          const profileRes = await fetch(buildApiUrl("/auth/profile"), {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (profileRes.ok) {
            const profileData = await profileRes.json();
            setUser(profileData);
            currentUser = profileData;
          }
        } catch (e) {
          console.error("Failed to fetch profile", e);
        }

        const coursesRes = await fetch(buildApiUrl("/courses"), {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (coursesRes.ok) {
          const allCourses = await coursesRes.json();
          setCourses(allCourses.slice(0, 3));

          const totalStudents = allCourses.reduce(
            (acc: number, curr: any) => acc + (curr._count?.enrollments || 0),
            0
          );

          const lecturerIds = new Set(
            allCourses
              .filter((c: any) => c.instructor?.id || c.instructorId)
              .map((c: any) => c.instructor?.id || c.instructorId)
          );

          setStats((prev) => ({
            ...prev,
            totalCourses: allCourses.length,
            totalStudents: totalStudents,
            totalLecturers: lecturerIds.size,
          }));
        }
      } catch (error) {
        console.error("Failed to fetch admin dashboard data", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
    fetchNotifications();
  }, [router]);

  const getInitials = (name: string) => {
    if (!name) return "A";
    return name.split(" ").map((n) => n[0]).join("").substring(0, 2).toUpperCase();
  };

  const fetchNotifications = async () => {
    try {
      const token = sessionStorage.getItem("token");
      const res = await fetch(buildApiUrl('/notifications'), {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) setNotifications(await res.json());
    } catch (e) { console.error(e); }
  };

  const handleCreateNotif = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = sessionStorage.getItem('token');
      await fetch(buildApiUrl('/notifications/global'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(notifForm)
      });
      setShowNotifForm(false);
      setNotifForm({ title: '', message: '' });
      setNotifOpen(false);
      fetchNotifications();
    } catch (error) { console.error(error); }
  };

  const handleNotifClick = async (n: any) => {
    setSelectedNotif(n);
    if (!n.isRead) {
      try {
        const token = sessionStorage.getItem("token");
        await fetch(buildApiUrl(`/notifications/${n.id}/read`), {
          method: "PATCH",
          headers: { Authorization: `Bearer ${token}` },
        });
        fetchNotifications();
      } catch (err) { console.error(err); }
    }
  };

  const filteredCourses = courses.filter(c =>
    c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (c.instructor?.name || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh", background: "#f7fafa" }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "12px" }}>
          <div style={{ width: "36px", height: "36px", border: "3px solid #e4eded", borderTopColor: "#007272", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
          <p style={{ color: "#7aa3a3", fontSize: "14px", fontWeight: 500 }}>Memuat dashboard...</p>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="admin-dashboard app-wrapper">
      {/* SIDEBAR */}
      <AdminSidebar activeTab="dashboard" />

      {/* MAIN CONTENT */}
      <main className="main-content">

        {/* TOP BAR */}
        <header className="top-bar">
          <div>
            <p className="page-title">Dashboard Admin</p>
            <p className="page-subtitle">
              {new Date().toLocaleDateString("id-ID", {
                weekday: "long", year: "numeric", month: "long", day: "numeric",
              })}
            </p>
          </div>

          <div className="top-bar-right" style={{ position: 'relative' }}>
            {/* Search */}
            <div className="search-bar">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                type="search"
                placeholder="Cari kursus, pengguna..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Notif Button */}
            <button className="icon-btn" title="Notifikasi" onClick={() => setNotifOpen(!notifOpen)}>
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" />
                <path d="M13.73 21a2 2 0 01-3.46 0" />
              </svg>
              {unreadCount > 0 && (
                <span className="notif-dot"></span>
              )}
            </button>

            {/* Notification Dropdown */}
            {notifOpen && (
              <div style={{
                position: 'absolute', top: '48px', right: '44px',
                width: '320px', background: 'white',
                border: '1px solid #e4eded', borderRadius: '14px',
                boxShadow: '0 12px 28px rgba(0,114,114,0.12)', zIndex: 100, overflow: 'hidden'
              }}>
                <div style={{ padding: '14px 16px', borderBottom: '1px solid #e4eded', fontWeight: 600, fontSize: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#0d2626' }}>
                  <span>Notifikasi</span>
                  <button onClick={() => setShowNotifForm(!showNotifForm)} style={{ background: '#007272', color: 'white', padding: '4px 10px', borderRadius: '6px', fontSize: '11px', border: 'none', cursor: 'pointer', fontWeight: 600 }}>
                    {showNotifForm ? 'Batal' : '+ Buat'}
                  </button>
                </div>
                {showNotifForm ? (
                  <form onSubmit={handleCreateNotif} style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <input required type="text" placeholder="Judul Pengumuman" value={notifForm.title}
                      onChange={e => setNotifForm({ ...notifForm, title: e.target.value })}
                      style={{ padding: '9px 12px', border: '1px solid #e4eded', borderRadius: '8px', fontSize: '13px', outline: 'none', fontFamily: 'inherit' }} />
                    <textarea required placeholder="Isi Pengumuman..." value={notifForm.message}
                      onChange={e => setNotifForm({ ...notifForm, message: e.target.value })}
                      style={{ padding: '9px 12px', border: '1px solid #e4eded', borderRadius: '8px', resize: 'none', height: '70px', fontSize: '13px', outline: 'none', fontFamily: 'inherit' }} />
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                      <button type="button" onClick={() => setShowNotifForm(false)} style={{ padding: '7px 14px', background: '#f7fafa', border: '1px solid #e4eded', borderRadius: '8px', cursor: 'pointer', fontSize: '12px', fontFamily: 'inherit' }}>Batal</button>
                      <button type="submit" style={{ padding: '7px 14px', background: '#007272', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '12px', fontWeight: 600, fontFamily: 'inherit' }}>Kirim</button>
                    </div>
                  </form>
                ) : (
                  <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                    {notifications.length > 0 ? (
                      notifications.map((n: any) => {
                        const { sender, body } = parseSender(n.message);
                        return (
                          <div key={n.id} onClick={() => handleNotifClick(n)}
                            style={{ padding: '12px 16px', borderBottom: '1px solid #e4eded', fontSize: '13px', background: n.isRead ? 'transparent' : '#f0fafa', cursor: 'pointer', transition: 'background 0.15s' }}>
                            <span style={{ display: 'block', color: '#7aa3a3', marginBottom: '3px', fontSize: '10px' }}>
                              {new Date(n.createdAt).toLocaleDateString('id-ID')}
                            </span>
                            <strong style={{ display: 'block', marginBottom: '3px', color: '#0d2626' }}>{n.title}</strong>
                            {sender && (
                              <span style={{ display: 'inline-block', fontSize: '10px', fontWeight: 600, padding: '2px 8px', borderRadius: '99px', marginBottom: '4px', background: sender.startsWith('Admin') ? '#EDE9FE' : '#e6f4f4', color: sender.startsWith('Admin') ? '#7C3AED' : '#007272' }}>
                                {sender}
                              </span>
                            )}
                            <div style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: '#3d6363' }}>{body}</div>
                          </div>
                        );
                      })
                    ) : (
                      <div style={{ padding: '24px', textAlign: 'center', color: '#7aa3a3', fontSize: '13px' }}>Belum ada notifikasi</div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Settings */}
            <button className="icon-btn" title="Pengaturan" onClick={() => alert("Pengaturan akun sedang dikembangkan!")}>
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="3" />
                <path d="M19.07 4.93l-1.41 1.41M4.93 4.93l1.41 1.41M19.07 19.07l-1.41-1.41M4.93 19.07l1.41-1.41M21 12h-2M5 12H3M12 3V1M12 23v-2" />
              </svg>
            </button>

            {/* Avatar */}
            <button className="avatar-btn" title="Profil" onClick={() => alert("Profil pengguna sedang dikembangkan!")}>
              {getInitials(user?.name)}
            </button>
          </div>
        </header>

        {/* DASHBOARD CONTENT */}
        <div className="dashboard-content">

          {/* WELCOME BANNER */}
          <section className="welcome-banner">
            <div className="banner-decoration">
              <div className="banner-circle banner-circle-1"></div>
              <div className="banner-circle banner-circle-2"></div>
              <div className="banner-circle banner-circle-3"></div>
              <div className="banner-dots"></div>
            </div>
            <div className="banner-content">
              <p className="banner-greeting">Panel Administrasi</p>
              <h2 className="banner-title">Halo, {user?.name || "Admin"}! 👋</h2>
              <p className="banner-subtitle">
                Terdapat <strong>{stats.pendingSubmissions} tugas mahasiswa</strong> yang menunggu persetujuan hari ini.
              </p>
            </div>
            <div className="banner-actions">
              <button className="btn-primary-white" onClick={() => router.push('/dashboard_admin/courses')}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                </svg>
                Tinjau Tugas
              </button>
              <button className="btn-outline-white" onClick={() => router.push('/dashboard_admin/users')}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M23 21v-2a4 4 0 00-3-3.87" />
                  <path d="M16 3.13a4 4 0 010 7.75" />
                </svg>
                Kelola Pengguna
              </button>
            </div>
          </section>

          {/* STAT CARDS */}
          <section className="stat-overview">
            <div className="stat-card">
              <div className="stat-card-accent accent-teal"></div>
              <div className="stat-icon-wrap teal">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 19.5A2.5 2.5 0 016.5 17H20" />
                  <path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" />
                </svg>
              </div>
              <div className="stat-body">
                <p className="stat-label">Total Mata Kuliah</p>
                <p className="stat-value">{stats.totalCourses}</p>
                <p className="stat-change neutral">Seluruh Platform</p>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-card-accent accent-purple"></div>
              <div className="stat-icon-wrap purple">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              </div>
              <div className="stat-body">
                <p className="stat-label">Total Dosen</p>
                <p className="stat-value">{stats.totalLecturers}</p>
                <p className="stat-change neutral">Terdaftar Aktif</p>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-card-accent accent-green"></div>
              <div className="stat-icon-wrap green">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M23 21v-2a4 4 0 00-3-3.87" />
                  <path d="M16 3.13a4 4 0 010 7.75" />
                </svg>
              </div>
              <div className="stat-body">
                <p className="stat-label">Total Mahasiswa</p>
                <p className="stat-value">{stats.totalStudents}</p>
                <p className="stat-change up">Di semua mata kuliah</p>
              </div>
            </div>

            <div className="stat-card alert-card">
              <div className="stat-card-accent accent-orange"></div>
              <div className="stat-icon-wrap orange">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                  <line x1="12" y1="18" x2="12" y2="12" />
                  <line x1="9" y1="15" x2="15" y2="15" />
                </svg>
              </div>
              <div className="stat-body">
                <p className="stat-label">Tugas Pending</p>
                <p className="stat-value">{stats.pendingSubmissions}</p>
                <p className="stat-change" style={{ color: "var(--orange)" }}>Perlu ditinjau segera</p>
              </div>
            </div>
          </section>

          {/* QUICK ACTIONS */}
          <section className="quick-actions">
            <button className="quick-action-btn" onClick={() => router.push('/dashboard_admin/courses/create')}>
              <div className="quick-action-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                </svg>
              </div>
              Buat Mata Kuliah
            </button>
            <button className="quick-action-btn" onClick={() => router.push('/dashboard_admin/users/create')}>
              <div className="quick-action-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <line x1="19" y1="8" x2="19" y2="14" /><line x1="22" y1="11" x2="16" y2="11" />
                </svg>
              </div>
              Tambah Pengguna
            </button>
            <button className="quick-action-btn" onClick={() => router.push('/dashboard_admin/courses')}>
              <div className="quick-action-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 19.5A2.5 2.5 0 016.5 17H20" />
                  <path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" />
                </svg>
              </div>
              Semua Kursus
            </button>
            <button className="quick-action-btn" onClick={() => setNotifOpen(true)}>
              <div className="quick-action-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" />
                  <path d="M13.73 21a2 2 0 01-3.46 0" />
                </svg>
              </div>
              Kirim Notifikasi
            </button>
          </section>

          {/* MAIN BODY */}
          <div className="main-body-layout">

            {/* Course Management */}
            <section className="course-management">
              <div className="section-header">
                <h3 className="section-title">Manajemen Mata Kuliah</h3>
                <Link href="/dashboard_admin/courses" className="view-all-link">
                  Lihat Semua →
                </Link>
              </div>

              <div className="course-grid">
                {courses.length > 0 ? (
                  courses.map((course, index) => {
                    const colorVariants = ["teal", "purple", "green"];
                    const color = colorVariants[index % colorVariants.length];
                    const fillColors = ["teal", "purple", "green"];
                    const fillColor = fillColors[index % fillColors.length];

                    return (
                      <div className="course-card" key={course.id}>
                        <div className="course-card-top">
                          <div className={`course-icon-wrap ${color}`}>
                            {index % 3 === 0 ? (
                              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" />
                              </svg>
                            ) : index % 3 === 1 ? (
                              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" />
                              </svg>
                            ) : (
                              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M4 19.5A2.5 2.5 0 016.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" />
                              </svg>
                            )}
                          </div>
                          <span className="course-badge">{course.id.substring(0, 8).toUpperCase()}</span>
                        </div>

                        <h4 className="course-name">{course.title}</h4>
                        <div className="course-meta">
                          <span>{course.instructor?.name || course.description?.substring(0, 20) + "..." || "Tanpa deskripsi"}</span>
                          <span className="course-meta-dot"></span>
                          <span>{course._count?.enrollments || 0} Mahasiswa</span>
                        </div>

                        <div className="progress-section" style={{ display: 'flex', flexDirection: 'column', gap: '8px', borderTop: '1px solid var(--border)', paddingTop: '12px', marginTop: '8px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12.5px', color: 'var(--text-secondary)' }}>
                            <span>Total Modul</span>
                            <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{course._count?.modules || 0} Modul</span>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12.5px', color: 'var(--text-secondary)' }}>
                            <span>Kapasitas & SKS</span>
                            <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{course.enrollmentCap} Siswa · {course.credits} SKS</span>
                          </div>
                        </div>

                        <div className="course-actions" style={{ marginTop: '14px' }}>
                          <button className="btn-filled" style={{ width: '100%' }} onClick={() => router.push(`/dashboard_admin/courses/${course.id}`)}>
                            Kelola Mata Kuliah
                          </button>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div style={{ padding: "32px", textAlign: "center", border: "1px dashed var(--teal-border)", borderRadius: "var(--radius-lg)", background: "var(--teal-soft)" }}>
                    <p style={{ color: "var(--text-muted)", marginBottom: "12px", fontSize: "13px" }}>Belum ada mata kuliah yang tersedia.</p>
                    <button className="btn-filled" onClick={() => router.push('/dashboard_admin/courses/create')}>
                      Buat Mata Kuliah Baru
                    </button>
                  </div>
                )}
              </div>
            </section>

            {/* Recent Submissions Panel */}
            <aside className="submissions-panel">
              <div className="panel-header">
                <div className="section-header">
                  <h3 className="section-title">Tugas Terbaru</h3>
                  <Link href="/dashboard_admin/courses" className="view-all-link">
                    Lihat Semua
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <polyline points="9 18 15 12 9 6" />
                    </svg>
                  </Link>
                </div>
              </div>

              <div className="panel-body">
                <div className="submission-item">
                  <div className="submission-top">
                    <div className="submission-student">
                      <div className="student-avatar avatar-blue">BS</div>
                      <span className="student-name">Budi Santoso</span>
                    </div>
                    <span className="submission-time">2j lalu</span>
                  </div>
                  <p className="submission-title">Binary Tree Implementation</p>
                  <div className="submission-footer">
                    <span className="tag tag-blue">Data Structures</span>
                    <span className="status-badge status-review">Perlu Ditinjau</span>
                  </div>
                </div>

                <div className="submission-item">
                  <div className="submission-top">
                    <div className="submission-student">
                      <div className="student-avatar avatar-green">SA</div>
                      <span className="student-name">Siti Aminah</span>
                    </div>
                    <span className="submission-time">4j lalu</span>
                  </div>
                  <p className="submission-title">Graph Traversal Essay</p>
                  <div className="submission-footer">
                    <span className="tag tag-purple">Algorithm Analysis</span>
                    <span className="status-badge status-review">Perlu Ditinjau</span>
                  </div>
                </div>

                <div className="submission-item">
                  <div className="submission-top">
                    <div className="submission-student">
                      <div className="student-avatar avatar-orange">RF</div>
                      <span className="student-name">Reza Fahlevi</span>
                    </div>
                    <span className="submission-time">Kemarin</span>
                  </div>
                  <p className="submission-title">Neural Network Basics</p>
                  <div className="submission-footer">
                    <span className="tag tag-pink">Machine Learning</span>
                    <span className="status-badge status-graded">Sudah Dinilai</span>
                  </div>
                </div>
              </div>

              <div className="panel-footer">
                <Link href="/dashboard_admin/courses" className="view-all-btn">
                  Lihat Semua Tugas
                </Link>
              </div>
            </aside>

          </div>
        </div>

        {/* FOOTER */}
        <footer className="footer">
<<<<<<< HEAD
          <p><strong>Ruang Dosen</strong> &copy; 2024 Platform Akademik. All rights reserved.</p>
=======
          <p>
            <strong>AFADIA Academy</strong> &copy; 2024 Platform Akademik. All
            rights reserved.
          </p>
>>>>>>> ea0abb3558b2d6f398942e89cc07d001e16ee188
          <div className="footer-links">
            <button onClick={() => alert("Kebijakan Privasi:\n\nSemua data Anda terlindungi dengan enkripsi SSL. Kami tidak membagikan data pribadi atau riwayat nilai Anda kepada pihak ketiga mana pun tanpa persetujuan Anda.")} style={{ background: 'none', border: 'none', font: 'inherit', color: 'inherit', cursor: 'pointer', padding: 0 }}>Kebijakan Privasi</button>
            <button onClick={() => alert("Syarat Layanan:\n\nDengan menggunakan AFADIA Academy, Anda setuju untuk menjaga kerahasiaan kredensial login Anda, tidak melakukan kecurangan akademik, dan mematuhi tata tertib kampus.")} style={{ background: 'none', border: 'none', font: 'inherit', color: 'inherit', cursor: 'pointer', padding: 0 }}>Syarat Layanan</button>
            <button onClick={() => alert("Pusat Bantuan:\n\nJika menemui kendala teknis atau kesalahan data, silakan buat laporan ke support@afadia.ac.id atau hubungi helpdesk IT kampus.")} style={{ background: 'none', border: 'none', font: 'inherit', color: 'inherit', cursor: 'pointer', padding: 0 }}>Pusat Bantuan</button>
            <button onClick={() => alert("Hubungi Support:\n\nEmail: support@afadia.ac.id\nJam Operasional: Senin - Jumat, 08.00 - 17.00 WIB")} style={{ background: 'none', border: 'none', font: 'inherit', color: 'inherit', cursor: 'pointer', padding: 0 }}>Hubungi Support</button>
          </div>
        </footer>

      </main>

      {/* Notification Modal */}
      {selectedNotif && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.35)', padding: '20px' }} onClick={() => setSelectedNotif(null)}>
          <div style={{ background: 'white', borderRadius: '18px', maxWidth: '480px', width: '100%', overflow: 'hidden', boxShadow: '0 20px 40px rgba(0,114,114,0.15)' }} onClick={e => e.stopPropagation()}>
            <div style={{ padding: '18px 20px', borderBottom: '1px solid #e4eded', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, fontWeight: 700, fontSize: '15px', color: '#0d2626' }}>Detail Notifikasi</h3>
              <button onClick={() => setSelectedNotif(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#7aa3a3', fontSize: '18px', lineHeight: 1 }}>✕</button>
            </div>
            <div style={{ padding: '22px 20px' }}>
              <h4 style={{ margin: '0 0 6px 0', fontSize: '17px', fontWeight: 700, color: '#0d2626' }}>{selectedNotif.title}</h4>
              <p style={{ margin: '0 0 20px 0', fontSize: '11px', color: '#7aa3a3' }}>{new Date(selectedNotif.createdAt).toLocaleString('id-ID')}</p>
              <div style={{ fontSize: '13.5px', lineHeight: 1.7, color: '#3d6363', background: '#f7fafa', padding: '16px', borderRadius: '12px', border: '1px solid #e4eded' }}>
                {(() => {
                  const { sender, body } = parseSender(selectedNotif.message);
                  return (
                    <>
                      {sender && (
                        <div style={{ marginBottom: '10px' }}>
                          <span style={{ display: 'inline-block', fontSize: '11px', fontWeight: 600, padding: '3px 10px', borderRadius: '99px', background: sender.startsWith('Admin') ? '#EDE9FE' : '#e6f4f4', color: sender.startsWith('Admin') ? '#7C3AED' : '#007272' }}>
                            {sender}
                          </span>
                        </div>
                      )}
                      <div style={{ whiteSpace: 'pre-line' }}>{body}</div>
                    </>
                  );
                })()}
              </div>
            </div>
            <div style={{ padding: '14px 20px', borderTop: '1px solid #e4eded', display: 'flex', justifyContent: 'flex-end' }}>
              <button onClick={() => setSelectedNotif(null)} style={{ padding: '9px 24px', background: '#007272', color: 'white', border: 'none', borderRadius: '10px', fontWeight: 600, cursor: 'pointer', fontSize: '13px', fontFamily: 'inherit' }}>
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}