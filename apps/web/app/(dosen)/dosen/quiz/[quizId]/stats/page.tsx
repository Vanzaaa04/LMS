"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Users, BarChart2, TrendingUp, TrendingDown,
  Download, RefreshCw, ChevronLeft, ChevronRight,
} from "lucide-react";
import { getQuizById, getQuizStats } from "@/app/lib/api/quiz";
import type { Quiz } from "@/app/types/quiz";
import { LecturerBreadcrumbs } from "@/components/lecturer/LecturerBreadcrumbs";

interface QuizStats {
  totalParticipants: number;
  totalEnrolled: number;
  averageScore: number;
  highestScore: number;
  lowestScore: number;
  studentResults: QuizStudentResult[];
}

interface QuizStudentResult {
  studentId: string;
  studentName: string;
  nim: string;
  initials: string;
  avatarColor: string;
  durationSeconds: number | null;
  status: string;
  score: number | null;
}

// ─── Konstanta ────────────────────────────────────────────────────────────────

const PAGE_SIZE = 10;

const STATUS_LABEL: Record<string, { label: string; cls: string }> = {
  selesai:  { label: "Selesai",  cls: "bg-green-100 text-green-700" },
  terkunci: { label: "Terkunci", cls: "bg-gray-100 text-gray-600" },
  belum:    { label: "Belum",    cls: "bg-yellow-100 text-yellow-700" },
};

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function QuizStatsPage() {
  const params = useParams();
  const router = useRouter();
  const quizId = params.quizId as string;

  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [stats, setStats] = useState<QuizStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  useEffect(() => {
    async function load() {
      setError(null);
      try {
        const [quizData, statsData] = await Promise.all([
          getQuizById(quizId),
          getQuizStats(quizId),
        ]);
        setQuiz(quizData);
        setStats(statsData);
      } catch (err) {
        console.error(err);
        setError("Gagal memuat statistik kuis.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [quizId]);

  const filtered = stats?.studentResults.filter((r) =>
    r.studentName.toLowerCase().includes(search.toLowerCase()) ||
    r.nim.includes(search)
  ) ?? [];

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const completionRate = stats && stats.totalEnrolled > 0
    ? Math.round((stats.totalParticipants / stats.totalEnrolled) * 100)
    : 0;

  // ─── Render states ──────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 font-medium mb-3">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-colors"
          >
            Coba Lagi
          </button>
        </div>
      </div>
    );
  }

  if (!quiz || !stats) return null;

  const courseHref = quiz.courseId ? `/dosen/courses/${quiz.courseId}` : "/dosen/courses";

  return (
    <div className="bg-gray-50 min-h-full pb-8">
      <div className="max-w-7xl mx-auto w-full px-4 py-6">
        <LecturerBreadcrumbs
          items={[
            { label: "Home", href: "/dashboard_dosen" },
            { label: "Courses", href: "/dosen/courses" },
            { label: "Manage Course", href: courseHref },
            { label: "Quiz Statistics" },
          ]}
        />

        <div className="flex items-start justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{quiz.title}</h1>
            <p className="text-sm text-gray-500 mt-1">
              Statistik performa mahasiswa untuk periode Semester Ganjil 2023/2024
            </p>
          </div>
          <div className="flex gap-3 flex-shrink-0">
            <button className="flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-300 text-gray-700 text-sm font-medium hover:bg-gray-50 transition-colors">
              <Download className="w-4 h-4" />
              Ekspor Laporan
            </button>
            <button
              onClick={() => window.location.reload()}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Perbarui Data
            </button>
          </div>
        </div>

        {/* Stats cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <StatCard
            label="Total Peserta"
            icon={<Users className="w-4 h-4 text-blue-600" />}
            iconBg="bg-blue-50"
          >
            <p className="text-3xl font-bold text-gray-900">
              {stats.totalParticipants}
              <span className="text-lg text-gray-400">/{stats.totalEnrolled}</span>
            </p>
            <p className="mt-1 text-xs">
              <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">
                {completionRate}%
              </span>{" "}
              <span className="text-gray-400">Telah Selesai</span>
            </p>
          </StatCard>

          <StatCard
            label="Rata-rata Skor"
            icon={<BarChart2 className="w-4 h-4 text-orange-500" />}
            iconBg="bg-orange-50"
          >
            <p className="text-3xl font-bold text-gray-900">{stats.averageScore}</p>
            <p className="mt-1 text-xs text-green-600 font-medium">↗ +2.5 dari Kuis sebelumnya</p>
          </StatCard>

          <StatCard
            label="Skor Tertinggi"
            icon={<TrendingUp className="w-4 h-4 text-green-600" />}
            iconBg="bg-green-50"
          >
            <p className="text-3xl font-bold text-gray-900">{stats.highestScore}</p>
            <p className="mt-1 text-xs text-gray-400">Oleh 3 Mahasiswa</p>
          </StatCard>

          <StatCard
            label="Skor Terendah"
            icon={<TrendingDown className="w-4 h-4 text-red-500" />}
            iconBg="bg-red-50"
          >
            <p className="text-3xl font-bold text-gray-900">{stats.lowestScore}</p>
            <p className="mt-1 text-xs text-red-500 font-medium">Membutuhkan remedial</p>
          </StatCard>
        </div>

        {/* Tabel */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <h2 className="font-bold text-gray-900 text-lg">Hasil Per Mahasiswa</h2>
            <div className="relative">
              <input
                type="text"
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                placeholder="Cari Nama Mahasiswa..."
                className="w-64 pl-9 pr-4 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
                fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <circle cx="11" cy="11" r="8" strokeWidth="2" />
                <path strokeLinecap="round" d="M21 21l-4.35-4.35" strokeWidth="2" />
              </svg>
            </div>
          </div>

          <table className="w-full">
            <thead>
              <tr className="text-xs text-gray-500 uppercase tracking-wide bg-gray-50">
                <th className="text-left px-6 py-3">Mahasiswa</th>
                <th className="text-left px-6 py-3">NIM</th>
                <th className="text-left px-6 py-3">Waktu Pengerjaan</th>
                <th className="text-left px-6 py-3">Status</th>
                <th className="text-right px-6 py-3">Skor</th>
                <th className="text-right px-6 py-3">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {paged.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-gray-400 text-sm">
                    Tidak ada data.
                  </td>
                </tr>
              ) : (
                paged.map((r) => {
                  const dur = r.durationSeconds
                    ? `${Math.floor(r.durationSeconds / 60)} Menit ${r.durationSeconds % 60} Detik`
                    : "-";
                  const { label, cls } = STATUS_LABEL[r.status] ?? STATUS_LABEL.belum;
                  return (
                    <tr key={r.studentId} className="border-t border-gray-100 hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
                            style={{ backgroundColor: r.avatarColor }}
                          >
                            {r.initials}
                          </div>
                          <p className="text-sm font-semibold text-gray-900">{r.studentName}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">{r.nim}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{dur}</td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${cls}`}>
                          {label}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right text-sm font-semibold text-gray-900">
                        {r.score !== null ? r.score : "-"}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                          Lihat Detail
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100">
              <p className="text-sm text-gray-500">
                Menampilkan {(page - 1) * PAGE_SIZE + 1}–
                {Math.min(page * PAGE_SIZE, filtered.length)} dari {filtered.length} mahasiswa
              </p>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center hover:bg-gray-50 disabled:opacity-40 transition-colors"
                >
                  <ChevronLeft className="w-4 h-4 text-gray-600" />
                </button>
                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${
                      p === page
                        ? "bg-blue-600 text-white"
                        : "border border-gray-200 text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    {p}
                  </button>
                ))}
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center hover:bg-gray-50 disabled:opacity-40 transition-colors"
                >
                  <ChevronRight className="w-4 h-4 text-gray-600" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Sub-component ────────────────────────────────────────────────────────────

function StatCard({
  label, icon, iconBg, children,
}: {
  label: string;
  icon: React.ReactNode;
  iconBg: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-5">
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm text-gray-500 font-medium">{label}</p>
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${iconBg}`}>
          {icon}
        </div>
      </div>
      {children}
    </div>
  );
}

function createEmptyQuizStats(): QuizStats {
  return {
    totalParticipants: 0,
    totalEnrolled: 0,
    averageScore: 0,
    highestScore: 0,
    lowestScore: 0,
    studentResults: [],
  };
}
