import React, { Suspense } from "react";
import { AppShell } from "@/components/layout/AppShell";

export default function CalendarLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense fallback={null}>
      <AppShell>{children}</AppShell>
    </Suspense>
  );
}
