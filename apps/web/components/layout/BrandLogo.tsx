import Link from 'next/link';
import React from 'react';

interface BrandLogoProps {
  href?: string;
  hideTextOnMobile?: boolean;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  href,
  hideTextOnMobile = false,
}) => {
  const content = (
    <>
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-gradient-to-br from-[#1E3A8A] to-[#2A52BE] text-white">
        <GraduationCapIcon />
      </span>
      <span
        className={`text-base font-bold tracking-[-0.03em] text-[#0F172A] ${
          hideTextOnMobile ? 'hidden sm:inline' : ''
        }`}
      >
        AFADIA<span className="text-[#2A52BE]">Academy</span>
      </span>
    </>
  );

  if (!href) {
    return <div className="flex items-center gap-3">{content}</div>;
  }

  return (
    <Link href={href} className="flex items-center gap-3 no-underline">
      {content}
    </Link>
  );
};

const GraduationCapIcon: React.FC = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M22 10v6" />
    <path d="M2 10l10-5 10 5-10 5z" />
    <path d="M6 12v5c3 3 9 3 12 0v-5" />
  </svg>
);
