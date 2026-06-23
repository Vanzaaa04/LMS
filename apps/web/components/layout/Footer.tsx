import React from 'react';
import Link from 'next/link';

const FOOTER_LINKS = [
  { label: 'Kebijakan Privasi', href: '#' },
  { label: 'Syarat Layanan', href: '#' },
  { label: 'Pusat Bantuan', href: '#' },
  { label: 'Hubungi Support', href: '#' },
];

/**
 * Site-wide footer with the same simple visual density as the dashboard footer.
 */
export const Footer: React.FC = () => {
  return (
    <footer
      className="w-full overflow-hidden border-t bg-white"
      style={{ borderColor: 'var(--color-border)', position: 'relative', zIndex: 60 }}
    >
      <div className="mx-auto flex w-full max-w-[1180px] min-w-0 flex-col items-center justify-between gap-3 px-8 py-4 text-center md:flex-row md:text-left">
        <div className="min-w-0 md:flex-1">
          <p
            className="truncate text-sm font-bold"
            style={{ color: 'var(--color-text-primary)' }}
          >
            RuangDosen
          </p>
          <p
            className="break-words text-xs leading-5"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            &copy; 2024 Platform Akademik. All rights reserved.
          </p>
        </div>

        <nav className="flex max-w-full flex-wrap items-center justify-center gap-x-5 gap-y-2 md:flex-1 md:justify-end">
          {FOOTER_LINKS.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="whitespace-nowrap text-[11px] font-semibold no-underline transition-colors hover:text-[#2563EB] sm:text-xs"
              style={{ color: 'var(--color-text-secondary)' }}
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </footer>
  );
};
