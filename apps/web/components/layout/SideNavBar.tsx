'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { COURSE_CATALOG_HREF } from '@/lib/courseNavigation';
import { useEnrollmentStore } from '@/lib/stores/useEnrollmentStore';

interface NavItem {
  label: string;
  href: string;
  activePath?: string;
  icon: React.ReactNode;
  children?: Array<{ label: string; href: string }>;
  matchMode?: 'exact' | 'section';
}

interface SideNavBarProps {
  sidebarOpen: boolean;
  onClose: () => void;
  mode?: 'student' | 'lecturer';
}

interface StoredUser {
  name?: string;
  role?: string;
}

export const SideNavBar: React.FC<SideNavBarProps> = ({
  sidebarOpen,
  onClose,
  mode = 'student',
}) => {
  const pathname = usePathname();
  const router = useRouter();
  const asideRef = useRef<HTMLElement>(null);
  const [user, setUser] = useState<StoredUser | null>(null);
  const coursesPath = mode === 'lecturer' ? '/dosen/courses' : '/courses';
  const coursesHref = mode === 'lecturer' ? coursesPath : COURSE_CATALOG_HREF;
  const coursesActive = pathname === coursesPath || pathname.startsWith(`${coursesPath}/`);
  const [coursesOpenOverride, setCoursesOpenOverride] = useState<boolean | null>(null);
  const coursesOpen = coursesOpenOverride ?? coursesActive;

  useEffect(() => {
    const updateBottom = () => {
      const footer = document.querySelector('footer');
      const aside = asideRef.current;
      if (!footer || !aside) return;

      const footerTop = footer.getBoundingClientRect().top;
      const windowHeight = window.innerHeight;

      aside.style.bottom = footerTop < windowHeight ? `${windowHeight - footerTop}px` : '0px';
    };

    const animationFrameId = window.requestAnimationFrame(updateBottom);
    const footer = document.querySelector('footer');
    const resizeObserver = new ResizeObserver(updateBottom);

    if (footer) {
      resizeObserver.observe(footer);
    }

    window.addEventListener('scroll', updateBottom, { passive: true });
    window.addEventListener('resize', updateBottom);
    updateBottom();

    return () => {
      window.cancelAnimationFrame(animationFrameId);
      resizeObserver.disconnect();
      window.removeEventListener('scroll', updateBottom);
      window.removeEventListener('resize', updateBottom);
    };
  }, [pathname]);

  useEffect(() => {
    setUser(getStoredUser());
  }, []);

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
    router.push('/login');
  };

  const navItems = useMemo<NavItem[]>(
    () => [
      { label: 'Dashboard', href: mode === 'lecturer' ? '/dashboard_dosen' : '/dashboard_mahasiswa', icon: <HomeIcon />, matchMode: 'exact' },
      {
        label: 'Courses',
        href: coursesHref,
        activePath: coursesPath,
        icon: <CoursesIcon />,
        children: mode === 'student' ? [
          { label: 'Katalog Kelas', href: '/courses' },
          { label: 'My Courses', href: '/courses/my' }
        ] : undefined,
        matchMode: 'section',
      },
      { label: 'Calendar', href: mode === 'lecturer' ? '/dosen/calendar' : '/calendar', icon: <CalendarIcon />, matchMode: 'section' },
      { label: 'Practical Lab', href: '/labs', icon: <LabsIcon />, matchMode: 'section' },
      ...(mode === 'student' ? [{ label: 'Profil Saya', href: '/dashboard_mahasiswa/profile', icon: <ProfileIcon />, matchMode: 'section' as const }] : []),
    ],
    [coursesHref, mode]
  );

  return (
    <aside
      ref={asideRef}
      data-sidebar
      className="fixed left-0 z-40 flex flex-col overflow-y-auto transition-all duration-300"
      style={{
        top: '73px',
        bottom: 0,
        transform: sidebarOpen ? 'translateX(0)' : 'translateX(-256px)',
        width: '256px',
        background: 'var(--color-bg-white)',
        borderRight: '1px solid var(--color-border)',
        padding: '24px 20px',
      }}
    >
      <nav className="flex flex-1 flex-col gap-1.5">
        {navItems.map((item) => {
          const isActive = isNavItemActive(pathname, item);
          const isCoursesItem = item.activePath === coursesPath;
          const showChildren = Boolean(item.children) && (isCoursesItem ? coursesOpen : isActive);

          return (
            <div key={item.href} className="px-3">
              <div
                className="flex items-center rounded-lg transition-colors"
                style={{
                  background: isActive ? 'var(--color-brand-bg)' : 'transparent',
                  color: isActive ? 'var(--color-brand-dark)' : 'var(--color-text-secondary)',
                  minHeight: '42px',
                }}
              >
                <Link
                  href={item.href}
                  onClick={onClose}
                  className="flex flex-1 items-center gap-3.5 py-2.5 pr-3 text-sm font-semibold no-underline"
                  style={{ paddingLeft: '22px' }}
                >
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center">{item.icon}</span>
                  <span>{item.label}</span>
                </Link>

                {item.children ? (
                  <button
                    type="button"
                    aria-label={showChildren ? `Collapse ${item.label}` : `Expand ${item.label}`}
                    onClick={() => setCoursesOpenOverride(!showChildren)}
                    className="mr-1 flex h-8 w-8 items-center justify-center rounded hover:bg-black/5"
                  >
                    <ChevronDownIcon expanded={showChildren} />
                  </button>
                ) : null}
              </div>

              {showChildren ? (
                <div className="mt-1.5 flex flex-col gap-1 pl-7 pr-3">
                  {item.children?.map((child) => {
                    const childActive = pathname === child.href;

                    return (
                      <Link
                        key={child.href}
                        href={child.href}
                        onClick={onClose}
                        className="flex min-h-9 items-center rounded-lg py-2 pr-3 text-sm font-medium no-underline transition-colors"
                        style={{
                          paddingLeft: '20px',
                          background: childActive ? 'var(--color-brand-bg)' : 'transparent',
                          color: childActive ? 'var(--color-brand-dark)' : 'var(--color-text-secondary)',
                        }}
                      >
                        {child.label}
                      </Link>
                    );
                  })}
                </div>
              ) : null}
            </div>
          );
        })}
      </nav>

      <button
        type="button"
        onClick={handleLogout}
        className="group mt-auto flex w-full items-center gap-3 rounded-2xl border px-3.5 py-3 text-left transition-all duration-200 hover:-translate-y-0.5 hover:border-[#2563EB] hover:bg-[#EFF6FF] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2563EB] active:translate-y-0 active:bg-[#DBEAFE]"
        style={{
          borderColor: 'var(--color-border)',
          background: 'var(--color-bg-white)',
          color: 'var(--color-text-secondary)',
          boxShadow: '0 12px 24px rgba(15, 33, 74, 0.06)',
        }}
        aria-label="Logout"
      >
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#2563EB] to-[#7C3AED] text-xs font-bold text-white">
          {getInitials(user?.name)}
        </span>
        <span className="min-w-0 flex-1" data-sidebar-footer-info>
          <span className="block truncate text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>
            {user?.name || (mode === 'lecturer' ? 'Dosen' : 'Mahasiswa')}
          </span>
          <span className="block truncate text-xs">
            {getRoleLabel(user?.role, mode)}
          </span>
        </span>
        <span className="transition-colors duration-200 group-hover:text-[#2563EB] group-active:text-[#1D4ED8]">
          <LogoutIcon />
        </span>
      </button>
    </aside>
  );
};

