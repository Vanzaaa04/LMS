"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEnrollmentStore } from "@/lib/stores/useEnrollmentStore";

interface AdminSidebarProps {
  activeTab?: "dashboard" | "users" | "courses";
}

export function AdminSidebar({ activeTab = "dashboard" }: AdminSidebarProps) {
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
    if (!name) return "A";
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
        <div className="logo-icon" style={{ background: "linear-gradient(135deg, #007272, #009e9e)" }}>
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
            href="/dashboard_admin"
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
            href="/dashboard_admin/users"
            className={`nav-link ${activeTab === "users" ? "active" : ""}`}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 00-3-3.87" />
              <path d="M16 3.13a4 4 0 010 7.75" />
            </svg>
            Kelola Pengguna
          </Link>
        </div>
        <div className="nav-item">
          <Link
            href="/dashboard_admin/courses"
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
            Manajemen Mata Kuliah
          </Link>
        </div>

        {/* MOCK NAV GROUP FOR PREMIUM AESTHETIC */}
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

        <div className="nav-section-label">Settings</div>
        <div className="nav-item">
          <span className="nav-link" onClick={() => alert("Pengaturan Notifikasi sedang dikembangkan!")}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
            Notifikasi
          </span>
        </div>
        <div className="nav-item">
          <span className="nav-link" onClick={() => alert("Pusat Bantuan sedang dikembangkan!")}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
            Pusat Bantuan
          </span>
        </div>
      </nav>

      {/* Trial Access Promo Card like SinauHub */}
      <div className="sidebar-upgrade">
        <div className="sidebar-upgrade-icon">🚀</div>
        <div className="sidebar-upgrade-title">Akses Premium Admin</div>
        <div className="sidebar-upgrade-desc">Kelola modul, database, & instruktur tanpa batasan sistem.</div>
        <button className="sidebar-upgrade-btn" onClick={() => alert("Anda sudah memiliki akses Administrator tertinggi!")}>Aktivasi</button>
      </div>

      {/* User card at bottom with Logout */}
      <div className="sidebar-footer">
        <div className="user-card" onClick={handleLogout}>
          <div className="user-avatar">{getInitials(user?.name)}</div>
          <div className="user-info">
            <p className="user-name">{user?.name || "Admin"}</p>
            <p className="user-role">
              {user?.role === "ADMIN" ? "Administrator" : user?.role || "Admin"}
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
