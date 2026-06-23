'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAppStore } from '../store';
import { 
  Bell, 
  Menu, 
  X, 
  BookOpen,
  Award,
  CheckCircle2,
  Info
} from 'lucide-react';

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { student, toast } = useAppStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();

  const sideNavItems = [
    { id: 'labs', href: '/labs', label: 'Practical Labs', icon: <BookOpen size={18} /> },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans antialiased selection:bg-blue-600 selection:text-white">
      
      {/* Dynamic Success/Info Alerts Toast */}
      {toast && (
        <div className="fixed top-6 right-6 z-50 animate-slide-in-right max-w-sm bg-white border border-blue-100 p-4 rounded-2xl shadow-xl shadow-slate-100 flex items-start gap-3.5">
          <div className={`p-2 rounded-full shrink-0 ${toast.type === 'success' ? 'bg-green-100 text-green-650' : toast.type === 'error' ? 'bg-red-100 text-red-650' : 'bg-blue-100 text-blue-650'}`}>
            {toast.type === 'success' ? <CheckCircle2 size={18} /> : <Info size={18} />}
          </div>
          <div>
            <p className="font-extrabold text-xs text-slate-900 uppercase tracking-widest leading-none">Notifikasi Portal</p>
            <p className="text-slate-650 text-xs mt-1 leading-relaxed font-semibold">{toast.message}</p>
          </div>
        </div>
      )}

      {/* MOBILE HEADER BAR */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b border-slate-100 flex items-center justify-between px-6 z-30">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-xl flex items-center justify-center text-white text-sm font-bold">R</div>
          <span className="font-serif font-extrabold text-sm tracking-wide text-blue-800">RUANG DOSEN</span>
        </div>
        <button 
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 text-slate-600 hover:text-blue-700 hover:bg-slate-50 rounded-xl transition"
          id="btn-toggle-sidebar"
        >
          {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* BACKDROP FOR MOBILE SIDEBAR */}
      {sidebarOpen && (
        <div 
          onClick={() => setSidebarOpen(false)}
          className="md:hidden fixed inset-0 bg-slate-900/30 backdrop-blur-xs z-35"
        />
      )}

      {/* SIDEBAR NAVIGATION PANEL */}
      <aside className={`
        fixed md:sticky top-0 bottom-0 left-0 z-40 w-72 bg-white border-r border-slate-100 px-6 py-8 flex flex-col justify-between transition-transform duration-300 transform shrink-0 h-screen
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <div className="space-y-8">
          {/* Logo Brand Header */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 text-white rounded-2xl flex items-center justify-center font-black text-lg shadow-md shadow-blue-200">
              R
            </div>
            <div>
              <h1 className="font-serif font-black text-lg tracking-wider text-blue-900 leading-none">RUANG DOSEN</h1>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-1">Online Lab Portal</p>
            </div>
          </div>

          {/* Student Profile Identity Card */}
          <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 flex gap-3.5 items-center">
            <div className="w-11 h-11 bg-linear-to-br from-blue-600 to-indigo-700 text-white font-extrabold rounded-xl flex items-center justify-center text-base shadow-sm">
              {student.avatarLetter}
            </div>
            <div className="overflow-hidden">
              <h3 className="font-extrabold text-sm text-slate-800 truncate leading-tight">{student.name}</h3>
              <p className="text-[10px] text-slate-400 mt-1 font-semibold leading-none">NIM {student.nim}</p>
              <p className="text-[10px] text-blue-600 mt-1 font-bold">{student.department}</p>
            </div>
          </div>

          {/* Menu Items */}
          <nav className="space-y-1.5" id="sidebar-nav">
            <p className="text-[10px] font-bold text-slate-400 tracking-widest uppercase mb-3 px-3">Beranda Mahasiswa</p>
            {sideNavItems.map((item) => {
              const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.id}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-xs font-bold rounded-xl transition ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-100/60' 
                      : 'text-slate-650 hover:bg-slate-50 hover:text-blue-700'
                  }`}
                  id={`nav-${item.id}`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </Link>
              );
            })}

            <p className="text-[10px] font-bold text-slate-400 tracking-widest uppercase mt-6 mb-3 px-3">Akses Khusus Dosen</p>
            <Link
              href="/lecturer"
              onClick={() => setSidebarOpen(false)}
              className={`w-full flex items-center gap-3 px-4 py-3 text-xs font-bold rounded-xl transition ${
                pathname.startsWith('/lecturer')
                  ? 'bg-linear-to-r from-blue-700 via-indigo-700 to-purple-800 text-white shadow-lg shadow-indigo-100/60'
                  : 'text-indigo-750 bg-indigo-50 hover:bg-indigo-100/40 border border-indigo-200/50'
              }`}
              id="nav-dosen-view"
            >
              <Award size={18} className={pathname.startsWith('/lecturer') ? 'text-white' : 'text-indigo-650'} />
              <span>Ruang Kerja Dosen</span>
            </Link>
          </nav>
        </div>

        {/* Sidebar Footer Branding */}
        <div className="border-t border-slate-100/70 pt-4 text-center">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Ruang Dosen v4.2</p>
          <p className="text-[9px] text-slate-350 mt-1 font-medium">Universitas Teknik Komputer Indonesia</p>
        </div>
      </aside>

      {/* MAIN LAYOUT WRAPPER */}
      <div className="flex-1 flex flex-col min-w-0 pt-16 md:pt-0">
        
        {/* TOP STATUS HEADER BAR */}
        <header className="hidden md:flex bg-white h-20 border-b border-slate-100 px-8 items-center justify-between sticky top-0 z-10">
          <div className="text-xs text-slate-400 font-medium">
            Labs <span className="mx-1.5">/</span> <span className="text-slate-700 font-bold"></span>
          </div>
          <div className="flex items-center gap-4">
            <button className="p-2 text-slate-400 hover:text-blue-600 transition relative">
              <span className="absolute w-2 h-2 bg-red-500 rounded-full top-1 right-1" />
              <Bell size={18} />
            </button>
            <div className="h-6 w-px bg-slate-100" />
            <div className="flex items-center gap-2.5">
              <span className="text-xs font-bold text-slate-700">Semester {student.semester}</span>
              <span className="px-2 py-0.5 bg-blue-50 text-blue-700 text-[10px] font-extrabold uppercase rounded-md">Reguler</span>
            </div>
          </div>
        </header>
        
        {/* MAIN BODY WORKSPACE CONTENT */}
        <main className="flex-1 p-6 md:p-8 max-w-7xl w-full mx-auto overflow-y-auto">
          {children}
        </main>
      </div>

    </div>
  );
}
