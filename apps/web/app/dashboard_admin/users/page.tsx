'use client';

import Link from 'next/link';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { buildApiUrl } from '@/lib/api/apiConfig';
import { AdminSidebar } from '@/components/layout/AdminSidebar';
import '../dashboard.css';

interface UserItem {
  id: string;
  name: string;
  email: string;
  role: 'ADMIN' | 'LECTURER' | 'STUDENT';
  xp: number;
  createdAt: string;
}

type RoleFilter = '' | 'ADMIN' | 'LECTURER' | 'STUDENT';

export default function AdminManageUsersPage() {
  const [users, setUsers] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [roleFilter, setRoleFilter] = useState<RoleFilter>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [editingUser, setEditingUser] = useState<UserItem | null>(null);
  const [newRole, setNewRole] = useState('');
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [deletingUser, setDeletingUser] = useState<UserItem | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const router = useRouter();

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  };

  const fetchUsers = useCallback(async () => {
    const token = sessionStorage.getItem('token');
    if (!token) { router.push('/login'); return; }

    try {
      const query = roleFilter ? `?role=${roleFilter}` : '';
      const res = await fetch(buildApiUrl(`/admin/users${query}`), {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setUsers(data);
      }
    } catch (err) {
      console.error('Failed to fetch users', err);
    } finally {
      setLoading(false);
    }
  }, [roleFilter, router]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleUpdateUser = async () => {
    if (!editingUser) return;
    if (!newName.trim() || !newEmail.trim()) {
      showToast('error', 'Nama dan Email tidak boleh kosong');
      return;
    }
    setActionLoading(true);
    const token = sessionStorage.getItem('token');
    try {
      const res = await fetch(buildApiUrl(`/admin/users/${editingUser.id}`), {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newName.trim(),
          email: newEmail.trim(),
          role: newRole,
          ...(newPassword ? { password: newPassword } : {}),
        }),
      });
      if (res.ok) {
        showToast('success', `Data ${newName} berhasil diperbarui`);
        setEditingUser(null);
        fetchUsers();
      } else {
        const data = await res.json();
        showToast('error', data.message || 'Gagal memperbarui data pengguna');
      }
    } catch {
      showToast('error', 'Terjadi kesalahan jaringan');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!deletingUser) return;
    setActionLoading(true);
    const token = sessionStorage.getItem('token');
    try {
      const res = await fetch(buildApiUrl(`/admin/users/${deletingUser.id}`), {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        showToast('success', `User ${deletingUser.name} berhasil dihapus`);
        setDeletingUser(null);
        fetchUsers();
      } else {
        showToast('error', 'Gagal menghapus user');
      }
    } catch {
      showToast('error', 'Terjadi kesalahan jaringan');
    } finally {
      setActionLoading(false);
    }
  };

  const roleLabels: Record<string, string> = { ADMIN: 'Admin', LECTURER: 'Dosen', STUDENT: 'Mahasiswa' };
  const roleBadgeColors: Record<string, string> = { ADMIN: '#7C3AED', LECTURER: '#2563EB', STUDENT: '#16A34A' };

  const filteredUsers = users.filter(u =>
    u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="admin-dashboard app-wrapper">
      <AdminSidebar activeTab="users" />
      <main className="main-content">
        <header className="top-bar">
          <div>
            <p className="page-title">Kelola Pengguna</p>
            <p className="page-subtitle">Atur semua akun pengguna dalam sistem</p>
          </div>
          <div className="top-bar-right">
            <Link href="/dashboard_admin/users/create" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '8px 16px', borderRadius: '12px', background: 'var(--primary)', color: 'white', fontSize: '14px', fontWeight: 600 }}>
              + Tambah Pengguna
            </Link>
          </div>
        </header>

        <div className="dashboard-content">
          {/* Filters */}
          <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap', alignItems: 'center' }}>
            <input type="text" placeholder="Cari nama atau email..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
              style={{ padding: '10px 16px', borderRadius: '12px', border: '1px solid var(--border)', fontSize: '14px', minWidth: '250px' }} />
            {(['', 'ADMIN', 'LECTURER', 'STUDENT'] as RoleFilter[]).map(r => (
              <button key={r} onClick={() => setRoleFilter(r)}
                style={{ padding: '8px 16px', borderRadius: '20px', border: roleFilter === r ? '2px solid var(--primary)' : '1px solid var(--border)', background: roleFilter === r ? 'var(--primary-light, #EFF6FF)' : 'white', color: roleFilter === r ? 'var(--primary)' : 'var(--text-secondary)', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>
                {r === '' ? 'Semua' : roleLabels[r]}
              </button>
            ))}
          </div>

          {/* Table */}
          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>Memuat data pengguna...</div>
          ) : (
            <div style={{ background: 'var(--card-bg)', borderRadius: 'var(--radius-xl, 16px)', border: '1px solid var(--border)', overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#f8fafc' }}>
                    <th style={{ padding: '14px 20px', textAlign: 'left', fontSize: '12px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Nama</th>
                    <th style={{ padding: '14px 20px', textAlign: 'left', fontSize: '12px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Email</th>
                    <th style={{ padding: '14px 20px', textAlign: 'left', fontSize: '12px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Role</th>
                    <th style={{ padding: '14px 20px', textAlign: 'left', fontSize: '12px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Terdaftar</th>
                    <th style={{ padding: '14px 20px', textAlign: 'center', fontSize: '12px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map(u => (
                    <tr key={u.id} style={{ borderTop: '1px solid var(--border)' }}>
                      <td style={{ padding: '14px 20px', fontSize: '14px', fontWeight: 600 }}>{u.name}</td>
                      <td style={{ padding: '14px 20px', fontSize: '14px', color: '#64748b' }}>{u.email}</td>
                      <td style={{ padding: '14px 20px' }}>
                        <span style={{ padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 600, color: 'white', background: roleBadgeColors[u.role] || '#999' }}>
                          {roleLabels[u.role] || u.role}
                        </span>
                      </td>
                      <td style={{ padding: '14px 20px', fontSize: '13px', color: '#64748b' }}>{new Date(u.createdAt).toLocaleDateString('id-ID')}</td>
                      <td style={{ padding: '14px 20px', textAlign: 'center' }}>
                        <button onClick={() => {
                          setEditingUser(u);
                          setNewName(u.name);
                          setNewEmail(u.email);
                          setNewRole(u.role);
                          setNewPassword('');
                        }} style={{ padding: '6px 12px', borderRadius: '8px', border: '1px solid var(--border)', background: 'white', cursor: 'pointer', fontSize: '12px', marginRight: '6px' }}>Edit</button>
                        <button onClick={() => setDeletingUser(u)} style={{ padding: '6px 12px', borderRadius: '8px', border: '1px solid #FCA5A5', background: '#FEF2F2', color: '#DC2626', cursor: 'pointer', fontSize: '12px' }}>Hapus</button>
                      </td>
                    </tr>
                  ))}
                  {filteredUsers.length === 0 && (
                    <tr><td colSpan={5} style={{ textAlign: 'center', padding: '40px', color: '#999' }}>Tidak ada pengguna ditemukan</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {/* Edit User Modal */}
      {editingUser && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.4)' }} onClick={() => setEditingUser(null)}>
          <div style={{ background: 'white', borderRadius: '16px', padding: '24px', maxWidth: '400px', width: '100%', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }} onClick={e => e.stopPropagation()}>
            <h3 style={{ margin: '0 0 16px', fontWeight: 700 }}>Edit Pengguna</h3>
            
            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>Nama Lengkap</label>
              <input type="text" value={newName} onChange={e => setNewName(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ddd' }} />
            </div>

            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>Email / NIM</label>
              <input type="email" value={newEmail} onChange={e => setNewEmail(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ddd' }} />
            </div>

            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>Role</label>
              <select value={newRole} onChange={e => setNewRole(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ddd' }}>
                <option value="STUDENT">Mahasiswa</option>
                <option value="LECTURER">Dosen</option>
                <option value="ADMIN">Administrator</option>
              </select>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>Password Baru (Opsional)</label>
              <input type="password" placeholder="Kosongkan jika tidak ingin ganti" value={newPassword} onChange={e => setNewPassword(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ddd' }} />
            </div>

            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
              <button onClick={() => setEditingUser(null)} style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #ddd', background: 'white', cursor: 'pointer' }}>Batal</button>
              <button onClick={handleUpdateUser} disabled={actionLoading} style={{ padding: '8px 16px', borderRadius: '8px', border: 'none', background: '#2563EB', color: 'white', cursor: 'pointer', fontWeight: 600 }}>{actionLoading ? 'Menyimpan...' : 'Simpan'}</button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {deletingUser && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.4)' }} onClick={() => setDeletingUser(null)}>
          <div style={{ background: 'white', borderRadius: '16px', padding: '24px', maxWidth: '400px', width: '100%' }} onClick={e => e.stopPropagation()}>
            <h3 style={{ margin: '0 0 8px', fontWeight: 700, color: '#DC2626' }}>Hapus Pengguna</h3>
            <p style={{ color: '#666', marginBottom: '16px' }}>Yakin ingin menghapus <strong>{deletingUser.name}</strong>? Tindakan ini tidak bisa dibatalkan.</p>
            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
              <button onClick={() => setDeletingUser(null)} style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #ddd', background: 'white', cursor: 'pointer' }}>Batal</button>
              <button onClick={handleDeleteUser} disabled={actionLoading} style={{ padding: '8px 16px', borderRadius: '8px', border: 'none', background: '#DC2626', color: 'white', cursor: 'pointer', fontWeight: 600 }}>{actionLoading ? 'Menghapus...' : 'Hapus'}</button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div style={{ position: 'fixed', bottom: '24px', right: '24px', zIndex: 9999, padding: '12px 20px', borderRadius: '12px', background: toast.type === 'success' ? '#16A34A' : '#DC2626', color: 'white', fontWeight: 600, fontSize: '14px', boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}>
          {toast.message}
        </div>
      )}
    </div>
  );
}

