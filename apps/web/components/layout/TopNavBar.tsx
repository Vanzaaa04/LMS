'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { COURSE_CATALOG_HREF } from '@/lib/courseNavigation';
import { BrandLogo } from './BrandLogo';
import { buildApiUrl } from '@/lib/api/apiConfig';

interface TopNavBarProps {
  onToggleSidebar: () => void;
  brandHref?: string;
  searchBasePath?: string;
}

interface StoredUser {
  name?: string;
  role?: string;
}

const parseSender = (msg: string) => {
  const match = msg.match(/^\[([\s\S]*?)\]\n\n([\s\S]*)/);
  if (match) {
    return { sender: match[1], body: match[2] };
  }
  return { sender: null, body: msg };
};

export const TopNavBar: React.FC<TopNavBarProps> = ({
  onToggleSidebar,
  brandHref = '/courses',
  searchBasePath,
}) => {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentQuery = searchParams.get('q') ?? '';
  const [topNavUser, setTopNavUser] = useState<StoredUser | null>(null);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [showNotifForm, setShowNotifForm] = useState(false);
  const [notifForm, setNotifForm] = useState({ title: '', message: '' });
  const [selectedNotif, setSelectedNotif] = useState<any>(null);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    try {
      const stored = sessionStorage.getItem('user');
      if (stored) setTopNavUser(JSON.parse(stored));
    } catch { /* ignore */ }
  }, []);

  const loadNotifications = useCallback(async () => {
    try {
      const token = sessionStorage.getItem('token');
      if (!token) return;
      const res = await fetch(buildApiUrl('/notifications'), {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setNotifications(data);
        setUnreadCount(data.filter((n: any) => !n.isRead).length);
      }
    } catch { /* ignore */ }
  }, []);

  useEffect(() => {
    if (topNavUser) loadNotifications();
  }, [topNavUser, loadNotifications]);

  const handleCreateNotif = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = sessionStorage.getItem('token');
      await fetch(buildApiUrl('/notifications/global'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(notifForm)
      });
      setShowNotifForm(false);
      setNotifForm({ title: '', message: '' });
      loadNotifications();
    } catch { /* ignore */ }
  };

  const handleNotifClick = async (n: any) => {
    setSelectedNotif(n);
    if (!n.isRead) {
      try {
        const token = sessionStorage.getItem('token');
        await fetch(buildApiUrl(`/notifications/${n.id}/read`), {
          method: 'PATCH',
          headers: { Authorization: `Bearer ${token}` }
        });
        loadNotifications();
      } catch { /* ignore */ }
    }
  };

  const getAvatarInitials = (name?: string) => {
    if (!name) return 'U';
    return name.split(' ').map((w) => w[0]).join('').substring(0, 2).toUpperCase();
  };

  const handleAvatarClick = () => {
    const role = topNavUser?.role?.toUpperCase();
    if (role === 'STUDENT') {
      router.push('/dashboard_mahasiswa/profile');
    }
  };

  const applySearch = (value: string) => {
    const basePath = searchBasePath ?? (pathname.startsWith('/courses/my') ? '/courses/my' : COURSE_CATALOG_HREF);
    router.replace(buildSearchPath(basePath, searchParams, value));
  };

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 bg-white border-b"
      style={{ borderColor: 'var(--color-border)', height: '73px' }}
    >
      <div className="flex items-center justify-between h-full w-full"
        style={{ paddingLeft: '16px', paddingRight: '24px' }}>

        {/* Left: Hamburger + Brand */}
        <div className="flex items-center gap-3">
          <button
            className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-gray-100 transition-colors"
            aria-label="Toggle sidebar"
            onClick={onToggleSidebar}
          >
            <HamburgerIcon />
          </button>
          <BrandLogo href={brandHref} hideTextOnMobile />
        </div>

        {/* Center: Search */}
        <div className="hidden flex-1 justify-center px-6 sm:flex">
          <div
            className="flex h-11 w-full max-w-[420px] items-center rounded-2xl border px-5 transition-all focus-within:border-[#2563EB] focus-within:bg-white focus-within:shadow-[0_0_0_3px_rgba(37,99,235,0.12)]"
            style={{ background: '#F1F5F9', borderColor: 'var(--color-border)' }}
          >
            <input
              type="text"
              placeholder="Cari sesuatu..."
              value={currentQuery}
              onChange={(event) => applySearch(event.target.value)}
              className="h-full min-w-0 flex-1 bg-transparent text-center text-sm outline-none placeholder:text-slate-400"
              style={{ color: 'var(--color-text-primary)' }}
            />
          </div>
        </div>

        {/* Right: Search icon mobile + Theme + Notif + Avatar */}
        <div className="flex items-center gap-2">
          <button className="flex sm:hidden items-center justify-center w-10 h-10 rounded-full hover:bg-gray-100" aria-label="Search">
            <SearchIcon />
          </button>

          <button className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-gray-100 transition-colors" aria-label="Toggle dark or light mode" title="Dark / Light Mode" type="button">
            <ThemeModeIcon />
          </button>

          {/* Notification Bell + Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsNotifOpen(!isNotifOpen)}
              className="relative flex items-center justify-center w-10 h-10 rounded-full hover:bg-gray-100 transition-colors"
              aria-label="Notifications"
            >
              <BellIcon />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full border-2 border-white flex items-center justify-center text-[8px] font-bold text-white"
                  style={{ background: 'var(--color-danger, #EF4444)' }}>{unreadCount}</span>
              )}
            </button>

            {isNotifOpen && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-50">
                <div className="flex items-center justify-between px-4 py-3 border-b border-gray-50 bg-gray-50/50">
                  <h3 className="font-bold text-sm text-gray-800">Notifikasi</h3>
                  <div className="flex items-center gap-2">
                    {(topNavUser?.role?.toUpperCase() === 'ADMIN' || topNavUser?.role?.toUpperCase() === 'LECTURER') && (
                      <button onClick={() => setShowNotifForm(!showNotifForm)} className="text-xs px-2 py-1 bg-blue-100 text-blue-600 rounded-md hover:bg-blue-200 transition font-medium">
                        {showNotifForm ? 'Batal' : '+ Buat'}
                      </button>
                    )}
                    <button onClick={() => setIsNotifOpen(false)} className="text-gray-400 hover:text-gray-600">
                      <XIcon />
                    </button>
                  </div>
                </div>
                {showNotifForm ? (
                  <form onSubmit={handleCreateNotif} className="p-4 flex flex-col gap-3">
                    <input required type="text" placeholder="Judul Pengumuman" value={notifForm.title} onChange={e => setNotifForm({...notifForm, title: e.target.value})}
                      className="px-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:border-blue-400" />
                    <textarea required placeholder="Isi Pengumuman..." value={notifForm.message} onChange={e => setNotifForm({...notifForm, message: e.target.value})}
                      className="px-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:border-blue-400 resize-none h-16" />
                    <div className="flex gap-2 justify-end">
                      <button type="button" onClick={() => setShowNotifForm(false)} className="px-3 py-1.5 text-xs bg-gray-100 rounded-md hover:bg-gray-200 transition">Batal</button>
                      <button type="submit" className="px-3 py-1.5 text-xs bg-blue-600 text-white rounded-md hover:bg-blue-700 transition font-medium">Kirim</button>
                    </div>
                  </form>
                ) : (
                  <div className="max-h-72 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="p-6 text-center text-gray-400 text-xs font-medium">Tidak ada notifikasi</div>
                    ) : (
                      notifications.map((n: any) => {
                        const { sender, body } = parseSender(n.message);
                        return (
                          <div key={n.id} onClick={() => handleNotifClick(n)} className={`p-4 border-b border-gray-50 hover:bg-gray-50 transition-colors cursor-pointer ${!n.isRead ? 'bg-blue-50/30' : ''}`}>
                            <div className="flex justify-between items-start mb-1">
                              <h4 className={`text-sm ${!n.isRead ? 'font-semibold text-gray-900' : 'font-medium text-gray-700'}`}>{n.title}</h4>
                              <span className="text-[10px] text-gray-400 whitespace-nowrap ml-2">{new Date(n.createdAt).toLocaleDateString('id-ID')}</span>
                            </div>
                            {sender && (
                              <span className="inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full mb-1.5" style={{
                                background: sender.startsWith('Admin') ? '#EDE9FE' : '#DBEAFE',
                                color: sender.startsWith('Admin') ? '#7C3AED' : '#2563EB',
                              }}>
                                {sender}
                              </span>
                            )}
                            <p className="text-xs text-gray-500 leading-relaxed" style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{body}</p>
                          </div>
                        );
                      })
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          <button
            className="flex items-center justify-center w-10 h-10 rounded-full border overflow-hidden transition-all hover:scale-105 hover:shadow-md"
            style={{
              borderColor: 'var(--color-border)',
              background: 'linear-gradient(135deg, #2563EB, #7C3AED)',
              color: 'white',
              fontSize: '13px',
              fontWeight: 700,
              cursor: topNavUser?.role?.toUpperCase() === 'STUDENT' ? 'pointer' : 'default',
            }}
            aria-label="User profile"
            onClick={handleAvatarClick}
            title={topNavUser?.role?.toUpperCase() === 'STUDENT' ? 'Lihat Profil' : topNavUser?.name ?? 'User'}
          >
            {topNavUser?.name ? getAvatarInitials(topNavUser.name) : <UserAvatarIcon />}
          </button>
        </div>

      </div>

      {/* Notification Detail Modal */}
      {selectedNotif && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4" onClick={() => setSelectedNotif(null)}>
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center p-5 border-b border-gray-100 bg-gray-50/50">
              <h3 className="font-bold text-gray-800 flex items-center gap-2">
                <BellIcon />
                Detail Notifikasi
              </h3>
              <button onClick={() => setSelectedNotif(null)} className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 transition-colors">
                <XIcon />
              </button>
            </div>
            <div className="p-6">
              <h4 className="text-lg font-bold text-gray-900 mb-2">{selectedNotif.title}</h4>
              <p className="text-xs text-gray-400 mb-6 flex items-center gap-1.5">
                <ClockIcon />
                {new Date(selectedNotif.createdAt).toLocaleString('id-ID', { dateStyle: 'long', timeStyle: 'short' })}
              </p>
              <div className="text-sm text-gray-700 leading-relaxed bg-gray-50 p-4 rounded-xl border border-gray-100">
                {(() => {
                  const { sender, body } = parseSender(selectedNotif.message);
                  return (
                    <>
                      {sender && (
                        <div className="mb-3">
                          <span className="inline-block text-xs font-semibold px-2.5 py-1 rounded-full" style={{
                            background: sender.startsWith('Admin') ? '#EDE9FE' : '#DBEAFE',
                            color: sender.startsWith('Admin') ? '#7C3AED' : '#2563EB',
                          }}>
                            {sender}
                          </span>
                        </div>
                      )}
                      <div className="whitespace-pre-line">{body}</div>
                    </>
                  );
                })()}
              </div>
            </div>
            <div className="p-4 border-t border-gray-100 bg-gray-50/50 flex justify-end">
              <button onClick={() => setSelectedNotif(null)} className="px-5 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-sm">
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

function buildSearchPath(basePath: string, currentSearchParams: URLSearchParams, value: string) {
  const [pathname, baseQueryString = ''] = basePath.split('?');
  const params = new URLSearchParams(baseQueryString);
  const trimmedValue = value.trim();

  currentSearchParams.forEach((paramValue, key) => {
    if (!params.has(key)) {
      params.set(key, paramValue);
    }
  });

  if (trimmedValue) {
    params.set('q', trimmedValue);
  } else {
    params.delete('q');
  }

  const queryString = params.toString();
  return queryString ? `${pathname}?${queryString}` : pathname;
}

/* Icon sub-components kept inline because they are only used by this top bar. */

const HamburgerIcon: React.FC = () => (
  <svg width="18" height="12" viewBox="0 0 18 12" fill="none">
    <rect width="18" height="2" rx="1" fill="#434654" />
    <rect y="5" width="18" height="2" rx="1" fill="#434654" />
    <rect y="10" width="18" height="2" rx="1" fill="#434654" />
  </svg>
);

const SearchIcon: React.FC<{ className?: string }> = ({ className = '' }) => (
  <svg className={className} width="18" height="18" viewBox="0 0 18 18" fill="none">
    <circle cx="8" cy="8" r="6" stroke="#737685" strokeWidth="1.8" />
    <path d="m13 13 3 3" stroke="#737685" strokeWidth="1.8" strokeLinecap="round" />
  </svg>
);

const ThemeModeIcon: React.FC = () => (
  <svg width="19" height="19" viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="12" r="4" stroke="#434654" strokeWidth="1.8" />
    <path
      d="M12 2v2M12 20v2M4 12H2M22 12h-2M5.64 5.64 4.22 4.22M19.78 19.78l-1.42-1.42M18.36 5.64l1.42-1.42M4.22 19.78l1.42-1.42"
      stroke="#434654"
      strokeWidth="1.8"
      strokeLinecap="round"
    />
  </svg>
);

const BellIcon: React.FC = () => (
  <svg width="21" height="21" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path
      d="M18 9.7V12c0 1.9.62 3.18 1.38 4.05A1.18 1.18 0 0 1 18.5 18H5.5a1.18 1.18 0 0 1-.88-1.95C5.38 15.18 6 13.9 6 12V9.7C6 6.6 8.6 4 12 4s6 2.6 6 5.7Z"
      stroke="#334155"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M9.75 20a2.5 2.5 0 0 0 4.5 0"
      stroke="#334155"
      strokeWidth="1.9"
      strokeLinecap="round"
    />
    <path
      d="M12 2.75V4"
      stroke="#334155"
      strokeWidth="1.9"
      strokeLinecap="round"
    />
  </svg>
);

const UserAvatarIcon: React.FC = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
    <circle cx="10" cy="7" r="3" fill="#003594" />
    <path d="M3 17c0-3.87 3.13-7 7-7s7 3.13 7 7" stroke="#003594" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

const XIcon: React.FC = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const ClockIcon: React.FC = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);

