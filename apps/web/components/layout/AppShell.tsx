'use client';

import React, { createContext, useContext, useMemo, useState, useSyncExternalStore, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { TopNavBar } from './TopNavBar';
import { SideNavBar } from './SideNavBar';
import { Footer } from './Footer';
import { useEnrollmentStore } from '@/lib/stores/useEnrollmentStore';
import { buildApiUrl } from '@/lib/api/apiConfig';

const TOP_NAV_HEIGHT_PX = 73;
const DESKTOP_SIDEBAR_WIDTH_PX = 256;

interface AppShellProps {
  children: React.ReactNode;
  mode?: 'student' | 'lecturer';
}

interface AppShellContextValue {
  isMobile: boolean;
  sidebarOpen: boolean;
  rightSidebarOpen: boolean;
  openSidebar: () => void;
  closeSidebar: () => void;
  toggleSidebar: () => void;
  openRightSidebar: () => void;
  closeRightSidebar: () => void;
  toggleRightSidebar: () => void;
}

const AppShellContext = createContext<AppShellContextValue | null>(null);

export const AppShell: React.FC<AppShellProps> = ({ children, mode = 'student' }) => {
  const pathname = usePathname();
  const isMobile = useMediaQuery('(max-width: 767px)');
  const [desktopSidebarCollapsed, setDesktopSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [rightSidebarOpen, setRightSidebarOpen] = useState(false);
  const sidebarOpen = isMobile ? mobileSidebarOpen : !desktopSidebarCollapsed;

  const setEnrollments = useEnrollmentStore((state) => state.setEnrollments);

  useEffect(() => {
    if (mode !== 'student') return;

    const syncEnrollments = async () => {
      try {
        const token = sessionStorage.getItem('token');
        if (!token) {
          setEnrollments([]);
          return;
        }

        const res = await fetch(buildApiUrl('/courses/my'), {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const enrolledCourses = await res.json();
          const enrolledIds = enrolledCourses.map((c: any) => c.id);
          setEnrollments(enrolledIds);
        }
      } catch (err) {
        console.error('Failed to sync student enrollments:', err);
      }
    };

    syncEnrollments();
  }, [mode, setEnrollments, pathname]); // Re-sync when page path changes or store/mode changes

  const contextValue = useMemo<AppShellContextValue>(
    () => ({
      isMobile,
      sidebarOpen,
      rightSidebarOpen,
      openSidebar: () => {
        setRightSidebarOpen(false);

        if (isMobile) {
          setMobileSidebarOpen(true);
          return;
        }

        setDesktopSidebarCollapsed(false);
      },
      closeSidebar: () => {
        if (isMobile) {
          setMobileSidebarOpen(false);
          return;
        }

        setDesktopSidebarCollapsed(true);
      },
      toggleSidebar: () => {
        setRightSidebarOpen(false);

        if (isMobile) {
          setMobileSidebarOpen((prev) => !prev);
          return;
        }

        setDesktopSidebarCollapsed((prev) => !prev);
      },
      openRightSidebar: () => {
        if (isMobile) {
          setMobileSidebarOpen(false);
        } else {
          setDesktopSidebarCollapsed(true);
        }

        setRightSidebarOpen(true);
      },
      closeRightSidebar: () => setRightSidebarOpen(false),
      toggleRightSidebar: () => {
        setRightSidebarOpen((prev) => {
          const next = !prev;

          if (next) {
            if (isMobile) {
              setMobileSidebarOpen(false);
            } else {
              setDesktopSidebarCollapsed(true);
            }
          }

          return next;
        });
      },
    }),
    [isMobile, rightSidebarOpen, sidebarOpen]
  );

  const gutterWidth = getSidebarGutterWidth({
    isMobile,
    sidebarOpen,
  });

  return (
    <AppShellContext.Provider value={contextValue}>
      <div className="min-h-screen flex flex-col" style={{ background: 'var(--color-bg-backdrop)' }}>
        <TopNavBar
          onToggleSidebar={contextValue.toggleSidebar}
          brandHref={mode === 'lecturer' ? '/dashboard_dosen' : '/dashboard_mahasiswa'}
          searchBasePath={mode === 'lecturer' ? '/dosen/courses' : undefined}
        />
        <SideNavBar
          sidebarOpen={sidebarOpen}
          onClose={isMobile ? contextValue.closeSidebar : noop}
          mode={mode}
        />

        {isMobile && sidebarOpen ? (
          <div
            className="fixed inset-0 z-30 bg-black/30"
            onClick={contextValue.closeSidebar}
          />
        ) : null}

        <div style={{ paddingTop: `${TOP_NAV_HEIGHT_PX}px`, flex: 1, display: 'flex', flexDirection: 'column' }}>
          <div style={{ flex: 1, display: 'flex' }}>
            <div
              style={{
                width: `${gutterWidth}px`,
                flexShrink: 0,
                borderRight: gutterWidth > 0 ? '1px solid var(--color-border)' : 'none',
                transition: 'width 0.3s ease',
              }}
            />

            <main
              style={{
                flex: 1,
                minWidth: 0,
                display: 'flex',
                padding: 'var(--page-surface-gap)',
                background: 'var(--color-bg-backdrop)',
              }}
            >
              <div
                key={pathname}
                className="h-full page-transition"
                style={{
                  flex: 1,
                  minWidth: 0,
                  overflowY: 'auto',
                  overflowX: 'hidden',
                  padding: 'var(--page-surface-gap)',
                  border: '1px solid rgba(195,198,214,0.72)',
                  borderRadius: 'var(--page-surface-radius)',
                  background: 'var(--color-bg-page)',
                  color: 'var(--color-text-primary)',
                  boxShadow: '0 18px 40px rgba(15, 33, 74, 0.04)',
                }}
              >
                {children}
              </div>
            </main>
          </div>

          <Footer />
        </div>
      </div>
    </AppShellContext.Provider>
  );
};

export function useAppShell() {
  const context = useContext(AppShellContext);

  if (!context) {
    throw new Error('useAppShell must be used within AppShell');
  }

  return context;
}

function getSidebarGutterWidth({
  isMobile,
  sidebarOpen,
}: {
  isMobile: boolean;
  sidebarOpen: boolean;
}) {
  if (isMobile || !sidebarOpen) {
    return 0;
  }

  return DESKTOP_SIDEBAR_WIDTH_PX;
}

function noop() {
  return undefined;
}

function useMediaQuery(query: string) {
  return useSyncExternalStore(
    (onStoreChange) => {
      if (typeof window === 'undefined') {
        return () => undefined;
      }

      const mediaQuery = window.matchMedia(query);
      mediaQuery.addEventListener('change', onStoreChange);
      return () => mediaQuery.removeEventListener('change', onStoreChange);
    },
    () => (typeof window !== 'undefined' ? window.matchMedia(query).matches : false),
    () => false
  );
}
