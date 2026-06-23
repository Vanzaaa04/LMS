"use client";

import { useState, useEffect } from "react";
import { Trophy, TrendingUp, Shield, User } from "lucide-react";
import type { LeaderboardEntry } from "@/app/types/quiz";
import { getLeaderboard } from "@/app/lib/api/quiz";

// ─── Konstanta ────────────────────────────────────────────────────────────────

const MEDAL: Record<number, string> = { 1: "🥇", 2: "🥈", 3: "🥉" };

type Filter = "all_time" | "this_week";

// ─── Sub-components ───────────────────────────────────────────────────────────

function PodiumCard({
  entry,
  isFirst,
}: {
  entry: LeaderboardEntry;
  isFirst: boolean;
}) {
  return (
    <div
      className={`rounded-2xl p-6 text-center shadow-sm ${
        isFirst
          ? "bg-blue-600 w-64 -mb-4 shadow-lg"
          : "bg-white border border-gray-200 w-56"
      }`}
    >
      <div
        className={`rounded-full mx-auto mb-3 flex items-center justify-center relative ${
          isFirst
            ? "w-20 h-20 bg-white/20 border-4 border-white/40"
            : "w-16 h-16 bg-gray-200"
        }`}
      >
        <User className={isFirst ? "w-10 h-10 text-white/60" : "w-8 h-8 text-gray-500"} />
        <span className="absolute -bottom-1 -right-1 text-xl">
          {MEDAL[entry.rank]}
        </span>
      </div>
      <p className={`font-bold ${isFirst ? "text-white text-lg" : "text-gray-900"}`}>
        {entry.studentName}
      </p>
      {isFirst ? (
        <span className="inline-block mt-2 bg-green-400 text-white text-sm font-bold px-3 py-1 rounded-full">
          {entry.totalXp.toLocaleString()} XP
        </span>
      ) : (
        <p className="text-sm text-blue-600 font-semibold mt-1">
          {entry.totalXp.toLocaleString()} XP
        </p>
      )}
    </div>
  );
}

function RankingRow({ entry }: { entry: LeaderboardEntry }) {
  return (
    <tr
      className={`border-t border-gray-100 ${
        entry.isCurrentUser ? "bg-blue-50" : "hover:bg-gray-50"
      }`}
    >
      <td className="px-6 py-4">
        <span
          className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
            entry.isCurrentUser
              ? "bg-blue-600 text-white"
              : "bg-gray-100 text-gray-700"
          }`}
        >
          {MEDAL[entry.rank] ?? entry.rank}
        </span>
      </td>
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-sm flex-shrink-0">
            {entry.studentName.slice(0, 2).toUpperCase()}
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-900">
              {entry.isCurrentUser ? `You (${entry.studentName})` : entry.studentName}
            </p>
            {entry.isCurrentUser && (
              <p className="text-xs text-gray-400">Last active: 2h ago</p>
            )}
          </div>
        </div>
      </td>
      <td className="px-6 py-4">
        <div className="flex items-center gap-2">
          <div className="w-24 h-2 rounded-full bg-gray-200 overflow-hidden">
            <div
              className="h-full bg-green-500 rounded-full"
              style={{ width: `${entry.courseCompletion}%` }}
            />
          </div>
          <span className="text-xs text-gray-500">{entry.courseCompletion}%</span>
        </div>
      </td>
      <td className="px-6 py-4 text-right text-sm font-semibold text-gray-800">
        {entry.totalXp.toLocaleString()} XP
      </td>
    </tr>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function LeaderboardView() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [filter, setFilter] = useState<Filter>("all_time");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    getLeaderboard()
      .then(setEntries)
      .catch(() => setEntries([]))  // fallback kosong jika API gagal
      .finally(() => setLoading(false));
  }, [filter]);
  
  const top3 = entries.slice(0, 3);
  const rest = entries.slice(3);
  const currentUser = entries.find((e) => e.isCurrentUser);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">

      {/* Judul */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Student Leaderboard</h1>
        <p className="text-gray-500 mt-1">
          Rewarding academic excellence and consistent engagement across the semester.
        </p>
      </div>

      {/* Podium top 3 */}
      {top3.length > 0 && (
        <div className="flex items-end justify-center gap-4 mb-8">
          {top3[1] && <PodiumCard entry={top3[1]} isFirst={false} />}
          {top3[0] && <PodiumCard entry={top3[0]} isFirst />}
          {top3[2] && <PodiumCard entry={top3[2]} isFirst={false} />}
        </div>
      )}

      {/* Tabel ranking */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="font-bold text-gray-900 text-lg">Ranking List</h2>
          <div className="flex rounded-lg border border-gray-200 overflow-hidden">
            <button
              onClick={() => setFilter("this_week")}
              className={`px-4 py-1.5 text-sm font-medium transition-colors ${
                filter === "this_week"
                  ? "bg-blue-600 text-white"
                  : "bg-white text-gray-600 hover:bg-gray-50"
              }`}
            >
              This Week
            </button>
            <button
              onClick={() => setFilter("all_time")}
              className={`px-4 py-1.5 text-sm font-medium transition-colors ${
                filter === "all_time"
                  ? "bg-blue-600 text-white"
                  : "bg-white text-gray-600 hover:bg-gray-50"
              }`}
            >
              All Time
            </button>
          </div>
        </div>

        <table className="w-full">
          <thead>
            <tr className="text-xs text-gray-500 uppercase tracking-wide bg-gray-50">
              <th className="text-left px-6 py-3">Position</th>
              <th className="text-left px-6 py-3">Student Name</th>
              <th className="text-left px-6 py-3">Course Completion</th>
              <th className="text-right px-6 py-3">Total XP</th>
            </tr>
          </thead>
          <tbody>
            {rest.map((entry) => (
              <RankingRow key={entry.studentId} entry={entry} />
            ))}
          </tbody>
        </table>

        <div className="px-6 py-4 border-t border-gray-100 text-center">
          <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
            Load More Rankings ▾
          </button>
        </div>
      </div>

      {/* Bottom stats — hanya muncul kalau ada current user */}
      {currentUser && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
          <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <Shield className="w-4 h-4 text-green-600" />
              <p className="text-sm font-semibold text-gray-700">Achievement Milestone</p>
            </div>
            <p className="text-2xl font-bold text-gray-900">Top 5%</p>
            <p className="text-xs text-gray-500 mt-1">
              You are among the most active participants this semester.
            </p>
          </div>
          <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 text-orange-500" />
              <p className="text-sm font-semibold text-gray-700">Weekly Velocity</p>
            </div>
            <p className="text-2xl font-bold text-gray-900">+1,240 XP</p>
            <p className="text-xs text-gray-500 mt-1">
              Consistent improvement in module completion speed.
            </p>
          </div>
          <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <Trophy className="w-4 h-4 text-blue-600" />
              <p className="text-sm font-semibold text-gray-700">Next Reward</p>
            </div>
            <p className="text-2xl font-bold text-gray-900">Academic Badge</p>
            <p className="text-xs text-gray-500 mt-1">50 XP until next level</p>
          </div>
        </div>
      )}
    </div>
  );
}
