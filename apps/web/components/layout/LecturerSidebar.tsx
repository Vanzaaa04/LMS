"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEnrollmentStore } from "@/lib/stores/useEnrollmentStore";

interface LecturerSidebarProps {
  activeTab?: "dashboard" | "courses" | "calendar" | "labs";
}

export function LecturerSidebar({ activeTab = "dashboard" }: LecturerSidebarProps) {
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
    if (!name) return "D";
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
        <div className="logo-icon" style={{ background: "linear-gradient(135deg, #1E3A8A, #2A52BE)" }}>
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
        <span className="logo-text" style={{ color: "#0F172A" }}>
          AFADIA<span style={{ color: "#2A52BE" }}>Academy</span>
        </span>
      </div>

      {/* Navigation */}
      <nav className="sidebar-nav">
        <div className="nav-section-label">Main Navigation</div>
        <div className="nav-item">
          <Link
            href="/dashboard_dosen"
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
            href="/dosen/courses"
            className={`nav-link ${activeTab === "courses" ? "active" : ""}`}
          >
            <svg width="16" height="20" viewBox="0 0 16 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M1 1h5a4 4 0 0 1 4 4v12a3 3 0 0 0-3-3H1V1z" />
              <path d="M15 1h-5a4 4 0 0 0-4 4v12a3 3 0 0 1 3-3h6V1z" />
            </svg>
            Courses
          </Link>
        </div>
        <div className="nav-item">
          <Link
            href="/dosen/calendar"
            className={`nav-link ${activeTab === "calendar" ? "active" : ""}`}
          >
            <svg width="18" height="20" viewBox="0 0 18 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="1" y="3" width="16" height="16" rx="2" />
              <path d="M13 1v4M5 1v4M1 7h16" />
            </svg>
            Calendar
          </Link>
        </div>
        <div className="nav-item">
          <Link
            href="/labs"
            className={`nav-link ${activeTab === "labs" ? "active" : ""}`}
          >
            <svg width="18" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
              <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
            </svg>
            Practical Lab
          </Link>
        </div>

        {/* Tools */}
        <div className="nav-section-label">Tools</div>
        <div className="nav-item">
          <span className="nav-link" onClick={() => alert("Fitur Inbox sedang dikembangkan!")}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
              <polyline points="22,6 12,13 2,6" />
            </svg>
            Inbox
            <span className="nav-badge">3</span>
          </span>
        </div>
        <div className="nav-item">
          <span className="nav-link" onClick={() => alert("Asisten AI sedang dikembangkan!")}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
              <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
              <line x1="12" y1="22.08" x2="12" y2="12" />
            </svg>
            AI Assistant
          </span>
        </div>
      </nav>

      {/* Trial Access Promo Card like SinauHub */}
      <div className="sidebar-upgrade">
        <div className="sidebar-upgrade-icon">🚀</div>
        <div className="sidebar-upgrade-title">Akses Premium Dosen</div>
        <div className="sidebar-upgrade-desc">Kelola modul, database, & instruktur tanpa batasan sistem.</div>
        <button className="sidebar-upgrade-btn" onClick={() => alert("Anda sudah memiliki akses Dosen tertinggi!")}>Aktivasi</button>
      </div>

      {/* User card at bottom with Logout */}
      <div className="sidebar-footer">
        <div className="user-card" onClick={handleLogout}>
          <div className="user-avatar">{getInitials(user?.name)}</div>
          <div className="user-info">
            <p className="user-name">{user?.name || "Dosen"}</p>
            <p className="user-role">
              {user?.role === "LECTURER" ? "Dosen Pengajar" : user?.role || "Dosen"}
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
