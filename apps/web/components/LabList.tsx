import React, { useState } from 'react';
import { Lab, Task, StudentProfile } from '../types';
import { Search, GraduationCap, ChevronRight, BookOpen, User, CheckCircle2 } from 'lucide-react';

interface LabListProps {
  labs: Lab[];
  tasks: Task[];
  student: StudentProfile;
  onSelectLab: (labId: string) => void;
  onNavigateToRegister: (labId: string) => void;
  mode?: 'student' | 'lecturer';
}

export const LabList: React.FC<LabListProps> = ({
  labs,

  student,
  onSelectLab,
  onNavigateToRegister,
  mode = 'student',
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Semua');
  const [selectedStatus, setSelectedStatus] = useState('Semua');

  // Categories extraction
  const categories = ['Semua', ...Array.from(new Set(labs.map((l) => l.category)))];

  // Search & Filter Logic
  const filteredLabs = labs.filter((lab) => {
    const matchesSearch =
      lab.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lab.dosen.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory = selectedCategory === 'Semua' || lab.category === selectedCategory;

    const matchesStatus =
      selectedStatus === 'Semua' ||
      (selectedStatus === 'Terdaftar' && lab.isRegistered) ||
      (selectedStatus === 'Belum Terdaftar' && !lab.isRegistered) ||
      (selectedStatus === 'Belum Submit' && lab.labStatus === 'Belum Submit') ||
      (selectedStatus === 'Sudah Submit' && lab.labStatus === 'Sudah Submit, menunggu penilaian') ||
      (selectedStatus === 'Sudah Dinilai' && lab.labStatus === 'Sudah Dinilai');

    return matchesSearch && matchesCategory && matchesStatus;
  });

  // Calculate some analytics for quick stats in student portal
  const registeredLabsCount = labs.filter((l) => l.isRegistered).length;

  // Split filtered labs into categories requested by user & semester setup
  const activeLabs = filteredLabs.filter((lab) => lab.semester === student.semester && lab.isRegistered);
  const availableLabs = filteredLabs.filter((lab) => lab.semester === student.semester && !lab.isRegistered);
  const pastLabs = filteredLabs.filter((lab) => lab.semester < student.semester && lab.isRegistered);



  const renderLabCard = (lab: Lab) => {
    // Calculate completion progress
    const total = lab.totalModules || 1;
    const completed = lab.completedModules || 0;
    const progressPercentage = Math.round((completed / total) * 100);

    return (
      <div
        key={lab.id}
        onClick={() => onSelectLab(lab.id)}
        className="bg-white rounded-3xl border border-slate-100 hover:border-blue-200 transition-all duration-300 shadow-sm hover:shadow-md hover:-translate-y-0.5 overflow-hidden flex flex-col h-[350px] group cursor-pointer"
      >
        {/* Card Visual Ribbon Accent */}
        <div className={`h-3 ${lab.thumbnailColor || 'bg-blue-600'}`} />

        <div className="p-6 flex flex-col justify-between flex-1">
          {/* Header: Code & Category */}
          <div>

            {/* Main Title */}
            <h4 className="font-extrabold text-base text-slate-900 group-hover:text-blue-700 transition line-clamp-2">
              {lab.title}
            </h4>

            {/* Dosen */}
            <div className="flex items-center gap-2 mt-2 text-xs text-slate-500 font-semibold">
              <User size={13} className="text-slate-400 shrink-0" />
              <span>Dosen: {lab.dosen}</span>
            </div>

            {/* Category Label */}
            <div className="flex flex-wrap gap-2 mt-4">
              <span className="px-2.5 py-1 bg-slate-50 border border-slate-150 text-[10px] font-bold uppercase tracking-wider text-slate-500 rounded-md">
                {lab.category}
              </span>
              <span className="px-2.5 py-1 bg-blue-50/50 text-blue-700 text-[10px] font-bold uppercase tracking-wider rounded-md">
                Semester {lab.semester}
              </span>
            </div>

            {/* Description Preview */}
            <p className="mt-4 text-[11px] text-slate-500 leading-relaxed line-clamp-3 font-medium">
              {lab.description}
            </p>
          </div>

          {/* Footer Progress & CTAs */}
          <div className="mt-6 border-t border-slate-50 pt-4">
            {lab.isRegistered ? (
              /* Progress Indicator for Registered Students */
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-[10px] font-bold">
                    <span className="text-slate-500 uppercase tracking-wider">Progress Lab</span>
                    <span className="text-blue-600">{progressPercentage}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-blue-600 rounded-full transition-all duration-500" 
                      style={{ width: `${progressPercentage}%` }}
                    />
                  </div>
                </div>
                <button
                  onClick={() => onSelectLab(lab.id)}
                  className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl transition flex items-center justify-center gap-1 group/btn"
                  id={`btn-open-lab-${lab.id}`}
                >
                  Buka Laboratorium <ChevronRight size={14} className="group-hover/btn:translate-x-0.5 transition" />
                </button>
              </div>
            ) : mode === 'lecturer' ? (
              <div className="flex gap-2 items-center mt-4">
                <button
                  onClick={(e) => { e.stopPropagation(); onSelectLab(lab.id); }}
                  className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl transition text-center shadow-lg shadow-blue-100/50"
                  id={`btn-manage-lab-${lab.id}`}
                >
                  Kelola Lab
                </button>
              </div>
            ) : (
              /* CTA for Unregistered Students */
              <div className="flex gap-2 items-center">
                <button
                  onClick={() => onSelectLab(lab.id)}
                  className="flex-1 py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition text-center"
                  id={`btn-view-preview-${lab.id}`}
                >
                  Lihat
                </button>
                <button
                  onClick={() => onNavigateToRegister(lab.id)}
                  className="flex-1 py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl transition text-center shadow-lg shadow-blue-100/50"
                  id={`btn-register-lab-${lab.id}`}
                >
                  Daftar Lab
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-8 animate-fade-in text-slate-800 animate-slide-up">
      {/* Overview Banner Card */}
      <div className="bg-linear-to-r from-blue-700 via-blue-800 to-indigo-900 rounded-3xl p-6 md:p-8 text-white shadow-xl shadow-blue-100 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="max-w-xl">
          <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight">
            Selamat Datang di Ruang {mode === 'lecturer' ? 'Dosen' : 'Praktikum'}!
          </h2>
          <p className="text-blue-100/90 text-sm mt-2 leading-relaxed font-medium">
            {mode === 'lecturer'
              ? 'Sistem Laboratorium Terpadu Dosen. Pantau penugasan praktikum, kelola berkas submissions, dan tinjau kelas yang Anda ampu.'
              : 'Sistem Laboratorium Terpadu Mahasiswa. Pantau penugasan praktikum, kelola berkas submissions, dan tinjau performatika akademik Anda secara langsung.'}
          </p>
        </div>

        {/* Quick Mini Stats */}
        <div className="flex shrink-0">
          <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl p-3 text-center min-w-[90px] md:min-w-[110px]">
            <span className="block text-xl md:text-2xl font-black">{registeredLabsCount}</span>
            <span className="text-[10px] uppercase font-bold tracking-wider text-blue-200">
              {mode === 'lecturer' ? 'Lab Diampu' : 'Lab Diikuti'}
            </span>
          </div>
          
        </div>
      </div>

      {/* SEARCH AND FILTERS TOOLBAR */}
      <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Cari kelas lab, kode, atau dosen pengampu..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full text-sm border border-slate-200/90 rounded-xl py-3 pl-10 pr-4 outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition"
              id="lab-search-input"
            />
          </div>
        </div>

        {/* Category Pill Filters */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
          <span className="text-slate-400 text-xs font-bold shrink-0 mr-1 uppercase tracking-wider">Kategori:</span>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`text-xs px-4 py-2 rounded-lg font-semibold transition shrink-0 ${
                selectedCategory === cat
                  ? 'bg-blue-600 text-white shadow-sm shadow-blue-100'
                  : 'bg-slate-50 border border-slate-200/60 text-slate-600 hover:bg-slate-100'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* LABS GRID SECTIONS */}
      <div className="space-y-12">
        {filteredLabs.length === 0 ? (
          <div className="bg-slate-50 rounded-2xl border border-slate-200/70 p-12 text-center max-w-xl mx-auto">
            <BookOpen size={40} className="text-slate-300 mx-auto mb-4" />
            <h4 className="font-bold text-slate-800 text-lg">Laboratorium Tidak Ditemukan</h4>
            <p className="text-sm text-slate-400 mt-2">
              Tidak ada kelas laboratorium yang cocok dengan kata kunci pencarian atau kombinasi filter Anda saat ini.
            </p>
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedCategory('Semua');
                setSelectedStatus('Semua');
              }}
              className="mt-5 text-xs bg-blue-600 text-white font-bold py-2.5 px-5 rounded-xl hover:bg-blue-700 transition"
            >
              Reset Semua Filter
            </button>
          </div>
        ) : (
          <>
            {/* 1. Laboratorium Praktikum Aktif (Registered in current semester) */}
            <div className="space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                <div>
                  <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                    <GraduationCap size={20} className="text-blue-600" />
                    {mode === 'lecturer' ? 'Laboratorium Praktikum yang Anda Ampu' : 'Laboratorium Praktikum Aktif'}
                  </h3>
                  <p className="text-xs text-slate-500 font-semibold mt-1">
                    {mode === 'lecturer' 
                      ? `Sesi laboratorium praktikum terpadu aktif yang sedang Anda ampu pada Semester ${student.semester}.`
                      : `Sesi laboratorium praktikum terpadu aktif yang sedang Anda ikuti pada Semester ${student.semester}.`}
                  </p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-xs font-bold text-blue-600 bg-blue-50 border border-blue-100 px-3 py-1 rounded-full">
                    {activeLabs.length} {mode === 'lecturer' ? 'Sesi Diampu' : 'Sesi Diikuti'}
                  </span>
                  {mode === 'lecturer' && (
                    <button onClick={() => window.location.href = '/lecturer'} className="text-[10px] font-bold text-white bg-blue-600 px-3 py-1.5 rounded-full hover:bg-blue-700 transition shadow-xs uppercase tracking-wider">
                      + Tambah Course
                    </button>
                  )}
                </div>
              </div>

              {activeLabs.length === 0 ? (
                <div className="p-8 bg-slate-50 bg-opacity-70 text-slate-400 border border-slate-150 rounded-2xl text-center text-xs font-semibold leading-relaxed">
                  Belum ada kelas laboratorium praktikum aktif yang Anda ikuti pada semester ini.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                  {activeLabs.map(renderLabCard)}
                </div>
              )}
            </div>

            {/* 2. Tersedia untuk Didaftar (Not registered in current semester) - Only for Students */}
            {mode === 'student' && (
              <div className="space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                <div>
                  <h3 className="text-lg font-black text-slate-800 flex items-center gap-2">
                    <BookOpen size={18} className="text-indigo-600" />
                    Pendaftaran Kelas Praktikum Baru (Semester {student.semester})
                  </h3>
                  <p className="text-xs text-slate-500 font-semibold mt-1">
                    Daftar penawaran kelas praktikum terbuka lainnya di semester ini yang belum Anda ikuti.
                  </p>
                </div>
                <span className="text-xs font-bold text-indigo-600 bg-indigo-50 border border-indigo-100 px-3 py-1 rounded-full shrink-0">
                  {availableLabs.length} Tersedia
                </span>
              </div>

              {availableLabs.length === 0 ? (
                <div className="p-8 bg-slate-50 bg-opacity-70 text-slate-400 border border-slate-150 rounded-2xl text-center text-xs font-semibold leading-relaxed">
                  Semua tawaran kelas praktikum semester ini sudah Anda ikuti. Bagus sekali!
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                  {availableLabs.map(renderLabCard)}
                </div>
              )}
            </div>
          )}

            {/* 3. Riwayat Praktikum Semester Lampau */}
            {pastLabs.length > 0 && (
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                  <div>
                    <h3 className="text-lg font-black text-slate-700 flex items-center gap-2 animate-fade-in">
                      <CheckCircle2 size={18} className="text-emerald-600" />
                      Riwayat Kelas Praktikum Masa Lalu
                    </h3>
                    <p className="text-xs text-slate-500 font-semibold mt-1">
                      Dokumentasi arsip pengerjaan laporan & nilai praktikum semester lampau.
                    </p>
                  </div>
                  <span className="text-xs font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 px-3 py-1 rounded-full shrink-0">
                    {pastLabs.length} Selesai
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                  {pastLabs.map(renderLabCard)}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};
