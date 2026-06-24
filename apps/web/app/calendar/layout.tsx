"use client";

import React, { useEffect, useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { StudentDashboardLayout } from "@/components/layout/StudentDashboardLayout";

export default function CalendarLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [role, setRole] = useState<string>("STUDENT");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const userStr = sessionStorage.getItem("user");
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        if (user.role) {
          setRole(user.role);
        }
      } catch (e) {}
    }
  }, []);

  if (!mounted) {
    return <div className="min-h-screen bg-slate-50"></div>;
  }

  if (role === "STUDENT") {
    return (
      <StudentDashboardLayout title="Kalender Akademik" activeTab="calendar">
        {children}
      </StudentDashboardLayout>
    );
  }

  if (role === "LECTURER") {
    return <AppShell mode="lecturer">{children}</AppShell>;
  }

  return <AppShell>{children}</AppShell>;
}
