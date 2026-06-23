'use client';

import { Suspense } from 'react';
import { AppShell } from '@/components/layout/AppShell';

export default function DosenLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense fallback={null}>
      <AppShell mode="lecturer">{children}</AppShell>
    </Suspense>
  );
}
