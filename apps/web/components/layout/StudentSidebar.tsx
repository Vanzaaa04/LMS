"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEnrollmentStore } from "@/lib/stores/useEnrollmentStore";

interface StudentSidebarProps {
  activeTab?: "dashboard" | "courses" | "labs" | "calendar" | "profile";
}

export function StudentSidebar({ activeTab = "dashboard" }: StudentSidebarProps) {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    try {
      const stored = sessionStorage.getItem("user");
      if (stored) {
        setUser(JSON.parse(stored));
      }
    } catch (e) {
      console.error("Failed to read user from sessionStorage", e);
    }
  }, []);

  const getInitials = (name: string) => {
    if (!name) return "M";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .substring(0, 2)
      .toUpperCase();
  };

  const handleLogout = () => {
    sessionStorage.clear();
    if (typeof window !== 'undefined') {
      for (let i = localStorage.length - 1; i >= 0; i--) {
        const key = localStorage.key(i);
        if (key && key.startsWith('lab-reg-')) {
          localStorage.removeItem(key);
        }
      }
    }
    useEnrollmentStore.getState().resetEnrollments();
    router.push("/login");
  };

  return (
    <aside className="sidebar">
      {/* Logo */}
      <div className="sidebar-header">
        <div className="logo-icon">
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 2L2 7l10 5 10-5-10-5z" />
            <path d="M2 17l10 5 10-5" />
            <path d="M2 12l10 5 10-5" />
          </svg>
        </div>
        <span className="logo-text">
          AFADIA<span>Academy</span>
        </span>
      </div>

      {/* Navigation */}
      <nav className="sidebar-nav">
        <div className="nav-section-label">Main Navigation</div>
        <div className="nav-item">
          <Link
            href="/dashboard_mahasiswa"
            className={`nav-link ${activeTab === "dashboard" ? "active" : ""}`}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <rect x="3" y="3" width="7" height="7" rx="1" />
              <rect x="14" y="3" width="7" height="7" rx="1" />
              <rect x="3" y="14" width="7" height="7" rx="1" />
              <rect x="14" y="14" width="7" height="7" rx="1" />
            </svg>
            Dashboard
          </Link>
        </div>
        <div className="nav-item">
          <Link
            href="/courses/my"
            className={`nav-link ${activeTab === "courses" ? "active" : ""}`}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M4 19.5A2.5 2.5 0 016.5 17H20" />
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" />
            </svg>
            My Courses
          </Link>
        </div>
        <div className="nav-item">
          <Link
            href="/labs"
            className={`nav-link ${activeTab === "labs" ? "active" : ""}`}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
              <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
            </svg>
            Practical Lab
          </Link>
        </div>
        <div className="nav-item">
          <Link
            href="/calendar"
            className={`nav-link ${activeTab === "calendar" ? "active" : ""}`}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
            Calendar
          </Link>
        </div>
        <div className="nav-item">
          <Link
            href="/dashboard_mahasiswa/profile"
            className={`nav-link ${activeTab === "profile" ? "active" : ""}`}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
            Profil Saya
          </Link>
        </div>
      </nav>

      {/* Upgrade Card */}
      <div className="sidebar-upgrade">
        <div className="sidebar-upgrade-icon">🎓</div>
        <div className="sidebar-upgrade-title">Student Portal</div>
        <div className="sidebar-upgrade-desc">Akses fitur premium, sertifikat, dan lab tanpa batas.</div>
        <button className="sidebar-upgrade-btn" onClick={() => alert("Fitur premium sedang dikembangkan!")}>Upgrade</button>
      </div>

      {/* User card at bottom with Logout */}
      <div className="sidebar-footer">
        <div className="user-card" onClick={handleLogout}>
          <div className="user-avatar">{getInitials(user?.name)}</div>
          <div className="user-info">
            <p className="user-name">{user?.name || "Mahasiswa"}</p>
            <p className="user-role">
              {user?.role === "STUDENT" ? "Mahasiswa" : user?.role || "Student"}
            </p>
          </div>
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <title>Logout</title>
            <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" />
          </svg>
        </div>
      </div>
    </aside>
  );
}
