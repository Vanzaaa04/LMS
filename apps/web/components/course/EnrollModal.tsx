'use client';

import React from 'react';
import { Course } from '@/lib/types/course';

interface EnrollModalProps {
    course: Course | null;
    onClose: () => void;
    onConfirm: (course: Course) => void | Promise<void>;
    isSubmitting?: boolean;
    errorMessage?: string | null;
}

export const EnrollModal: React.FC<EnrollModalProps> = ({
    course,
    onClose,
    onConfirm,
    isSubmitting = false,
    errorMessage = null,
}) => {
    if (!course) return null;

    return (
        <>
            {/* Overlay */}
            <div
                className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div
                className="fixed z-50 bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4"
                style={{
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                }}
            >
                {/* Banner */}
                <div className={`relative w-full h-36 rounded-t-2xl flex items-center justify-center ${course.bannerColorClass}`}>
                    <span className="text-5xl">{course.bannerEmoji}</span>
                    <span
                        className="absolute top-4 left-4 text-[10px] font-bold uppercase tracking-[0.5px] px-2 py-1 rounded"
                        style={{ background: 'rgba(248,249,250,0.9)', color: 'var(--color-text-primary)' }}
                    >
                        {course.level}
                    </span>

                    {/* Close button */}
                    <button
                        onClick={onClose}
                        className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center rounded-full bg-white/80 hover:bg-white transition-colors"
                        aria-label="Close"
                    >
                        <CloseIcon />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6">
                    {/* Category */}
                    <span
                        className="inline-block text-[10px] font-bold uppercase tracking-[0.5px] px-2 py-1 rounded mb-2"
                        style={{ background: 'var(--color-brand-subtle)', color: 'var(--color-text-muted)' }}
                    >
                        {course.category}
                    </span>

                    {/* Title */}
                    <h2
                        className="text-xl font-bold mb-1 leading-tight"
                        style={{ color: 'var(--color-text-primary)' }}
                    >
                        {course.title}
                        {course.className && (
                            <span style={{ fontSize: '16px', fontWeight: 600, color: 'var(--color-brand-primary)', marginLeft: '8px' }}>
                                (Kelas {course.className})
                            </span>
                        )}
                    </h2>

                    {/* Instructor */}
                    <p className="text-xs mb-3" style={{ color: 'var(--color-text-secondary)' }}>
                        👤 {course.instructorName}
                    </p>

                    {/* Description */}
                    <p
                        className="text-sm leading-relaxed mb-6"
                        style={{ color: 'var(--color-text-secondary)' }}
                    >
                        {course.description}
                    </p>

                    {/* Divider */}
                    <div className="border-t mb-5" style={{ borderColor: 'var(--color-border)' }} />

                    {/* Confirm text */}
                    <p className="text-sm font-medium mb-5 text-center" style={{ color: 'var(--color-text-secondary)' }}>
                        Apakah kamu yakin ingin mendaftar kursus ini?
                    </p>

                    {errorMessage ? (
                        <p className="mb-4 text-center text-sm font-medium" style={{ color: '#B3261E' }}>
                            {errorMessage}
                        </p>
                    ) : null}

                    {/* Actions */}
                    <div className="flex gap-3">
                        <button
                            onClick={onClose}
                            disabled={isSubmitting}
                            className="flex-1 py-2.5 rounded-lg text-sm font-semibold border transition-colors hover:bg-gray-50"
                            style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-secondary)' }}
                        >
                            Batal
                        </button>
                        <button
                            onClick={() => onConfirm(course)}
                            disabled={isSubmitting}
                            className="flex-1 py-2.5 rounded-lg text-sm font-semibold text-white transition-opacity hover:opacity-90"
                            style={{ background: 'var(--color-brand-light)' }}
                        >
                            {isSubmitting ? 'Memproses...' : 'Enroll Sekarang'}
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
};

const CloseIcon: React.FC = () => (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
        <path d="M1 1l10 10M11 1L1 11" stroke="#434654" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
);
