"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { buildApiUrl } from "@/lib/api/apiConfig";

export function StudentTopBar({ title }: { title: string }) {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [selectedNotif, setSelectedNotif] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchUserAndNotifs = async () => {
      const token = sessionStorage.getItem("token");
      if (!token) return;

      try {
        const storedUser = JSON.parse(sessionStorage.getItem("user") || "null");
        if (storedUser) setUser(storedUser);

        const [profileRes, notifRes] = await Promise.all([
          fetch(buildApiUrl("/auth/profile"), { headers: { Authorization: `Bearer ${token}` } }),
          fetch(buildApiUrl("/notifications"), { headers: { Authorization: `Bearer ${token}` } }),
        ]);

        if (profileRes.ok) {
          const profileData = await profileRes.json();
          setUser(profileData);
        }
        if (notifRes.ok) {
          setNotifications(await notifRes.json());
        }
      } catch (err) {
        console.error("Failed to fetch top bar data", err);
      }
    };
    fetchUserAndNotifs();
  }, []);

  const handleNotifClick = async (n: any) => {
    setSelectedNotif(n);
    if (!n.isRead) {
      try {
        const token = sessionStorage.getItem("token");
        await fetch(buildApiUrl(`/notifications/${n.id}/read`), {
          method: "PATCH",
          headers: { Authorization: `Bearer ${token}` },
        });
        const notifRes = await fetch(buildApiUrl("/notifications"), { headers: { Authorization: `Bearer ${token}` } });
        if (notifRes.ok) setNotifications(await notifRes.json());
      } catch (err) { console.error(err); }
    }
  };

  const getInitials = (name: string) => {
    if (!name) return "M";
    return name.split(" ").map((n) => n[0]).join("").substring(0, 2).toUpperCase();
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <>
      <header className="top-bar">
        <div>
          <p className="page-title">{title}</p>
          <p className="page-subtitle">
            {new Date().toLocaleDateString("id-ID", {
              weekday: "long", year: "numeric", month: "long", day: "numeric",
            })}
          </p>
        </div>

        <div className="top-bar-right" style={{ position: 'relative' }}>
          {/* Search */}
          <div className="search-bar">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="search"
              placeholder="Cari kursus, materi..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Notif Button */}
          <button className="icon-btn" title="Notifikasi" onClick={() => setNotifOpen(!notifOpen)}>
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 01-3.46 0" />
            </svg>
            {unreadCount > 0 && (
              <span className="notif-dot"></span>
            )}
          </button>

          {/* Notification Dropdown */}
          {notifOpen && (
            <div style={{
              position: 'absolute', top: '48px', right: '44px',
              width: '320px', background: 'white',
              border: '1px solid #d6e8ea', borderRadius: '14px',
              boxShadow: '0 12px 28px rgba(79,151,163,0.12)', zIndex: 100, overflow: 'hidden'
            }}>
              <div style={{ padding: '14px 16px', borderBottom: '1px solid #d6e8ea', fontWeight: 600, fontSize: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#1a3a3f' }}>
                <span>Notifikasi</span>
              </div>
              <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                {notifications.length > 0 ? (
                  notifications.map((n: any) => (
                    <div key={n.id} onClick={() => handleNotifClick(n)}
                      style={{ padding: '12px 16px', borderBottom: '1px solid #d6e8ea', fontSize: '13px', background: n.isRead ? 'transparent' : '#eef7f8', cursor: 'pointer', transition: 'background 0.15s' }}>
                      <span style={{ display: 'block', color: '#7aacb3', marginBottom: '3px', fontSize: '10px' }}>
                        {new Date(n.createdAt).toLocaleDateString('id-ID')}
                      </span>
                      <strong style={{ display: 'block', marginBottom: '3px', color: '#1a3a3f' }}>{n.title}</strong>
                      <div style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: '#4d7a82' }}>{n.message}</div>
                    </div>
                  ))
                ) : (
                  <div style={{ padding: '24px', textAlign: 'center', color: '#7aacb3', fontSize: '13px' }}>Belum ada notifikasi</div>
                )}
              </div>
            </div>
          )}

          {/* Settings */}
          <button className="icon-btn" title="Pengaturan" onClick={() => alert("Pengaturan akun sedang dikembangkan!")}>
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="3" />
              <path d="M19.07 4.93l-1.41 1.41M4.93 4.93l1.41 1.41M19.07 19.07l-1.41-1.41M4.93 19.07l1.41-1.41M21 12h-2M5 12H3M12 3V1M12 23v-2" />
            </svg>
          </button>

          {/* Avatar */}
          <button className="avatar-btn" title="Profil" onClick={() => router.push("/dashboard_mahasiswa/profile")}>
            {getInitials(user?.name || "")}
          </button>
        </div>
      </header>

      {/* NOTIFICATION DETAIL MODAL */}
      {selectedNotif && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.35)', padding: '20px' }} onClick={() => setSelectedNotif(null)}>
          <div style={{ background: 'white', borderRadius: '18px', maxWidth: '480px', width: '100%', overflow: 'hidden', boxShadow: '0 20px 40px rgba(79,151,163,0.15)' }} onClick={e => e.stopPropagation()}>
            <div style={{ padding: '18px 20px', borderBottom: '1px solid #d6e8ea', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, fontWeight: 700, fontSize: '15px', color: '#1a3a3f' }}>Detail Notifikasi</h3>
              <button onClick={() => setSelectedNotif(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#7aacb3', fontSize: '18px', lineHeight: 1 }}>✕</button>
            </div>
            <div style={{ padding: '22px 20px' }}>
              <h4 style={{ margin: '0 0 6px 0', fontSize: '17px', fontWeight: 700, color: '#1a3a3f' }}>{selectedNotif.title}</h4>
              <p style={{ margin: '0 0 20px 0', fontSize: '11px', color: '#7aacb3' }}>{new Date(selectedNotif.createdAt).toLocaleString('id-ID')}</p>
              <div style={{ fontSize: '13.5px', lineHeight: 1.7, color: '#4d7a82', background: '#eef7f8', padding: '16px', borderRadius: '12px', border: '1px solid #d6e8ea', whiteSpace: 'pre-line' }}>
                {selectedNotif.message}
              </div>
            </div>
            <div style={{ padding: '14px 20px', borderTop: '1px solid #d6e8ea', display: 'flex', justifyContent: 'flex-end' }}>
              <button onClick={() => setSelectedNotif(null)} style={{ padding: '9px 24px', background: '#4F97A3', color: 'white', border: 'none', borderRadius: '10px', fontWeight: 600, cursor: 'pointer', fontSize: '13px', fontFamily: 'inherit' }}>
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
