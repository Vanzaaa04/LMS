import React, { Suspense } from 'react';
import { AppShell } from '@/components/layout/AppShell';

export default function DashboardMahasiswaLayout({
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
