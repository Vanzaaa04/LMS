"use client";

import { usePathname } from "next/navigation";

export function useCourseBasePath() {
  const pathname = usePathname();
  
  if (pathname?.startsWith("/dashboard_admin")) {
    return "/dashboard_admin/courses";
  }
  
  return "/dosen/courses";
}
