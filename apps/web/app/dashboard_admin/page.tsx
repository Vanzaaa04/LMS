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

const TODAY_PLANS = [
  { name: "UX Fundamental", time: "09:00 - 10:30 WIB", dot: "teal" },
  { name: "Review Tugas Mahasiswa", time: "11:00 - 12:00 WIB", dot: "orange" },
  { name: "Webinar AI in Education", time: "13:00 - 14:30 WIB", dot: "purple" },
  { name: "Rapat Kurikulum", time: "15:00 - 16:00 WIB", dot: "green" },
];

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

          {/* QUICK SUMMARY BANNER */}
          <section className="welcome-banner">
            <div className="banner-decoration">
              <div className="banner-circle banner-circle-1"></div>
              <div className="banner-circle banner-circle-2"></div>
              <div className="banner-circle banner-circle-3"></div>
              <div className="banner-dots"></div>
              <div className="banner-sparkle-shape">
                <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M50 0C50 27.6142 38.8071 50 11.1929 50C38.8071 50 50 72.3858 50 100C50 72.3858 61.1929 50 88.8071 50C61.1929 50 50 27.6142 50 0Z" fill="white" fillOpacity="0.85" />
                </svg>
              </div>
              <div className="banner-sparkle-shape-sm">
                <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M50 0C50 27.6142 38.8071 50 11.1929 50C38.8071 50 50 72.3858 50 100C50 72.3858 61.1929 50 88.8071 50C61.1929 50 50 27.6142 50 0Z" fill="white" fillOpacity="0.7" />
                </svg>
              </div>
            </div>
            <div className="banner-content">
              <p className="banner-greeting">ADMIN DASHBOARD</p>
              <h2 className="banner-title">Selamat {new Date().getHours() < 12 ? "Pagi" : new Date().getHours() < 15 ? "Siang" : new Date().getHours() < 18 ? "Sore" : "Malam"}, {user?.name?.split(" ")[0] || "Admin"}! 👋</h2>
              <p className="banner-subtitle">
                {stats.pendingSubmissions > 0
                  ? <>Ada <strong>{stats.pendingSubmissions} tugas pending</strong> yang perlu ditinjau hari ini.</>
                  : <>Semua tugas sudah ditinjau. Platform berjalan dengan baik!</>
                }
              </p>
            </div>
            <div className="banner-stats-row">
              <div className="banner-stat-mini">
                <span className="banner-stat-mini-value">{stats.totalCourses}</span>
                <span className="banner-stat-mini-label">Kursus</span>
              </div>
              <div className="banner-stat-mini">
                <span className="banner-stat-mini-value">{stats.totalLecturers}</span>
                <span className="banner-stat-mini-label">Dosen</span>
              </div>
              <div className="banner-stat-mini">
                <span className="banner-stat-mini-value">{stats.totalStudents}</span>
                <span className="banner-stat-mini-label">Mahasiswa</span>
              </div>
              <div className="banner-stat-mini">
                <span className="banner-stat-mini-value">{stats.pendingSubmissions}</span>
                <span className="banner-stat-mini-label">Pending</span>
              </div>
            </div>
          </section>

          <section className="featured-courses-section">
            <div className="section-header">
              <h3 className="section-title">My Course</h3>
              <Link href="/dashboard_admin/courses" className="see-all-btn-link">
                See All Courses
              </Link>
            </div>
            <div className="featured-courses-grid">
              {courses.slice(0, 3).map((course, index) => {
                const ratings = ["4.6", "4.5", "4.9"];
                const times = ["19 hr 53 min", "20 hr 22 min", "22 hr 38 min"];
                const coverGradients = [
                  "linear-gradient(135deg, #0d9488 0%, #115e59 100%)",
                  "linear-gradient(135deg, #7c3aed 0%, #5b21b6 100%)",
                  "linear-gradient(135deg, #0284c7 0%, #075985 100%)"
                ];
                
                return (
                  <div className="featured-course-card" key={course.id} onClick={() => router.push(`/dashboard_admin/courses/${course.id}`)}>
                    <div className="course-card-banner" style={{ background: coverGradients[index % 3] }}>
                      <span className="course-card-id-badge">{course.id.substring(0, 8).toUpperCase()}</span>
                      <div className="course-banner-stars-art">✦</div>
                    </div>
                    <div className="course-card-body">
                      <div className="course-card-meta-row">
                        <span className="course-card-title-text">{course.title}</span>
                        <div className="course-card-rating">
                          <span className="rating-num">{ratings[index % 3]}</span>
                          <span className="rating-star">★</span>
                        </div>
                      </div>
                      <div className="course-card-mentor">
                        <div className="mentor-avatar">{getInitials(course.instructor?.name || "D")}</div>
                        <span className="mentor-name">{course.instructor?.name || "Belum Ditentukan"}</span>
                      </div>
                      <div className="course-card-progress-bar-wrap">
                        <div className="progress-bar-track">
                          <div 
                            className="progress-bar-fill" 
                            style={{ 
                              width: course._count?.enrollments && course.enrollmentCap 
                                ? `${Math.min(100, Math.round((course._count.enrollments / course.enrollmentCap) * 100))}%` 
                                : "25%" 
                            }}
                          ></div>
                        </div>
                      </div>
                      <div className="course-card-footer">
                        <div className="footer-meta-item">
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="3" y="3" width="18" height="18" rx="2" ry="2" /></svg>
                          <span>{course._count?.modules || 0} Modules</span>
                        </div>
                        <div className="footer-meta-item">
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
                          <span>{times[index % 3]}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          <section className="top-performance-section">
            <div className="section-header">
              <h3 className="section-title">Top Performance Course</h3>
              <div className="section-actions-group">
                <button className="table-filter-btn" type="button" onClick={() => alert("Filter aktif!")}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" /></svg>
                  Filter
                </button>
                <Link href="/dashboard_admin/courses" className="see-all-btn-link">
                  See All Courses
                </Link>
              </div>
            </div>

            <div className="performance-table-wrapper">
              <table className="performance-table">
                <thead>
                  <tr>
                    <th>Course ID</th>
                    <th>Course Name</th>
                    <th>Level</th>
                    <th>Mentor</th>
                    <th>Completion Rate</th>
                    <th>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCourses.map((course, index) => {
                    const levels = ["Beginner", "Intermediate", "Advanced", "Expert"];
                    const levelColors = ["beginner", "intermediate", "advanced", "expert"];
                    const currentLevel = levels[index % 4];
                    const currentClass = levelColors[index % 4];
                    
                    const completionPct = course._count?.enrollments && course.enrollmentCap
                      ? Math.min(100, Math.round((course._count.enrollments / course.enrollmentCap) * 100))
                      : 88 + (index * 3) % 12;

                    return (
                      <tr key={course.id}>
                        <td className="col-id">{course.id.substring(0, 8).toUpperCase()}</td>
                        <td className="col-name">
                          <span className="course-title-bold">{course.title}</span>
                          <span className="course-subtitle-light">{course.credits} SKS · {course._count?.modules || 0} Modul</span>
                        </td>
                        <td className="col-level">
                          <span className={`level-pill-badge ${currentClass}`}>{currentLevel}</span>
                        </td>
                        <td className="col-mentor">
                          <div className="mentor-profile-info">
                            <div className="mentor-avatar-sm">{getInitials(course.instructor?.name || "M")}</div>
                            <span className="mentor-name-text">{course.instructor?.name || "Belum Ditentukan"}</span>
                          </div>
                        </td>
                        <td className="col-rate">
                          <span className="completion-pct-text">{completionPct}%</span>
                        </td>
                        <td className="col-action">
                          <div className="action-dots-button-wrap">
                            <button className="row-ellipsis-btn" type="button" onClick={() => router.push(`/dashboard_admin/courses/${course.id}`)}>
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="1" /><circle cx="12" cy="5" r="1" /><circle cx="12" cy="19" r="1" /></svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>
        </div>

        <footer className="footer">
          <p><strong>AFADIA Academy</strong> &copy; 2024 Platform Akademik. All rights reserved.</p>
          <div className="footer-links">
            <button onClick={() => alert("Kebijakan Privasi:\n\nSemua data Anda terlindungi dengan enkripsi SSL.")} style={{ background: "none", border: "none", font: "inherit", color: "inherit", cursor: "pointer", padding: 0 }}>Kebijakan Privasi</button>
            <button onClick={() => alert("Syarat Layanan:\n\nDengan menggunakan AFADIA Academy, Anda setuju mematuhi tata tertib kampus.")} style={{ background: "none", border: "none", font: "inherit", color: "inherit", cursor: "pointer", padding: 0 }}>Syarat Layanan</button>
            <button onClick={() => alert("Pusat Bantuan:\n\nEmail: support@afadia.ac.id")} style={{ background: "none", border: "none", font: "inherit", color: "inherit", cursor: "pointer", padding: 0 }}>Pusat Bantuan</button>
            <button onClick={() => alert("Hubungi Support:\n\nEmail: support@afadia.ac.id\nJam: Senin–Jumat 08.00–17.00 WIB")} style={{ background: "none", border: "none", font: "inherit", color: "inherit", cursor: "pointer", padding: 0 }}>Hubungi Support</button>
          </div>
        </footer>
      </main>

      <aside className="right-panel">
        <div className="right-greeting">
          <div className="right-greeting-avatar">{getInitials(user?.name)}</div>
          <div className="right-greeting-text">
            <p className="right-greeting-name">Good Morning, {user?.name?.split(" ")[0] || "Admin"}! 👋</p>
            <p className="right-greeting-sub">Focus today, mastery tomorrow.</p>
          </div>
        </div>

        <div className="right-stats">
          <div className="right-stat-item">
            <div className="right-stat-icon teal">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 19.5A2.5 2.5 0 016.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" />
              </svg>
            </div>
            <div className="right-stat-body">
              <p className="right-stat-label">Ongoing Courses</p>
              <p className="right-stat-value">{stats.totalCourses}</p>
            </div>
          </div>

          <div className="right-stat-item">
            <div className="right-stat-icon purple">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" /><circle cx="12" cy="7" r="4" />
              </svg>
            </div>
            <div className="right-stat-body">
              <p className="right-stat-label">Total Lecturers</p>
              <p className="right-stat-value">{stats.totalLecturers}</p>
            </div>
          </div>

          <div className="right-stat-item">
            <div className="right-stat-icon green">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 00-3-3.87" /><path d="M16 3.13a4 4 0 010 7.75" />
              </svg>
            </div>
            <div className="right-stat-body">
              <p className="right-stat-label">Total Students</p>
              <p className="right-stat-value">{stats.totalStudents}</p>
            </div>
          </div>

          <div className="right-stat-item">
            <div className="right-stat-icon orange">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="12" y1="18" x2="12" y2="12" /><line x1="9" y1="15" x2="15" y2="15" />
              </svg>
            </div>
            <div className="right-stat-body">
              <p className="right-stat-label">Tugas Pending</p>
              <p className="right-stat-value">{stats.pendingSubmissions}</p>
            </div>
          </div>
        </div>

        <div className="right-plans">
          <div className="right-plans-header">
            <h3 className="right-plans-title">Schedule</h3>
            <button className="right-plans-more" type="button" onClick={() => alert("Menu lainnya!")}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="1" /><circle cx="12" cy="5" r="1" /><circle cx="12" cy="19" r="1" /></svg>
            </button>
          </div>
          
          <div className="calendar-widget-card">
            <div className="calendar-header-row">
              <span className="nav-arrow" onClick={() => alert("Bulan sebelumnya!")}>‹</span>
              <span className="month-year-title">March 2026</span>
              <span className="nav-arrow" onClick={() => alert("Bulan berikutnya!")}>›</span>
            </div>
            <div className="calendar-days-grid">
              <span>Su</span><span>Mo</span><span>Tu</span><span>We</span><span>Th</span><span>Fr</span><span>Sa</span>
              <span>1</span><span>2</span><span>3</span><span className="active-day">4</span><span>5</span><span>6</span><span>7</span>
            </div>
            <div className="calendar-tabs-row">
              <span className="tab-pill active">All</span>
              <span className="tab-pill">UX Fundamental</span>
              <span className="tab-pill">Webinar</span>
            </div>
          </div>

          <div className="today-plans-section">
            <div className="right-plans-header" style={{ marginTop: "16px", marginBottom: "8px" }}>
              <h3 className="right-plans-title">Today Plans</h3>
            </div>
            <div className="plan-list">
              {TODAY_PLANS.map((plan, i) => (
                <div className="plan-item" key={i} onClick={() => alert(`Rencana: ${plan.name}`)}>
                  <div className={`plan-dot ${plan.dot}`} />
                  <div className="plan-info">
                    <p className="plan-name">{plan.name}</p>
                    <p className="plan-time">{plan.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </aside>

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