"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { buildApiUrl } from "@/lib/api/apiConfig";
import { LecturerSidebar } from "@/components/layout/LecturerSidebar";
import "./dashboard.css";

const TODAY_PLANS = [
  { name: "Mengajar Web Dev", time: "09:00 - 11:30 WIB", dot: "teal" },
  { name: "Review Tugas Akhir", time: "13:00 - 15:00 WIB", dot: "orange" },
  { name: "Rapat Dosen", time: "15:30 - 16:30 WIB", dot: "purple" }
];

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null);
  const [courses, setCourses] = useState<any[]>([]);
  const [stats, setStats] = useState({
    activeCourses: 0,
    totalStudents: 0,
    pendingSubmissions: 0,
  });
  const [loading, setLoading] = useState(true);
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
            headers: { Authorization: `Bearer ${token}` }
          });
          if (profileRes.ok) {
            const profileData = await profileRes.json();
            setUser(profileData);
            currentUser = profileData;
          }
        } catch (e) {
          console.error("Failed to fetch profile", e);
        }

        const [coursesRes, statsRes] = await Promise.all([
          fetch(buildApiUrl("/courses"), { headers: { Authorization: `Bearer ${token}` } }),
          fetch(buildApiUrl("/dashboard/lecturer-stats"), { headers: { Authorization: `Bearer ${token}` } })
        ]);

        if (coursesRes.ok) {
          const allCourses = await coursesRes.json();
          const myCourses = allCourses.filter(
            (c: any) => c.instructor?.id === currentUser?.id || c.instructorId === currentUser?.id
          );
          setCourses(myCourses);
        }

        if (statsRes.ok) {
          const backendStats = await statsRes.json();
          setStats({
            activeCourses: backendStats.activeCourses || 0,
            totalStudents: backendStats.totalStudents || 0,
            pendingSubmissions: backendStats.pendingSubmissions || 0,
          });
        }
      } catch (error) {
        console.error("Failed to fetch dashboard data", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [router]);

  const getInitials = (name: string) => {
    if (!name) return "D";
    return name.split(" ").map((n) => n[0]).join("").substring(0, 2).toUpperCase();
  };

  if (loading) {
    return (
      <div className="lecturer-dashboard dashboard-content" style={{ justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '36px', height: '36px', border: '3px solid #e4eded', borderTopColor: '#2A52BE', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
          <p style={{ color: '#7aa3a3', fontSize: '14px', fontWeight: 500 }}>Memuat dashboard...</p>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div className="lecturer-dashboard app-wrapper">
      <LecturerSidebar activeTab="dashboard" />
      
      <main className="main-content">
        <header className="top-bar">
          <div>
            <p className="page-title">Dashboard Dosen</p>
            <p className="page-subtitle">
              {new Date().toLocaleDateString("id-ID", {
                weekday: "long", year: "numeric", month: "long", day: "numeric",
              })}
            </p>
          </div>

          <div className="top-bar-right">
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
            <button className="icon-btn" title="Notifikasi" onClick={() => alert("Notifikasi Dosen")}>
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" />
                <path d="M13.73 21a2 2 0 01-3.46 0" />
              </svg>
            </button>
            <button className="icon-btn" title="Mode Tema" onClick={() => alert("Ganti Tema")}>
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="5" />
                <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
              </svg>
            </button>
            <div className="user-profile-btn" style={{ background: "linear-gradient(135deg, #1E3A8A, #2A52BE)" }}>
              {getInitials(user?.name)}
            </div>
          </div>
        </header>

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
          <p className="banner-greeting">LECTURER DASHBOARD</p>
          <h2 className="banner-title">Selamat {new Date().getHours() < 12 ? "Pagi" : new Date().getHours() < 15 ? "Siang" : new Date().getHours() < 18 ? "Sore" : "Malam"}, {user?.name?.split(" ")[0] || "Dosen"}! 👋</h2>
          <p className="banner-subtitle">
            {stats.pendingSubmissions > 0
              ? <>Ada <strong>{stats.pendingSubmissions} tugas mahasiswa</strong> yang menunggu untuk ditinjau hari ini.</>
              : <>Semua tugas sudah ditinjau. Anda memiliki hari yang luang!</>
            }
          </p>
          <div className="banner-actions" style={{ marginTop: '16px' }}>
            <Link href="/dosen/courses/create" className="btn-primary-white">
              + Buat Course
            </Link>
            <Link href="/dosen/courses" className="btn-outline-white">
              Lihat Kelas
            </Link>
          </div>
        </div>
        <div className="banner-stats-row">
          <div className="banner-stat-mini">
            <span className="banner-stat-mini-value">{stats.activeCourses}</span>
            <span className="banner-stat-mini-label">Mata Kuliah</span>
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
          <Link href="/dosen/courses" className="see-all-btn-link">
            See All Courses
          </Link>
        </div>
        <div className="featured-courses-grid">
              {courses.slice(0, 3).map((course, index) => {
                const ratings = ["4.6", "4.5", "4.9"];
                const times = ["19 hr 53 min", "20 hr 22 min", "22 hr 38 min"];
                const coverGradients = [
                  "linear-gradient(135deg, #1E3A8A 0%, #2A52BE 100%)",
                  "linear-gradient(135deg, #7c3aed 0%, #5b21b6 100%)",
                  "linear-gradient(135deg, #0284c7 0%, #075985 100%)"
                ];
                
                return (
                  <div className="featured-course-card" key={course.id} onClick={() => router.push(`/dosen/courses/${course.id}`)}>
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
                        <span className="mentor-name">{course.instructor?.name || "Anda"}</span>
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
            {courses.length === 0 && (
              <div className="empty-course-state" style={{marginTop: '16px'}}>
                <p>Anda belum memiliki mata kuliah yang diampu.</p>
              </div>
            )}
          </section>

          <section className="top-performance-section" style={{ marginTop: '24px' }}>
            <div className="section-header">
              <h3 className="section-title">Manajemen Mata Kuliah</h3>
              <div className="section-actions-group">
                <button className="table-filter-btn" type="button" onClick={() => alert("Filter aktif!")}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" /></svg>
                  Filter
                </button>
              </div>
            </div>

            <div className="performance-table-wrapper">
              <table className="performance-table">
                <thead>
                  <tr>
                    <th>Course ID</th>
                    <th>Course Name</th>
                    <th>Level</th>
                    <th>Completion Rate</th>
                    <th>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {courses.map((course, index) => {
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
                        <td className="col-rate">
                          <div className="completion-bar-wrap" style={{width: '120px', display: 'flex', alignItems: 'center', gap: '8px'}}>
                            <div className="progress-bar-track" style={{flex: 1}}>
                              <div className="progress-bar-fill" style={{width: `${completionPct}%`}}></div>
                            </div>
                            <span className="completion-pct-text">{completionPct}%</span>
                          </div>
                        </td>
                        <td className="col-action">
                          <div className="action-dots-button-wrap">
                            <button className="row-ellipsis-btn" type="button" onClick={() => router.push(`/dosen/courses/${course.id}`)}>
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="1" /><circle cx="12" cy="5" r="1" /><circle cx="12" cy="19" r="1" /></svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  {courses.length === 0 && (
                     <tr>
                       <td colSpan={5} style={{textAlign: 'center', padding: '24px', color: 'var(--text-muted)'}}>
                         Belum ada mata kuliah
                       </td>
                     </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </div>
        </main>

        <aside className="right-panel">
          <div className="right-greeting">
            <div className="right-greeting-avatar">{getInitials(user?.name)}</div>
            <div className="right-greeting-text">
              <p className="right-greeting-name">Good Morning, {user?.name?.split(" ")[0] || "Lecturer"}! 👋</p>
              <p className="right-greeting-sub">Inspire today, lead tomorrow.</p>
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
                <p className="right-stat-label">Active Courses</p>
                <p className="right-stat-value">{stats.activeCourses}</p>
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
    </div>
  );
}