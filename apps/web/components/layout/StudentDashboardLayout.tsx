"use client";

import React from "react";
import { StudentSidebar } from "@/components/layout/StudentSidebar";
import { StudentTopBar } from "@/components/layout/StudentTopBar";
import "@/app/dashboard_mahasiswa/dashboard.css";

interface StudentDashboardLayoutProps {
  children: React.ReactNode;
  activeTab?: "dashboard" | "courses" | "labs" | "calendar" | "profile";
  title: string;
  rightPanel?: React.ReactNode;
}

export function StudentDashboardLayout({ children, activeTab = "dashboard", title, rightPanel }: StudentDashboardLayoutProps) {
  return (
    <div className="student-dashboard app-wrapper">
      {/* SIDEBAR */}
      <StudentSidebar activeTab={activeTab} />

      {/* MAIN CONTENT */}
      <main className="main-content">
        {/* TOP BAR */}
        <StudentTopBar title={title} />

        {/* PAGE CONTENT */}
        <div className="dashboard-content">
          {children}
        </div>
      </main>

      {/* OPTIONAL RIGHT PANEL */}
      {rightPanel && rightPanel}
    </div>
  );
}
