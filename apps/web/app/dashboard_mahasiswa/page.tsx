"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { buildApiUrl } from "@/lib/api/apiConfig";
import { COURSE_CATALOG_HREF } from "@/lib/courseNavigation";
import "./dashboard.css";

interface DashboardUser {
  id?: string;
  name?: string;
  email?: string;
  role?: string;
  xp?: number;
  maxCredits?: number;
  usedCredits?: number;
  remainingCredits?: number;
  angkatan?: number;
}

interface EnrolledCourse {
  id: string;
  title: string;
  credits?: number;
  category?: string;
  instructor?: {
    name?: string;
  };
  enrollments?: Array<{
    studentId?: string;
  }>;
}

interface DisplayCourse {
  id: string;
  title: string;
  instructor: string;
  tag: string;
  tagColor: "blue" | "purple";
  progress: number;
  progressColor: "blue" | "purple";
  action: string;
  actionType: "primary" | "secondary";
}

const RING_RADIUS = 30;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

export default function DashboardMahasiswaPage() {
  const [user, setUser] = useState<DashboardUser | null>(null);
  const [enrolledCourses, setEnrolledCourses] = useState<EnrolledCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [rank, setRank] = useState<string | number>("-");
  const [gpa, setGpa] = useState<string>("-");
  const router = useRouter();

  useEffect(() => {
    const fetchDashboardData = async () => {
      const token = sessionStorage.getItem("token");

      if (!token) {
        router.push("/login");
        return;
      }

      try {
        const currentUser = await resolveCurrentUser(token);
        setUser(currentUser);

        const courses = await fetchStudentCourses(token, currentUser?.id);
        setEnrolledCourses(courses);

        // Fetch leaderboard to calculate rank dynamically
        try {
          const lbRes = await fetch(buildApiUrl("/leaderboard"), {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (lbRes.ok) {
            const lbData = await lbRes.json();
            const myEntry = lbData.find((entry: any) => entry.id === currentUser?.id);
            if (myEntry) {
              setRank(myEntry.position || myEntry.rank || 1);
            } else {
              setRank(lbData.length > 0 ? lbData.length + 1 : 1);
            }
          }
        } catch (err) {
          console.error("Failed to fetch leaderboard for rank", err);
        }

        // Calculate GPA dynamically based on user XP
        if (currentUser) {
          const calculatedGpa = Math.min(4.0, 3.0 + ((currentUser.xp || 0) / 1000)).toFixed(2);
          setGpa(calculatedGpa);
        }
      } catch (error) {
        console.error("Failed to fetch dashboard data", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [router]);

  const handleExportReport = () => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    const dateStr = new Date().toLocaleDateString("id-ID", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    const coursesListHtml = enrolledCourses.map((c) => `
      <tr>
        <td style="padding: 12px; border-bottom: 1px solid #e2e8f0; font-weight: bold; text-align: left;">${c.title}</td>
        <td style="padding: 12px; border-bottom: 1px solid #e2e8f0; text-align: left;">${c.instructor?.name || 'Dosen'}</td>
        <td style="padding: 12px; border-bottom: 1px solid #e2e8f0; text-align: center;">${c.credits || 3} SKS</td>
        <td style="padding: 12px; border-bottom: 1px solid #e2e8f0; text-align: center; color: #16a34a; font-weight: bold;">Aktif</td>
      </tr>
    `).join('');

    printWindow.document.write(`
      <html>
        <head>
          <title>Laporan_Akademik_${user?.name || 'Mahasiswa'}</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&display=swap');
            body {
              font-family: 'Plus Jakarta Sans', sans-serif;
              color: #1e293b;
              margin: 40px;
              line-height: 1.5;
            }
            .header {
              display: flex;
              justify-content: space-between;
              align-items: center;
              border-bottom: 3px double #e2e8f0;
              padding-bottom: 20px;
              margin-bottom: 30px;
            }
            .logo {
              font-size: 24px;
              font-weight: 800;
              color: #2563eb;
            }
            .logo span {
              color: #7c3aed;
            }
            .title {
              text-align: center;
              font-size: 20px;
              font-weight: 800;
              text-transform: uppercase;
              letter-spacing: 0.5px;
              margin-bottom: 30px;
            }
            .meta-grid {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 16px;
              margin-bottom: 30px;
              background: #f8fafc;
              padding: 20px;
              border-radius: 12px;
              border: 1px solid #e2e8f0;
            }
            .meta-item span {
              font-size: 13px;
              color: #64748b;
              display: block;
              margin-bottom: 4px;
            }
            .meta-item strong {
              font-size: 15px;
              color: #0f172a;
            }
            .stats-grid {
              display: grid;
              grid-template-columns: repeat(3, 1fr);
              gap: 16px;
              margin-bottom: 30px;
            }
            .stat-box {
              border: 1px solid #e2e8f0;
              padding: 16px;
              border-radius: 12px;
              text-align: center;
              background: #fff;
            }
            .stat-box span {
              font-size: 11px;
              font-weight: 700;
              color: #64748b;
              text-transform: uppercase;
              letter-spacing: 0.5px;
            }
            .stat-box strong {
              font-size: 24px;
              color: #1e293b;
              display: block;
              margin-top: 4px;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 40px;
            }
            th {
              background: #f1f5f9;
              padding: 12px;
              font-size: 12px;
              font-weight: 700;
              text-transform: uppercase;
              color: #475569;
              border-bottom: 2px solid #cbd5e1;
            }
            .footer-sig {
              margin-top: 60px;
              display: flex;
              justify-content: flex-end;
            }
            .sig-box {
              text-align: center;
              width: 200px;
            }
            .sig-line {
              border-top: 1px solid #94a3b8;
              margin-top: 60px;
              padding-top: 8px;
              font-size: 14px;
              font-weight: 600;
            }
            @media print {
              body { margin: 0; }
              button { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="logo">AFADIA<span>Academy</span></div>
            <div style="text-align: right; font-size: 12px; color: #64748b;">
              Sistem Manajemen Akademik & Praktikum
            </div>
          </div>
          
          <div class="title">Laporan Perkembangan Akademik Mahasiswa</div>
          
          <div class="meta-grid">
            <div class="meta-item">
              <span>NAMA MAHASISWA</span>
              <strong>${user?.name || 'Mahasiswa'}</strong>
            </div>
            <div class="meta-item">
              <span>EMAIL</span>
              <strong>${user?.email || '-'}</strong>
            </div>
            <div class="meta-item">
              <span>PROGRAM STUDI</span>
              <strong>Teknik Informatika (D4)</strong>
            </div>
            <div class="meta-item">
              <span>ANGKATAN / SEMESTER</span>
              <strong>${user?.angkatan || 2024} / Semester 4</strong>
            </div>
          </div>

          <div class="stats-grid">
            <div class="stat-box">
              <span>Mata Kuliah Diikuti</span>
              <strong>${enrolledCourses.length}</strong>
            </div>
            <div class="stat-box">
              <span>SKS Diambil</span>
              <strong>${enrolledCourses.reduce((sum, c) => sum + (c.credits || 3), 0)}</strong>
            </div>
            <div class="stat-box">
              <span>Akumulasi XP</span>
              <strong>${user?.xp || 0} XP</strong>
            </div>
          </div>

          <h3 style="font-size: 16px; margin-bottom: 15px;">Daftar Mata Kuliah Terdaftar</h3>
          <table>
            <thead>
              <tr>
                <th style="text-align: left;">Mata Kuliah</th>
                <th style="text-align: left;">Dosen Pengampu</th>
                <th style="text-align: center;">SKS</th>
                <th style="text-align: center;">Status</th>
              </tr>
            </thead>
            <tbody>
              ${coursesListHtml.length > 0 ? coursesListHtml : '<tr><td colspan="4" style="text-align: center; padding: 20px; color: #94a3b8;">Belum ada mata kuliah yang terdaftar.</td></tr>'}
            </tbody>
          </table>

          <div class="footer-sig">
            <div class="sig-box">
              <p style="font-size: 13px; color: #64748b; margin-bottom: 10px;">Dicetak pada tanggal ${dateStr}</p>
              <div class="sig-line">
                ${user?.name || 'Mahasiswa'}<br/>
                <span style="font-size: 11px; color: #64748b; font-weight: normal;">NIM: 2201083042</span>
              </div>
            </div>
          </div>

          <script>
            window.onload = function() {
              window.print();
            }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const displayCourses = useMemo(
    () => buildDisplayCourses(enrolledCourses.slice(0, 4)),
    [enrolledCourses]
  );
  const dashboardStats = useMemo(
    () => buildDashboardStats(displayCourses, enrolledCourses, user),
    [displayCourses, enrolledCourses, user]
  );

  if (loading) {
    return (
      <div className="student-dashboard dashboard-content">
        <div className="stat-card">Memuat...</div>
      </div>
    );
  }

  const ringOffset = RING_CIRCUMFERENCE - (RING_CIRCUMFERENCE * dashboardStats.overallProgress) / 100;

  return (
    <div className="student-dashboard dashboard-content">
      <section className="welcome-banner">
        <div className="banner-decoration">
          <div className="banner-circle banner-circle-1" />
          <div className="banner-circle banner-circle-2" />
          <div className="banner-circle banner-circle-3" />
          <div className="banner-dots" />
        </div>

        <div className="banner-content">
          <p className="banner-greeting">Selamat Datang Kembali</p>
          <h2 className="banner-title">Halo, {user?.name || "Mahasiswa"}</h2>
          <p className="banner-subtitle">
            Perjalanan akademikmu <strong>terlihat luar biasa</strong> semester ini.
          </p>
        </div>

        <div className="banner-actions">
          <button className="btn-primary-white" type="button" onClick={handleExportReport}>
            <DownloadIcon />
            Ekspor Laporan
          </button>
          <button className="btn-outline-white" type="button" onClick={() => router.push(COURSE_CATALOG_HREF)}>
            <BookIcon />
            Lihat Kursus
          </button>
          <button className="btn-outline-white" type="button" onClick={() => router.push('/labs')}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '8px' }}>
              <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
              <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
            </svg>
            Practical Lab
          </button>
        </div>
      </section>

      <section className="stat-overview">
        <SummaryCard
          accentClass="accent-green"
          iconClass="green"
          label="COMPLETED"
          value={`${dashboardStats.completedModules}`}
          unit="Modules"
        />
        <SummaryCard
          accentClass="accent-orange"
          iconClass="orange"
          label="SKS"
          value={`${dashboardStats.availableCredits}`}
          unit="SKS"
        />
      </section>

      <div className="main-body-layout">
        <section>
          <div className="section-header">
            <h3 className="section-title">Active Courses</h3>
            <Link href="/courses/my" className="view-all-link">
              View All
              <ChevronRightIcon />
            </Link>
          </div>

          <div className="course-grid">
            {displayCourses.length > 0 ? (
              displayCourses.map((course) => (
                <CourseCard key={course.id} course={course} onOpen={() => router.push(`/courses/${course.id}`)} />
              ))
            ) : (
              <EmptyDashboardCard
                title="Belum ada course aktif"
                description="Course yang sudah Anda enroll akan tampil di sini setelah tersedia dari API."
              />
            )}
          </div>
        </section>

        <aside className="right-panel">
          <div className="performance-stats">
            <MiniStat label="GPA" value={gpa} />
            <MiniStat label="RANK" value={typeof rank === "number" ? `#${rank}` : rank} />
          </div>

          <div className="deadlines-card">
            <div className="deadlines-header">
              <h3 className="section-title">Deadlines</h3>
              <button className="icon-btn" title="Filter" type="button">
                <FilterIcon />
              </button>
            </div>

            <ul className="deadlines-list">
              <li className="deadline-item">
                <div>
                  <p className="deadline-title">Belum ada deadline</p>
                  <p className="deadline-course">Deadline akan tampil setelah data assignment tersedia dari API.</p>
                </div>
              </li>
            </ul>

            <Link href="/calendar" className="view-calendar-link">
              View Full Calendar -&gt;
            </Link>
          </div>

          <div className="registration-cta">
            <div className="cta-icon">
              <BookIcon />
            </div>
            <h3 className="cta-title">Registrasi Course</h3>
            <p className="cta-desc">
              Pilih course dari katalog utama untuk melihat detail dan melakukan enroll.
            </p>
            <div className="cta-buttons">
              <button className="btn-cta-primary" type="button" onClick={() => router.push(COURSE_CATALOG_HREF)}>Lihat Course</button>
              <button className="btn-cta-secondary" type="button" onClick={() => router.push("/courses/my")}>My Courses</button>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

async function resolveCurrentUser(token: string) {
  const storedUser = getStoredUser();

  try {
    const response = await fetch(buildApiUrl("/auth/profile"), {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok) {
      return storedUser;
    }

    return response.json();
  } catch {
    return storedUser;
  }
}

async function fetchStudentCourses(token: string, studentId?: string) {
  if (!studentId) {
    return [];
  }

  const response = await fetch(buildApiUrl("/courses/my"), {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    return [];
  }

  const courses: EnrolledCourse[] = await response.json();
  return courses;
}

function getStoredUser(): DashboardUser | null {
  try {
    return JSON.parse(sessionStorage.getItem("user") || "null");
  } catch {
    return null;
  }
}

function buildDisplayCourses(courses: EnrolledCourse[]): DisplayCourse[] {
  return courses.map((course, index) => {
    const isEvenCourse = index % 2 === 0;

    return {
      id: course.id,
      title: course.title,
      instructor: course.instructor?.name || "Dosen",
      tag: course.category || "MATA KULIAH",
      tagColor: isEvenCourse ? "blue" : "purple",
      progress: 0,
      progressColor: isEvenCourse ? "blue" : "purple",
      action: "Buka Course",
      actionType: "primary",
    };
  });
}

function buildDashboardStats(
  courses: DisplayCourse[],
  enrolledCourses: EnrolledCourse[],
  user: DashboardUser | null
) {
  const DEFAULT_AVAILABLE_CREDITS = 24;
  const courseCreditTotal = enrolledCourses.reduce(
    (totalCredits, course) => totalCredits + (course.credits ?? 3),
    0
  );
  const maxCredits = user?.maxCredits ?? DEFAULT_AVAILABLE_CREDITS;
  const availableCredits = user?.remainingCredits ?? Math.max(maxCredits - courseCreditTotal, 0);

  if (courses.length === 0) {
    return {
      overallProgress: 0,
      completedModules: 0,
      availableCredits,
    };
  }

  const totalProgress = courses.reduce((sum, course) => sum + course.progress, 0);

  return {
    overallProgress: Math.round(totalProgress / courses.length),
    completedModules: 0,
    availableCredits,
  };
}

function SummaryCard({
  accentClass,
  iconClass,
  label,
  value,
  unit,
  change,
  warning = false,
}: {
  accentClass: string;
  iconClass: string;
  label: string;
  value: string;
  unit: string;
  change?: string;
  warning?: boolean;
}) {
  return (
    <div className="stat-card">
      <div className={`stat-card-accent ${accentClass}`} />
      <div className={`stat-icon-wrap ${iconClass}`}>
        <CheckIcon />
      </div>
      <div className="stat-body">
        <p className="stat-label">{label}</p>
        <p className="stat-value">
          {value} <span className="stat-unit">{unit}</span>
        </p>
        {change ? (
          <p className={`stat-change ${warning ? "warning" : "up"}`}>{change}</p>
        ) : null}
      </div>
    </div>
  );
}

function CourseCard({ course, onOpen }: { course: DisplayCourse; onOpen: () => void }) {
  return (
    <div className="course-card">
      <div className="course-card-top">
        <span className={`course-tag ${course.tagColor}`}>{course.tag}</span>
        <button className="course-more-btn" aria-label="Opsi kursus" type="button">
          <MoreIcon />
        </button>
      </div>
      <h4 className="course-name">{course.title}</h4>
      <p className="course-instructor">
        <UserIcon />
        {course.instructor}
      </p>
      <button className={`course-action-btn ${course.actionType}`} type="button" onClick={onOpen}>
        {course.action}
      </button>
    </div>
  );
}

function EmptyDashboardCard({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="course-card" style={{ gridColumn: "1 / -1" }}>
      <h4 className="course-name">{title}</h4>
      <p className="course-instructor">{description}</p>
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="stat-card-mini">
      <span className="stat-mini-label">{label}</span>
      <span className="stat-mini-value">{value}</span>
    </div>
  );
}

function DownloadIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <path d="M7 10l5 5 5-5" />
      <path d="M12 15V3" />
    </svg>
  );
}

function BookIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

function ChevronRightIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
      <path d="m9 18 6-6-6-6" />
    </svg>
  );
}

function MoreIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="5" r="1" />
      <circle cx="12" cy="12" r="1" />
      <circle cx="12" cy="19" r="1" />
    </svg>
  );
}

function UserIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

function FilterIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M4 6h16" />
      <path d="M8 12h8" />
      <path d="M12 18h.01" />
    </svg>
  );
}
