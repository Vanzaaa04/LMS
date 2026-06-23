'use client';

import React from 'react';

export interface Tugas {
  id: string;
  title: string;
  deadline: string;
  status: 'pending' | 'submitted' | 'graded' | 'late';
  score?: number;
}

interface TugasCardProps {
  tugas: Tugas;
  onClick?: (tugas: Tugas) => void;
}

interface StatusDisplay {
  label: string;
  badgeStyle: React.CSSProperties;
  borderLeftColor: string;
}

const STATUS_CONFIG: Record<Tugas['status'], StatusDisplay> = {
  submitted: {
    label: 'Menunggu Penilaian',
    badgeStyle: { background: '#DBEAFE', color: '#1D4ED8' },
    borderLeftColor: '#3B82F6',
  },
  graded: {
    label: 'Sudah Dinilai',
    badgeStyle: { background: '#D1FAE5', color: '#065F46' },
    borderLeftColor: '#10B981',
  },
  late: {
    label: 'Terlambat',
    badgeStyle: { background: '#FEE2E2', color: '#991B1B' },
    borderLeftColor: '#EF4444',
  },
  pending: {
    label: 'Belum Dikerjakan',
    badgeStyle: { background: '#FEF3C7', color: '#92400E' },
    borderLeftColor: '#F59E0B',
  },
};

/**
 * TugasCard — displays a single assignment/quiz item.
 * Left border color encodes the status at a glance.
 */
export const TugasCard: React.FC<TugasCardProps> = ({ tugas, onClick }) => {
  const statusConfig = STATUS_CONFIG[tugas.status];

  return (
    <article
      onClick={() => onClick?.(tugas)}
      className="bg-white rounded-xl border border-l-4 flex flex-col md:flex-row md:items-center justify-between p-4 gap-4 transition-shadow hover:shadow-md"
      style={{
        borderColor: 'var(--color-border)',
        borderLeftColor: statusConfig.borderLeftColor,
        cursor: onClick ? 'pointer' : 'default',
      }}
    >
      {/* Left: icon + info */}
      <div className="flex items-start md:items-center gap-4">
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center text-xl shrink-0"
          style={{ background: '#F1F5F9' }}
        >
          📝
        </div>
        <div>
          <h3 className="text-sm font-bold mb-1" style={{ color: 'var(--color-text-primary)' }}>
            {tugas.title}
          </h3>
          <div className="flex items-center gap-1 text-xs font-medium" style={{ color: 'var(--color-text-secondary)' }}>
            <ClockIcon />
            <span>Tenggat: {formatDeadline(tugas.deadline)}</span>
          </div>
        </div>
      </div>

      {/* Right: badge + score + button */}
      <div className="flex items-center justify-between md:justify-end gap-4">
        <div className="flex flex-col items-start md:items-end">
          <span
            className="text-[10px] font-bold px-2.5 py-1 rounded uppercase tracking-wider"
            style={statusConfig.badgeStyle}
          >
            {statusConfig.label}
          </span>
          {tugas.status === 'graded' && tugas.score !== undefined && (
            <span className="text-sm font-bold mt-1.5" style={{ color: 'var(--color-text-primary)' }}>
              Nilai:{' '}
              <span style={{ color: tugas.score >= 80 ? '#059669' : '#D97706' }}>
                {tugas.score}/100
              </span>
            </span>
          )}
        </div>

        <button
          className="px-4 py-2 text-sm font-semibold rounded-lg text-white shrink-0 transition-colors hover:opacity-80"
          style={{ background: 'var(--color-text-primary)' }}
          aria-label={tugas.status === 'graded' ? 'Lihat Tugas' : 'Kerjakan Tugas'}
          onClick={(e) => e.stopPropagation()}
        >
          {tugas.status === 'graded' ? 'Lihat' : 'Kerjakan'}
        </button>
      </div>
    </article>
  );
};

/* ── Helpers ── */

function formatDeadline(dateString: string): string {
  return new Date(dateString).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

const ClockIcon: React.FC = () => (
  <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <circle cx="12" cy="12" r="10" strokeWidth="2" />
    <path d="M12 6v6l4 2" strokeWidth="2" strokeLinecap="round" />
  </svg>
);
