"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { buildApiUrl } from "@/lib/api/apiConfig";
import "./dashboard.css";

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null);
  const [courses, setCourses] = useState<any[]>([]);
  const [stats, setStats] = useState({
    activeCourses: 0,
    totalStudents: 0,
    pendingSubmissions: 0,
  });
  const [loading, setLoading] = useState(true);
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

        const coursesRes = await fetch(buildApiUrl("/courses"), {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        
        if (coursesRes.ok) {
          const allCourses = await coursesRes.json();
          const myCourses = allCourses.filter(
            (c: any) => c.instructor?.id === currentUser?.id || c.instructorId === currentUser?.id
          );
          
          setCourses(myCourses);

          const totalStudents = myCourses.reduce(
            (acc: number, curr: any) => acc + (curr._count?.enrollments || 0),
            0
          );

          setStats((prev) => ({
            ...prev,
            activeCourses: myCourses.length,
            totalStudents: totalStudents,
          }));
        }
      } catch (error) {
        console.error("Failed to fetch dashboard data", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [router]);

  if (loading) {
    return (
      <div className="lecturer-dashboard dashboard-content">
        <div className="stat-card">Memuat...</div>
      </div>
    );
  }

  return (
    <div className="lecturer-dashboard dashboard-content">
        {/* ---- WELCOME BANNER ---- */}
        <section className="welcome-banner">
          <div className="banner-decoration">
            <div className="banner-circle banner-circle-1"></div>
            <div className="banner-circle banner-circle-2"></div>
            <div className="banner-circle banner-circle-3"></div>
            <div className="banner-dots"></div>
          </div>
          <div className="banner-content">
            <p className="banner-greeting">Selamat Datang Kembali</p>
            <h2 className="banner-title">Halo, {user?.name || "Dosen"}! 👋</h2>
            <p className="banner-subtitle">Anda memiliki <strong>{stats.pendingSubmissions} tugas mahasiswa</strong> yang menunggu untuk ditinjau hari ini.</p>
          </div>
          <div className="banner-actions">
            <Link
              href="/dosen/courses/create"
              className="btn-primary-white"
              id="review-submissions-btn"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                <polyline points="14 2 14 8 20 8" />
              </svg>
              Buat Course
            </Link>
            <Link
              href="/dosen/courses"
              className="btn-outline-white"
              id="view-schedule-btn"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
              Lihat Kelas
            </Link>
            <Link
              href="/labs"
              className="btn-outline-white"
              id="view-labs-btn"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
                <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
              </svg>
              Practical Lab
            </Link>
          </div>
        </section>

        {/* ---- STAT CARDS ---- */}
        <section className="stat-overview">
          <div className="stat-card">
            <div className="stat-card-accent accent-blue"></div>
            <div className="stat-icon-wrap blue">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 19.5A2.5 2.5 0 016.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" />
              </svg>
            </div>
            <div className="stat-body">
              <p className="stat-label">Mata Kuliah Aktif</p>
              <p className="stat-value">{stats.activeCourses}</p>
              <p className="stat-change neutral">Semester Berjalan</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-card-accent accent-green"></div>
            <div className="stat-icon-wrap green">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 00-3-3.87" /><path d="M16 3.13a4 4 0 010 7.75" />
              </svg>
            </div>
            <div className="stat-body">
              <p className="stat-label">Total Mahasiswa</p>
              <p className="stat-value">{stats.totalStudents}</p>
              <p className="stat-change up">
                Di semua mata kuliah
              </p>
            </div>
          </div>

          <div className="stat-card alert-card">
            <div className="stat-card-accent accent-orange"></div>
            <div className="stat-icon-wrap orange">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="12" y1="18" x2="12" y2="12" /><line x1="9" y1="15" x2="15" y2="15" />
              </svg>
            </div>
            <div className="stat-body">
              <p className="stat-label">Tugas Pending</p>
              <p className="stat-value">{stats.pendingSubmissions}</p>
              <p className="stat-change" style={{ color: "var(--orange)" }}>Perlu ditinjau segera</p>
            </div>
          </div>

        </section>

        {/* ---- MAIN BODY ---- */}
        <div className="main-body-layout">
          {/* Course Management */}
          <section className="course-management">
            <div className="section-header">
              <h3 className="section-title">Manajemen Mata Kuliah</h3>
              <Link href="/dosen/courses" className="view-all-link">
                Lihat Semua
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="9 18 15 12 9 6" /></svg>
              </Link>
            </div>

            <div className="course-grid">
              {courses.length > 0 ? (
                courses.map((course, index) => {
                  const isPurple = index % 2 !== 0;
                  return (
                    <div className="course-card" key={course.id}>
                      <div className="course-card-top">
                        <div className={`course-icon-wrap ${isPurple ? "purple" : "blue"}`}>
                          {isPurple ? (
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" />
                            </svg>
                          ) : (
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" />
                            </svg>
                          )}
                        </div>
                        <span className="course-badge">{course.id.substring(0, 8).toUpperCase()}</span>
                      </div>
                      <h4 className="course-name">{course.title}</h4>
                      <div className="course-meta">
                        <span>{course.description ? course.description.substring(0, 20) + "..." : "Tanpa deskripsi"}</span>
                        <span className="course-meta-dot"></span>
                        <span>{course._count?.enrollments || 0} Mahasiswa</span>
                      </div>
                      <div className="progress-section" style={{ display: 'flex', flexDirection: 'column', gap: '8px', borderTop: '1px solid var(--border)', paddingTop: '12px', marginTop: '12px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: 'var(--text-secondary)' }}>
                          <span>Total Modul</span>
                          <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{course._count?.modules || 0} Modul</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: 'var(--text-secondary)' }}>
                          <span>Kapasitas & SKS</span>
                          <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{course.enrollmentCap} Siswa · {course.credits} SKS</span>
                        </div>
                      </div>
                      <div className="course-actions">
                        <Link href={`/dosen/courses/${course.id}`} className="btn-filled" style={{ textDecoration: 'none', textAlign: 'center', width: '100%' }}>Kelola Mata Kuliah</Link>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="empty-course-state">
                  <div className="empty-course-icon" aria-hidden="true">
                    <svg viewBox="0 0 24 24" fill="none">
                      <path
                        d="M4.75 6.5A2.75 2.75 0 0 1 7.5 3.75h11.75v13.5H7.5a2.75 2.75 0 0 0-2.75 2.75V6.5Z"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M4.75 20A2.75 2.75 0 0 1 7.5 17.25h11.75M8.25 8h7.5M8.25 11.25h5.25"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                  <p>Anda belum memiliki mata kuliah yang diampu.</p>
                </div>
              )}
            </div>
          </section>

          {/* Recent Submissions Panel */}
          <aside className="submissions-panel">
            <div className="panel-header">
              <div className="section-header">
                <h3 className="section-title">
                  Tugas Terbaru
                </h3>
              </div>
            </div>

            <div className="panel-body">
              <div className="empty-course-state">
                <div className="empty-course-icon" aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="none">
                    <path
                      d="M7 4.75h7l4.25 4.25v9.25A1.75 1.75 0 0 1 16.5 20H7A1.75 1.75 0 0 1 5.25 18.25V6.5A1.75 1.75 0 0 1 7 4.75Z"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M14 4.75V9h4.25M8.5 12.25h6.5M8.5 15.25h4.5"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                <p>Belum ada data tugas terbaru</p>
              </div>
            </div>

          </aside>
        </div>
    </div>
  );
}

