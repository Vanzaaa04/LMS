'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';

export function TopNavBar() {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);


  const isLecturer = pathname.startsWith('/lecturer');
  const isDashboard = pathname.startsWith('/labs') || pathname === '/';

  return (
    <header className="flex justify-between items-center h-16 px-6 w-full sticky top-0 z-50 bg-white border-b border-slate-200 shadow-sm font-display-lg antialiased tracking-tight">
      <div className="flex items-center gap-8">
        <span className="text-xl font-bold text-blue-700">Practical Labs</span>
        <nav className="hidden md:flex items-center gap-6 h-16">
          <Link 
            className={`${isDashboard ? 'text-blue-700 font-semibold border-b-2 border-blue-700' : 'text-slate-600 hover:text-blue-600 transition-colors'} h-full flex items-center px-1`} 
            href="/labs"
          >
            Dashboard
          </Link>
          <Link 
            className={`${isLecturer ? 'text-blue-700 font-semibold border-b-2 border-blue-700' : 'text-slate-600 hover:text-blue-600 transition-colors'} h-full flex items-center px-1`} 
            href="/lecturer"
          >
            Lecturer
          </Link>

        </nav>
      </div>
      <div className="flex items-center gap-4 relative" ref={dropdownRef}>
        <button 
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className="w-8 h-8 rounded-full overflow-hidden bg-slate-200 border border-slate-300 focus:outline-none focus:ring-2 focus:ring-primary transition-all cursor-pointer"
        >
          <Image
            alt="User profile"
            className="w-full h-full object-cover"
            width={32}
            height={32}
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuDQ2NGhGaXrn6CU7oCDEowWr_0zoOYv4pTZfY-4aDRH_FLqS0kvplzpZbM0_ZVIbgWhxjz11Pnw6t2DM0-Mx6wDlLwR4tABOGWZgzyvFB_HNkvIlOD96C1nGaPt6lNP8hPjT-dI8GjTPb6m9xRt4RgvVwJeWyi8C4WU1JZGcNbEIW43x8O9Gc8MEEX4Q25jWGhevKxmI77BJyOgkTr3OPvZfnNS2wgFfANhzDOlCIAOgZSdt946cKYziqFjPUCUlpz2UO9zZmzTeUM"
          />
        </button>

        {isDropdownOpen && (
          <div className="absolute top-12 right-0 w-48 bg-white rounded-lg shadow-lg border border-outline-variant py-2 z-60 flex flex-col font-body-base text-sm">
            <Link 
              href="/settings" 
              className="px-4 py-2 text-on-surface hover:bg-surface-container-low transition-colors flex items-center gap-2"
              onClick={() => setIsDropdownOpen(false)}
            >
              <span className="material-symbols-outlined text-[18px]">settings</span>
              Settings
            </Link>
            <div className="h-px bg-outline-variant my-1 w-full" />
            <button 
              onClick={() => {
                setIsDropdownOpen(false);
                // TODO: add logout logic
              }}
              className="px-4 py-2 text-error hover:bg-error-container transition-colors flex items-center gap-2 w-full text-left"
            >
              <span className="material-symbols-outlined text-[18px]">logout</span>
              Logout
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
