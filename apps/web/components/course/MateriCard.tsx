'use client';

import React from 'react';

export interface Materi {
  id: string;
  title: string;
  type: 'video' | 'pdf' | 'document';
  duration?: string;
  size?: string;
  isRead: boolean;
}

interface MateriCardProps {
  materi: Materi;
  onClick?: (materi: Materi) => void;
}

const MATERI_TYPE_CONFIG: Record<Materi['type'], { emoji: string; label: string; bgColor: string }> = {
  video:    { emoji: '🎥', label: 'VIDEO',    bgColor: '#FEE2E2' },
  pdf:      { emoji: '📄', label: 'PDF',      bgColor: '#FEE2E2' },
  document: { emoji: '📝', label: 'DOCUMENT', bgColor: '#DBEAFE' },
};

/**
 * MateriCard — displays a single course material item.
 * Unread items have a teal left border; read items use a gray border.
 */
export const MateriCard: React.FC<MateriCardProps> = ({ materi, onClick }) => {
  const config = MATERI_TYPE_CONFIG[materi.type];

  return (
    <article
      onClick={() => onClick?.(materi)}
      className="bg-white rounded-xl border border-l-4 flex items-center justify-between p-4 transition-shadow hover:shadow-md"
      style={{
        borderColor: 'var(--color-border)',
        borderLeftColor: materi.isRead ? 'var(--color-border)' : '#0D9488',
        cursor: onClick ? 'pointer' : 'default',
      }}
    >
      <div className="flex items-center gap-4">
        {/* Type icon */}
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center text-xl shrink-0"
          style={{ background: config.bgColor }}
        >
          {config.emoji}
        </div>

        {/* Info */}
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--color-text-secondary)' }}>
              {config.label}
            </span>
            {!materi.isRead && (
              <span className="w-2 h-2 rounded-full" style={{ background: '#0D9488' }} title="Belum dibaca" />
            )}
          </div>
          <h3
            className="text-sm font-bold"
            style={{ color: materi.isRead ? 'var(--color-text-secondary)' : 'var(--color-text-primary)' }}
          >
            {materi.title}
          </h3>
          <p className="text-xs font-medium mt-0.5" style={{ color: 'var(--color-text-secondary)' }}>
            {materi.duration ?? materi.size ?? 'N/A'}
          </p>
        </div>
      </div>

      <button
        className="px-4 py-2 text-sm font-semibold rounded-lg shrink-0 transition-colors hover:opacity-80"
        style={{ background: '#F3F4F6', color: 'var(--color-text-secondary)' }}
        aria-label="Buka Materi"
      >
        Buka
      </button>
    </article>
  );
};