function getStoredUser(): StoredUser | null {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    return JSON.parse(sessionStorage.getItem('user') || 'null');
  } catch {
    return null;
  }
}

function getInitials(name?: string) {
  if (!name) {
    return 'U';
  }

  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();
}

function getRoleLabel(role: string | undefined, mode: 'student' | 'lecturer') {
  if (role === 'LECTURER') {
    return 'Dosen';
  }

  if (role === 'STUDENT') {
    return 'Mahasiswa';
  }

  return mode === 'lecturer' ? 'Dosen' : 'Mahasiswa';
}

function isNavItemActive(pathname: string, item: NavItem) {
  const activePath = item.activePath ?? item.href.split('?')[0];

  if (item.matchMode === 'exact') {
    return pathname === activePath;
  }

  if (activePath === '/courses' && pathname === '/courses/my') {
    return false;
  }

  if (activePath === '/') {
    return pathname === '/';
  }

  return pathname === activePath || pathname.startsWith(`${activePath}/`);
}

const HomeIcon: React.FC = () => (
  <svg width="18" height="18" viewBox="0 0 20 20" fill="currentColor">
    <rect x="1" y="1" width="7" height="7" rx="1" />
    <rect x="12" y="1" width="7" height="7" rx="1" />
    <rect x="1" y="12" width="7" height="7" rx="1" />
    <rect x="12" y="12" width="7" height="7" rx="1" />
  </svg>
);

const CoursesIcon: React.FC = () => (
  <svg width="16" height="20" viewBox="0 0 16 20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 1h5a4 4 0 0 1 4 4v12a3 3 0 0 0-3-3H1V1z" />
    <path d="M15 1h-5a4 4 0 0 0-4 4v12a3 3 0 0 1 3-3h6V1z" />
  </svg>
);

const CalendarIcon: React.FC = () => (
  <svg width="18" height="20" viewBox="0 0 18 20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="1" y="3" width="16" height="16" rx="2" />
    <path d="M13 1v4M5 1v4M1 7h16" />
  </svg>
);

const LabsIcon: React.FC = () => (
  <svg width="18" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
    <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
  </svg>
);

const ChevronDownIcon: React.FC<{ expanded: boolean }> = ({ expanded }) => (
  <svg
    width="10"
    height="6"
    viewBox="0 0 10 6"
    fill="none"
    style={{ transform: expanded ? 'rotate(0deg)' : 'rotate(-90deg)', transition: 'transform 0.2s ease' }}
  >
    <path d="M1 1 5 5 9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const ProfileIcon: React.FC = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
    <circle cx="12" cy="7" r="4"/>
  </svg>
);

const LogoutIcon: React.FC = () => (
  <svg
    data-sidebar-logout-icon
    width="15"
    height="15"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <path d="M16 17l5-5-5-5" />
    <path d="M21 12H9" />
  </svg>
);
